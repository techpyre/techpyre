#!/usr/bin/env node
/**
 * TECHPYRE STUDIO · MOTORE DI SINCRONIZZAZIONE EXCEL/OUTBOUND -> NOTION CRM (`sync-notion-crm.mjs`)
 * Sincronizza in modo idempotente i dati raccolti da `collectCrmSnapshot()` verso i 3 database Notion:
 *   1. Report Giornalieri & KPI
 *   2. Pipeline Lead & Demo (CRM)
 *   3. Storico Invii SMTP (Log)
 * Usa esclusivamente `fetch` nativo verso Notion REST API (`2022-06-28`), caching locale su hash
 * (`src/data/notion-sync-state.json`) e throttling sicuro anti-429.
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  collectCrmSnapshot,
  normalizeExternalUrl,
  toRomeIsoDate,
} from "./crm-snapshot.mjs";

export const NOTION_API_BASE = "https://api.notion.com/v1";
export const NOTION_API_VERSION = "2022-06-28";

export const DEFAULT_NOTION_CRM_HUB_URL =
  "https://www.notion.so/42279614e8e3810a9149eb9158457297";
export const DEFAULT_NOTION_REPORTS_DB_ID = "42279614e8e38194b2f8fd5526ba779f";
export const DEFAULT_NOTION_LEADS_DB_ID = "42279614e8e3811799cbf61aadd6f30a";
export const DEFAULT_NOTION_HISTORY_DB_ID = "42279614e8e38159b10ed07458f62c27";

const DEFAULT_GDRIVE_URL =
  "https://docs.google.com/spreadsheets/d/12rHG46b8sG64BTFQA1gMWNPfBfXBekMD/edit";

export function loadEnvLocal(rootDir = process.cwd()) {
  const envPath = path.join(rootDir, ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx <= 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed
      .slice(eqIdx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

/**
 * @param {Record<string, string | undefined>} [env]
 */
export function resolveNotionConfig(env = process.env) {
  const token = String(
    env.NOTION_TOKEN || env.NOTION_API_KEY || env.NOTION_INTERNAL_TOKEN || ""
  ).trim();
  const reportsDbId = String(
    env.NOTION_CRM_REPORTS_DB_ID || DEFAULT_NOTION_REPORTS_DB_ID
  ).trim();
  const leadsDbId = String(
    env.NOTION_CRM_LEADS_DB_ID || DEFAULT_NOTION_LEADS_DB_ID
  ).trim();
  const historyDbId = String(
    env.NOTION_CRM_HISTORY_DB_ID || DEFAULT_NOTION_HISTORY_DB_ID
  ).trim();
  const hubUrl = String(
    env.NOTION_CRM_HUB_URL || DEFAULT_NOTION_CRM_HUB_URL
  ).trim();

  return {
    configured: Boolean(token),
    token,
    reportsDbId,
    leadsDbId,
    historyDbId,
    hubUrl,
  };
}

function richTextValue(text) {
  const clean = String(text ?? "").slice(0, 1900);
  if (!clean) return [];
  return [{ type: "text", text: { content: clean } }];
}

function titleValue(text) {
  const clean = String(text || "Senza titolo").slice(0, 1900);
  return [{ type: "text", text: { content: clean } }];
}

function dateValue(isoOrDate) {
  if (!isoOrDate) return null;
  const isoDay = String(isoOrDate).length === 10
    ? String(isoOrDate)
    : toRomeIsoDate(isoOrDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDay)) return null;
  return { start: isoDay };
}

export function computeRecordHash(payload) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex")
    .slice(0, 16);
}

