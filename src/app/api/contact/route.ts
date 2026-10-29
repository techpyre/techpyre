import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { siteContent } from "@/config/siteContent";
import { ContactApiResponse, ContactPayload } from "@/types/content";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanHeader(str: string): string {
  return str.replace(/[\r\n]+/g, " ").trim();
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidContact(contact: string): boolean {
  const trimmed = contact.trim();
  if (isValidEmail(trimmed)) return true;
  const digits = (trimmed.match(/\d/g) || []).length;
  return digits >= 7 && /^[0-9+\s\-()./]{7,25}$/.test(trimmed);
}

// In-memory rate limiting per IP (5 richieste ogni 10 minuti)
const ipRateLimit = new Map<string, { count: number; expiresAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 5;

  // Pulizia periodica elementi scaduti per prevenire leak di memoria
  if (ipRateLimit.size > 200) {
    for (const [key, value] of ipRateLimit.entries()) {
      if (now > value.expiresAt) ipRateLimit.delete(key);
    }
  }

  const current = ipRateLimit.get(ip);
  if (!current || now > current.expiresAt) {
    ipRateLimit.set(ip, { count: 1, expiresAt: now + windowMs });
    return false;
  }

  if (current.count >= maxRequests) {
    return true;
  }

  current.count += 1;
  return false;
}

// Transporter singleton con timeout espliciti
let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter(host: string, port: number, user: string, pass: string) {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      pool: true,
      maxConnections: 3,
    });
  }
  return cachedTransporter;
}

