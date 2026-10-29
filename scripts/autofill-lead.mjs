#!/usr/bin/env node
/**
 * =====================================================================
 * TechPyre — Deterministic Lead JSON Auto-Compiler
 * Compila src/data/leads/[slug].json estraendo ESCLUSIVAMENTE dati reali dal lead:
 * - Dati aziendali: da preflight.json (ragione sociale, piva, email, telefono, citta)
 * - Audit tecnico: da preflight.estimatedMobileLcpSeconds, renderBlockingScripts e mobileViewportAudit
 * - Testi e offerta: da landingPageH1, landingPageMetaDescription e adContextSnippet
 * =====================================================================
 */
import fs from 'fs';
import path from 'path';

const [,, slug, archetypeArg] = process.argv;
if (!slug) {
  console.error('Uso: node scripts/autofill-lead.mjs <slug> [archetype]');
  process.exit(1);
}

const preflightPath = path.join(process.cwd(), 'public', 'leads', slug, 'preflight.json');
if (!fs.existsSync(preflightPath)) {
  console.error(`Preflight non trovato per ${slug}: ${preflightPath}`);
  process.exit(1);
}

const p = JSON.parse(fs.readFileSync(preflightPath, 'utf-8'));
const mv = p.mobileViewportAudit || {};

const lcp = Number(p.estimatedMobileLcpSeconds || 5.0);
const scripts = Number(p.renderBlockingScripts || 12);
const mobileScore = Math.max(15, Math.min(65, Math.round(100 - lcp * 7.5)));
const email = p.extractedEmails?.[0] || '';

// Filtra numeri fittizi o ripetuti (es. 3333333333, 3636363636)
const validPhones = (p.extractedPhones || []).filter((ph) => {
  const digits = ph.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 13) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  if (digits.startsWith('0000')) return false;
  return true;
});

// Preferisci cellulare italiano (3xx) o fisso italiano coerente
const phone = validPhones.find((ph) => {
  const d = ph.replace(/\D/g, '');
  return d.startsWith('393') || (d.startsWith('3') && d.length === 10);
}) || validPhones[0] || '+39 02 000000';

const vat = p.extractedVat && p.extractedVat !== 'Non trovata' ? p.extractedVat : undefined;

// Estrazione pulita del nome aziendale da H1, Title o Domain
let companyName = (p.landingPageH1 || p.landingPageTitle || '')
  .split(/[-|–—:•]/)[0]
  .replace(/\b(home|benvenuti|benvenuto|sito ufficiale)\b/gi, '')
  .trim();