export function buildReportNotionProperties(dayReport, snapshotKpis, options = {}) {
  const gdriveUrl = options.googleDriveUrl || DEFAULT_GDRIVE_URL;
  const synced = options.googleDriveSynced !== false;
  const noteParts = [
    `LCP medio ${snapshotKpis.avgLcp}s (CWV ${snapshotKpis.avgMobileScore}/100)`,
    `${snapshotKpis.adsAndHighLcpCount} lead Ads + LCP>=5s`,
    `${snapshotKpis.totalHistoryEntries} invii storici SMTP`,
  ];

  return {
    "Data Esecuzione": { title: titleValue(`${dayReport.date} · Report Giornaliero`) },
    "Data (ISO)": { date: dateValue(dayReport.date) },
    "Step 1 Inviati": { number: Number(dayReport.step1 || 0) },
    "Step 2 Inviati": { number: Number(dayReport.step2 || 0) },
    "Step 3 Inviati": { number: Number(dayReport.step3 || 0) },
    "Step 4 Inviati": { number: Number(dayReport.step4 || 0) },
    "Totale Giorno": { number: Number(dayReport.total || 0) },
    "Totale Aziende DB": { number: Number(snapshotKpis.totalLeads || 0) },
    "Hot Lead Attivi": { number: Number(snapshotKpis.hotLeads || 0) },
    "Pronte (NEW)": { number: Number(snapshotKpis.newCount || 0) },
    "Scarti / Blacklist": { number: Number(snapshotKpis.blockedTotal || 0) },
    "Stato Sync": {
      select: {
        name: synced
          ? "[OK] Sincronizzato Excel + Drive"
          : "[ATTESA] Solo Locale",
      },
    },
    "Workbook Excel Drive": { url: normalizeExternalUrl(gdriveUrl) },
    "Note / KPI Funnel": { rich_text: richTextValue(noteParts.join(" · ")) },
  };
}

export function buildLeadNotionProperties(lead) {
  const props = {
    "Azienda B2B": { title: titleValue(lead.companyName || lead.slug) },
    Slug: { rich_text: richTextValue(lead.slug) },
    "Stato Sequenza": { status: { name: lead.statusMeta.notionOption } },
    "Priorità Azione": { select: { name: lead.statusMeta.priorityLabel } },
    Città: { rich_text: richTextValue(lead.city || "-") },
    "Titolare / Referente": {
      rich_text: richTextValue(lead.decisionMakerName || "-"),
    },
    Ruolo: { rich_text: richTextValue(lead.decisionMakerRole || "-") },
    "Email Destinatario": {
      email:
        lead.targetEmail && lead.targetEmail.includes("@")
          ? lead.targetEmail
          : null,
    },
    "Score Email": { number: Number(lead.emailScore || 0) },
    "Telefono / WhatsApp": {
      phone_number:
        lead.phone && lead.phone !== "-" ? String(lead.phone).slice(0, 40) : null,
    },
    "LCP Mobile (s)": { number: Number(lead.lcpSeconds || 0) },
    "Fascia LCP": { select: { name: lead.lcpBand } },
    "Score CWV": { number: Number(lead.mobileScore || 0) },
    "Stato Ads": { select: { name: lead.adsBadge } },
    "Segnali Pixel Rilevati": {
      rich_text: richTextValue(lead.trackingSignals || "Nessuno"),
    },
    "Visite Demo Reali": { number: Number(lead.realVisitsCount || 0) },
    "Data Step 1": { date: dateValue(lead.step1SentAt) },
    "Data Step 2": { date: dateValue(lead.step2SentAt) },
    "Ultimo Contatto": { date: dateValue(lead.lastSentAt) },
    "Demo Live 0.3s": { url: normalizeExternalUrl(lead.demoUrl) },
    "Sito Aziendale": { url: normalizeExternalUrl(lead.originalLandingUrl) },
    "P.IVA": { rich_text: richTextValue(lead.vatNumber || "-") },
    "Message-ID SMTP": {
      rich_text: richTextValue(lead.lastSentMessageId || "-"),
    },
  };
  return props;
}

/**
 * @param {any} entry
 * @param {string | null} [leadPageId]
 */
