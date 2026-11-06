#!/usr/bin/env node
/**
 * ============================================================================
 * TECHPYRE STUDIO · UNIFIED OUTBOUND & DEMO ENGINE CLI (`techpyre-cli.mjs`)
 * ============================================================================
 * Comandi principali:
 *   node scripts/techpyre-cli.mjs help
 *   node scripts/techpyre-cli.mjs scout --keywords="infissi catania" --count=5 [--min-lcp=5.0] [--send]
 *   node scripts/techpyre-cli.mjs dryrun [--keywords="infissi catania,impianti fotovoltaici brescia"]
 *   node scripts/techpyre-cli.mjs list [--status=NEW|CONTACTED_STEP_1|HOT_LEAD|INVALID_TICKET_INBOX] [--limit=30]
 *   node scripts/techpyre-cli.mjs inspect <slug>
 *   node scripts/techpyre-cli.mjs send <slug> [--step=1|2|3|4] [--force]
 *   node scripts/techpyre-cli.mjs send --batch=10 [--step=1|2|3|4] [--force]
 *   node scripts/techpyre-cli.mjs classify-reply <slug> --text="..." [--subject="Re: ..."]
 *   node scripts/techpyre-cli.mjs migrate
 * ============================================================================
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

// Auto-bootstrap con `npx tsx` per supportare import TypeScript e path alias `@/*`
if (!process.env.__TECHPYRE_CLI_TSX) {
  const res = spawnSync("npx", ["tsx", __filename, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: {
      ...process.env,
      PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ""}`,
      __TECHPYRE_CLI_TSX: "1",
    },
  });
  process.exit(res.status ?? 0);
}

// Carica variabili d'ambiente da .env.local
const envLocalPath = path.join(process.cwd(), ".env.local");
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
  discoverItalianBusinesses,
  selectBestDecisionMakerEmail,
  extractDecisionMakerFromHtml,
  detectActiveAdTracking,
  buildMultiStepOutreach,
  isHardBlockedEmail,
  migrateOldLeadConfig,
} = await import("../src/lib/scoutService.ts");

const { loadLeadConfig, listAllLeadConfigs } = await import(
  "../src/lib/leadsStorage.ts"
);

const {
  sendLeadOutreach,
  classifyInboundReply,
  getOutreachHistory,
  getTodayFirstTouchCountForSender,
  DAILY_FIRST_TOUCH_LIMIT,
} = await import("../src/lib/emailService.ts");

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq > 0) {
        const key = arg.slice(2, eq).trim();
        const val = arg.slice(eq + 1).trim();
        flags[key] = val;
      } else {
        flags[arg.slice(2).trim()] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { command: positional[0] || "help", positional: positional.slice(1), flags };
}

function getDefaultUser(usernameFlag) {
  const username = String(usernameFlag || "riccardogranza");
  return {
    username,
    displayName:
      username === "riccardogranza"
        ? "Riccardo Granza"
        : username.charAt(0).toUpperCase() + username.slice(1),
    role: username === "riccardogranza" ? "admin" : "special",
    title: "Fondatore & Architetto di Sistemi Digitali · TechPyre Studio",
  };
}

function printHelp() {
  console.log(`
================================================================================
🔥 TECHPYRE STUDIO · CLI OPERATIVA OUTBOUND B2B & DEMO ENGINE
================================================================================

COMANDI DISPONIBILI:

  1. SCOUTING + GENERAZIONE DEMO (+ INVIO OPZIONALE)
     Cerca aziende reali (Meta Ad Library + Web B2B), misura LCP mobile reale,
     scarica sottopagine (/contatti, /chi-siamo, /privacy-policy), calcola lo
     score email, estrae il titolare, genera la demo Next.js e i 4 step email:

     npm run tp -- scout --keywords="infissi catania,serramenti brescia" --count=5
     npm run tp -- scout --keywords="fotovoltaico bergamo" --count=3 --min-lcp=5.0 --send

  2. DRY-RUN DI VALIDAZIONE (TEST SENZA SALVARE NÉ INVIARE)
     Testa estrazione titolare, scoring email anti-ticket e rilevamento pixel
     su 3 keyword reali stampando il report JSON:

     npm run tp -- dryrun
     npm run tp -- dryrun --keywords="carpenteria milano,automazione bologna"

  3. LISTA E FILTRO DEI LEAD NEL DATABASE
     Visualizza i lead generati, filtrabili per stato:

     npm run tp -- list
     npm run tp -- list --status=NEW --limit=25
     npm run tp -- list --status=CONTACTED_STEP_1
     npm run tp -- list --status=HOT_LEAD
     npm run tp -- list --status=INVALID_TICKET_INBOX

  4. ISPEZIONE COMPLETA DI UN LEAD + LINK DEMO + 4 STEP EMAIL
     Mostra tutti i dettagli tecnici, l'URL della demo e i 4 testi email:

     npm run tp -- inspect <slug>

  5. INVIO EMAIL (SINGOLO O BATCH) CON SMTP THREADING REALE
     Invia lo Step 1 (First Touch, zero link) o i Follow-up In-Thread (Step 2, 3, 4)
     con header MIME Message-ID / In-Reply-To / References e sync Aruba Sent.
     Usa --force per inviare anche fuori dall'orario 08:30-17:30:

     npm run tp -- send <slug> --step=1 [--force]
     npm run tp -- send <slug> --step=2 [--force]
     npm run tp -- send <slug> --step=3 [--force]
     npm run tp -- send <slug> --step=4 [--force]
     npm run tp -- send --batch=10 --step=1 [--force]

  6. CLASSIFICAZIONE RISPOSTE INBOUND & GENERAZIONE RISPOSTA SU MISURA
     Classifica una risposta ricevuta (AUTO_REPLY_OR_TICKET, POSITIVE_REQUEST_LINK,
     SKEPTICAL_OR_OBJECTION, UNSUBSCRIBE_OR_NO) e aggiorna lo stato del lead:

     npm run tp -- classify-reply <slug> --subject="Re: ..." --text="Quanto costa?"

  7. MIGRAZIONE E PULIZIA LEAD STORICI (BACKWARD COMPATIBILITY & PURGE)
     Aggiorna tutti i JSON in src/data/leads/, blocca le caselle di ticketing
     (assistenza@, privacy@, pec@) e rigenera i 4 step Zero-Fluff:

     npm run tp -- migrate

================================================================================
`);
}

async function cmdMigrate() {
  const leadsDir = path.join(process.cwd(), "src", "data", "leads");
  const files = fs
    .readdirSync(leadsDir)
    .filter(
      (f) =>
        f.endsWith(".json") &&
        f !== "outreach-history.json" &&
        f !== "leads-status.json"
    );

  let total = 0;
  let purged = 0;
  let upgradedEmails = 0;
  let nominalDecisionMakers = 0;

  for (const file of files) {
    const fullPath = path.join(leadsDir, file);
    try {
      const raw = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
      const prevEmail = raw.meta?.targetEmail;
      const migrated = migrateOldLeadConfig(raw, true);
      total++;
      if (
        migrated.meta?.status === "INVALID_TICKET_INBOX" ||
        migrated.meta?.status === "BLACKLISTED"
      ) {
        purged++;
      }
      if (migrated.meta?.targetEmail !== prevEmail) {
        upgradedEmails++;
      }
      if (migrated.meta?.decisionMakerFirstName) {
        nominalDecisionMakers++;
      }
    } catch {
      continue;
    }
  }

  console.log("✅ MIGRAZIONE COMPLETATA CON SUCCESSO:");
  console.log(
    JSON.stringify(
      {
        totalLeadsProcessed: total,
        purgedTicketOrBlockedInboxes: purged,
        upgradedEmailsFromPreflight: upgradedEmails,
        leadsWithRealDecisionMakerName: nominalDecisionMakers,
      },
      null,
      2
    )
  );
}

async function cmdList(flags) {
  const all = listAllLeadConfigs();
  const history = getOutreachHistory();
  const sentSlugs = new Set(history.map((h) => h.slug));

  const statusFilter = flags.status ? String(flags.status).toUpperCase() : null;
  const limit = Number(flags.limit || 40);

  const filtered = all.filter(({ slug, config }) => {
    const effectiveStatus =
      config.meta.status || (sentSlugs.has(slug) ? "CONTACTED_STEP_1" : "NEW");
    if (!statusFilter) return true;
    return effectiveStatus === statusFilter;
  });

  console.log(
    `\n📋 LEAD TROVATI: ${filtered.length} (Totale DB: ${all.length}) · Mostrati primi ${Math.min(
      limit,
      filtered.length
    )}\n`
  );

  const rows = filtered.slice(0, limit).map(({ slug, config }) => {
    const effectiveStatus =
      config.meta.status || (sentSlugs.has(slug) ? "CONTACTED_STEP_1" : "NEW");
    return {
      slug,
      company: config.meta.companyName.slice(0, 26),
      email: config.meta.targetEmail,
      score: config.meta.emailScore ?? "-",
      decisionMaker: config.meta.decisionMakerName.slice(0, 24),
      lcp: `${config.audit.originalLcpSeconds}s`,
      ads: config.audit.runsAds ? "YES" : "NO",
      status: effectiveStatus,
    };
  });

  console.table(rows);
}

async function cmdInspect(slug) {
  if (!slug) {
    console.error("❌ Specifica lo slug del lead: npm run tp -- inspect <slug>");
    process.exit(1);
  }
  const lead = loadLeadConfig(slug);
  if (!lead) {
    console.error(`❌ Lead [${slug}] non trovato in src/data/leads/${slug}.json`);
    process.exit(1);
  }

  const demoLocal = `http://localhost:3000/demo/${lead.slug}`;
  const demoProd = `https://www.techpyre.eu/demo/${lead.slug}`;
  const s1Words = (lead.outreach.step1FirstTouch?.body || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  console.log(`
================================================================================
🔍 ISPEZIONE LEAD: ${lead.meta.companyName} (${lead.slug})
================================================================================
Stato Attuale          : ${lead.meta.status || "NEW"}
Decision Maker         : ${lead.meta.decisionMakerName} (${lead.meta.decisionMakerRole || "N/D"})
Email Target           : ${lead.meta.targetEmail} (Score: ${lead.meta.emailScore ?? "N/D"} | Generica: ${lead.meta.isGenericInbox ? "SÌ" : "NO"})
Telefono               : ${lead.meta.phone}
Città / P.IVA          : ${lead.meta.city} · P.IVA: ${lead.meta.vatNumber || "N/D"}
Sito Originale         : ${lead.meta.originalLandingUrl}
LCP Mobile Reale       : ${lead.audit.originalLcpSeconds}s (Score: ${lead.audit.mobileScore}/100 | Blocchi: ${lead.audit.renderBlockingCount ?? "N/D"})
Campagne / Pixel       : ${lead.audit.runsAds ? `ATTIVE (${(lead.audit.detectedTrackingSignals || []).join(", ")})` : "NON RILEVATE (Angolo Preventivi & CRM)"}
Ultimo Message-ID SMTP : ${lead.meta.lastSentMessageId || "Nessun invio registrato"}
Demo Locale            : ${demoLocal}
Demo Produzione        : ${demoProd}

--- 3 CRITICITÀ RILEVATE ---
1. ${lead.audit.threeCriticalFlaws[0]}
2. ${lead.audit.threeCriticalFlaws[1]}
3. ${lead.audit.threeCriticalFlaws[2]}

================================================================================
📨 SEQUENZA OUTBOUND 4-STEP (ZERO-FLUFF PROTOCOL)
================================================================================

[STEP 1 · GIORNO 1 · FIRST TOUCH (${s1Words} parole, Zero Link)]
Oggetto: ${lead.outreach.step1FirstTouch?.subject || lead.outreach.emailSubject}
--------------------------------------------------------------------------------
${lead.outreach.step1FirstTouch?.body || lead.outreach.emailPlainTextBody}

[STEP 2 · GIORNO 4 · FOLLOW-UP IN-THREAD + LINK DEMO]
Oggetto: ${lead.outreach.step2FollowUpLink?.subject}
--------------------------------------------------------------------------------
${lead.outreach.step2FollowUpLink?.body || lead.outreach.followUpWithLinkBody}

[STEP 3 · GIORNO 8 · VALUE DROP + TRIGGER CHIAMATA (requiresFollowUpCall: ${lead.outreach.step3ValueDropAndCallTrigger?.requiresFollowUpCall})]
Oggetto: ${lead.outreach.step3ValueDropAndCallTrigger?.subject}
--------------------------------------------------------------------------------
${lead.outreach.step3ValueDropAndCallTrigger?.body}

[STEP 4 · GIORNO 13 · BREAKUP EMAIL IN-THREAD]
Oggetto: ${lead.outreach.step4Breakup?.subject}
--------------------------------------------------------------------------------
${lead.outreach.step4Breakup?.body}
================================================================================
`);
}

async function cmdScout(flags) {
  const rawKw = String(
    flags.keywords ||
      flags.keyword ||
      "serramenti milano,fotovoltaico brescia,carpenteria metallica bergamo"
  );
  const keywords = rawKw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const count = Number(flags.count || 3);
  const minLcp = Number(flags["min-lcp"] || 5.0);
  const autoSend = Boolean(flags.send);
  const user = getDefaultUser(flags.user);

  console.log(
    `🚀 Avvio Scouting Autonomo TechPyre: keywords=[${keywords.join(
      ", "
    )}], target=${count}, minLcp=${minLcp}s, autoSend=${autoSend}`
  );

  const result = await runAutonomousScout({
    keywords,
    targetCount: count,
    minLcp,
    autoSend,
    user,
  });

  console.log("\n✅ RISULTATO SCOUTING:");
  console.log(JSON.stringify(result, null, 2));
}

async function cmdDryRun(flags) {
  const rawKw = String(
    flags.keywords ||
      flags.keyword ||
      "infissi catania,impianti fotovoltaici brescia,carpenteria metallica milano"
  );
  const keywords = rawKw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const SUBPAGE_PATHS = [
    "/contatti",
    "/chi-siamo",
    "/azienda",
    "/team",
    "/privacy-policy",
  ];

  async function fetchHtml(url, timeoutMs = 4000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
        redirect: "follow",
      });
      if (!res.ok) return "";
      return await res.text();
    } catch {
      return "";
    } finally {
      clearTimeout(timer);
    }
  }

  function extractEmails(html) {
    if (!html) return [];
    const decoded = html
      .replace(/&#64;/g, "@")
      .replace(/\[at\]/gi, "@")
      .replace(/\(at\)/gi, "@");
    const matches =
      decoded.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const mailtos = [
      ...decoded.matchAll(/href=["']mailto:([^"'?&\s]+)["']/gi),
    ].map((m) => m[1]);
    return [...mailtos, ...matches];
  }

  const reports = [];
  for (const kw of keywords) {
    const candidates = await discoverItalianBusinesses(kw, 12);
    let matchedReport = null;

    for (const cand of candidates) {
      if (!cand.url || cand.url.includes("paginegialle.it")) continue;
      const homeHtml = await fetchHtml(cand.url, 5500);
      if (!homeHtml || homeHtml.length < 300) continue;

      let origin = "";
      try {
        origin = new URL(cand.url).origin;
      } catch {
        continue;
      }

      const subSettled = await Promise.allSettled(
        SUBPAGE_PATHS.map((p) => fetchHtml(`${origin}${p}`, 3500))
      );
      const subHtmls = subSettled
        .filter((r) => r.status === "fulfilled" && r.value && r.value.length > 200)
        .map((r) => r.value);

      const combinedHtml = [homeHtml, ...subHtmls].join("\n");
      const orderedEmails = [...extractEmails(combinedHtml)];
      if (cand.fallbackEmail) orderedEmails.push(cand.fallbackEmail);

      const scored = selectBestDecisionMakerEmail(orderedEmails, cand.url);
      if (!scored.bestEmail || isHardBlockedEmail(scored.bestEmail)) continue;

      const dm = extractDecisionMakerFromHtml(combinedHtml, scored.bestEmail);
      const ads = detectActiveAdTracking(combinedHtml, false);
      const blockingCount = Math.max(
        4,
        (homeHtml.match(/<script\b[^>]*src=/gi) || []).length +
          (homeHtml.match(/<link\b[^>]*rel=["']stylesheet["']/gi) || []).length
      );

      const outreach = buildMultiStepOutreach({
        slug: cand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        companyName: cand.name,
        decisionMaker: dm,
        isGenericInbox: scored.isGeneric,
        estimatedMobileLcpSeconds: 6.7,
        renderBlockingScripts: blockingCount,
        runsAds: ads.runsAds,
      });

      matchedReport = {
        keyword: kw,
        companyName: cand.name,
        websiteUrl: cand.url,
        targetEmail: scored.bestEmail,
        emailScore: scored.score,
        isGenericInbox: scored.isGeneric,
        decisionMakerName: dm.fullName || `Direzione ${cand.name}`,
        decisionMakerRole: dm.role || "Direzione Aziendale",
        runsAds: ads.runsAds,
        detectedTrackingSignals: ads.signals,
        emailSubject: outreach.emailSubject,
        step1WordCount: outreach.step1FirstTouch.body
          .trim()
          .split(/\s+/)
          .filter(Boolean).length,
      };
      break;
    }

    reports.push(
      matchedReport || {
        keyword: kw,
        error: "Nessun candidato con dominio esterno valido ed email conforme trovato",
      }
    );
  }

  console.log(JSON.stringify(reports, null, 2));
}

async function cmdSend(positional, flags) {
  const stepNumber = Number(flags.step || 1);
  if (![1, 2, 3, 4].includes(stepNumber)) {
    console.error("❌ --step deve essere 1, 2, 3 oppure 4");
    process.exit(1);
  }
  const bypassHours = Boolean(flags.force);
  const user = getDefaultUser(flags.user);

  // Modalità Batch: npm run tp -- send --batch=10 --step=1 [--force]
  if (flags.batch) {
    const batchCount = Number(flags.batch);
    const all = listAllLeadConfigs();
    const history = getOutreachHistory();
    const sentStepMap = new Map();
    for (const h of history) {
      const s = h.stepNumber || (h.type === "FOLLOW_UP" ? 2 : 1);
      const prev = sentStepMap.get(h.slug) || 0;
      if (s > prev) sentStepMap.set(h.slug, s);
    }

    const eligible = all.filter(({ slug, config }) => {
      if (
        config.meta.status === "BLACKLISTED" ||
        config.meta.status === "INVALID_TICKET_INBOX" ||
        config.meta.status === "HOT_LEAD"
      ) {
        return false;
      }
      if (isHardBlockedEmail(config.meta.targetEmail)) return false;
      const lastStep = sentStepMap.get(slug) || 0;
      return lastStep === stepNumber - 1;
    });

    const toSend = eligible.slice(0, batchCount);
    console.log(
      `📨 Invio Batch Step ${stepNumber}: ${toSend.length} lead selezionati (su ${eligible.length} idonei)...`
    );

    for (const { slug } of toSend) {
      try {
        const res = await sendLeadOutreach({
          slug,
          stepNumber,
          user,
          bypassBusinessHoursCheck: bypassHours,
          applyJitter: true,
        });
        console.log(`  ✅ [${slug}] ${res.message} (${res.messageId})`);
      } catch (err) {
        console.error(`  ❌ [${slug}] ${err.message}`);
      }
    }
    return;
  }

  // Modalità Singolo Lead: npm run tp -- send <slug> --step=1 [--force]
  const slug = positional[0];
  if (!slug) {
    console.error(
      "❌ Specifica uno slug (`npm run tp -- send <slug> --step=1`) oppure `--batch=N`"
    );
    process.exit(1);
  }

  const res = await sendLeadOutreach({
    slug,
    stepNumber,
    user,
    bypassBusinessHoursCheck: bypassHours,
    applyJitter: false,
  });
  console.log(`\n✅ ${res.message}`);
  console.log(`🔗 Message-ID registrato per Threading: ${res.messageId}`);
  if (res.requiresFollowUpCall) {
    console.log(`📞 AZIONE TELEFONICA RICHIESTA: Chiama ${res.phoneToCall}`);
  }
}

async function cmdClassifyReply(positional, flags) {
  const slug = positional[0];
  const replyText = String(flags.text || "");
  const replySubject = String(flags.subject || "");

  if (!replyText) {
    console.error(
      '❌ Specifica il testo della risposta: npm run tp -- classify-reply <slug> --text="..."'
    );
    process.exit(1);
  }

  const lead = slug ? loadLeadConfig(slug) : undefined;
  const result = classifyInboundReply(replyText, replySubject, lead || undefined);
  console.log("\n🧠 CLASSIFICAZIONE RISPOSTA INBOUND:");
  console.log(JSON.stringify(result, null, 2));
}

const { command, positional, flags } = parseArgs(process.argv.slice(2));

switch (command) {
  case "help":
  case "--help":
  case "-h":
    printHelp();
    break;
  case "migrate":
    await cmdMigrate();
    break;
  case "list":
    await cmdList(flags);
    break;
  case "inspect":
    await cmdInspect(positional[0]);
    break;
  case "scout":
    await cmdScout(flags);
    break;
  case "dryrun":
    await cmdDryRun(flags);
    break;
  case "send":
    await cmdSend(positional, flags);
    break;
  case "classify-reply":
    await cmdClassifyReply(positional, flags);
    break;
  default:
    console.error(`❌ Comando sconosciuto: ${command}`);
    printHelp();
    process.exit(1);
}
