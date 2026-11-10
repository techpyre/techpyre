#!/usr/bin/env node
/**
 * =====================================================================
 * TechPYRE Outbound Engine - CLI Multi-Step Outreach Pack & SMTP Sender
 * Uso:
 *   node scripts/send-outreach.mjs <slug>                    # Valida e genera outreach-pack.txt (4 Touchpoint)
 *   node scripts/send-outreach.mjs <slug> --send             # Invia Step 1 (First Touch, Zero Link) via SMTP
 *   node scripts/send-outreach.mjs <slug> --send --step=2    # Invia Step 2 (Follow-Up In-Thread + Link Demo)
 *   node scripts/send-outreach.mjs <slug> --send --step=3    # Invia Step 3 (Value Drop + Trigger Chiamata)
 *   node scripts/send-outreach.mjs <slug> --send --step=4    # Invia Step 4 (Breakup Email)
 * =====================================================================
 */
import fs from 'fs';
import path from 'path';
import tls from 'tls';
import nodemailer from 'nodemailer';

function appendToArubaSent(user, pass, rawEmail) {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(993, 'imaps.aruba.it', () => {});
      socket.setEncoding('utf-8');
      let step = 0;
      const timeout = setTimeout(() => {
        try { socket.destroy(); } catch {}
        resolve(false);
      }, 7000);

      socket.on('data', (data) => {
        if (step === 0 && data.includes('* OK')) {
          step = 1;
          socket.write(`A1 LOGIN "${user}" "${pass}"\r\n`);
        } else if (step === 1 && data.includes('A1 OK')) {
          step = 2;
          const len = Buffer.byteLength(rawEmail, 'utf-8');
          socket.write(`A2 APPEND "INBOX.Sent" (\\Seen) {${len}}\r\n`);
        } else if (step === 2 && data.includes('+')) {
          step = 3;
          socket.write(rawEmail + '\r\n');
        } else if (step === 3 && data.includes('A2 OK')) {
          step = 4;
          clearTimeout(timeout);
          socket.write('A3 LOGOUT\r\n');
          resolve(true);
        } else if (data.includes('NO') || data.includes('BAD')) {
          clearTimeout(timeout);
          resolve(false);
        }
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

const args = process.argv.slice(2);
const slug = args.find((a) => !a.startsWith('--'));
const shouldSend = args.includes('--send');
const isFollowUpFlag = args.includes('--followup');
const stepArg = args.find((a) => a.startsWith('--step='));
const stepNumber = stepArg ? Number(stepArg.split('=')[1]) : isFollowUpFlag ? 2 : 1;

if (!slug) {
  console.error('Uso: node scripts/send-outreach.mjs <slug> [--send] [--step=1|2|3|4]');
  process.exit(1);
}

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

const baseUrl = process.env.NEXT_PUBLIC_DEMO_DOMAIN || 'https://www.techpyre.eu';
const demoUrl = `${baseUrl}/demo/${lead.slug}`;

const step1Body = (lead.outreach.step1FirstTouch?.body || lead.outreach.emailPlainTextBody || '').replace(/[\u2013\u2014]/g, '-');
const step2Body = (lead.outreach.step2FollowUpLink?.body || lead.outreach.followUpWithLinkBody || '').replace(/[\u2013\u2014]/g, '-');
const step3Body = (lead.outreach.step3ValueDropAndCallTrigger?.body || '').replace(/[\u2013\u2014]/g, '-');
const step4Body = (lead.outreach.step4Breakup?.body || '').replace(/[\u2013\u2014]/g, '-');
const cleanSubject = (lead.outreach.emailSubject || '').replace(/[\u2013\u2014]/g, '-');

const words = step1Body.trim().split(/\s+/).filter(Boolean).length;
const hasLinksInInitial = /https?:\/\//i.test(step1Body);

const firstName =
  lead.meta.decisionMakerFirstName ||
  lead.meta.decisionMakerName
    .replace(/^(?:Ing\.|Dott\.ssa|Dott\.|Arch\.|Geom\.|Sig\.|Avv\.)\s*/i, '')
    .split(/\s+/)[0] ||
  '';

const dmText = `Buongiorno ${firstName && !firstName.startsWith('Direzione') ? firstName : `team ${lead.meta.companyName}`}, da un test tecnico sul vostro sito da rete mobile abbiamo rilevato ${lead.audit.originalLcpSeconds} secondi di caricamento. Vi abbiamo preparato una demo funzionante in Next.js che apre la vostra pagina in 0.3 secondi: vi fa piacere se vi giro qui sotto il link di prova per testarla dallo smartphone senza impegno?`;

const packContent = [
  `=====================================================================`,
  `OUTBOUND PACK (4-STEP SEQUENCE) - ${lead.meta.companyName.toUpperCase()} (${lead.slug})`,
  `=====================================================================`,
  `Titolare / Decision Maker : ${lead.meta.decisionMakerName}`,
  `Ruolo Rilevato            : ${lead.meta.decisionMakerRole || 'Direzione Aziendale'}`,
  `Email Target              : ${lead.meta.targetEmail} (Score: ${lead.meta.emailScore ?? 'N/D'} | Generica: ${lead.meta.isGenericInbox ? 'SÌ' : 'NO'})`,
  `Telefono / WhatsApp       : ${lead.meta.phone}`,
  `Città                     : ${lead.meta.city}`,
  `P.IVA                     : ${lead.meta.vatNumber || 'N/D'}`,
  `LCP Sito Attuale          : ${lead.audit.originalLcpSeconds}s (Score Mobile: ${lead.audit.mobileScore}/100)`,
  `Campagne / Pixel Rilevati : ${lead.audit.runsAds ? `ATTIVI (${(lead.audit.detectedTrackingSignals || []).join(', ')})` : 'ASSENTI (Angolo Acquisizione B2B & CRM)'}`,
  `URL Demo Live             : ${demoUrl}`,
  `Check Zero-Fluff Step 1   : ${words} parole | Link: ${hasLinksInInitial ? '⚠️ LINK TROVATO (VIETATO!)' : '✅ ZERO LINK (Inbox Sicura)'}`,
  ``,
  `---------------------------------------------------------------------`,
  `STEP 1 · GIORNO 1 · FIRST TOUCH (65-85 parole, Zero Link, Zero Prezzi)`,
  `---------------------------------------------------------------------`,
  `A: ${lead.meta.targetEmail}`,
  `Oggetto: ${cleanSubject}`,
  ``,
  step1Body,
  ``,
  `---------------------------------------------------------------------`,
  `STEP 2 · GIORNO 4 · FOLLOW-UP IN-THREAD + INVIO PROATTIVO LINK DEMO`,
  `---------------------------------------------------------------------`,
  `A: ${lead.meta.targetEmail}`,
  `Oggetto: Re: ${cleanSubject}`,
  ``,
  step2Body,
  ``,
  `---------------------------------------------------------------------`,
  `STEP 3 · GIORNO 8 · VALUE DROP + TRIGGER CHIAMATA TELEFONICA`,
  `---------------------------------------------------------------------`,
  `A: ${lead.meta.targetEmail}`,
  `Oggetto: Re: ${cleanSubject}`,
  ``,
  step3Body,
  ``,
  `---------------------------------------------------------------------`,
  `STEP 4 · GIORNO 13 · BREAKUP EMAIL`,
  `---------------------------------------------------------------------`,
  `A: ${lead.meta.targetEmail}`,
  `Oggetto: Re: ${cleanSubject}`,
  ``,
  step4Body,
  ``,
  `---------------------------------------------------------------------`,
  `DM RAPIDO WHATSAPP / LINKEDIN (+ public/leads/${lead.slug}/new-demo-mobile.png)`,
  `---------------------------------------------------------------------`,
  dmText,
  `=====================================================================`,
].join('\n');

const outPath = path.join(outDir, 'outreach-pack.txt');
fs.writeFileSync(outPath, packContent, 'utf-8');

console.log(packContent);
console.log(`\n✅ Sequenza 4-Step salvata in: public/leads/${lead.slug}/outreach-pack.txt`);

if (shouldSend) {
  if (stepNumber === 1 && hasLinksInInitial) {
    console.error('❌ BLOCCO ANTI-SPAM: Lo Step 1 contiene un link http/https. Rimuovilo prima di inviare.');
    process.exit(1);
  }

  const host = process.env.OUTBOUND_SMTP_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.OUTBOUND_SMTP_PORT || process.env.SMTP_PORT || 587);
  const user = process.env.OUTBOUND_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.OUTBOUND_SMTP_PASS || process.env.SMTP_PASS;
  const fromName = (process.env.OUTBOUND_FROM_NAME || 'Riccardo Granza - TechPyre Studio').replace(/[\u2013\u2014\u00b7]/g, '-');

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

  const subject = (stepNumber === 1 ? cleanSubject : `Re: ${cleanSubject.replace(/^Re:\s*/i, '')}`).replace(/[\u2013\u2014\u00b7]/g, '-');
  const text = (
    stepNumber === 2
      ? step2Body
      : stepNumber === 3
      ? step3Body
      : stepNumber === 4
      ? step4Body
      : step1Body
  ).replace(/[\u2013\u2014\u00b7]/g, '-');

  const formatMsgId = (id) => {
    if (!id) return null;
    const t = String(id).trim();
    if (!t) return null;
    return t.startsWith('<') && t.endsWith('>') ? t : `<${t.replace(/^<+|>+$/g, '')}>`;
  };

  let parentMessageId = formatMsgId(lead.meta.lastSentMessageId);
  const existingRefs = Array.isArray(lead.meta.threadMessageIds)
    ? lead.meta.threadMessageIds.map(formatMsgId).filter(Boolean)
    : [];
  if (parentMessageId && !existingRefs.includes(parentMessageId)) {
    existingRefs.push(parentMessageId);
  }
  const referencesHeader = existingRefs.join(' ');

  const mailOptions = {
    from: { name: fromName, address: user },
    replyTo: user,
    to: lead.meta.targetEmail,
    subject,
    text,
    textEncoding: 'base64',
  };

  if (stepNumber > 1 && parentMessageId) {
    mailOptions.inReplyTo = parentMessageId;
    mailOptions.references = referencesHeader || parentMessageId;
    mailOptions.headers = {
      'In-Reply-To': parentMessageId,
      References: referencesHeader || parentMessageId,
    };
  }

  const info = await transporter.sendMail(mailOptions);
  const sentMessageId = formatMsgId(info.messageId) || `<${Date.now()}.${lead.slug}@techpyre.eu>`;

  try {
    const encodeMimeHeader = (val) =>
      /^[\x20-\x7E]*$/.test(val)
        ? val
        : `=?UTF-8?B?${Buffer.from(val, 'utf8').toString('base64')}?=`;
    const encodedFrom = /^[\x20-\x7E]*$/.test(fromName)
      ? `"${fromName.replace(/"/g, '')}"`
      : encodeMimeHeader(fromName);
    const b64Body = Buffer.from(text.replace(/\r?\n/g, '\r\n'), 'utf8')
      .toString('base64')
      .replace(/(.{76})/g, '$1\r\n');

    const rawHeaders = [
      `From: ${encodedFrom} <${user}>`,
      `To: ${lead.meta.targetEmail}`,
      `Subject: ${encodeMimeHeader(subject)}`,
      `Date: ${new Date().toUTCString()}`,
      `Message-ID: ${sentMessageId}`,
    ];
    if (stepNumber > 1 && parentMessageId) {
      rawHeaders.push(`In-Reply-To: ${parentMessageId}`);
      rawHeaders.push(`References: ${referencesHeader || parentMessageId}`);
    }
    rawHeaders.push(
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset="utf-8"`,
      `Content-Transfer-Encoding: base64`,
      ``,
      b64Body
    );
    await appendToArubaSent(user, pass, rawHeaders.join('\r\n'));
  } catch {
    // ignora se timeout
  }

  lead.meta.lastSentMessageId = sentMessageId;
  lead.meta.threadMessageIds = Array.from(new Set([...existingRefs, sentMessageId]));
  lead.meta.status = `CONTACTED_STEP_${stepNumber}`;
  fs.writeFileSync(leadPath, JSON.stringify(lead, null, 2) + '\n', 'utf-8');

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
    type: stepNumber === 1 ? 'INITIAL' : `STEP_${stepNumber}`,
    stepNumber,
    subject,
    messageId: info.messageId,
    sentAt: new Date().toISOString(),
    requiresFollowUpCall: stepNumber === 3,
  };

  history.push(logEntry);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf-8');
  fs.writeFileSync(path.join(outDir, 'last-send.json'), JSON.stringify(logEntry, null, 2), 'utf-8');

  console.log(`\n🚀 Email (STEP ${stepNumber}) inviata con successo! MessageId: ${info.messageId}`);
}