export function buildHistoryNotionProperties(entry, leadPageId = null) {
  const shortDate = entry.sentAt ? toRomeIsoDate(entry.sentAt) : "n/d";
  const baseProps = {
    "Invio SMTP": {
      title: titleValue(`[${entry.stepLabel}] ${entry.companyName} · ${shortDate}`),
    },
    "Entry Key": { rich_text: richTextValue(entry.entryKey) },
    Slug: { rich_text: richTextValue(entry.slug) },
    Step: { select: { name: entry.stepLabel } },
    "Data Invio": { date: dateValue(entry.sentAt) },
    Destinatario: {
      email:
        entry.recipient && entry.recipient.includes("@")
          ? entry.recipient
          : null,
    },
    "Oggetto Email": { rich_text: richTextValue(entry.subject) },
    "Message-ID SMTP": { rich_text: richTextValue(entry.messageId) },
    Operatore: { rich_text: richTextValue(entry.sentBy) },
  };
  /** @type {typeof baseProps & { "Lead Collegato"?: { relation: Array<{ id: string }> } }} */
  const props = baseProps;
  if (leadPageId) {
    props["Lead Collegato"] = { relation: [{ id: leadPageId }] };
  }
  return props;
}

function extractPlainTextProperty(page, propName) {
  const prop = page?.properties?.[propName];
  if (!prop) return "";
  if (prop.type === "title") {
    return (prop.title || []).map((t) => t.plain_text || "").join("").trim();
  }
  if (prop.type === "rich_text") {
    return (prop.rich_text || []).map((t) => t.plain_text || "").join("").trim();
  }
  if (prop.type === "date") {
    return prop.date?.start || "";
  }
  return "";
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function notionFetch(token, endpoint, init = {}, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(`${NOTION_API_BASE}${endpoint}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_API_VERSION,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
      signal: AbortSignal.timeout(20000),
    });

    if (res.status === 429 && attempt < retries) {
      const retrySec = Number(res.headers.get("retry-after") || "2");
      await sleep(Math.max(1000, retrySec * 1000));
      continue;
    }

    if (res.status >= 500 && attempt < retries) {
      await sleep(1000 * (attempt + 1));
      continue;
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Notion API ${res.status} (${endpoint}): ${errText.slice(0, 300)}`);
    }

    return res.json();
  }
  throw new Error(`Notion API timeout (${endpoint})`);
}

async function fetchDatabaseIndex(token, databaseId, keyPropName) {
  const index = new Map();
  let startCursor = undefined;
  let hasMore = true;

  while (hasMore) {
    const body = { page_size: 100 };
    if (startCursor) body.start_cursor = startCursor;
    const data = await notionFetch(token, `/databases/${databaseId}/query`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    for (const page of data.results || []) {
      const k = extractPlainTextProperty(page, keyPropName);
      if (k) index.set(k, page.id);
    }
    hasMore = Boolean(data.has_more && data.next_cursor);
    startCursor = data.next_cursor;
    if (hasMore) await sleep(220);
  }

  return index;
}

function loadSyncState(statePath) {
  try {
    if (!fs.existsSync(statePath)) {
      return { reports: {}, leads: {}, history: {} };
    }
    const raw = JSON.parse(fs.readFileSync(statePath, "utf8"));
    return {
      reports: raw.reports || {},
      leads: raw.leads || {},
      history: raw.history || {},
    };
  } catch {
    return { reports: {}, leads: {}, history: {} };
  }
}

function saveSyncState(statePath, state) {
  try {
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + "\n", "utf8");
  } catch {
    // Non-blocking in read-only environments
  }
}

async function upsertRows({
  token,
  databaseId,
  items,
  keyPropName,
  stateBucket,
  buildProps,
  dryRun,
}) {
  let remoteIndex = null;
  const stats = { created: 0, updated: 0, skipped: 0, errors: 0 };

  // Verifica se mancano chiavi nella cache locale; se sì, indicizza Notion una sola volta
  const missingFromCache = items.some((item) => !stateBucket[item.key]?.pageId);
  if (missingFromCache && !dryRun) {
    remoteIndex = await fetchDatabaseIndex(token, databaseId, keyPropName);
    for (const item of items) {
      const existingId = remoteIndex.get(item.key);
      if (existingId && !stateBucket[item.key]) {
        stateBucket[item.key] = { pageId: existingId, hash: "" };
      }
    }
  }

  for (const item of items) {
    const props = buildProps(item.value);
    const hash = computeRecordHash(props);
    const cached = stateBucket[item.key];

    if (cached?.pageId && cached?.hash === hash) {
      stats.skipped += 1;
      continue;
    }

    if (dryRun) {
      if (cached?.pageId) stats.updated += 1;
      else stats.created += 1;
      continue;
    }

    try {
      if (cached?.pageId) {
        await notionFetch(token, `/pages/${cached.pageId}`, {
          method: "PATCH",
          body: JSON.stringify({ properties: props }),
        });
        stateBucket[item.key] = { pageId: cached.pageId, hash };
        stats.updated += 1;
      } else {
        const created = await notionFetch(token, `/pages`, {
          method: "POST",
          body: JSON.stringify({
            parent: { database_id: databaseId },
            properties: props,
          }),
        });
        stateBucket[item.key] = { pageId: created.id, hash };
        stats.created += 1;
      }
      await sleep(340);
    } catch (err) {
      stats.errors += 1;
      console.warn(`  [Notion Sync WARN] (${item.key}): ${err.message}`);
    }
  }

  return stats;
}

