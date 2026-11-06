import fs from "fs";
import path from "path";
import tls from "tls";
import nodemailer from "nodemailer";
import { InboundReplyClassification, LeadConfig } from "@/types/lead";
import { UserProfile } from "./adminAuth";
import { getUserSmtp } from "./userSmtpStorage";
import { loadLeadConfig, saveLeadConfig } from "./leadsStorage";
import { buildMultiStepOutreach } from "./scoutService";

export const DAILY_FIRST_TOUCH_LIMIT = 35;

export interface OutreachLogEntry {
  slug: string;
  companyName: string;
  recipient: string;
  type: "STEP_1" | "STEP_2" | "STEP_3" | "STEP_4" | "INITIAL" | "FOLLOW_UP";
  stepNumber?: 1 | 2 | 3 | 4;
  subject: string;
  messageId: string;
  sentAt: string;
  sentBy?: string;
  requiresFollowUpCall?: boolean;
  phoneToCall?: string;
}

export interface InboundClassificationResult {
  classification: InboundReplyClassification;
  isHotLead: boolean;
  stopAutomatedSequence: boolean;
  nextLeadStatus: NonNullable<LeadConfig["meta"]["status"]>;
  operatorActionRequired: string;
  suggestedReplySubject?: string;
  suggestedReplyBody?: string;
}

