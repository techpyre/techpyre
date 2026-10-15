import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { siteContent } from "@/config/siteContent";
import { ContactApiResponse, ContactPayload } from "@/types/content";

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest): Promise<NextResponse<ContactApiResponse>> {
  try {
    const body = (await request.json()) as Partial<ContactPayload>;
    const { name, company, contact, service, message } = body;

    const errors: Record<string, string> = {};

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.name = "Inserisci un nome e cognome valido (minimo 2 caratteri).";
    }

    if (!contact || typeof contact !== "string" || contact.trim().length < 5) {
      errors.contact = "Inserisci un recapito valido (email aziendale o telefono).";
    }

    if (!service || typeof service !== "string" || service.trim().length === 0) {
      errors.service = "Seleziona uno dei servizi del listino.";
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      errors.message = "Fornisci una descrizione minima di 10 caratteri per la tua richiesta.";
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

    const sanitizedData: ContactPayload = {
      name: name!.trim(),
      company: company ? company.trim() : "Non specificata",
      contact: contact!.trim(),
      service: service!.trim(),
      message: message!.trim(),
    };

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
      console.log(`Mittente     : ${sanitizedData.name}`);
      console.log(`Azienda/Org  : ${sanitizedData.company}`);
      console.log(`Recapito     : ${sanitizedData.contact}`);
      console.log(`Servizio B2B : ${sanitizedData.service}`);
      console.log(`Messaggio    :\n${sanitizedData.message}`);
      console.log(`-------------------------------------------------------------`);
      console.log(`Per attivare la consegna reale delle email, imposta in .env.local:`);
      console.log(`SMTP_HOST=smtp.tuoprovider.it`);
      console.log(`SMTP_PORT=465`);
      console.log(`SMTP_USER=tua-email@tuodominio.it`);
      console.log(`SMTP_PASS=la-tua-password`);
      console.log(`CONTACT_RECEIVER_EMAIL=${contactReceiver}`);
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

    // Modalità Produzione con Nodemailer
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const isContactAnEmail = isValidEmail(sanitizedData.contact);

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
            <h1>Nuova Richiesta di Progetto — ${siteContent.brand.name}</h1>
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
            ${siteContent.brand.name} Studio · Linea Diretta con ${siteContent.brand.founder} · SLA: Risposta entro 2-3 ore lavorative
          </div>
        </div>
      </body>
      </html>
    `;

    const mailText = `
NUOVA RICHIESTA DI PROGETTO — ${siteContent.brand.name}
-------------------------------------------------------------
Mittente: ${sanitizedData.name}
Azienda: ${sanitizedData.company}
Recapito: ${sanitizedData.contact}
Servizio: ${sanitizedData.service}

Dettagli:
${sanitizedData.message}
-------------------------------------------------------------
Inviato tramite ${siteContent.brand.name} Contact Form
    `;

    await transporter.sendMail({
      from: `"${siteContent.brand.name} Web Engineering" <${smtpUser}>`,
      to: contactReceiver,
      replyTo: isContactAnEmail ? sanitizedData.contact : undefined,
      subject: `[${siteContent.brand.name}] Richiesta ${sanitizedData.service} — ${sanitizedData.company} (${sanitizedData.name})`,
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
