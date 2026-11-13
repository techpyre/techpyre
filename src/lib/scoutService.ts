import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { LeadConfig, OutreachStep } from "@/types/lead";
import { loadLeadConfig, saveLeadConfig } from "./leadsStorage";
import {
  analyzePngLogo,
  analyzeRasterHeroFile,
  downloadAndNormalizeRasterAsset,
} from "./logoProcessor";

export type LeadArchetype = LeadConfig["archetype"];

/**
 * REGISTRO CHIUSO DEI TEMPLATE UFFICIALI (SINGLE SOURCE OF TRUTH)
 * È severamente vietato generare o registrare template extra rispetto ai 3 componenti ufficiali
 * presenti in `src/components/templates/`.
 */
export const OFFICIAL_TEMPLATE_IDS: readonly LeadArchetype[] = [
  "b2b-authority",
  "local-leadgen",
  "medical-clinic",
] as const;

export const OFFICIAL_TEMPLATE_REGISTRY: Record<
  LeadArchetype,
  { componentName: "B2BAuthority" | "LocalLeadGen" | "MedicalClinic"; filePath: string }
> = {
  "b2b-authority": {
    componentName: "B2BAuthority",
    filePath: "src/components/templates/B2BAuthority.tsx",
  },
  "local-leadgen": {
    componentName: "LocalLeadGen",
    filePath: "src/components/templates/LocalLeadGen.tsx",
  },
  "medical-clinic": {
    componentName: "MedicalClinic",
    filePath: "src/components/templates/MedicalClinic.tsx",
  },
};

export function assertOfficialArchetype(archetype: string): LeadArchetype {
  if (
    archetype === "b2b-authority" ||
    archetype === "local-leadgen" ||
    archetype === "medical-clinic"
  ) {
    return archetype;
  }
  throw new Error(
    `Archetipo non conforme "${archetype}": la pipeline ammette esclusivamente i 3 template ufficiali (${OFFICIAL_TEMPLATE_IDS.join(", ")}).`
  );
}

const EXCLUDED_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "youtube.com",
  "x.com",
  "twitter.com",
  "tiktok.com",
  "pinterest.",
  "vimeo.com",
  "paginegialle.it",
  "paginebianche.it",
  "tuttocitta.it",
  "italiaonline.it",
  "plug.it",
  "pgol.it",
  "pgcasa.it",
  "1240.it",
  "libero.it",
  "virgilio.it",
  "dilei.it",
  "siviaggia.it",
  "quifinanza.it",
  "buonissimo.it",
  "supereva.it",
  "privacy.it",
  "prontopro.it",
  "houzz.it",
  "habitissimo.it",
  "trustpilot.com",
  "miodottore.it",
  "doctolib.it",
  "wikipedia.org",
  "amazon.",
  "ebay.",
  "subito.it",
  "immobiliare.it",
  "idealista.it",
  "tripadvisor.",
  "thefork.",
  "google.",
  "bing.com",
  "yahoo.com",
  "duckduckgo.com",
  "registroimprese.it",
  "fatturatoitalia.it",
  "ufficiocamerale.it",
  "informazione-aziende.it",
  "trovalavoro",
  "indeed.",
  "glassdoor.",
  "iubenda.com",
  "cookiebot.com",
  "scorecardresearch.com",
  "4wnet.com",
  "shinystat.com",
  "w3.org",
  "schema.org",
  "apple.com",
  "whatsapp.com",
  "wa.me",
  "googleapis.com",
  "gstatic.com",
  "cloudflare.com",
  "jsdelivr.net",
  "unpkg.com",
  "firmania.it",
  "misterimprese.it",
  "reteimprese.it",
  "cylex-italia.it",
  "kompass.com",
  "europages.",
  "icribis.com",
  "reportaziende.it",
  "infoimprese.it",
  "trovanumeri.com",
  "tim.it",
  "telecomitalia.it",
  "vodafone.it",
  "fastweb.it",
  "windtre.it",
  "enel.com",
  "eni.com",
  "poste.it",
  "ktcshop.it",
  "riello.it",
  "domal.it",
  "schueco.it",
  "finstral.com",
  "oknoplast.it",
  "velux.it",
  "daikin.it",
  "mitsubishielectric.it",
  "vaillant.it",
  "immergas.com",
  "baxi.it",
  "ariston.com",
  "viessmann.it",
  "bticino.it",
  "vimar.com",
  "faac.it",
  "came.com",
  "niceforyou.com",
  "hormann.it",
  "dierre.com",
  "scrigno.it",
  "garofoli.com",
  "ocalab.it",
  "hione.it",
];

const ITALIAN_CITIES = [
  "Milano",
  "Torino",
  "Roma",
  "Bologna",
  "Firenze",
  "Verona",
  "Brescia",
  "Bergamo",
  "Padova",
  "Vicenza",
  "Treviso",
  "Venezia",
  "Genova",
  "Modena",
  "Parma",
  "Reggio Emilia",
  "Monza",
  "Varese",
  "Como",
  "Lecco",
  "Pavia",
  "Cremona",
  "Mantova",
  "Napoli",
  "Bari",
  "Catania",
  "Palermo",
  "Messina",
  "Cagliari",
  "Perugia",
  "Ancona",
  "Pescara",
  "Udine",
  "Trieste",
  "Trento",
  "Bolzano",
  "Novara",
  "Cuneo",
  "Piacenza",
  "Rimini",
  "Ravenna",
  "Ferrara",
  "Forlì",
  "Cesena",
  "Prato",
  "Livorno",
  "Pisa",
  "Arezzo",
  "Lucca",
  "Salerno",
  "Lecce",
  "Siracusa",
  "Ragusa",
  "Trapani",
  "Agrigento",
  "Caltanissetta",
  "Enna",
  "Acireale",
  "Gela",
  "Marsala",
  "Modica",
  "Vittoria",
  "Milazzo",
  "Bagheria",
  "Paternò",
  "Misterbianco",
  "Alcamo",
  "Sciacca",
  "Mazara del Vallo",
  "Barcellona Pozzo di Gotto",
  "Augusta",
  "Avola",
  "Caltagirone",
  "Taormina",
  "Giarre",
];

export interface CandidateBusiness {
  targetUrl: string;
  fallbackName?: string;
  fallbackEmail?: string;
  fallbackPhone?: string;
  fallbackVat?: string;
  fallbackCity?: string;
  fallbackDescription?: string;
  fallbackLogoUrl?: string;
  fallbackHeroUrl?: string;
  candidateAdLibraryUrl?: string;
  candidateAdSnippet?: string;
}

export function slugifyDomain(input: string): string {
  return input
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\.[a-z]{2,}(\.[a-z]{2,})?(\/.*)?$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 42);
}

export function decodeHtmlEntities(input: string): string {
  if (!input) return "";
  const namedEntities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&quot;": '"',
    "&apos;": "'",
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&laquo;": '"',
    "&raquo;": '"',
    "&ndash;": "-",
    "&mdash;": "-",
    "&bull;": "-",
    "&middot;": "-",
    "&hellip;": "...",
    "&agrave;": "à",
    "&egrave;": "è",
    "&eacute;": "é",
    "&igrave;": "ì",
    "&ograve;": "ò",
    "&ugrave;": "ù",
    "&Agrave;": "À",
    "&Egrave;": "È",
    "&Eacute;": "É",
    "&Igrave;": "Ì",
    "&Ograve;": "Ò",
    "&Ugrave;": "Ù",
    "&euro;": "EUR",
    "&reg;": "",
    "&trade;": "",
    "&copy;": "",
  };
  return input
    .replace(/&[a-zA-Z]+;/g, (match) => namedEntities[match] ?? " ")
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number(dec);
      if (code === 8211 || code === 8212 || code === 183 || code === 8226) return "-";
      if (code === 8216 || code === 8217) return "'";
      if (code === 8220 || code === 8221) return '"';
      if (code === 160) return " ";
      return code >= 32 && code <= 65535 ? String.fromCharCode(code) : "";
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      if (code === 0x2013 || code === 0x2014 || code === 0x00b7 || code === 0x2022) return "-";
      if (code === 0x2018 || code === 0x2019) return "'";
      if (code === 0x201c || code === 0x201d) return '"';
      if (code === 0x00a0) return " ";
      return code >= 32 && code <= 65535 ? String.fromCharCode(code) : "";
    })
    .replace(/[\u2013\u2014\u00b7]/g, "-");
}

function stripTags(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function resolveUrl(baseUrl: string, relativeOrAbsolute?: string): string | null {
  try {
    if (!relativeOrAbsolute || relativeOrAbsolute.startsWith("data:")) return null;
    return new URL(relativeOrAbsolute, baseUrl).href;
  } catch {
    return null;
  }
}

async function tryDownloadFileLocally(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 400) return false;
    fs.mkdirSync(/*turbopackIgnore: true*/ path.dirname(destPath), { recursive: true });
    fs.writeFileSync(/*turbopackIgnore: true*/ destPath, buf);
    const shotAnalysis = analyzeRasterHeroFile(destPath);
    if (shotAnalysis && shotAnalysis.uniformRatio > 0.92) {
      try {
        fs.unlinkSync(/*turbopackIgnore: true*/ destPath);
      } catch {}
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export interface RealPageSpeedMetrics {
  lcpSeconds: number;
  mobileScore: number;
  renderBlockingCount: number;
  source: "pagespeed-api" | "chromium-cdp-lighthouse" | "http-transfer-timing";
}

function getLocalBrowserBin(): string | null {
  const candidates = [
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ p)) return p;
    } catch {
      continue;
    }
  }
  return null;
}

let psiQuotaExhaustedUntil = 0;

/**
 * Misura reale di LCP e Mobile Performance tramite:
 * 1. Google PageSpeed Insights v5 API (`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile`)
 * 2. Se l'API restituisce 429 (quota esaurita senza API key) e siamo in locale, usa Chromium/Brave CDP con throttling mobile ufficiale Lighthouse (Slow 4G 150ms RTT 1.6Mbps + 4x CPU) e PerformanceObserver nativo (zero gonfiaggi o costanti artificiali).
 * 3. Su ambiente serverless senza Chromium, calcola il tempo reale di risposta + trasferimento payload su banda 4G (1.6Mbps) senza alcun floor artificiale.
 */
export async function fetchPageSpeedMetrics(
  url: string,
  ttfbMsFallback = 600,
  htmlByteLength = 65000,
  domBlockingResources = 4
): Promise<RealPageSpeedMetrics> {
  const apiKey =
    process.env.PAGESPEED_API_KEY ||
    process.env.GOOGLE_PAGESPEED_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "";

  if (apiKey || Date.now() > psiQuotaExhaustedUntil) {
    try {
      const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : "";
      const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        url
      )}&strategy=mobile&category=performance${keyParam}`;

      const res = await fetch(psiUrl, {
        signal: AbortSignal.timeout(12000),
      });

      if (res.status === 429 && !apiKey) {
        psiQuotaExhaustedUntil = Date.now() + 30 * 60 * 1000;
      } else if (res.ok) {
        const data = await res.json();
        const lcpNumericMs =
          data?.lighthouseResult?.audits?.["largest-contentful-paint"]?.numericValue;
        const perfScoreRaw = data?.lighthouseResult?.categories?.performance?.score;
        const blockingItems =
          data?.lighthouseResult?.audits?.["render-blocking-resources"]?.details?.items
            ?.length ?? domBlockingResources;

        if (typeof lcpNumericMs === "number" && lcpNumericMs > 0) {
          const lcpSeconds = Number((lcpNumericMs / 1000).toFixed(1));
          const mobileScore =
            typeof perfScoreRaw === "number"
              ? Math.round(perfScoreRaw * 100)
              : Math.max(15, Math.min(99, Math.round(100 - lcpSeconds * 9)));
          return {
            lcpSeconds,
            mobileScore,
            renderBlockingCount: blockingItems,
            source: "pagespeed-api",
          };
        }
      }
    } catch {
      // Passa al motore locale CDP se PageSpeed API va in timeout o 429
    }
  }

  const browserBin = getLocalBrowserBin();
  if (browserBin) {
    const userDataDir = `/tmp/techpyre-psi-cdp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    let proc: ReturnType<typeof spawn> | null = null;
    let ws: WebSocket | null = null;
    try {
      proc = spawn(/*turbopackIgnore: true*/ browserBin, [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--ignore-certificate-errors",
        "--hide-scrollbars",
        "--remote-debugging-port=0",
        `--user-data-dir=${userDataDir}`,
        "about:blank",
      ]);

      const wsUrl = await new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("CDP start timeout")), 6000);
        proc?.stderr?.on("data", (chunk: Buffer) => {
          const m = chunk.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
          if (m) {
            clearTimeout(timer);
            resolve(m[1]);
          }
        });
        proc?.on("error", (err) => {
          clearTimeout(timer);
          reject(err);
        });
      });

      const baseHttp = wsUrl
        .replace(/^ws:\/\//, "http://")
        .replace(/\/devtools\/browser\/.*$/, "");
      const targets = (await fetch(`${baseHttp}/json/list`).then((r) =>
        r.json()
      )) as Array<{ type: string; webSocketDebuggerUrl?: string }>;
      const pageTarget = targets.find((t) => t.type === "page");

      if (pageTarget?.webSocketDebuggerUrl) {
        ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => {
          ws!.addEventListener("open", resolve);
          ws!.addEventListener("error", reject);
        });

        let msgId = 1;
        const pending = new Map<number, (val: unknown) => void>();
        ws.addEventListener("message", (ev) => {
          try {
            const msg = JSON.parse(String(ev.data));
            if (msg.id && pending.has(msg.id)) {
              pending.get(msg.id)!(msg.result);
              pending.delete(msg.id);
            }
          } catch {
            // ignore
          }
        });

        const send = (method: string, params: Record<string, unknown> = {}) =>
          new Promise<Record<string, unknown>>((resolve, reject) => {
            const id = msgId++;
            const timer = setTimeout(() => {
              pending.delete(id);
              reject(new Error(`Timeout ${method}`));
            }, 9000);
            pending.set(id, (res) => {
              clearTimeout(timer);
              resolve((res || {}) as Record<string, unknown>);
            });
            ws!.send(JSON.stringify({ id, method, params }));
          });

        await send("Page.enable");
        await send("Network.enable");
        await send("Runtime.enable");
        await send("Emulation.setDeviceMetricsOverride", {
          width: 390,
          height: 844,
          deviceScaleFactor: 2,
          mobile: true,
        });
        await send("Network.emulateNetworkConditions", {
          offline: false,
          latency: 150,
          downloadThroughput: (1.6 * 1024 * 1024) / 8,
          uploadThroughput: (750 * 1024) / 8,
          connectionType: "cellular4g",
        });
        await send("Emulation.setCPUThrottlingRate", { rate: 4 });
        await send("Page.addScriptToEvaluateOnNewDocument", {
          source: `
            window.__psiLcpMs = 0;
            window.__psiFcpMs = 0;
            try {
              new PerformanceObserver((list) => {
                const entries = list.getEntries();
                if (entries.length > 0) {
                  window.__psiLcpMs = entries[entries.length - 1].startTime;
                }
              }).observe({ type: "largest-contentful-paint", buffered: true });
              new PerformanceObserver((list) => {
                for (const e of list.getEntries()) {
                  if (e.name === "first-contentful-paint") window.__psiFcpMs = e.startTime;
                }
              }).observe({ type: "paint", buffered: true });
            } catch (e) {}
          `,
        });

        await send("Page.navigate", { url });
        await new Promise((r) => setTimeout(r, 2400));

        const evalRes = (await send("Runtime.evaluate", {
          returnByValue: true,
          expression: `(() => {
            const nav = performance.getEntriesByType("navigation")[0];
            const domComplete = nav && nav.domComplete > 0 ? nav.domComplete : performance.now();
            const lcp = window.__psiLcpMs > 0 ? window.__psiLcpMs : (window.__psiFcpMs > 0 ? window.__psiFcpMs * 1.35 : domComplete);
            const blocking = document.querySelectorAll('script[src]:not([async]):not([defer]), link[rel="stylesheet"]').length;
            return {
              lcpMs: Math.round(lcp),
              blocking
            };
          })()`,
        })) as { result?: { value?: { lcpMs?: number; blocking?: number } } };

        const measuredLcpMs = evalRes?.result?.value?.lcpMs || 0;
        const measuredBlocking =
          evalRes?.result?.value?.blocking ?? domBlockingResources;

        if (measuredLcpMs > 100) {
          const lcpSeconds = Number((measuredLcpMs / 1000).toFixed(1));
          const mobileScore = Math.max(
            15,
            Math.min(99, Math.round(100 - lcpSeconds * 8.5))
          );
          return {
            lcpSeconds,
            mobileScore,
            renderBlockingCount: measuredBlocking,
            source: "chromium-cdp-lighthouse",
          };
        }
      }
    } catch {
      // Fallback a calcolo trasferimento HTTP reale
    } finally {
      try {
        if (ws) ws.close();
      } catch {}
      try {
        if (proc) proc.kill("SIGKILL");
      } catch {}
      try {
        fs.rmSync(/*turbopackIgnore: true*/ userDataDir, {
          recursive: true,
          force: true,
        });
      } catch {}
    }
  }

  const transferSeconds4G = htmlByteLength / ((1.6 * 1024 * 1024) / 8);
  const handshakeRtts = (150 * 3) / 1000;
  const blockingParseSeconds = domBlockingResources * 0.18;
  const realLcpSeconds = Number(
    (
      ttfbMsFallback / 1000 +
      handshakeRtts +
      transferSeconds4G +
      blockingParseSeconds
    ).toFixed(1)
  );
  const mobileScore = Math.max(
    15,
    Math.min(98, Math.round(100 - realLcpSeconds * 8.5))
  );

  return {
    lcpSeconds: realLcpSeconds,
    mobileScore,
    renderBlockingCount: domBlockingResources,
    source: "http-transfer-timing",
  };
}

/**
 * DIRETTIVA 2: MOTORE DI SCORING EMAIL & BLOCCO CASELLE DI TICKETING
 */
export const HARD_BLOCKED_EMAIL_PREFIXES = [
  "assistenza",
  "support",
  "supporto",
  "help",
  "ticket",
  "noreply",
  "no-reply",
  "donotreply",
  "privacy",
  "dpo",
  "gdpr",
  "pec",
  "legalmail",
  "arubapec",
  "postecert",
  "fatture",
  "fatturazione",
  "fornitori",
  "acquisti",
  "curriculum",
  "cv",
  "jobs",
  "carriere",
  "hr",
  "lavoraconnoi",
  "webmaster",
  "postmaster",
  "abuse",
  "reclami",
  "clienti",
  "servizioclienti",
];

const EMAIL_LOCAL_PART_BLACKLIST = HARD_BLOCKED_EMAIL_PREFIXES;

export function isHardBlockedEmail(rawEmail: string): boolean {
  if (!rawEmail || !rawEmail.includes("@")) return true;
  let email = rawEmail.trim().toLowerCase();
  try {
    email = decodeURIComponent(email);
  } catch {}
  email = email.replace(/^[\s%20]+/gi, "");
  const [localPart, rawDomain] = email.split("@");
  if (!localPart || !rawDomain) return true;
  const domainPart = rawDomain.replace(/^www\./i, "");

  if (
    domainPart.includes("pec.") ||
    domainPart.includes("legalmail.") ||
    domainPart.includes("arubapec.") ||
    domainPart.includes("postecert.") ||
    domainPart.includes("paginegialle.") ||
    domainPart.includes("esempio.") ||
    domainPart.includes("example.") ||
    domainPart.includes("test.com") ||
    domainPart.includes("rossi.com") ||
    domainPart.includes("doe.com") ||
    domainPart.includes("mailservice.") ||
    localPart === "test" ||
    localPart === "mymail" ||
    localPart === "nome" ||
    localPart === "your" ||
    (localPart === "mario" && (domainPart.includes("rossi") || domainPart.includes("esempio")))
  ) {
    return true;
  }
  return HARD_BLOCKED_EMAIL_PREFIXES.some(
    (bad) =>
      localPart === bad ||
      localPart.startsWith(`${bad}.`) ||
      localPart.startsWith(`${bad}_`) ||
      localPart.startsWith(`${bad}-`) ||
      localPart.includes(bad)
  );
}

const GENERIC_INBOX_PREFIXES = new Set([
  "info",
  "contatti",
  "contact",
  "segreteria",
  "amministrazione",
  "admin",
  "ufficio",
  "office",
  "studio",
  "commerciale",
  "vendite",
  "sales",
  "marketing",
  "ordini",
  "preventivi",
  "clienti",
  "servizioclienti",
  "direzione",
  "ceo",
  "titolare",
  "founder",
  "presidenza",
]);

const EXECUTIVE_INBOX_PREFIXES = new Set([
  "direzione",
  "ceo",
  "titolare",
  "founder",
  "presidenza",
]);

const COMMERCIAL_INBOX_PREFIXES = new Set([
  "commerciale",
  "vendite",
  "sales",
  "marketing",
  "preventivi",
]);

const FALLBACK_GENERIC_PREFIXES = new Set([
  "info",
  "contatti",
  "contact",
  "segreteria",
  "amministrazione",
  "ufficio",
  "office",
  "studio",
]);

