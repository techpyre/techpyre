import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "fs";
import os from "os";
import path from "path";
import {
  collectCrmSnapshot,
  formatAdsBadge,
  formatLcpBand,
  getAccessibleStatusMeta,
  isInternalAuditUserAgent,
} from "../scripts/crm-snapshot.mjs";
import {
  buildHistoryNotionProperties,
  buildLeadNotionProperties,
  buildReportNotionProperties,
  computeRecordHash,
  resolveNotionConfig,
} from "../scripts/sync-notion-crm.mjs";

function relativeLuminance(argbHex: string): number {
  const hex = argbHex.length === 8 ? argbHex.slice(2) : argbHex;
  const [r, g, b] = [0, 2, 4].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function wcagContrastRatio(argb1: string, argb2: string): number {
  const l1 = relativeLuminance(argb1);
  const l2 = relativeLuminance(argb2);
  const [bright, dark] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (bright + 0.05) / (dark + 0.05);
}

test("accessible status badges include dual-coded text prefixes and pass WCAG AA 4.5:1 contrast", () => {
  const statuses = [
    "HOT_LEAD",
    "CONTACTED_STEP_3",
    "CONTACTED_STEP_2",
    "CONTACTED_STEP_1",
    "NEW",
    "MANUAL_LINKEDIN_QUEUE",
    "CONTACTED_STEP_4",
    "INVALID_TICKET_INBOX",
    "BLACKLISTED",
  ];

  for (const st of statuses) {
    const meta = getAccessibleStatusMeta(st);
    assert.match(meta.notionOption, /^\[[A-Z0-9 /]+\]/);
    assert.match(meta.excelLabel, /^\[[A-Z0-9 /]+\]/);
    assert.match(meta.priorityLabel, /^\[P[1-4]\]/);
    const ratio = wcagContrastRatio(meta.excelBg, meta.excelFg);
    assert.ok(ratio >= 4.5, `Contrast ratio for ${st} (${ratio.toFixed(2)}) must be >= 4.5`);
  }

  assert.equal(formatLcpBand(8.5), "[CRITICA] >= 8.0s");
  assert.equal(formatLcpBand(5.2), "[ALTA] 5.0s - 7.9s");
  assert.equal(formatLcpBand(2.9), "[MEDIA] < 5.0s");
  assert.equal(formatAdsBadge(true), "[ADS] Attivi");
  assert.equal(formatAdsBadge(false), "[ORGANICO] No Pixel");
});

test("collectCrmSnapshot filters bot visits, aggregates daily counts, and serializes Notion props deterministically", async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "techpyre-crm-test-"));
  const leadsDir = path.join(tmpDir, "src", "data", "leads");
  fs.mkdirSync(leadsDir, { recursive: true });

  fs.writeFileSync(
    path.join(leadsDir, "alfa-serramenti.json"),
    JSON.stringify({
      slug: "alfa-serramenti",
      meta: {
        companyName: "Alfa Serramenti Srl",
        city: "Brescia",
        vatNumber: "01234567890",
        decisionMakerName: "Mario Rossi",
        decisionMakerRole: "Titolare",
        targetEmail: "mario.rossi@alfaserramenti.it",
        emailScore: 95,
        phone: "+39 030 123456",
        originalLandingUrl: "https://alfaserramenti.it",
        lastSentMessageId: "<msg-1@techpyre.eu>",
        status: "HOT_LEAD",
      },
      audit: {
        originalLcpSeconds: 8.4,
        mobileScore: 31,
        runsAds: true,
        detectedTrackingSignals: ["Meta Pixel", "Google Ads"],
      },
    })
  );

  fs.writeFileSync(
    path.join(leadsDir, "beta-impianti.json"),
    JSON.stringify({
      slug: "beta-impianti",
      meta: {
        companyName: "Beta Impianti",
        city: "Milano",
        targetEmail: "info@betaimpianti.it",
        originalLandingUrl: "https://betaimpianti.it",
        status: "NEW",
      },
      audit: {
        originalLcpSeconds: 6.1,
        mobileScore: 44,
        runsAds: false,
      },
    })
  );

  fs.writeFileSync(
    path.join(tmpDir, "src", "data", "outreach-history.json"),
    JSON.stringify([
      {
        slug: "alfa-serramenti",
        companyName: "Alfa Serramenti Srl",
        recipient: "mario.rossi@alfaserramenti.it",
        stepNumber: 1,
        type: "STEP_1",
        subject: "Sui vostri annunci a Brescia",
        messageId: "<msg-1@techpyre.eu>",
        sentAt: "2026-11-24T09:15:00.000Z",
        sentBy: "Riccardo (admin)",
      },
    ])
  );

  fs.writeFileSync(
    path.join(tmpDir, "src", "data", "demo-visits.json"),
    JSON.stringify({
      "alfa-serramenti": {
        visits: [
          { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)" },
          { userAgent: "HeadlessChrome/151.0.0.0" },
        ],
      },
    })
  );

  try {
    assert.equal(isInternalAuditUserAgent("HeadlessChrome/151.0"), true);
    assert.equal(isInternalAuditUserAgent("iPhone Safari"), false);

    const snapshot = await collectCrmSnapshot({ rootDir: tmpDir });
    assert.equal(snapshot.kpis.totalLeads, 2);
    assert.equal(snapshot.kpis.hotLeads, 1);
    assert.equal(snapshot.kpis.newCount, 1);
    assert.equal(snapshot.kpis.adsAndHighLcpCount, 1);
    assert.equal(snapshot.kpis.realVisitedLeads, 1);
    assert.equal(snapshot.dailyReports.length, 1);
    assert.equal(snapshot.dailyReports[0].date, "2026-11-24");
    assert.equal(snapshot.dailyReports[0].step1, 1);

    const hotLead = snapshot.leads[0];
    assert.equal(hotLead.slug, "alfa-serramenti");
    assert.equal(hotLead.realVisitsCount, 1);

    const notionProps = buildLeadNotionProperties(hotLead);
    assert.equal(notionProps["Stato Sequenza"].status.name, "[HOT] Risposta / Trattativa");
    assert.equal(notionProps["Fascia LCP"].select.name, "[CRITICA] >= 8.0s");
    assert.equal(notionProps["Stato Ads"].select.name, "[ADS] Attivi");
    assert.equal(
      computeRecordHash(notionProps),
      computeRecordHash(buildLeadNotionProperties(hotLead))
    );

    const reportProps = buildReportNotionProperties(snapshot.dailyReports[0], snapshot.kpis);
    assert.ok(reportProps["Data (ISO)"].date);
    assert.equal(reportProps["Data (ISO)"].date.start, "2026-11-24");
    assert.equal(reportProps["Totale Aziende DB"].number, 2);

    const histProps = buildHistoryNotionProperties(snapshot.historyEntries[0], "page-123");
    assert.ok(histProps["Lead Collegato"]);
    assert.equal(histProps["Lead Collegato"].relation[0].id, "page-123");
    assert.equal(histProps.Step.select.name, "STEP 1");

    const excelOut = path.join(tmpDir, "CRM.xlsx");
    const verifyScript = `
      import fs from "fs";
      import { createRequire } from "module";
      const require = createRequire(${JSON.stringify(path.join(process.cwd(), "package.json"))});
      const ExcelJS = require(${JSON.stringify(path.join(process.cwd(), "node_modules", "exceljs", "dist", "exceljs.bare.min.js"))});
      import { generateExcelCrm } from ${JSON.stringify(path.join(process.cwd(), "scripts", "export-excel-crm.mjs"))};
      const res = await generateExcelCrm({ rootDir: ${JSON.stringify(tmpDir)}, customOutputPath: ${JSON.stringify(excelOut)}, syncGdrive: false, syncNotion: false });
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(fs.readFileSync(${JSON.stringify(excelOut)}));
      console.log(JSON.stringify({
        totalLeads: res.totalLeads,
        sheets: wb.worksheets.map(w => w.name),
        dashLink: wb.getWorksheet("Dashboard & KPI").getCell("A3").value?.hyperlink || ""
      }));
    `;
    const verifyPath = path.join(tmpDir, "verify_excel.mjs");
    fs.writeFileSync(verifyPath, verifyScript, "utf8");
    const rawOut = execFileSync(process.execPath, [verifyPath], { encoding: "utf8" }).trim();
    const parsedOut = JSON.parse(rawOut);
    assert.equal(parsedOut.totalLeads, 2);
    assert.deepEqual(parsedOut.sheets, [
      "Dashboard & KPI",
      "Pipeline Lead & Demo",
      "Storico Invii SMTP",
    ]);
    assert.ok(parsedOut.dashLink.includes("42279614e8e3810a9149eb9158457297"));

    assert.equal(resolveNotionConfig({}).configured, false);
    assert.equal(resolveNotionConfig({ NOTION_TOKEN: "secret_x" }).configured, true);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
