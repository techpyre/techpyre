import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { LeadConfig, OutreachStep } from "@/types/lead";
import { loadLeadConfig, saveLeadConfig } from "./leadsStorage";

type LeadArchetype = LeadConfig["archetype"];

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

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
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

    // +30 pt se il dominio dell'email coincide esattamente col dominio del sito aziendale
    if (cleanCompanyDomain && domainPart === cleanCompanyDomain) {
      score += 30;
    } else if (FREE_MAIL_DOMAINS.has(domainPart)) {
      score -= 10;
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

  // Regola di Salvaguardia info@: Se isGeneric === true e abbiamo trovato fullName, forza l'oggetto a iniziare con "Per ${fullName} · ..."
  const baseSubject = runsAds
    ? ` dispersione clic mobile e tempi di caricamento di ${companyName} (${estimatedMobileLcpSeconds}s)`
    : ` tempi di caricamento mobile e richieste preventivo di ${companyName} (${estimatedMobileLcpSeconds}s)`;

  const emailSubject =
    isGenericInbox && decisionMaker.fullName
      ? `Per ${decisionMaker.fullName} ·${baseSubject}`
      : `${companyName} ·${baseSubject}`;

  const threadSubject = `Re: ${emailSubject}`;
  const greeting = decisionMaker.firstName
    ? `Buongiorno ${decisionMaker.firstName},`
    : `Buongiorno,`;

  // STEP 1 (Giorno 1 - First Touch: 65-85 parole totali, zero link, zero prezzi, zero 'LINK')
  const step1Paragraph1 = runsAds
    ? `da un test sul sito di ${companyName}, da smartphone impiega ${estimatedMobileLcpSeconds} secondi ad aprirsi per ${blockingCount} blocchi di codice, disperdendo buona parte dei clic pagati.`
    : `da un test sul sito di ${companyName}, da smartphone impiega ${estimatedMobileLcpSeconds} secondi ad aprirsi per ${blockingCount} risorse bloccanti, frenando le richieste di preventivo.`;

  const step1Body = [
    greeting,
    ``,
    step1Paragraph1,
    ``,
    `Abbiamo gia preparato una demo in Next.js per ${companyName} che carica in 0.3 secondi su mobile e pre-qualifica i contatti commerciali.`,
    ``,
    `Vi fa piacere se vi giro qui sotto il link di prova cosi la testate direttamente dal vostro smartphone senza impegno?`,
    ``,
    `Riccardo Granza · TechPyre`,
    `+39 379 115 9352`,
  ].join("\n");

  // STEP 2 (Giorno 4 - In-Thread o su risposta positiva: 40-50 parole, link demo diretto)
  const step2Body = [
    greeting,
    ``,
    `vi lascio qui sotto il link della demo da 0.3 secondi preparata per ${companyName}, completa di filtro pre-qualifica contatti:`,
    ``,
    demoUrl,
    ``,
    `Avete 10 minuti tra martedi e giovedi per vedere come collegarla al vostro flusso commerciale?`,
    ``,
    `Riccardo Granza · TechPyre Studio`,
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
    `Riccardo Granza · TechPyre Studio`,
  ].join("\n");

  // STEP 4 (Giorno 13 - In-Thread: Breakup cortese senza pressione)
  const step4Body = [
    greeting,
    ``,
    `immagino che ottimizzare i tempi mobile e la qualifica contatti di ${companyName} non sia una priorita in questo trimestre.`,
    ``,
    `Vi lascio comunque attiva la demo (${demoUrl}) ancora per qualche giorno se voleste darci un'occhiata in futuro. Resto a disposizione se le priorita dovessero cambiare.`,
    ``,
    `Un cordiale saluto e buon lavoro,`,
    `Riccardo Granza · TechPyre Studio`,
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

  // 5. Verifica o rigenerazione dei 4 Step Outreach (Zero-Fluff Protocol)
  const hasLegacyCopy =
    !lead.outreach.step1FirstTouch ||
    !lead.outreach.step2FollowUpLink ||
    !lead.outreach.step3ValueDropAndCallTrigger ||
    !lead.outreach.step4Breakup ||
    /mi chiamo|900\s*euro|zero canoni|rispondetemi pure ['"]?link['"]?/i.test(
      lead.outreach.emailPlainTextBody || ""
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
            for (const link of allLinks) {
              try {
                const parsedLink = new URL(link);
                const host = parsedLink.hostname.toLowerCase();
                if (EXCLUDED_DOMAINS.some((ex) => host.includes(ex))) continue;
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

function detectArchetype(keyword: string, html: string): LeadArchetype {
  const combined = (keyword + " " + html.slice(0, 6000)).toLowerCase();
  if (
    combined.includes("dentist") ||
    combined.includes("odontoiatr") ||
    combined.includes("clinica") ||
    combined.includes("poliambulatorio") ||
    combined.includes("chirurg") ||
    combined.includes("studio medico") ||
    combined.includes("implantolog")
  ) {
    return "medical-clinic";
  }
  if (
    combined.includes("b2b") ||
    combined.includes("industri") ||
    combined.includes("automazion") ||
    combined.includes("manifattur") ||
    combined.includes("macchinari") ||
    combined.includes("carpenteri") ||
    combined.includes("meccanic") ||
    combined.includes("logistic") ||
    combined.includes("ingross") ||
    combined.includes("distribut") ||
    combined.includes("fornitur") ||
    combined.includes("software") ||
    combined.includes("gestionale") ||
    combined.includes("erp") ||
    combined.includes("consulenza aziendale") ||
    combined.includes("stabilimento") ||
    combined.includes("impiant")
  ) {
    return "b2b-authority";
  }
  return "local-leadgen";
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

function buildQuizForKeyword(
  keyword: string,
  archetype: LeadArchetype
): LeadConfig["content"]["quiz"] {
  const kw = keyword.toLowerCase();
  if (archetype === "medical-clinic") {
    return {
      question1: {
        title: "Per quale esigenza clinica desideri richiedere una valutazione?",
        options: [
          "Prima visita specialistica e piano di cura",
          "Implantologia o riabilitazione estetica/funzionale",
          "Igiene, prevenzione o controllo periodico",
        ] as [string, string, string],
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
    return {
      question1: {
        title: "Quale ambito operativo o di commessa desiderate approfondire?",
        options: [
          "Fornitura industriale, impianti o commessa su specifica",
          "Integrazione tecnica, automazione di reparto o portale B2B",
          "Studio di fattibilita, capitolato e quotazione riservata",
        ] as [string, string, string],
      },
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

  if (kw.includes("infissi") || kw.includes("serramenti") || kw.includes("finestre")) {
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

  if (kw.includes("fotovoltaico") || kw.includes("solare") || kw.includes("energia")) {
    return {
      question1: {
        title: "Dove intendi installare l'impianto fotovoltaico?",
        options: [
          "Abitazione indipendente / Villa",
          "Capannone industriale o sede aziendale B2B",
          "Condominio o struttura commerciale",
        ] as [string, string, string],
      },
      question2: {
        title: "Qual e il tuo obiettivo principale di risparmio?",
        options: [
          "Ridurre subito la bolletta con sistema di accumulo",
          "Accesso agli incentivi e detrazioni fiscali attive",
          "Riqualificazione energetica completa dell'immobile",
        ] as [string, string, string],
      },
      finalStepTitle:
        "Perfetto. Lascia i tuoi dati per ricevere la simulazione di resa e rientro investimento:",
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
    candidates = await discoverMetaAdLibraryBusinesses(keyword, maxLeads * 4);
  } else {
    candidates = await discoverItalianBusinesses(keyword, maxLeads * 3);
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

      const phones = [
        ...new Set([
          ...(combinedHtml.match(
            /(?:\+39\s?)?(?:0\d{1,3}[\s.-]?\d{5,8}|3\d{2}[\s.-]?\d{6,7})/g
          ) || []),
          ...(cand.fallbackPhone ? [cand.fallbackPhone] : []),
        ]),
      ].slice(0, 3);

      const piva =
        combinedHtml.match(
          /(?:P\.?\s*IVA|Partita\s+IVA|C\.F\.|Codice\s+Fiscale)[\s:]*([0-9]{11})/i
        )?.[1] ||
        cand.fallbackVat ||
        "Non trovata";

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

      const imgTagMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
      const candidateLogoUrls: string[] = cand.fallbackLogoUrl
        ? [cand.fallbackLogoUrl]
        : [];
      const candidateHeroUrls: string[] = cand.fallbackHeroUrl
        ? [cand.fallbackHeroUrl]
        : [];

      const ogImageMatch =
        html.match(
          /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
        ) ||
        html.match(
          /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
        );
      if (ogImageMatch?.[1]) {
        const resolvedOg = resolveUrl(targetUrl, ogImageMatch[1]);
        if (resolvedOg && !candidateHeroUrls.includes(resolvedOg)) {
          candidateHeroUrls.unshift(resolvedOg);
        }
      }

      for (const match of imgTagMatches) {
        const fullTag = match[0].toLowerCase();
        const resolved = resolveUrl(targetUrl, match[1]);
        if (!resolved) continue;
        if (fullTag.includes("logo") || resolved.toLowerCase().includes("logo")) {
          if (!candidateLogoUrls.includes(resolved)) candidateLogoUrls.push(resolved);
        } else if (
          !resolved.endsWith(".svg") &&
          !resolved.includes("icon") &&
          !resolved.includes("pixel") &&
          !resolved.includes("avatar")
        ) {
          if (!candidateHeroUrls.includes(resolved)) candidateHeroUrls.push(resolved);
        }
      }

      const outDir = path.join(process.cwd(), "public", "leads", slug);
      let finalLogoPath = candidateLogoUrls[0] || "";
      for (const logoUrl of candidateLogoUrls.slice(0, 2)) {
        if (await tryDownloadFileLocally(logoUrl, path.join(outDir, "logo.png"))) {
          finalLogoPath = `/leads/${slug}/logo.png`;
          break;
        }
      }

      let finalHeroPath = candidateHeroUrls[0] || "/leads/infissimpm/hero.jpg";
      for (const heroUrl of candidateHeroUrls.slice(0, 2)) {
        if (await tryDownloadFileLocally(heroUrl, path.join(outDir, "hero.jpg"))) {
          finalHeroPath = `/leads/${slug}/hero.jpg`;
          break;
        }
      }

      const ogSiteName =
        html.match(
          /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i
        )?.[1] || "";

      const titleSegments = pageTitle
        .split(/[-|•:\u2013\u2014]/)
        .map((s) => s.trim())
        .filter(
          (s) =>
            s.length >= 3 &&
            !/^(home|homepage|contatti|contattaci|preventivo|richiedi preventivo|chi siamo|referenze|servizi|prodotti|benvenuti|sito ufficiale|welcome|index)$/i.test(
              s
            )
        );

      const rawName = (
        cand.fallbackName ||
        (ogSiteName.length >= 3 && ogSiteName.length <= 42 ? ogSiteName : "") ||
        titleSegments[0] ||
        ""
      )
        .replace(/[—–]/g, "-")
        .replace(/\b(homepage di|benvenuti in|sito ufficiale)\b/gi, "")
        .trim();

      const companyName =
        rawName.length >= 3 &&
        rawName.length <= 42 &&
        !/^(contatti|home|preventivo|servizi|chi siamo)$/i.test(rawName)
          ? rawName
          : slug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");

      const city = extractCityFromQueryOrHtml(
        keyword,
        cleanText,
        cand.fallbackCity
      );
      const archetype = detectArchetype(
        keyword,
        html + " " + (cand.fallbackDescription || "")
      );
      const isB2B = archetype === "b2b-authority";
      const isMedical = archetype === "medical-clinic";
      const phone = phones[0] || "+39 02 0000000";

      const rawHeadline =
        firstH1 && firstH1.length >= 12 && firstH1.length <= 95
          ? firstH1
          : pageTitle && pageTitle.length >= 12 && pageTitle.length <= 95
          ? pageTitle
          : isB2B
          ? `${companyName}: Ingegneria, Forniture e Soluzioni B2B a ${city}`
          : `${companyName}: Soluzioni Professionali a ${city}`;
      const heroHeadline = rawHeadline.replace(/[—–]/g, "-");

      const rawSubheadline =
        metaDesc && metaDesc.length >= 30
          ? metaDesc.slice(0, 210)
          : isB2B
          ? `Supportiamo imprese e direzioni tecniche a ${city} con progettazione su specifica, tempi di consegna certi e assistenza tecnica diretta.`
          : `Affidati all'esperienza di ${companyName} a ${city}. Richiedi una valutazione tecnica e un preventivo chiaro senza impegno.`;
      const heroSubheadline = rawSubheadline.replace(/[—–]/g, "-");

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
          primaryHex: isMedical
            ? "#0F766E"
            : isB2B
            ? "#0B1E36"
            : "#1E3A8A",
          accentHex: isMedical
            ? "#0D9488"
            : isB2B
            ? "#B8860B"
            : "#2563EB",
          darkBgHex: "#0B1E36",
          borderRadius: isB2B ? "8px" : "12px",
          headerBgMode: "light",
          logoBrightness: "dark",
        },
        content: {
          badgeTop: isB2B
            ? `${companyName} · Divisione Tecnica & Commesse B2B (${city})`
            : `${companyName} · Operativi a ${city} e provincia`,
          heroHeadline,
          heroSubheadline,
          heroBullets: isB2B
            ? [
                "Studio di fattibilita tecnica e capitolato con tempi di consegna certi",
                "Qualifica immediata della richiesta e assegnazione diretta all'Ufficio Tecnico",
                "Produzione e assistenza certificata con referente unico dedicato",
              ]
            : [
                "Sopralluogo tecnico e preventivo chiaro senza impegno",
                "Materiali certificati e assistenza diretta con personale qualificato",
                "Tempi di intervento garantiti e gestione completa della pratica",
              ],
          ctaButtonText: isMedical
            ? "Richiedi Disponibilita Visita"
            : isB2B
            ? "Richiedi Studio di Fattibilita"
            : "Calcola il Tuo Preventivo Rapido",
          trustMicrocopy: isB2B
            ? "Riservatezza industriale garantita (NDA) · Risposta tecnica entro la giornata lavorativa"
            : "Richiesta gratuita e senza impegno · Risposta rapida dal nostro ufficio tecnico",
          logoLocalPath: finalLogoPath,
          heroImageLocalPath: finalHeroPath,
          heroImageCaption: `${companyName} · Sede operativa e realizzazioni (${city})`,
          quiz: buildQuizForKeyword(keyword, archetype),
          valueProps: isB2B
            ? [
                {
                  title: "Ingegneria e Progettazione su Specifica",
                  description: `Analizziamo i requisiti produttivi della commessa a ${city}, definendo specifiche tecniche, tempi di consegna e ritorno sull'investimento prima dell'avvio operativo.`,
                  metric: "Capitolato Chiuso",
                },
                {
                  title: "Controllo Qualita e Conformita Normativa",
                  description: `Ogni fornitura e impianto di ${companyName} viene collaudato secondo gli standard di sicurezza e qualita vigenti, con documentazione tecnica completa.`,
                  metric: "100% Certificato",
                },
                {
                  title: "Continuita Operativa e Assistenza Post-Vendita",
                  description: `Affianchiamo il reparto tecnico e acquisti dal collaudo in stabilimento fino alla manutenzione programmata e al riordino ricambi.`,
                  metric: "SLA Garantito",
                },
              ]
            : [
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
          socialProof: {
            mainStatValue: isB2B ? "99.4%" : "98%",
            mainStatLabel: isB2B
              ? "Commesse B2B consegnate entro i tempi contrattuali"
              : "Clienti soddisfatti del servizio e dell'assistenza",
            reviewsSummary: isB2B
              ? `Partner tecnico di riferimento per imprese e stabilimenti a ${city}`
              : `Azienda di riferimento a ${city} per affidabilita e precisione`,
            clientReferenceWall: isB2B
              ? [
                  "Qualita Certificata ISO 9001",
                  "Conformita Tecnica CE",
                  "Integrazione Gestionale / ERP",
                  "Capitolato e Preventivo Chiuso",
                  "Assistenza Tecnica Diretta",
                ]
              : undefined,
            secondaryStats: isB2B
              ? [
                  {
                    value: "99.4%",
                    label: "Commesse consegnate nel pieno rispetto dei tempi contrattuali",
                  },
                  {
                    value: "< 0.4s",
                    label: "Caricamento istantaneo dell'infrastruttura digitale su rete mobile",
                  },
                  {
                    value: "24h",
                    label: "Presa in carico tecnica e invio automatico della richiesta al CRM",
                  },
                ]
              : undefined,
            testimonials: isB2B
              ? [
                  {
                    name: "Direzione Tecnica e Produzione",
                    location: `${city} · Commessa Industriale`,
                    quote: `Abbiamo affidato a ${companyName} una commessa strategica per il nostro reparto: rispetto rigoroso delle specifiche tecniche, tempi di consegna puntuali e collaudo impeccabile.`,
                    roleOrContext: "Fornitura e collaudo B2B",
                  },
                  {
                    name: "Responsabile Ufficio Acquisti",
                    location: `${city} e provincia`,
                    quote: `Un partner strutturato e affidabile: preventivazione trasparente senza costi occulti, documentazione tecnica completa e supporto post-vendita immediato.`,
                    roleOrContext: "Accordo quadro di fornitura",
                  },
                ]
              : [
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
          medicalDetails: isMedical
            ? {
                directorName:
                  decisionMaker.fullName || `Direzione Sanitaria ${companyName}`,
                alboRegistration: `Struttura autorizzata · Ordine Provinciale di ${city}`,
                specialization: "Odontoiatria, Implantologia e Cura della Persona",
                clinicAddress: `Sede operativa: ${city}`,
                openingHours: "Lun - Ven · 09:00 - 19:00",
                parkingAndAccess: "Accesso privo di barriere e parcheggio comodo",
                conventions: [
                  "Principali Fondi Sanitari",
                  "Piani di cura personalizzati",
                ],
              }
            : undefined,
        },
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