const FREE_MAIL_DOMAINS = new Set([
  "gmail.com",
  "libero.it",
  "virgilio.it",
  "alice.it",
  "tin.it",
  "tiscali.it",
  "hotmail.it",
  "hotmail.com",
  "outlook.it",
  "outlook.com",
  "yahoo.it",
  "yahoo.com",
  "icloud.com",
  "inwind.it",
]);

const ITALIAN_FIRST_NAMES = new Set([
  "alessandro", "alessandra", "alessio", "alessia", "alberto", "aldo", "alfio", "alfonso", "alfredo",
  "alice", "amedeo", "andrea", "angela", "angelica", "angelo", "anna", "annalisa", "annamaria",
  "antonella", "antonello", "antonio", "antonino", "arianna", "armando", "arturo", "attilio", "augusto",
  "aurelio", "barbara", "beatrice", "benedetta", "benedetto", "bernardo", "biagio", "bianca", "bruno",
  "calogero", "camilla", "carla", "carlo", "carmela", "carmelo", "carmine", "carolina", "cateno",
  "caterina", "cecilia", "cesare", "chiara", "cinzia", "ciro", "clara", "claudia", "claudio",
  "concetta", "corrado", "cosimo", "cristian", "cristiana", "cristiano", "cristina", "damiano",
  "daniela", "daniele", "danilo", "dario", "davide", "debora", "deborah", "denis", "diego", "dino",
  "domenica", "domenico", "donatella", "donato", "edoardo", "egidio", "elena", "eleonora", "eliana",
  "elisa", "elisabetta", "elia", "emanuela", "emanuele", "emilia", "emiliano", "emilio", "enea",
  "enrica", "enrico", "enza", "enzo", "erika", "ermanno", "ernesto", "ettore", "eugenio", "ezio",
  "fabiana", "fabiano", "fabio", "fabrizio", "fausto", "federica", "federico", "felice", "ferdinando",
  "fernando", "filippo", "fiorella", "fiorenzo", "flavia", "flavio", "franca", "francesca", "francesco",
  "franco", "fulvio", "gabriele", "gabriella", "gaetano", "gastone", "gennaro", "gerardo", "germano",
  "giacomo", "giada", "giampaolo", "giampiero", "giancarlo", "gianfranco", "gianluca", "gianluigi",
  "gianmarco", "gianmaria", "gianna", "gianni", "gianpaolo", "gianpiero", "gigi", "gilda", "gino",
  "gioele", "giorgia", "giorgio", "giovanna", "giovanni", "giulia", "giuliana", "giuliano", "giulio",
  "giuseppa", "giuseppe", "giuseppina", "giusy", "gloria", "grazia", "graziano", "graziella", "gregorio",
  "guido", "iacopo", "ignazio", "ilaria", "ilario", "irene", "ivano", "ivan", "jacopo", "jessica",
  "katia", "lara", "laura", "lauro", "leonardo", "leone", "letizia", "libero", "lidia", "liliana",
  "lina", "lino", "livia", "livio", "loredana", "lorenza", "lorenzo", "loris", "luca", "lucia",
  "luciana", "luciano", "lucio", "lucrezia", "luigi", "luigia", "luigina", "luisa", "manuela",
  "manuele", "mara", "marcella", "marcello", "marco", "margherita", "maria", "marianna", "mariano",
  "marilena", "marina", "marino", "mario", "marisa", "marta", "martina", "marzio", "massimiliano",
  "massimo", "matilde", "matteo", "mattia", "maura", "maurizio", "mauro", "melissa", "michela",
  "michele", "milena", "miriam", "mirko", "mirco", "monica", "moreno", "nadia", "natale",
  "natalia", "nazzareno", "nello", "nicola", "nicole", "nicoletta", "nicolo", "nino", "noemi",
  "nunzia", "nunzio", "olga", "omar", "orazio", "orietta", "orlando", "ornella", "oscar", "osvaldo",
  "ottavio", "pamela", "paola", "paolo", "pasquale", "patrizia", "patrizio", "piera", "piergiorgio",
  "pierluigi", "piero", "pietro", "pino", "primo", "rachele", "raffaele", "raffaella", "raimondo",
  "rebecca", "remo", "renata", "renato", "renzo", "riccardo", "rina", "rino", "rita", "roberta",
  "roberto", "rocco", "rodolfo", "romano", "romina", "rosa", "rosalba", "rosalia", "rosanna",
  "rosaria", "rosario", "ruggero", "sabina", "sabrina", "salvatore", "samuele", "sandra",
  "sandro", "santa", "sante", "santi", "santo", "sara", "saverio", "sebastiano", "serena", "sergio",
  "silvana", "silvano", "silvia", "silvio", "simona", "simone", "simonetta", "sofia", "sonia",
  "stefania", "stefano", "stella", "susanna", "tania", "tiziana", "tiziano", "tommaso", "toni",
  "tonino", "tullio", "ugo", "umberto", "valentina", "valentino", "valeria", "valerio",
  "vanessa", "vanna", "vanni", "vasco", "veronica", "vincenza", "vincenzo", "virginia", "vito",
  "vittoria", "vittorio", "viviana", "walter", "wanda", "william", "yuri", "zeno",
]);

export function selectBestDecisionMakerEmail(
  rawEmails: string[],
  companyDomain: string
): { bestEmail: string | null; isGeneric: boolean; score: number } {
  const cleanCompanyDomain = companyDomain
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .toLowerCase()
    .trim();

  const seen = new Set<string>();
  const scoredCandidates: Array<{ email: string; score: number; isGeneric: boolean }> = [];

  for (const raw of rawEmails) {
    let decodedRaw = raw;
    try {
      decodedRaw = decodeURIComponent(raw);
    } catch {
      decodedRaw = raw.replace(/%20/gi, "");
    }
    const email = decodedRaw
      .trim()
      .replace(/^(?:%20|\s)+/gi, "")
      .replace(/^[0-9]+(?=[a-zA-Z])/, "")
      .toLowerCase();

    if (!email.includes("@")) continue;

    const [localPart, rawDomainPart] = email.split("@");
    if (!localPart || !rawDomainPart || localPart.length < 2) continue;
    const domainPart = rawDomainPart.replace(/^www\./i, "");
    const normalizedEmail = `${localPart}@${domainPart}`;

    if (seen.has(normalizedEmail)) continue;
    seen.add(normalizedEmail);

    // Scarta file statici, placeholder e TLD non validi
    if (
      /\.(png|jpg|jpeg|webp|svg|gif|css|js|woff|ttf)$/i.test(domainPart) ||
      !/\.(it|com|eu|net|org|info|srl|biz|co|io|tech| pro)$/i.test(domainPart) ||
      domainPart.includes("sentry") ||
      domainPart.includes("wix") ||
      domainPart.includes("prestashop") ||
      domainPart.includes("example.") ||
      domainPart.includes("esempio.") ||
      domainPart.includes("azienda.it") ||
      domainPart.includes("test.com") ||
      domainPart.includes("rossi.com") ||
      domainPart.includes("doe.com") ||
      domainPart.includes("mailservice.") ||
      domainPart.includes("mail.it") ||
      domainPart.includes("email.it") ||
      domainPart.includes("tuamail") ||
      domainPart.includes("pec.") ||
      domainPart.includes("legalmail.") ||
      domainPart.includes("arubapec.") ||
      domainPart.includes("postecert.") ||
      localPart === "your" ||
      localPart === "mymail" ||
      localPart === "email" ||
      localPart === "nome" ||
      localPart === "john" ||
      localPart === "test" ||
      localPart === "user" ||
      (localPart === "mario" && (domainPart.includes("rossi") || domainPart.includes("esempio"))) ||
      localPart.includes("u00")
    ) {
      continue;
    }

    // Hard Blacklist sul local-part o dominio PEC
    const hitsHardBlacklist = EMAIL_LOCAL_PART_BLACKLIST.some(
      (bad) =>
        localPart === bad ||
        localPart.startsWith(`${bad}.`) ||
        localPart.startsWith(`${bad}_`) ||
        localPart.startsWith(`${bad}-`) ||
        localPart.includes(bad)
    );
    if (hitsHardBlacklist) continue;

    let score = 0;
    let isGeneric = false;

    const cleanRoot = cleanCompanyDomain.split(".")[0];
    const candRoot = domainPart.split(".")[0];
    const isSameOrRelatedCompanyDomain =
      Boolean(cleanCompanyDomain) &&
      (domainPart === cleanCompanyDomain ||
        (cleanRoot &&
          cleanRoot.length >= 4 &&
          (candRoot.includes(cleanRoot) || cleanRoot.includes(candRoot))));

    // +30 pt se il dominio dell'email coincide col dominio del sito aziendale (penalizza domini terzi/web agency non correlati)
    if (isSameOrRelatedCompanyDomain) {
      score += 30;
    } else if (FREE_MAIL_DOMAINS.has(domainPart)) {
      score -= 10;
    } else if (cleanCompanyDomain) {
      score -= 45;
    }

    const domainRoot = cleanCompanyDomain.split(".")[0];
    if (domainRoot && domainRoot.length >= 4 && localPart.includes(domainRoot)) {
      score += 20;
    }

    const dotParts = localPart.split(".");
    const isNominalDotPattern =
      /^[a-z]{2,15}\.[a-z]{2,18}$/i.test(localPart) &&
      ITALIAN_FIRST_NAMES.has(dotParts[0]) &&
      !dotParts.some(
        (part) =>
          GENERIC_INBOX_PREFIXES.has(part) ||
          DECISION_MAKER_STOPWORDS.has(part) ||
          cleanCompanyDomain.includes(part)
      );

    const isInitialDotSurnamePattern =
      /^[a-z]\.[a-z]{3,18}$/i.test(localPart) &&
      !GENERIC_INBOX_PREFIXES.has(dotParts[1]) &&
      !DECISION_MAKER_STOPWORDS.has(dotParts[1]) &&
      !cleanCompanyDomain.includes(dotParts[1]);

    const isSingleProperName =
      /^[a-z]{3,13}$/i.test(localPart) &&
      ITALIAN_FIRST_NAMES.has(localPart) &&
      !GENERIC_INBOX_PREFIXES.has(localPart) &&
      !DECISION_MAKER_STOPWORDS.has(localPart) &&
      !cleanCompanyDomain.includes(localPart) &&
      !EMAIL_LOCAL_PART_BLACKLIST.includes(localPart);

    if (isNominalDotPattern || isInitialDotSurnamePattern) {
      // +60 pt per pattern nominali nome.cognome@ o n.cognome@ (Gold Standard)
      score += 60;
      isGeneric = false;
    } else if (isSingleProperName) {
      // +50 pt per pattern nome proprio singolo (marco@, alessandro@)
      score += 50;
      isGeneric = false;
    } else if (EXECUTIVE_INBOX_PREFIXES.has(localPart)) {
      // +45 pt per caselle direzionali (direzione@, ceo@, titolare@, founder@, presidenza@)
      score += 45;
      isGeneric = true;
    } else if (COMMERCIAL_INBOX_PREFIXES.has(localPart)) {
      // +15 pt per commerciale@ / vendite@ / marketing@
      score += 15;
      isGeneric = true;
    } else if (FALLBACK_GENERIC_PREFIXES.has(localPart)) {
      // +5 pt (ultimo fallback) per info@, contatti@, segreteria@, amministrazione@
      score += 5;
      isGeneric = true;
    } else {
      score += 8;
      isGeneric = true;
    }

    scoredCandidates.push({ email: normalizedEmail, score, isGeneric });
  }

  if (scoredCandidates.length === 0) {
    return { bestEmail: null, isGeneric: true, score: 0 };
  }

  scoredCandidates.sort((a, b) => b.score - a.score);
  const winner = scoredCandidates[0];
  return {
    bestEmail: winner.email,
    isGeneric: winner.isGeneric,
    score: winner.score,
  };
}

/**
 * DIRETTIVA 3: ESTRAZIONE REALE DEL DECISION MAKER (STOP A "Direzione ${companyName}")
 */
const DECISION_MAKER_STOPWORDS = new Set([
  "privacy",
  "policy",
  "cookie",
  "titolare",
  "trattamento",
  "dati",
  "personali",
  "sede",
  "legale",
  "operativa",
  "tutti",
  "diritti",
  "riservati",
  "codice",
  "fiscale",
  "partita",
  "iva",
  "capitale",
  "sociale",
  "registro",
  "imprese",
  "camera",
  "commercio",
  "societa",
  "unipersonale",
  "responsabilita",
  "limitata",
  "amministratore",
  "unico",
  "delegato",
  "rappresentante",
  "pro",
  "tempore",
  "consiglio",
  "amministrazione",
  "direzione",
  "generale",
  "ufficio",
  "tecnico",
  "commerciale",
  "vendite",
  "servizio",
  "clienti",
  "assistenza",
  "contatti",
  "chi",
  "siamo",
  "storia",
  "azienda",
  "gruppo",
  "studio",
  "impresa",
  "officina",
  "carpenteria",
  "impianti",
  "serramenti",
  "forniture",
  "industriali",
  "lavorazioni",
  "meccaniche",
  "automazione",
  "italia",
  "via",
  "viale",
  "piazza",
  "corso",
  "strada",
  "vicolo",
  "contrada",
  "zona",
  "industriale",
  "artigianale",
  "san",
  "santa",
  "sant",
  "monte",
  "valle",
  "ponte",
  "villa",
  "porta",
  "borgo",
  "castel",
  "corte",
  "nuova",
  "vecchia",
  "alta",
  "bassa",
  "nord",
  "sud",
  "est",
  "ovest",
  "centro",
  "lunedì",
  "venerdì",
  "sabato",
  "domenica",
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
  "sistemi",
  "soluzioni",
  "tecnologie",
  "energie",
  "rinnovabili",
  "fotovoltaico",
  "solare",
  "infissi",
  "finestre",
  "persiane",
  "porte",
  "alluminio",
  "legno",
  "acciaio",
  "ferro",
  "metallica",
  "metalliche",
  "costruzioni",
  "edilizia",
  "progettazione",
  "installazione",
  "manutenzione",
  "produzione",
  "realizzazione",
  "informativa",
  "consenso",
  "interessato",
  "garante",
  "regolamento",
  "europeo",
  "unione",
  "europea",
  "nostro",
  "nostra",
  "vostro",
  "vostra",
  "questo",
  "questa",
  "essere",
  "avere",
  "presso",
  "anche",
  "solo",
  "dopo",
  "prima",
  "sempre",
  "tutto",
  "tutta",
  "ogni",
  "altro",
  "altra",
  "qualita",
  "esperienza",
  "sicurezza",
  "preventivo",
  "gratuito",
  "richiedi",
  "scopri",
  "contattaci",
  "chiamaci",
  "scrivici",
  "seguici",
  "telefono",
  "cellulare",
  "email",
  "indirizzo",
  "orari",
  "apertura",
  "chiusura",
  ...ITALIAN_CITIES.map((c) => c.toLowerCase()),
]);

function capitalizeWord(w: string): string {
  if (!w) return "";
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
}

