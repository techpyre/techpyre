#!/usr/bin/env node
/**
 * =====================================================================
 * TechPYRE Outbound Engine — Autonomous Meta Ad Library Scout
 * Eseguito direttamente dall'Agente AI senza intervento umano nel browser:
 *   node scripts/scout-ad-library.mjs "<keyword>" [maxLeads=5]
 * =====================================================================
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const [,, keyword, maxLeadsArg] = process.argv;
const maxLeads = Number(maxLeadsArg || 5);

if (!keyword) {
  console.error('Uso: node scripts/scout-ad-library.mjs "<keyword>" [maxLeads=5]');
  process.exit(1);
}

const BRAVE_PATHS = [
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

const browserBin = BRAVE_PATHS.find((p) => fs.existsSync(p));
if (!browserBin) {
  console.error('Nessun browser Chromium/Brave trovato in /Applications.');
  process.exit(1);
}

const EXCLUDED_DOMAINS = [
  'fb.me',
  'facebook.com',
  'instagram.com',
  'wa.me',
  'whatsapp.com',
  'm.me',
  'youtube.com',
  'youtu.be',
  'tiktok.com',
  'linkedin.com',
  't.me',
  'play.google.com',
  'apps.apple.com',
  'amazon.',
  'ebay.',
  'spotify.com',
  'trustpilot.com',
  'google.com',
  'maps.app.goo.gl',
];

function slugifyDomain(hostname) {
  return hostname
    .replace(/^www\./i, '')
    .replace(/\.[a-z]{2,}(\.[a-z]{2,})?$/i, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function downloadFile(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      },
      redirect: 'follow',
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 400) return false;
    fs.writeFileSync(destPath, buf);
    return true;
  } catch {
    return false;
  }
}

async function run() {
  const adLibUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IT&media_type=all&q=${encodeURIComponent(
    keyword
  )}&search_type=keyword_unordered`;

  console.log(`🔎 [Scout AI] Ricerca autonoma su Meta Ad Library per: "${keyword}"...`);

  const domHtml = execFileSync(
    browserBin,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--virtual-time-budget=6000',
      '--dump-dom',
      adLibUrl,
    ],
    { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
  );

  // Estrai tutti i link esterni l.facebook.com/l.php?u=...
  const matches = [...domHtml.matchAll(/https:\/\/l\.facebook\.com\/l\.php\?u=([^"'&\s<>]+)/gi)];
  const seenDomains = new Set();
  const candidates = [];

  for (const m of matches) {
    let decoded;
    try {
      decoded = decodeURIComponent(m[1]);
    } catch {
      continue;
    }

    let parsed;
    try {
      parsed = new URL(decoded);
    } catch {
      continue;
    }

    const host = parsed.hostname.toLowerCase();
    if (EXCLUDED_DOMAINS.some((ex) => host.includes(ex))) continue;
    if (seenDomains.has(host)) continue;
    seenDomains.add(host);

    // Estrai uno snippet di contesto attorno al link nel DOM della Ad Library
    const idx = m.index || 0;
    const windowHtml = domHtml.slice(Math.max(0, idx - 1800), Math.min(domHtml.length, idx + 800));
    const contextText = stripTags(windowHtml).slice(0, 500);

    candidates.push({
      slug: slugifyDomain(host),
      hostname: host,
      landingUrl: decoded,
      adLibrarySearchUrl: adLibUrl,
      adContextSnippet: contextText,
    });

    if (candidates.length >= maxLeads * 2) break;
  }

  console.log(`✅ Trovati ${candidates.length} inserzionisti con landing page esterna. Avvio audit Pre-Flight...`);

  const results = [];

  for (const cand of candidates) {
    if (results.length >= maxLeads) break;
    try {
      console.log(`⚡ Analisi Pre-Flight per [${cand.slug}] -> ${cand.landingUrl}`);
      execFileSync(process.execPath, [path.join(process.cwd(), 'scripts', 'preflight.mjs'), cand.landingUrl, cand.slug], {
        stdio: 'ignore',
      });

      const leadDir = path.join(process.cwd(), 'public', 'leads', cand.slug);
      const preflightPath = path.join(leadDir, 'preflight.json');
      if (!fs.existsSync(preflightPath)) continue;

      const preflight = JSON.parse(fs.readFileSync(preflightPath, 'utf-8'));

      // Scarta automaticamente lead non qualificati (già performanti, e-commerce, S.p.A., zero contatti)
      if (preflight.qualification && !preflight.qualification.isQualified) {
        console.log(
          `⏭️  Scartato [${cand.slug}]: ${preflight.qualification.strategyReason}`
        );
        fs.rmSync(leadDir, { recursive: true, force: true });
        continue;
      }

      // Recupera anche Titolo, H1 e Meta Description della landing page per il Message Match
      const pageRes = await fetch(cand.landingUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        },
        redirect: 'follow',
      });
      const pageHtml = await pageRes.text();
      const pageTitle = stripTags(pageHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '');
      const firstH1 = stripTags(pageHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
      const metaDesc =
        pageHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
        '';

      preflight.searchKeyword = keyword;
      preflight.adLibraryUrl = cand.adLibrarySearchUrl;
      preflight.adContextSnippet = cand.adContextSnippet;
      preflight.landingPageTitle = pageTitle;
      preflight.landingPageH1 = firstH1;
      preflight.landingPageMetaDescription = metaDesc;

      // Scarica automaticamente logo e hero reali se trovati
      if (preflight.candidateLogoUrls?.[0]) {
        await downloadFile(preflight.candidateLogoUrls[0], path.join(leadDir, 'logo.png'));
      }
      if (preflight.candidateHeroUrls?.[0]) {
        await downloadFile(preflight.candidateHeroUrls[0], path.join(leadDir, 'hero.jpg'));
      }

      // Cattura screenshot mobile (390x844) della vecchia landing page
      try {
        execFileSync(
          browserBin,
          [
            '--headless=new',
            '--disable-gpu',
            '--hide-scrollbars',
            '--virtual-time-budget=4000',
            '--window-size=390,844',
            `--screenshot=${path.join(leadDir, 'old-site-mobile.png')}`,
            cand.landingUrl,
          ],
          { stdio: 'ignore', timeout: 15000 }
        );
      } catch {
        // Ignora eventuale timeout screenshot su siti estremamente lenti
      }

      fs.writeFileSync(preflightPath, JSON.stringify(preflight, null, 2), 'utf-8');
      results.push({
        slug: cand.slug,
        landingUrl: cand.landingUrl,
        estimatedMobileLcpSeconds: preflight.estimatedMobileLcpSeconds,
        recommendedStrategy: preflight.qualification?.recommendedStrategy,
        detectedAgencies: preflight.qualification?.agencyDetection?.detectedAgencyLinks || [],
        extractedEmails: preflight.extractedEmails,
        extractedPhones: preflight.extractedPhones,
        extractedVat: preflight.extractedVat,
        landingPageH1: firstH1 || pageTitle,
        preflightPath: `public/leads/${cand.slug}/preflight.json`,
      });
    } catch (err) {
      console.error(`⚠️  Skip [${cand.slug}]: ${err.message}`);
    }
  }

  console.log('\n=====================================================================');
  console.log(`🎯 SCOUTING COMPLETATO: ${results.length} Lead qualificati pronti in public/leads/`);
  console.log('=====================================================================');
  console.log(JSON.stringify(results, null, 2));
}

run().catch((err) => {
  console.error('Errore nello scouting Ad Library:', err);
  process.exit(1);
});
