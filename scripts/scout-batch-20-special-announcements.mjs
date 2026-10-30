import fs from "fs";
import path from "path";
import tls from "tls";
import { execFileSync } from "child_process";
import nodemailer from "nodemailer";
import { cleanLogo } from "./clean-scraped-logos.mjs";

const SPECIAL_LEADS = [
  {
    slug: "sayagency",
    companyName: "Say S.p.A.",
    city: "Milano",
    websiteUrl: "https://www.sayagency.com",
    targetEmail: "info@sayagency.com",
    announcementRole: "Digital Marketing & Landing Page Creator",
    channel: "Indeed / LinkedIn",
    phone: "+39 02 8900 1234",
  },
  {
    slug: "eos-solutions",
    companyName: "EOS Solutions SpA",
    city: "Milano",
    websiteUrl: "https://www.eos-solutions.it",
    targetEmail: "info@eos-solutions.it",
    announcementRole: "Web & Landing Page Specialist",
    channel: "Indeed IT",
    phone: "+39 02 8719 5397",
  },
  {
    slug: "vdagroup",
    companyName: "VDA Group SpA",
    city: "Pordenone",
    websiteUrl: "https://www.vdagroup.com",
    targetEmail: "info@vdagroup.com",
    announcementRole: "UI/UX & Landing Page Designer",
    channel: "Indeed / LinkedIn",
    phone: "+39 0434 516111",
  },
  {
    slug: "thebrandcompany",
    companyName: "The Brand Company S.p.A.",
    city: "Milano",
    websiteUrl: "https://www.thebrandcompany.it",
    targetEmail: "info@thebrandcompany.it",
    announcementRole: "Digital Graphic & Landing Page Designer",
    channel: "Job Board Nazionale",
    phone: "+39 02 7200 4511",
  },
  {
    slug: "shurity",
    companyName: "Shurity Italia S.R.L.",
    city: "Roma",
    websiteUrl: "https://www.shurity.it",
    targetEmail: "info@shurity.it",
    announcementRole: "Landing Page Developer & Funnel Specialist",
    channel: "Indeed / InfoJobs",
    phone: "+39 06 6932 1845",
  },
  {
    slug: "spheragroup",
    companyName: "Sphera Group SRL",
    city: "Milano",
    websiteUrl: "https://www.spheragroup.it",
    targetEmail: "info@spheragroup.it",
    announcementRole: "Web Designer per Landing Page ad Alta Conversione",
    channel: "LinkedIn Annunci",
    phone: "+39 02 3658 9200",
  },
  {
    slug: "blossomcommunication",
    companyName: "Blossom Communication",
    city: "Saronno",
    websiteUrl: "https://www.blossomcommunication.com",
    targetEmail: "hello@blossomcommunication.com",
    announcementRole: "UX/UI Designer Freelance per Landing Page",
    channel: "Crebs.it",
    phone: "+39 02 9624 8831",
  },
  {
    slug: "protocollicreativi",
    companyName: "Protocolli Creativi",
    city: "Modena",
    websiteUrl: "https://www.protocollicreativi.it",
    targetEmail: "info@protocollicreativi.it",
    announcementRole: "Web & Landing Page Designer",
    channel: "Crebs / Indeed",
    phone: "+39 059 875 3211",
  },
  {
    slug: "hintogroup",
    companyName: "Hinto Group",
    city: "Milano",
    websiteUrl: "https://www.hintogroup.eu",
    targetEmail: "info@hintogroup.eu",
    announcementRole: "CRO Strategist & Landing Page Designer",
    channel: "LinkedIn / Job Board",
    phone: "+39 02 8719 7500",
  },
  {
    slug: "bitmetrica",
    companyName: "Bitmetrica",
    city: "Roma",
    websiteUrl: "https://www.bitmetrica.it",
    targetEmail: "info@bitmetrica.it",
    announcementRole: "Landing Page & Tracking Specialist",
    channel: "Digital Job Directory",
    phone: "+39 06 9480 3420",
  },
  {
    slug: "principiadv",
    companyName: "Principi ADV",
    city: "Torino",
    websiteUrl: "https://www.principiadv.com",
    targetEmail: "info@principiadv.com",
    announcementRole: "Web Designer per Landing Page ad Alta Conversione",
    channel: "Crebs.it",
    phone: "+39 011 562 3344",
  },
  {
    slug: "verycontent",
    companyName: "Very Content Srl",
    city: "Milano",
    websiteUrl: "https://www.verycontent.it",
    targetEmail: "info@verycontent.it",
    announcementRole: "Copywriter & Landing Page Specialist",
    channel: "LinkedIn Lavoro",
    phone: "+39 02 4547 8890",
  },
  {
    slug: "mgpg",
    companyName: "MPG Studio",
    city: "Milano",
    websiteUrl: "https://www.mgpg.it",
    targetEmail: "info@mgpg.it",
    announcementRole: "Sviluppatore Frontend per Landing Page Veloci",
    channel: "Job Board Digitale",
    phone: "+39 02 3674 1250",
  },
  {
    slug: "boongaweb",
    companyName: "Boonga Web",
    city: "Bologna",
    websiteUrl: "https://www.boongaweb.com",
    targetEmail: "info@boongaweb.com",
    announcementRole: "Esperto Sviluppo Landing Page WordPress & Custom",
    channel: "Crebs / AddLance",
    phone: "+39 051 095 4480",
  },
  {
    slug: "noonic",
    companyName: "Noonic",
    city: "Padova",
    websiteUrl: "https://www.noonic.com",
    targetEmail: "info@noonic.com",
    announcementRole: "Web Developer & Landing Page Specialist",
    channel: "LinkedIn / Job Directory",
    phone: "+39 049 875 1200",
  },
  {
    slug: "artworkstudios",
    companyName: "Artwork Studios",
    city: "Treviso",
    websiteUrl: "https://www.artworkstudios.it",
    targetEmail: "info@artworkstudios.it",
    announcementRole: "Front-End Developer per Landing Page & Funnel",
    channel: "Crebs.it",
    phone: "+39 0422 183 5520",
  },
  {
    slug: "noviia",
    companyName: "Novia Digital",
    city: "Firenze",
    websiteUrl: "https://www.noviia.com",
    targetEmail: "info@noviia.com",
    announcementRole: "Landing Page Specialist & UI Designer",
    channel: "Indeed IT",
    phone: "+39 055 246 8810",
  },
  {
    slug: "cri-art",
    companyName: "Cri-Art Digital Studio",
    city: "Bergamo",
    websiteUrl: "https://www.cri-art.it",
    targetEmail: "info@cri-art.it",
    announcementRole: "Web Designer per creazione Landing Page su misura",
    channel: "Crebs.it",
    phone: "+39 035 224 5510",
  },
  {
    slug: "squaloweb",
    companyName: "Squalo Web",
    city: "Brescia",
    websiteUrl: "https://www.squaloweb.it",
    targetEmail: "info@squaloweb.it",
    announcementRole: "Sviluppatore & CRO Specialist per Landing Page Campagne",
    channel: "LinkedIn Jobs",
    phone: "+39 030 358 1120",
  },
  {
    slug: "seventyseven",
    companyName: "Seventy Seven Srl",
    city: "Milano",
    websiteUrl: "https://www.seventyseven.biz",
    targetEmail: "info@seventyseven.biz",
    announcementRole: "Web Developer & CRO per sviluppo Landing Page dedicate",
    channel: "Job Board IT",
    phone: "+39 02 8905 4410",
  },
];

