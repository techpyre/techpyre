#!/usr/bin/env node
/**
 * =====================================================================
 * TechPYRE Outbound Engine - Email & DM Drafter MCP Server (Stdio)
 * Zero external MCP SDK dependencies required (pure JSON-RPC 2.0 over stdio).
 * =====================================================================
 */
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const LEADS_DATA_DIR = path.join(process.cwd(), 'src', 'data', 'leads');
const PUBLIC_LEADS_DIR = path.join(process.cwd(), 'public', 'leads');
const BASE_DEMO_URL = process.env.NEXT_PUBLIC_DEMO_DOMAIN || 'https://techpyre.eu';

function loadLeadConfig(slug) {
  const filePath = path.join(LEADS_DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File lead non trovato: src/data/leads/${slug}.json`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function buildOutreachPackText(lead) {
  const demoUrl = `${BASE_DEMO_URL}/demo/${lead.slug}`;
  const wordCount = lead.outreach.emailPlainTextBody
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const hasLinksInFirstEmail = /https?:\/\//i.test(lead.outreach.emailPlainTextBody);

  return [
    `=====================================================================`,
    `OUTBOUND PACK - ${lead.meta.companyName.toUpperCase()} (${lead.slug})`,
    `=====================================================================`,
    `Titolare / Decision Maker : ${lead.meta.decisionMakerName}`,
    `Email Target              : ${lead.meta.targetEmail}`,
    `Telefono / WhatsApp       : ${lead.meta.phone}`,
    `Città                     : ${lead.meta.city}`,
    `P.IVA                     : ${lead.meta.vatNumber || 'N/D'}`,
    `LCP Sito Attuale          : ${lead.audit.originalLcpSeconds}s (Score Mobile: ${lead.audit.mobileScore}/100)`,
    `URL Demo Live (24/7)      : ${demoUrl}`,
    `Screenshot Comparativi    : public/leads/${lead.slug}/old-site-mobile.png | new-demo-mobile.png`,
    `Check Anti-Spam 1ª Email  : ${wordCount} parole (max 110) | Link presenti: ${hasLinksInFirstEmail ? '⚠️ SÌ (RIMUOVERE!)' : '✅ ZERO LINK'}`,
    ``,
    `---------------------------------------------------------------------`,
    `1. PRIMA EMAIL (Plain-Text, Zero Link - Invia da dominio secondario)`,
    `---------------------------------------------------------------------`,
    `A: ${lead.meta.targetEmail}`,
    `Oggetto: ${lead.outreach.emailSubject}`,
    ``,
    lead.outreach.emailPlainTextBody,
    ``,
    `---------------------------------------------------------------------`,
    `2. FOLLOW-UP EMAIL (Da inviare quando risponde "SÌ" o "LINK")`,
    `---------------------------------------------------------------------`,
    `A: ${lead.meta.targetEmail}`,
    `Oggetto: Re: ${lead.outreach.emailSubject}`,
    ``,
    lead.outreach.followUpWithLinkBody,
    ``,
    `---------------------------------------------------------------------`,
    `3. DM INSTAGRAM / FACEBOOK / WHATSAPP (Attacco a Doppia Tenaglia)`,
    `   Allega: public/leads/${lead.slug}/new-demo-mobile.png`,
    `---------------------------------------------------------------------`,
    `Ciao ${lead.meta.decisionMakerName.replace(/^(?:Ing\.|Dott\.ssa|Dott\.|Arch\.|Geom\.|Sig\.|Avv\.)\s*/i, '').split(/\s+/)[0] || ''}! Ho visto la vostra sponsorizzata "${lead.audit.activeAdHeadline}" attiva su Facebook. Dal telefono la pagina attuale ci mette ${lead.audit.originalLcpSeconds} secondi ad aprirsi, così vi ho preparato al volo una versione istantanea (0.3s) con un simulatore di preventivo per non farvi perdere clic. Ti ho mandato i dettagli via mail, se vuoi provarla dal telefono dimmi pure che ti giro il link di test!`,
    `=====================================================================`,
  ].join('\n');
}

const TOOLS = [
  {
    name: 'list_lead_outreach',
    description: 'Elenca tutti i lead pronti in src/data/leads/ con stato email, LCP e URL demo.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'save_outreach_draft',
    description:
      'Valida le regole anti-spam (max 110 parole, zero link nella prima email) e salva il pacchetto completo Email + DM in public/leads/[slug]/outreach-pack.txt.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Lo slug del lead (es. rossi-fotovoltaico)' },
      },
      required: ['slug'],
    },
  },
];

function handleToolCall(name, args) {
  if (name === 'list_lead_outreach') {
    if (!fs.existsSync(LEADS_DATA_DIR)) return { leads: [] };
    const files = fs.readdirSync(LEADS_DATA_DIR).filter((f) => f.endsWith('.json'));
    const leads = files.map((file) => {
      const data = JSON.parse(fs.readFileSync(path.join(LEADS_DATA_DIR, file), 'utf-8'));
      return {
        slug: data.slug,
        companyName: data.meta.companyName,
        decisionMakerName: data.meta.decisionMakerName,
        targetEmail: data.meta.targetEmail,
        originalLcpSeconds: data.audit.originalLcpSeconds,
        demoUrl: `${BASE_DEMO_URL}/demo/${data.slug}`,
      };
    });
    return { leads };
  }

  if (name === 'save_outreach_draft') {
    const lead = loadLeadConfig(args.slug);
    const outDir = path.join(PUBLIC_LEADS_DIR, lead.slug);
    fs.mkdirSync(outDir, { recursive: true });
    const packText = buildOutreachPackText(lead);
    const outPath = path.join(outDir, 'outreach-pack.txt');
    fs.writeFileSync(outPath, packText, 'utf-8');
    return {
      savedTo: outPath,
      preview: packText,
    };
  }

  throw new Error(`Tool sconosciuto: ${name}`);
}

// JSON-RPC 2.0 loop over stdio
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  let req;
  try {
    req = JSON.parse(line);
  } catch {
    return;
  }

  const { id, method, params } = req;

  try {
    if (method === 'initialize') {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'techpyre-email-drafter-mcp', version: '1.0.0' },
          },
        }) + '\n'
      );
    } else if (method === 'tools/list') {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: { tools: TOOLS },
        }) + '\n'
      );
    } else if (method === 'tools/call') {
      const output = handleToolCall(params.name, params.arguments || {});
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
          },
        }) + '\n'
      );
    } else if (id !== undefined) {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {},
        }) + '\n'
      );
    }
  } catch (err) {
    if (id !== undefined) {
      process.stdout.write(
        JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: -32000, message: err.message },
        }) + '\n'
      );
    }
  }
});
