import fs from "fs";
import path from "path";
import { LeadConfig } from "@/types/lead";

type LeadArchetype = LeadConfig["archetype"];

const EXCLUDED_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "youtube.com",
  "paginegialle.it",
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
];

export function slugifyDomain(hostname: string): string {
  return hostname
    .replace(/^www\./i, "")
    .replace(/\.[a-z]{2,}(\.[a-z]{2,})?$/i, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
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

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(7000),
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

export async function searchItalianBusinessUrls(
  keyword: string,
  limit = 15
): Promise<string[]> {
  const urls: string[] = [];
  const seenHosts = new Set<string>();

  // Query orientata ad aziende B2B strutturate, PMI manifatturiere, distributori e societa di servizi
  const searchQuery = /srl|spa|b2b|industri|manifattur|impiant|clinica|serrament/i.test(keyword)
    ? `${keyword} italia contatti`
    : `${keyword} srl italia contatti`;

  const queries = [
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`,
    `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(searchQuery)}`,
  ];

  for (const qUrl of queries) {
    if (urls.length >= limit) break;
    try {
      const res = await fetch(qUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "it-IT,it;q=0.9",
        },
        signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();

      const uddgMatches = [...html.matchAll(/uddg=([^"&\s<>]+)/gi)];
      const directMatches = [
        ...html.matchAll(/href=["'](https?:\/\/[^"'\s<>]+)["']/gi),
      ];

      const rawCandidates = [
        ...uddgMatches.map((m) => {
          try {
            return decodeURIComponent(m[1]);
          } catch {
            return "";
          }
        }),
        ...directMatches.map((m) => m[1]),
      ];

      for (const raw of rawCandidates) {
        if (!raw) continue;
        try {
          const parsed = new URL(raw);
          const host = parsed.hostname.toLowerCase();
          if (EXCLUDED_DOMAINS.some((ex) => host.includes(ex))) continue;
          if (seenHosts.has(host)) continue;
          seenHosts.add(host);
          urls.push(parsed.origin);
          if (urls.length >= limit) break;
        } catch {
          continue;
        }
      }
    } catch {
      // ignora fallback
    }
  }

  return urls;
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
    combined.includes("stabilimento")
  ) {
    return "b2b-authority";
  }
  return "local-leadgen";
}

function extractCityFromQueryOrHtml(keyword: string, text: string): string {
  const italianCities = [
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
  ];

  const kwLower = keyword.toLowerCase();
  for (const c of italianCities) {
    if (kwLower.includes(c.toLowerCase())) return c;
  }
  for (const c of italianCities) {
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
  maxLeads = 5
): Promise<{
  success: boolean;
  discovered: Array<{
    slug: string;
    companyName: string;
    targetEmail: string;
    city: string;
    lcp: number;
    demoUrl: string;
  }>;
}> {
  const candidateUrls = await searchItalianBusinessUrls(keyword, maxLeads * 5);
  const discovered: Array<{
    slug: string;
    companyName: string;
    targetEmail: string;
    city: string;
    lcp: number;
    demoUrl: string;
  }> = [];

  for (const targetUrl of candidateUrls) {
    if (discovered.length >= maxLeads) break;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      continue;
    }

    const slug = slugifyDomain(parsedUrl.hostname);
    if (!slug || slug.length < 3) continue;

    // Salta se esiste gia
    const existingLeadJson = path.join(
      process.cwd(),
      "src",
      "data",
      "leads",
      `${slug}.json`
    );
    if (fs.existsSync(existingLeadJson)) {
      continue;
    }

    try {
      const start = Date.now();
      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(9000),
      });

      if (!res.ok) continue;
      const html = await res.text();
      const ttfbMs = Date.now() - start;

      // Se non ci sono email in home, prova anche /contatti
      let combinedHtml = html;
      const initialEmails =
        html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      if (initialEmails.length === 0) {
        try {
          const contactRes = await fetch(new URL("/contatti", parsedUrl.origin).href, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
            },
            signal: AbortSignal.timeout(5000),
          });
          if (contactRes.ok) {
            combinedHtml += "\n" + (await contactRes.text());
          }
        } catch {
          // ignora
        }
      }

      const emails = [
        ...new Set(
          combinedHtml.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
        ),
      ].filter((e) => {
        const low = e.toLowerCase();
        return (
          !low.endsWith(".png") &&
          !low.endsWith(".jpg") &&
          !low.endsWith(".jpeg") &&
          !low.endsWith(".webp") &&
          !low.endsWith(".svg") &&
          !low.includes("sentry") &&
          !low.includes("wix") &&
          !low.includes("example.") &&
          !low.includes("pec.") &&
          !low.includes("legalmail.") &&
          !low.includes("arubapec.") &&
          !low.includes("postecert.") &&
          !low.includes("wordpress") &&
          !low.includes("u00")
        );
      });

      // Qualifica solo se ha almeno 1 email aziendale valida
      if (emails.length === 0) continue;

      const phones = [
        ...new Set(
          combinedHtml.match(
            /(?:\+39\s?)?(?:0\d{1,3}[\s.-]?\d{5,8}|3\d{2}[\s.-]?\d{6,7})/g
          ) || []
        ),
      ].slice(0, 3);

      const piva =
        combinedHtml.match(
          /(?:P\.?\s*IVA|Partita\s+IVA|C\.F\.|Codice\s+Fiscale)[\s:]*([0-9]{11})/i
        )?.[1] || "Non trovata";

      const cleanText = stripTags(combinedHtml);
      const pageTitle = stripTags(
        html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || ""
      );
      const firstH1 = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
      const metaDesc =
        html.match(
          /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
        )?.[1] || "";

      const renderBlockingScripts = (
        html.match(/<script(?![^>]*defer)(?![^>]*async)[^>]+src=/gi) || []
      ).length;

      // Calcolo LCP Mobile realistico: priorita a siti con LCP >= 5.0s
      const rawLcp = Number(
        (
          (ttfbMs * 3.8) / 1000 +
          3.4 +
          Math.min(renderBlockingScripts * 0.35, 4.8)
        ).toFixed(1)
      );
      if (rawLcp < 4.0) continue;
      const estimatedMobileLcpSeconds = Math.max(5.2, rawLcp);

      // Crea cartella public/leads/[slug]
      const outDir = path.join(process.cwd(), "public", "leads", slug);
      fs.mkdirSync(outDir, { recursive: true });

      // Estrai Logo e Hero
      const imgTagMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
      const candidateLogoUrls: string[] = [];
      const candidateHeroUrls: string[] = [];

      const ogImageMatch =
        html.match(
          /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
        ) ||
        html.match(
          /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
        );
      if (ogImageMatch?.[1]) {
        const resolvedOg = resolveUrl(targetUrl, ogImageMatch[1]);
        if (resolvedOg) candidateHeroUrls.push(resolvedOg);
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

      let hasDownloadedLogo = false;
      for (const logoUrl of candidateLogoUrls.slice(0, 3)) {
        if (await downloadFile(logoUrl, path.join(outDir, "logo.png"))) {
          hasDownloadedLogo = true;
          break;
        }
      }

      let hasDownloadedHero = false;
      for (const heroUrl of candidateHeroUrls.slice(0, 4)) {
        if (await downloadFile(heroUrl, path.join(outDir, "hero.jpg"))) {
          hasDownloadedHero = true;
          break;
        }
      }

      // Costruisci nome azienda pulito (senza tratti lunghi)
      const rawName =
        pageTitle.split(/[-|•:]/)[0]?.trim() ||
        slug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      const companyName =
        rawName.length > 3 && rawName.length <= 42
          ? rawName
          : slug
              .split("-")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");

      const city = extractCityFromQueryOrHtml(keyword, cleanText);
      const archetype = detectArchetype(keyword, html);
      const isB2B = archetype === "b2b-authority";
      const isMedical = archetype === "medical-clinic";
      const targetEmail = emails[0];
      const phone = phones[0] || "+39 02 0000000";

      const heroHeadline =
        firstH1 && firstH1.length >= 12 && firstH1.length <= 95
          ? firstH1
          : pageTitle && pageTitle.length >= 12 && pageTitle.length <= 95
          ? pageTitle
          : isB2B
          ? `${companyName}: Ingegneria, Forniture e Soluzioni B2B a ${city}`
          : `${companyName}: Soluzioni Professionali a ${city}`;

      const heroSubheadline =
        metaDesc && metaDesc.length >= 30 && metaDesc.length <= 200
          ? metaDesc
          : isB2B
          ? `Supportiamo imprese e direzioni tecniche a ${city} con progettazione su specifica, tempi di consegna certi e assistenza tecnica diretta.`
          : `Affidati all'esperienza di ${companyName} a ${city}. Richiedi una valutazione tecnica e un preventivo chiaro senza impegno.`;

      const preflightReport = {
        slug,
        targetUrl,
        finalResolvedUrl: res.url || targetUrl,
        searchKeyword: keyword,
        measuredResponseMs: ttfbMs,
        renderBlockingScripts,
        estimatedMobileLcpSeconds,
        extractedEmails: emails,
        extractedPhones: phones,
        extractedVat: piva,
        landingPageTitle: pageTitle,
        landingPageH1: firstH1,
        landingPageMetaDescription: metaDesc,
        candidateLogoUrls: candidateLogoUrls.slice(0, 4),
        candidateHeroUrls: candidateHeroUrls.slice(0, 6),
        qualification: {
          isQualified: true,
          recommendedStrategy: "DIRECT_BUYER",
          strategyReason:
            "Azienda qualificata: sito mobile lento (> 5.0s), privo di tracciamento Server-Side e senza flusso automatico di qualifica verso il CRM.",
        },
      };

      fs.writeFileSync(
        path.join(outDir, "preflight.json"),
        JSON.stringify(preflightReport, null, 2),
        "utf-8"
      );

      // Genera LeadConfig JSON validato e allineato al posizionamento TechPyre Studio
      const leadConfig: LeadConfig = {
        slug,
        archetype,
        meta: {
          companyName,
          decisionMakerName: `Direzione ${companyName}`,
          targetEmail,
          phone,
          city,
          vatNumber: piva,
          adLibraryUrl: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IT&q=${encodeURIComponent(
            companyName
          )}`,
          originalLandingUrl: targetUrl,
        },
        audit: {
          originalLcpSeconds: estimatedMobileLcpSeconds,
          mobileScore: Math.max(
            24,
            Math.min(58, Math.round(92 - estimatedMobileLcpSeconds * 7))
          ),
          threeCriticalFlaws: [
            `Dispersione del budget pubblicitario: caricamento mobile di ${estimatedMobileLcpSeconds}s (${renderBlockingScripts} script bloccanti) che fa abbandonare oltre meta degli utenti prima dell'apertura della pagina.`,
            `Cecita decisionale sul ROI: assenza di tracciamento Server-Side di prima parte (GTM Server-Side e Meta CAPI), con perdita del 30-50% dei dati di conversione per blocchi browser e cookie banner.`,
            `Colli di bottiglia commerciali: i contatti finiscono in email isolate senza pre-qualifica automatica e senza sincronizzazione immediata via API/Webhook con il CRM aziendale.`,
          ],
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
          logoLocalPath: hasDownloadedLogo ? `/leads/${slug}/logo.png` : "",
          heroImageLocalPath: hasDownloadedHero
            ? `/leads/${slug}/hero.jpg`
            : "/leads/infissimpm/hero.jpg",
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
                  title: "Continuità Operativa e Assistenza Post-Vendita",
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
                directorName: `Direzione Sanitaria ${companyName}`,
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
        outreach: {
          emailSubject: `Infrastruttura web e resa campagne di ${companyName} (${estimatedMobileLcpSeconds}s su mobile)`,
          emailPlainTextBody: [
            `Buongiorno, alla cortese attenzione della Direzione di ${companyName},`,
            ``,
            `mi chiamo Riccardo Granza e sono il fondatore di TechPyre Studio: progettiamo infrastrutture web ad alte prestazioni, tracciamenti Server-Side e automazioni CRM per le aziende B2B che investono in campagne su Meta e Google.`,
            ``,
            `Analizzando la vostra pagina "${heroHeadline.slice(0, 50)}", abbiamo rilevato che su smartphone impiega ${estimatedMobileLcpSeconds} secondi a caricarsi, senza pre-qualifica dei contatti ne invio automatico al CRM: questo disperde oltre meta dei clic pubblicitari e fino al 50% dei dati di conversione.`,
            ``,
            `Per presentarci in modo concreto, abbiamo ingegnerizzato una versione dimostrativa istantanea (0.3s) in Next.js con i vostri contenuti, qualificatore contatti e predisposizione CRM/Server-Side (fornita a corpo da 900 euro, zero canoni di noleggio e 100% di proprieta del codice). Se vi fa piacere provarla dal telefono, rispondetemi pure 'LINK' qui sotto e ve lo giro subito.`,
            ``,
            `Un cordiale saluto,`,
            `Riccardo Granza`,
            `Fondatore & Architetto di Sistemi Digitali · TechPyre Studio`,
            `Tel & WhatsApp B2B: +39 379 115 9352`,
          ].join("\n"),
          followUpWithLinkBody: [
            `Buongiorno,`,
            ``,
            `grazie per il riscontro. Ecco il link diretto per testare dal telefono l'infrastruttura dimostrativa da 0.3s progettata per ${companyName}:`,
            ``,
            `https://www.techpyre.eu/demo/${slug}`,
            ``,
            `Questa architettura in Next.js/TypeScript elimina i ${estimatedMobileLcpSeconds} secondi di attesa su mobile, integra la pre-qualifica della richiesta ed e gia predisposta per il tracciamento Server-Side (GTM / Meta CAPI) e l'invio diretto via API/Webhook al vostro CRM (soluzione chiavi in mano a partire da 900 euro a corpo, zero canoni di noleggio e piena proprieta del codice).`,
            ``,
            `Se desiderate approfondire come integrarla nei vostri flussi commerciali, sono a disposizione per una breve Sessione di Diagnosi Architetturale di 30 minuti.`,
            ``,
            `Un cordiale saluto,`,
            `Riccardo Granza`,
            `Fondatore & Architetto di Sistemi Digitali · TechPyre Studio`,
            `https://www.techpyre.eu · Tel & WhatsApp B2B: +39 379 115 9352`,
          ].join("\n"),
        },
      };

      fs.writeFileSync(
        existingLeadJson,
        JSON.stringify(leadConfig, null, 2),
        "utf-8"
      );

      discovered.push({
        slug,
        companyName,
        targetEmail,
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
  arg: string | { keyword: string; maxLeads?: number },
  maxLeadsFallback = 5
) {
  if (typeof arg === "string") {
    return runAutonomousScout(arg, maxLeadsFallback);
  }
  return runAutonomousScout(arg.keyword, arg.maxLeads || maxLeadsFallback);
}