export async function POST(request: NextRequest): Promise<NextResponse<ContactApiResponse>> {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          message: "Troppe richieste inviate da questo dispositivo. Riprova tra 10 minuti.",
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as Partial<ContactPayload>;
    const { name, company, contact, service, message, website } = body;

    // Honeypot anti-spam: se un bot compila il campo nascosto 'website', rispondi 200 senza inviare email
    if (website && typeof website === "string" && website.trim().length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: siteContent.contact.feedback.successMessage,
          data: { timestamp: new Date().toISOString() },
        },
        { status: 200 }
      );
    }

    const errors: Record<string, string> = {};

    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      errors.name = "Inserisci un nome valido (tra 2 e 100 caratteri).";
    }

    if (!contact || typeof contact !== "string" || contact.trim().length < 5 || contact.trim().length > 120 || !isValidContact(contact)) {
      errors.contact = "Inserisci un recapito valido (email aziendale valida o numero di telefono).";
    }

    if (!service || typeof service !== "string" || service.trim().length === 0 || service.trim().length > 100) {
      errors.service = "Seleziona uno dei servizi del listino.";
    }

    if (!message || typeof message !== "string" || message.trim().length < 10 || message.trim().length > 5000) {
      errors.message = "Fornisci una descrizione compresa tra 10 e 5000 caratteri per la tua richiesta.";
    }

    if (company && (typeof company !== "string" || company.trim().length > 100)) {
      errors.company = "La ragione sociale non può superare 100 caratteri.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Alcuni dati inseriti non sono corretti. Verifica i campi segnalati.",
          errors,
        },
        { status: 400 }
      );
    }

    const rawName = name!.trim();
    const rawCompany = company ? company.trim() : "Non specificata";
    const rawContact = contact!.trim();
    const rawService = service!.trim();
    const rawMessage = message!.trim();

    const sanitizedData: ContactPayload = {
      name: escapeHtml(rawName),
      company: escapeHtml(rawCompany),
      contact: escapeHtml(rawContact),
      service: escapeHtml(rawService),
      message: escapeHtml(rawMessage),
    };

    const headerName = cleanHeader(rawName);
    const headerCompany = cleanHeader(rawCompany);
    const headerService = cleanHeader(rawService);

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const contactReceiver =
      process.env.CONTACT_RECEIVER_EMAIL ||
      process.env.CONTACT_EMAIL ||
      siteContent.brand.contactEmail;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;

    const isSmtpConfigured = Boolean(smtpHost && smtpUser && smtpPass);

    // Modalità Sviluppo / Zero-Config: Smart Fallback realistico (800ms)
    if (!isSmtpConfigured) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      console.log(`\n=============================================================`);
      console.log(`[${siteContent.brand.name} CONTACT API — MODALITÀ COLLAUDO / ZERO-CONFIG]`);
      console.log(`=============================================================`);
      console.log(`Variabili SMTP non configurate in .env.local.`);
      console.log(`Il form ha simulato 800ms di elaborazione e ha registrato il contatto:`);
      console.log(`-------------------------------------------------------------`);
      console.log(`Mittente     : ${rawName}`);
      console.log(`Azienda/Org  : ${rawCompany}`);
      console.log(`Recapito     : ${rawContact}`);
      console.log(`Servizio B2B : ${rawService}`);
      console.log(`Messaggio    :\n${rawMessage}`);
      console.log(`-------------------------------------------------------------`);
      console.log(`=============================================================\n`);

      return NextResponse.json(
        {
          success: true,
          message: siteContent.contact.feedback.successMessage,
          data: {
            timestamp: new Date().toISOString(),
            mockMode: true,
          },
        },
        { status: 200 }
      );
    }

    const transporter = getTransporter(smtpHost!, smtpPort, smtpUser!, smtpPass!);
    const isContactAnEmail = isValidEmail(rawContact);

    const mailHtml = `
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F7F4; color: #14181F; margin: 0; padding: 32px 16px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #E8E2D5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .header { background: #0A192F; color: #F8F7F4; padding: 28px 32px; border-bottom: 3px solid #C5A059; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
          .header p { margin: 6px 0 0 0; font-size: 13px; color: #A4B3C6; }
          .content { padding: 32px; }
          .field { margin-bottom: 20px; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #5A6270; font-weight: 700; margin-bottom: 4px; }
          .value { font-size: 15px; color: #14181F; line-height: 1.5; }
          .value-box { background: #F8F7F4; padding: 16px; border-radius: 8px; border: 1px solid #E8E2D5; white-space: pre-wrap; font-size: 14px; }
          .footer { padding: 20px 32px; background: #FAF9F6; border-top: 1px solid #E8E2D5; font-size: 12px; color: #5A6270; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Nuova Richiesta di Progetto — ${escapeHtml(siteContent.brand.name)}</h1>
            <p>Ricevuto dal portale ufficiale B2B</p>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Mittente</div>
              <div class="value"><strong>${sanitizedData.name}</strong></div>
            </div>
            <div class="field">
              <div class="label">Azienda / Attività</div>
              <div class="value">${sanitizedData.company}</div>
            </div>
            <div class="field">
              <div class="label">Recapito (Email o Telefono)</div>
              <div class="value">${
                isContactAnEmail
                  ? `<a href="mailto:${sanitizedData.contact}" style="color: #003366; font-weight: 600;">${sanitizedData.contact}</a>`
                  : `<strong>${sanitizedData.contact}</strong>`
              }</div>
            </div>
            <div class="field">
              <div class="label">Servizio Richiesto</div>
              <div class="value"><strong style="color: #B8860B;">${sanitizedData.service}</strong></div>
            </div>
            <div class="field">
              <div class="label">Dettagli del Progetto & Note</div>
              <div class="value-box">${sanitizedData.message}</div>
            </div>
          </div>
          <div class="footer">
            ${escapeHtml(siteContent.brand.name)} Studio · Linea Diretta con ${escapeHtml(siteContent.brand.founder)} · SLA: Risposta entro 24 ore lavorative
          </div>
        </div>
      </body>
      </html>
    `;

    const mailText = `
NUOVA RICHIESTA DI PROGETTO — ${siteContent.brand.name}
-------------------------------------------------------------
Mittente: ${rawName}
Azienda: ${rawCompany}
Recapito: ${rawContact}
Servizio: ${rawService}

Dettagli:
${rawMessage}
-------------------------------------------------------------
Inviato tramite ${siteContent.brand.name} Contact Form
    `;

    await transporter.sendMail({
      from: `"${siteContent.brand.name} Web Engineering" <${smtpUser}>`,
      to: contactReceiver,
      replyTo: isContactAnEmail ? rawContact : undefined,
      subject: `[${siteContent.brand.name}] Richiesta ${headerService} — ${headerCompany} (${headerName})`,
      text: mailText,
      html: mailHtml,
    });

    return NextResponse.json(
      {
        success: true,
        message: siteContent.contact.feedback.successMessage,
        data: {
          timestamp: new Date().toISOString(),
          mockMode: false,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[${siteContent.brand.name} API Error]:`, error);
    return NextResponse.json(
      {
        success: false,
        message: siteContent.contact.feedback.errorMessage,
      },
      { status: 500 }
    );
  }
}
