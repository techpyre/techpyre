#!/usr/bin/env node
/**
 * TECHPYRE STUDIO · AUTOMAZIONE GIORNALIERA B2B OUTBOUND (`daily-outbound-automation.mjs`)
 * Flusso giornaliero automatico (Lun-Ven ore 09:00 Europe/Rome):
 *   1. Migrazione e sanitizzazione database lead (`migrateOldLeadConfig`)
 *   2. Scouting e qualifica di nuove aziende B2B reali (LCP >= 5.0s, MX valido,
 *      zero PagineGialle/brand terzi) + invio di 35 nuovi Step 1 (First Touch).
 *   3. Controllo delle aziende disponibili per lo Step 2 (`CONTACTED_STEP_1`):
 *      se sono >= 40, invia automaticamente lo Step 2 in-thread col link demo.
 *   4. Generazione/aggiornamento del file Excel formattato `TechPyre_Outbound_CRM.xlsx`.
 *   5. Commit e push automatico su GitHub (`origin/main`) delle nuove demo e log.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__filename), "..");
process.chdir(ROOT_DIR);

if (!process.env.__TECHPYRE_DAILY_TSX) {
  const res = spawnSync("npx", ["tsx", __filename, ...process.argv.slice(2)], {
    stdio: "inherit",
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ""}`,
      __TECHPYRE_DAILY_TSX: "1",
    },
  });
  process.exit(res.status ?? 0);
}

// Carica variabili d'ambiente da .env.local
const envLocalPath = path.join(ROOT_DIR, ".env.local");
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed
        .slice(eqIdx + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const {
  runAutonomousScout,
  isHardBlockedEmail,
  migrateOldLeadConfig,
} = await import("../src/lib/scoutService.ts");

const { listAllLeadConfigs, saveLeadConfig } = await import(
  "../src/lib/leadsStorage.ts"
);

const {
  sendLeadOutreach,
  getOutreachHistory,
  DAILY_FIRST_TOUCH_LIMIT,
} = await import("../src/lib/emailService.ts");

const { generateExcelCrm } = await import("./export-excel-crm.mjs");

// Pool rotativo di keyword High-Ticket B2B & Local-Showroom/Medicale ottimizzato su ricerca di mercato Italia
const B2B_KEYWORD_POOL = [
  // TIER 1A · Serramenti, Facciate Continue, Pergole Bioclimatiche & Vetrate con Showroom
  "serramenti alluminio showroom milano",
  "pergole bioclimatiche brescia",
  "vetrate panoramiche monza",
  "infissi pvc showroom padova",
  "serramenti legno alluminio verona",
  "facciate continue alluminio bergamo",
  "infissi pvc alluminio bologna",
  "serramenti su misura treviso",
  "serramenti legno alluminio udine",
  "infissi alluminio pordenone",
  // TIER 1B · Fotovoltaico Industriale, ESCo & Efficientamento Energetico Capannoni
  "impianti fotovoltaici industriali padova",
  "fotovoltaico aziendale brescia",
  "efficientamento energetico industriale milano",
  "impianti fotovoltaici capannoni bergamo",
  "fotovoltaico industriale verona",
  "sistemi accumulo fotovoltaico bologna",
  "impianti fotovoltaici aziende torino",
  // TIER 1C · Edilizia Industriale Specializzata (Resine, Coperture Capannoni, Bonifica Amianto, Prefabbricati)
  "pavimenti in resina industriali milano",
  "rifacimento coperture industriali brescia",
  "bonifica amianto capannoni bergamo",
  "impermeabilizzazioni industriali bologna",
  "pavimentazioni industriali resina verona",
  "prefabbricati industriali mantova",
  "strutture metalliche prefabbricate piacenza",
  "coperture metalliche capannoni padova",
  // TIER 1D · Cliniche Odontoiatriche Strutturate, Implantologia & Poliambulatori Privati
  "clinica odontoiatrica milano",
  "implantologia dentale brescia",
  "centro odontoiatrico bergamo",
  "studio dentistico implantologia verona",
  "clinica dentale padova",
  "centro implantologia bologna",
  "poliambulatorio specialistico monza",
  "clinica odontoiatrica torino",
  // TIER 2A · Automazione Industriale, Robotica, Quadri Elettrici & Packaging
  "automazione industriale bergamo",
  "quadri elettrici automazione parma",
  "macchine confezionatrici packaging bologna",
  "robotica industriale saldatura torino",
  "impianti elettrici industriali verona",
  "automazioni industriali modena",
  "cabine trasformazione mt bt brescia",
  "nastri trasportatori industriali torino",
  // TIER 2B · Logistica Integrata 3PL, Scaffalature Industriali, Carrelli Elevatori & Porte Rapide
  "scaffalature industriali magazzino verona",
  "logistica integrata magazzini piacenza",
  "noleggio carrelli elevatori brescia",
  "porte rapide industriali treviso",
  "soluzioni imballaggio industriale parma",
  // TIER 2C · Plastica/Stampi, HVAC Industriale, Depurazione Acque, Aria Compressa & Lavorazioni B2B
  "stampaggio materie plastiche bologna",
  "stampaggio gomma plastica monza",
  "costruzione stampi lamiere lecco",
  "impianti aspirazione industriale modena",
  "impianti depurazione acque varese",
  "compressori industriali milano",
  "impianti climatizzazione industriale milano",
  "oleodinamica pneumatica modena",
  "impianti filtrazione aria vicenza",
  "impianti antincendio industriali padova",
  "trattamenti galvanici metalli brescia",
  "verniciatura industriale bergamo",
  "taglio laser lamiera vicenza",
  "carpenteria metallica brescia",
  "lavorazioni meccaniche cnc vicenza",
];

async function isLiveDemoReachable(slug) {
  try {
    const res = await fetch(`https://www.techpyre.eu/demo/${encodeURIComponent(slug)}`, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function hasValidMxRecord(email) {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1]?.trim().toLowerCase();
  if (!domain) return false;
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
      { signal: AbortSignal.timeout(3500) }
    );
    if (!res.ok) return true;
    const data = await res.json();
    return (
      Array.isArray(data?.Answer) &&
      data.Answer.some((a) => a.type === 15 && a.data && a.data !== "0 .")
    );
  } catch {
    return true;
  }
}

function getEligibleLists() {
  const all = listAllLeadConfigs();
  const history = getOutreachHistory();

  const sentStepMap = new Map();
  const sentEmailStep1 = new Set();
  const sentEmailStep2 = new Set();
  const sentEmailStep3 = new Set();
  const sentEmailStep4 = new Set();
  const step1SentAtMap = new Map();
  const step2SentAtMap = new Map();
  const step3SentAtMap = new Map();

  for (const h of history) {
    const s =
      h.stepNumber ||
      (h.type === "STEP_4"
        ? 4
        : h.type === "STEP_3"
        ? 3
        : h.type === "FOLLOW_UP" ||
          h.type === "STEP_2" ||
          h.type === "FOLLOW_UP_CREDENTIALS_AND_OFFER"
        ? 2
        : 1);
    const prev = sentStepMap.get(h.slug) || 0;
    if (s > prev) sentStepMap.set(h.slug, s);

    const rec = String(h.recipient || "").trim().toLowerCase();
    if (rec && s >= 1) sentEmailStep1.add(rec);
    if (rec && s >= 2) sentEmailStep2.add(rec);
    if (rec && s >= 3) sentEmailStep3.add(rec);
    if (rec && s >= 4) sentEmailStep4.add(rec);
    const ts = new Date(h.sentAt || 0).getTime();
    if (s === 1 && !step1SentAtMap.has(h.slug)) step1SentAtMap.set(h.slug, ts);
    if (s === 2 && !step2SentAtMap.has(h.slug)) step2SentAtMap.set(h.slug, ts);
    if (s === 3 && !step3SentAtMap.has(h.slug)) step3SentAtMap.set(h.slug, ts);
  }

  const seenStep1Emails = new Set();
  const eligibleStep1 = [];

  const seenStep2Emails = new Set();
  const eligibleStep2 = [];

  const seenStep3Emails = new Set();
  const eligibleStep3 = [];

  const seenStep4Emails = new Set();
  const eligibleStep4 = [];

  const nowMs = Date.now();
  const minStep3DelayMs = 4 * 86400000; // Almeno 4 giorni dopo lo Step 2 (Giorno 8)
  const minStep4DelayMs = 5 * 86400000; // Almeno 5 giorni dopo lo Step 3 (Giorno 13)

  for (const { slug, config } of all) {
    const migrated = migrateOldLeadConfig(config, true);
    let status = migrated.meta?.status || "NEW";
    if (status === "NEW" && sentStepMap.has(slug)) {
      const maxS = sentStepMap.get(slug);
      status =
        maxS >= 4
          ? "CONTACTED_STEP_4"
          : maxS === 3
          ? "CONTACTED_STEP_3"
          : maxS === 2
          ? "CONTACTED_STEP_2"
          : "CONTACTED_STEP_1";
    }
    if (
      status === "BLACKLISTED" ||
      status === "INVALID_TICKET_INBOX" ||
      status === "HOT_LEAD"
    ) {
      continue;
    }

    const email = String(migrated.meta?.targetEmail || "").trim().toLowerCase();
    if (!email || isHardBlockedEmail(email)) continue;

    const url = String(migrated.meta?.originalLandingUrl || "");
    if (!url || url.includes("paginegialle.it")) continue;

    const lastStep = sentStepMap.get(slug) || 0;

    // Candidati Step 1 (stato NEW, mai contattati, LCP >= 5.0s)
    if (
      status === "NEW" &&
      lastStep === 0 &&
      !sentEmailStep1.has(email) &&
      !seenStep1Emails.has(email) &&
      (migrated.audit?.originalLcpSeconds || 0) >= 5.0
    ) {
      seenStep1Emails.add(email);
      eligibleStep1.push({ slug, config: migrated });
    }

    // Candidati Step 2 (solo aziende che hanno effettivamente ricevuto lo Step 1)
    if (
      status === "CONTACTED_STEP_1" &&
      lastStep === 1 &&
      !sentEmailStep2.has(email) &&
      !seenStep2Emails.has(email)
    ) {
      seenStep2Emails.add(email);
      eligibleStep2.push({
        slug,
        config: migrated,
        step1Time: step1SentAtMap.get(slug) || Number.MAX_SAFE_INTEGER,
      });
    }

    // Candidati Step 3 (Giorno 8: >= 4 giorni dopo Step 2)
    const step2Time = step2SentAtMap.get(slug) || 0;
    if (
      status === "CONTACTED_STEP_2" &&
      lastStep === 2 &&
      step2Time > 0 &&
      nowMs - step2Time >= minStep3DelayMs &&
      !sentEmailStep3.has(email) &&
      !seenStep3Emails.has(email)
    ) {
      seenStep3Emails.add(email);
      eligibleStep3.push({
        slug,
        config: migrated,
        step2Time,
      });
    }

    // Candidati Step 4 Breakup (Giorno 13: >= 5 giorni dopo Step 3)
    const step3Time = step3SentAtMap.get(slug) || 0;
    if (
      status === "CONTACTED_STEP_3" &&
      lastStep === 3 &&
      step3Time > 0 &&
      nowMs - step3Time >= minStep4DelayMs &&
      !sentEmailStep4.has(email) &&
      !seenStep4Emails.has(email)
    ) {
      seenStep4Emails.add(email);
      eligibleStep4.push({
        slug,
        config: migrated,
        step3Time,
      });
    }
  }

  // Ordine cronologico (prima le aziende contattate da più tempo)
  eligibleStep2.sort((a, b) => a.step1Time - b.step1Time);
  eligibleStep3.sort((a, b) => a.step2Time - b.step2Time);
  eligibleStep4.sort((a, b) => a.step3Time - b.step3Time);

  return { eligibleStep1, eligibleStep2, eligibleStep3, eligibleStep4 };
}

async function main() {
  const user = {
    username: process.env.TECHPYRE_OPERATOR_USERNAME || "admin",
    displayName:
      process.env.TECHPYRE_SENDER_NAME ||
      process.env.TECHPYRE_SIGNATURE_NAME ||
      "TechPyre Studio",
    role: "admin",
    title:
      process.env.TECHPYRE_SENDER_ROLE ||
      "Direzione Tecnica - TechPyre Studio",
  };

  const targetStep1Daily = DAILY_FIRST_TOUCH_LIMIT; // 35
  const step2Threshold = 40;
  const step2DailyLimit = 40;
  const step3DailyLimit = 15;
  const step4DailyLimit = 15;

  // Calcola quanti Step 1..4 sono già stati inviati oggi (Europe/Rome) per essere 100% idempotente
  const todayRomeKey = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Rome",
  });
  const historyBefore = getOutreachHistory();
  let step1AlreadySentToday = 0;
  let step2AlreadySentToday = 0;
  let step3AlreadySentToday = 0;
  let step4AlreadySentToday = 0;
  for (const h of historyBefore) {
    if (!h.sentAt) continue;
    let dKey = h.sentAt.slice(0, 10);
    try {
      dKey = new Date(h.sentAt).toLocaleDateString("sv-SE", {
        timeZone: "Europe/Rome",
      });
    } catch {}
    if (dKey !== todayRomeKey) continue;
    const s =
      h.stepNumber ||
      (h.type === "STEP_4"
        ? 4
        : h.type === "STEP_3"
        ? 3
        : h.type === "FOLLOW_UP" ||
          h.type === "STEP_2" ||
          h.type === "FOLLOW_UP_CREDENTIALS_AND_OFFER"
        ? 2
        : 1);
    if (s === 1) step1AlreadySentToday++;
    if (s === 2) step2AlreadySentToday++;
    if (s === 3) step3AlreadySentToday++;
    if (s === 4) step4AlreadySentToday++;
  }

  const remainingStep1Needed = Math.max(0, targetStep1Daily - step1AlreadySentToday);
  const remainingStep2Allowed = Math.max(0, step2DailyLimit - step2AlreadySentToday);
  const remainingStep3Allowed = Math.max(0, step3DailyLimit - step3AlreadySentToday);
  const remainingStep4Allowed = Math.max(0, step4DailyLimit - step4AlreadySentToday);

  console.log("--------------------------------------------------------------------------------");
  console.log("AVVIO AUTOMAZIONE GIORNALIERA TECHPYRE STUDIO (B2B OUTBOUND & EXCEL CRM)");
  console.log(`Data/Ora: ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })} (Europe/Rome)`);
  console.log(
    `Gia inviati oggi (${todayRomeKey}): Step 1 = ${step1AlreadySentToday}/${targetStep1Daily} · Step 2 = ${step2AlreadySentToday}/${step2DailyLimit} · Step 3 = ${step3AlreadySentToday}/${step3DailyLimit} · Step 4 = ${step4AlreadySentToday}/${step4DailyLimit}`
  );
  console.log("--------------------------------------------------------------------------------\n");

  // Fase 1: Controllo disponibilità Step 2, Step 3 e Step 4 prima dei nuovi invii
  const initialCheck = getEligibleLists();
  const preExistingStep2Candidates = initialCheck.eligibleStep2;
  const preExistingStep3Candidates = initialCheck.eligibleStep3;
  const preExistingStep4Candidates = initialCheck.eligibleStep4;
  console.log(
    `[STEP 2] ${preExistingStep2Candidates.length} aziende in CONTACTED_STEP_1 (Soglia: ${step2Threshold}, Max/g: ${step2DailyLimit}).`
  );
  console.log(
    `[STEP 3] ${preExistingStep3Candidates.length} aziende in CONTACTED_STEP_2 da >= 4g (Max/g: ${step3DailyLimit}).`
  );
  console.log(
    `[STEP 4] ${preExistingStep4Candidates.length} aziende in CONTACTED_STEP_3 da >= 5g (Max/g: ${step4DailyLimit}).`
  );

  const sentStep2Report = [];
  const sentStep3Report = [];
  const sentStep4Report = [];
  const totalStep2PoolIncludingToday =
    preExistingStep2Candidates.length + step2AlreadySentToday;
  if (totalStep2PoolIncludingToday >= step2Threshold && remainingStep2Allowed > 0) {
    console.log(
      `\nFASE 1/3 · Soglia Step 2 attiva (${preExistingStep2Candidates.length} disponibili, max 40/giorno). Invio fino a ${remainingStep2Allowed} Step 2.`
    );
    for (const cand of preExistingStep2Candidates) {
      if (sentStep2Report.length >= remainingStep2Allowed) break;
      const email = cand.config.meta.targetEmail;
      const mxOk = await hasValidMxRecord(email);
      if (!mxOk) {
        console.log(`  [SKIP] Step 2 [${cand.slug}] (${email}): MX non valido.`);
        cand.config.meta.status = "INVALID_TICKET_INBOX";
        saveLeadConfig(cand.slug, cand.config);
        continue;
      }
      const demoOk = await isLiveDemoReachable(cand.slug);
      if (!demoOk) {
        console.log(
          `  [SKIP] Step 2 [${cand.slug}]: demo https://www.techpyre.eu/demo/${cand.slug} non risponde HTTP 200.`
        );
        continue;
      }
      try {
        const sendRes = await sendLeadOutreach({
          slug: cand.slug,
          stepNumber: 2,
          user,
          bypassBusinessHoursCheck: true,
          bypassRateLimitCheck: true,
          applyJitter: true,
        });
        sentStep2Report.push({
          slug: cand.slug,
          companyName: cand.config.meta.companyName,
          city: cand.config.meta.city,
          email,
          messageId: sendRes.messageId,
        });
        try {
          await generateExcelCrm();
        } catch (syncErr) {
          console.warn(`    [WARN] Sync Excel: ${syncErr.message}`);
        }
        console.log(
          `  [Step 2 ${step2AlreadySentToday + sentStep2Report.length}/${step2DailyLimit}] [${cand.slug}] Inviato a ${cand.config.meta.companyName} (${email}) -> https://www.techpyre.eu/demo/${cand.slug}`
        );
      } catch (err) {
        console.error(`  [ERR] Step 2 [${cand.slug}]: ${err.message}`);
      }
    }
  } else {
    console.log(
      `\nFASE 1/3 · Aziende pronte per Step 2: ${preExistingStep2Candidates.length} (sotto soglia ${step2Threshold}).`
    );
  }

  // Fase 1B: Invio controllato Step 3 (Giorno 8 · Value Drop + Leva Asincrona WhatsApp)
  if (preExistingStep3Candidates.length > 0 && remainingStep3Allowed > 0) {
    console.log(
      `\nFASE 1B · Invio fino a ${remainingStep3Allowed} Step 3 (Value Drop + Leva Asincrona WhatsApp)...`
    );
    for (const cand of preExistingStep3Candidates) {
      if (sentStep3Report.length >= remainingStep3Allowed) break;
      const email = cand.config.meta.targetEmail;
      if (!(await hasValidMxRecord(email))) continue;
      try {
        const sendRes = await sendLeadOutreach({
          slug: cand.slug,
          stepNumber: 3,
          user,
          bypassBusinessHoursCheck: true,
          bypassRateLimitCheck: true,
          applyJitter: true,
        });
        sentStep3Report.push({
          slug: cand.slug,
          companyName: cand.config.meta.companyName,
          phone: cand.config.meta.phone,
          email,
          messageId: sendRes.messageId,
        });
        console.log(
          `  [Step 3 ${step3AlreadySentToday + sentStep3Report.length}/${step3DailyLimit}] [${cand.slug}] Inviato a ${cand.config.meta.companyName} (${email}) · Tel: ${cand.config.meta.phone}`
        );
      } catch (err) {
        console.error(`  [ERR] Step 3 [${cand.slug}]: ${err.message}`);
      }
    }
  }

  // Fase 1C: Invio controllato Step 4 (Giorno 13 · Breakup Email)
  if (preExistingStep4Candidates.length > 0 && remainingStep4Allowed > 0) {
    console.log(
      `\nFASE 1C · Invio fino a ${remainingStep4Allowed} Step 4 (Breakup Email)...`
    );
    for (const cand of preExistingStep4Candidates) {
      if (sentStep4Report.length >= remainingStep4Allowed) break;
      const email = cand.config.meta.targetEmail;
      if (!(await hasValidMxRecord(email))) continue;
      try {
        const sendRes = await sendLeadOutreach({
          slug: cand.slug,
          stepNumber: 4,
          user,
          bypassBusinessHoursCheck: true,
          bypassRateLimitCheck: true,
          applyJitter: true,
        });
        sentStep4Report.push({
          slug: cand.slug,
          companyName: cand.config.meta.companyName,
          email,
          messageId: sendRes.messageId,
        });
        console.log(
          `  [Step 4 ${step4AlreadySentToday + sentStep4Report.length}/${step4DailyLimit}] [${cand.slug}] Inviato a ${cand.config.meta.companyName} (${email})`
        );
      } catch (err) {
        console.error(`  [ERR] Step 4 [${cand.slug}]: ${err.message}`);
      }
    }
  }

  console.log(
    `\nFASE 2/3 · Scouting nuove aziende B2B e invio di ${remainingStep1Needed} Step 1 (target ${targetStep1Daily}/giorno).`
  );

  // Ruota le keyword in base al giorno dell'anno per esplorare nicchie sempre nuove
  const dayOfYear = Math.floor(Date.now() / 86400000);
  const rotatedKeywords = [
    ...B2B_KEYWORD_POOL.slice(dayOfYear % B2B_KEYWORD_POOL.length),
    ...B2B_KEYWORD_POOL.slice(0, dayOfYear % B2B_KEYWORD_POOL.length),
  ];

  const sentStep1Report = [];
  const newlyScoutedSlugs = [];
  let kwIdx = 0;

  while (
    sentStep1Report.length < remainingStep1Needed &&
    kwIdx < rotatedKeywords.length
  ) {
    // 1. Prova prima ad inviare ai lead Step 1 già disponibili nel database
    const { eligibleStep1 } = getEligibleLists();
    const newlyScoutedSet = new Set(newlyScoutedSlugs);
    eligibleStep1.sort((a, b) => {
      const aNew = newlyScoutedSet.has(a.slug) ? 0 : 1;
      const bNew = newlyScoutedSet.has(b.slug) ? 0 : 1;
      if (aNew !== bNew) return aNew - bNew;
      return (b.config.meta?.emailScore || 0) - (a.config.meta?.emailScore || 0);
    });

    for (const cand of eligibleStep1) {
      if (sentStep1Report.length >= remainingStep1Needed) break;
      const email = cand.config.meta.targetEmail;
      const mxOk = await hasValidMxRecord(email);
      if (!mxOk) {
        console.log(`  [SKIP] [${cand.slug}] (${email}): dominio privo di record MX valido.`);
        cand.config.meta.status = "INVALID_TICKET_INBOX";
        saveLeadConfig(cand.slug, cand.config);
        continue;
      }

      try {
        const sendRes = await sendLeadOutreach({
          slug: cand.slug,
          stepNumber: 1,
          user,
          bypassBusinessHoursCheck: true,
          bypassRateLimitCheck: true,
          applyJitter: true,
        });
        sentStep1Report.push({
          slug: cand.slug,
          companyName: cand.config.meta.companyName,
          city: cand.config.meta.city,
          email,
          lcp: cand.config.audit.originalLcpSeconds,
          messageId: sendRes.messageId,
        });
        try {
          await generateExcelCrm();
        } catch (syncErr) {
          console.warn(`    [WARN] Sync Excel: ${syncErr.message}`);
        }
        console.log(
          `  [Step 1 ${step1AlreadySentToday + sentStep1Report.length}/${targetStep1Daily}] [${cand.slug}] Inviato a ${cand.config.meta.companyName} (${email}) -> https://www.techpyre.eu/demo/${cand.slug}`
        );
      } catch (err) {
        console.error(`  [ERR] Step 1 [${cand.slug}]: ${err.message}`);
      }
    }

    if (sentStep1Report.length >= remainingStep1Needed) break;

    const kw = rotatedKeywords[kwIdx++];
    const stillNeeded = remainingStep1Needed - sentStep1Report.length;
    const batchScoutCount = Math.min(6, Math.max(2, stillNeeded));
    console.log(
      `  [SCOUT] Keyword: "${kw}" (ancora necessari: ${stillNeeded} Step 1)`
    );
    try {
      const res = await runAutonomousScout(kw, batchScoutCount, {
        preferAdLibrary: false,
        minLcpSeconds: 5.0,
      });
      for (const d of res.discovered || []) {
        newlyScoutedSlugs.push(d.slug);
        console.log(
          `    [NEW] Demo creata: [${d.slug}] ${d.companyName} (${d.city}) - LCP ${d.lcp}s - ${d.targetEmail}`
        );
      }
      await generateExcelCrm();
    } catch (err) {
      console.warn(`    [WARN] Scouting su "${kw}": ${err.message}`);
    }
  }

  console.log(`\nFASE 3/4 · Aggiornamento file Excel CRM e sincronizzazione Google Drive...`);
  const excelSummary = await generateExcelCrm();
  console.log("  Excel aggiornato:", JSON.stringify(excelSummary));

  console.log(`\nFASE 4/4 · Commit e push su GitHub (origin/main) per rendere live le nuove demo...`);
  try {
    spawnSync("git", ["add", "."], { stdio: "inherit", cwd: ROOT_DIR });
    const diffCheck = spawnSync("git", ["diff", "--cached", "--quiet"], { cwd: ROOT_DIR });
    if (diffCheck.status !== 0) {
      const commitMsg = `chore(outbound): daily outbound sync - ${new Date().toLocaleDateString("it-IT", { timeZone: "Europe/Rome" })} - S1: ${sentStep1Report.length}, S2: ${sentStep2Report.length}, S3: ${sentStep3Report.length}, S4: ${sentStep4Report.length}`;
      const commitRes = spawnSync("git", ["commit", "-m", commitMsg], { stdio: "inherit", cwd: ROOT_DIR });
      if (commitRes.status === 0) {
        console.log("  [GIT] Commit eseguito con successo.");
        const pushRes = spawnSync("git", ["push", "origin", "main"], { stdio: "inherit", cwd: ROOT_DIR });
        if (pushRes.status === 0) {
          console.log("  [GIT] Push su GitHub origin/main completato!");
        } else {
          console.warn("  [WARN] git push status:", pushRes.status);
        }
      }
    } else {
      console.log("  [GIT] Nessuna modifica da committare su git.");
    }
  } catch (gitErr) {
    console.warn("  [WARN] Errore sincronizzazione Git:", gitErr.message);
  }

  try {
    console.log("\n[DEPLOY] Aggiornamento Vercel Production per attivare le nuove demo su techpyre.eu...");
    spawnSync("vercel", ["--prod", "--yes"], { stdio: "inherit", cwd: ROOT_DIR });
    console.log("  [DEPLOY] Vercel Production aggiornato!");
  } catch (deployErr) {
    console.warn("  [WARN] Vercel deploy:", deployErr.message);
  }

  console.log("\nAUTOMAZIONE GIORNALIERA COMPLETATA");
  console.log(
    JSON.stringify(
      {
        step1SentToday: sentStep1Report.length,
        step2AvailableBeforeRun: preExistingStep2Candidates.length,
        step2SentToday: sentStep2Report.length,
        step3SentToday: sentStep3Report.length,
        step4SentToday: sentStep4Report.length,
        excelFile: excelSummary.outputPath,
        googleDriveUrl: excelSummary.googleDriveUrl,
        googleDriveSynced: excelSummary.googleDriveSynced,
        sentStep1Report,
        sentStep2Report,
        sentStep3Report,
        sentStep4Report,
        kpi: excelSummary,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error("Errore fatale in daily-outbound-automation:", err);
  process.exit(1);
});
