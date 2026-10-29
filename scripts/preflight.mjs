#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

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

  const phones = [
    ...new Set(
      html.match(/(?:\+39\s?)?(?:0\d{1,3}[\s.-]?\d{5,8}|3\d{2}[\s.-]?\d{6,7})/g) || []
    ),
  ].slice(0, 5);

  const piva =
    html.match(/(?:P\.?\s*IVA|Partita\s+IVA|C\.F\.|Codice\s+Fiscale)[\s:]*([0-9]{11})/i)?.[1] ||
    'Non trovata';

  const cleanText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

  const legalMatches =
    cleanText.match(
      /(?:Titolare del trattamento|Rappresentante legale|Amministratore\s+Unico|S\.r\.l\.|S\.n\.c\.|S\.p\.A\.|ditta individuale)[^.<]{0,140}/gi
    ) || [];

  // 2. Calcolo LCP Mobile stimato
  const renderBlockingScripts = (html.match(/<script(?![^>]*defer)(?![^>]*async)[^>]+src=/gi) || []).length;
  const estimatedMobileLcpSeconds = Number(
    ((ttfbMs * 3.8) / 1000 + 2.4 + Math.min(renderBlockingScripts * 0.25, 2.5)).toFixed(1)
  );

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

  // Una pagina è "già una landing page performante" se:
  // - LCP < 2.6s ED ha già un form o funnel builder
  // - Oppure usa un Funnel Builder dedicato (ClickFunnels/GoHighLevel/Unbounce) con LCP < 3.5s
  const alreadyHasPerformantLanding =
    (estimatedMobileLcpSeconds < 2.6 && (formsCount > 0 || isDedicatedFunnelUrl)) ||
    (funnelBuilders.length > 0 && estimatedMobileLcpSeconds < 3.5);

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

  const finalPhones = [
    ...new Set(
      combinedHtml.match(/(?:\+39\s?)?(?:0\d{1,3}[\s.-]?\d{5,8}|3\d{2}[\s.-]?\d{6,7})/g) || []
    ),
  ].slice(0, 5);

  const finalPiva =
    combinedHtml.match(/(?:P\.?\s*IVA|Partita\s+IVA|C\.F\.|Codice\s+Fiscale)[\s:]*([0-9]{11})/i)?.[1] ||
    piva;

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
    lowerHtml.includes('cdn.shopify.com') ||
    lowerHtml.includes('woocommerce-cart') ||
    lowerHtml.includes('add_to_cart') ||
    lowerHtml.includes('prestashop');

  const isLargeEnterpriseOrSpa =
    /\bS\.p\.A\.\b/i.test(cleanText) ||
    /\bSocietà per Azioni\b/i.test(cleanText) ||
    /\bNumero Verde\s+800\b/i.test(cleanText);

  const disqualifiers = [];
  if (isMessagingFunnel) disqualifiers.push('Funnel solo WhatsApp/Messenger senza sito');
  if (alreadyHasPerformantLanding) disqualifiers.push(`Ha già una landing page performante (${estimatedMobileLcpSeconds}s)`);
  if (isEcommerce) disqualifiers.push('E-commerce con carrello (non Lead Generation)');
  if (isLargeEnterpriseOrSpa) disqualifiers.push('Struttura S.p.A. / Corporate con ufficio acquisti bloccato');
  if (finalEmails.length === 0 && finalPhones.length === 0) disqualifiers.push('Nessun contatto diretto (email/telefono) reperibile');

  // 6. STRATEGIA CONSIGLIATA (Direct vs White-Label / Co-existence vs Skip)
  let recommendedStrategy = 'DIRECT_BUYER';
  let strategyReason =
    'Azienda ideale per vendita diretta: paga le inserzioni Meta ma manda il traffico su un sito lento e dispersivo.';

  if (disqualifiers.length > 0) {
    recommendedStrategy = 'DISQUALIFIED_SKIP';
    strategyReason = disqualifiers.join(' | ');
  } else if (hasAgencyInvolved) {
    recommendedStrategy = 'AGENCY_COEXISTENCE_OR_WHITELABEL';
    strategyReason =
      'Rilevata presenza di Web Agency / Funnel di Marketing esistente ma con pagina lenta (' +
      estimatedMobileLcpSeconds +
      's). Usa l\'angolo "Non tocchiamo chi vi segue le campagne: forniamo solo la pagina veloce 0.3s in White-Label" (o proponi partnership White-Label all\'agenzia rilevata).';
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
    if (!resolved) continue;
    if (fullTag.includes('logo') || resolved.toLowerCase().includes('logo')) {
      if (!candidateLogoUrls.includes(resolved)) candidateLogoUrls.push(resolved);
    } else if (!resolved.endsWith('.svg') && !resolved.includes('icon') && !resolved.includes('pixel')) {
      if (!candidateHeroUrls.includes(resolved)) candidateHeroUrls.push(resolved);
    }
  }

  const report = {
    slug,
    targetUrl: url,
    finalResolvedUrl: finalUrl,
    measuredResponseMs: ttfbMs,
    renderBlockingScripts,
    estimatedMobileLcpSeconds,
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