function appendToArubaSent(
  user: string,
  pass: string,
  rawEmail: string
): Promise<boolean> {
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

export function getOutreachHistory(): OutreachLogEntry[] {
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

export function saveOutreachLog(logEntry: OutreachLogEntry) {
  const { primary, fallback } = getOutreachHistoryPath();
  const list = getOutreachHistory();
  list.push(logEntry);
  const jsonStr = JSON.stringify(list, null, 2);

  try {
    fs.writeFileSync(/*turbopackIgnore: true*/ primary, jsonStr, "utf-8");
  } catch {}

  try {
    fs.writeFileSync(/*turbopackIgnore: true*/ fallback, jsonStr, "utf-8");
  } catch {}
}

/**
 * DIRETTIVA 7.1: Pacing, Business Hours (08:30-17:30 Lun-Ven Europe/Rome), Rate Limiting (max 30-35 First Touch/giorno) & Jitter
 */
export function checkRomeBusinessHours(now = new Date()): {
  allowed: boolean;
  reason?: string;
} {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Rome",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value || "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value || "10");
  const minute = Number(parts.find((p) => p.type === "minute")?.value || "0");

  if (weekday === "Sat" || weekday === "Sun") {
    return {
      allowed: false,
      reason:
        "Invio bloccato dal protocollo Deliverability: fuori dai giorni lavorativi (consentito solo Lun-Ven 08:30-17:30 ora di Roma).",
    };
  }

  const totalMinutes = hour * 60 + minute;
  const openMinutes = 8 * 60 + 30; // 08:30
  const closeMinutes = 17 * 60 + 30; // 17:30

  if (totalMinutes < openMinutes || totalMinutes > closeMinutes) {
    return {
      allowed: false,
      reason: `Invio bloccato dal protocollo Deliverability: orario attuale fuori dalla finestra lavorativa 08:30-17:30 (ora di Roma).`,
    };
  }

  return { allowed: true };
}

export function getTodayFirstTouchCountForSender(senderKey: string): number {
  const todayIsoPrefix = new Date().toISOString().slice(0, 10);
  const history = getOutreachHistory();
  return history.filter((item) => {
    const isToday = item.sentAt.startsWith(todayIsoPrefix);
    const isFirstTouch = item.type === "STEP_1" || item.type === "INITIAL";
    const matchesSender = !item.sentBy || item.sentBy.includes(senderKey);
    return isToday && isFirstTouch && matchesSender;
  }).length;
}

export async function applyDeliverabilityJitter(
  minMs = 2400,
  maxMs = 6800
): Promise<number> {
  const delay = Math.floor(minMs + Math.random() * (maxMs - minMs));
  await new Promise((resolve) => setTimeout(resolve, delay));
  return delay;
}

/**
 * DIRETTIVA 7.2: CLASSIFICATORE RISPOSTE (PLAYBOOK OPERATIVO)
 */
export function classifyInboundReply(
  replyText: string,
  replySubject = "",
  lead?: LeadConfig
): InboundClassificationResult {
  const combined = `${replySubject || ""}\n${replyText || ""}`.toLowerCase();
  const slug = lead?.slug || "azienda-demo";
  const companyName = lead?.meta?.companyName || "la vostra azienda";
  const targetEmail = lead?.meta?.targetEmail || "casella aziendale";
  const demoUrl = `https://www.techpyre.eu/demo/${slug}`;
  const firstName = lead?.meta?.decisionMakerFirstName || "";
  const greeting = firstName ? `Buongiorno ${firstName},` : `Buongiorno,`;
  const baseSubject = `Re: ${(lead?.outreach?.emailSubject || `Segnalazione tecnica ${companyName}`).replace(/^Re:\s*/i, "")}`;

  // 1. AUTO_REPLY_OR_TICKET
  const isTicketingSystem =
    /abbiamo preso in carico|presa in carico|ticket\s*#|richiesta\s*#|numero di ticket|helpdesk|zendesk|freshdesk|jira|servizio clienti automatico|risposta automatica di supporto|do not reply|non rispondere a questo messaggio/i.test(
      combined
    );

  const isOutOfOffice =
    /assente dall'ufficio|fuori sede|out of office|in ferie|chiusura aziendale|tornero in ufficio|automatic reply|risposta automatica/i.test(
      combined
    );

  if (isTicketingSystem || isOutOfOffice) {
    if (isTicketingSystem) {
      if (lead) {
        lead.meta.status = "INVALID_TICKET_INBOX";
        saveLeadConfig(lead.slug, lead);
      }
      return {
        classification: "AUTO_REPLY_OR_TICKET",
        isHotLead: false,
        stopAutomatedSequence: true,
        nextLeadStatus: "INVALID_TICKET_INBOX",
        operatorActionRequired: `Rilevato bot di ticketing su ${targetEmail}. Lead marcato come INVALID_TICKET_INBOX e spostato in coda per ricerca manuale del titolare (${companyName}) su LinkedIn.`,
      };
    }

    return {
      classification: "AUTO_REPLY_OR_TICKET",
      isHotLead: false,
      stopAutomatedSequence: false,
      nextLeadStatus: lead?.meta?.status || "CONTACTED_STEP_1",
      operatorActionRequired:
        "Risposta automatica Out-Of-Office rilevata. Non conteggiare come lead convertito; ripianificare il follow-up al rientro.",
    };
  }

  // 2. UNSUBSCRIBE_OR_NO
  if (
    /\b(cancellami|cancellate|rimuovete|rimuovere|unsubscribe|non siamo interessati|non mi interessa|non ci interessa|non contattateci|basta mail|diffida|gdpr cancellazione)\b/i.test(
      combined
    )
  ) {
    if (lead) {
      lead.meta.status = "BLACKLISTED";
      saveLeadConfig(lead.slug, lead);
    }
    return {
      classification: "UNSUBSCRIBE_OR_NO",
      isHotLead: false,
      stopAutomatedSequence: true,
      nextLeadStatus: "BLACKLISTED",
      operatorActionRequired:
        "Richiesta di disiscrizione/rifiuto esplicito. Sequenza fermata immediatamente e contatto spostato in BLACKLISTED.",
    };
  }

  // 3. SKEPTICAL_OR_OBJECTION (Interesse dubbioso: "Quanto costa?", "Siamo già seguiti", "Non so se ci serve adesso")
  const isPriceQuestion =
    /quanto costa|che costo|prezzo|prezzi|preventivo|listino|budget|investimento/i.test(
      combined
    );
  const isAgencyObjection =
    /siamo gia seguiti|ci segue gia|abbiamo gia un'agenzia|abbiamo un'agenzia|nostra agenzia|web agency|fornitore attuale|chi ci segue/i.test(
      combined
    );
  const isTimingOrSkeptical =
    /non so se ci serve|in questo momento|piu avanti|cosa fate esattamente|come funziona|spiegami meglio|dubbio/i.test(
      combined
    );

  if (isPriceQuestion || isAgencyObjection || isTimingOrSkeptical) {
    if (lead) {
      lead.meta.status = "HOT_LEAD";
      saveLeadConfig(lead.slug, lead);
    }

    const lcpVal = lead?.audit?.originalLcpSeconds ?? 6.5;
    let objectionValidation = `Capisco perfettamente il punto.`;
    if (isPriceQuestion) {
      objectionValidation = `Ottima domanda: l'intervento dipende solo da quali flussi commerciali volete automatizzare oltre alla velocita mobile, per cui preferisco evitare listini standardizzati prima di avervi mostrato il funzionamento reale.`;
    } else if (isAgencyObjection) {
      objectionValidation = `Ha perfettamente senso, e infatti non sostituiamo chi vi segue oggi il marketing: lavoriamo sul livello ingegneristico sottostante (anche in affiancamento ai vostri referenti attuali) per azzerare i ${lcpVal}s di caricamento mobile.`;
    } else if (isTimingOrSkeptical) {
      objectionValidation = `Comprensibile, ed e proprio per non farvi perdere tempo in valutazioni astratte che abbiamo gia costruito il prototipo funzionante sulla vostra pagina attuale.`;
    }

    const suggestedReplyBody = [
      greeting,
      ``,
      objectionValidation,
      ``,
      `Qui potete vedere direttamente dal telefono il prototipo da 0.3 secondi gia pronto per ${companyName}:`,
      demoUrl,
      ``,
      `Se vi fa piacere, facciamo 10 minuti di condivisione schermo tra martedi e giovedi (oppure vi registro un breve video Loom di 2 minuti) per mostrarvi l'architettura applicata al vostro caso e darvi un quadro preciso. Cosa preferite?`,
      ``,
      `Un cordiale saluto,`,
      `Riccardo Granza · TechPyre Studio`,
      `WhatsApp diretto: +39 379 115 9352`,
    ].join("\n");

    return {
      classification: "SKEPTICAL_OR_OBJECTION",
      isHotLead: true,
      stopAutomatedSequence: true,
      nextLeadStatus: "HOT_LEAD",
      operatorActionRequired:
        "LEAD CALDO CON OBIEZIONE/DOMANDA: Sequenza automatica fermata. Invia la risposta su misura qui sotto (zero listini prezzi o muri di testo, focus su call di 10 min o Loom di 2 min).",
      suggestedReplySubject: baseSubject,
      suggestedReplyBody,
    };
  }

  // 4. POSITIVE_REQUEST_LINK (Richiesta link demo o apertura al confronto)
  if (lead) {
    lead.meta.status = "HOT_LEAD";
    saveLeadConfig(lead.slug, lead);
  }

  const step2Body =
    lead?.outreach?.step2FollowUpLink?.body ||
    lead?.outreach?.followUpWithLinkBody ||
    [
      greeting,
      ``,
      `vi lascio qui sotto il link della demo da 0.3 secondi preparata per ${companyName}, completa di filtro pre-qualifica contatti:`,
      ``,
      demoUrl,
      ``,
      `Avete 10 minuti tra martedi e giovedi per vedere come collegarla al vostro flusso commerciale?`,
      ``,
      `Riccardo Granza · TechPyre Studio`,
      `+39 379 115 9352`,
    ].join("\n");

  return {
    classification: "POSITIVE_REQUEST_LINK",
    isHotLead: true,
    stopAutomatedSequence: true,
    nextLeadStatus: "HOT_LEAD",
    operatorActionRequired:
      "PRIORITA ALTA - RISPOSTA POSITIVA: Sequenza automatica fermata. Invia subito lo Step 2 col link della demo live.",
    suggestedReplySubject: baseSubject,
    suggestedReplyBody: step2Body,
  };
}

