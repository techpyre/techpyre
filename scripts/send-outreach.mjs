#!/usr/bin/env node
/**
 * =====================================================================
 * TechPYRE Outbound Engine - CLI Outreach Pack & SMTP Sender
 * Uso:
 *   node scripts/send-outreach.mjs <slug>                 # Valida e genera outreach-pack.txt
 *   node scripts/send-outreach.mjs <slug> --send          # Invia la 1ª email plain-text via SMTP
 *   node scripts/send-outreach.mjs <slug> --send --followup # Invia il follow-up col link demo
 * =====================================================================
 */
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const shouldSend = args.includes('--send');
const isFollowUp = args.includes('--followup');

if (!slug) {
  console.error('Uso: node scripts/send-outreach.mjs <slug> [--send] [--followup]');
  process.exit(1);
}

// Carica variabili da .env.local se presenti
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const leadPath = path.join(process.cwd(), 'src', 'data', 'leads', `${slug}.json`);
if (!fs.existsSync(leadPath)) {
  console.error(`Lead non trovato: ${leadPath}`);
  process.exit(1);
}

const lead = JSON.parse(fs.readFileSync(leadPath, 'utf-8'));
const outDir = path.join(process.cwd(), 'public', 'leads', lead.slug);
fs.mkdirSync(outDir, { recursive: true });

let preflight = null;
const preflightPath = path.join(outDir, 'preflight.json');
if (fs.existsSync(preflightPath)) {
  try {
    preflight = JSON.parse(fs.readFileSync(preflightPath, 'utf-8'));
  } catch {
    preflight = null;
  }
}

const baseUrl = process.env.NEXT_PUBLIC_DEMO_DOMAIN || 'https://techpyre.eu';
const demoUrl = `${baseUrl}/demo/${lead.slug}`;

const words = lead.outreach.emailPlainTextBody.trim().split(/\s+/).filter(Boolean).length;
const hasLinksInInitial = /https?:\/\//i.test(lead.outreach.emailPlainTextBody);

const firstName =
  lead.meta.decisionMakerName
    .replace(/^(?:Ing\.|Dott\.ssa|Dott\.|Arch\.|Geom\.|Sig\.|Avv\.)\s*/i, '')
    .split(/\s+/)[0] || '';

const dmText = `Buongiorno ${firstName}, sono Riccardo Granza, fondatore di TechPyre (sviluppiamo landing page ad alta velocità per chi investe in campagne Meta). Ho visto la vostra sponsorizzata "${lead.audit.activeAdHeadline}" su Facebook: dal telefono la pagina attuale impiega ${lead.audit.originalLcpSeconds} secondi ad aprirsi. Per presentarci vi abbiamo preparato una versione dimostrativa istantanea (0.3s) con i vostri testi: le ho inviato i dettagli via email, se le fa piacere provarla dal telefono mi scriva pure qui e le giro il link!`;

const qualificationStrategy =
  preflight?.qualification?.recommendedStrategy || 'DIRECT_BUYER';
const detectedAgencyLinks =
  preflight?.qualification?.agencyDetection?.detectedAgencyLinks || [];
const detectedAgencyNames =
  preflight?.qualification?.agencyDetection?.detectedAgencyNames || [];
const martechSignals =
  preflight?.qualification?.agencyDetection?.martechSignals || [];

const agencyObjectionReply = [
  `La capisco perfettamente, e infatti non vogliamo assolutamente sostituire l'agenzia che vi segue le campagne Facebook.`,
  `Il nostro è un intervento puramente tecnico (anche in White-Label): forniamo alla vostra agenzia attuale la pagina veloce da 0.3s sul vostro dominio, già collegata al loro Pixel e GTM, così i clic che vi portano smettono di perdersi durante i ${lead.audit.originalLcpSeconds} secondi di caricamento.`,
  `Può girare direttamente anche a loro questo link di test (è completamente neutro, senza il nostro logo):`,
  `${demoUrl}`,
].join('\n\n');

const whiteLabelAgencyPitch = [
  `Oggetto: Partnership tecnica White-Label su campagne Meta di ${lead.meta.companyName} (${lead.audit.originalLcpSeconds}s -> 0.3s)`,
  ``,
  `Buongiorno,`,
  ``,
  `mi chiamo Riccardo Granza e sono il fondatore di TechPyre: siamo uno studio tecnico specializzato nello sviluppo di landing page Next.js ad altissima velocità (0.3s) in modalità White-Label per le Web Agency.`,
  ``,
  `Abbiamo notato che seguite il progetto digitale di ${lead.meta.companyName}. Le creatività su Meta sono ben strutturate, ma la pagina attuale su cui atterra il traffico mobile impiega ${lead.audit.originalLcpSeconds} secondi a caricare, penalizzando il tasso di conversione delle campagne.`,
  ``,
  `Abbiamo già preparato una versione Next.js da 0.3s per ${lead.meta.companyName} completamente neutra (100% White-Label, zero riferimenti a TechPyre) con simulatore lead integrato: potete mostrarla direttamente al vostro cliente come upgrade vostro o collegarla in 24h al vostro GTM/CRM.`,
  ``,
  `Se vi fa piacere vedere la preview White-Label già pronta, rispondetemi pure 'LINK' e ve la giro subito.`,
  ``,
  `Un cordiale saluto,`,
  `Riccardo Granza - Fondatore TechPyre`,
  `+39 379 115 9352`,
].join('\n');

