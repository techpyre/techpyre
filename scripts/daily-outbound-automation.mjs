#!/usr/bin/env node
/**
 * ============================================================================
 * TECHPYRE STUDIO · AUTOMAZIONE GIORNALIERA B2B OUTBOUND (`daily-outbound-automation.mjs`)
 * ============================================================================
 * Flusso giornaliero automatico (Lun-Ven ore 09:00 Europe/Rome):
 *   1. Migrazione e sanitizzazione database lead (`migrateOldLeadConfig`)
 *   2. Scouting e qualifica di nuove aziende B2B reali (LCP >= 5.0s, MX valido,
 *      zero PagineGialle/brand terzi) + invio di 35 nuovi Step 1 (First Touch).
 *   3. Controllo delle aziende disponibili per lo Step 2 (`CONTACTED_STEP_1`):
 *      se sono >= 40, invia automaticamente lo Step 2 in-thread col link demo.
 *   4. Generazione/aggiornamento del file Excel formattato `TechPyre_Outbound_CRM.xlsx`.
 *   5. Commit e push automatico su GitHub (`origin/main`) delle nuove demo e log.
 * ============================================================================
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
      PATH: `/Applications/Antigravity.app/Contents/Resources/bin:/Users/riccardogranza/.gemini/antigravity/bin:/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ""}`,
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

// Pool rotativo di keyword B2B ad alto scontrino in tutta Italia
const B2B_KEYWORD_POOL = [
  "carpenteria metallica brescia",
  "automazione industriale bergamo",
  "impianti fotovoltaici industriali padova",
  "lavorazioni meccaniche cnc vicenza",
  "impianti elettrici industriali verona",
  "serramenti alluminio treviso",
  "stampaggio materie plastiche bologna",
  "impianti aspirazione industriale modena",
  "macchine utensili torino",
  "quadri elettrici automazione parma",
  "carpenteria pesante reggio emilia",
  "impianti climatizzazione industriale milano",
  "logistica integrata magazzini piacenza",
  "trattamenti galvanici metalli brescia",
  "verniciatura industriale bergamo",
  "costruzioni meccaniche monza",
  "impianti termoidraulici industriali verona",
  "prefabbricati industriali mantova",
  "infissi pvc alluminio bologna",
  "soluzioni imballaggio industriale parma",
  "taglio laser lamiera vicenza",
  "saldatura robotizzata padova",
  "oleodinamica pneumatica modena",
  "nastri trasportatori industriali torino",
  "compressori industriali milano",
  "bonifiche ambientali industriali brescia",
  "porte rapide industriali treviso",
  "scaffalature industriali magazzino verona",
  "gruppi elettrogeni industriali bologna",
  "impianti antincendio industriali padova",
  "serramenti legno alluminio udine",
  "carpenteria meccanica cuneo",
  "infissi alluminio pordenone",
  "automazioni industriali forli",
  "costruzione stampi lamiere lecco",
  "impianti depurazione acque varese",
  "carpenteria metallica ravenna",
  "lavorazione lamiera cnc como",
  "macchine confezionatrici packaging bologna",
  "strutture metalliche prefabbricate piacenza",
  "carpenteria navale industriale trieste",
  "tubazioni industriali saldate ferrara",
  "impianti filtrazione aria vicenza",
  "meccanica precisione brescia",
  "cabine trasformazione mt bt bergamo",
  "robotica industriale saldatura torino",
  "impianti vapore industriale parma",
  "serramenti facciate continue verona",
  "carpenteria medio pesante treviso",
  "stampaggio gomma plastica monza",
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
  const step1SentAtMap = new Map();

  for (const h of history) {
    const s =
      h.stepNumber ||
      (h.type === "FOLLOW_UP" ||
      h.type === "STEP_2" ||
      h.type === "FOLLOW_UP_CREDENTIALS_AND_OFFER"
        ? 2
        : 1);
    const prev = sentStepMap.get(h.slug) || 0;
    if (s > prev) sentStepMap.set(h.slug, s);

    const rec = String(h.recipient || "").trim().toLowerCase();
    if (rec && s >= 1) sentEmailStep1.add(rec);
    if (rec && s >= 2) sentEmailStep2.add(rec);
    if (s === 1 && !step1SentAtMap.has(h.slug)) {
      step1SentAtMap.set(h.slug, new Date(h.sentAt || 0).getTime());
    }
  }

  const seenStep1Emails = new Set();
  const eligibleStep1 = [];

  const seenStep2Emails = new Set();
  const eligibleStep2 = [];

  for (const { slug, config } of all) {
    const migrated = migrateOldLeadConfig(config, true);
    let status = migrated.meta?.status || "NEW";
    if (status === "NEW" && sentStepMap.has(slug)) {
      status = sentStepMap.get(slug) >= 2 ? "CONTACTED_STEP_2" : "CONTACTED_STEP_1";
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

    // Candidati Step 2 (solo aziende che hanno effettivamente ricevuto lo Step 1: status === "CONTACTED_STEP_1" oppure lastStep === 1)
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
  }

  // Ordine cronologico per Step 2 (prima le aziende contattate da più tempo)
  eligibleStep2.sort((a, b) => a.step1Time - b.step1Time);

  return { eligibleStep1, eligibleStep2 };
}

async function main() {
  const user = {
    username: "riccardogranza",
    displayName: "Riccardo Granza",
    role: "admin",
    title: "Fondatore & Architetto di Sistemi Digitali - TechPyre Studio",
  };

  const targetStep1Daily = DAILY_FIRST_TOUCH_LIMIT; // 35
  const step2Threshold = 40;
  const step2DailyLimit = 40;

  // Calcola quanti Step 1 e Step 2 sono già stati inviati oggi (Europe/Rome) per essere 100% idempotente
  const todayRomeKey = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Rome",
  });
  const historyBefore = getOutreachHistory();
  let step1AlreadySentToday = 0;
  let step2AlreadySentToday = 0;
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
      (h.type === "FOLLOW_UP" ||
      h.type === "STEP_2" ||
      h.type === "FOLLOW_UP_CREDENTIALS_AND_OFFER"
        ? 2
        : 1);
    if (s === 1) step1AlreadySentToday++;
    if (s === 2) step2AlreadySentToday++;
  }

  const remainingStep1Needed = Math.max(0, targetStep1Daily - step1AlreadySentToday);
  const remainingStep2Allowed = Math.max(0, step2DailyLimit - step2AlreadySentToday);

  console.log("================================================================================");
  console.log("🚀 AVVIO AUTOMAZIONE GIORNALIERA TECHPYRE STUDIO (B2B OUTBOUND & EXCEL CRM)");
  console.log(`🕒 Data/Ora: ${new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" })} (Europe/Rome)`);
  console.log(
    `📈 Gia inviati oggi (${todayRomeKey}): Step 1 = ${step1AlreadySentToday}/${targetStep1Daily} · Step 2 = ${step2AlreadySentToday}/${step2DailyLimit}`
  );
  console.log("================================================================================\n");

  // FASE 1: CONTROLLO DISPONIBILITÀ STEP 2 PRIMA DEI NUOVI INVII (solo lead già contattati nei giorni precedenti)
  const initialCheck = getEligibleLists();
  const preExistingStep2Candidates = initialCheck.eligibleStep2;
  console.log(
    `📊 Controllo Step 2: ${preExistingStep2Candidates.length} aziende in stato CONTACTED_STEP_1 disponibili (Soglia minima: ${step2Threshold}, Max blocco giornaliero: ${step2DailyLimit}).`
  );

  // FASE 2: INVIO STEP 2 SOLO A MASSIMO 40 AZIENDE ALLA VOLTA (SE SONO DISPONIBILI >= 40 AZIENDE IN CONTACTED_STEP_1)
  const sentStep2Report = [];
  const totalStep2PoolIncludingToday =
    preExistingStep2Candidates.length + step2AlreadySentToday;
  if (totalStep2PoolIncludingToday >= step2Threshold && remainingStep2Allowed > 0) {
    console.log(
      `\n🚀 FASE 1/3 · Soglia Step 2 attiva (${preExistingStep2Candidates.length} disponibili, max 40/giorno)! Invio fino a ${remainingStep2Allowed} Step 2 rimanenti di oggi in ordine cronologico...`
    );
    for (const cand of preExistingStep2Candidates) {
      if (sentStep2Report.length >= remainingStep2Allowed) break;
      const email = cand.config.meta.targetEmail;
      const mxOk = await hasValidMxRecord(email);
      if (!mxOk) {
        console.log(`  ⏭️  Skip Step 2 [${cand.slug}] (${email}): MX non valido.`);
        cand.config.meta.status = "INVALID_TICKET_INBOX";
        saveLeadConfig(cand.slug, cand.config);
        continue;
      }
      const demoOk = await isLiveDemoReachable(cand.slug);
      if (!demoOk) {
        console.log(
          `  ⏭️  Skip Step 2 [${cand.slug}]: demo https://www.techpyre.eu/demo/${cand.slug} non risponde HTTP 200 (attende prossimo deploy).`
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
        // Sincronizza immediatamente il file Excel CRM e Google Drive dopo ogni singolo invio
        try {
          await generateExcelCrm();
        } catch (syncErr) {
          console.warn(`    ⚠️ Sync Excel warning: ${syncErr.message}`);
        }
        console.log(
          `  🚀 [Step 2 ${step2AlreadySentToday + sentStep2Report.length}/${step2DailyLimit}] [${cand.slug}] Follow-Up Link inviato a ${cand.config.meta.companyName} (${email}) -> https://www.techpyre.eu/demo/${cand.slug} (Excel + Drive sincronizzati)`
        );
      } catch (err) {
        console.error(`  ❌ Errore invio Step 2 [${cand.slug}]: ${err.message}`);
      }
    }
  } else {
    console.log(
      `\nℹ️  FASE 1/3 · Aziende pronte per Step 2: ${preExistingStep2Candidates.length} (sotto la soglia di ${step2Threshold}). Lo Step 2 verrà inviato non appena il bacino raggiunge ${step2Threshold}+ aziende.`
    );
  }

  // FASE 3: SCOUTING DI NUOVE AZIENDE B2B + INVIO FINO A 35 STEP 1 GIORNALIERI
  console.log(
    `\n🔎 FASE 2/3 · Scouting nuove aziende B2B e invio di ${remainingStep1Needed} Step 1 mancanti per raggiungere ${targetStep1Daily}/giorno...`
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
        console.log(`  ⏭️  Skip [${cand.slug}] (${email}): dominio privo di record MX valido.`);
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
        // Sincronizza immediatamente il file Excel CRM e Google Drive dopo ogni singolo invio
        try {
          await generateExcelCrm();
        } catch (syncErr) {
          console.warn(`    ⚠️ Sync Excel warning: ${syncErr.message}`);
        }
        console.log(
          `  📨 [Step 1 ${step1AlreadySentToday + sentStep1Report.length}/${targetStep1Daily}] [${cand.slug}] Inviato a ${cand.config.meta.companyName} (${email}) -> https://www.techpyre.eu/demo/${cand.slug} (Excel + Drive sincronizzati)`
        );
      } catch (err) {
        console.error(`  ❌ Errore invio Step 1 [${cand.slug}]: ${err.message}`);
      }
    }

    if (sentStep1Report.length >= remainingStep1Needed) break;

    // 2. Se mancano ancora lead per raggiungere la quota, cerca la prossima keyword
    const kw = rotatedKeywords[kwIdx++];
    const stillNeeded = remainingStep1Needed - sentStep1Report.length;
    const batchScoutCount = Math.min(6, Math.max(2, stillNeeded));
    console.log(
      `  🌐 Scouting live su keyword: "${kw}" (ancora necessari: ${stillNeeded} Step 1)...`
    );
    try {
      const res = await runAutonomousScout(kw, batchScoutCount, {
        preferAdLibrary: false,
        minLcpSeconds: 5.0,
      });
      for (const d of res.discovered || []) {
        newlyScoutedSlugs.push(d.slug);
        console.log(
          `    ✅ Nuova Demo creata: [${d.slug}] ${d.companyName} (${d.city}) - LCP ${d.lcp}s - ${d.targetEmail}`
        );
      }
      // Sincronizza subito Excel e Google Drive con i nuovi lead scoperti
      await generateExcelCrm();
    } catch (err) {
      console.warn(`    ⚠️ Errore scouting su "${kw}": ${err.message}`);
    }
  }

  // FASE 4: AGGIORNAMENTO FINALE EXCEL CRM
  console.log(`\n📊 FASE 3/3 · Aggiornamento finale file Excel formattato TechPyre_Outbound_CRM.xlsx...`);
  const excelSummary = await generateExcelCrm();
  console.log("  ✅ Excel aggiornato:", JSON.stringify(excelSummary));

  // FASE 5: COMMIT & PUSH AUTOMATICO SU GITHUB PER RENDERE LIVE LE DEMO SU TECHPYRE.EU
  try {
    spawnSync("git", ["add", "-A"], { stdio: "inherit", cwd: ROOT_DIR });
    const commitMsg = `chore(outbound): daily automation (${sentStep1Report.length} Step 1, ${sentStep2Report.length} Step 2, Excel CRM updated)`;
    spawnSync("git", ["commit", "-m", commitMsg], { stdio: "inherit", cwd: ROOT_DIR });
    spawnSync("git", ["push", "origin", "main"], { stdio: "inherit", cwd: ROOT_DIR });

    // Verifica post-deploy che le nuove demo siano effettivamente HTTP 200 live su techpyre.eu
    const probeSlug = sentStep1Report[0]?.slug || newlyScoutedSlugs[0];
    if (probeSlug) {
      console.log(`\n🌐 Verifica deploy live su https://www.techpyre.eu/demo/${probeSlug}...`);
      let liveReady = false;
      for (let attempt = 1; attempt <= 12; attempt++) {
        liveReady = await isLiveDemoReachable(probeSlug);
        if (liveReady) {
          console.log(`  ✅ Deploy live verificato (HTTP 200 OK su https://www.techpyre.eu/demo/${probeSlug})!`);
          break;
        }
        await new Promise((r) => setTimeout(r, 8000));
      }
      if (!liveReady) {
        console.warn(`  ⚠️ Il deploy GitHub sta impiegando più tempo, avvio deploy diretto Vercel CLI...`);
        spawnSync("vercel", ["--prod", "--yes"], { stdio: "inherit", cwd: ROOT_DIR });
      }
    }
  } catch (err) {
    console.warn("⚠️ Git push warning:", err.message);
  }

  console.log("\n================================================================================");
  console.log("✅ AUTOMAZIONE GIORNALIERA COMPLETATA CON SUCCESSO");
  console.log(
    JSON.stringify(
      {
        step1SentToday: sentStep1Report.length,
        step2AvailableBeforeRun: preExistingStep2Candidates.length,
        step2SentToday: sentStep2Report.length,
        excelFile: excelSummary.outputPath,
        kpi: excelSummary,
      },
      null,
      2
    )
  );
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("❌ Errore fatale in daily-outbound-automation:", err);
  process.exit(1);
});
