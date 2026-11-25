#!/usr/bin/env node
/**
 * TECHPYRE STUDIO · SHARED CRM SNAPSHOT & ACCESSIBILITY FORMATTER (`crm-snapshot.mjs`)
 * Fonte unica condivisa da Excel CRM (`export-excel-crm.mjs`) e Notion Sync (`sync-notion-crm.mjs`).
 * Nessuna duplicazione di logica di stato, aggregazioni giornaliere o etichette WCAG 1.4.1.
 */
import fs from "fs";
import path from "path";

const STATUS_META = {
  HOT_LEAD: {
    notionOption: "[HOT] Risposta / Trattativa",
    excelLabel: "[HOT] IN TRATTATIVA",
    excelBg: "FFDCFCE7",
    excelFg: "FF14532D",
    priorityLabel: "[P1] Rispondere / Gestire Oggi",
    priorityRank: 1,
    sortRank: 1,
  },
  CONTACTED_STEP_3: {
    notionOption: "[STEP 3] WhatsApp Async",
    excelLabel: "[STEP 3] WHATSAPP ASYNC",
    excelBg: "FFFFEDD5",
    excelFg: "FF7C2D12",
    priorityLabel: "[P2] Follow-Up Maturo",
    priorityRank: 2,
    sortRank: 2,
  },
  CONTACTED_STEP_2: {
    notionOption: "[STEP 2] Demo Inviata",
    excelLabel: "[STEP 2] DEMO INVIATA",
    excelBg: "FFDBEAFE",
    excelFg: "FF1E3A8A",
    priorityLabel: "[P2] Follow-Up Maturo",
    priorityRank: 2,
    sortRank: 3,
  },
  CONTACTED_STEP_1: {
    notionOption: "[STEP 1] Primo Contatto",
    excelLabel: "[STEP 1] PRIMO CONTATTO",
    excelBg: "FFFEF3C7",
    excelFg: "FF78350F",
    priorityLabel: "[P2] Follow-Up Maturo",
    priorityRank: 2,
    sortRank: 4,
  },
  NEW: {
    notionOption: "[NEW] Pronta per Invio",
    excelLabel: "[NEW] PRONTA INVIO",
    excelBg: "FFE2E8F0",
    excelFg: "FF0F172A",
    priorityLabel: "[P3] Coda Invio Step 1",
    priorityRank: 3,
    sortRank: 5,
  },
  MANUAL_LINKEDIN_QUEUE: {
    notionOption: "[LINKEDIN] Coda Manuale",
    excelLabel: "[LINKEDIN] CODA MANUALE",
    excelBg: "FFF3E8FF",
    excelFg: "FF581C87",
    priorityLabel: "[P2] Follow-Up Maturo",
    priorityRank: 2,
    sortRank: 6,
  },
  CONTACTED_STEP_4: {
    notionOption: "[STEP 4] Ciclo Chiuso",
    excelLabel: "[STEP 4] CICLO CHIUSO",
    excelBg: "FFF1F5F9",
    excelFg: "FF334155",
    priorityLabel: "[P4] Archiviato / Chiuso",
    priorityRank: 4,
    sortRank: 7,
  },
  INVALID_TICKET_INBOX: {
    notionOption: "[SCARTO] Ticketing / MX Ko",
    excelLabel: "[SCARTO] TICKET / MX KO",
    excelBg: "FFFEE2E2",
    excelFg: "FF7F1D1D",
    priorityLabel: "[P4] Archiviato / Chiuso",
    priorityRank: 4,
    sortRank: 8,
  },
  BLACKLISTED: {
    notionOption: "[STOP] Blacklisted / Delega",
    excelLabel: "[STOP] BLACKLIST / DELEGA",
    excelBg: "FFFEE2E2",
    excelFg: "FF7F1D1D",
    priorityLabel: "[P4] Archiviato / Chiuso",
    priorityRank: 4,
    sortRank: 9,
  },
};

