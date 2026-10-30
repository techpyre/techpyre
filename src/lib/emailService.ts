import fs from "fs";
import path from "path";
import tls from "tls";
import nodemailer from "nodemailer";
import { UserProfile } from "./adminAuth";
import { getUserSmtp } from "./userSmtpStorage";
import { LeadConfig } from "@/types/lead";

function appendToArubaSent(user: string, pass: string, rawEmail: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect({ host: "imaps.aruba.it", port: 993 }, () => {});
      socket.setEncoding("utf-8");
      let step = 0;
      const timeout = setTimeout(() => {
        try {
          socket.destroy();
        } catch {}
        resolve(false);
      }, 7000);

      socket.on("data", (data) => {
        if (step === 0 && data.includes("* OK")) {
          step = 1;
          socket.write(`A1 LOGIN "${user}" "${pass}"\r\n`);
        } else if (step === 1 && data.includes("A1 OK")) {
          step = 2;
          const len = Buffer.byteLength(rawEmail, "utf-8");
          socket.write(`A2 APPEND "INBOX.Sent" (\\Seen) {${len}}\r\n`);
        } else if (step === 2 && data.includes("+")) {
          step = 3;
          socket.write(rawEmail + "\r\n");
        } else if (step === 3 && data.includes("A2 OK")) {
          clearTimeout(timeout);
          socket.write("A3 LOGOUT\r\n");
          resolve(true);
        } else if (data.includes("NO") || data.includes("BAD")) {
          clearTimeout(timeout);
          resolve(false);
        }
      });

      socket.on("error", () => {
        clearTimeout(timeout);
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

function getOutreachHistoryPath(): { primary: string; fallback: string } {
  const primary = path.join(process.cwd(), "src", "data", "outreach-history.json");
  const fallback = path.join("/tmp", "techpyre-outreach-history.json");
  return { primary, fallback };
}

export function getOutreachHistory(): Array<{
  slug: string;
  companyName: string;
  recipient: string;
  type: string;
  subject: string;
  messageId: string;
  sentAt: string;
  sentBy?: string;
}> {
  const { primary, fallback } = getOutreachHistoryPath();
  if (fs.existsSync(/*turbopackIgnore: true*/ primary)) {
    try {
      return JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ primary, "utf-8"));
    } catch {}
  }
  if (fs.existsSync(/*turbopackIgnore: true*/ fallback)) {
    try {
      return JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ fallback, "utf-8"));
    } catch {}
  }
  return [];
}

export function saveOutreachLog(logEntry: {
  slug: string;
  companyName: string;
  recipient: string;
  type: string;
  subject: string;
  messageId: string;
  sentAt: string;
  sentBy?: string;
}) {
  const { primary, fallback } = getOutreachHistoryPath();
  let list = getOutreachHistory();
  list.push(logEntry);
  const jsonStr = JSON.stringify(list, null, 2);

  try {
    fs.writeFileSync(primary, jsonStr, "utf-8");
  } catch {}

  try {
    fs.writeFileSync(fallback, jsonStr, "utf-8");
  } catch {}
}

