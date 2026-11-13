#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { runTrueMobileAuditAndScreenshot } from './mobile-audit-cdp.mjs';

const [,, url, slug] = process.argv;
if (!url || !slug) {
  console.error('Uso: node scripts/preflight.mjs <url> <slug>');
  process.exit(1);
}

const outDir = path.join(process.cwd(), 'public', 'leads', slug);
fs.mkdirSync(outDir, { recursive: true });

function resolveUrl(baseUrl, relativeOrAbsolute) {
  try {
    if (!relativeOrAbsolute || relativeOrAbsolute.startsWith('data:')) return null;
    return new URL(relativeOrAbsolute, baseUrl).href;
  } catch {
    return null;
  }
}

async function run() {
  const lowerUrl = url.toLowerCase();
  const isMessagingFunnel =
    lowerUrl.includes('wa.me') ||
    lowerUrl.includes('api.whatsapp.com') ||
    lowerUrl.includes('m.me/') ||
    lowerUrl.includes('instagram.com') ||
    lowerUrl.includes('facebook.com');

  const start = Date.now();
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    redirect: 'follow',
  });
  const html = await res.text();
  const lowerHtml = html.toLowerCase();
  const finalUrl = res.url || url;
  const parsedFinalUrl = new URL(finalUrl);
  const ttfbMs = Date.now() - start;

  // 1. Estrazione Email, Telefoni, P.IVA e note legali
  const emails = [
    ...new Set(html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []),
  ].filter(
    (e) =>
      !e.endsWith('.png') &&
      !e.endsWith('.jpg') &&
      !e.endsWith('.jpeg') &&
      !e.endsWith('.webp') &&
      !e.endsWith('.svg') &&
      !e.includes('sentry') &&
      !e.includes('wix') &&
      !e.includes('example.') &&
      !e.includes('u00')
  );

  const piva =
    html.match(/(?:P\.?\s*IVA|Partita\s+IVA|C\.F\.|Codice\s+Fiscale)[\s:]*([0-9]{11})/i)?.[1] ||
    'Non trovata';

  const extractCleanPhones = (rawHtml, vatVal) => {
    const cleanVat = String(vatVal || '').replace(/\D/g, '');
    const seen = new Set();
    const out = [];
    const pushPh = (raw, fromTel) => {
      const trimmed = String(raw || '').replace(/^tel:/i, '').trim();
      let d = trimmed.replace(/\D/g, '');
      if (d.startsWith('0039') && d.length >= 12) d = d.slice(4);
      else if (d.startsWith('39') && d.length >= 11 && (d[2] === '0' || d[2] === '3' || d[2] === '8')) d = d.slice(2);
      if (!d || (cleanVat && d === cleanVat) || /0{5,}/.test(d) || new Set(d.split('')).size < 4) return;
      const isValid =
        /^3\d{9}$/.test(d) ||
        /^8(?:00|03|40|48)\d{6,7}$/.test(d) ||
        (fromTel && /^(?:02|06)\d{6,8}$/.test(d)) ||
        /^0\d{8,10}$/.test(d);
      if (!isValid || seen.has(d)) return;
      seen.add(d);
      out.push(trimmed.length <= 20 ? trimmed.replace(/\s+/g, ' ') : d);
    };
    for (const m of rawHtml.matchAll(/href=["']tel:([^"']+)["']/gi)) pushPh(m[1], true);
    const vis = rawHtml
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ');
    for (const m of vis.matchAll(/(?:tel\.?|telefono|cell\.?|mobile|chiama)[\s:.-]{0,12}((?:\+39\s?|0039\s?)?(?:0\d{1,3}[\s.-]?\d{5,8}|3\d{2}[\s.-]?\d{6,7}))/gi)) {
      pushPh(m[1], true);
    }
    for (const m of vis.matchAll(/\b((?:\+39\s?)?(?:0\d{1,3}[\s.-]?\d{5,8}|3\d{2}[\s.-]?\d{6,7}|8(?:00|03|40|48)[\s.-]?\d{6,7}))\b/g)) {
      pushPh(m[1], false);
    }
    return out.slice(0, 5);
  };

  const phones = extractCleanPhones(html, piva);

  const cleanText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

  const legalMatches =
    cleanText.match(
      /(?:Titolare del trattamento|Rappresentante legale|Amministratore\s+Unico|S\.r\.l\.|S\.n\.c\.|S\.p\.A\.|ditta individuale)[^.<]{0,140}/gi
    ) || [];

  // 2. Calcolo LCP Mobile reale via Google PageSpeed Insights v5 API (con fallback al trasferimento reale / CDP, zero gonfiaggi artificiali)
  let renderBlockingScripts =
    (html.match(/<script(?![^>]*defer)(?![^>]*async)[^>]+src=/gi) || []).length +
    (html.match(/<link[^>]+rel=["']stylesheet["']/gi) || []).length;
  let estimatedMobileLcpSeconds = 0;

  try {
    const apiKey =
      process.env.PAGESPEED_API_KEY ||
      process.env.GOOGLE_PAGESPEED_API_KEY ||
      '';
    const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
    const psiRes = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        finalUrl
      )}&strategy=mobile&category=performance${keyParam}`,
      { signal: AbortSignal.timeout(12000) }
    );
    if (psiRes.ok) {
      const psiData = await psiRes.json();
      const lcpNumericMs =
        psiData?.lighthouseResult?.audits?.['largest-contentful-paint']?.numericValue;
      const blockingItems =
        psiData?.lighthouseResult?.audits?.['render-blocking-resources']?.details?.items
          ?.length;
      if (typeof lcpNumericMs === 'number' && lcpNumericMs > 0) {
        estimatedMobileLcpSeconds = Number((lcpNumericMs / 1000).toFixed(1));
      }
      if (typeof blockingItems === 'number') {
        renderBlockingScripts = blockingItems;
      }
    }
  } catch {
    // Fallback al timing reale
  }

  if (!estimatedMobileLcpSeconds) {
    const transferSeconds4G = Buffer.byteLength(html, 'utf8') / ((1.6 * 1024 * 1024) / 8);
    const handshakeRtts = (150 * 3) / 1000;
    const blockingParseSeconds = renderBlockingScripts * 0.18;
    estimatedMobileLcpSeconds = Number(
      (ttfbMs / 1000 + handshakeRtts + transferSeconds4G + blockingParseSeconds).toFixed(1)
    );
  }

  // 3. RILEVAMENTO LANDING PAGE GIA' PERFORMANTE / FUNNEL BUILDER DEDICATO
  const funnelBuilders = [];
  if (lowerHtml.includes('clickfunnels') || lowerHtml.includes('cf-page')) funnelBuilders.push('ClickFunnels');
  if (lowerHtml.includes('leadconnectorhq') || lowerHtml.includes('msgsndr.com')) funnelBuilders.push('GoHighLevel');
  if (lowerHtml.includes('unbounce') || lowerHtml.includes('ub-emb')) funnelBuilders.push('Unbounce');
  if (lowerHtml.includes('instapage')) funnelBuilders.push('Instapage');
  if (lowerHtml.includes('landingi')) funnelBuilders.push('Landingi');
  if (lowerHtml.includes('kartra')) funnelBuilders.push('Kartra');
  if (lowerHtml.includes('systeme.io')) funnelBuilders.push('Systeme.io');

  const pathLower = parsedFinalUrl.pathname.toLowerCase();
  const isDedicatedFunnelUrl =
    /\/(optin|funnel|landing|squeeze|promo|offerta|preventivo-rapido|lp)\b/i.test(pathLower) ||
    parsedFinalUrl.hostname.startsWith('lp.') ||
    parsedFinalUrl.hostname.startsWith('info.') ||
    parsedFinalUrl.hostname.startsWith('promo.');

  const navLinksCount = (html.match(/<nav[\s\S]*?<\/nav>/gi)?.[0]?.match(/<a\s/gi) || []).length;
  const formsCount = (html.match(/<form\b/gi) || []).length;
  const hasQuizAlready =
    lowerHtml.includes('step 1') ||
    lowerHtml.includes('passo 1') ||
    lowerHtml.includes('calcola il tuo preventivo') ||
    lowerHtml.includes('simulatore');

  // Una pagina e "gia performante" se ha LCP < 4.0s (il target TechPyre Studio richiede LCP >= 5.0s)
  const alreadyHasPerformantLanding =
    estimatedMobileLcpSeconds < 4.0 ||
    (funnelBuilders.length > 0 && estimatedMobileLcpSeconds < 4.5);

  // Se la sottopagina della campagna non ha email o P.IVA nel footer, controlla anche la Home Page principale
  let combinedHtml = html;
  if ((emails.length === 0 || piva === 'Non trovata') && parsedFinalUrl.pathname !== '/') {
    try {
      const homeRes = await fetch(parsedFinalUrl.origin, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        },
      });
      const homeHtml = await homeRes.text();
      combinedHtml = html + '\n' + homeHtml;
    } catch {
      // ignora errori di rete sulla root
    }
  }

  const finalEmails = [
    ...new Set(combinedHtml.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []),
  ].filter(
    (e) =>
      !e.endsWith('.png') &&
      !e.endsWith('.jpg') &&
      !e.endsWith('.jpeg') &&
      !e.endsWith('.webp') &&
      !e.endsWith('.svg') &&
      !e.includes('sentry') &&
      !e.includes('wix') &&
      !e.includes('example.') &&
      !e.includes('u00')
  );

  const finalPiva =
    combinedHtml.match(/(?:P\.?\s*IVA|Partita\s+IVA|C\.F\.|Codice\s+Fiscale)[\s:]*([0-9]{11})/i)?.[1] ||
    piva;

  const finalPhones = extractCleanPhones(combinedHtml, finalPiva);

  // 4. RILEVAMENTO AGENZIA WEB / MARKETING ESTERNA & WHITE-LABEL OPPORTUNITY
  const agencyCreditMatches = [
    ...cleanText.matchAll(
      /(?:Realizzato da|Sviluppato da|Powered by|Web Agency|Digital Agency|Marketing by|Designed by|Progetto grafico\s+e\s+sviluppo)\s*:?\s*([A-Z0-9][A-Za-z0-9\s.&-]{2,40})/gi
    ),
  ]
    .map((m) => m[1].trim())
    .filter(
      (credit) =>
        !credit.toLowerCase().includes('wordpress') &&
        !credit.toLowerCase().includes('shopify') &&
        !credit.toLowerCase().includes('prestashop') &&
        !credit.toLowerCase().includes('cookie')
    );

  // Cerca anche link nel footer verso web agency
  const footerBlock = html.slice(Math.max(0, html.length - 15000));
  const externalAgencyLinks = [
    ...footerBlock.matchAll(/<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi),
  ]
    .map((m) => ({ href: m[1], label: m[2].replace(/<[^>]+>/g, '').trim() }))
    .filter(({ href, label }) => {
      const h = href.toLowerCase();
      const l = label.toLowerCase();
      return (
        !h.includes(parsedFinalUrl.hostname) &&
        !h.includes('facebook.') &&
        !h.includes('instagram.') &&
        !h.includes('linkedin.') &&
        !h.includes('youtube.') &&
        !h.includes('iubenda.') &&
        !h.includes('cookiebot.') &&
        !h.includes('google.') &&
        !h.includes('whatsapp.') &&
        (h.includes('agency') ||
          h.includes('studio') ||
          h.includes('digital') ||
          h.includes('web') ||
          h.includes('marketing') ||
          h.includes('comunicazione') ||
          l.includes('agency') ||
          l.includes('realizzato') ||
          l.includes('credits') ||
          l.includes('web'))
      );
    })
    .slice(0, 3);

  const martechSignals = [];
  if (lowerHtml.includes('googletagmanager.com/gtm.js')) martechSignals.push('Google Tag Manager');
  if (lowerHtml.includes('connect.facebook.net') || lowerHtml.includes('fbq(')) martechSignals.push('Meta Pixel');
  if (lowerHtml.includes('hotjar.com') || lowerHtml.includes('clarity.ms')) martechSignals.push('Heatmap/CRO Tracking');
  if (lowerHtml.includes('hubspot') || lowerHtml.includes('activecampaign') || lowerHtml.includes('leadconnector'))
    martechSignals.push('CRM Marketing Automation');

  const hasAgencyInvolved =
    agencyCreditMatches.length > 0 ||
    externalAgencyLinks.length > 0 ||
    isDedicatedFunnelUrl ||
    funnelBuilders.length > 0 ||
    martechSignals.length >= 3;

  // 5. DEALBREAKERS (Fattori che rendono il cliente NON disponibile a comprare)
  const isEcommerce =
    lowerHtml.includes('cdn.shopify.com/s/files') ||
    lowerHtml.includes('/cart/checkout') ||
    lowerHtml.includes('checkout.shopify.com') ||
    cleanText.includes('Aggiungi al carrello') ||
    cleanText.includes('Procedi al checkout');

  const isLargeEnterpriseOrSpa =
    /\bNumero Verde\s+800\b/i.test(cleanText) && finalEmails.length === 0;

  const disqualifiers = [];
  if (isMessagingFunnel) disqualifiers.push('Funnel solo WhatsApp/Messenger senza sito');
  if (alreadyHasPerformantLanding) disqualifiers.push(`Pagina gia veloce (${estimatedMobileLcpSeconds}s < 4.0s)`);
  if (isEcommerce) disqualifiers.push('E-commerce B2C con carrello (non B2B / Lead Generation)');
  if (isLargeEnterpriseOrSpa) disqualifiers.push('Call center Numero Verde 800 senza email dirette');
  if (finalEmails.length === 0 && finalPhones.length === 0) disqualifiers.push('Nessun contatto diretto (email/telefono) reperibile');

  // 6. STRATEGIA CONSIGLIATA (Direct vs White-Label / Co-existence vs Skip)
  let recommendedStrategy = 'DIRECT_BUYER';
  let strategyReason =
    'Azienda B2B ideale per vendita diretta: sito lento su mobile (' +
    estimatedMobileLcpSeconds +
    's), privo di tracciamento Server-Side e senza automazione verso il CRM.';

  if (disqualifiers.length > 0) {
    recommendedStrategy = 'DISQUALIFIED_SKIP';
    strategyReason = disqualifiers.join(' | ');
  } else if (hasAgencyInvolved) {
    recommendedStrategy = 'AGENCY_COEXISTENCE_OR_WHITELABEL';
    strategyReason =
      'Rilevata presenza di Web Agency / Funnel esistente ma con pagina lenta (' +
      estimatedMobileLcpSeconds +
      's). Usa l\'angolo "Non sostituiamo chi vi segue le campagne: forniamo l\'infrastruttura Next.js da 0.3s con Server-Side Tracking e collegamento CRM".';
  }

  // 7. Estrazione URL candidati per Logo e Hero dal DOM statico
  const imgTagMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
  const candidateLogoUrls = [];
  const candidateHeroUrls = [];

  const ogImageMatch =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogImageMatch?.[1]) {
    const resolvedOg = resolveUrl(finalUrl, ogImageMatch[1]);
    if (resolvedOg) candidateHeroUrls.push(resolvedOg);
  }

  for (const match of imgTagMatches) {
    const fullTag = match[0].toLowerCase();
    const resolved = resolveUrl(finalUrl, match[1]);
    if (!resolved || /shinystat|facebook\.com\/tr|doubleclick|blank\.gif|spacer|1x1/i.test(resolved)) continue;
    if (fullTag.includes('logo') || resolved.toLowerCase().includes('logo')) {
      if (!/\.svg(\?|$|#)/i.test(resolved) && !candidateLogoUrls.includes(resolved)) candidateLogoUrls.push(resolved);
    } else if (
      !/\.svg(\?|$|#)|icon|pixel|badge|bollino|sticker|flag|cookie|iubenda|certific|iso-|soa-|payment|visa|paypal|client-|partner/i.test(resolved)
    ) {
      if (!candidateHeroUrls.includes(resolved)) candidateHeroUrls.push(resolved);
    }
  }

  // 8. Esegui Audit Viewport Mobile Reale + Screenshot retina con emulazione iPhone via CDP
  let mobileViewportAudit = null;
  if (disqualifiers.length === 0) {
    try {
      mobileViewportAudit = await runTrueMobileAuditAndScreenshot(
        finalUrl,
        path.join(outDir, 'old-site-mobile.png')
      );
      if (mobileViewportAudit?.measuredLcpSeconds && mobileViewportAudit.measuredLcpSeconds > 0) {
        estimatedMobileLcpSeconds = mobileViewportAudit.measuredLcpSeconds;
      }
    } catch {
      mobileViewportAudit = null;
    }
  }

  const report = {
    slug,
    targetUrl: url,
    finalResolvedUrl: finalUrl,
    measuredResponseMs: ttfbMs,
    renderBlockingScripts,
    estimatedMobileLcpSeconds,
    mobileViewportAudit,
    qualification: {
      isQualified: disqualifiers.length === 0,
      recommendedStrategy,
      strategyReason,
      disqualifiers,
      alreadyHasPerformantLanding,
      isDedicatedFunnelUrl,
      funnelBuilders,
      hasQuizAlready,
      navLinksCount,
      formsCount,
      isEcommerce,
      isLargeEnterpriseOrSpa,
      agencyDetection: {
        hasAgencyInvolved,
        detectedAgencyNames: agencyCreditMatches.slice(0, 3),
        detectedAgencyLinks: externalAgencyLinks,
        martechSignals,
      },
    },
    extractedEmails: finalEmails,
    extractedPhones: finalPhones,
    extractedVat: finalPiva,
    legalSnippets: legalMatches.slice(0, 6).map((s) => s.trim()),
    candidateLogoUrls: candidateLogoUrls.slice(0, 4),
    candidateHeroUrls: candidateHeroUrls.slice(0, 6),
    assetsDir: `/public/leads/${slug}`,
  };

  fs.writeFileSync(path.join(outDir, 'preflight.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

run().catch((err) => {
  console.error('Errore durante il preflight:', err.message);
  process.exit(1);
});
