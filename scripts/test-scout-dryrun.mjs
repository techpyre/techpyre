#!/usr/bin/env node
/**
 * =====================================================================
 * TechPYRE Outbound Engine - CLI Dry-Run Validator (3 Live Targets)
 * Esecuzione:
 *   node scripts/test-scout-dryrun.mjs
 * =====================================================================
 */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

// Se eseguito con `node` standard senza loader TS per alias `@/`, rilancia trasparentemente via `npx tsx`
if (!process.env.__TECHPYRE_TSX_ACTIVE) {
  const res = spawnSync("npx", ["tsx", __filename, ...process.argv.slice(2)], {
    stdio: "inherit",
    env: {
      ...process.env,
      PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ""}`,
      __TECHPYRE_TSX_ACTIVE: "1",
    },
  });
  process.exit(res.status ?? 0);
}

const {
  discoverItalianBusinesses,
  selectBestDecisionMakerEmail,
  extractDecisionMakerFromHtml,
  detectActiveAdTracking,
  buildMultiStepOutreach,
  isHardBlockedEmail,
} = await import("../src/lib/scoutService.ts");

const TEST_KEYWORDS = [
  "infissi catania",
  "impianti fotovoltaici brescia",
  "carpenteria metallica milano",
];

const SUBPAGE_PATHS = [
  "/contatti",
  "/chi-siamo",
  "/azienda",
  "/team",
  "/privacy-policy",
];

async function fetchHtmlWithTimeout(url, timeoutMs = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
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

function extractRawEmailsFromHtml(html) {
  if (!html) return [];
  const decoded = html
    .replace(/&#64;/g, "@")
    .replace(/\[at\]/gi, "@")
    .replace(/\(at\)/gi, "@");
  const matches =
    decoded.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const mailtoMatches = [
    ...decoded.matchAll(/href=["']mailto:([^"'?&\s]+)["']/gi),
  ].map((m) => m[1]);
  return [...mailtoMatches, ...matches];
}

async function runDryRunForKeyword(keyword) {
  const candidates = await discoverItalianBusinesses(keyword, 12);
  const evaluated = [];

  for (const cand of candidates) {
    if (evaluated.length >= 4) break;
    const targetUrl = cand.targetUrl;
    if (!targetUrl || targetUrl.includes("paginegialle.it")) continue;

    const homeHtml = await fetchHtmlWithTimeout(targetUrl, 6000);
    if (!homeHtml || homeHtml.length < 300) continue;

    let origin = "";
    try {
      origin = new URL(targetUrl).origin;
    } catch {
      continue;
    }

    // Estrae anche eventuali URL reali di privacy/chi-siamo/contatti dal DOM della homepage
    const dynamicInternalLinks = [
      ...homeHtml.matchAll(
        /href=["']([^"'#?]+(?:privacy|informativa|chi-siamo|contatt|azienda|team)[^"'#?]*)["']/gi
      ),
    ]
      .map((m) => m[1])
      .filter((href) => {
        try {
          const u = new URL(href, origin);
          return u.origin === origin;
        } catch {
          return false;
        }
      })
      .slice(0, 4);

    const allSubPaths = Array.from(
      new Set([...SUBPAGE_PATHS, ...dynamicInternalLinks])
    );

    // Scraping parallelo delle sottopagine con Promise.allSettled e timeout 3500ms
    const subpageResults = await Promise.allSettled(
      allSubPaths.map((sub) =>
        fetchHtmlWithTimeout(new URL(sub, origin).href, 3500)
      )
    );

    const subHtmls = subpageResults
      .filter((r) => r.status === "fulfilled" && r.value && r.value.length > 200)
      .map((r) => r.value);

    const combinedHtml = [homeHtml, ...subHtmls].join("\n");

    // Priorità: email estratte dal sito/sottopagine PRIMA di cand.fallbackEmail
    const siteExtractedEmails = extractRawEmailsFromHtml(combinedHtml);
    const orderedEmails = [...siteExtractedEmails];
    if (cand.fallbackEmail) {
      orderedEmails.push(cand.fallbackEmail);
    }

    const emailScoring = selectBestDecisionMakerEmail(orderedEmails, targetUrl);
    if (!emailScoring.bestEmail) continue;

    // Verifica di sicurezza che non sia un'email hard-blocked
    if (isHardBlockedEmail(emailScoring.bestEmail)) {
      throw new Error(
        `ERRORE CRITICO: selectBestDecisionMakerEmail ha restituito un'email bloccata: ${emailScoring.bestEmail}`
      );
    }

    const titleMatch = homeHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    const companyName =
      cand.fallbackName ||
      (titleMatch ? titleMatch[1].split(/[|\-–·]/)[0].trim() : new URL(targetUrl).hostname);

    const dmInfo = extractDecisionMakerFromHtml(
      combinedHtml,
      emailScoring.bestEmail
    );
    const decisionMakerName = dmInfo.fullName || `Direzione ${companyName}`;

    const adTracking = detectActiveAdTracking(combinedHtml, false);
    const renderBlockingCount = Math.max(
      4,
      (homeHtml.match(/<script\b[^>]*src=/gi) || []).length +
        (homeHtml.match(/<link\b[^>]*rel=["']stylesheet["']/gi) || []).length
    );
    const estimatedLcp = 6.8;

    const outreach = buildMultiStepOutreach({
      slug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      companyName,
      decisionMaker: dmInfo,
      isGenericInbox: emailScoring.isGeneric,
      estimatedMobileLcpSeconds: estimatedLcp,
      renderBlockingScripts: renderBlockingCount,
      runsAds: adTracking.runsAds,
    });

    const step1WordCount = outreach.step1FirstTouch.body
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;

    const candidateReport = {
      keyword,
      companyName,
      websiteUrl: targetUrl,
      targetEmail: emailScoring.bestEmail,
      emailScore: emailScoring.score,
      isGenericInbox: emailScoring.isGeneric,
      isTicketOrBlocked: isHardBlockedEmail(emailScoring.bestEmail),
      decisionMakerName,
      decisionMakerFirstName: dmInfo.firstName,
      decisionMakerRole: dmInfo.role || "Direzione Aziendale",
      runsAds: adTracking.runsAds,
      detectedTrackingSignals: adTracking.signals,
      emailSubject: outreach.emailSubject,
      step1WordCount,
      step1BodyPreview: outreach.step1FirstTouch.body,
    };

    evaluated.push(candidateReport);
    // Se abbiamo già trovato un lead con dominio aziendale proprietario + nome titolare (o score alto), prendilo subito
    if (dmInfo.fullName && emailScoring.score >= 30) {
      break;
    }
  }

  if (evaluated.length > 0) {
    // Ordina privilegiando chi ha un Decision Maker nominale estratto e lo score email più alto
    evaluated.sort((a, b) => {
      const aHasDm = a.decisionMakerFirstName ? 50 : 0;
      const bHasDm = b.decisionMakerFirstName ? 50 : 0;
      return bHasDm + b.emailScore - (aHasDm + a.emailScore);
    });
    return evaluated[0];
  }

  return {
    keyword,
    error: "Nessun candidato con dominio esterno e email valida trovato nei primi risultati",
  };
}

console.log("=====================================================================");
console.log("TECHPYRE OUTBOUND ENGINE · DRY-RUN VALIDATION SU 3 TARGET REALI");
console.log("=====================================================================\n");

const results = [];
for (const kw of TEST_KEYWORDS) {
  const report = await runDryRunForKeyword(kw);
  results.push(report);
}

console.log(JSON.stringify(results, null, 2));