export function resolveHistoryStepNumber(entry) {
  if (
    entry &&
    typeof entry.stepNumber === "number" &&
    entry.stepNumber >= 1 &&
    entry.stepNumber <= 4
  ) {
    return entry.stepNumber;
  }
  const rawType = String(entry?.type || "").toUpperCase();
  if (rawType === "STEP_4" || rawType.includes("BREAKUP")) return 4;
  if (rawType === "STEP_3" || rawType.includes("VALUE") || rawType.includes("PHONE")) return 3;
  if (
    rawType === "STEP_2" ||
    rawType === "FOLLOW_UP" ||
    rawType === "FOLLOW_UP_CREDENTIALS_AND_OFFER"
  ) {
    return 2;
  }
  return 1;
}

export function isInternalAuditUserAgent(userAgent) {
  const ua = String(userAgent || "").toLowerCase();
  return /techpyreaudit|headless|antigravity|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|bot|crawler|spider/i.test(
    ua
  );
}

export function deriveLeadStatusFromHistory(explicitStatus, sentStepsSet) {
  if (
    explicitStatus === "HOT_LEAD" ||
    explicitStatus === "BLACKLISTED" ||
    explicitStatus === "INVALID_TICKET_INBOX" ||
    explicitStatus === "MANUAL_LINKEDIN_QUEUE"
  ) {
    return explicitStatus;
  }
  const highestStep =
    sentStepsSet && sentStepsSet.size > 0 ? Math.max(...sentStepsSet) : 0;
  if (highestStep >= 4) return "CONTACTED_STEP_4";
  if (highestStep === 3) return "CONTACTED_STEP_3";
  if (highestStep === 2) return "CONTACTED_STEP_2";
  if (highestStep === 1) return "CONTACTED_STEP_1";
  return explicitStatus && STATUS_META[explicitStatus] ? explicitStatus : "NEW";
}

export function getAccessibleStatusMeta(status) {
  return (
    STATUS_META[status] || {
      notionOption: `[ALTRO] ${status || "NEW"}`,
      excelLabel: `[ALTRO] ${status || "NEW"}`,
      excelBg: "FFF1F5F9",
      excelFg: "FF0F172A",
      priorityLabel: "[P3] Coda Invio Step 1",
      priorityRank: 3,
      sortRank: 9,
    }
  );
}

export function formatLcpBand(lcpSeconds) {
  const val = Number(lcpSeconds || 0);
  if (val >= 8.0) return "[CRITICA] >= 8.0s";
  if (val >= 5.0) return "[ALTA] 5.0s - 7.9s";
  return "[MEDIA] < 5.0s";
}

export function formatAdsBadge(runsAds) {
  return runsAds ? "[ADS] Attivi" : "[ORGANICO] No Pixel";
}

export function normalizeExternalUrl(rawUrl) {
  const s = String(rawUrl || "").trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  return null;
}

export function formatRomeDateTime(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("it-IT", {
      timeZone: "Europe/Rome",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(iso).slice(0, 16);
  }
}

export function toRomeIsoDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
  } catch {
    return String(iso).slice(0, 10);
  }
}

