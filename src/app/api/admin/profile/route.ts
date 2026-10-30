import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getAdminSession } from "@/lib/adminAuth";
import { getUserSmtp, saveUserSmtp, UserSmtpConfig } from "@/lib/userSmtpStorage";

export async function GET() {
  const user = await getAdminSession();
  if (!user) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  const userSmtp = getUserSmtp(user.username);

  // Per admin o membri, se non hanno custom SMTP, usa i valori predefiniti di TechPyre da env
  const globalHost = process.env.OUTBOUND_SMTP_HOST || process.env.SMTP_HOST || "";
  const globalUser = process.env.OUTBOUND_SMTP_USER || process.env.SMTP_USER || "";
  const globalSender = process.env.OUTBOUND_FROM_NAME || "Riccardo Granza - TechPyre";

  const isConfigured = Boolean(
    (userSmtp && userSmtp.smtpHost && userSmtp.smtpUser && userSmtp.smtpPass) ||
      (user.role !== "special" && globalHost && globalUser)
  );

  return NextResponse.json({
    user,
    smtpConfigured: isConfigured,
    smtpDetails: userSmtp
      ? {
          smtpHost: userSmtp.smtpHost,
          smtpPort: userSmtp.smtpPort,
          smtpUser: userSmtp.smtpUser,
          senderName: userSmtp.senderName || user.displayName,
          senderEmail: userSmtp.senderEmail || userSmtp.smtpUser,
          updatedAt: userSmtp.updatedAt,
        }
      : user.role === "special"
      ? {
          smtpHost: "",
          smtpPort: 465,
          smtpUser: "",
          senderName: user.displayName,
          senderEmail: "",
        }
      : {
          smtpHost: globalHost ? "Server TechPyre Predefinito" : "",
          smtpPort: 465,
          smtpUser: user.defaultEmail || globalUser,
          senderName: user.displayName,
          senderEmail: user.defaultEmail || globalUser,
        },
  });
}

export async function POST(request: Request) {
  const user = await getAdminSession();
  if (!user) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      senderName,
      senderEmail,
      testOnly,
    } = body;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: "Compila tutti i campi obbligatori: Server Host, Utente/Email e Password." },
        { status: 400 }
      );
    }

    const portNum = Number(smtpPort || 465);

    // Test di connessione con nodemailer
    const transporter = nodemailer.createTransport({
      host: smtpHost.trim(),
      port: portNum,
      secure: portNum === 465,
      auth: {
        user: smtpUser.trim(),
        pass: smtpPass.trim(),
      },
      connectionTimeout: 8000,
    });

    try {
      await transporter.verify();
    } catch (testErr: unknown) {
      const msg = testErr instanceof Error ? testErr.message : "Errore verifica SMTP";
      return NextResponse.json(
        {
          error: `Verifica connessione fallita: ${msg}. Se usi Gmail, ricorda di usare una "Password per le app" e non la password del tuo account Google.`,
        },
        { status: 400 }
      );
    }

    if (testOnly) {
      return NextResponse.json({
        success: true,
        message: "Connessione SMTP verificata con successo!",
      });
    }

    const configToSave: UserSmtpConfig = {
      smtpHost: smtpHost.trim(),
      smtpPort: portNum,
      smtpUser: smtpUser.trim(),
      smtpPass: smtpPass.trim(),
      senderName: (senderName || user.displayName).trim(),
      senderEmail: (senderEmail || smtpUser).trim(),
    };

    saveUserSmtp(user.username, configToSave);

    return NextResponse.json({
      success: true,
      message: "Credenziali email salvate e verificate con successo!",
      smtpDetails: {
        smtpHost: configToSave.smtpHost,
        smtpPort: configToSave.smtpPort,
        smtpUser: configToSave.smtpUser,
        senderName: configToSave.senderName,
        senderEmail: configToSave.senderEmail,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore durante il salvataggio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
