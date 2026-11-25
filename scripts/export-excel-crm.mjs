#!/usr/bin/env node
/**
 * TECHPYRE STUDIO · GENERATORE EXCEL CRM MULTI-FOGLIO & SYNC NOTION (`export-excel-crm.mjs`)
 * Genera / aggiorna il workbook Excel formattato con palette accessibile WCAG 2.2 AA:
 *   1. "Dashboard & KPI"      -> Riepilogo funnel + collegamenti Notion/Drive + esecuzioni giornaliere
 *   2. "Pipeline Lead & Demo" -> Registro completo aziende B2B con etichette dual-coded [STATO]
 *   3. "Storico Invii SMTP"   -> Log cronologico invii SMTP (Step 1..4) con Message-ID e operatore
 * Se `NOTION_TOKEN` è configurato in `.env.local`, sincronizza anche i 3 database Notion.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { spawnSync } from "child_process";
import { collectCrmSnapshot, formatRomeDateTime, normalizeExternalUrl } from "./crm-snapshot.mjs";
import { DEFAULT_NOTION_CRM_HUB_URL, syncNotionCrm } from "./sync-notion-crm.mjs";

const require = createRequire(import.meta.url);
const ExcelJS = require("../node_modules/exceljs/dist/exceljs.bare.min.js");

export const GDRIVE_CRM_FILE_ID =
  process.env.TECHPYRE_GDRIVE_CRM_ID || "12rHG46b8sG64BTFQA1gMWNPfBfXBekMD";
export const GDRIVE_CRM_WEB_URL = GDRIVE_CRM_FILE_ID
  ? `https://docs.google.com/spreadsheets/d/${GDRIVE_CRM_FILE_ID}/edit`
  : "";

export function syncExcelToGoogleDrive(localFilePath) {
  if (!GDRIVE_CRM_FILE_ID) {
    return {
      synced: false,
      fileId: "",
      webUrl: "",
    };
  }

  const gdriveBinCandidates = [process.env.TECHPYRE_GDRIVE_BIN, "gdrive"].filter(Boolean);
  for (const bin of gdriveBinCandidates) {
    try {
      const res = spawnSync(
        bin,
        ["mutate", "update", GDRIVE_CRM_FILE_ID, localFilePath],
        {
          encoding: "utf-8",
          timeout: 20000,
          env: process.env,
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

export async function generateExcelCrm(customOutputPathOrOptions, maybeOptions = {}) {
  const options =
    typeof customOutputPathOrOptions === "object" && customOutputPathOrOptions !== null
      ? customOutputPathOrOptions
      : { ...maybeOptions, customOutputPath: customOutputPathOrOptions };

  const rootDir = options.rootDir || process.cwd();
  const outputPath =
    options.customOutputPath || path.join(rootDir, "TechPyre_Outbound_CRM.xlsx");

  const snapshot = await collectCrmSnapshot({ rootDir });
  const { kpis, leads, dailyReports, historyEntries } = snapshot;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TechPyre Studio Outbound Engine";
  workbook.lastModifiedBy = process.env.TECHPYRE_SIGNATURE_NAME || "TechPyre Studio";
  workbook.created = new Date();
  workbook.modified = new Date();

  const HEADER_FONT = "Segoe UI";
  const NAVY_BG = "FF0A192F";
  const SLATE_SURFACE = "FFF8F7F4";
  const INK_FG = "FF14181F";
  const MUTED_FG = "FF334155";
  const LINK_FG = "FF1D4ED8"; // Contrasto >= 6.7:1 su #FFFFFF e #F8F7F4 (WCAG AA/AAA)
  const BORDER_GRAY = { style: "thin", color: { argb: "FFCBD5E1" } };

  // =========================================================================
  // FOGLIO 1: DASHBOARD & KPI (Accessibile WCAG AA, testata chiara, trend)
  // =========================================================================
  const wsDash = workbook.addWorksheet("Dashboard & KPI", {
    views: [{ state: "frozen", ySplit: 5 }],
  });

  wsDash.mergeCells("A1:I1");
  const titleCell = wsDash.getCell("A1");
  titleCell.value = "TECHPYRE STUDIO · CRM OUTBOUND B2B & REPORT AUTOMAZIONI";
  titleCell.font = { name: HEADER_FONT, size: 15, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_BG } };
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  wsDash.getRow(1).height = 36;

  wsDash.mergeCells("A2:I2");
  const subCell = wsDash.getCell("A2");
  subCell.value = `Ultimo aggiornamento: ${snapshot.generatedAtRome} (Europe/Rome) · Quota Step 1: 35/g · Soglia Step 2: >= 40 · Step 3: WhatsApp +39 379 115 9352`;
  subCell.font = { name: HEADER_FONT, size: 11, color: { argb: INK_FG } };
  subCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE_SURFACE } };
  subCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  wsDash.getRow(2).height = 24;

  wsDash.mergeCells("A3:I3");
  const notionBanner = wsDash.getCell("A3");
  const notionHubUrl = process.env.NOTION_CRM_HUB_URL || DEFAULT_NOTION_CRM_HUB_URL;
  notionBanner.value = {
    text: "Apri CRM Outbound & Pipeline Lead integrato su Notion (Vista Accessibile WCAG AA & Grafici Live)",
    hyperlink: notionHubUrl,
  };
  notionBanner.font = { name: HEADER_FONT, size: 11, bold: true, underline: true, color: { argb: LINK_FG } };
  notionBanner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFFFF" } };
  notionBanner.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  wsDash.getRow(3).height = 24;

  const kpiRows = [
    ["Totale Aziende Qualificate a Database", kpis.totalLeads],
    ["[P1] Hot Lead (Risposte Positive / In Trattativa)", kpis.hotLeads],
    ["[STEP 1] Primo Contatto (In attesa Follow-Up Step 2)", kpis.step1Count],
    ["[STEP 2] Follow-Up In-Thread + Link Demo 0.3s", kpis.step2Count],
    ["[STEP 3] Value Drop + Leva Asincrona WhatsApp", kpis.step3Count],
    ["[STEP 4] Breakup / Ciclo Completato", kpis.step4Count],
    ["[NEW] Pronte da Contattare (Qualificate)", kpis.newCount],
    ["[SCARTO / STOP] Caselle Ticket, MX Ko e Blacklist", kpis.blockedTotal],
    ["Aziende con Ads Attivi + LCP Mobile >= 5.0s", kpis.adsAndHighLcpCount],
    ["Media LCP Mobile / Punteggio PSI Medio", `${kpis.avgLcp}s / ${kpis.avgMobileScore}/100`],
    ["Visite Reali Demo Registrate (No Bot/Audit)", kpis.realVisitedLeads],
    ["Totale Invii SMTP Storici", kpis.totalHistoryEntries],
  ];

  wsDash.getRow(5).values = [
    "METRICA DI PIPELINE B2B",
    "VALORE ATTUALE",
    "",
    "DATA (ROMA)",
    "STEP 1",
    "STEP 2",
    "STEP 3",
    "STEP 4",
    "TOTALE GIORNO",
  ];
  wsDash.getRow(5).height = 26;
  ["A5", "B5", "D5", "E5", "F5", "G5", "H5", "I5"].forEach((addr) => {
    const c = wsDash.getCell(addr);
    c.font = { name: HEADER_FONT, size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_BG } };
    c.alignment = { vertical: "middle", horizontal: addr === "A5" ? "left" : "center" };
  });

  const maxRows = Math.max(kpiRows.length, dailyReports.length);
  for (let i = 0; i < maxRows; i++) {
    const rowIdx = 6 + i;
    const row = wsDash.getRow(rowIdx);
    row.height = 22;
    const zebra = i % 2 === 0 ? "FFFFFFFF" : SLATE_SURFACE;

    if (i < kpiRows.length) {
      const [label, val] = kpiRows[i];
      const cA = row.getCell(1);
      const cB = row.getCell(2);
      cA.value = label;
      cB.value = val;
      cA.font = { name: HEADER_FONT, size: 11, bold: i <= 1, color: { argb: INK_FG } };
      cB.font = { name: HEADER_FONT, size: 11, bold: true, color: { argb: NAVY_BG } };
      cA.alignment = { horizontal: "left", vertical: "middle" };
      cB.alignment = { horizontal: "center", vertical: "middle" };
      [cA, cB].forEach((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: zebra } };
        c.border = { bottom: BORDER_GRAY };
      });
    }

    if (i < dailyReports.length) {
      const stats = dailyReports[i];
      const vals = [stats.date, stats.step1, stats.step2, stats.step3, stats.step4, stats.total];
      vals.forEach((v, offset) => {
        const cell = row.getCell(4 + offset);
        cell.value = v;
        cell.font = { name: HEADER_FONT, size: 11, bold: offset === 5, color: { argb: INK_FG } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: zebra } };
        cell.border = { bottom: BORDER_GRAY };
      });
    }
  }

  wsDash.columns = [
    { width: 50 },
    { width: 20 },
    { width: 4 },
    { width: 16 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 16 },
  ];

  // =========================================================================
  // FOGLIO 2: PIPELINE LEAD & DEMO (Colonne bloccate + dual-coded status)
  // =========================================================================
  const wsLeads = workbook.addWorksheet("Pipeline Lead & Demo", {
    views: [{ state: "frozen", xSplit: 2, ySplit: 1 }],
  });

  wsLeads.columns = [
    { header: "Stato Sequenza (Codice + Label)", key: "status", width: 26 },
    { header: "Azienda B2B", key: "companyName", width: 34 },
    { header: "Priorità Azione", key: "priority", width: 26 },
    { header: "Città", key: "city", width: 18 },
    { header: "Titolare / Referente", key: "decisionMakerName", width: 26 },
    { header: "Ruolo", key: "decisionMakerRole", width: 22 },
    { header: "Email Destinatario", key: "targetEmail", width: 32 },
    { header: "Score Email", key: "emailScore", width: 13 },
    { header: "Telefono / WhatsApp", key: "phone", width: 20 },
    { header: "LCP Mobile (s)", key: "lcpSeconds", width: 15 },
    { header: "Fascia LCP", key: "lcpBand", width: 20 },
    { header: "Score CWV", key: "mobileScore", width: 12 },
    { header: "Stato Ads", key: "adsBadge", width: 20 },
    { header: "Visite Demo Reali", key: "realVisitsCount", width: 17 },
    { header: "Data Invio Step 1", key: "step1Date", width: 20 },
    { header: "Data Invio Step 2", key: "step2Date", width: 20 },
    { header: "Demo Live 0.3s (TechPyre)", key: "demoUrl", width: 42 },
    { header: "Sito Web Originale", key: "originalLandingUrl", width: 38 },
    { header: "P.IVA", key: "vatNumber", width: 18 },
    { header: "Slug", key: "slug", width: 24 },
  ];

  const headerRow = wsLeads.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: HEADER_FONT, size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_BG } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  leads.forEach((l, idx) => {
    const safeOrigUrl = normalizeExternalUrl(l.originalLandingUrl);
    const row = wsLeads.addRow({
      status: l.statusMeta.excelLabel,
      companyName: l.companyName,
      priority: l.statusMeta.priorityLabel,
      city: l.city,
      decisionMakerName: l.decisionMakerName,
      decisionMakerRole: l.decisionMakerRole,
      targetEmail: l.targetEmail || "-",
      emailScore: l.emailScore,
      phone: l.phone || "-",
      lcpSeconds: l.lcpSeconds,
      lcpBand: l.lcpBand,
      mobileScore: l.mobileScore,
      adsBadge: l.runsAds ? `${l.adsBadge} (${l.trackingSignals})` : l.adsBadge,
      realVisitsCount: l.realVisitsCount,
      step1Date: formatRomeDateTime(l.step1SentAt),
      step2Date: formatRomeDateTime(l.step2SentAt),
      demoUrl: { text: l.demoUrl, hyperlink: l.demoUrl },
      originalLandingUrl: safeOrigUrl
        ? { text: safeOrigUrl, hyperlink: safeOrigUrl }
        : l.originalLandingUrl || "-",
      vatNumber: l.vatNumber,
      slug: l.slug,
    });

    row.height = 24;
    const zebraBg = idx % 2 === 0 ? "FFFFFFFF" : SLATE_SURFACE;
    row.eachCell((cell, colNumber) => {
      cell.font = { name: HEADER_FONT, size: 11, color: { argb: INK_FG } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: zebraBg } };
      cell.border = { bottom: BORDER_GRAY };
      cell.alignment = {
        vertical: "middle",
        wrapText: true,
        horizontal: [1, 8, 10, 12, 14, 15, 16].includes(colNumber) ? "center" : "left",
      };
    });

    const stCell = row.getCell(1);
    stCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: l.statusMeta.excelBg },
    };
    stCell.font = {
      name: HEADER_FONT,
      size: 11,
      bold: true,
      color: { argb: l.statusMeta.excelFg },
    };

    const demoCell = row.getCell(17);
    demoCell.font = {
      name: HEADER_FONT,
      size: 11,
      underline: true,
      color: { argb: LINK_FG },
    };

    if (safeOrigUrl) {
      const origCell = row.getCell(18);
      origCell.font = {
        name: HEADER_FONT,
        size: 11,
        underline: true,
        color: { argb: LINK_FG },
      };
    }
  });

  wsLeads.autoFilter = { from: "A1", to: "T1" };

  // =========================================================================
  // FOGLIO 3: STORICO INVII SMTP
  // =========================================================================
  const wsHist = workbook.addWorksheet("Storico Invii SMTP", {
    views: [{ state: "frozen", xSplit: 1, ySplit: 1 }],
  });

  wsHist.columns = [
    { header: "Data & Ora (Roma)", key: "sentAt", width: 22 },
    { header: "Step", key: "step", width: 14 },
    { header: "Azienda B2B", key: "companyName", width: 32 },
    { header: "Email Destinatario", key: "recipient", width: 32 },
    { header: "Oggetto Email", key: "subject", width: 54 },
    { header: "Operatore", key: "sentBy", width: 24 },
    { header: "Slug", key: "slug", width: 24 },
    { header: "Message-ID SMTP", key: "messageId", width: 44 },
  ];

  const histHeader = wsHist.getRow(1);
  histHeader.height = 28;
  histHeader.eachCell((cell) => {
    cell.font = { name: HEADER_FONT, size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_BG } };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  historyEntries.forEach((h, idx) => {
    const row = wsHist.addRow({
      sentAt: h.sentAtRome,
      step: h.stepLabel,
      companyName: h.companyName,
      recipient: h.recipient || "-",
      subject: h.subject,
      sentBy: h.sentBy,
      slug: h.slug || "-",
      messageId: h.messageId,
    });
    row.height = 22;
    const zebra = idx % 2 === 0 ? "FFFFFFFF" : SLATE_SURFACE;
    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: HEADER_FONT,
        size: 11,
        bold: colNumber === 2,
        color: { argb: colNumber === 2 && h.stepNumber >= 2 ? LINK_FG : INK_FG },
      };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: zebra } };
      cell.border = { bottom: BORDER_GRAY };
      cell.alignment = {
        vertical: "middle",
        wrapText: true,
        horizontal: [1, 2].includes(colNumber) ? "center" : "left",
      };
    });
  });

  wsHist.autoFilter = { from: "A1", to: "H1" };

  const xlsxBuffer = await workbook.xlsx.writeBuffer();
  fs.writeFileSync(outputPath, Buffer.from(xlsxBuffer));
  const shouldSyncGdrive =
    options.syncGdrive !== undefined
      ? Boolean(options.syncGdrive)
      : !options.customOutputPath;
  const gdriveSync = shouldSyncGdrive
    ? syncExcelToGoogleDrive(outputPath)
    : {
        synced: false,
        fileId: GDRIVE_CRM_FILE_ID,
        webUrl: GDRIVE_CRM_WEB_URL,
      };

  let notionSync = {
    synced: false,
    reason: "Disabilitato per ciclo interno",
    hubUrl: notionHubUrl,
  };
  if (options.syncNotion !== false) {
    try {
      notionSync = await syncNotionCrm(snapshot, {
        rootDir,
        googleDriveUrl: gdriveSync.webUrl || GDRIVE_CRM_WEB_URL,
        googleDriveSynced: gdriveSync.synced,
      });
    } catch (err) {
      notionSync = {
        synced: false,
        reason: err instanceof Error ? err.message : String(err),
        hubUrl: notionHubUrl,
      };
    }
  }

  return {
    outputPath,
    googleDriveFileId: gdriveSync.fileId,
    googleDriveUrl: gdriveSync.webUrl,
    googleDriveSynced: gdriveSync.synced,
    notionSynced: Boolean(notionSync.synced),
    notionHubUrl: notionSync.hubUrl || notionHubUrl,
    notionSummary: notionSync,
    totalLeads: kpis.totalLeads,
    hotLeads: kpis.hotLeads,
    step1Count: kpis.step1Count,
    step2Count: kpis.step2Count,
    step3Count: kpis.step3Count,
    step4Count: kpis.step4Count,
    newCount: kpis.newCount,
    totalHistoryEntries: kpis.totalHistoryEntries,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const skipNotion = process.argv.includes("--skip-notion");
  generateExcelCrm({ syncNotion: !skipNotion }).then((res) => {
    console.log("CRM Excel & Notion aggiornato:", JSON.stringify(res, null, 2));
  });
}
