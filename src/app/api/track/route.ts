import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { isValidLeadSlug, recordDemoVisit, getAllVisits } from "@/lib/visitsStorage";

function isAutomatedOrInternalAudit(userAgent: string): boolean {
  const ua = (userAgent || "").toLowerCase();
  return /techpyreaudit|headless|antigravity|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|bot|crawler|spider/i.test(
    ua
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const rawSlug = typeof body.slug === "string" ? body.slug.trim() : "";

    if (!isValidLeadSlug(rawSlug)) {
      return NextResponse.json({ error: "Slug non valido o mancante" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    if (isAutomatedOrInternalAudit(userAgent)) {
      return NextResponse.json({
        success: true,
        slug: rawSlug,
        ignoredInternalAudit: true,
      });
    }

    const companyName = typeof body.companyName === "string" ? body.companyName.slice(0, 140) : rawSlug;
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 300) : undefined;
    const screenWidth = typeof body.screenWidth === "number" ? body.screenWidth : undefined;
    const screenHeight = typeof body.screenHeight === "number" ? body.screenHeight : undefined;
    const eventType = typeof body.eventType === "string" ? body.eventType.slice(0, 48) : undefined;
    const isFirstVisit = Boolean(body.isFirstVisit);

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
