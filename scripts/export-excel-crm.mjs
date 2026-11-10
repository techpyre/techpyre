#!/usr/bin/env node
/**
 * ============================================================================
 * TECHPYRE STUDIO · GENERATORE EXCEL CRM MULTI-FOGLIO (`export-excel-crm.mjs`)
 * ============================================================================
 * Genera / aggiorna il workbook Excel formattato `TechPyre_Outbound_CRM.xlsx`
 * con 3 fogli:
 *   1. "Dashboard & KPI"        -> Riepilogo generale + tabella esecuzioni giornaliere
 *   2. "Pipeline Lead & Demo"   -> Registro completo di tutte le aziende con link demo cliccabili
 *   3. "Storico Invii SMTP"     -> Log cronologico di tutti gli invii (Step 1..4) con Message-ID
 * ============================================================================
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import ExcelJS from "exceljs";

export const GDRIVE_CRM_FILE_ID =
  process.env.TECHPYRE_GDRIVE_CRM_ID || "12rHG46b8sG64BTFQA1gMWNPfBfXBekMD";
export const GDRIVE_CRM_WEB_URL = `https://docs.google.com/spreadsheets/d/${GDRIVE_CRM_FILE_ID}/edit`;

export function syncExcelToGoogleDrive(localFilePath) {
  const gdriveBinCandidates = [
    "/Users/riccardogranza/.gemini/antigravity/bin/gdrive",
    "gdrive",
  ];
  for (const bin of gdriveBinCandidates) {
    try {
      const res = spawnSync(
        bin,
        ["mutate", "update", GDRIVE_CRM_FILE_ID, localFilePath],
        {
          encoding: "utf-8",
          timeout: 20000,
          env: {
            ...process.env,
            PATH: `/Users/riccardogranza/.gemini/antigravity/bin:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ""}`,
          },
        }
      );
      if (res.status === 0) {
        return {
          synced: true,
          fileId: GDRIVE_CRM_FILE_ID,
          webUrl: GDRIVE_CRM_WEB_URL,
        };
      }
    } catch {
      continue;
    }
  }
  return {
    synced: false,
    fileId: GDRIVE_CRM_FILE_ID,
    webUrl: GDRIVE_CRM_WEB_URL,
  };
}

export async function generateExcelCrm(customOutputPath) {
  const rootDir = process.cwd();
  const leadsDir = path.join(rootDir, "src", "data", "leads");
  const historyPath = path.join(rootDir, "src", "data", "outreach-history.json");
  const outputPath =
    customOutputPath || path.join(rootDir, "TechPyre_Outbound_CRM.xlsx");

  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, "utf8"));
    } catch {
      history = [];
    }
  }

  // Costruiamo mappe per data primo contatto, data Step 2 e ultimo invio per ogni slug
  const step1SentAtMap = new Map();
  const step2SentAtMap = new Map();
  const lastSentAtMap = new Map();
  const sentCountBySlug = new Map();

  for (const h of history) {
    const slug = h.slug;
    if (!slug) continue;
    const step =
      h.stepNumber ||
      (h.type === "STEP_2" ||
      h.type === "FOLLOW_UP" ||
      h.type === "FOLLOW_UP_CREDENTIALS_AND_OFFER"
        ? 2
        : 1);
    const ts = h.sentAt || "";
    if (step === 1 && !step1SentAtMap.has(slug)) {
      step1SentAtMap.set(slug, ts);
    }
    if (step === 2 && !step2SentAtMap.has(slug)) {
      step2SentAtMap.set(slug, ts);
    }
    if (ts) {
      lastSentAtMap.set(slug, ts);
    }
    sentCountBySlug.set(slug, (sentCountBySlug.get(slug) || 0) + 1);
  }

  const files = fs.existsSync(leadsDir)
    ? fs
        .readdirSync(leadsDir)
        .filter(
          (f) =>
            f.endsWith(".json") &&
            f !== "outreach-history.json" &&
            f !== "leads-status.json"
        )
    : [];

  const leads = [];
  for (const f of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(leadsDir, f), "utf8"));
      const slug = raw.slug || f.replace(/\.json$/, "");
      let status = raw.meta?.status || "NEW";
      if (status === "NEW" && step2SentAtMap.has(slug)) {
        status = "CONTACTED_STEP_2";
      } else if (status === "NEW" && step1SentAtMap.has(slug)) {
        status = "CONTACTED_STEP_1";
      }
      leads.push({
        slug,
        companyName: raw.meta?.companyName || slug,
        city: raw.meta?.city || "-",
        vatNumber: raw.meta?.vatNumber || "-",
        decisionMakerName: raw.meta?.decisionMakerName || "-",
        decisionMakerRole: raw.meta?.decisionMakerRole || "-",
        targetEmail: raw.meta?.targetEmail || "-",
        emailScore: raw.meta?.emailScore ?? 0,
        isGenericInbox: Boolean(raw.meta?.isGenericInbox),
        phone: raw.meta?.phone || "-",
        originalLandingUrl: raw.meta?.originalLandingUrl || "-",
        demoUrl: `https://www.techpyre.eu/demo/${slug}`,
        lcpSeconds: raw.audit?.originalLcpSeconds ?? 0,
        mobileScore: raw.audit?.mobileScore ?? 0,
        renderBlockingCount: raw.audit?.renderBlockingCount ?? 0,
        runsAds: Boolean(raw.audit?.runsAds),
        trackingSignals: (raw.audit?.detectedTrackingSignals || []).join(", ") || "Nessuno",
        status,
        step1SentAt: step1SentAtMap.get(slug) || "",
        step2SentAt: step2SentAtMap.get(slug) || "",
        lastSentAt: lastSentAtMap.get(slug) || "",
        lastSentMessageId: raw.meta?.lastSentMessageId || "",
      });
    } catch {
      continue;
    }
  }

  // Ordina lead: prima HOT_LEAD, poi CONTACTED_STEP_2, CONTACTED_STEP_1 (per data più recente), poi NEW, infine INVALID/BLACKLISTED
  const statusPriority = {
    HOT_LEAD: 1,
    CONTACTED_STEP_3: 2,
    CONTACTED_STEP_2: 3,
    CONTACTED_STEP_1: 4,
    NEW: 5,
    INVALID_TICKET_INBOX: 6,
    BLACKLISTED: 7,
  };

  leads.sort((a, b) => {
    const pA = statusPriority[a.status] || 9;
    const pB = statusPriority[b.status] || 9;
    if (pA !== pB) return pA - pB;
    return (b.lastSentAt || "").localeCompare(a.lastSentAt || "");
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TechPyre Studio Outbound Engine";
  workbook.lastModifiedBy = "Riccardo Granza - TechPyre Studio";
  workbook.created = new Date();
  workbook.modified = new Date();

  // ==========================================================================
  // FOGLIO 1: DASHBOARD & KPI GIORNALIERI
  // ==========================================================================
  const wsDash = workbook.addWorksheet("Dashboard & KPI", {
    views: [{ state: "frozen", ySplit: 4 }],
  });

  wsDash.mergeCells("A1:G1");
  const titleCell = wsDash.getCell("A1");
  titleCell.value = "TECHPYRE STUDIO - B2B OUTBOUND CRM & DAILY AUTOMATION REPORT";
  titleCell.font = { name: "Calibri", size: 15, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0B1E36" },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  wsDash.getRow(1).height = 34;

  wsDash.mergeCells("A2:G2");
  const subCell = wsDash.getCell("A2");
  subCell.value = `Ultimo aggiornamento automatico: ${new Date().toLocaleString("it-IT", {
    timeZone: "Europe/Rome",
  })} (Europe/Rome) · Regola Step 1: 35/giorno · Soglia Step 2: >= 40 aziende in Step 1`;
  subCell.font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF334155" } };
  subCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" },
  };
  subCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  wsDash.getRow(2).height = 22;

  const countByStatus = (st) => leads.filter((l) => l.status === st).length;
  const kpiRows = [
    ["Totale Aziende Qualificate a Database", leads.length],
    ["🔥 Hot Lead (Risposte Positive / In Trattativa)", countByStatus("HOT_LEAD")],
    ["📨 Inviato Step 1 (In attesa di Follow-Up Step 2)", countByStatus("CONTACTED_STEP_1")],
    ["🚀 Inviato Step 2 (Follow-Up In-Thread + Link Demo 0.3s)", countByStatus("CONTACTED_STEP_2")],
    ["🆕 Pronte da Contattare (Stato NEW qualificate)", countByStatus("NEW")],
    ["🚫 Caselle Ticketing / Scartate / Blacklist", countByStatus("INVALID_TICKET_INBOX") + countByStatus("BLACKLISTED")],
    ["Totale Email Outbound Inviate (Storico SMTP)", history.length],
  ];

  wsDash.getRow(4).values = ["METRICA DI PIPELINE B2B", "VALORE ATTUALE", "", "DATA (ROMA)", "STEP 1 INVIATI", "STEP 2 INVIATI", "TOTALE GIORNO"];
  wsDash.getRow(4).height = 24;
  ["A4", "B4", "D4", "E4", "F4", "G4"].forEach((addr) => {
    const c = wsDash.getCell(addr);
    c.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    c.alignment = { vertical: "middle", horizontal: addr === "A4" ? "left" : "center" };
  });

  // Aggrega invii per giorno (Europe/Rome)
  const dailyMap = new Map();
  for (const h of history) {
    if (!h.sentAt) continue;
    let dayKey = h.sentAt.slice(0, 10);
    try {
      dayKey = new Date(h.sentAt).toLocaleDateString("sv-SE", { timeZone: "Europe/Rome" });
    } catch {}
    const cur = dailyMap.get(dayKey) || { step1: 0, step2: 0, total: 0 };
    const st =
      h.stepNumber ||
      (h.type === "STEP_2" ||
      h.type === "FOLLOW_UP" ||
      h.type === "FOLLOW_UP_CREDENTIALS_AND_OFFER"
        ? 2
        : 1);
    if (st === 1) cur.step1++;
    else cur.step2++;
    cur.total++;
    dailyMap.set(dayKey, cur);
  }
  const sortedDays = Array.from(dailyMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  const maxRows = Math.max(kpiRows.length, sortedDays.length);
  for (let i = 0; i < maxRows; i++) {
    const rowIdx = 5 + i;
    const row = wsDash.getRow(rowIdx);
    row.height = 20;

    if (i < kpiRows.length) {
      const [label, val] = kpiRows[i];
      const cA = row.getCell(1);
      const cB = row.getCell(2);
      cA.value = label;
      cB.value = val;
      cA.font = { name: "Calibri", size: 11, bold: i <= 3 };
      cB.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FF0F172A" } };
      cB.alignment = { horizontal: "center", vertical: "middle" };
      cA.fill = cB.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: i % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC" },
      };
    }

    if (i < sortedDays.length) {
      const [day, stats] = sortedDays[i];
      const cD = row.getCell(4);
      const cE = row.getCell(5);
      const cF = row.getCell(6);
      const cG = row.getCell(7);
      cD.value = day;
      cE.value = stats.step1;
      cF.value = stats.step2;
      cG.value = stats.total;
      [cD, cE, cF, cG].forEach((c) => {
        c.font = { name: "Calibri", size: 11, bold: c === cG };
        c.alignment = { horizontal: "center", vertical: "middle" };
        c.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: i % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC" },
        };
      });
    }
  }

  wsDash.columns = [
    { width: 48 },
    { width: 18 },
    { width: 5 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
  ];

  // ==========================================================================
  // FOGLIO 2: PIPELINE LEAD & DEMO (REGISTRO COMPLETO)
  // ==========================================================================
  const wsLeads = workbook.addWorksheet("Pipeline Lead & Demo", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  wsLeads.columns = [
    { header: "Stato Sequenza", key: "status", width: 22 },
    { header: "Azienda B2B", key: "companyName", width: 32 },
    { header: "Citta", key: "city", width: 16 },
    { header: "Titolare / Decision Maker", key: "decisionMakerName", width: 26 },
    { header: "Ruolo", key: "decisionMakerRole", width: 20 },
    { header: "Email Destinatario", key: "targetEmail", width: 32 },
    { header: "Score Email", key: "emailScore", width: 12 },
    { header: "Telefono", key: "phone", width: 18 },
    { header: "LCP Mobile (s)", key: "lcpSeconds", width: 15 },
    { header: "Score CWV", key: "mobileScore", width: 12 },
    { header: "Ads / Pixel Attivi", key: "runsAdsLabel", width: 16 },
    { header: "Data Invio Step 1", key: "step1Date", width: 20 },
    { header: "Data Invio Step 2", key: "step2Date", width: 20 },
    { header: "Demo Live 0.3s (TechPyre)", key: "demoUrl", width: 42 },
    { header: "Sito Web Originale", key: "originalLandingUrl", width: 36 },
    { header: "P.IVA", key: "vatNumber", width: 16 },
    { header: "Slug", key: "slug", width: 24 },
  ];

  const headerRow = wsLeads.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0B1E36" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  const statusColors = {
    HOT_LEAD: { bg: "FFDCFCE7", fg: "FF166534", label: "🔥 HOT LEAD" },
    CONTACTED_STEP_2: { bg: "FFDBEAFE", fg: "FF1E40AF", label: "🚀 STEP 2 INVIATO" },
    CONTACTED_STEP_1: { bg: "FFFEF3C7", fg: "FF92400E", label: "📨 STEP 1 INVIATO" },
    NEW: { bg: "FFF1F5F9", fg: "FF334155", label: "🆕 PRONTA (NEW)" },
    INVALID_TICKET_INBOX: { bg: "FFFEE2E2", fg: "FF991B1B", label: "🚫 TICKET / SCARTATA" },
    BLACKLISTED: { bg: "FFFEE2E2", fg: "FF991B1B", label: "⛔ BLACKLISTED" },
  };

  const fmtDate = (iso) => {
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
      return iso.slice(0, 16);
    }
  };

  leads.forEach((l, idx) => {
    const stStyle = statusColors[l.status] || {
      bg: "FFFFFFFF",
      fg: "FF0F172A",
      label: l.status,
    };
    const row = wsLeads.addRow({
      status: stStyle.label,
      companyName: l.companyName,
      city: l.city,
      decisionMakerName: l.decisionMakerName,
      decisionMakerRole: l.decisionMakerRole,
      targetEmail: l.targetEmail,
      emailScore: l.emailScore,
      phone: l.phone,
      lcpSeconds: l.lcpSeconds,
      mobileScore: l.mobileScore,
      runsAdsLabel: l.runsAds ? "SI (" + l.trackingSignals + ")" : "NO",
      step1Date: fmtDate(l.step1SentAt),
      step2Date: fmtDate(l.step2SentAt),
      demoUrl: { text: l.demoUrl, hyperlink: l.demoUrl },
      originalLandingUrl:
        l.originalLandingUrl && l.originalLandingUrl.startsWith("http")
          ? { text: l.originalLandingUrl, hyperlink: l.originalLandingUrl }
          : l.originalLandingUrl,
      vatNumber: l.vatNumber,
      slug: l.slug,
    });

    row.height = 20;
    const zebraBg = idx % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC";
    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF0F172A" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: zebraBg } };
      cell.alignment = {
        vertical: "middle",
        horizontal: [1, 7, 9, 10, 12, 13].includes(colNumber) ? "center" : "left",
      };
    });

    // Badge colorato sulla colonna Stato
    const stCell = row.getCell(1);
    stCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: stStyle.bg } };
    stCell.font = { name: "Calibri", size: 10, bold: true, color: { argb: stStyle.fg } };

    // Stile link cliccabile per Demo e Sito Originale
    const demoCell = row.getCell(14);
    demoCell.font = {
      name: "Calibri",
      size: 10,
      underline: true,
      color: { argb: "FF2563EB" },
    };
  });

  wsLeads.autoFilter = {
    from: "A1",
    to: "Q1",
  };

  // ==========================================================================
  // FOGLIO 3: STORICO INVII SMTP (CRONOLOGICO INVERSO)
  // ==========================================================================
  const wsHist = workbook.addWorksheet("Storico Invii SMTP", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  wsHist.columns = [
    { header: "Data & Ora (Roma)", key: "sentAt", width: 22 },
    { header: "Step", key: "step", width: 14 },
    { header: "Azienda", key: "companyName", width: 30 },
    { header: "Email Destinatario", key: "recipient", width: 32 },
    { header: "Oggetto Email", key: "subject", width: 52 },
    { header: "Slug", key: "slug", width: 24 },
    { header: "Message-ID SMTP", key: "messageId", width: 44 },
  ];

  const histHeader = wsHist.getRow(1);
  histHeader.height = 25;
  histHeader.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  const sortedHistory = [...history].sort((a, b) =>
    (b.sentAt || "").localeCompare(a.sentAt || "")
  );

  sortedHistory.forEach((h, idx) => {
    const stepNum =
      h.stepNumber ||
      (h.type === "STEP_2" ||
      h.type === "FOLLOW_UP" ||
      h.type === "FOLLOW_UP_CREDENTIALS_AND_OFFER"
        ? 2
        : 1);
    const row = wsHist.addRow({
      sentAt: fmtDate(h.sentAt),
      step: `STEP ${stepNum}`,
      companyName: h.companyName || h.slug,
      recipient: h.recipient || "-",
      subject: h.subject || "-",
      slug: h.slug || "-",
      messageId: h.messageId || "-",
    });
    row.height = 19;
    const zebra = idx % 2 === 0 ? "FFFFFFFF" : "FFF8FAFC";
    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: "Calibri",
        size: 10,
        bold: colNumber === 2,
        color: { argb: colNumber === 2 && stepNum === 2 ? "FF1E40AF" : "FF0F172A" },
      };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: zebra } };
      cell.alignment = {
        vertical: "middle",
        horizontal: [1, 2].includes(colNumber) ? "center" : "left",
      };
    });
  });

  wsHist.autoFilter = {
    from: "A1",
    to: "G1",
  };

  await workbook.xlsx.writeFile(outputPath);
  const gdriveSync = syncExcelToGoogleDrive(outputPath);

  return {
    outputPath,
    googleDriveFileId: gdriveSync.fileId,
    googleDriveUrl: gdriveSync.webUrl,
    googleDriveSynced: gdriveSync.synced,
    totalLeads: leads.length,
    hotLeads: countByStatus("HOT_LEAD"),
    step1Count: countByStatus("CONTACTED_STEP_1"),
    step2Count: countByStatus("CONTACTED_STEP_2"),
    newCount: countByStatus("NEW"),
    totalHistoryEntries: history.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateExcelCrm().then((res) => {
    console.log("✅ File Excel CRM aggiornato con successo:", JSON.stringify(res, null, 2));
  });
}