export async function sendLeadOutreach({
  slug,
  stepNumber,
  isFollowUp = false,
  user,
  customRecipient,
  customSubject,
  customBody,
  bypassBusinessHoursCheck = false,
  bypassRateLimitCheck = false,
  applyJitter = true,
}: {
  slug: string;
  stepNumber?: 1 | 2 | 3 | 4;
  isFollowUp?: boolean;
  user: UserProfile;
  customRecipient?: string;
  customSubject?: string;
  customBody?: string;
  bypassBusinessHoursCheck?: boolean;
  bypassRateLimitCheck?: boolean;
  applyJitter?: boolean;
}): Promise<{
  success: boolean;
  messageId: string;
  message: string;
  sentBy: string;
  stepNumber: 1 | 2 | 3 | 4;
  requiresFollowUpCall: boolean;
  phoneToCall?: string;
}> {
  const lead = loadLeadConfig(slug);
  if (!lead) {
    throw new Error(`Lead [${slug}] non trovato nel database.`);
  }

  if (
    lead.meta.status === "BLACKLISTED" ||
    lead.meta.status === "INVALID_TICKET_INBOX"
  ) {
    throw new Error(
      `Invio bloccato: il lead [${slug}] si trova nello stato ${lead.meta.status}.`
    );
  }

  // Assicura che i 4 step siano presenti anche per i lead generati prima del refactoring
  if (!lead.outreach.step1FirstTouch || !lead.outreach.step2FollowUpLink) {
    const regenerated = buildMultiStepOutreach({
      slug: lead.slug,
      companyName: lead.meta.companyName,
      decisionMaker: {
        fullName:
          lead.meta.decisionMakerName &&
          !lead.meta.decisionMakerName.startsWith("Direzione ") &&
          !lead.meta.decisionMakerName.startsWith("Titolare ")
            ? lead.meta.decisionMakerName
            : null,
        firstName: lead.meta.decisionMakerFirstName || null,
        role: lead.meta.decisionMakerRole || null,
      },
      isGenericInbox: lead.meta.isGenericInbox ?? true,
      estimatedMobileLcpSeconds: lead.audit.originalLcpSeconds,
      renderBlockingScripts: lead.audit.renderBlockingCount || 8,
      runsAds: lead.audit.runsAds ?? true,
    });
    lead.outreach = regenerated;
  }

  const resolvedStep: 1 | 2 | 3 | 4 = stepNumber
    ? stepNumber
    : isFollowUp
    ? 2
    : 1;

  if (customRecipient && customRecipient.trim()) {
    lead.meta.targetEmail = customRecipient.trim();
  }
  if (customSubject && customSubject.trim()) {
    lead.outreach.emailSubject = customSubject.trim().replace(/^Re:\s*/i, "");
  }
  if (customBody && customBody.trim()) {
    if (resolvedStep === 1) {
      lead.outreach.emailPlainTextBody = customBody.trim();
      if (lead.outreach.step1FirstTouch) {
        lead.outreach.step1FirstTouch.body = customBody.trim();
      }
    } else if (resolvedStep === 2) {
      lead.outreach.followUpWithLinkBody = customBody.trim();
      if (lead.outreach.step2FollowUpLink) {
        lead.outreach.step2FollowUpLink.body = customBody.trim();
      }
    } else if (resolvedStep === 3 && lead.outreach.step3ValueDropAndCallTrigger) {
      lead.outreach.step3ValueDropAndCallTrigger.body = customBody.trim();
    } else if (resolvedStep === 4 && lead.outreach.step4Breakup) {
      lead.outreach.step4Breakup.body = customBody.trim();
    }
  }
  saveLeadConfig(slug, lead);

  // DIRETTIVA 7.1: Controllo fascia oraria lavorativa (08:30-17:30 Lun-Ven Roma) e Rate Limit giornaliero (35 First Touch/giorno)
  if (!bypassBusinessHoursCheck) {
    const hoursCheck = checkRomeBusinessHours();
    if (!hoursCheck.allowed) {
      throw new Error(hoursCheck.reason);
    }
  }

  if (resolvedStep === 1 && !bypassRateLimitCheck) {
    const sentToday = getTodayFirstTouchCountForSender(user.username);
    if (sentToday >= DAILY_FIRST_TOUCH_LIMIT) {
      throw new Error(
        `Limite giornaliero di deliverability raggiunto (${sentToday}/${DAILY_FIRST_TOUCH_LIMIT} nuovi First Touch inviati oggi per ${user.username}). Riprendi domani tra le 08:30 e le 17:30.`
      );
    }
  }

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
    host = process.env.OUTBOUND_SMTP_HOST || process.env.SMTP_HOST || "";
    port = Number(process.env.OUTBOUND_SMTP_PORT || process.env.SMTP_PORT || 465);
    smtpUser = process.env.OUTBOUND_SMTP_USER || process.env.SMTP_USER || "";
    smtpPass = process.env.OUTBOUND_SMTP_PASS || process.env.SMTP_PASS || "";
    senderName =
      process.env.OUTBOUND_FROM_NAME || `${user.displayName} · TechPyre Studio`;
    senderEmail = smtpUser;
  }

  if (!host || !smtpUser || !smtpPass) {
    throw new Error(
      "Credenziali SMTP non configurate. Verifica le impostazioni email nel tuo profilo."
    );
  }

  const stepMap = {
    1: lead.outreach.step1FirstTouch!,
    2: lead.outreach.step2FollowUpLink!,
    3: lead.outreach.step3ValueDropAndCallTrigger!,
    4: lead.outreach.step4Breakup!,
  };
  const activeStep = stepMap[resolvedStep];

  const subject = activeStep.subject.replace(/[—–]/g, "-");
  let text = activeStep.body.replace(/[—–]/g, "-");

  if (user.username !== "riccardogranza" && senderName) {
    text = text.replace(/Riccardo Granza/gi, senderName);
  }

  // Regola Anti-Spam rigorosa per lo Step 1 (First Touch): ZERO link, ZERO prezzi, ZERO 'LINK'
  if (resolvedStep === 1) {
    if (/https?:\/\//i.test(text)) {
      throw new Error(
        "Blocco Anti-Spam di sicurezza: lo Step 1 (First Touch) contiene un link cliccabile. Rimuovilo prima di inviare."
      );
    }
    if (/\b900\s*euro\b|\b900€\b|\bzero canoni\b/i.test(text)) {
      throw new Error(
        "Violazione Zero-Fluff Protocol: lo Step 1 non deve contenere prezzi ('900 euro') o 'zero canoni'."
      );
    }
  }

  if (applyJitter) {
    await applyDeliverabilityJitter(1800, 4800);
  }

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

  const statusByStep: Record<1 | 2 | 3 | 4, NonNullable<LeadConfig["meta"]["status"]>> = {
    1: "CONTACTED_STEP_1",
    2: "CONTACTED_STEP_2",
    3: "CONTACTED_STEP_3",
    4: "CONTACTED_STEP_4",
  };
  lead.meta.status = statusByStep[resolvedStep];
  saveLeadConfig(slug, lead);

  const requiresFollowUpCall = Boolean(activeStep.requiresFollowUpCall);
  const logEntry: OutreachLogEntry = {
    slug: lead.slug,
    companyName: lead.meta.companyName,
    recipient: lead.meta.targetEmail,
    type: `STEP_${resolvedStep}`,
    stepNumber: resolvedStep,
    subject,
    messageId: info.messageId,
    sentAt: new Date().toISOString(),
    sentBy: `${user.displayName} (${user.username})`,
    requiresFollowUpCall,
    phoneToCall: requiresFollowUpCall ? lead.meta.phone : undefined,
  };

  saveOutreachLog(logEntry);

  return {
    success: true,
    messageId: info.messageId,
    message: requiresFollowUpCall
      ? `Step ${resolvedStep} inviato a ${lead.meta.targetEmail}. AZIONE RICHIESTA: Esegui chiamata telefonica di 45s al numero ${lead.meta.phone}!`
      : `Step ${resolvedStep} inviato con successo a ${lead.meta.targetEmail} da ${senderName}!`,
    sentBy: senderName,
    stepNumber: resolvedStep,
    requiresFollowUpCall,
    phoneToCall: requiresFollowUpCall ? lead.meta.phone : undefined,
  };
}