export async function syncNotionCrm(snapshotInput, options = {}) {
  const rootDir = options.rootDir || process.cwd();
  loadEnvLocal(rootDir);

  const cfg = resolveNotionConfig(process.env);
  if (!cfg.configured) {
    return {
      synced: false,
      reason: "NOTION_TOKEN non configurato in .env.local",
      hubUrl: cfg.hubUrl,
      reports: { created: 0, updated: 0, skipped: 0, errors: 0 },
      leads: { created: 0, updated: 0, skipped: 0, errors: 0 },
      history: { created: 0, updated: 0, skipped: 0, errors: 0 },
    };
  }

  const snapshot = snapshotInput || (await collectCrmSnapshot({ rootDir }));
  const statePath =
    options.statePath || path.join(rootDir, "src", "data", "notion-sync-state.json");
  const state = loadSyncState(statePath);
  const dryRun = Boolean(options.dryRun);
  const fullHistory = Boolean(options.fullHistory);
  const historyLimit = fullHistory
    ? snapshot.historyEntries.length
    : Number(options.historyLimit || 250);

  const reportItems = snapshot.dailyReports.map((d) => ({
    key: d.date,
    value: d,
  }));
  const reportStats = await upsertRows({
    token: cfg.token,
    databaseId: cfg.reportsDbId,
    items: reportItems,
    keyPropName: "Data (ISO)",
    stateBucket: state.reports,
    buildProps: (d) =>
      buildReportNotionProperties(d, snapshot.kpis, {
        googleDriveUrl: options.googleDriveUrl || DEFAULT_GDRIVE_URL,
        googleDriveSynced: options.googleDriveSynced !== false,
      }),
    dryRun,
  });

  const leadItems = snapshot.leads.map((l) => ({
    key: l.slug,
    value: l,
  }));
  const leadStats = await upsertRows({
    token: cfg.token,
    databaseId: cfg.leadsDbId,
    items: leadItems,
    keyPropName: "Slug",
    stateBucket: state.leads,
    buildProps: (l) => buildLeadNotionProperties(l),
    dryRun,
  });

  const slicedHistory = snapshot.historyEntries.slice(0, historyLimit);
  const historyItems = slicedHistory.map((h) => ({
    key: h.entryKey,
    value: h,
  }));
  const historyStats = await upsertRows({
    token: cfg.token,
    databaseId: cfg.historyDbId,
    items: historyItems,
    keyPropName: "Entry Key",
    stateBucket: state.history,
    buildProps: (h) =>
      buildHistoryNotionProperties(h, state.leads[h.slug]?.pageId || null),
    dryRun,
  });

  if (!dryRun) {
    state.lastSyncedAt = new Date().toISOString();
    saveSyncState(statePath, state);
  }

  return {
    synced: !dryRun,
    dryRun,
    hubUrl: cfg.hubUrl,
    reports: reportStats,
    leads: leadStats,
    history: historyStats,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const fullHistory = args.includes("--full");
  syncNotionCrm(null, { dryRun, fullHistory })
    .then((res) => {
      console.log("Notion CRM sync result:", JSON.stringify(res, null, 2));
    })
    .catch((err) => {
      console.error("Errore sync Notion CRM:", err.message);
      process.exit(1);
    });
}