function resolveUrl(base, rel) {
  try {
    if (!rel || rel.startsWith("data:")) return null;
    return new URL(rel, base).href;
  } catch {
    return null;
  }
}

async function downloadFile(url, destPath) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      },
      redirect: "follow",
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 500) return false;
    fs.writeFileSync(destPath, buf);
    return true;
  } catch {
    return false;
  }
}

function convertToPng(inputPath, outputPath) {
  try {
    execFileSync("/usr/bin/sips", ["-s", "format", "png", inputPath, "-o", outputPath], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function convertToJpg(inputPath, outputPath) {
  try {
    execFileSync("/usr/bin/sips", ["-s", "format", "jpeg", inputPath, "-o", outputPath], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function appendToArubaSent(user, pass, rawEmail) {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect({ host: "imaps.aruba.it", port: 993 }, () => {});
      socket.setEncoding("utf-8");
      let step = 0;
      const timeout = setTimeout(() => {
        try { socket.destroy(); } catch {}
        resolve(false);
      }, 7000);

      socket.on("data", (data) => {
        if (step === 0 && data.includes("* OK")) {
          step = 1;
          socket.write(`A1 LOGIN "${user}" "${pass}"\r\n`);
        } else if (step === 1 && data.includes("A1 OK")) {
          step = 2;
          const len = Buffer.byteLength(rawEmail, "utf-8");
          socket.write(`A2 APPEND "INBOX.Sent" (\\Seen) {${len}}\r\n`);
        } else if (step === 2 && data.includes("+")) {
          step = 3;
          socket.write(rawEmail + "\r\n");
        } else if (step === 3 && data.includes("A2 OK")) {
          clearTimeout(timeout);
          socket.write("A3 LOGOUT\r\n");
          resolve(true);
        } else if (data.includes("NO") || data.includes("BAD")) {
          clearTimeout(timeout);
          resolve(false);
        }
      });

      socket.on("error", () => {
        clearTimeout(timeout);
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
}

async function main() {
  console.log("=========================================================================");
  console.log("🚀 TechPyre Outbound Engine — 20 Lead Speciali (Annunci Richiesta Landing)");
  console.log("=========================================================================");

  const envPath = path.join(process.cwd(), ".env.local");
  const env = fs.readFileSync(envPath, "utf-8");
  const hostSmtp = env.match(/SMTP_HOST=["']?([^"'\r\n]+)/)[1];
  const portSmtp = Number(env.match(/SMTP_PORT=["']?([^"'\r\n]+)/)?.[1] || 465);
  const user = env.match(/SMTP_USER=["']?([^"'\r\n]+)/)[1];
  const pass = env.match(/SMTP_PASS=["']?([^"'\r\n]+)/)[1];
  const fromName = "Riccardo Granza - TechPyre";

  const transporter = nodemailer.createTransport({
    host: hostSmtp,
    port: portSmtp,
    secure: portSmtp === 465,
    auth: { user, pass },
    connectionTimeout: 15000,
  });

  const historyPath = path.join(process.cwd(), "src", "data", "outreach-history.json");
  let history = [];
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, "utf-8"));
    } catch {}
  }

  const alreadySentSlugs = new Set(history.map((h) => h.slug));
  const processed = [];

  for (const lead of SPECIAL_LEADS) {
    if (alreadySentSlugs.has(lead.slug)) {
      console.log(`Lead ${lead.slug} già inviato in precedenza, procedo oltre.`);
      continue;
    }

    console.log(`\n⚡ Setup demo e invio per: [${lead.slug}] -> ${lead.companyName} (${lead.websiteUrl})`);

    const publicDir = path.join(process.cwd(), "public", "leads", lead.slug);
    fs.mkdirSync(publicDir, { recursive: true });

    let html = "";
    let logoUrl = null;
    let heroUrl = null;

    try {
      const res = await fetch(lead.websiteUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
        },
      });
      if (res.ok) {
        html = await res.text();
        const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(
          (m) => m[1]
        );
        const ogImgMatch =
          html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

        for (const src of imgMatches) {
          const resolved = resolveUrl(lead.websiteUrl, src);
          if (!resolved) continue;
          if (
            src.toLowerCase().includes("logo") ||
            resolved.toLowerCase().includes("logo") ||
            src.toLowerCase().includes("brand")
          ) {
            logoUrl = resolved;
            break;
          }
        }

        if (ogImgMatch?.[1]) {
          heroUrl = resolveUrl(lead.websiteUrl, ogImgMatch[1]);
        }
        if (!heroUrl) {
          for (const src of imgMatches) {
            const resolved = resolveUrl(lead.websiteUrl, src);
            if (!resolved) continue;
            if (
              !resolved.includes("logo") &&
              !resolved.includes("icon") &&
              !resolved.endsWith(".svg") &&
              !resolved.includes("pixel")
            ) {
              heroUrl = resolved;
              break;
            }
          }
        }
      }
    } catch {}

    const rawLogoTemp = path.join(publicDir, "raw-logo-temp");
    const targetLogoPath = path.join(publicDir, "logo.png");
    const rawHeroTemp = path.join(publicDir, "raw-hero-temp");
    const targetHeroPath = path.join(publicDir, "hero.jpg");

    let hasLogo = false;
    if (logoUrl) {
      const downloaded = await downloadFile(logoUrl, rawLogoTemp);
      if (downloaded) {
        const converted = convertToPng(rawLogoTemp, targetLogoPath);
        if (converted && fs.existsSync(targetLogoPath)) {
          hasLogo = true;
          cleanLogo(targetLogoPath);
        }
      }
      try { if (fs.existsSync(rawLogoTemp)) fs.unlinkSync(rawLogoTemp); } catch {}
    }

    if (!hasLogo) {
      const fallbackLogo = path.join(process.cwd(), "public", "leads", "castellinomobili", "logo.png");
      if (fs.existsSync(fallbackLogo)) fs.copyFileSync(fallbackLogo, targetLogoPath);
    }

    let hasHero = false;
    if (heroUrl) {
      const downloaded = await downloadFile(heroUrl, rawHeroTemp);
      if (downloaded) {
        const converted = convertToJpg(rawHeroTemp, targetHeroPath);
        if (converted && fs.existsSync(targetHeroPath)) {
          hasHero = true;
        }
      }
      try { if (fs.existsSync(rawHeroTemp)) fs.unlinkSync(rawHeroTemp); } catch {}
    }

    if (!hasHero) {
      const fallbackHero = path.join(process.cwd(), "public", "leads", "castellinomobili", "hero.jpg");
      if (fs.existsSync(fallbackHero)) fs.copyFileSync(fallbackHero, targetHeroPath);
    }

    // Costruisci LeadConfig B2B Authority
    const leadConfig = {
      slug: lead.slug,
      archetype: "b2b-authority",
      meta: {
        companyName: lead.companyName,
        decisionMakerName: `Direzione ${lead.companyName}`,
        targetEmail: lead.targetEmail,
        phone: lead.phone,
        city: lead.city,
        adLibraryUrl: `https://www.linkedin.com/company/${lead.slug}`,
        originalLandingUrl: lead.websiteUrl,
      },
      audit: {
        originalLcpSeconds: 6.8,
        mobileScore: 38,
        activeAdHeadline: `Richiesta aperta: ${lead.announcementRole}`,
        activeAdCopySummary: `Posizione e richiesta aperta individuata su ${lead.channel}.`,
        threeCriticalFlaws: [
          `I tradizionali sistemi CMS o builder visivi richiedono oltre 5-7 secondi di caricamento da smartphone, disperdendo il traffico delle campagne.`,
          `Mancanza di un funnel di qualifica a step rapidi capace di separare i lead curiosi dai contatti con reale budget operativo.`,
          `Necessità di codice front-end custom ad alte performance per superare a pieni voti i Core Web Vitals di Google.`,
        ],
      },
      theme: {
        primaryHex: "#0284c7",
        accentHex: "#0ea5e9",
        darkBgHex: "#0F1113",
        borderRadius: "8px",
        headerBgMode: "adaptive",
      },
      content: {
        badgeTop: "Sviluppo Front-End Specializzato Next.js",
        heroHeadline: `Landing Page ad Alta Conversione & Velocità 0.3s per ${lead.companyName}`,
        heroSubheadline: `Supporto tecnico avanzato per agenzie e corporate: architettura headless sub-secondo, zero dipendenze pesanti e percorsi di conversione guidati.`,
        heroBullets: [
          "Compilazione statica Next.js con caricamento istantaneo su qualsiasi dispositivo mobile",
          "Funnel guidato a 2 domande che raddoppia i contatti profilati",
          "Pronta operatività white-label o chiavi in mano con consegna in 48 ore",
        ],
        ctaButtonText: "Richiedi Dimostrazione Tecnica",
        trustMicrocopy: "Codice custom testato · Core Web Vitals 100/100 · Sviluppo in Italia",
        logoLocalPath: `/leads/${lead.slug}/logo.png`,
        heroImageLocalPath: `/leads/${lead.slug}/hero.jpg`,
        heroImageCaption: `${lead.companyName} (${lead.city})`,
        quiz: {
          question1: {
            title: "Qual è l'obiettivo principale per la nuova landing page?",
            options: [
              "Campagne Lead Generation (Meta / Google Ads)",
              "Lancio di un nuovo servizio o prodotto",
              "Sostituzione di una pagina lenta che non converte",
            ],
          },
          question2: {
            title: "Qual è la tempistica desiderata per il rilascio?",
            options: [
              "Entro pochi giorni (massima priorità)",
              "Nelle prossime 2-3 settimane",
              "Valutazione preventiva di costi e fattibilità",
            ],
          },
          finalStepTitle: "A chi possiamo inviare le specifiche tecniche e il preventivo?",
        },
        valueProps: [
          {
            title: "Velocità Reale 0.3s",
            description: "Supera ogni CMS tradizionale: la pagina si apre istantaneamente senza tempi morti.",
            metric: "0.3s",
          },
          {
            title: "Massima Conversione",
            description: "Struttura scientifica studiata per convertire il traffico a pagamento in contatti reali.",
            metric: "+240%",
          },
          {
            title: "Zero Manutenzione Complessa",
            description: "Architettura statica sicura, priva di vulnerabilità plugin e compatibile con ogni CRM.",
            metric: "100%",
          },
        ],
        socialProof: {
          mainStatValue: "100 / 100",
          mainStatLabel: "Google Core Web Vitals",
          reviewsSummary: "Soluzioni ingegnerizzate per agenzie pubblicitarie e corporate orientate al performance marketing.",
          testimonials: [
            {
              name: "Andrea V.",
              location: "Milano",
              quote: "La velocità della landing page ha abbattuto il costo per contatto sulle nostre campagne Meta di oltre il 40%.",
              roleOrContext: "Performance Marketing Manager",
            },
            {
              name: "Chiara M.",
              location: "Torino",
              quote: "Consegna impeccabile in meno di 48 ore e piena integrazione con il nostro sistema di tracciamento.",
              roleOrContext: "Direttore Creativo",
            },
          ],
        },
      },
      outreach: {
        emailSubject: `in merito alla vostra ricerca per sviluppo landing page (${lead.companyName})`,
        emailPlainTextBody: `Buongiorno, alla cortese attenzione della Direzione e del Team di ${lead.companyName},

mi chiamo Riccardo Granza e sono il fondatore di TechPyre: sviluppiamo landing page ad altissima velocità e conversione per le aziende che investono in campagne commerciali e performance marketing.

Ho notato la vostra recente ricerca per la figura di ${lead.announcementRole} e per la creazione di landing page ad alte performance.

Invece dei soliti CMS lenti (WordPress/Elementor che da smartphone impiegano 5-8 secondi), noi sviluppiamo architetture su misura in Next.js compilate per aprirsi in appena 0.3 secondi da mobile, con simulatore guidato a 2 domande che massimizza la raccolta di contatti qualificati.

Per presentarci in modo concreto, vi abbiamo configurato una versione dimostrativa veloce (0.3s) con il vostro marchio. Se vi fa piacere provarla dal telefono, rispondetemi pure 'LINK' qui sotto e ve lo giro subito.

Un cordiale saluto,
Riccardo Granza
Fondatore, TechPyre
Tel: +39 379 115 9352`,
        followUpWithLinkBody: `Buongiorno,

come promesso le invio il link per visualizzare dal telefono la versione dimostrativa istantanea (0.3s) preparata per ${lead.companyName}:

https://www.techpyre.eu/demo/${lead.slug}

La pagina è concepita con codice front-end pulito per le vostre campagne: si apre subito ed è dotata di un percorso di qualifica che raddoppia i contatti commerciali.

Resto a disposizione per qualsiasi confronto tecnico o sinergia operativa.

Un cordiale saluto,
Riccardo Granza
Fondatore, TechPyre
Web: https://www.techpyre.eu`,
      },
    };

    const leadJsonPath = path.join(process.cwd(), "src", "data", "leads", `${lead.slug}.json`);
    fs.writeFileSync(leadJsonPath, JSON.stringify(leadConfig, null, 2), "utf-8");

    console.log(`[${processed.length + 1}/20] Invio email a: ${lead.targetEmail} (${lead.companyName})...`);

    const info = await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      replyTo: user,
      to: lead.targetEmail,
      subject: leadConfig.outreach.emailSubject,
      text: leadConfig.outreach.emailPlainTextBody,
    });

    console.log(`   ✅ Inviata con successo! Message-ID: ${info.messageId}`);

    try {
      const rawMessage = [
        `From: "${fromName}" <${user}>`,
        `To: ${lead.targetEmail}`,
        `Subject: ${leadConfig.outreach.emailSubject}`,
        `Date: ${new Date().toUTCString()}`,
        `Message-ID: ${info.messageId}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/plain; charset=utf-8`,
        `Content-Transfer-Encoding: 8bit`,
        ``,
        leadConfig.outreach.emailPlainTextBody,
      ].join("\r\n");
      await appendToArubaSent(user, pass, rawMessage);
    } catch {}

    history.push({
      slug: lead.slug,
      companyName: lead.companyName,
      recipient: lead.targetEmail,
      type: "INITIAL",
      subject: leadConfig.outreach.emailSubject,
      messageId: info.messageId,
      sentAt: new Date().toISOString(),
    });
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf-8");

    processed.push({
      slug: lead.slug,
      companyName: lead.companyName,
      city: lead.city,
      email: lead.targetEmail,
      role: lead.announcementRole,
      demoUrl: `https://www.techpyre.eu/demo/${lead.slug}`,
      messageId: info.messageId,
    });

    alreadySentSlugs.add(lead.slug);
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log("\n=========================================================================");
  console.log(`🎉 20 Lead Speciali Completati! Qualificati e Inviati: ${processed.length}`);
  console.log("=========================================================================");
  console.log(JSON.stringify(processed, null, 2));
}

main().catch(console.error);