export async function sendLeadOutreach({
  slug,
  isFollowUp = false,
  user,
}: {
  slug: string;
  isFollowUp?: boolean;
  user: UserProfile;
}): Promise<{
  success: boolean;
  messageId: string;
  message: string;
  sentBy: string;
}> {
  // 1. Carica LeadConfig
  const leadPath = path.join(process.cwd(), "src", "data", "leads", `${slug}.json`);
  if (!fs.existsSync(leadPath)) {
    throw new Error(`Lead [${slug}] non trovato nel database.`);
  }

  const lead = JSON.parse(fs.readFileSync(leadPath, "utf-8")) as LeadConfig;

  // 2. Determina credenziali SMTP in base all'utente attivo
  const userSmtp = getUserSmtp(user.username);

  let host = "";
  let port = 465;
  let smtpUser = "";
  let smtpPass = "";
  let senderName = user.displayName;
  let senderEmail = "";

  if (userSmtp && userSmtp.smtpHost && userSmtp.smtpUser && userSmtp.smtpPass) {
    host = userSmtp.smtpHost;
    port = userSmtp.smtpPort;
    smtpUser = userSmtp.smtpUser;
    smtpPass = userSmtp.smtpPass;
    senderName = userSmtp.senderName || user.displayName;
    senderEmail = userSmtp.senderEmail || userSmtp.smtpUser;
  } else if (user.role === "special") {
    throw new Error(
      `Ciao ${user.displayName}! Prima di inviare email, configura le tue credenziali SMTP personali cliccando su "Impostazioni Email" in alto.`
    );
  } else {
    // Default TechPyre per Admin e Member
    host = process.env.OUTBOUND_SMTP_HOST || process.env.SMTP_HOST || "";
    port = Number(process.env.OUTBOUND_SMTP_PORT || process.env.SMTP_PORT || 465);
    smtpUser = process.env.OUTBOUND_SMTP_USER || process.env.SMTP_USER || "";
    smtpPass = process.env.OUTBOUND_SMTP_PASS || process.env.SMTP_PASS || "";
    senderName = process.env.OUTBOUND_FROM_NAME || `${user.displayName} - TechPyre`;
    senderEmail = smtpUser;
  }

  if (!host || !smtpUser || !smtpPass) {
    throw new Error(
      "Credenziali SMTP non configurate. Verifica le impostazioni email nel tuo profilo."
    );
  }

  // 3. Prepara il testo dell'email
  const subject = isFollowUp
    ? `Re: ${lead.outreach.emailSubject}`
    : lead.outreach.emailSubject;

  let text = isFollowUp
    ? lead.outreach.followUpWithLinkBody
    : lead.outreach.emailPlainTextBody;

  // Personalizza la presentazione in apertura se l'invio è fatto da un altro operatore (es. Andrea Di Bella)
  if (user.username !== "riccardogranza" && senderName) {
    text = text.replace(
      /mi chiamo Riccardo Granza e sono il fondatore di TechPyre/gi,
      `mi chiamo ${senderName} e collaboro con TechPyre`
    );
    text = text.replace(
      /Riccardo Granza\s*-\s*Fondatore TechPyre/gi,
      `${senderName}`
    );
    text = text.replace(/Riccardo Granza/gi, senderName);
  }

  // Regola Anti-Spam rigorosa per la prima email: ZERO link
  if (!isFollowUp && /https?:\/\//i.test(text)) {
    throw new Error(
      "Blocco Anti-Spam di sicurezza: la prima email contiene un link cliccabile. Rimuovilo prima di inviare."
    );
  }

  // 4. Invia tramite Nodemailer
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 15000,
  });

  const info = await transporter.sendMail({
    from: `"${senderName}" <${senderEmail || smtpUser}>`,
    replyTo: senderEmail || smtpUser,
    to: lead.meta.targetEmail,
    subject,
    text,
  });

  // 5. Se account Aruba di TechPyre, sincronizza in INBOX.Sent
  if (host.includes("aruba.it")) {
    try {
      const rawMessage = [
        `From: "${senderName}" <${senderEmail || smtpUser}>`,
        `To: ${lead.meta.targetEmail}`,
        `Subject: ${subject}`,
        `Date: ${new Date().toUTCString()}`,
        `Message-ID: ${info.messageId}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/plain; charset=utf-8`,
        `Content-Transfer-Encoding: 8bit`,
        ``,
        text,
      ].join("\r\n");
      await appendToArubaSent(smtpUser, smtpPass, rawMessage);
    } catch {}
  }

  // 6. Salva audit log dell'invio
  const logEntry = {
    slug: lead.slug,
    companyName: lead.meta.companyName,
    recipient: lead.meta.targetEmail,
    type: isFollowUp ? "FOLLOW_UP" : "INITIAL",
    subject,
    messageId: info.messageId,
    sentAt: new Date().toISOString(),
    sentBy: `${user.displayName} (${user.username})`,
  };

  saveOutreachLog(logEntry);

  return {
    success: true,
    messageId: info.messageId,
    message: `Email inviata con successo a ${lead.meta.targetEmail} da ${senderName}!`,
    sentBy: senderName,
  };
}
