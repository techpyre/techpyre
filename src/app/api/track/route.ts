import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getAdminSession } from "@/lib/adminAuth";
import { loadLeadConfig } from "@/lib/leadsStorage";
import { isValidLeadSlug, recordDemoVisit, getAllVisits } from "@/lib/visitsStorage";

const alertDedupeCache = new Map<string, number>();
const ALERT_COOLDOWN_MS = 20 * 60 * 1000; // 20 minuti per slug+ip+evento

function isHumanProspectVisit(ip: string, userAgent: string): boolean {
  const cleanIp = (ip || "").trim().toLowerCase();
  if (
    !cleanIp ||
    cleanIp === "127.0.0.1" ||
    cleanIp === "::1" ||
    cleanIp.startsWith("192.168.") ||
    cleanIp.startsWith("10.")
  ) {
    return false;
  }
  const ua = (userAgent || "").toLowerCase();
  if (!ua || ua.length < 15) return false;
  if (
    /bot|crawler|spider|headless|antigravity|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|curl|wget|python|axios|node-fetch|undici|vercel|facebookexternalhit|slackbot|telegrambot|whatsapp/i.test(
      ua
    )
  ) {
    return false;
  }
  return true;
}

async function sendRealTimeProspectAlert({
  slug,
  companyName,
  device,
  deviceType,
  ip,
  referrer,
  screen,
  eventType,
  totalVisits,
}: {
  slug: string;
  companyName: string;
  device: string;
  deviceType: string;
  ip: string;
  referrer: string;
  screen: string;
  eventType?: string;
  totalVisits: number;
}): Promise<void> {
  const host = process.env.OUTBOUND_SMTP_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.OUTBOUND_SMTP_PORT || process.env.SMTP_PORT || 465);
  const user = process.env.OUTBOUND_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.OUTBOUND_SMTP_PASS || process.env.SMTP_PASS;
  const receiver = process.env.CONTACT_RECEIVER_EMAIL || user;

  if (!host || !user || !pass || !receiver) return;

  const dedupeKey = `${slug}|${ip}|${eventType || "page_view"}`;
  const now = Date.now();
  const lastAlert = alertDedupeCache.get(dedupeKey);
  if (lastAlert && now - lastAlert < ALERT_COOLDOWN_MS) {
    return;
  }
  alertDedupeCache.set(dedupeKey, now);

  const lead = loadLeadConfig(slug);
  const phone = lead?.meta?.phone || "N/D";
  const cleanDigits = phone.replace(/[^\d]/g, "");
  const whatsappLink =
    cleanDigits.length >= 9
      ? `https://wa.me/${cleanDigits.startsWith("39") ? cleanDigits : `39${cleanDigits}`}`
      : "N/D";
  const targetEmail = lead?.meta?.targetEmail || "N/D";
  const city = lead?.meta?.city || "N/D";
  const dmName = lead?.meta?.decisionMakerName || `Direzione ${companyName}`;
  const originalUrl = lead?.meta?.originalLandingUrl || "N/D";
  const lcp = lead?.audit?.originalLcpSeconds ? `${lead.audit.originalLcpSeconds}s` : "N/D";
  const demoUrl = `https://www.techpyre.eu/demo/${slug}`;

  const isHighIntentAction =
    eventType === "quiz_conversion" ||
    eventType === "B2B_AUDIT_REQUEST" ||
    eventType === "MEDICAL_BOOKING_REQUEST" ||
    eventType === "owner_whatsapp_click" ||
    eventType === "owner_call_click";

  const eventLabel =
    eventType === "owner_whatsapp_click"
      ? "CLICK SU PULSANTE WHATSAPP TITOLARE"
      : eventType === "owner_call_click"
      ? "CLICK SU PULSANTE CHIAMA TITOLARE"
      : eventType === "quiz_conversion" ||
        eventType === "B2B_AUDIT_REQUEST" ||
        eventType === "MEDICAL_BOOKING_REQUEST"
      ? `SIMULAZIONE MODULO/QUIZ COMPLETATA (${eventType})`
      : "APERTURA LINK DEMO";

  const subject = isHighIntentAction
    ? `[HOT INTERAZIONE DEMO] ${companyName} (${city}) - ${eventLabel}`
    : `[DEMO APERTA ORA] ${companyName} (${city}) sta guardando la demo su ${deviceType}`;

  const body = [
    `ALERT REAL-TIME PROSPECT SULLA DEMO TECHPYRE`,
    `============================================================`,
    `Evento Rilevato   : ${eventLabel}`,
    `Azienda           : ${companyName} (${slug})`,
    `Titolare / Ref.   : ${dmName}`,
    `Citta             : ${city}`,
    `Tel / WhatsApp    : ${phone} (${whatsappLink})`,
    `Email Prospect    : ${targetEmail}`,
    `Sito Originale    : ${originalUrl} (LCP: ${lcp})`,
    `URL Demo Aperta   : ${demoUrl}`,
    `------------------------------------------------------------`,
    `Dispositivo       : ${device} (${deviceType} - schermo ${screen})`,
    `Provenienza       : ${referrer}`,
    `IP Visitatore     : ${ip}`,
    `Visite Totali     : ${totalVisits}`,
    `Data / Ora (Roma) : ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })}`,
    `============================================================`,
    `SUGGERIMENTO OPERATIVO (ASINCRO WHATSAPP / EMAIL):`,
    `Il prospect ha appena aperto la demo. Puoi scrivergli su WhatsApp (${whatsappLink}) o via email (${targetEmail}).`,
  ].join("\n");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 8000,
  });

  await transporter.sendMail({
    from: `"TechPyre Live Radar" <${user}>`,
    to: receiver,
    subject,
    text: body,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const rawSlug = typeof body.slug === "string" ? body.slug.trim() : "";

    if (!isValidLeadSlug(rawSlug)) {
      return NextResponse.json({ error: "Slug non valido o mancante" }, { status: 400 });
    }

    const companyName = typeof body.companyName === "string" ? body.companyName.slice(0, 140) : rawSlug;
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 300) : undefined;
    const screenWidth = typeof body.screenWidth === "number" ? body.screenWidth : undefined;
    const screenHeight = typeof body.screenHeight === "number" ? body.screenHeight : undefined;
    const eventType = typeof body.eventType === "string" ? body.eventType.slice(0, 48) : undefined;
    const isFirstVisit = Boolean(body.isFirstVisit);

    const userAgent = req.headers.get("user-agent") || "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { visitRecord, newVisit } = recordDemoVisit({
      slug: rawSlug,
      companyName,
      referrer,
      screenWidth,
      screenHeight,
      userAgent,
      ip,
      isFirstVisit,
      eventType,
    });

    if (isHumanProspectVisit(ip, userAgent)) {
      await sendRealTimeProspectAlert({
        slug: rawSlug,
        companyName: visitRecord.companyName || companyName,
        device: newVisit.device,
        deviceType: newVisit.deviceType,
        ip,
        referrer: newVisit.referrer,
        screen: newVisit.screen,
        eventType,
        totalVisits: visitRecord.totalVisits,
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      slug: rawSlug,
      totalVisits: visitRecord.totalVisits,
      visitId: newVisit.id,
      timestamp: newVisit.timestamp,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore tracking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const user = await getAdminSession();
  if (!user) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  try {
    const visits = getAllVisits();
    return NextResponse.json({
      success: true,
      visits,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore lettura visite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