const packContent = [
  `=====================================================================`,
  `OUTBOUND PACK - ${lead.meta.companyName.toUpperCase()} (${lead.slug})`,
  `=====================================================================`,
  `Titolare / Decision Maker : ${lead.meta.decisionMakerName}`,
  `Email Target              : ${lead.meta.targetEmail}`,
  `Telefono / WhatsApp       : ${lead.meta.phone}`,
  `Città                     : ${lead.meta.city}`,
  `P.IVA                     : ${lead.meta.vatNumber || 'N/D'}`,
  `LCP Sito Attuale          : ${lead.audit.originalLcpSeconds}s (Score Mobile: ${lead.audit.mobileScore}/100)`,
  `URL Demo (Brand-Neutral)  : ${demoUrl}`,
  `Strategia Qualifica       : ${qualificationStrategy}`,
  `Segnali MarTech / Agenzia : ${martechSignals.length ? martechSignals.join(', ') : 'Nessuno stack avanzato rilevato'}`,
  `Agenzia Rilevata Footer   : ${
    detectedAgencyLinks.length
      ? detectedAgencyLinks.map((a) => `${a.label || 'Agency'} (${a.href})`).join(', ')
      : detectedAgencyNames.length
      ? detectedAgencyNames.join(', ')
      : 'Nessuna agenzia esterna firmata nel footer'
  }`,
  `Check Anti-Spam 1ª Email  : ${words} parole | Link: ${hasLinksInInitial ? '⚠️ LINK TROVATO (VIETATO!)' : '✅ ZERO LINK (Inbox Sicura)'}`,
  ``,
  `---------------------------------------------------------------------`,
  `1. PRIMA EMAIL AL TITOLARE (Plain-Text, Zero Link)`,
  `---------------------------------------------------------------------`,
  `A: ${lead.meta.targetEmail}`,
  `Oggetto: ${lead.outreach.emailSubject}`,
  ``,
  lead.outreach.emailPlainTextBody,
  ``,
  `---------------------------------------------------------------------`,
  `2. FOLLOW-UP EMAIL (Quando risponde "LINK" o "SÌ")`,
  `---------------------------------------------------------------------`,
  `A: ${lead.meta.targetEmail}`,
  `Oggetto: Re: ${lead.outreach.emailSubject}`,
  ``,
  lead.outreach.followUpWithLinkBody,
  ``,
  `---------------------------------------------------------------------`,
  `3. DM INSTAGRAM / FACEBOOK / WHATSAPP (+ public/leads/${lead.slug}/new-demo-mobile.png)`,
  `---------------------------------------------------------------------`,
  dmText,
  ``,
  `---------------------------------------------------------------------`,
  `4. RISPOSTA ANTI-OBIEZIONE "CI SEGUE GIÀ UN'AGENZIA" (Coesistenza / White-Label)`,
  `---------------------------------------------------------------------`,
  agencyObjectionReply,
  ``,
  `---------------------------------------------------------------------`,
  `5. PITCH B2B2B WHITE-LABEL DIRETTO ALL'AGENZIA (Se vuoi vendere all'Agenzia)`,
  `---------------------------------------------------------------------`,
  whiteLabelAgencyPitch,
  `=====================================================================`,
].join('\n');

const outPath = path.join(outDir, 'outreach-pack.txt');
fs.writeFileSync(outPath, packContent, 'utf-8');

console.log(packContent);
console.log(`\n✅ Bozza salvata in: public/leads/${lead.slug}/outreach-pack.txt`);

if (shouldSend) {
  if (!isFollowUp && hasLinksInInitial) {
    console.error('❌ BLOCCO ANTI-SPAM: La prima email contiene un link http/https. Rimuovilo prima di inviare.');
    process.exit(1);
  }

  const host = process.env.OUTBOUND_SMTP_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.OUTBOUND_SMTP_PORT || process.env.SMTP_PORT || 587);
  const user = process.env.OUTBOUND_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.OUTBOUND_SMTP_PASS || process.env.SMTP_PASS;
  const fromName = process.env.OUTBOUND_FROM_NAME || 'Riccardo Granza - TechPYRE';

  if (!host || !user || !pass || host.includes('tuoprovider')) {
    console.log('\nℹ️  SMTP non configurato per invio reale (modalità Dry-Run completata).');
    process.exit(0);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const subject = isFollowUp ? `Re: ${lead.outreach.emailSubject}` : lead.outreach.emailSubject;
  const text = isFollowUp ? lead.outreach.followUpWithLinkBody : lead.outreach.emailPlainTextBody;

  const info = await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    replyTo: user,
    to: lead.meta.targetEmail,
    subject,
    text,
  });

  // Salva lo storico invio persistente per la Dashboard e i log
  const historyPath = path.join(process.cwd(), 'src', 'data', 'outreach-history.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    } catch {
      history = [];
    }
  }

  const logEntry = {
    slug: lead.slug,
    companyName: lead.meta.companyName,
    recipient: lead.meta.targetEmail,
    type: isFollowUp ? 'FOLLOW_UP' : 'INITIAL',
    subject,
    messageId: info.messageId,
    sentAt: new Date().toISOString(),
  };

  history.push(logEntry);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');

  // Salva anche nella cartella pubblica del lead
  fs.writeFileSync(path.join(outDir, 'last-send.json'), JSON.stringify(logEntry, null, 2), 'utf-8');

  console.log(`\n🚀 Email (${isFollowUp ? 'FOLLOW-UP' : 'INITIAL'}) inviata con successo! MessageId: ${info.messageId}`);
}