function isValidItalianFullName(first: string, last: string): boolean {
  if (!first || !last) return false;
  const fClean = first.trim();
  const lClean = last.trim();
  if (fClean.length < 3 || fClean.length > 15) return false;
  if (lClean.length < 3 || lClean.length > 15) return false;
  if (!/^[A-ZÀÈÉÌÒÙ][a-zàèéìòù']+$/.test(fClean)) return false;
  if (!/^[A-ZÀÈÉÌÒÙ][a-zàèéìòù']+$/.test(lClean)) return false;
  if (!ITALIAN_FIRST_NAMES.has(fClean.toLowerCase())) return false;
  if (DECISION_MAKER_STOPWORDS.has(fClean.toLowerCase())) return false;
  if (DECISION_MAKER_STOPWORDS.has(lClean.toLowerCase())) return false;
  if (fClean.toLowerCase() === lClean.toLowerCase()) return false;
  return true;
}

export function extractDecisionMakerFromHtml(
  combinedHtml: string,
  bestEmail: string
): { fullName: string | null; firstName: string | null; role: string | null } {
  const cleanText = stripTags(combinedHtml);

  const rolePatterns: Array<{ regex: RegExp; defaultRole: string }> = [
    {
      regex:
        /\b(?:Legale\s+Rappresentante|Rappresentante\s+Legale|nella\s+persona\s+del\s+(?:suo\s+)?legale\s+rappresentante(?:\s+pro[- ]tempore)?)\s*(?:[:,-]|\bdi|\bè|\bsig\.?|\bdott\.?|\bing\.?|\bgeom\.?|\barch\.?)*\s*([A-ZÀÈÉÌÒÙ][A-Za-zàèéìòù]{2,14})\s+([A-ZÀÈÉÌÒÙ][A-Za-zàèéìòù]{2,14})\b/gi,
      defaultRole: "Legale Rappresentante",
    },
    {
      regex:
        /\b(?:Amministratore\s+Unico|Amministratore\s+Delegato|Presidente\s+del\s+CdA|Amministratore)\s*(?:[:,-]|\bdi|\bè|\bsig\.?|\bdott\.?|\bing\.?|\bgeom\.?|\barch\.?)*\s*([A-ZÀÈÉÌÒÙ][A-Za-zàèéìòù]{2,14})\s+([A-ZÀÈÉÌÒÙ][A-Za-zàèéìòù]{2,14})\b/gi,
      defaultRole: "Amministratore",
    },
    {
      regex:
        /\b(?:nella\s+persona\s+di|Titolare\s+del\s+trattamento(?:\s+dei\s+dati(?:\s+personali)?)?\s*(?:è|:|-))\s*(?:[:,-]|\bsig\.?|\bdott\.?|\bing\.?|\bgeom\.?|\barch\.?)*\s*([A-ZÀÈÉÌÒÙ][A-Za-zàèéìòù]{2,14})\s+([A-ZÀÈÉÌÒÙ][A-Za-zàèéìòù]{2,14})\b/gi,
      defaultRole: "Titolare",
    },
    {
      regex:
        /\b(?:Fondatore|Co-Founder|Founder|CEO|Titolare|Direttore\s+Generale|Direttore\s+Commerciale)\s*(?:[:,-]|\bsig\.?|\bdott\.?|\bing\.?|\bgeom\.?|\barch\.?)*\s*([A-ZÀÈÉÌÒÙ][A-Za-zàèéìòù]{2,14})\s+([A-ZÀÈÉÌÒÙ][A-Za-zàèéìòù]{2,14})\b/gi,
      defaultRole: "Titolare",
    },
    {
      regex:
        /\b(?:Dott\.ssa|Dott\.|Ing\.|Geom\.|Arch\.|Sig\.ra|Sig\.)\s+([A-ZÀÈÉÌÒÙ][A-Za-zàèéìòù]{2,14})\s+([A-ZÀÈÉÌÒÙ][A-Za-zàèéìòù]{2,14})\b/g,
      defaultRole: "Direzione Tecnica",
    },
  ];

  for (const { regex, defaultRole } of rolePatterns) {
    const matches = [...cleanText.matchAll(regex)];
    for (const m of matches) {
      const first = capitalizeWord(m[1]);
      const last = capitalizeWord(m[2]);
      if (isValidItalianFullName(first, last)) {
        return {
          fullName: `${first} ${last}`,
          firstName: first,
          role: defaultRole,
        };
      }
    }
  }

  // Fallback da Email Nominale (es. nome.cognome@dominio.it)
  if (bestEmail && bestEmail.includes("@")) {
    const localPart = bestEmail.split("@")[0].toLowerCase();
    const dotMatch = localPart.match(/^([a-z]{3,14})\.([a-z]{3,15})$/);
    if (dotMatch) {
      const f = capitalizeWord(dotMatch[1]);
      const l = capitalizeWord(dotMatch[2]);
      if (
        !GENERIC_INBOX_PREFIXES.has(dotMatch[1]) &&
        !GENERIC_INBOX_PREFIXES.has(dotMatch[2]) &&
        isValidItalianFullName(f, l)
      ) {
        return {
          fullName: `${f} ${l}`,
          firstName: f,
          role: "Direzione",
        };
      }
    }
  }

  return { fullName: null, firstName: null, role: null };
}

/**
 * DIRETTIVA 4: RILEVAMENTO REALE ADS & PIXEL (STOP ALLE ALLUCINAZIONI SULLE CAMPAGNE)
 */
export function detectActiveAdTracking(
  html: string,
  cameFromAdLibrary: boolean
): { runsAds: boolean; signals: string[] } {
  const lower = (html || "").toLowerCase();
  const signals: string[] = [];

  if (cameFromAdLibrary) {
    signals.push("Meta Ad Library Active Advertiser");
  }
  if (
    lower.includes("connect.facebook.net") ||
    lower.includes("fbq('init'") ||
    lower.includes('fbq("init"') ||
    lower.includes("fbevents.js")
  ) {
    signals.push("Meta Pixel");
  }
  if (
    lower.includes("googletagmanager.com/gtm.js") ||
    lower.includes("googleadservices.com") ||
    lower.includes("gtag('config', 'aw-") ||
    lower.includes('gtag("config", "aw-') ||
    lower.includes("google_conversion_id")
  ) {
    signals.push("Google Ads / GTM");
  }
  if (lower.includes("analytics.tiktok.com") || lower.includes("snap.licdn.com")) {
    signals.push("TikTok / LinkedIn Pixel");
  }

  return {
    runsAds: signals.length > 0,
    signals,
  };
}

/**
 * DIRETTIVA 5 & 6: RE-INGEGNERIZZAZIONE TOTALE DEL COPY E SEQUENZA MULTI-STEP (4 TOUCHPOINTS)
 * - Vietato iniziare con "Mi chiamo..." o "Siamo un'agenzia che..."
 * - Vietato menzionare prezzi ("900 euro"), sconti o "zero canoni"
 * - Vietato chiedere di rispondere 'LINK'
 * - First Touch: 65-85 parole, zero link cliccabili
 * - 4 Touchpoints nello stesso thread
 */
export function buildMultiStepOutreach({
  slug,
  companyName,
  decisionMaker,
  isGenericInbox,
  estimatedMobileLcpSeconds,
  renderBlockingScripts,
  runsAds,
}: {
  slug: string;
  companyName: string;
  decisionMaker: { fullName: string | null; firstName: string | null; role: string | null };
  isGenericInbox: boolean;
  estimatedMobileLcpSeconds: number;
  renderBlockingScripts: number;
  runsAds: boolean;
}): LeadConfig["outreach"] {
  const demoUrl = `https://www.techpyre.eu/demo/${slug}`;
  const blockingCount = Math.max(4, renderBlockingScripts);

  const cleanCompanyName = decodeHtmlEntities(companyName);
  const cleanFullName = decisionMaker.fullName
    ? decodeHtmlEntities(decisionMaker.fullName)
    : null;
  const cleanFirstName = decisionMaker.firstName
    ? decodeHtmlEntities(decisionMaker.firstName)
    : null;

  // Regola di Salvaguardia info@: Se isGeneric === true e abbiamo trovato fullName, forza l'oggetto a iniziare con "Per ${fullName} - ..."
  const baseSubject = runsAds
    ? ` dispersione clic mobile e tempi di caricamento di ${cleanCompanyName} (${estimatedMobileLcpSeconds}s)`
    : ` tempi di caricamento mobile e richieste preventivo di ${cleanCompanyName} (${estimatedMobileLcpSeconds}s)`;

  const emailSubject =
    isGenericInbox && cleanFullName
      ? `Per ${cleanFullName} -${baseSubject}`
      : `${cleanCompanyName} -${baseSubject}`;

  const threadSubject = `Re: ${emailSubject}`;
  const greeting = cleanFirstName
    ? `Buongiorno ${cleanFirstName},`
    : `Buongiorno,`;

  // STEP 1 (Giorno 1 - First Touch: 65-85 parole totali, zero link, zero prezzi, zero 'LINK')
  const step1Paragraph1 = runsAds
    ? `da un test sul sito di ${cleanCompanyName}, da smartphone impiega ${estimatedMobileLcpSeconds} secondi ad aprirsi per ${blockingCount} blocchi di codice, disperdendo buona parte dei clic pagati.`
    : `da un test sul sito di ${cleanCompanyName}, da smartphone impiega ${estimatedMobileLcpSeconds} secondi ad aprirsi per ${blockingCount} risorse bloccanti, frenando le richieste di preventivo.`;

  const step1Body = [
    greeting,
    ``,
    step1Paragraph1,
    ``,
    `Abbiamo gia preparato una demo in Next.js per ${cleanCompanyName} che carica in 0.3 secondi su mobile e pre-qualifica i contatti commerciali.`,
    ``,
    `Vi fa piacere se vi giro qui sotto il link di prova cosi la testate direttamente dal vostro smartphone senza impegno?`,
    ``,
    `Riccardo Granza - TechPyre`,
    `+39 379 115 9352`,
  ].join("\n");

  // STEP 2 (Giorno 4 - In-Thread o su risposta positiva: 40-50 parole, link demo diretto)
  const step2Body = [
    greeting,
    ``,
    `vi lascio qui sotto il link della demo da 0.3 secondi preparata per ${cleanCompanyName}, completa di filtro pre-qualifica contatti:`,
    ``,
    demoUrl,
    ``,
    `Avete 10 minuti tra martedi e giovedi per vedere come collegarla al vostro flusso commerciale?`,
    ``,
    `Riccardo Granza - TechPyre Studio`,
    `+39 379 115 9352`,
  ].join("\n");

  // STEP 3 (Giorno 8 - In-Thread: 30-40 parole, focus collo di bottiglia + requiresFollowUpCall: true)
  const step3Focus = runsAds
    ? `Oltre a tagliare i ${estimatedMobileLcpSeconds} secondi su mobile, l'infrastruttura recupera il 40% delle conversioni tramite Server-Side Tracking.`
    : `Oltre a tagliare i ${estimatedMobileLcpSeconds} secondi su mobile, il sistema qualifica ogni preventivo prima di inviarlo al CRM.`;

  const step3Body = [
    greeting,
    ``,
    step3Focus,
    ``,
    `Provo a farvi uno squillo in settimana per un confronto di 10 minuti.`,
    ``,
    `Riccardo Granza - TechPyre Studio`,
  ].join("\n");

  // STEP 4 (Giorno 13 - In-Thread: Breakup cortese senza pressione)
  const step4Body = [
    greeting,
    ``,
    `immagino che ottimizzare i tempi mobile e la qualifica contatti di ${cleanCompanyName} non sia una priorita in questo trimestre.`,
    ``,
    `Vi lascio comunque attiva la demo (${demoUrl}) ancora per qualche giorno se voleste darci un'occhiata in futuro. Resto a disposizione se le priorita dovessero cambiare.`,
    ``,
    `Un cordiale saluto e buon lavoro,`,
    `Riccardo Granza - TechPyre Studio`,
    `WhatsApp diretto: +39 379 115 9352`,
  ].join("\n");

  const step1FirstTouch: OutreachStep = {
    dayOffset: 1,
    subject: emailSubject,
    body: step1Body,
    inThread: false,
    requiresFollowUpCall: false,
  };

  const step2FollowUpLink: OutreachStep = {
    dayOffset: 4,
    subject: threadSubject,
    body: step2Body,
    inThread: true,
    requiresFollowUpCall: false,
  };

  const step3ValueDropAndCallTrigger: OutreachStep = {
    dayOffset: 8,
    subject: threadSubject,
    body: step3Body,
    inThread: true,
    requiresFollowUpCall: true,
  };

  const step4Breakup: OutreachStep = {
    dayOffset: 13,
    subject: threadSubject,
    body: step4Body,
    inThread: true,
    requiresFollowUpCall: false,
  };

  return {
    emailSubject,
    emailPlainTextBody: step1Body,
    followUpWithLinkBody: step2Body,
    step1FirstTouch,
    step2FollowUpLink,
    step3ValueDropAndCallTrigger,
    step4Breakup,
  };
}

/**
 * PATCH CRITICA 1: MIGRAZIONE AUTOMATICA DEI LEAD STORICI (BACKWARD COMPATIBILITY & PURGE)
 * - Verifica e rigenera i campi della sequenza 4-step (`step1FirstTouch`..`step4Breakup`), `runsAds`, `threeCriticalFlaws`.
 * - Scarta / marca come `INVALID_TICKET_INBOX` qualsiasi lead storico la cui `targetEmail` rientri in `HARD_BLOCKED_EMAIL_PREFIXES`
 *   (a meno che non sia disponibile un'email valida alternativa in `preflight.json`).
 * - Esegue pulizia e re-scoring dell'email e del `decisionMakerName` (rimuovendo falsi positivi o arricchendo da email nominale).
 */
export function migrateOldLeadConfig(
  lead: LeadConfig,
  persistIfChanged = false
): LeadConfig {
  if (!lead || !lead.meta || !lead.audit || !lead.outreach) {
    return lead;
  }

  let changed = false;

  // -1. Vincolo stretto sui 3 archetipi/template ufficiali
  if (!OFFICIAL_TEMPLATE_IDS.includes(lead.archetype)) {
    const inferredArchetype = detectArchetype(
      lead.meta.companyName || "",
      `${lead.content?.heroHeadline || ""} ${lead.content?.heroSubheadline || ""}`
    );
    lead.archetype = assertOfficialArchetype(inferredArchetype);
    changed = true;
  }

  // 0. Decodifica entità HTML residue e rimozione caratteri problematici (es. &#8211;, &rsquo;, ·)
  if (lead.meta.companyName) {
    const decodedCompany = decodeHtmlEntities(lead.meta.companyName).replace(/\s+/g, " ").trim();
    if (decodedCompany !== lead.meta.companyName) {
      lead.meta.companyName = decodedCompany;
      changed = true;
    }
  }
  if (lead.content) {
    if (lead.content.heroHeadline) {
      const decodedH = decodeHtmlEntities(lead.content.heroHeadline).replace(/\s+/g, " ").trim();
      if (decodedH !== lead.content.heroHeadline) {
        lead.content.heroHeadline = decodedH;
        changed = true;
      }
    }
    if (lead.content.heroSubheadline) {
      const decodedSub = decodeHtmlEntities(lead.content.heroSubheadline).replace(/\s+/g, " ").trim();
      if (decodedSub !== lead.content.heroSubheadline) {
        lead.content.heroSubheadline = decodedSub;
        changed = true;
      }
    }
  }

  // 1. Raccolta email candidate (incluso eventuale preflight.json salvato in public/leads/[slug]/preflight.json)
  const rawEmails: string[] = [];
  if (lead.meta.targetEmail) {
    rawEmails.push(lead.meta.targetEmail);
  }

  let preflightSignals: string[] = [];
  try {
    const preflightPath = path.join(
      process.cwd(),
      "public",
      "leads",
      lead.slug,
      "preflight.json"
    );
    if (fs.existsSync(/*turbopackIgnore: true*/ preflightPath)) {
      const preflight = JSON.parse(
        fs.readFileSync(/*turbopackIgnore: true*/ preflightPath, "utf-8")
      );
      if (Array.isArray(preflight?.extractedEmails)) {
        for (const e of preflight.extractedEmails) {
          if (typeof e === "string" && !rawEmails.includes(e)) {
            rawEmails.push(e);
          }
        }
      }
      if (Array.isArray(preflight?.qualification?.agencyDetection?.martechSignals)) {
        preflightSignals = preflight.qualification.agencyDetection.martechSignals;
      }
    }
  } catch {
    // ignora errori di lettura preflight
  }

  // 2. Re-scoring dell'indirizzo email e verifica Hard Blacklist
  const companyDomain = lead.meta.originalLandingUrl || "";
  const scored = selectBestDecisionMakerEmail(rawEmails, companyDomain);

  if (isHardBlockedEmail(lead.meta.targetEmail)) {
    if (scored.bestEmail && !isHardBlockedEmail(scored.bestEmail)) {
      // Trovata email sostitutiva valida dal preflight del dominio!
      lead.meta.targetEmail = scored.bestEmail;
      lead.meta.isGenericInbox = scored.isGeneric;
      lead.meta.emailScore = scored.score;
      changed = true;
    } else {
      // Nessuna email valida superstite: metti il lead in INVALID_TICKET_INBOX
      if (
        lead.meta.status !== "INVALID_TICKET_INBOX" &&
        lead.meta.status !== "BLACKLISTED"
      ) {
        lead.meta.status = "INVALID_TICKET_INBOX";
        lead.meta.emailScore = 0;
        changed = true;
      }
    }
  } else if (scored.bestEmail) {
    if (
      scored.bestEmail !== lead.meta.targetEmail ||
      lead.meta.isGenericInbox === undefined ||
      lead.meta.emailScore === undefined
    ) {
      lead.meta.targetEmail = scored.bestEmail;
      lead.meta.isGenericInbox = scored.isGeneric;
      lead.meta.emailScore = scored.score;
      changed = true;
    }
  }

  // 3. Pulizia e re-scoring del Decision Maker Name (stop a falsi positivi o vecchi placeholder)
  const currentDm = (lead.meta.decisionMakerName || "").trim();
  const isPlaceholderDm =
    !currentDm ||
    currentDm.startsWith("Direzione ") ||
    currentDm.startsWith("Titolare ");

  let hasStopwordInDm = false;
  if (!isPlaceholderDm) {
    const dmParts = currentDm
      .replace(/^(?:Ing\.|Dott\.ssa|Dott\.|Arch\.|Geom\.|Sig\.|Avv\.)\s*/i, "")
      .trim()
      .split(/\s+/);
    if (
      dmParts.length < 2 ||
      dmParts.length > 3 ||
      dmParts.some((w) => DECISION_MAKER_STOPWORDS.has(w.toLowerCase()))
    ) {
      hasStopwordInDm = true;
    }
  }

  if (isPlaceholderDm || hasStopwordInDm || lead.meta.decisionMakerFirstName === undefined) {
    const extractedFromEmail = extractDecisionMakerFromHtml("", lead.meta.targetEmail);
    if (extractedFromEmail.fullName) {
      lead.meta.decisionMakerName = extractedFromEmail.fullName;
      lead.meta.decisionMakerFirstName = extractedFromEmail.firstName;
      lead.meta.decisionMakerRole = extractedFromEmail.role || "Direzione";
      changed = true;
    } else if (!isPlaceholderDm && !hasStopwordInDm) {
      const cleanParts = currentDm
        .replace(/^(?:Ing\.|Dott\.ssa|Dott\.|Arch\.|Geom\.|Sig\.|Avv\.)\s*/i, "")
        .trim()
        .split(/\s+/);
      lead.meta.decisionMakerFirstName = cleanParts[0] || null;
      lead.meta.decisionMakerRole = lead.meta.decisionMakerRole || "Titolare";
      changed = true;
    } else {
      const fallbackDm = `Direzione ${lead.meta.companyName}`;
      if (
        lead.meta.decisionMakerName !== fallbackDm ||
        lead.meta.decisionMakerFirstName !== null
      ) {
        lead.meta.decisionMakerName = fallbackDm;
        lead.meta.decisionMakerFirstName = null;
        lead.meta.decisionMakerRole = "Direzione Aziendale";
        changed = true;
      }
    }
  }

  // 4. Verifica `runsAds`, `detectedTrackingSignals`, `renderBlockingCount` e `threeCriticalFlaws`
  if (lead.audit.runsAds === undefined) {
    const cameFromAdLib =
      Boolean(lead.meta.adLibraryUrl && lead.meta.adLibraryUrl.includes("facebook.com/ads/library")) ||
      preflightSignals.length > 0;
    lead.audit.runsAds = cameFromAdLib;
    lead.audit.detectedTrackingSignals =
      preflightSignals.length > 0
        ? preflightSignals
        : cameFromAdLib
        ? ["Meta Ad Library"]
        : [];
    changed = true;
  }

  if (!lead.audit.renderBlockingCount) {
    lead.audit.renderBlockingCount = 8;
    changed = true;
  }

  const lcpVal = lead.audit.originalLcpSeconds || 6.5;
  const blockingCount = lead.audit.renderBlockingCount || 8;
  const expectedFlaws: [string, string, string] = lead.audit.runsAds
    ? [
        `Dispersione del Traffico Mobile (${lcpVal}s LCP): oltre metà degli utenti che cliccano su un'inserzione da smartphone abbandona la pagina prima dell'apertura per via di ${blockingCount} blocchi di rendering`,
        `Perdita Dati di Conversione (Assenza Server-Side): i pixel standard lato browser perdono fino al 40-50% delle conversioni reali per blocchi iOS, cookie banner e ad-blocker`,
        `Collo di Bottiglia Commerciale: le richieste finiscono in email isolate senza pre-qualifica né invio istantaneo al CRM della rete vendita`,
      ]
    : [
        `Abbandono Preventivi da Mobile (${lcpVal}s LCP): i potenziali clienti B2B che visitano il sito da smartphone attendono ${lcpVal} secondi a causa di ${blockingCount} risorse bloccanti prima di vedere l'offerta`,
        `Assenza di Qualifica Commerciale Automatica: i visitatori atterrano su moduli generici che inviano semplici email isolate, costringendo il team a filtrare e ricopiare i dati a mano`,
        `Scollegamento dal Flusso Vendite (CRM): manca un collegamento automatico che classifichi il cliente per tipologia di intervento e notifichi subito il referente commerciale`,
      ];

  if (
    !lead.audit.threeCriticalFlaws ||
    (!lead.audit.runsAds &&
      lead.audit.threeCriticalFlaws.some((f) => /campagne|inserzion|clic pagat/i.test(f)))
  ) {
    lead.audit.threeCriticalFlaws = expectedFlaws;
    changed = true;
  }

  // 5. Verifica o rigenerazione dei 4 Step Outreach (Zero-Fluff Protocol + Clean Encoding senza · né entità HTML)
  const hasLegacyCopy =
    !lead.outreach.step1FirstTouch ||
    !lead.outreach.step2FollowUpLink ||
    !lead.outreach.step3ValueDropAndCallTrigger ||
    !lead.outreach.step4Breakup ||
    /mi chiamo|900\s*euro|zero canoni|rispondetemi pure ['"]?link['"]?/i.test(
      lead.outreach.emailPlainTextBody || ""
    ) ||
    /[\u00b7\u2013\u2014]|&#\d+;|&[a-z]+;/i.test(
      (lead.outreach.emailSubject || "") +
        " " +
        (lead.outreach.emailPlainTextBody || "") +
        " " +
        (lead.outreach.followUpWithLinkBody || "")
    ) ||
    (!lead.audit.runsAds &&
      /clic pagati|campagne/i.test(lead.outreach.emailPlainTextBody || ""));

  if (hasLegacyCopy) {
    const cleanFullName =
      lead.meta.decisionMakerName &&
      !lead.meta.decisionMakerName.startsWith("Direzione ") &&
      !lead.meta.decisionMakerName.startsWith("Titolare ")
        ? lead.meta.decisionMakerName
        : null;

    lead.outreach = buildMultiStepOutreach({
      slug: lead.slug,
      companyName: lead.meta.companyName,
      decisionMaker: {
        fullName: cleanFullName,
        firstName: lead.meta.decisionMakerFirstName ?? null,
        role: lead.meta.decisionMakerRole ?? null,
      },
      isGenericInbox: lead.meta.isGenericInbox ?? true,
      estimatedMobileLcpSeconds: lcpVal,
      renderBlockingScripts: blockingCount,
      runsAds: Boolean(lead.audit.runsAds),
    });
    changed = true;
  }

  if (changed && persistIfChanged) {
    saveLeadConfig(lead.slug, lead);
  }

  return lead;
}

export async function discoverMetaAdLibraryBusinesses(
  keywords: string | string[],
  limit = 20
): Promise<CandidateBusiness[]> {
  const browserBin = getLocalBrowserBin();
  if (!browserBin) return [];

  const kwList = Array.isArray(keywords) ? keywords : [keywords];
  const seenHosts = new Set<string>();
  const candidates: CandidateBusiness[] = [];

  const userDataDir = `/tmp/techpyre-adlib-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
  let proc: ReturnType<typeof spawn> | null = null;
  let ws: WebSocket | null = null;

  try {
    proc = spawn(/*turbopackIgnore: true*/ browserBin, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ]);

    const wsUrl = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("CDP timeout")), 10000);
      proc?.stderr?.on("data", (chunk: Buffer) => {
        const m = chunk.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (m) {
          clearTimeout(timer);
          resolve(m[1]);
        }
      });
      proc?.on("error", (err) => {
        clearTimeout(timer);
        reject(err);
      });
    });

    const baseHttp = wsUrl
      .replace(/^ws:\/\//, "http://")
      .replace(/\/devtools\/browser\/.*$/, "");
    const targets = (await fetch(`${baseHttp}/json/list`).then((r) =>
      r.json()
    )) as Array<{ type: string; webSocketDebuggerUrl?: string }>;
    const pageTarget = targets.find((t) => t.type === "page");

    if (pageTarget?.webSocketDebuggerUrl) {
      ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        ws!.addEventListener("open", resolve);
        ws!.addEventListener("error", reject);
      });

      let msgId = 1;
      const pending = new Map<number, (val: unknown) => void>();
      ws.addEventListener("message", (ev) => {
        try {
          const msg = JSON.parse(String(ev.data));
          if (msg.id && pending.has(msg.id)) {
            pending.get(msg.id)!(msg.result);
            pending.delete(msg.id);
          }
        } catch {
          // ignore
        }
      });

      const send = (method: string, params: Record<string, unknown> = {}) =>
        new Promise<Record<string, unknown>>((resolve, reject) => {
          const id = msgId++;
          const timer = setTimeout(() => {
            pending.delete(id);
            reject(new Error(`Timeout ${method}`));
          }, 18000);
          pending.set(id, (res) => {
            clearTimeout(timer);
            resolve((res || {}) as Record<string, unknown>);
          });
          ws!.send(JSON.stringify({ id, method, params }));
        });

      await send("Page.enable");
      await send("Network.enable");
      await send("Runtime.enable");
      await send("Network.setUserAgentOverride", {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        platform: "MacIntel",
        acceptLanguage: "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
      });

      for (const keyword of kwList) {
        if (candidates.length >= limit) break;
        const adLibUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IT&media_type=all&q=${encodeURIComponent(
          keyword
        )}&search_type=keyword_unordered`;

        try {
          await send("Page.navigate", { url: adLibUrl });
          await new Promise((r) => setTimeout(r, 4200));
          for (let s = 0; s < 3; s++) {
            await send("Runtime.evaluate", {
              expression: "window.scrollBy(0, 3500);",
            });
            await new Promise((r) => setTimeout(r, 1100));
          }

          const evalRes = (await send("Runtime.evaluate", {
            returnByValue: true,
            expression: "document.documentElement.outerHTML",
          })) as { result?: { value?: string } };
          const domHtml = evalRes?.result?.value || "";
          if (!domHtml) continue;

          const matches = [
            ...domHtml.matchAll(
              /https?:\\?\/\\?\/l\.facebook\.com\\?\/l\.php\?u=([^"'&\s<>\\]+)/gi
            ),
          ];

          for (const m of matches) {
            let decoded: string;
            try {
              decoded = decodeURIComponent(m[1]);
            } catch {
              continue;
            }

            let parsed: URL;
            try {
              parsed = new URL(decoded);
            } catch {
              continue;
            }

            const host = parsed.hostname.toLowerCase();
            if (
              EXCLUDED_DOMAINS.some((ex) => host.includes(ex)) ||
              host.includes("fb.me") ||
              host.includes("fb.com") ||
              host.includes("linktr.ee") ||
              host.includes("bit.ly") ||
              host.includes("calendly.com") ||
              host.includes("forms.gle") ||
              host.includes("shopify.com")
            ) {
              continue;
            }
            if (seenHosts.has(host)) continue;
            seenHosts.add(host);

            const slugCheck = slugifyDomain(host);
            if (!slugCheck || loadLeadConfig(slugCheck)) continue;

            const idx = m.index || 0;
            const windowHtml = domHtml.slice(
              Math.max(0, idx - 1800),
              Math.min(domHtml.length, idx + 800)
            );
            const contextText = stripTags(windowHtml).slice(0, 350);

            candidates.push({
              targetUrl: decoded,
              fallbackDescription: contextText || keyword,
              candidateAdLibraryUrl: adLibUrl,
              candidateAdSnippet: contextText || undefined,
            });

            if (candidates.length >= limit) break;
          }
        } catch {
          continue;
        }
      }
    }
  } catch {
    // ignore
  } finally {
    try {
      if (ws) ws.close();
    } catch {}
    try {
      if (proc) proc.kill("SIGKILL");
    } catch {}
    try {
      fs.rmSync(/*turbopackIgnore: true*/ userDataDir, {
        recursive: true,
        force: true,
      });
    } catch {}
  }

  return candidates;
}

function splitKeywordIntoWhatAndWhere(keyword: string): { what: string; where: string } {
  const cleaned = keyword.trim();
  const words = cleaned.split(/\s+/);
  for (const city of ITALIAN_CITIES) {
    const regex = new RegExp(`\\b${city}\\b`, "i");
    if (regex.test(cleaned)) {
      const what = cleaned.replace(regex, "").replace(/\s+/g, " ").trim();
      return {
        what: what || cleaned,
        where: city.toLowerCase(),
      };
    }
  }
  if (words.length >= 2) {
    const lastWord = words[words.length - 1];
    const rest = words.slice(0, -1).join(" ");
    if (lastWord.length >= 4 && !/industriale|aziendale|commerciale|speciale|italia|srl|spa|b2b/i.test(lastWord)) {
      return { what: rest, where: lastWord.toLowerCase() };
    }
  }
  return { what: cleaned, where: "" };
}

/**
 * DIRETTIVA 1: SCOPERTA URL & FIX BUG PAGINEGIALLE
 * - Scarta categoricamente qualsiasi candidato che non possieda un dominio web proprietario reale.
 * - Vietato usare schedaUrl di PagineGialle come targetUrl.
 */
export async function discoverItalianBusinesses(
  keyword: string,
  limit = 12
): Promise<CandidateBusiness[]> {
  const candidates: CandidateBusiness[] = [];
  const seenHosts = new Set<string>();

  const trimmed = keyword.trim();

  if (/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i.test(trimmed) && !trimmed.includes(" ")) {
    const directUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    return [{ targetUrl: directUrl }];
  }

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9",
  };

  const { what, where } = splitKeywordIntoWhatAndWhere(trimmed);
  const pgSearchUrls = where
    ? [
        `https://www.paginegialle.it/ricerca/${encodeURIComponent(what)}/${encodeURIComponent(where)}`,
        `https://www.paginegialle.it/ricerca/${encodeURIComponent(trimmed)}`,
      ]
    : [`https://www.paginegialle.it/ricerca/${encodeURIComponent(trimmed)}`];

  const pgDetailUrls: string[] = [];

  for (const pgUrl of pgSearchUrls) {
    if (pgDetailUrls.length >= limit * 3) break;
    try {
      const res = await fetch(pgUrl, {
        headers,
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const html = await res.text();

      const blocks = html.split(/class="[^"]*search-itm\s/);
      for (const block of blocks.slice(1)) {
        const schedaMatches = [
          ...block.matchAll(
            /href=["'](https:\/\/www\.paginegialle\.it\/[^"'\s<>?#]+)["']/gi
          ),
        ].map((m) => m[1]);

        for (const sUrl of schedaMatches) {
          if (
            !sUrl.includes("/ricerca/") &&
            !sUrl.includes("/profilo/") &&
            !sUrl.includes("/magazine") &&
            !sUrl.includes("/servizi") &&
            !sUrl.endsWith(".html") &&
            !pgDetailUrls.includes(sUrl)
          ) {
            pgDetailUrls.push(sUrl);
            break;
          }
        }
      }
    } catch {
      continue;
    }
  }

  const batchSize = 6;
  for (let i = 0; i < pgDetailUrls.length && candidates.length < limit; i += batchSize) {
    const slice = pgDetailUrls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      slice.map(async (schedaUrl): Promise<CandidateBusiness | null> => {
        try {
          const res = await fetch(schedaUrl, {
            headers,
            signal: AbortSignal.timeout(6500),
          });
          if (!res.ok) return null;
          const html = await res.text();

          let ldName = "";
          let ldEmail = "";
          let ldPhone = "";
          let ldVat = "";
          let ldCity = "";
          let ldDesc = "";
          let ldLogo = "";
          let ldHero = "";

          const jsonLdMatches = [
            ...html.matchAll(
              /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
            ),
          ];
          for (const m of jsonLdMatches) {
            try {
              const parsed = JSON.parse(m[1]);
              if (
                parsed &&
                (parsed["@type"] === "LocalBusiness" ||
                  parsed["@type"] === "Organization" ||
                  parsed.name)
              ) {
                ldName = parsed.legalName || parsed.name || ldName;
                ldVat = parsed.vatID || ldVat;
                ldDesc = parsed.description ? stripTags(parsed.description) : ldDesc;
                ldLogo = typeof parsed.logo === "string" ? parsed.logo : ldLogo;
                if (Array.isArray(parsed.image) && parsed.image.length > 0) {
                  ldHero = parsed.image[0];
                } else if (typeof parsed.image === "string") {
                  ldHero = parsed.image;
                }
                if (parsed.address?.addressLocality) {
                  ldCity = parsed.address.addressLocality;
                }
                if (parsed.telephone) {
                  ldPhone = parsed.telephone;
                }
                if (Array.isArray(parsed.contactPoint)) {
                  for (const cp of parsed.contactPoint) {
                    if (cp.email && !ldEmail) ldEmail = cp.email;
                    if (cp.telephone && !ldPhone) ldPhone = cp.telephone;
                  }
                }
              }
            } catch {
              continue;
            }
          }

          const allLinks = [
            ...html.matchAll(/<a[^>]+href=["'](https?:\/\/[^"'\s<>]+)["']/gi),
          ].map((m) => m[1]);

          // Se c'è un'email aziendale con dominio proprietario nel JSON-LD, usiamola come bussola primaria per evitare link a banner/partner (es. riello.it)
          let proprietaryEmailDomain = "";
          if (ldEmail && ldEmail.includes("@")) {
            const candidateDom = ldEmail.split("@")[1]?.toLowerCase().trim();
            if (
              candidateDom &&
              !FREE_MAIL_DOMAINS.has(candidateDom) &&
              !/pec\.|legalmail\.|arubapec\.|postecert\.|paginegialle\./i.test(candidateDom)
            ) {
              proprietaryEmailDomain = candidateDom;
            }
          }

          let externalSiteUrl = "";
          if (proprietaryEmailDomain) {
            const matchingLink = allLinks.find((l) => {
              try {
                return new URL(l).hostname.toLowerCase().includes(proprietaryEmailDomain);
              } catch {
                return false;
              }
            });
            externalSiteUrl = matchingLink
              ? new URL(matchingLink).origin
              : `https://www.${proprietaryEmailDomain}`;
          }

          if (!externalSiteUrl) {
            const nameTokens = (ldName || "")
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, " ")
              .split(/\s+/)
              .filter(
                (t) =>
                  t.length >= 4 &&
                  ![
                    "srl",
                    "srls",
                    "spa",
                    "snc",
                    "sas",
                    "ditta",
                    "studio",
                    "impresa",
                    "gruppo",
                    "italia",
                    "servizi",
                    "sistemi",
                    "tecnologie",
                    "impianti",
                    "serramenti",
                    "infissi",
                    "costruzioni",
                    "edilizia",
                    "carpenteria",
                    "meccanica",
                  ].includes(t)
              );

            for (const link of allLinks) {
              try {
                const parsedLink = new URL(link);
                const host = parsedLink.hostname.toLowerCase().replace(/^www\./, "");
                if (EXCLUDED_DOMAINS.some((ex) => host.includes(ex))) continue;
                if (
                  nameTokens.length > 0 &&
                  !nameTokens.some((tok) => host.includes(tok))
                ) {
                  continue;
                }
                externalSiteUrl = parsedLink.origin;
                break;
              } catch {
                continue;
              }
            }
          }

          // DIRETTIVA 1: Scarta categoricamente qualsiasi candidato privo di dominio web proprietario esterno
          if (!externalSiteUrl) return null;

          const hostKey = new URL(externalSiteUrl).hostname.toLowerCase();
          if (
            hostKey.includes("paginegialle.it") ||
            EXCLUDED_DOMAINS.some((ex) => hostKey.includes(ex))
          ) {
            return null;
          }

          if (seenHosts.has(hostKey)) return null;
          seenHosts.add(hostKey);

          return {
            targetUrl: externalSiteUrl,
            fallbackName: ldName || undefined,
            fallbackEmail: ldEmail || undefined,
            fallbackPhone: ldPhone || undefined,
            fallbackVat: ldVat || undefined,
            fallbackCity: ldCity || undefined,
            fallbackDescription: ldDesc || undefined,
            fallbackLogoUrl: ldLogo || undefined,
            fallbackHeroUrl: ldHero || undefined,
          };
        } catch {
          return null;
        }
      })
    );

    for (const item of batchResults) {
      if (item && candidates.length < limit) {
        candidates.push(item);
      }
    }
  }

  if (candidates.length < limit) {
    try {
      const searchQuery = `${trimmed} srl italia contatti`;
      const qUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(qUrl, {
        headers,
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const html = await res.text();
        const uddgMatches = [...html.matchAll(/uddg=([^"&\s<>]+)/gi)];
        for (const m of uddgMatches) {
          try {
            const decoded = decodeURIComponent(m[1]);
            const parsed = new URL(decoded);
            const host = parsed.hostname.toLowerCase();
            if (EXCLUDED_DOMAINS.some((ex) => host.includes(ex))) continue;
            if (seenHosts.has(host)) continue;
            seenHosts.add(host);
            candidates.push({ targetUrl: parsed.origin });
            if (candidates.length >= limit) break;
          } catch {
            continue;
          }
        }
      }
    } catch {
      // ignora
    }
  }

  return candidates;
}

export async function searchItalianBusinessUrls(
  keyword: string,
  limit = 15
): Promise<string[]> {
  const list = await discoverItalianBusinesses(keyword, limit);
  return list.map((c) => c.targetUrl);
}

export type BusinessNiche =
  | "meccanica_cnc"
  | "oleodinamica_fluidi"
  | "plastica_gomma_chimica"
  | "automazione_elettrico"
  | "logistica_imballaggi"
  | "ambiente_energia_b2b"
  | "infissi_serramenti"
  | "tende_outdoor"
  | "fotovoltaico_clima"
  | "sicurezza_casa"
  | "traslochi_edilizia"
  | "odontoiatria"
  | "poliambulatorio"
  | "generic_b2b"
  | "generic_local";

const MEDICAL_SIGNALS = [
  "dentist",
  "odontoiatr",
  "implantolog",
  "ortodonzi",
  "clinica dentale",
  "studio dentistico",
  "poliambulatorio",
  "studio medico",
  "chirurgia estetica",
  "fisioterap",
  "ortopedi",
  "oculist",
  "dermatolog",
  "medico chirurgo",
  "igiene dentale",
];

const STRONG_B2B_INDUSTRIAL_SIGNALS = [
  "b2b",
  "industri",
  "manifattur",
  "macchinari",
  "taglio laser",
  "lamiera",
  "piegatura",
  "calandratur",
  "tranciatura",
  "punzonatur",
  "saldatur",
  "robotizzat",
  "oleodinamic",
  "pneumatic",
  "centraline",
  "cilindri",
  "valvol",
  "compressori",
  "stampagg",
  "portastamp",
  "costruzione stampi",
  "stampi per",
  "materie plastiche",
  "termoformatur",
  "estrusione",
  "polimer",
  "polietilen",
  "poliuretan",
  "guarnizioni",
  "galvanic",
  "anodizz",
  "zincatur",
  "cromatur",
  "nichelatur",
  "verniciatura industriale",
  "trattamenti superficiali",
  "macchine utensili",
  "lavorazioni meccaniche",
  "torneria",
  "fresatura",
  "rettifica",
  "elettroerosione",
  "cnc",
  "conto terzi",
  "terzist",
  "carpenteri",
  "meccanic",
  "siderurg",
  "metallurg",
  "ferro battuto",
  "acciaio inox",
  "automazion",
  "robotica",
  "quadri elettrici",
  "quadristica",
  "bordomacchina",
  "plc",
  "scada",
  "nastri trasportatori",
  "rulli",
  "movimentazione",
  "scaffalatur",
  "carrelli elevatori",
  "facchinaggio",
  "autotrasporti",
  "trasporti",
  "spedizioni",
  "logistic",
  "imballagg",
  "packaging",
  "film estensibil",
  "films adesiv",
  "etichette industriali",
  "bonifiche ambientali",
  "smaltimento rifiuti",
  "depurazione",
  "aspirazione industriale",
  "filtrazione industriale",
  "prefabbricat",
  "capannoni",
  "coperture industriali",
  "asfalti",
  "lubrificanti",
  "affilatura",
  "rottami",
  "lavanderie industriali",
  "cuscinetti",
  "antincendio",
  "ingross",
  "distribut",
  "forniture industriali",
  "forniture b2b",
  "software",
  "gestionale",
  "erp",
  "consulenza aziendale",
  "stabilimento",
  "manutenzioni industriali",
  "impianti industriali",
  "impianti tecnologici",
  "impianti di produzione",
  "impianti a vapore",
  "media tensione",
  "cabine mt",
  "fotovoltaico industriale",
  "fotovoltaico aziendale",
  "ufficio tecnico",
  "commesse",
  "iso 9001",
];

const RESIDENTIAL_LOCAL_SIGNALS = [
  "infissi",
  "serramenti",
  "finestre",
  "porte interne",
  "porte blindate",
  "zanzariere",
  "tapparelle",
  "persiane",
  "tende da sole",
  "pergole",
  "bioclimatiche",
  "traslochi",
  "sgomberi",
  "fabbro",
  "apertura porte",
  "caldaie",
  "scaldabagni",
  "climatizzatori",
  "condizionatori",
  "arredamento",
  "arredo casa",
  "ristrutturazione bagno",
  "ristrutturazioni chiavi in mano",
  "antifurto casa",
  "detrazione fiscale",
  "ecobonus casa",
];

export function detectArchetype(keyword: string, html: string): LeadArchetype {
  const kwLower = (keyword || "").toLowerCase();
  const cleanSnippet = stripTags((html || "").slice(0, 14000)).toLowerCase();
  const combined = `${kwLower} ${cleanSnippet}`;

  let medicalScore = 0;
  for (const sig of MEDICAL_SIGNALS) {
    if (kwLower.includes(sig)) medicalScore += 3;
    else if (cleanSnippet.includes(sig)) medicalScore += 1;
  }

  let b2bScore = 0;
  for (const sig of STRONG_B2B_INDUSTRIAL_SIGNALS) {
    if (kwLower.includes(sig)) b2bScore += 4;
    else if (cleanSnippet.includes(sig)) b2bScore += 2;
  }

  let localScore = 0;
  for (const sig of RESIDENTIAL_LOCAL_SIGNALS) {
    if (kwLower.includes(sig)) localScore += 4;
    else if (cleanSnippet.includes(sig)) localScore += 3;
  }

  if (medicalScore >= 2 && medicalScore >= b2bScore) {
    return assertOfficialArchetype("medical-clinic");
  }

  if (b2bScore >= 2 && b2bScore > localScore) {
    return assertOfficialArchetype("b2b-authority");
  }

  // Se compaiono chiaramente indicatori residenziali (es. infissi, caldaie, tende, traslochi)
  if (localScore > 0 && b2bScore < 4) {
    return assertOfficialArchetype("local-leadgen");
  }

  // Segnale generico "impianti": B2B solo con contesto industriale/terziario forte
  if (
    combined.includes("impiant") &&
    (combined.includes("capannon") ||
      combined.includes("aziend") ||
      combined.includes("stabiliment") ||
      combined.includes("fotovoltaico industriale") ||
      combined.includes("elettrici industriali"))
  ) {
    return assertOfficialArchetype("b2b-authority");
  }

  return assertOfficialArchetype("local-leadgen");
}

export function detectBusinessNiche(
  keyword: string,
  corpus: string,
  archetype: LeadArchetype
): BusinessNiche {
  const kwLower = (keyword || "").toLowerCase();
  const corpusLower = (corpus || "").toLowerCase();

  const scoreNiches = (
    table: Array<{ niche: BusinessNiche; terms: string[] }>,
    fallback: BusinessNiche
  ): BusinessNiche => {
    let bestNiche: BusinessNiche = fallback;
    let bestScore = 0;
    for (const entry of table) {
      let score = 0;
      for (const t of entry.terms) {
        if (kwLower.includes(t)) score += 6;
        else if (corpusLower.includes(t)) score += 1;
      }
      if (score > bestScore) {
        bestScore = score;
        bestNiche = entry.niche;
      }
    }
    return bestNiche;
  };

  if (archetype === "medical-clinic") {
    return scoreNiches(
      [
        {
          niche: "odontoiatria",
          terms: ["dentist", "odontoiatr", "implantolog", "ortodonzi"],
        },
      ],
      "poliambulatorio"
    );
  }

  if (archetype === "b2b-authority") {
    return scoreNiches(
      [
        {
          niche: "oleodinamica_fluidi",
          terms: [
            "oleodinamic",
            "pneumatic",
            "cilindr",
            "centralin",
            "valvol",
            "compressori",
            "guarnizioni",
            "cuscinetti",
          ],
        },
        {
          niche: "plastica_gomma_chimica",
          terms: [
            "stampagg",
            "materie plastiche",
            "polimer",
            "gomma",
            "galvanic",
            "anodizz",
            "verniciatur",
            "films adesiv",
            "lubrificanti",
          ],
        },
        {
          niche: "meccanica_cnc",
          terms: [
            "taglio laser",
            "lamiera",
            "carpenteri",
            "torneria",
            "fresatura",
            "cnc",
            "stampi",
            "portastamp",
            "affilatura",
            "saldatur",
            "meccanic",
            "acciai",
            "ferro battuto",
          ],
        },
        {
          niche: "automazione_elettrico",
          terms: [
            "automazion",
            "robot",
            "quadri elettrici",
            "macchinari",
            "macchine industriali",
            "elettrici",
            "software",
            "erp",
          ],
        },
        {
          niche: "logistica_imballaggi",
          terms: [
            "scaffalatur",
            "magazzin",
            "stoccagg",
            "trasport",
            "logistic",
            "nastri trasportatori",
            "rulli",
            "imballagg",
            "packaging",
            "facchinaggio",
          ],
        },
        {
          niche: "ambiente_energia_b2b",
          terms: [
            "bonific",
            "depurazion",
            "fotovoltaic",
            "energi",
            "coperture",
            "prefabbricat",
            "asfalti",
            "antincendio",
            "lavanderie industriali",
            "rottami",
          ],
        },
      ],
      "generic_b2b"
    );
  }

  return scoreNiches(
    [
      {
        niche: "infissi_serramenti",
        terms: ["infissi", "serramenti", "finestre", "persiane", "porte"],
      },
      {
        niche: "tende_outdoor",
        terms: ["tende da sole", "pergol", "bioclimatic"],
      },
      {
        niche: "fotovoltaico_clima",
        terms: ["fotovoltaico", "solare", "climatizz", "caldai", "termoidraulic"],
      },
      {
        niche: "sicurezza_casa",
        terms: ["antifurto", "sicurezza", "serratur", "fabbro"],
      },
      {
        niche: "traslochi_edilizia",
        terms: ["trasloch", "sgomber", "ristruttur", "ediliz"],
      },
    ],
    "generic_local"
  );
}

const BOILERPLATE_TITLES_REGEX =
  /^(?:home|homepage|chi siamo|la nostra storia|i nostri lavori|lavori|lavora con noi|servizi|prodotti|contatti|contattaci|preventivo|richiedi preventivo|referenze|news|blog|eventi|privacy|privacy policy|cookie policy|benvenuti|sito ufficiale|welcome|index|404|error|menu)(?:\s*[-|•:\u2013\u2014].*)?$/i;

function isBoilerplateTitle(str: string): boolean {
  const s = (str || "").trim();
  if (!s || s.length < 3) return true;
  if (BOILERPLATE_TITLES_REGEX.test(s)) return true;
  if (/^(?:https?:\/\/|www\.)/i.test(s)) return true;
  if (/\b(?:simei|fiera|edition|cookie|privacy policy)\b/i.test(s)) return true;
  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(s)) return true;
  return false;
}

function isCleanItalianHeadline(str: string): boolean {
  const s = (str || "").trim();
  if (s.length < 14 || s.length > 92) return false;
  if (isBoilerplateTitle(s)) return false;
  if (/^(?:la nostra storia|i nostri lavori|scopri chi siamo|about us|our company|home\s|homepage\s|contatti\s|chi siamo\s|lavora con noi)/i.test(s)) {
    return false;
  }
  // Evita titoli interamente inglesi o slogan generici non localizzati
  const englishHits = (
    s.match(
      /\b(?:the|and|for|with|solutions|industry|perfection|tradition|functional|process|company|welcome|quality|services|products|home|engineering|productivity|lifelong)\b/gi
    ) || []
  ).length;
  const italianHits = (
    s.match(
      /\b(?:per|con|di|da|su|in|e|impianti|produzione|lavorazioni|sistemi|azienda|aziende|servizi|soluzioni|sicurezza|qualita|qualità|preventivo|progettazione|fabbrica|italia)\b/gi
    ) || []
  ).length;
  if (englishHits >= 2 && italianHits === 0) return false;
  if (s === s.toUpperCase() && s.split(/\s+/).length <= 4) return false;
  return true;
}

export function extractCleanCompanyName(opts: {
  slug: string;
  targetUrl?: string;
  fallbackName?: string;
  ogSiteName?: string;
  pageTitle?: string;
  html?: string;
}): string {
  const { slug, fallbackName, ogSiteName, pageTitle, html } = opts;

  const cleanCandidate = (raw: string): string =>
    decodeHtmlEntities(raw || "")
      .replace(/[—–]/g, "-")
      .replace(/\b(?:homepage di|benvenuti in|benvenuti su|sito ufficiale di|sito ufficiale)\b/gi, "")
      .replace(/^https?:\/\/(?:www\.)?/i, "")
      .replace(/^www\./i, "")
      .replace(/\s+/g, " ")
      .trim();

  const isAcceptableName = (name: string): boolean => {
    if (!name || name.length < 3 || name.length > 44) return false;
    if (isBoilerplateTitle(name)) return false;
    if (/\.(?:it|com|eu|net|org|srl\.it)$/i.test(name)) return false;
    // Evita descrizioni generiche tipo "Rulli per nastri trasportatori"
    if (/^(?:rulli per|taglio laser|stampaggio|impianti di|produzione di)\b/i.test(name)) {
      return false;
    }
    return true;
  };

  // 1. Prova da Copyright footer o Ragione Sociale S.r.l. / S.p.A. nel DOM
  if (html) {
    const cleanText = stripTags(html);
    const legalMatch = cleanText.match(
      /(?:©|\(c\)|copyright(?:\s+\d{4})?)\s*([A-ZÀ-ÖØ-Þ][A-Za-zÀ-ÿ0-9&.'\-\s]{2,36}?(?:\s+(?:S\.?r\.?l\.?|S\.?p\.?A\.?|S\.?n\.?c\.?|S\.?a\.?s\.?))?)(?:\s*(?:[-|·,]|\bp\.?\s*iva\b|\btutti i diritti\b|\ball rights\b))/i
    );
    if (legalMatch?.[1]) {
      const candLegal = cleanCandidate(legalMatch[1]);
      if (isAcceptableName(candLegal)) return candLegal;
    }
  }

  // 2. FallbackName esplicito se pulito
  if (fallbackName) {
    const cleaned = cleanCandidate(fallbackName);
    if (isAcceptableName(cleaned)) return cleaned;
  }

  // 3. og:site_name
  if (ogSiteName) {
    const cleaned = cleanCandidate(ogSiteName);
    if (isAcceptableName(cleaned)) return cleaned;
  }

  // 4. Segmenti del <title>
  if (pageTitle) {
    const segments = decodeHtmlEntities(pageTitle)
      .split(/[-|•:\u2013\u2014]/)
      .map((s) => cleanCandidate(s))
      .filter((s) => isAcceptableName(s));
    const withLegal = segments.find((s) => /\b(?:s\.?r\.?l\.?|s\.?p\.?a\.?|snc)\b/i.test(s));
    if (withLegal) return withLegal;
    const brandLike = segments.find((s) => s.split(/\s+/).length <= 4);
    if (brandLike) return brandLike;
    if (segments[0]) return segments[0];
  }

  // 5. Ultimo fallback dallo slug formattato con cura
  return slug
    .split("-")
    .map((w) =>
      w === "srl"
        ? "S.r.l."
        : w === "spa"
        ? "S.p.A."
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
}

export function extractValidItalianPhones(
  combinedHtml: string,
  options?: { extraPhones?: (string | null | undefined)[]; vatNumber?: string | null }
): string[] {
  const cleanVat = String(options?.vatNumber || "").replace(/\D/g, "");
  const seenDigits = new Set<string>();
  const validPhones: string[] = [];

  const normalizeAndPush = (raw: string, fromExplicitTel: boolean) => {
    let trimmed = decodeHtmlEntities(String(raw || ""))
      .replace(/^tel:/i, "")
      .trim();
    if (!trimmed) return;
    let digits = trimmed.replace(/\D/g, "");
    if (digits.startsWith("0039") && digits.length >= 12) {
      digits = digits.slice(4);
      trimmed = digits;
    } else if (digits.startsWith("39") && digits.length >= 11 && (digits[2] === "0" || digits[2] === "3" || digits[2] === "8")) {
      digits = digits.slice(2);
    }

    if (!digits) return;
    if (cleanVat && digits === cleanVat) return;
    if (/0{5,}/.test(digits)) return;
    if (new Set(digits.split("")).size < 4) return;

    const isMobile = /^3\d{9}$/.test(digits);
    const isTollFree = /^8(?:00|03|40|48)\d{6,7}$/.test(digits);
    const isMajorCity8 = /^(?:02|06)\d{6,8}$/.test(digits);
    const isStandardLandline = /^0\d{8,10}$/.test(digits);

    if (!isMobile && !isTollFree && !(fromExplicitTel && isMajorCity8) && !isStandardLandline) {
      return;
    }

    if (seenDigits.has(digits)) return;
    seenDigits.add(digits);

    // Formatta in modo pulito e leggibile se non ha separatori chiari
    if (/^[+0-9\s().-]+$/.test(trimmed) && trimmed.replace(/\D/g, "").endsWith(digits) && trimmed.length <= 20) {
      validPhones.push(trimmed.replace(/\s+/g, " "));
    } else if (digits.startsWith("3")) {
      validPhones.push(`${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`);
    } else if (digits.startsWith("02") || digits.startsWith("06")) {
      validPhones.push(`${digits.slice(0, 2)} ${digits.slice(2)}`);
    } else {
      validPhones.push(`${digits.slice(0, 3)} ${digits.slice(3)}`);
    }
  };

  // 1. Priorita assoluta ai link tel: e ai telefoni espliciti (JSON-LD / fallback)
  for (const m of combinedHtml.matchAll(/href=["']tel:([^"']+)["']/gi)) {
    normalizeAndPush(m[1], true);
  }
  for (const extra of options?.extraPhones || []) {
    if (extra) normalizeAndPush(extra, true);
  }

  // 2. Testo visibile (escludendo script, style, svg, attributi HTML)
  const visibleText = stripTags(
    combinedHtml
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
  );

  for (const m of visibleText.matchAll(
    /(?:tel\.?|telefono|cell\.?|mobile|uff\.?|chiama|contatt[ai]?)[\s:.-]{0,12}((?:\+39\s?|0039\s?)?(?:0\d{1,3}[\s.-]?\d{5,8}|3\d{2}[\s.-]?\d{6,7}|8(?:00|03|40|48)[\s.-]?\d{6,7}))/gi
  )) {
    normalizeAndPush(m[1], true);
  }

  for (const m of visibleText.matchAll(
    /\b((?:\+39\s?)?(?:0\d{1,3}[\s.-]?\d{5,8}|3\d{2}[\s.-]?\d{6,7}|8(?:00|03|40|48)[\s.-]?\d{6,7}))\b/g
  )) {
    normalizeAndPush(m[1], false);
  }

  return validPhones.slice(0, 3);
}

export function extractExtendedImageUrls(
  baseUrl: string,
  htmlPages: string[]
): { candidateLogoUrls: string[]; candidateHeroUrls: string[] } {
  const headerLogoUrls: string[] = [];
  const secondaryLogoUrls: string[] = [];
  const iconFallbackUrls: string[] = [];
  const preferredHeroUrls: string[] = [];
  const secondaryHeroUrls: string[] = [];
  const combinedHtml = htmlPages.filter(Boolean).join("\n");

  const LOGO_REJECT_RX =
    /data:|blank\.gif|spacer|1x1|shinystat|facebook\.com\/tr|doubleclick|cookie|iubenda|gdpr|visa|mastercard|paypal|flag-|bandiera|\/lang\/|social-|whatsapp-icon|close|arrow|chevron|spinner|loader/i;
  const HERO_REJECT_RX =
    /data:|\.svg(\?|$|#)|favicon|logo|icon-|_icon|sprite|pixel|blank|spacer|badge|bollino|sticker|flag-|bandiera|cookie|iubenda|gdpr|1x1|avatar|woocommerce-placeholder|\/lang\/|certific|iso-|soa-|payment|visa|paypal|social|client-|partner|shinystat\.com|facebook\.com\/tr|connect\.facebook\.net|doubleclick\.net|google-analytics\.com|googleadservices\.com|linkedin\.com\/px|ads\.twitter\.com/i;

  const pushUnique = (list: string[], url: string, front = false) => {
    if (list.includes(url)) return;
    if (front) list.unshift(url);
    else list.push(url);
  };

  const addLogo = (raw: string | null | undefined, tier: "header" | "body" | "icon") => {
    const resolved = resolveUrl(baseUrl, raw || undefined);
    if (!resolved || LOGO_REJECT_RX.test(resolved) || /\.svg(\?|$|#)/i.test(resolved)) return;
    // I loghi non "-bianco"/"-white" vengono provati prima per leggibilita naturale su header chiaro
    const isWhiteVariant = /(?:bianco|white|negativo|inverse)[._-]/i.test(resolved);
    if (tier === "header") pushUnique(headerLogoUrls, resolved, !isWhiteVariant);
    else if (tier === "body") pushUnique(secondaryLogoUrls, resolved, !isWhiteVariant);
    else pushUnique(iconFallbackUrls, resolved, false);
  };

  const addHero = (raw?: string | null, prioritize = false) => {
    const resolved = resolveUrl(baseUrl, raw || undefined);
    if (!resolved || HERO_REJECT_RX.test(resolved)) return;
    const isPhotoExt = /\.(?:jpe?g|webp)(?:\?|$|#)/i.test(resolved);
    if (prioritize && isPhotoExt) {
      pushUnique(preferredHeroUrls, resolved, true);
    } else if (prioritize || isPhotoExt) {
      pushUnique(preferredHeroUrls, resolved, false);
    } else {
      pushUnique(secondaryHeroUrls, resolved, false);
    }
  };

  // Estrae blocchi <header> e <nav> per prioritizzare i loghi aziendali reali
  const headerBlocks = [
    ...combinedHtml.matchAll(/<(?:header|nav)\b[^>]*>[\s\S]*?<\/(?:header|nav)>/gi),
  ]
    .map((m) => m[0])
    .join("\n");

  for (const m of headerBlocks.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const tagLower = tag.toLowerCase();
    const srcCandidate =
      tag.match(/\b(?:data-lazy-src|data-src|data-original|src)=["']([^"']+)["']/i)?.[1] ||
      tag.match(/\bsrcset=["']([^"'\s,]+)/i)?.[1];
    if (!srcCandidate) continue;
    if (/logo|brand|header|site-title|custom-logo|default_logo|navbar-brand/i.test(tagLower + " " + srcCandidate)) {
      addLogo(srcCandidate, "header");
    }
  }

  // Meta og:image & twitter:image
  for (const m of combinedHtml.matchAll(
    /<meta[^>]+(?:property=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']|content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["'])/gi
  )) {
    addHero(m[1] || m[2], true);
  }

  // <img ...> tags (src, data-src, data-lazy-src, data-original, srcset)
  for (const m of combinedHtml.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const tagLower = tag.toLowerCase();
    const srcCandidate =
      tag.match(/\b(?:data-lazy-src|data-src|data-original|src)=["']([^"']+)["']/i)?.[1] ||
      tag.match(/\bsrcset=["']([^"'\s,]+)/i)?.[1];
    if (!srcCandidate) continue;

    if (
      tagLower.includes("logo") ||
      tagLower.includes("brand") ||
      srcCandidate.toLowerCase().includes("logo")
    ) {
      addLogo(srcCandidate, "body");
    } else {
      const isHeroNamed = /hero|slider|banner|impianto|stabilimento|prodotto|magazzino|officina|cover|sede|azienda/i.test(
        tagLower + " " + srcCandidate
      );
      addHero(srcCandidate, isHeroNamed);
    }
  }

  // <source srcset="...">
  for (const m of combinedHtml.matchAll(/<source[^>]+srcset=["']([^"'\s,]+)/gi)) {
    addHero(m[1], false);
  }

  // CSS background-image: url(...)
  for (const m of combinedHtml.matchAll(/background(?:-image)?\s*:[^;}]*url\(["']?([^"')]+)["']?\)/gi)) {
    addHero(m[1], false);
  }

  // Apple touch icon / icon come estremo fallback logo raster (dopo i loghi reali!)
  for (const m of combinedHtml.matchAll(
    /<link[^>]+rel=["'](?:apple-touch-icon[^"']*|icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/gi
  )) {
    addLogo(m[1], "icon");
  }

  const candidateLogoUrls = Array.from(
    new Set([...headerLogoUrls, ...secondaryLogoUrls, ...iconFallbackUrls])
  );
  const candidateHeroUrls = Array.from(
    new Set([...preferredHeroUrls, ...secondaryHeroUrls])
  );

  return { candidateLogoUrls, candidateHeroUrls };
}

export async function captureFallbackHeroScreenshot(
  targetUrl: string,
  destPath: string
): Promise<boolean> {
  const browserBin = getLocalBrowserBin();
  if (!browserBin) return false;

  const userDataDir = `/tmp/techpyre-hero-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
  let proc: ReturnType<typeof spawn> | null = null;
  let ws: WebSocket | null = null;

  try {
    proc = spawn(/*turbopackIgnore: true*/ browserBin, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--window-size=1280,800",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      "about:blank",
    ]);

    const wsUrl = await new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("CDP timeout")), 9000);
      proc?.stderr?.on("data", (chunk: Buffer) => {
        const m = chunk.toString().match(/DevTools listening on (ws:\/\/[^\s]+)/);
        if (m) {
          clearTimeout(timer);
          resolve(m[1]);
        }
      });
    });

    const pagesRes = await fetch(wsUrl.replace("ws://", "http://").split("/devtools")[0] + "/json/list");
    const pages = (await pagesRes.json()) as Array<{ webSocketDebuggerUrl?: string }>;
    const pageWsUrl = pages[0]?.webSocketDebuggerUrl;
    if (!pageWsUrl) return false;

    ws = new WebSocket(pageWsUrl);
    await new Promise<void>((res, rej) => {
      ws!.onopen = () => res();
      ws!.onerror = (e) => rej(e);
    });

    let msgId = 1;
    const sendCdp = (method: string, params: Record<string, unknown> = {}) =>
      new Promise<Record<string, unknown>>((resolve) => {
        const id = msgId++;
        const onMsg = (ev: MessageEvent) => {
          try {
            const parsed = JSON.parse(String(ev.data));
            if (parsed.id === id) {
              ws?.removeEventListener("message", onMsg);
              resolve(parsed.result || {});
            }
          } catch {}
        };
        ws?.addEventListener("message", onMsg);
        ws?.send(JSON.stringify({ id, method, params }));
      });

    await sendCdp("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 760,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await sendCdp("Page.navigate", { url: targetUrl });
    await new Promise((r) => setTimeout(r, 3200));

    // Nasconde eventuali banner cookie intrusivi prima dello scatto
    await sendCdp("Runtime.evaluate", {
      expression: `(() => {
        document.querySelectorAll('[id*="cookie" i],[class*="cookie" i],[id*="iubenda" i],[class*="iubenda" i],[class*="gdpr" i]').forEach(el => {
          if (el.offsetHeight < 500) el.style.display = 'none';
        });
      })()`,
    });
    await new Promise((r) => setTimeout(r, 250));

    const shot = await sendCdp("Page.captureScreenshot", {
      format: "jpeg",
      quality: 86,
      clip: { x: 0, y: 0, width: 1280, height: 760, scale: 1 },
    });

    const base64Data = typeof shot?.data === "string" ? shot.data : "";
    if (!base64Data) return false;
    const buf = Buffer.from(base64Data, "base64");
    if (buf.length < 12000) return false;

    fs.mkdirSync(/*turbopackIgnore: true*/ path.dirname(destPath), { recursive: true });
    fs.writeFileSync(/*turbopackIgnore: true*/ destPath, buf);
    const shotAnalysis = analyzeRasterHeroFile(destPath);
    if (shotAnalysis && shotAnalysis.uniformRatio > 0.92) {
      try {
        fs.unlinkSync(/*turbopackIgnore: true*/ destPath);
      } catch {}
      return false;
    }
    return true;
  } catch {
    return false;
  } finally {
    try {
      ws?.close();
    } catch {}
    try {
      proc?.kill("SIGKILL");
    } catch {}
    try {
      fs.rmSync(/*turbopackIgnore: true*/ userDataDir, { recursive: true, force: true });
    } catch {}
  }
}

function extractCityFromQueryOrHtml(
  keyword: string,
  text: string,
  fallbackCity?: string
): string {
  if (fallbackCity && fallbackCity.trim().length > 1) {
    return fallbackCity.trim();
  }
  const kwLower = keyword.toLowerCase();
  for (const c of ITALIAN_CITIES) {
    if (kwLower.includes(c.toLowerCase())) return c;
  }
  for (const c of ITALIAN_CITIES) {
    if (new RegExp(`\\b${c}\\b`, "i").test(text)) return c;
  }
  return "Italia";
}

export function buildQuizForKeyword(
  keyword: string,
  archetype: LeadArchetype,
  nicheOverride?: BusinessNiche
): LeadConfig["content"]["quiz"] {
  const niche = nicheOverride || detectBusinessNiche(keyword, keyword, archetype);

  if (archetype === "medical-clinic") {
    return {
      question1: {
        title: "Per quale esigenza clinica desideri richiedere una valutazione?",
        options:
          niche === "odontoiatria"
            ? [
                "Prima visita specialistica e piano di cura personalizzato",
                "Implantologia o riabilitazione estetica/funzionale",
                "Igiene dentale, prevenzione o controllo periodico",
              ]
            : [
                "Prima visita specialistica e inquadramento diagnostico",
                "Percorso terapeutico, riabilitazione o esami strumentali",
                "Controllo periodico o seconda opinione medica",
              ],
      },
      question2: {
        title: "Quale fascia oraria preferisci per l'appuntamento?",
        options: [
          "Mattina (09:00 - 13:00)",
          "Pomeriggio (14:00 - 19:00)",
          "Primo orario disponibile in settimana",
        ] as [string, string, string],
      },
      finalStepTitle:
        "Perfetto. Lascia un recapito per ricevere conferma di disponibilita dalla segreteria:",
    };
  }

  if (archetype === "b2b-authority") {
    const q1ByNiche: Record<string, { title: string; options: [string, string, string] }> = {
      meccanica_cnc: {
        title: "Quale lavorazione meccanica o fornitura su disegno vi occorre?",
        options: [
          "Taglio laser, piegatura lamiera o carpenteria metallica su disegno",
          "Lavorazioni CNC, stampi, attrezzature o serie ripetitive B2B",
          "Studio di fattibilita tecnica, prototipazione e quotazione lotto",
        ],
      },
      oleodinamica_fluidi: {
        title: "Quale sistema o componentistica fluidodinamica desiderate approfondire?",
        options: [
          "Centraline oleodinamiche, cilindri o gruppi valvole su specifica",
          "Tenute industriali, guarnizioni tecniche, compressori o ricambistica",
          "Revisione impianti esistenti e continuità di fornitura OEM",
        ],
      },
      plastica_gomma_chimica: {
        title: "Quale lavorazione industriale o fornitura tecnica vi interessa?",
        options: [
          "Stampaggio materie plastiche/gomma o realizzazione stampi su commessa",
          "Trattamenti galvanici, anodizzazione o rivestimenti protettivi certificati",
          "Fornitura lotti industriali, campionatura e capitolato tecnico",
        ],
      },
      automazione_elettrico: {
        title: "Quale ambito di automazione o impiantistica industriale valutate?",
        options: [
          "Quadri elettrici bordomacchina, revamping linee e integrazione PLC",
          "Progettazione isole robotizzate, macchinari o automazione di reparto",
          "Studio di fattibilita tecnica, conformita CE e tempi di consegna",
        ],
      },
      logistica_imballaggi: {
        title: "Quale esigenza logistica o di movimentazione desiderate ottimizzare?",
        options: [
          "Nastri trasportatori, rulli, scaffalature o impianti di movimentazione",
          "Imballaggi industriali, packaging su misura e forniture continuative",
          "Trasporti dedicati, logistica di stabilimento e contratto SLA",
        ],
      },
      ambiente_energia_b2b: {
        title: "Quale intervento tecnico per il vostro stabilimento state pianificando?",
        options: [
          "Bonifiche ambientali, depurazione acque o gestione rifiuti industriali",
          "Coperture industriali, impianti fotovoltaici aziendali o efficienza energetica",
          "Sopralluogo tecnico in stabilimento, perizia e capitolato chiavi in mano",
        ],
      },
      generic_b2b: {
        title: "Quale ambito operativo o di commessa desiderate approfondire?",
        options: [
          "Fornitura industriale, impianti o commessa su specifica",
          "Integrazione tecnica, automazione di reparto o accordo quadro",
          "Studio di fattibilita, capitolato e quotazione riservata",
        ],
      },
    };

    return {
      question1: q1ByNiche[niche] || q1ByNiche.generic_b2b,
      question2: {
        title: "Qual e l'orizzonte temporale previsto per il progetto?",
        options: [
          "Avvio operativo urgente (entro 30 giorni)",
          "Pianificazione nel trimestre in corso",
          "Valutazione tecnica e di budget preliminare",
        ] as [string, string, string],
      },
      finalStepTitle:
        "Specifiche registrate. Inserisci i riferimenti aziendali per il colloquio con l'Ufficio Tecnico:",
    };
  }

  if (niche === "infissi_serramenti") {
    return {
      question1: {
        title: "Quale tipologia di intervento desideri valutare?",
        options: [
          "Sostituzione infissi con isolamento termico/acustico",
          "Nuova installazione per ristrutturazione o cantiere",
          "Porte interne, blindati o sistemi oscuranti",
        ] as [string, string, string],
      },
      question2: {
        title: "Quanti serramenti prevede indicativamente il progetto?",
        options: [
          "Da 1 a 4 serramenti",
          "Da 5 a 8 serramenti (appartamento completo)",
          "Oltre 8 serramenti o villa/ufficio",
        ] as [string, string, string],
      },
      finalStepTitle:
        "Ottimo. Inserisci i tuoi recapiti per ricevere il prospetto economico e il sopralluogo:",
    };
  }

  if (niche === "tende_outdoor") {
    return {
      question1: {
        title: "Quale soluzione per esterni desideri installare?",
        options: [
          "Pergola bioclimatica o pergotenda su misura",
          "Tenda da sole per terrazzo o balcone",
          "Chiusura con vetrate panoramiche o zanzariere",
        ] as [string, string, string],
      },
      question2: {
        title: "Che superficie indicativa vuoi coprire?",
        options: [
          "Fino a 15 mq (balcone o piccolo terrazzo)",
          "Da 15 a 35 mq (terrazzo o giardino privato)",
          "Oltre 35 mq (ampio spazio esterno o attivita)",
        ] as [string, string, string],
      },
      finalStepTitle:
        "Perfetto. Lascia i tuoi dati per prenotare il rilievo misure e ricevere il preventivo:",
    };
  }

  if (niche === "fotovoltaico_clima") {
    return {
      question1: {
        title: "Quale impianto desideri installare o sostituire?",
        options: [
          "Impianto fotovoltaico con eventuale sistema di accumulo",
          "Climatizzatori, pompa di calore o caldaia ad alta efficienza",
          "Riqualificazione energetica completa dell'abitazione",
        ] as [string, string, string],
      },
      question2: {
        title: "Qual e il tuo obiettivo principale?",
        options: [
          "Abbattere subito i costi in bolletta",
          "Accesso agli incentivi e detrazioni fiscali attive",
          "Sostituzione urgente con sopralluogo tecnico rapido",
        ] as [string, string, string],
      },
      finalStepTitle:
        "Perfetto. Lascia i tuoi dati per ricevere la simulazione tecnica e il preventivo dedicato:",
    };
  }

  if (niche === "sicurezza_casa") {
    return {
      question1: {
        title: "Di quale intervento di sicurezza hai bisogno?",
        options: [
          "Installazione sistema antifurto o videosorveglianza",
          "Sostituzione serratura europea o porta blindata",
          "Assistenza tecnica urgente su porte e serrature",
        ] as [string, string, string],
      },
      question2: {
        title: "Dove va eseguito l'intervento?",
        options: [
          "Appartamento o abitazione indipendente",
          "Ufficio, negozio o studio professionale",
          "Condominio o autorimessa",
        ] as [string, string, string],
      },
      finalStepTitle:
        "Richiesta registrata. Inserisci i tuoi recapiti per un contatto rapido dal tecnico:",
    };
  }

  return {
    question1: {
      title: "Di quale servizio o soluzione hai bisogno?",
      options: [
        "Richiesta preventivo dettagliato su misura",
        "Consulenza tecnica e sopralluogo operativo",
        "Intervento rapido o assistenza prioritaria",
      ] as [string, string, string],
    },
    question2: {
      title: "Entro quando vorresti avviare il progetto?",
      options: [
        "Il prima possibile (Entro 2 settimane)",
        "Entro 1 - 2 mesi",
        "Sto valutando diverse soluzioni",
      ] as [string, string, string],
    },
    finalStepTitle:
      "Perfetto. Inserisci i tuoi dati per ricevere una proposta personalizzata senza impegno:",
  };
}

export function buildVerticalizedLeadContent(opts: {
  companyName: string;
  city: string;
  archetype: LeadArchetype;
  keyword: string;
  corpus: string;
  scrapedHeadline?: string;
  scrapedSubheadline?: string;
  logoLocalPath: string;
  heroImageLocalPath: string;
  decisionMakerFullName?: string | null;
}): LeadConfig["content"] {
  const {
    companyName,
    city,
    archetype,
    keyword,
    corpus,
    scrapedHeadline,
    scrapedSubheadline,
    logoLocalPath,
    heroImageLocalPath,
    decisionMakerFullName,
  } = opts;

  const isB2B = archetype === "b2b-authority";
  const isMedical = archetype === "medical-clinic";
  const niche = detectBusinessNiche(keyword, corpus, archetype);

  const defaultContentByNiche: Record<
    BusinessNiche,
    {
      headline: string;
      subheadline: string;
      badgeTop: string;
      heroBullets: [string, string, string];
      valueProps: Array<{ title: string; description: string; metric?: string }>;
      clientReferenceWall?: string[];
      secondaryStats?: Array<{ value: string; label: string }>;
      reviewsSummary: string;
      mainStatValue: string;
      mainStatLabel: string;
      testimonials: Array<{ name: string; location: string; quote: string; roleOrContext?: string }>;
    }
  > = {
    meccanica_cnc: {
      headline: `${companyName}: Lavorazioni Meccaniche, Lamiera e Taglio Laser a ${city}`,
      subheadline: `Produzione conto terzi su disegno tecnico a ${city}: tolleranze certificate, consegna programmata dei lotti e confronto diretto con il nostro Ufficio Tecnico.`,
      badgeTop: `${companyName} · Produzione Industriale e Carpenteria (${city})`,
      heroBullets: [
        "Analisi disegni CAD/STEP e studio di fattibilita con tempi di consegna certi",
        "Controllo dimensionale su lotti piccoli, medi e serie continuative",
        "Tracciabilita dei materiali, certificati di collaudo e referente unico B2B",
      ],
      valueProps: [
        {
          title: "Ingegnerizzazione Disegni e Preventivazione Rapida",
          description: `Valutiamo tolleranze, spessori e trattamenti direttamente con il vostro ufficio tecnico a ${city}, riducendo i fermi macchina e gli scarti di assemblaggio.`,
          metric: "Risposta 24h",
        },
        {
          title: "Parco Macchine CNC e Controllo Qualita",
          description: `Ogni lotto prodotto da ${companyName} segue procedure di verifica dimensionale e conformita dei materiali per garantire ripetibilita costante.`,
          metric: "100% Verificato",
        },
        {
          title: "Consegne Programmate Kanban e Continuita",
          description: `Gestiamo commesse spot e accordi quadro annuali rispettando le finestre di consegna concordate con il vostro reparto logistica.`,
          metric: "Puntualita 99.4%",
        },
      ],
      clientReferenceWall: [
        "Lavorazioni su Disegno CAD/STEP",
        "Certificazioni Materiali 3.1",
        "Qualita Certificata ISO 9001",
        "Controllo Dimensionale Lotti",
        "Forniture OEM e Conto Terzi",
      ],
      secondaryStats: [
        { value: "99.4%", label: "Lotti consegnati entro la data pattuita con il cliente B2B" },
        { value: "< 0.4s", label: "Caricamento portale tecnico per richiesta offerte da mobile" },
        { value: "24h", label: "Verifica fattibilita tecnica con il nostro Ufficio Tecnico" },
      ],
      reviewsSummary: `Partner manifatturiero di riferimento per industrie a ${city}`,
      mainStatValue: "99.4%",
      mainStatLabel: "Lotti lavorati e consegnati nel pieno rispetto delle tolleranze",
      testimonials: [
        {
          name: "Direzione Produzione e Officina",
          location: `${city} · Fornitura Conto Terzi`,
          quote: `Affidiamo a ${companyName} i nostri particolari meccanici e lamiere piegate: precisione costante sui montaggi e consegne sempre allineate al piano produttivo.`,
          roleOrContext: "Lavorazioni CNC e Lamiera",
        },
        {
          name: "Responsabile Ufficio Acquisti",
          location: `${city} e provincia`,
          quote: `Interlocutore tecnico preparato: tempi rapidi su quotazioni multi-articolo, documenti completi e zero difformita in accettazione.`,
          roleOrContext: "Accordo quadro B2B",
        },
      ],
    },
    oleodinamica_fluidi: {
      headline: `${companyName}: Impianti Oleodinamici, Fluidodinamica e Componenti a ${city}`,
      subheadline: `Progettazione, assemblaggio e manutenzione di sistemi oleodinamici, tenute e componentistica industriale a ${city} con collaudo a banco certificato.`,
      badgeTop: `${companyName} · Divisione Oleodinamica e Fluidi (${city})`,
      heroBullets: [
        "Progettazione centraline, cilindri e circuiti fluidodinamici su specifica",
        "Magazzino ricambi, tenute e raccordi per ridurre al minimo i fermi impianto",
        "Collaudo in pressione certificato e assistenza tecnica diretta in stabilimento",
      ],
      valueProps: [
        {
          title: "Dimensionamento e Progettazione Fluidodinamica",
          description: `Definiamo portate, pressioni di esercizio e cicli di lavoro insieme ai vostri progettisti a ${city}, ottimizzando efficienza e sicurezza dell'impianto.`,
          metric: "Collaudo Certificato",
        },
        {
          title: "Ricambistica Tecnica e Tenute ad Alte Prestazioni",
          description: `Forniamo guarnizioni, valvole e componentistica selezionata per resistere a carichi gravosi, alte temperature e cicli continui.`,
          metric: "Zero Fermi Linea",
        },
        {
          title: "Service Rapido e Manutenzione Programmata",
          description: `Supporto tecnico tempestivo per revisioni, sostituzioni e adeguamenti normativi direttamente presso il vostro reparto produttivo.`,
          metric: "SLA Dedicato",
        },
      ],
      clientReferenceWall: [
        "Collaudo a Banco in Pressione",
        "Direttiva Macchine 2006/42/CE",
        "Qualita Certificata ISO 9001",
        "Ricambistica e Tenute OEM",
        "Assistenza Tecnica Impianti",
      ],
      secondaryStats: [
        { value: "99.4%", label: "Sistemi collaudati e conformi alle pressioni di progetto" },
        { value: "< 0.4s", label: "Accesso istantaneo alle richieste tecniche anche da reparto" },
        { value: "24h", label: "Presa in carico ricambi e preventivazione tecnica B2B" },
      ],
      reviewsSummary: `Fornitore tecnico per impianti e costruttori di macchine a ${city}`,
      mainStatValue: "99.4%",
      mainStatLabel: "Affidabilita certificata su centraline, tenute e ricambi industriali",
      testimonials: [
        {
          name: "Responsabile Manutenzione Stabilimento",
          location: `${city} · Impianti Industriali`,
          quote: `Con ${companyName} abbiamo ridotto drasticamente i fermi linea: competenza reale nella diagnosi e disponibilita rapida della componentistica critica.`,
          roleOrContext: "Service e fornitura oleodinamica",
        },
        {
          name: "Ufficio Tecnico Costruttore Macchine",
          location: `${city} e provincia`,
          quote: `Partner preciso dal dimensionamento al collaudo finale: documentazione chiara e forniture puntuali su ogni serie di macchine.`,
          roleOrContext: "Fornitura OEM",
        },
      ],
    },
    plastica_gomma_chimica: {
      headline: `${companyName}: Stampaggio Tecnico, Polimeri e Trattamenti Industriali a ${city}`,
      subheadline: `Soluzioni industriali per materie plastiche, gomma, rivestimenti e trattamenti superficiali a ${city} con controllo qualita di processo e tracciabilita lotti.`,
      badgeTop: `${companyName} · Polimeri e Processi Industriali (${city})`,
      heroBullets: [
        "Supporto su scelta mescole, resine e trattamenti prima della messa in serie",
        "Controllo costante dei parametri di processo e finitura superficiale",
        "Imballo industriale protetto e programmazione consegne per lotti B2B",
      ],
      valueProps: [
        {
          title: "Co-Design Stampi e Selezione Materiali",
          description: `Ottimizziamo spessori, ritiri dimensionali e resistenze chimico-meccaniche per evitare difetti in produzione e contenere il costo unitario.`,
          metric: "Zero Difetti",
        },
        {
          title: "Ripetibilita di Processo e Controllo Lotto",
          description: `${companyName} monitora ogni fase produttiva e superficiale a ${city} rilasciando documentazione di conformita su richiesta.`,
          metric: "100% Tracciabile",
        },
        {
          title: "Logistica Flessibile su Piccole e Grandi Serie",
          description: `Pianificazione scorte, trattamenti rapidi conto terzi e spedizioni sincronizzate con le vostre linee di montaggio.`,
          metric: "Consegne Certe",
        },
      ],
      clientReferenceWall: [
        "Qualita Certificata ISO 9001",
        "Tracciabilita Completa Lotti",
        "Conformita REACH / RoHS",
        "Campionature Tecniche Rapide",
        "Produzione B2B Conto Terzi",
      ],
      secondaryStats: [
        { value: "99.4%", label: "Lotti consegnati conformi alle specifiche dimensionali" },
        { value: "< 0.4s", label: "Caricamento scheda tecnica e preventivo B2B su mobile" },
        { value: "24h", label: "Valutazione preliminare disegni, mescole o trattamenti" },
      ],
      reviewsSummary: `Partner industriale per filiere produttive a ${city}`,
      mainStatValue: "99.4%",
      mainStatLabel: "Conformita qualitativa sui lotti industriali consegnati",
      testimonials: [
        {
          name: "Responsabile Qualita e Fornitori",
          location: `${city} · Filiera Manifatturiera`,
          quote: `La costanza tra la campionatura iniziale e le forniture in serie di ${companyName} ci ha permesso di azzerare i controlli in ingresso.`,
          roleOrContext: "Fornitura conto terzi",
        },
        {
          name: "Direzione Acquisti B2B",
          location: `${city} e provincia`,
          quote: `Preventivazione trasparente, imballaggi accurati e rispetto rigoroso dei lead time anche sui picchi stagionali.`,
          roleOrContext: "Contratto di fornitura",
        },
      ],
    },
    automazione_elettrico: {
      headline: `${companyName}: Automazione Industriale e Impianti Tecnologici a ${city}`,
      subheadline: `Progettazione, quadristica elettrica, integrazione macchinari e revamping linee produttive a ${city} con avviamento certificato in stabilimento.`,
      badgeTop: `${companyName} · Ingegneria e Automazione B2B (${city})`,
      heroBullets: [
        "Studio elettrico, sviluppo software PLC e cablaggio quadri certificato",
        "Revamping macchinari e interconnessione verso gestionali aziendali MES/ERP",
        "Collaudo funzionale, fascicolo tecnico CE e teleassistenza post-vendita",
      ],
      valueProps: [
        {
          title: "Progettazione Elettrica e Software Su Specifica",
          description: `Sviluppiamo architetture di controllo affidabili e scalabili a ${city}, pensate per integrarsi nei vostri reparti senza lunghi fermi produzione.`,
          metric: "Norma CE",
        },
        {
          title: "Quadristica, Cablaggio e Sicurezza Impianti",
          description: `Quadri di potenza e automazione testati al 100% prima della spedizione, completi di schemi aggiornati e verifiche di sicurezza.`,
          metric: "Testato 100%",
        },
        {
          title: "Avviamento in Linea e Teleassistenza",
          description: `Supportiamo gli operatori in fabbrica durante la messa in servizio e garantiamo continuità con diagnostica tempestiva.`,
          metric: "Supporto Diretto",
        },
      ],
      clientReferenceWall: [
        "Direttiva Macchine 2006/42/CE",
        "Conformita CEI EN 60204-1",
        "Integrazione MES / ERP",
        "Teleassistenza Industriale",
        "Qualita Certificata ISO 9001",
      ],
      secondaryStats: [
        { value: "99.4%", label: "Commesse di automazione collaudate nei tempi concordati" },
        { value: "< 0.4s", label: "Caricamento rapido del portale tecnico su smartphone" },
        { value: "24h", label: "Primo riscontro dall'Ufficio Tecnico su nuove commesse" },
      ],
      reviewsSummary: `Partner tecnologico per l'automazione di stabilimenti a ${city}`,
      mainStatValue: "99.4%",
      mainStatLabel: "Impianti e quadri avviati nel rispetto delle finestre produttive",
      testimonials: [
        {
          name: "Direttore di Stabilimento",
          location: `${city} · Reparto Automazione`,
          quote: `Il revamping eseguito da ${companyName} ha stabilizzato la linea e ridotto i guasti elettrici fin dal primo mese di esercizio.`,
          roleOrContext: "Automazione e revamping",
        },
        {
          name: "Responsabile Ingegneria di Processo",
          location: `${city} e provincia`,
          quote: `Documentazione elettrica ordinata, rispetto rigoroso delle norme di sicurezza e disponibilita immediata in fase di collaudo.`,
          roleOrContext: "Quadristica e bordomacchina",
        },
      ],
    },
    logistica_imballaggi: {
      headline: `${companyName}: Movimentazione, Logistica e Imballaggi Industriali a ${city}`,
      subheadline: `Soluzioni affidabili per trasporti dedicati, nastri trasportatori, stoccaggio e packaging B2B a ${city} con puntualita contrattuale e monitoraggio diretto.`,
      badgeTop: `${companyName} · Logistica e Movimentazione B2B (${city})`,
      heroBullets: [
        "Analisi flussi di magazzino, movimentazione interna e spedizioni programmate",
        "Imballaggi protetti e sistemi di trasporto progettati su dimensioni reali",
        "Referente operativo unico per coordinamento carichi e urgenze",
      ],
      valueProps: [
        {
          title: "Soluzioni su Misura per Flussi di Stabilimento",
          description: `Ottimizziamo movimentazione, rulliere, stoccaggio e confezionamento a ${city} riducendo danni da trasporto e tempi morti di carico.`,
          metric: "Efficienza Logistica",
        },
        {
          title: "Puntualita e Protezione Merci Garantita",
          description: `${companyName} opera con standard rigorosi per proteggere prodotti finiti, semilavorati e macchinari lungo tutta la filiera.`,
          metric: "99.4% Puntuali",
        },
        {
          title: "Capacita Flessibile e Accordi Quadro",
          description: `Scorte di sicurezza e pianificazione flessibile per assorbire picchi di produzione e richieste urgenti senza blocchi.`,
          metric: "SLA Contrattuale",
        },
      ],
      clientReferenceWall: [
        "Consegne Programmate JIT",
        "Sicurezza Carichi e Imballi",
        "Qualita Certificata ISO 9001",
        "Integrazione Flussi ERP",
        "Referente Operativo Unico",
      ],
      secondaryStats: [
        { value: "99.4%", label: "Spedizioni e forniture consegnate nella finestra concordata" },
        { value: "< 0.4s", label: "Richiesta quotazione istantanea da ufficio acquisti e magazzino" },
        { value: "24h", label: "Quotazione tratte, impianti o lotti su specifica" },
      ],
      reviewsSummary: `Partner logistico e industriale di fiducia a ${city}`,
      mainStatValue: "99.4%",
      mainStatLabel: "Tasso di puntualita sulle consegne e movimentazioni B2B",
      testimonials: [
        {
          name: "Responsabile Logistica e Magazzino",
          location: `${city} · Polo Industriale`,
          quote: `Da quando collaboriamo con ${companyName} abbiamo velocizzato le operazioni di carico e azzerato i ritardi verso i nostri clienti esteri.`,
          roleOrContext: "Logistica e movimentazione",
        },
        {
          name: "Ufficio Acquisti Aziendale",
          location: `${city} e provincia`,
          quote: `Preventivi chiari, tracciabilita immediata e supporto rapido anche nelle spedizioni urgenti di fine mese.`,
          roleOrContext: "Fornitura continuativa",
        },
      ],
    },
    ambiente_energia_b2b: {
      headline: `${companyName}: Impianti Industriali, Energia e Servizi Ambientali B2B a ${city}`,
      subheadline: `Progettazione ed esecuzione di interventi tecnici su capannoni, depurazione, bonifiche ed efficienza energetica a ${city} nel pieno rispetto normativo.`,
      badgeTop: `${companyName} · Servizi Tecnici e Infrastrutture B2B (${city})`,
      heroBullets: [
        "Sopralluogo tecnico in stabilimento e piano operativo senza fermo attivita",
        "Gestione completa pratiche autorizzative, certificazioni e conformita ambientale",
        "Garanzie scritte su sicurezza, rendimento e assistenza post-intervento",
      ],
      valueProps: [
        {
          title: "Perizia Tecnica e Piano Esecutivo Chiaro",
          description: `Analizziamo lo stato reale dell'impianto o della copertura a ${city} definendo costi, tempistiche e ritorni operativi prima del cantiere.`,
          metric: "Progetto Chiuso",
        },
        {
          title: "Piena Conformita Normativa e Ambientale",
          description: `${companyName} gestisce interventi complessi in sicurezza, rilasciando tutta la documentazione tecnica e le certificazioni richieste.`,
          metric: "100% A Norma",
        },
        {
          title: "Manutenzione Programmata e Assistenza Diretta",
          description: `Un referente tecnico dedicato segue l'azienda dalla realizzazione fino ai controlli periodici e all'assistenza continua.`,
          metric: "SLA Garantito",
        },
      ],
      clientReferenceWall: [
        "Conformita Sicurezza D.Lgs 81/08",
        "Certificazioni Impianti e Ambiente",
        "Qualita Certificata ISO 9001",
        "Cantieri Senza Fermo Produzione",
        "Assistenza Tecnica Diretta",
      ],
      secondaryStats: [
        { value: "99.4%", label: "Interventi eseguiti nel rispetto delle scadenze di cantiere" },
        { value: "< 0.4s", label: "Accesso rapido a perizie e richieste tecniche su mobile" },
        { value: "24h", label: "Pianificazione sopralluogo tecnico in stabilimento" },
      ],
      reviewsSummary: `Partner tecnico specializzato per aziende e capannoni a ${city}`,
      mainStatValue: "99.4%",
      mainStatLabel: "Commesse industriali chiuse in sicurezza e nei tempi concordati",
      testimonials: [
        {
          name: "Direzione Tecnica e HSE",
          location: `${city} · Stabilimento Produttivo`,
          quote: `Cantiere organizzato in modo impeccabile da ${companyName}: lavorazioni svolte senza fermare la nostra produzione e documentazione esemplare.`,
          roleOrContext: "Intervento in stabilimento",
        },
        {
          name: "Amministrazione e Impianti",
          location: `${city} e provincia`,
          quote: `Preventivo dettagliato senza voci impreviste e supporto prezioso su tutta la parte autorizzativa.`,
          roleOrContext: "Servizio chiavi in mano",
        },
      ],
    },
    generic_b2b: {
      headline: `${companyName}: Soluzioni Tecniche e Forniture B2B a ${city}`,
      subheadline: `Affianchiamo aziende e direzioni tecniche a ${city} con progettazione su specifica, tempi di consegna certi e assistenza post-vendita diretta.`,
      badgeTop: `${companyName} · Divisione Tecnica e Commesse B2B (${city})`,
      heroBullets: [
        "Studio di fattibilita tecnica e capitolato con tempi di consegna certi",
        "Qualifica immediata della richiesta e assegnazione diretta all'Ufficio Tecnico",
        "Produzione e assistenza certificata con referente unico dedicato",
      ],
      valueProps: [
        {
          title: "Ingegneria e Progettazione su Specifica",
          description: `Analizziamo i requisiti produttivi della commessa a ${city}, definendo specifiche tecniche, tempi di consegna e costi prima dell'avvio.`,
          metric: "Capitolato Chiuso",
        },
        {
          title: "Controllo Qualita e Conformita Normativa",
          description: `Ogni fornitura di ${companyName} viene collaudata secondo gli standard di sicurezza e qualita vigenti, con documentazione tecnica completa.`,
          metric: "100% Certificato",
        },
        {
          title: "Continuita Operativa e Assistenza Post-Vendita",
          description: `Affianchiamo il reparto tecnico e acquisti dal collaudo in stabilimento fino alla manutenzione programmata.`,
          metric: "SLA Garantito",
        },
      ],
      clientReferenceWall: [
        "Qualita Certificata ISO 9001",
        "Conformita Tecnica CE",
        "Integrazione Gestionale / ERP",
        "Capitolato e Preventivo Chiuso",
        "Assistenza Tecnica Diretta",
      ],
      secondaryStats: [
        { value: "99.4%", label: "Commesse consegnate nel pieno rispetto dei tempi contrattuali" },
        { value: "< 0.4s", label: "Caricamento istantaneo dell'infrastruttura digitale su mobile" },
        { value: "24h", label: "Presa in carico tecnica e invio automatico della richiesta al CRM" },
      ],
      reviewsSummary: `Partner tecnico di riferimento per imprese e stabilimenti a ${city}`,
      mainStatValue: "99.4%",
      mainStatLabel: "Commesse B2B consegnate entro i tempi contrattuali",
      testimonials: [
        {
          name: "Direzione Tecnica e Produzione",
          location: `${city} · Commessa Industriale`,
          quote: `Abbiamo affidato a ${companyName} una commessa strategica per il nostro reparto: rispetto rigoroso delle specifiche tecniche e collaudo impeccabile.`,
          roleOrContext: "Fornitura e collaudo B2B",
        },
        {
          name: "Responsabile Ufficio Acquisti",
          location: `${city} e provincia`,
          quote: `Partner strutturato e affidabile: preventivazione trasparente, documentazione tecnica completa e supporto post-vendita immediato.`,
          roleOrContext: "Accordo quadro di fornitura",
        },
      ],
    },
    infissi_serramenti: {
      headline: `${companyName}: Infissi e Serramenti ad Alto Isolamento a ${city}`,
      subheadline: `Progettazione, fornitura e posa qualificata di infissi in PVC, alluminio, porte interne e blindati a ${city} con gestione completa delle detrazioni fiscali.`,
      badgeTop: `${companyName} · Serramenti Certificati a ${city}`,
      heroBullets: [
        "Rilievo misure preciso a domicilio e preventivo trasparente chiavi in mano",
        "Profili ad alto isolamento termico e acustico per abbattere i consumi",
        "Posa certificata con squadre interne e assistenza post-vendita diretta",
      ],
      valueProps: [
        {
          title: "Isolamento Termico e Acustico Certificato",
          description: `Serramenti selezionati per eliminare spifferi, umidita e rumori esterni nella tua abitazione o ufficio a ${city}.`,
          metric: "Risparmio Energetico",
        },
        {
          title: "Posa in Opera Qualificata Senza Sorprese",
          description: `Squadre di montaggio esperte di ${companyName} curano controtelai, sigillature e finiture senza opere murarie invasive.`,
          metric: "Posa Certificata",
        },
        {
          title: "Preventivo Chiaro e Supporto Pratiche Bonus",
          description: `Costi chiari fin dal primo incontro e assistenza completa su certificazioni energetiche ed ecobonus.`,
          metric: "Prezzo Bloccato",
        },
      ],
      reviewsSummary: `4.9/5 da clienti seguiti a ${city} e provincia`,
      mainStatValue: "98%",
      mainStatLabel: "Clienti soddisfatti di posa in opera e isolamento termico",
      testimonials: [
        {
          name: "Davide C.",
          location: city,
          quote: `Team di ${companyName} preciso dal rilievo al montaggio. La differenza termica e acustica in casa si sente subito.`,
          roleOrContext: "Sostituzione infissi completi",
        },
        {
          name: "Federica S.",
          location: `${city} e provincia`,
          quote: `Preventivo rispettato al centesimo, cantiere lasciato pulito ogni sera e grande supporto sulle pratiche fiscali.`,
          roleOrContext: "Finestre e portoncino blindato",
        },
      ],
    },
    tende_outdoor: {
      headline: `${companyName}: Pergole Bioclimatiche e Tende da Sole a ${city}`,
      subheadline: `Soluzioni su misura per vivere terrazzi e giardini tutto l'anno a ${city}: sopralluogo tecnico, progettazione dedicata e installazione certificata.`,
      badgeTop: `${companyName} · Outdoor e Schermature Solari (${city})`,
      heroBullets: [
        "Rilievo misure a domicilio e progettazione su misura per balconi e giardini",
        "Tessuti tecnici e strutture resistenti a sole, vento e pioggia",
        "Motorizzazioni silenziose, sensoristica vento/pioggia e gestione pratiche",
      ],
      valueProps: [
        {
          title: "Progettazione Estetica Su Misura",
          description: `Adattiamo ogni pergola o tenda da sole all'architettura del tuo edificio a ${city} con finiture e tessuti coordinati.`,
          metric: "Su Misura",
        },
        {
          title: "Materiali Certificati ad Alta Durata",
          description: `${companyName} utilizza strutture in alluminio verniciato e motorizzazioni garantite per resistere negli anni.`,
          metric: "Garanzia Scritta",
        },
        {
          title: "Installazione Rapida e Pulita",
          description: `Montaggio completo curato dai nostri tecnici interni con collaudo finale e assistenza diretta sul territorio.`,
          metric: "Chiavi in Mano",
        },
      ],
      reviewsSummary: `4.9/5 da privati e attivita a ${city}`,
      mainStatValue: "98%",
      mainStatLabel: "Installazioni outdoor completate nei tempi concordati",
      testimonials: [
        {
          name: "Andrea M.",
          location: city,
          quote: `La pergola installata da ${companyName} ha trasformato il nostro terrazzo. Finiture impeccabili e montaggio velocissimo.`,
          roleOrContext: "Pergola bioclimatica",
        },
        {
          name: "Chiara L.",
          location: `${city} e provincia`,
          quote: `Consulenza chiara sui tessuti e sulle detrazioni disponibili. Puntuali e super ordinati durante l'installazione.`,
          roleOrContext: "Tende da sole motorizzate",
        },
      ],
    },
    fotovoltaico_clima: {
      headline: `${companyName}: Fotovoltaico, Clima e Impianti ad Alta Efficienza a ${city}`,
      subheadline: `Riduci subito i costi energetici della tua casa o attivita a ${city} con impianti dimensionati sui consumi reali e installazione certificata chiavi in mano.`,
      badgeTop: `${companyName} · Energia e Comfort Termico (${city})`,
      heroBullets: [
        "Analisi consumi in bolletta e dimensionamento reale senza sovrastime",
        "Installazione certificata con tecnici interni abilitati F-Gas / FER",
        "Gestione completa pratiche di allaccio, ENEA e incentivi fiscali",
      ],
      valueProps: [
        {
          title: "Dimensionamento Sui Tuoi Consumi Reali",
          description: `Calcoliamo potenza, accumulo o taglia della pompa di calore per offrirti il miglior rientro economico possibile a ${city}.`,
          metric: "Resa Massima",
        },
        {
          title: "Installazione Certificata e Sicura",
          description: `I tecnici di ${companyName} eseguono il lavoro a regola d'arte rilasciando tutte le dichiarazioni di conformita.`,
          metric: "100% A Norma",
        },
        {
          title: "Assistenza e Pratiche Chiavi in Mano",
          description: `Seguiamo noi iter autorizzativi, pratiche incentivi e manutenzione programmata post-installazione.`,
          metric: "Zero Pensieri",
        },
      ],
      reviewsSummary: `4.9/5 da clienti residenziali a ${city}`,
      mainStatValue: "98%",
      mainStatLabel: "Clienti soddisfatti del risparmio energetico ottenuto",
      testimonials: [
        {
          name: "Simone G.",
          location: city,
          quote: `Impianto dimensione perfetta per i nostri consumi. ${companyName} ha gestito installazione e pratiche in tempi record.`,
          roleOrContext: "Fotovoltaico con accumulo",
        },
        {
          name: "Elena P.",
          location: `${city} e provincia`,
          quote: `Tecnici puliti e precisi nel montaggio del nuovo impianto di climatizzazione. Preventivo chiaro fin dal primo giorno.`,
          roleOrContext: "Pompa di calore e clima",
        },
      ],
    },
    sicurezza_casa: {
      headline: `${companyName}: Sicurezza Casa, Serrature e Antifurti a ${city}`,
      subheadline: `Proteggi abitazione, ufficio o negozio a ${city} con interventi rapidi, sistemi antintrusione affidabili e assistenza tecnica diretta.`,
      badgeTop: `${companyName} · Sicurezza e Protezione (${city})`,
      heroBullets: [
        "Interventi tempestivi a domicilio con tecnici qualificati sul territorio",
        "Sistemi di sicurezza e serrature certificate antiscasso di ultima generazione",
        "Preventivo chiaro prima dell'uscita e garanzia diretta sui componenti",
      ],
      valueProps: [
        {
          title: "Analisi Punti Critici e Consulenza Diretta",
          description: `Verifichiamo accessi, serramenti e vulnerabilita dell'immobile a ${city} proponendo solo le protezioni realmente utili.`,
          metric: "Sopralluogo Rapido",
        },
        {
          title: "Componenti Certificati Alta Sicurezza",
          description: `${companyName} installa dispositivi affidabili per proteggere la tua famiglia e i tuoi beni senza falsi allarmi.`,
          metric: "Alta Affidabilita",
        },
        {
          title: "Assistenza Diretta H24 sul Territorio",
          description: `Un referente locale reale sempre reperibile per configurazioni, manutenzioni e urgenze.`,
          metric: "Pronto Intervento",
        },
      ],
      reviewsSummary: `4.9/5 da famiglie e attivita a ${city}`,
      mainStatValue: "98%",
      mainStatLabel: "Interventi risolti alla prima uscita con garanzia scritta",
      testimonials: [
        {
          name: "Roberto T.",
          location: city,
          quote: `Intervenuti in giornata per l'aggiornamento delle serrature. Lavoro pulito, veloce e prezzo assolutamente corretto.`,
          roleOrContext: "Sicurezza abitazione",
        },
        {
          name: "Giulia N.",
          location: `${city} e provincia`,
          quote: `Sistema di allarme semplice da usare da smartphone e installato senza cavi a vista. Consigliatissimi.`,
          roleOrContext: "Impianto antintrusione",
        },
      ],
    },
    traslochi_edilizia: {
      headline: `${companyName}: Lavori e Interventi Chiavi in Mano a ${city}`,
      subheadline: `Affidati al team di ${companyName} a ${city} per pianificazione precisa, squadre interne qualificate e tempi di consegna garantiti da contratto.`,
      badgeTop: `${companyName} · Operativi a ${city} e provincia`,
      heroBullets: [
        "Sopralluogo gratuito e preventivo dettagliato senza costi nascosti",
        "Squadre operative esperte con attrezzature proprie e copertura assicurativa",
        "Rispetto rigoroso delle tempistiche concordate e unico referente tecnico",
      ],
      valueProps: [
        {
          title: "Pianificazione Accurata e Zero Ritardi",
          description: `Organizziamo mezzi, personale e materiali prima di iniziare l'intervento a ${city} per rispettare ogni scadenza.`,
          metric: "Tempi Certi",
        },
        {
          title: "Massima Cura e Sicurezza in Cantiere",
          description: `${companyName} lavora con protezioni dedicate, personale in regola e assicurazione completa su ogni fase.`,
          metric: "100% Assicurato",
        },
        {
          title: "Preventivo Chiuso e Referente Unico",
          description: `Sai subito quanto spendi e hai un contatto diretto dall'avvio fino alla chiusura dei lavori.`,
          metric: "Zero Sorprese",
        },
      ],
      reviewsSummary: `Azienda apprezzata a ${city} per puntualita e cura`,
      mainStatValue: "98%",
      mainStatLabel: "Interventi completati nei tempi e nel budget concordato",
      testimonials: [
        {
          name: "Marco R.",
          location: city,
          quote: `Organizzazione impeccabile fin dal sopralluogo. Squadra veloce, educata e attenta ad ogni dettaglio.`,
          roleOrContext: "Intervento completato",
        },
        {
          name: "Laura B.",
          location: `${city} e provincia`,
          quote: `Preventivo rispettato alla lettera e tempi anche piu rapidi del previsto. Un riferimento serio sul territorio.`,
          roleOrContext: "Cliente verificato",
        },
      ],
    },
    odontoiatria: {
      headline: `${companyName}: Odontoiatria Moderna e Cura del Paziente a ${city}`,
      subheadline: `Piani di cura personalizzati, tecnologie diagnostiche digitali e massima attenzione al comfort del paziente nel nostro studio a ${city}.`,
      badgeTop: `${companyName} · Studio Odontoiatrico (${city})`,
      heroBullets: [
        "Prima visita approfondita con inquadramento diagnostico chiaro e trasparente",
        "Protocolli sterili certificati e attenzione prioritaria al comfort senza dolore",
        "Piano di cure dettagliato, tempi certi e pagamenti dilazionabili",
      ],
      valueProps: [
        {
          title: "Diagnostica Digitale e Piano Chiaro",
          description: `Spieghiamo ogni fase terapeutica con linguaggio semplice e preventivi chiari prima di iniziare qualsiasi trattamento a ${city}.`,
          metric: "Trasparenza Totale",
        },
        {
          title: "Approccio Mini-Invasivo e Comfort",
          description: `Tecniche moderne orientate a ridurre ansia, fastidi e tempi di recupero anche nei casi implantari complessi.`,
          metric: "Cura Delicata",
        },
        {
          title: "Igiene Certificata e Continuità Clinica",
          description: `Protocolli di sterilizzazione tracciati e richiami periodici programmati per proteggere la salute nel lungo periodo.`,
          metric: "Standard Alti",
        },
      ],
      reviewsSummary: `4.9/5 dalle recensioni verificate dei pazienti a ${city}`,
      mainStatValue: "98%",
      mainStatLabel: "Pazienti che tornano per i controlli periodici annuali",
      testimonials: [
        {
          name: "Francesca V.",
          location: city,
          quote: `Ambiente sereno e pulitissimo. Mi hanno spiegato tutto con calma prima della visita, togliendomi ogni timore.`,
          roleOrContext: "Paziente in cura",
        },
        {
          name: "Alessandro D.",
          location: `${city} e provincia`,
          quote: `Grande professionalita dell'equipe di ${companyName}: puntualita sugli orari e zero dolore durante il trattamento.`,
          roleOrContext: "Implantologia e igiene",
        },
      ],
    },
    poliambulatorio: {
      headline: `${companyName}: Centro Medico e Visite Specialistiche a ${city}`,
      subheadline: `Prevenzione, diagnostica e visite specialistiche con tempi di attesa ridotti e un'equipe medica dedicata a ${city}.`,
      badgeTop: `${companyName} · Poliambulatorio Specialistico (${city})`,
      heroBullets: [
        "Prenotazione rapida senza lunghe liste d'attesa con segreteria dedicata",
        "Equipe multidisciplinare coordinata e refertazione chiara",
        "Ambiente accogliente, accessibile e orientato al benessere del paziente",
      ],
      valueProps: [
        {
          title: "Visite Specialistiche Senza Attese",
          description: `Accesso rapido a visite ed esami diagnostici a ${city} con orari flessibili adatti anche a chi lavora.`,
          metric: "Tempi Rapidi",
        },
        {
          title: "Percorso Coordinato Tra Specialisti",
          description: `Un approccio integrato che mette in comunicazione i medici del centro per evitare esami ripetuti e diagnosi frammentate.`,
          metric: "Equipe Unita",
        },
        {
          title: "Accoglienza e Chiarezza Clinica",
          description: `Dalla prima accoglienza fino ai controlli di follow-up seguiamo il paziente con ascolto e massima riservatezza.`,
          metric: "98% Soddisfatti",
        },
      ],
      reviewsSummary: `4.9/5 dai pazienti seguiti presso il centro a ${city}`,
      mainStatValue: "98%",
      mainStatLabel: "Pazienti soddisfatti di puntualita e qualita clinica",
      testimonials: [
        {
          name: "Valentina M.",
          location: city,
          quote: `Prenotato la visita in giornata, zero attesa in sala e medico attentissimo nell'ascoltare tutta la mia storia clinica.`,
          roleOrContext: "Visita specialistica",
        },
        {
          name: "Giovanni P.",
          location: `${city} e provincia`,
          quote: `Struttura moderna e personale gentilissimo in segreteria. Un punto di riferimento serio a ${city}.`,
          roleOrContext: "Diagnostica e controlli",
        },
      ],
    },
    generic_local: {
      headline: `${companyName}: Soluzioni Professionali a ${city}`,
      subheadline: `Affidati all'esperienza di ${companyName} a ${city}. Richiedi una valutazione tecnica e un preventivo chiaro senza impegno.`,
      badgeTop: `${companyName} · Operativi a ${city} e provincia`,
      heroBullets: [
        "Sopralluogo tecnico e preventivo chiaro senza impegno",
        "Materiali certificati e assistenza diretta con personale qualificato",
        "Tempi di intervento garantiti e gestione completa della pratica",
      ],
      valueProps: [
        {
          title: "Qualita Certificata e Garanzia Scritta",
          description: `Ogni intervento di ${companyName} utilizza materiali selezionati e procedure certificate per garantire durata e prestazioni nel tempo.`,
          metric: "100% Garantito",
        },
        {
          title: "Preventivo Chiaro e Zero Sorprese",
          description: `Valutazione trasparente delle soluzioni piu adatte alle tue esigenze a ${city}, con tempi e costi definiti prima dell'inizio dei lavori.`,
          metric: "Preventivo Chiuso",
        },
        {
          title: "Assistenza Tecnica Diretta",
          description: `Un unico referente tecnico ti segue dal primo sopralluogo fino al collaudo finale e all'assistenza post-vendita.`,
          metric: "Supporto Diretto",
        },
      ],
      reviewsSummary: `Azienda di riferimento a ${city} per affidabilita e precisione`,
      mainStatValue: "98%",
      mainStatLabel: "Clienti soddisfatti del servizio e dell'assistenza",
      testimonials: [
        {
          name: "Marco R.",
          location: city,
          quote: `Servizio impeccabile da parte del team di ${companyName}. Puntuali, precisi e disponibilissimi in ogni fase del lavoro.`,
          roleOrContext: "Cliente verificato",
        },
        {
          name: "Laura B.",
          location: city,
          quote: `Ottima consulenza iniziale e grande cura nei dettagli. Preventivo rispettato al centesimo e risultato superiore alle aspettative.`,
          roleOrContext: "Intervento completato",
        },
      ],
    },
  };

  const preset = defaultContentByNiche[niche];

  const cleanScrapedH = (scrapedHeadline || "").replace(/[—–]/g, "-").trim();
  const cleanScrapedSub = (scrapedSubheadline || "").replace(/[—–]/g, "-").trim();

  const heroHeadline = isCleanItalianHeadline(cleanScrapedH)
    ? cleanScrapedH
    : preset.headline;

  const isValidScrapedSub =
    cleanScrapedSub.length >= 45 &&
    !isBoilerplateTitle(cleanScrapedSub) &&
    !/cookie|privacy policy|questo sito utilizza|javascript/i.test(cleanScrapedSub) &&
    !/\b(?:functional and process solutions|we are a company|welcome to)\b/i.test(
      cleanScrapedSub
    );

  const heroSubheadline = isValidScrapedSub
    ? cleanScrapedSub.slice(0, 210)
    : preset.subheadline;

  return {
    badgeTop: preset.badgeTop,
    heroHeadline,
    heroSubheadline,
    heroBullets: preset.heroBullets,
    ctaButtonText: isMedical
      ? "Richiedi Disponibilita Visita"
      : isB2B
      ? "Richiedi Studio di Fattibilita"
      : "Calcola il Tuo Preventivo Rapido",
    trustMicrocopy: isB2B
      ? "Riservatezza industriale garantita (NDA) · Risposta tecnica entro la giornata lavorativa"
      : isMedical
      ? "Richiesta riservata e senza impegno · Conferma rapida dalla segreteria"
      : "Richiesta gratuita e senza impegno · Risposta rapida dal nostro ufficio tecnico",
    logoLocalPath,
    heroImageLocalPath,
    heroImageCaption: `${companyName} · Sede operativa e realizzazioni (${city})`,
    quiz: buildQuizForKeyword(keyword, archetype, niche),
    valueProps: preset.valueProps,
    socialProof: {
      mainStatValue: preset.mainStatValue,
      mainStatLabel: preset.mainStatLabel,
      reviewsSummary: preset.reviewsSummary,
      clientReferenceWall: isB2B ? preset.clientReferenceWall : undefined,
      secondaryStats: isB2B ? preset.secondaryStats : undefined,
      testimonials: preset.testimonials,
    },
    medicalDetails: isMedical
      ? {
          directorName:
            decisionMakerFullName || `Direzione Sanitaria ${companyName}`,
          alboRegistration: `Struttura autorizzata · Ordine Provinciale di ${city}`,
          specialization:
            niche === "odontoiatria"
              ? "Odontoiatria, Implantologia e Cura del Sorriso"
              : "Medicina Specialistica, Diagnostica e Prevenzione",
          clinicAddress: `Sede operativa: ${city}`,
          openingHours: "Lun - Ven · 09:00 - 19:00",
          parkingAndAccess: "Accesso privo di barriere e parcheggio comodo",
          conventions: [
            "Principali Fondi Sanitari",
            "Piani di cura personalizzati",
          ],
        }
      : undefined,
  };
}

export async function runAutonomousScout(
  keyword: string,
  maxLeads = 5,
  options?: {
    preferAdLibrary?: boolean;
    customCandidates?: CandidateBusiness[];
    minLcpSeconds?: number;
  }
): Promise<{
  success: boolean;
  discovered: Array<{
    slug: string;
    companyName: string;
    decisionMakerName: string;
    targetEmail: string;
    isGenericInbox: boolean;
    runsAds: boolean;
    city: string;
    lcp: number;
    demoUrl: string;
  }>;
}> {
  let candidates: CandidateBusiness[] = [];
  if (options?.customCandidates && options.customCandidates.length > 0) {
    candidates = options.customCandidates;
  } else if (options?.preferAdLibrary) {
    candidates = await discoverMetaAdLibraryBusinesses(keyword, Math.max(16, maxLeads * 4));
  } else {
    candidates = await discoverItalianBusinesses(keyword, Math.max(20, maxLeads * 4));
  }

  const discovered: Array<{
    slug: string;
    companyName: string;
    decisionMakerName: string;
    targetEmail: string;
    isGenericInbox: boolean;
    runsAds: boolean;
    city: string;
    lcp: number;
    demoUrl: string;
  }> = [];

  for (const cand of candidates) {
    if (discovered.length >= maxLeads) break;

    const targetUrl = cand.targetUrl;
    if (!targetUrl) continue;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      continue;
    }

    // DIRETTIVA 1: Scarta categoricamente qualsiasi URL PagineGialle o directory non proprietaria
    const isPagineGialleUrl =
      parsedUrl.hostname.includes("paginegialle.it") ||
      EXCLUDED_DOMAINS.some((ex) => parsedUrl.hostname.toLowerCase().includes(ex));
    if (isPagineGialleUrl) {
      continue;
    }

    const slug = slugifyDomain(parsedUrl.hostname);
    if (!slug || slug.length < 3) continue;

    if (loadLeadConfig(slug)) {
      continue;
    }

    try {
      let html = "";
      let ttfbMs = 0;

      // DIRETTIVA 1: Se la fetch del targetUrl fallisce o restituisce un HTML inferiore a 300 caratteri, scarta il candidato
      try {
        const start = Date.now();
        const res = await fetch(targetUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
          },
          redirect: "follow",
          signal: AbortSignal.timeout(7500),
        });
        if (!res.ok) continue;
        html = await res.text();
        ttfbMs = Date.now() - start;
      } catch {
        continue;
      }

      if (!html || html.trim().length < 300) {
        continue;
      }

      // DIRETTIVA 2.1: Scraping proattivo multi-pagina SEMPRE in parallelo con Promise.allSettled e timeout 3500ms
      const dynamicInternalLinks = [
        ...html.matchAll(/href=["']([^"'#?]+(?:privacy|informativa|chi-siamo|contatt|azienda|team)[^"'#?]*)["']/gi),
      ]
        .map((m) => m[1])
        .filter((href) => {
          try {
            const u = new URL(href, parsedUrl.origin);
            return u.hostname === parsedUrl.hostname;
          } catch {
            return false;
          }
        })
        .slice(0, 4);

      const subpagePaths = Array.from(
        new Set([
          "/contatti",
          "/chi-siamo",
          "/azienda",
          "/team",
          "/privacy-policy",
          ...dynamicInternalLinks,
        ])
      );
      const subpageResults = await Promise.allSettled(
        subpagePaths.map(async (subPath) => {
          const subUrl = new URL(subPath, parsedUrl.origin).href;
          const subRes = await fetch(subUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
            },
            redirect: "follow",
            signal: AbortSignal.timeout(3500),
          });
          if (!subRes.ok) return "";
          return await subRes.text();
        })
      );

      const subpagesHtml = subpageResults
        .map((r) => (r.status === "fulfilled" ? r.value : ""))
        .filter((s) => s.length > 100)
        .join("\n");

      const combinedHtml = (html + "\n" + subpagesHtml)
        .replace(/&#64;/g, "@")
        .replace(/&#46;/g, ".")
        .replace(/\[at\]/gi, "@");

      // DIRETTIVA 2.2: Inversione priorità -> email estratte dal sito/sottopagine PRIMA di cand.fallbackEmail
      const siteExtractedEmails =
        combinedHtml.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const orderedRawEmails = [
        ...siteExtractedEmails,
        ...(cand.fallbackEmail ? [cand.fallbackEmail] : []),
      ];

      // DIRETTIVA 2.3: Selezione tramite motore di scoring & hard blacklist
      const emailSelection = selectBestDecisionMakerEmail(
        orderedRawEmails,
        parsedUrl.hostname
      );
      if (!emailSelection.bestEmail) {
        continue;
      }

      const targetEmail = emailSelection.bestEmail;
      const emailDomainToVerify = targetEmail.split("@")[1];
      if (!emailDomainToVerify) continue;
      try {
        const dohRes = await fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(emailDomainToVerify)}&type=MX`,
          { signal: AbortSignal.timeout(3000) }
        ).then((r) => r.json());
        const hasValidMx =
          dohRes &&
          Array.isArray(dohRes.Answer) &&
          dohRes.Answer.some((a: { type?: number; data?: string }) => a.type === 15 && a.data && a.data !== "0 .");
        if (!hasValidMx) {
          continue;
        }
      } catch {
        // Se DoH non risponde in tempo, proseguiamo
      }
      const isGenericInbox = emailSelection.isGeneric;

      // DIRETTIVA 3: Estrazione reale del Decision Maker
      const decisionMaker = extractDecisionMakerFromHtml(combinedHtml, targetEmail);

      // DIRETTIVA 4: Rilevamento reale Ads & Pixel sul DOM scaricato
      const cameFromAdLibrary = Boolean(
        options?.preferAdLibrary || cand.candidateAdLibraryUrl
      );
      const adTracking = detectActiveAdTracking(combinedHtml, cameFromAdLibrary);
      const runsAds = adTracking.runsAds;

      const piva =
        combinedHtml.match(
          /(?:P\.?\s*IVA|Partita\s+IVA|C\.F\.|Codice\s+Fiscale)[\s:]*([0-9]{11})/i
        )?.[1] ||
        cand.fallbackVat ||
        "Non trovata";

      const phones = extractValidItalianPhones(combinedHtml, {
        extraPhones: [cand.fallbackPhone],
        vatNumber: piva,
      });

      const cleanText = stripTags(combinedHtml + " " + (cand.fallbackDescription || ""));
      const pageTitle = stripTags(
        html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ""
      );
      const firstH1 = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
      const metaDesc =
        html.match(
          /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
        )?.[1] ||
        cand.fallbackDescription ||
        "";

      const domBlockingScripts =
        (html.match(/<script(?![^>]*defer)(?![^>]*async)[^>]+src=/gi) || []).length +
        (html.match(/<link[^>]+rel=["']stylesheet["']/gi) || []).length;

      const psiMetrics = await fetchPageSpeedMetrics(
        targetUrl,
        ttfbMs,
        Buffer.byteLength(html, "utf8"),
        domBlockingScripts
      );
      const estimatedMobileLcpSeconds = psiMetrics.lcpSeconds;
      const renderBlockingScripts = psiMetrics.renderBlockingCount;
      const realMobileScore = psiMetrics.mobileScore;

      const minLcpRequired = options?.minLcpSeconds ?? 4.5;
      if (estimatedMobileLcpSeconds < minLcpRequired) {
        continue;
      }

      const { candidateLogoUrls: extractedLogos, candidateHeroUrls: extractedHeroes } =
        extractExtendedImageUrls(targetUrl, [html, subpagesHtml]);

      const candidateLogoUrls = Array.from(
        new Set([
          ...extractedLogos,
          ...(cand.fallbackLogoUrl ? [cand.fallbackLogoUrl] : []),
        ])
      );
      const candidateHeroUrls = Array.from(
        new Set([
          ...extractedHeroes,
          ...(cand.fallbackHeroUrl ? [cand.fallbackHeroUrl] : []),
        ])
      );

      const outDir = path.join(process.cwd(), "public", "leads", slug);
      let finalLogoPath = "";
      let logoAnalysis: ReturnType<typeof analyzePngLogo> = null;
      for (const logoUrl of candidateLogoUrls.slice(0, 7)) {
        const res = await downloadAndNormalizeRasterAsset(
          logoUrl,
          path.join(outDir, "logo.png"),
          "png",
          { minBytes: 300, minWidth: 40, minHeight: 18 }
        );
        if (res.ok) {
          finalLogoPath = `/leads/${slug}/logo.png`;
          logoAnalysis = res.logoAnalysis ?? analyzePngLogo(path.join(outDir, "logo.png"));
          break;
        }
      }

      let finalHeroPath = "";
      for (const heroUrl of candidateHeroUrls.slice(0, 10)) {
        const res = await downloadAndNormalizeRasterAsset(
          heroUrl,
          path.join(outDir, "hero.jpg"),
          "jpg",
          { minBytes: 8000, minWidth: 480, minHeight: 240 }
        );
        if (res.ok) {
          finalHeroPath = `/leads/${slug}/hero.jpg`;
          break;
        }
      }

      if (!finalHeroPath) {
        const screenshotOk = await captureFallbackHeroScreenshot(
          targetUrl,
          path.join(outDir, "hero.jpg")
        );
        if (screenshotOk) {
          finalHeroPath = `/leads/${slug}/hero.jpg`;
        }
      }

      // MAI usare fallback su hero di altri lead (/leads/infissimpm/hero.jpg): se non c'è immagine reale, scarta il candidato
      if (!finalHeroPath) {
        continue;
      }

      const ogSiteName =
        html.match(
          /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i
        )?.[1] || "";

      const companyName = extractCleanCompanyName({
        slug,
        targetUrl,
        fallbackName: cand.fallbackName,
        ogSiteName,
        pageTitle,
        html,
      });

      const city = extractCityFromQueryOrHtml(
        keyword,
        cleanText,
        cand.fallbackCity
      );
      const archetype = assertOfficialArchetype(
        detectArchetype(keyword, `${html} ${cand.fallbackDescription || ""}`)
      );
      const isB2B = archetype === "b2b-authority";
      const isMedical = archetype === "medical-clinic";
      const phone = phones[0] || "";

      const verticalContent = buildVerticalizedLeadContent({
        companyName,
        city,
        archetype,
        keyword,
        corpus: `${cleanText} ${cand.fallbackDescription || ""}`,
        scrapedHeadline: firstH1 || pageTitle,
        scrapedSubheadline: metaDesc,
        logoLocalPath: finalLogoPath,
        heroImageLocalPath: finalHeroPath,
        decisionMakerFullName: decisionMaker.fullName,
      });

      const heroHeadline = verticalContent.heroHeadline;
      const heroSubheadline = verticalContent.heroSubheadline;

      // DIRETTIVA 4: Biforcazione dinamica dei threeCriticalFlaws in base a runsAds
      const threeCriticalFlaws: [string, string, string] = runsAds
        ? [
            `Dispersione del budget pubblicitario: caricamento mobile di ${estimatedMobileLcpSeconds}s (${renderBlockingScripts} risorse bloccanti) che fa abbandonare oltre meta degli utenti prima dell'apertura della pagina.`,
            `Cecita decisionale sul ROI: assenza di tracciamento Server-Side di prima parte (GTM Server-Side e Meta CAPI), con perdita del 30-50% dei dati di conversione per blocchi browser e cookie banner.`,
            `Colli di bottiglia commerciali: i contatti finiscono in email isolate senza pre-qualifica automatica e senza sincronizzazione immediata via API/Webhook con il CRM aziendale.`,
          ]
        : [
            `Perdita di richieste di preventivo su mobile: caricamento di ${estimatedMobileLcpSeconds}s (${renderBlockingScripts} risorse bloccanti) che spinge i visitatori da smartphone ad abbandonare la pagina prima di contattare l'ufficio commerciale.`,
            `Assenza di pre-qualifica automatica: il sito non filtra le richieste per tipologia di intervento, budget o tempistiche prima di inviarle ai referenti tecnici di ${companyName}.`,
            `Colli di bottiglia commerciali: le richieste arrivano come semplici email isolate senza instradamento automatico e senza tracciamento strutturato della trattativa.`,
          ];

      // DIRETTIVA 5 & 6: Generazione sequenza multi-step (4 touchpoints)
      const outreach = buildMultiStepOutreach({
        slug,
        companyName,
        decisionMaker,
        isGenericInbox,
        estimatedMobileLcpSeconds,
        renderBlockingScripts,
        runsAds,
      });

      const resolvedDecisionMakerLabel =
        decisionMaker.fullName || `Titolare ${companyName}`;

      try {
        fs.mkdirSync(/*turbopackIgnore: true*/ outDir, { recursive: true });
        fs.writeFileSync(
          /*turbopackIgnore: true*/ path.join(outDir, "preflight.json"),
          JSON.stringify(
            {
              slug,
              targetUrl,
              searchKeyword: keyword,
              measuredResponseMs: ttfbMs,
              renderBlockingScripts,
              estimatedMobileLcpSeconds,
              runsAds,
              detectedTrackingSignals: adTracking.signals,
              decisionMaker,
              emailSelection,
              extractedEmails: orderedRawEmails,
              extractedPhones: phones,
              extractedVat: piva,
            },
            null,
            2
          ),
          "utf-8"
        );
      } catch {
        // Ignora su Vercel read-only
      }

      const defaultPrimaryHex = isMedical
        ? "#0F766E"
        : isB2B
        ? "#0B1E36"
        : "#1E3A8A";
      const resolvedPrimaryHex =
        logoAnalysis?.dominantColor && !isMedical
          ? logoAnalysis.dominantColor
          : defaultPrimaryHex;

      const leadConfig: LeadConfig = {
        slug,
        archetype,
        meta: {
          companyName,
          decisionMakerName: resolvedDecisionMakerLabel,
          decisionMakerFirstName: decisionMaker.firstName,
          decisionMakerRole: decisionMaker.role,
          isGenericInbox,
          emailScore: emailSelection.score,
          targetEmail,
          phone,
          city,
          vatNumber: piva,
          adLibraryUrl:
            cand.candidateAdLibraryUrl ||
            `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IT&q=${encodeURIComponent(
              companyName
            )}`,
          originalLandingUrl: targetUrl,
          status: "NEW",
        },
        audit: {
          originalLcpSeconds: estimatedMobileLcpSeconds,
          mobileScore: realMobileScore,
          renderBlockingCount: renderBlockingScripts,
          runsAds,
          detectedTrackingSignals: adTracking.signals,
          threeCriticalFlaws,
          activeAdHeadline: heroHeadline,
          activeAdCopySummary:
            heroSubheadline.slice(0, 140) +
            (heroSubheadline.length > 140 ? "..." : ""),
        },
        theme: {
          primaryHex: resolvedPrimaryHex,
          accentHex: isMedical
            ? "#0D9488"
            : isB2B
            ? "#B8860B"
            : "#2563EB",
          darkBgHex: "#0B1E36",
          borderRadius: isB2B ? "8px" : "12px",
          headerBgMode: "light",
          logoBrightness: logoAnalysis?.hasWhiteElements ? "light" : "dark",
        },
        content: verticalContent,
        outreach,
      };

      saveLeadConfig(slug, leadConfig);

      discovered.push({
        slug,
        companyName,
        decisionMakerName: resolvedDecisionMakerLabel,
        targetEmail,
        isGenericInbox,
        runsAds,
        city,
        lcp: estimatedMobileLcpSeconds,
        demoUrl: `/demo/${slug}`,
      });
    } catch {
      continue;
    }
  }

  return {
    success: true,
    discovered,
  };
}

export async function scoutBusinessesViaHttp(
  arg: string | { keyword: string; maxLeads?: number; preferAdLibrary?: boolean },
  maxLeadsFallback = 5
) {
  if (typeof arg === "string") {
    return runAutonomousScout(arg, maxLeadsFallback);
  }
  return runAutonomousScout(arg.keyword, arg.maxLeads || maxLeadsFallback, {
    preferAdLibrary: arg.preferAdLibrary,
  });
}