async function readJsonSafe(filePath, fallback) {
  try {
    const text = await fs.promises.readFile(filePath, "utf8");
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function collectCrmSnapshot(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const leadsDir = options.leadsDir || path.join(rootDir, "src", "data", "leads");
  const historyPath =
    options.historyPath || path.join(rootDir, "src", "data", "outreach-history.json");
  const visitsPath =
    options.visitsPath || path.join(rootDir, "src", "data", "demo-visits.json");

  const [historyRaw, visitsRaw] = await Promise.all([
    readJsonSafe(historyPath, []),
    readJsonSafe(visitsPath, {}),
  ]);

  const history = Array.isArray(historyRaw) ? historyRaw : [];
  const visitsMap = visitsRaw && typeof visitsRaw === "object" ? visitsRaw : {};

  // Aggrega progressi SMTP e statistiche giornaliere (Europe/Rome)
  const slugProgressMap = new Map();
  const dailyMap = new Map();

  for (const h of history) {
    const step = resolveHistoryStepNumber(h);
    const ts = h.sentAt || "";
    const slug = h.slug || "";

    if (slug) {
      let prog = slugProgressMap.get(slug);
      if (!prog) {
        prog = {
          sentSteps: new Set(),
          step1At: "",
          step2At: "",
          step3At: "",
          step4At: "",
          lastSentAt: "",
          count: 0,
        };
        slugProgressMap.set(slug, prog);
      }
      prog.sentSteps.add(step);
      prog.count += 1;
      if (ts) {
        if (step === 1 && (!prog.step1At || ts < prog.step1At)) prog.step1At = ts;
        if (step === 2 && (!prog.step2At || ts > prog.step2At)) prog.step2At = ts;
        if (step === 3 && (!prog.step3At || ts > prog.step3At)) prog.step3At = ts;
        if (step === 4 && (!prog.step4At || ts > prog.step4At)) prog.step4At = ts;
        if (!prog.lastSentAt || ts > prog.lastSentAt) prog.lastSentAt = ts;
      }
    }

    if (ts) {
      const dayKey = toRomeDateSafe(ts);
      const cur = dailyMap.get(dayKey) || {
        date: dayKey,
        step1: 0,
        step2: 0,
        step3: 0,
        step4: 0,
        step2Plus: 0,
        total: 0,
      };
      if (step === 1) cur.step1 += 1;
      else if (step === 2) {
        cur.step2 += 1;
        cur.step2Plus += 1;
      } else if (step === 3) {
        cur.step3 += 1;
        cur.step2Plus += 1;
      } else {
        cur.step4 += 1;
        cur.step2Plus += 1;
      }
      cur.total += 1;
      dailyMap.set(dayKey, cur);
    }
  }

  let fileNames = [];
  try {
    fileNames = (await fs.promises.readdir(leadsDir)).filter(
      (f) =>
        f.endsWith(".json") &&
        f !== "outreach-history.json" &&
        f !== "demo-visits.json"
    );
  } catch {
    fileNames = [];
  }

  // Legge tutti i file lead in chunk concorrenti (evita picchi file-descriptor e accelera I/O su macOS)
  const leads = [];
  const CHUNK_SIZE = 64;
  for (let i = 0; i < fileNames.length; i += CHUNK_SIZE) {
    const chunk = fileNames.slice(i, i + CHUNK_SIZE);
    const parsedChunk = await Promise.all(
      chunk.map((f) => readJsonSafe(path.join(leadsDir, f), null))
    );

    for (let j = 0; j < parsedChunk.length; j++) {
      const raw = parsedChunk[j];
      if (!raw) continue;
      const f = chunk[j];
      const slug = raw.slug || f.replace(/\.json$/, "");
      const prog = slugProgressMap.get(slug);
      const status = deriveLeadStatusFromHistory(raw.meta?.status, prog?.sentSteps);
      const statusMeta = getAccessibleStatusMeta(status);
      const lcpSeconds = Number(raw.audit?.originalLcpSeconds ?? 0);
      const mobileScore = Number(raw.audit?.mobileScore ?? 0);
      const runsAds = Boolean(raw.audit?.runsAds);

      // Visite reali escludendo user-agent bot/headless legacy in demo-visits.json
      const visitRecord = visitsMap[slug];
      const realVisitsCount = Array.isArray(visitRecord?.visits)
        ? visitRecord.visits.filter((v) => !isInternalAuditUserAgent(v.userAgent)).length
        : 0;

      leads.push({
        slug,
        companyName: String(raw.meta?.companyName || slug).trim(),
        city: String(raw.meta?.city || "-").trim(),
        vatNumber: String(raw.meta?.vatNumber || "-").trim(),
        decisionMakerName: String(raw.meta?.decisionMakerName || "-").trim(),
        decisionMakerRole: String(raw.meta?.decisionMakerRole || "-").trim(),
        targetEmail: String(raw.meta?.targetEmail || "").trim(),
        emailScore: Number(raw.meta?.emailScore ?? 0),
        isGenericInbox: Boolean(raw.meta?.isGenericInbox),
        phone: String(raw.meta?.phone || "").trim(),
        originalLandingUrl: String(raw.meta?.originalLandingUrl || "").trim(),
        demoUrl: `https://www.techpyre.eu/demo/${slug}`,
        lcpSeconds,
        lcpBand: formatLcpBand(lcpSeconds),
        mobileScore,
        renderBlockingCount: Number(raw.audit?.renderBlockingCount ?? 0),
        runsAds,
        adsBadge: formatAdsBadge(runsAds),
        trackingSignals:
          Array.isArray(raw.audit?.detectedTrackingSignals) &&
          raw.audit.detectedTrackingSignals.length > 0
            ? raw.audit.detectedTrackingSignals.join(", ")
            : "Nessuno",
        status,
        statusMeta,
        step1SentAt: prog?.step1At || "",
        step2SentAt: prog?.step2At || "",
        lastSentAt: prog?.lastSentAt || "",
        sentStepsCount: prog?.count || 0,
        lastSentMessageId: String(raw.meta?.lastSentMessageId || "").trim(),
        realVisitsCount,
      });
    }
  }

  leads.sort((a, b) => {
    if (a.statusMeta.sortRank !== b.statusMeta.sortRank) {
      return a.statusMeta.sortRank - b.statusMeta.sortRank;
    }
    const timeCmp = (b.lastSentAt || "").localeCompare(a.lastSentAt || "");
    if (timeCmp !== 0) return timeCmp;
    return (b.lcpSeconds || 0) - (a.lcpSeconds || 0);
  });

  const dailyReports = Array.from(dailyMap.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const historyEntries = [...history]
    .sort((a, b) => (b.sentAt || "").localeCompare(a.sentAt || ""))
    .map((h, idx) => {
      const stepNum = resolveHistoryStepNumber(h);
      const sentAt = String(h.sentAt || "");
      const messageId = String(h.messageId || "").trim();
      const slug = String(h.slug || "").trim();
      return {
        entryKey: messageId || `${slug}::${stepNum}::${sentAt}::${idx}`,
        sentAt,
        sentAtRome: formatRomeDateTime(sentAt),
        stepNumber: stepNum,
        stepLabel: `STEP ${stepNum}`,
        slug,
        companyName: String(h.companyName || slug || "-").trim(),
        recipient: String(h.recipient || "").trim(),
        subject: String(h.subject || "-").trim(),
        messageId: messageId || "-",
        sentBy: String(h.sentBy || "Automazione Giornaliera").trim(),
      };
    });

  const countByStatus = (st) => leads.filter((l) => l.status === st).length;
  const lcpValid = leads.filter((l) => Number.isFinite(l.lcpSeconds) && l.lcpSeconds > 0);
  const scoreValid = leads.filter((l) => Number.isFinite(l.mobileScore) && l.mobileScore > 0);
  const avgLcp =
    lcpValid.length > 0
      ? Number(
          (lcpValid.reduce((acc, l) => acc + l.lcpSeconds, 0) / lcpValid.length).toFixed(2)
        )
      : 0;
  const avgMobileScore =
    scoreValid.length > 0
      ? Math.round(
          scoreValid.reduce((acc, l) => acc + l.mobileScore, 0) / scoreValid.length
        )
      : 0;

  const adsActiveCount = leads.filter((l) => l.runsAds).length;
  const highLcpCount = leads.filter((l) => l.lcpSeconds >= 5.0).length;
  const adsAndHighLcpCount = leads.filter((l) => l.runsAds && l.lcpSeconds >= 5.0).length;
  const realVisitedLeads = leads.filter((l) => l.realVisitsCount > 0).length;

  const now = new Date();
  return {
    generatedAtIso: now.toISOString(),
    generatedAtRome: formatRomeDateTime(now.toISOString()),
    kpis: {
      totalLeads: leads.length,
      hotLeads: countByStatus("HOT_LEAD"),
      step1Count: countByStatus("CONTACTED_STEP_1"),
      step2Count: countByStatus("CONTACTED_STEP_2"),
      step3Count: countByStatus("CONTACTED_STEP_3"),
      step4Count: countByStatus("CONTACTED_STEP_4"),
      newCount: countByStatus("NEW"),
      manualLinkedInCount: countByStatus("MANUAL_LINKEDIN_QUEUE"),
      invalidCount: countByStatus("INVALID_TICKET_INBOX"),
      blacklistedCount: countByStatus("BLACKLISTED"),
      blockedTotal:
        countByStatus("INVALID_TICKET_INBOX") + countByStatus("BLACKLISTED"),
      adsActiveCount,
      highLcpCount,
      adsAndHighLcpCount,
      avgLcp,
      avgMobileScore,
      realVisitedLeads,
      totalHistoryEntries: historyEntries.length,
      activeDaysCount: dailyReports.length,
    },
    leads,
    dailyReports,
    historyEntries,
  };
}

function toRomeDateSafe(iso) {
  return toRomeIsoDate(iso) || String(iso).slice(0, 10);
}