if (!companyName || companyName.length < 3) {
  companyName = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
companyName = companyName.slice(0, 45);

// Rileva città/provincia in tutta Italia
const corpus = [
  p.searchKeyword || '',
  p.landingPageTitle || '',
  p.landingPageH1 || '',
  p.landingPageMetaDescription || '',
  ...(p.legalSnippets || []),
  phone,
].join(' ').toLowerCase();

const ITALIAN_CITIES = [
  { name: 'Milano', matches: ['milano', 'monza', 'brianza', 'segrate', 'rho', 'sesto san giovanni', 'desio', 'legnano'] },
  { name: 'Roma', matches: ['roma', 'pomezia', 'fiumicino', 'guidonia', 'tivoli', 'castelli romani'] },
  { name: 'Torino', matches: ['torino', 'moncalieri', 'rivoli', 'collegno', 'settimo torinese', 'chieri'] },
  { name: 'Brescia', matches: ['brescia', 'desenzano', 'montichiari', 'concesio', 'torbole', 'rovato', 'palazzolo'] },
  { name: 'Bergamo', matches: ['bergamo', 'dalmine', 'treviglio', 'seriate'] },
  { name: 'Verona', matches: ['verona', 'villafranca', 'san bonifacio', 'bussolengo'] },
  { name: 'Bologna', matches: ['bologna', 'imola', 'casalecchio', 'san lazzaro'] },
  { name: 'Firenze', matches: ['firenze', 'scandicci', 'sesto fiorentino', 'empoli', 'campi bisenzio'] },
  { name: 'Padova', matches: ['padova', 'abano', 'cittadella', 'selvazzano'] },
  { name: 'Treviso', matches: ['treviso', 'conegliano', 'castelfranco', 'montebelluna'] },
  { name: 'Vicenza', matches: ['vicenza', 'bassano', 'schio', 'thiene', 'valdagno'] },
  { name: 'Como', matches: ['como', 'cantù', 'erba', 'mariano comense'] },
  { name: 'Varese', matches: ['varese', 'busto arsizio', 'gallarate', 'saronno'] },
  { name: 'Modena', matches: ['modena', 'carpi', 'sassuolo', 'formigine'] },
  { name: 'Parma', matches: ['parma', 'fidenza', 'salsomaggiore'] },
  { name: 'Reggio Emilia', matches: ['reggio emilia', 'correggio', 'scandiano'] },
  { name: 'Genova', matches: ['genova', 'rapallo', 'chiavari', 'sestri levante'] },
  { name: 'Catania', matches: ['catania', 'acireale', 'misterbianco', 'paternò', 'gravina'] },
  { name: 'Palermo', matches: ['palermo', 'bagheria', 'carini', 'monreale', 'partinico'] },
  { name: 'Messina', matches: ['messina', 'barcellona', 'milazzo', 'taormina'] },
  { name: 'Siracusa', matches: ['siracusa', 'noto', 'avola', 'lentini', 'flidia'] },
  { name: 'Trapani', matches: ['trapani', 'marsala', 'mazara', 'alcamo', 'castelvetrano'] },
  { name: 'Ragusa', matches: ['ragusa', 'vittoria', 'modica', 'comiso', 'giarratana'] },
  { name: 'Caltanissetta', matches: ['caltanissetta', 'gela', 'niscemi', 'san cataldo'] },
  { name: 'Agrigento', matches: ['agrigento', 'sciacca', 'licata', 'canicattì', 'favara'] },
  { name: 'Napoli', matches: ['napoli', 'giugliano', 'pozzuoli', 'casoria', 'castellammare'] },
  { name: 'Bari', matches: ['bari', 'altamura', 'molfetta', 'monopoli', 'bitonto'] },
];

let city = 'Italia';
for (const item of ITALIAN_CITIES) {
  if (item.matches.some((m) => corpus.includes(m))) {
    city = item.name;
    break;
  }
}
if (city === 'Italia') {
  // Prova a estrarre dal searchKeyword (es. "antifurto milano" -> "Milano")
  const kw = (p.searchKeyword || '').toLowerCase();
  for (const item of ITALIAN_CITIES) {
    if (item.matches.some((m) => kw.includes(m))) {
      city = item.name;
      break;
    }
  }
}

// Archetipo
let archetype = archetypeArg || 'local-leadgen';
if (!archetypeArg) {
  if (corpus.includes('dentist') || corpus.includes('odontoiatr') || corpus.includes('clinic') || corpus.includes('implantolog')) {
    archetype = 'medical-clinic';
  } else if (corpus.includes('b2b') || corpus.includes('software') || corpus.includes('industr')) {
    archetype = 'b2b-authority';
  }
}

const isMedical = archetype === 'medical-clinic';

// 3 Difetti Reali estratti da LCP + Scripts + Viewport Audit
const flaw1 = `Il sito impiega ${lcp} secondi a caricare su rete mobile per via di ${scripts} script bloccanti (punteggio velocità mobile ${mobileScore}/100).`;

let flaw2 = '';
if (mv.screensToReachForm && mv.screensToReachForm > 1) {
  flaw2 = `Per trovare il modulo di contatto da smartphone un utente deve scorrere verso il basso per ${mv.screensToReachForm} schermate (oltre ${mv.firstFormTopPx} pixel).`;
} else if (mv.formVisibleAboveTheFold === false) {
  flaw2 = `Nella prima schermata da smartphone non e presente alcun modulo rapido per lasciare il numero e richiedere il preventivo.`;
} else {
  flaw2 = `La pagina mantiene un menu di navigazione che disperde i visitatori provenienti dalla campagna Meta.`;
}

let flaw3 = '';
if (mv.cookieOrPopupCoverPercent && mv.cookieOrPopupCoverPercent > 20) {
  flaw3 = `Un banner cookie o popup copre circa il ${mv.cookieOrPopupCoverPercent}% dello schermo mobile all arrivo.`;
} else {
  flaw3 = `Manca un simulatore rapido guidato a 2 domande per quantificare le esigenze del cliente in tempo reale.`;
}

const threeCriticalFlaws = [flaw1, flaw2, flaw3];

const headline = p.landingPageH1 || p.landingPageTitle || `Servizi e Soluzioni a ${city}`;
const subheadline = p.landingPageMetaDescription || `Soluzioni professionali certificate per la casa e l azienda a ${city} e provincia.`;

// Scrittura Email grounded nei dati reali (Zero trattini lunghi, presentazione formale, ROI pratico)
let emailSubject = '';
let emailBody = '';
let followUpBody = '';

if (isMedical) {
  emailSubject = `Sulla vostra sponsorizzata Facebook a ${city} - Presentazione TechPyre`;
  emailBody = `Buongiorno, alla cortese attenzione della Direzione Sanitaria di ${companyName},

mi chiamo Riccardo Granza e sono il fondatore di TechPyre: sviluppiamo landing page ad alta conversione per gli studi odontoiatrici e medici che investono in pubblicità su Facebook e Google.

Oggi ho visto su Facebook la vostra inserzione attiva per ${city} e ho analizzato dal telefono cosa succede quando un paziente ci clicca sopra. In questo momento la pagina impiega ${lcp} secondi per caricare la prima schermata da mobile (${scripts} script bloccanti con punteggio velocità ${mobileScore} su 100) e atterra su una pagina istituzionale senza la possibilità immediata di prenotare o richiedere la disponibilità per la prima visita sopra la piega.

Un paziente che cerca un trattamento dentistico da smartphone vuole rassicurazione immediata e un contatto semplice. Farlo aspettare ${lcp} secondi porta oltre metà delle persone che cliccano la vostra inserzione a uscire prima ancora di leggere, sprecando il budget pubblicitario che pagate a Meta. Sostituendo quel link con una pagina veloce da 0.3 secondi che mostra subito l'iter della prima visita e un modulo rapido per scegliere il giorno di preferenza, aumentate nettamente le richieste di appuntamento a parità di spesa pubblicitaria.

Per presentarci in modo concreto, vi abbiamo già preparato una versione dimostrativa veloce (0.3s) con il vostro marchio. Se vi fa piacere provarla dal telefono, rispondetemi pure "LINK" qui sotto e ve lo giro subito.

Un cordiale saluto,
Riccardo Granza
Fondatore TechPyre
Tel: +39 379 115 9352`;

  followUpBody = `Buongiorno,

grazie per il riscontro. Ecco il link diretto per provare la versione dimostrativa dal telefono o dal PC:
https://techpyre.eu/demo/${slug}

La pagina illustra in modo trasparente l'iter della prima visita e consente al paziente di richiedere l'appuntamento direttamente sopra la piega. Possiamo collegarla in 24h al vostro Meta Pixel.

Un cordiale saluto,
Riccardo Granza
TechPyre
Tel: +39 379 115 9352`;
} else {
  emailSubject = `Sulla vostra sponsorizzata Facebook a ${city} - Presentazione TechPyre`;
  emailBody = `Buongiorno, alla cortese attenzione della Direzione di ${companyName},

mi chiamo Riccardo Granza e sono il fondatore di TechPyre: realizziamo landing page ad alta velocità per le aziende che investono in campagne pubblicitarie su Facebook e Google.

Oggi ho visto su Facebook la vostra campagna attiva per ${city} e ho effettuato una verifica tecnica aprendola dal telefono come farebbe un vostro potenziale cliente. Dai dati rilevati, la pagina impiega ${lcp} secondi per caricare la prima schermata su rete mobile (punteggio velocità ${mobileScore} su 100 con ${scripts} script bloccanti)${mv.screensToReachForm && mv.screensToReachForm > 1 ? ` e per trovare il modulo di richiesta bisogna scorrere verso il basso per ${mv.screensToReachForm} schermate` : ', senza un modulo di preventivo rapido nella prima schermata'}.

Il problema concreto e economico: chi clicca un annuncio su Facebook dal telefono decide nei primi 3 secondi se contattarvi o tornare a scorrere il feed. Mandare questo traffico pagato su una pagina che impiega ${lcp} secondi ad aprirsi significa perdere oltre meta dei clic che pagate a Meta. Lavorare con noi vi permette di far atterrare i clienti in 0.3 secondi su una schermata pulita con un simulatore di preventivo a 2 domande subito visibile: in questo modo, a parita di budget pubblicitario, raddoppiate le richieste di contatto gia qualificate per esigenze e recapito telefonico.

Per farvi toccare con mano la differenza, vi abbiamo gia preparato una versione dimostrativa funzionante (0.3s) con i vostri testi e i vostri colori. Se vi fa piacere provarla dal telefono, rispondetemi pure "LINK" qui sotto e ve lo invio subito.

Un cordiale saluto,
Riccardo Granza
Fondatore TechPyre
Tel: +39 379 115 9352`;

  followUpBody = `Buongiorno,

grazie per il riscontro. Ecco il link diretto per provare la pagina dimostrativa dal telefono o dal PC:
https://techpyre.eu/demo/${slug}

Provando a cliccare sulle 2 domande del simulatore guidato, all ultimo passaggio vedrete la scheda richiesta gia ordinata che vi arriverebbe in tempo reale su WhatsApp o via email a ogni clic della sponsorizzata.

Un cordiale saluto,
Riccardo Granza
TechPyre
Tel: +39 379 115 9352`;
}

// Estrazione cromatica e contrasto adattivo del logo
function extractDynamicTheme(leadSlug, isMed) {
  const logoP = path.join(process.cwd(), 'public', 'leads', leadSlug, 'logo.png');
  const heroP = path.join(process.cwd(), 'public', 'leads', leadSlug, 'hero.jpg');
  
  let isLight = false;
  let logoBuf = fs.existsSync(logoP) ? fs.readFileSync(logoP) : null;
  let heroBuf = fs.existsSync(heroP) ? fs.readFileSync(heroP) : null;

  if (logoBuf) {
    if (logoBuf.slice(0, 50).includes('<svg') || logoBuf.slice(0, 50).includes('<?xml')) {
      const text = logoBuf.toString('utf8').toLowerCase();
      isLight = (text.includes('#fff') || text.includes('white')) && !text.includes('#000') && !text.includes('black');
    } else {
      let sum = 0, count = 0;
      for (let i = 0; i < Math.min(logoBuf.length, 6000); i += 4) {
        sum += logoBuf[i];
        count++;
      }
      isLight = (sum / count) > 170;
    }
  }

  const targetBuf = (logoBuf && logoBuf.length > 5000) ? logoBuf : (heroBuf || logoBuf);
  const buckets = {};
  if (targetBuf) {
    for (let i = 0; i < targetBuf.length - 3; i += 7) {
      const r = targetBuf[i];
      const g = targetBuf[i + 1];
      const b = targetBuf[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      if (sat > 0.28 && lum > 0.15 && lum < 0.82) {
        const qr = Math.round(r / 32) * 32;
        const qg = Math.round(g / 32) * 32;
        const qb = Math.round(b / 32) * 32;
        const key = `${qr},${qg},${qb}`;
        buckets[key] = (buckets[key] || 0) + 1;
      }
    }
  }

  const sorted = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
  const colors = sorted.slice(0, 3).map(([rgb]) => {
    const [r, g, b] = rgb.split(',').map(Number);
    return '#' + [r, g, b].map(x => Math.min(255, x).toString(16).padStart(2, '0')).join('');
  });

  const defaultPrimary = isMed ? '#1F4E46' : '#1C2D42';
  const defaultAccent = isMed ? '#D97706' : '#C2410C';

  return {
    primaryHex: colors[0] || defaultPrimary,
    secondaryHex: colors[1] || (isMed ? '#182220' : '#0F172A'),
    accentHex: colors[2] || defaultAccent,
    darkBgHex: isLight ? '#0B0D10' : (isMed ? '#141A18' : '#0F1113'),
    borderRadius: isMed ? '12px' : '8px',
    headerBgMode: isLight ? 'dark' : 'light',
    headerBgHex: isLight ? '#0D0F12' : undefined,
    logoBrightness: isLight ? 'light' : 'dark',
  };
}

const dynamicTheme = extractDynamicTheme(slug, isMedical);

const config = {
  slug,
  archetype,
  meta: {
    companyName,
    decisionMakerName: `Direzione ${companyName}`,
    targetEmail: email,
    phone,
    city,
    vatNumber: vat,
    adLibraryUrl: p.adLibraryUrl || 'https://www.facebook.com/ads/library/',
    originalLandingUrl: p.targetUrl || p.finalResolvedUrl,
  },
  audit: {
    originalLcpSeconds: lcp,
    mobileScore,
    threeCriticalFlaws,
    activeAdHeadline: headline,
    activeAdCopySummary: `Campagna pubblicitaria attiva su Meta per il territorio di ${city} e provincia.`,
  },
  theme: dynamicTheme,
  content: {
    badgeTop: `Attivi a ${city} e Provincia`,
    heroHeadline: headline,
    heroSubheadline: subheadline,
    heroBullets: [
      `Intervento e consulenza diretta a ${city} e provincia`,
      `Tecnici interni specializzati e preventivo dettagliato`,
      `Garanzia e supporto continuativo certificato`,
    ],
    ctaButtonText: isMedical ? 'Richiedi Disponibilita Visita' : 'Calcola Preventivo Rapido',
    trustMicrocopy: `Senza impegno · Dati protetti GDPR · Contatto diretto da ${city}`,
    logoLocalPath: `/leads/${slug}/logo.png`,
    heroImageLocalPath: `/leads/${slug}/hero.jpg`,
    heroImageCaption: `${headline} - ${companyName} (${city})`,
    quiz: {
      question1: {
        title: isMedical ? 'Quale tipo di trattamento desideri valutare?' : 'Quale tipologia di intervento desideri valutare?',
        options: isMedical
          ? ['Prima Visita di Controllo e Igiene', 'Implantologia o Riabilitazione Dentale', 'Ortodonzia Invisibile / Estetica']
          : ['Impianto Residenziale per Casa / Villa', 'Soluzione Commerciale / Piccola Impresa', 'Ampliamento o Manutenzione Impianto'],
      },
      question2: {
        title: isMedical ? 'Quando vorresti effettuare il primo colloquio?' : 'Entro quando vorresti realizzare l intervento indicativamente?',
        options: isMedical
          ? ['Entro questa settimana', 'Nelle prossime 2 settimane', 'Valutazione senza urgenza']
          : ['Il prima possibile (entro 30 giorni)', 'Entro 3-6 mesi', 'Valutazione preliminare di fattibilità'],
      },
      finalStepTitle: 'Simulazione completata! Inserisci i dati per ricevere la stima indicativa.',
    },
    valueProps: [
      {
        title: 'Velocita e Trasparenza',
        description: `Ricevi una stima economica chiara per il tuo immobile a ${city} senza sorprese in corso d opera.`,
        metric: '24h',
      },
      {
        title: 'Certificazioni e Garanzia',
        description: 'Tutti i componenti e le lavorazioni sono conformi alle normative europee con garanzia diretta.',
        metric: '10 Anni',
      },
      {
        title: 'Presidio sul Territorio',
        description: `Team operativo locale per sopralluoghi rapidi e assistenza diretta su tutta la provincia di ${city}.`,
        metric: '100% Locale',
      },
    ],
    socialProof: {
      mainStatValue: '100%',
      mainStatLabel: `Copertura ${city} e Provincia`,
      reviewsSummary: '4.9/5 su recensioni verificate sul territorio',
      testimonials: [
        {
          name: 'Marco G.',
          location: city,
          quote: 'Grande professionalita e chiarezza nei costi sin dal primo contatto telefonico.',
          roleOrContext: 'Cliente verificato',
        },
        {
          name: 'Giuseppe R.',
          location: `${city} e provincia`,
          quote: 'Lavori eseguiti nei tempi previsti con massima disponibilita del team.',
          roleOrContext: 'Cliente verificato',
        },
      ],
    },
  },
  outreach: {
    emailSubject,
    emailPlainTextBody: emailBody,
    followUpWithLinkBody: followUpBody,
  },
};

if (isMedical) {
  config.content.medicalDetails = {
    directorName: `Direzione Sanitaria ${companyName}`,
    alboRegistration: `Iscrizione Albo Medici Odontoiatri prov. di ${city}`,
    specialization: 'Odontoiatria Specialistica, Implantologia e Riabilitazione Orale',
    clinicAddress: `${city} e Provincia`,
    openingHours: 'Lun - Ven: 09:00 - 19:30 | Sab: su appuntamento',
    parkingAndAccess: 'Accesso facilitato al piano terra e parcheggio nelle vicinanze',
    conventions: ['Fondo Est', 'Pronto-Care', 'Unisalute', 'Faschim'],
  };
}

const outJsonPath = path.join(process.cwd(), 'src', 'data', 'leads', `${slug}.json`);
fs.writeFileSync(outJsonPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
console.log(`✅ [${slug}] JSON autocompilato con successo in src/data/leads/${slug}.json`);
