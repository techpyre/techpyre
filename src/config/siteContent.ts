import { SiteContent } from "@/types/content";

/**
 * =====================================================================
 * UNICA FONTE DI VERITÀ (SINGLE SOURCE OF TRUTH)
 * Testi tecnici, pragmatici, orientati alla riduzione del rischio B2B.
 * Aggiornamento Listino, Nuova Sezione Architetture e Continuità Operativa.
 * =====================================================================
 */
export const siteContent: SiteContent = {
  brand: {
    name: "TechPYRE",
    founder: "Riccardo Granza",
    tagline:
      "Studio di ingegneria del software e posizionamento digitale per imprese.",
    contactEmail: "riccardo.granza@techpyre.eu",
    phone: "+39 379 115 9352",
    location: "Sede in Italia · Operatività nazionale",
    badge: "Ingegneria del Software B2B",
    availabilityNote: "Sede in Italia · Operatività su tutto il territorio nazionale",
  },

  navigation: {
    links: [
      { label: "Listino Servizi", href: "#servizi" },
      { label: "Architetture & Casi", href: "#progetti" },
      { label: "Simulatore B2B", href: "#simulatore" },
      { label: "Lo Studio", href: "#storia" },
      { label: "Contatto Diretto", href: "#contatto" },
    ],
    cta: {
      label: "Richiedi Incontro (30 min)",
      href: "#contatto",
    },
  },

  hero: {
    badge: "STUDIO INDIPENDENTE DI INGEGNERIA DEL SOFTWARE B2B",
    headline: {
      line1: "Ingegneria del software e rigore strategico al servizio dell'",
      highlight: "impresa reale.",
      line2: "",
    },
    subheadline:
      "Architetture web proprietarie, landing page ad alta resa commerciale ed ecosistemi B2B. Interlocutore tecnico diretto affiancato da continuità operativa garantita, codice standardizzato e zero debito tecnico legacy.",
    primaryCta: {
      label: "Richiedi Primo Colloquio Tecnico",
      href: "#contatto",
      note: "Sessione conoscitiva di 30 minuti · Analisi preliminare senza vincoli",
    },
    secondaryCta: {
      label: "Consulta il Listino Prezzi",
      href: "#servizi",
    },
    pillars: [
      {
        id: "01",
        title: "Responsabilità & Continuità",
        description:
          "Interlocutore tecnico diretto con codice standardizzato (Next.js/TS) e documentazione tecnica completa per la piena autonomia aziendale.",
      },
      {
        id: "02",
        title: "Patti Chiari e Prezzo Certo",
        description:
          "Importi definiti prima di iniziare le attività. Nessun canone occulto e codice 100% di proprietà dell'azienda cliente.",
      },
      {
        id: "03",
        title: "Ingegneria Nativa",
        description:
          "Next.js e TypeScript nativo per tempi di risposta sub-secondo (< 400ms), CI/CD automatizzata e zero debito tecnico.",
      },
    ],
  },

  services: {
    eyebrow: "LISTINO B2B · TRASPARENZA CONTRATTUALE",
    title: "Quattro soluzioni chiare. Tariffe certe prima dell'inizio.",
    subtitle:
      "Specifiche definite, tempi certi e piena titolarità del codice rilasciato sul repository della tua azienda.",
    guarantee:
      "Ogni importo concordato è definitivo. Repository e infrastruttura intestati interamente alla società cliente con garanzia di continuità.",
    items: [
      {
        id: "audit-consulenza",
        number: "01",
        name: "Audit Tecnico & Consulenza Architetturale",
        price: "Primi 30 min gratuiti, poi 70€ / ora",
        priceSubtext: "Prima sessione di inquadramento a costo zero",
        summary:
          "Audit analitico dei sistemi esistenti, diagnosi dei colli di bottiglia e roadmap tecnica esecutiva.",
        description:
          "Analisi tecnica approfondita dell'infrastruttura web o del software aziendale per identificare vulnerabilità, inefficienze di caricamento, problemi di scalabilità o definire le specifiche prima di investimenti rilevanti.",
        deliverables: [
          "Colloquio preliminare di 30 minuti gratuito",
          "Audit tecnico su prestazioni (Core Web Vitals), sicurezza e architettura",
          "Analisi del debito tecnico e revisione dei flussi di conversione",
          "Relazione tecnica con priorità di intervento e stime oggettive",
        ],
        timing: "Pianificazione entro 48 ore dalla richiesta",
        target:
          "Imprenditori e dirigenti che desiderano un parere tecnico indipendente e misurato.",
        ctaText: "Prenota i 30 Minuti Gratuiti",
      },
      {
        id: "landing-page",
        number: "02",
        name: "Landing Page ad Alta Conversione",
        price: "900€ (Prezzo Fisso)",
        priceSubtext: "Consegna a corpo · Nessun canone periodico",
        summary:
          "Pagina singola ultra-performante per acquisizione di lead qualificati e validazione commerciale.",
        description:
          "Sviluppata senza page builder pesanti né CMS vulnerabili. Codice nativo Next.js ultra-leggero, testi persuasivi orientati alla conversione e integrazione webhook per una resa commerciale immediata.",
        deliverables: [
          "Design su misura calibrato sull'identità e sul posizionamento aziendale",
          "Frontend Next.js per risposta istantanea (< 400ms)",
          "Integrazione moduli con notifica email immediata e webhook CRM",
          "Piena titolarità del codice sorgente sul repository dell'impresa",
        ],
        timing: "Consegna online in 5–7 giorni lavorativi",
        target:
          "Aziende che lanciano un servizio mirato o campagne Google/LinkedIn Ads ad alto budget.",
        ctaText: "Richiedi la Landing Page a 900€",
      },
      {
        id: "sito-corporate",
        number: "03",
        name: "Sito Corporate & Architettura Avanzata",
        price: "Da 2.000€ a 4.000€",
        priceSubtext: "Fatturazione a milestone · Include Blueprint architetturale",
        summary:
          "Sito multi-pagina ultra-veloce in Next.js, SEO tecnica nativa, CMS headless e design su misura.",
        description:
          "Architettura web istituzionale ad alte prestazioni per aziende che esigono autorevolezza e velocità. Include il Blueprint preliminare, rendering ibrido statico/server, gestione contenuti headless intuitiva e zero debito tecnico.",
        deliverables: [
          "Blueprint architetturale e wireframe preliminari inclusi nel piano",
          "Sito multi-pagina in Next.js con performance Lighthouse 100/100",
          "Pannello CMS Headless per aggiornamento autonomo dei contenuti",
          "SEO tecnica nativa, dati strutturati Schema.org e OpenGraph completi",
          "Piena proprietà del codice e rilascio su repository aziendale",
        ],
        timing: "Consegna in 2–3 settimane lavorative",
        target:
          "Imprese strutturate, studi professionali e brand B2B che vogliono posizionarsi come leader di settore.",
        ctaText: "Richiedi Progetto Corporate",
      },
      {
        id: "ecosistema",
        number: "04",
        name: "Web Application & Ecosistema B2B Custom",
        price: "Da 5.000€ a 15.000€",
        priceSubtext: "Sviluppo a sprint settimanali · Fatturazione a milestone",
        summary:
          "Piattaforme su misura, aree riservate (RBAC), integrazioni API/ERP, flussi Stripe B2B e architettura scalabile.",
        description:
          "Software enterprise proprietario calibrato sui processi operativi aziendali. Dai portali riservati per clienti/fornitori ai gestionali interni, con sicurezza di livello bancario e scalabilità edge.",
        deliverables: [
          "Architettura Full-Stack distribuita su Next.js, TypeScript e PostgreSQL",
          "Area riservata con autenticazione avanzata a ruoli (RBAC)",
          "Integrazione API bidirezionale con ERP/CRM e webhook dedicati",
          "Flussi di pagamento B2B e fatturazione automatizzata Stripe",
          "Garanzia di continuità operativa, CI/CD automatizzata e 60gg di supporto post-rilascio",
        ],
        timing: "Sviluppo a sprint settimanali (4–8 settimane)",
        target:
          "Industrie manifatturiere, distributori B2B e società che necessitano di digitalizzare flussi critici.",
        ctaText: "Configura il Tuo Ecosistema",
      },
    ],
  },

  caseStudies: {
    eyebrow: "ARCHITETTURE REFERENCE & CASI STUDIO",
    title: "Ingegneria applicata e metriche oggettive.",
    subtitle:
      "Showcase di architetture dimostrative progettate secondo i massimi standard industriali: velocità estrema, zero debito tecnico e affidabilità continuativa.",
    items: [
      {
        id: "portale-b2b",
        tag: "REFERENCE B2B ARCHITECTURE",
        title: "Ecosistema B2B & Portale Ordini Custom",
        description:
          "Architettura dimostrativa per la gestione di cataloghi B2B riservati, listini personalizzati per cliente e fatturazione automatizzata.",
        metrics: [
          { label: "Largest Contentful Paint", value: "LCP < 0.4s", subtext: "Caricamento catalogo istantaneo" },
          { label: "Core Web Vitals", value: "100 / 100", subtext: "Punteggio massimo Google" },
          { label: "Disponibilità Infrastruttura", value: "Zero Downtime", subtext: "Architettura edge ridondata" },
        ],
        stack: [
          "Next.js App Router",
          "TypeScript",
          "PostgreSQL",
          "Prisma",
          "Stripe Webhook",
          "Autenticazione RBAC",
        ],
        highlights: [
          "Area riservata con controllo accessi a ruoli (Buyer, Agenti commerciali, Amministrazione)",
          "Listini dinamici con scontistiche personalizzate per partita IVA e contratti a scaglioni",
          "Sincronizzazione contabile e fatturazione automatica Stripe senza attrito manuale",
          "Codice rigorosamente tipizzato e documentato secondo standard industriali OpenAPI",
        ],
        ctaText: "Richiedi un'Architettura B2B Simile",
        prefillService: "Web Application & Ecosistema B2B Custom",
        demoUrl: "https://b2b-demo.techpyre.eu",
        repoUrl: "https://github.com/techpyre/techpyre-b2b-portal-reference",
      },
      {
        id: "infrastruttura-headless",
        tag: "HIGH-CONVERSION INFRASTRUCTURE",
        title: "Infrastruttura Headless ad Alta Conversione",
        description:
          "Sostituzione di un'infrastruttura legacy lenta con una web app statica/ibrida capace di reggere picchi di traffico da campagne adv senza perdita di lead.",
        metrics: [
          { label: "Lighthouse Performance", value: "100 / 100", subtext: "Mobile & Desktop ottimizzati" },
          { label: "Time to First Byte", value: "TTFB < 50ms", subtext: "Distribuzione Edge Globale" },
          { label: "Efficienza Acquisizione", value: "+68%", subtext: "Modello verificabile in demo" },
        ],
        stack: [
          "Next.js",
          "Tailwind CSS",
          "Edge Caching",
          "Webhook CRM",
          "Zero Debito Legacy",
        ],
        highlights: [
          "Eliminazione completa di plugin pesanti e vulnerabilità dei CMS monolitici tradizionali",
          "Coda asincrona di failover: nessun lead perso anche in caso di disconnessione temporanea",
          "Rendering statico pre-generato (SSG/ISR) per velocità sub-secondo da qualsiasi dispositivo",
          "Integrazione diretta con CRM aziendali (HubSpot, Salesforce o database proprietari)",
        ],
        ctaText: "Valuta la Migrazione Headless",
        prefillService: "Landing Page ad Alta Conversione",
        demoUrl: "https://headless-demo.techpyre.eu",
        repoUrl: "https://github.com/techpyre/techpyre-headless-leadgen-reference",
      },
    ],
  },

  founder: {
    eyebrow: "VISIONE & LEADERSHIP · IL FONDATORE DELLO STUDIO",
    title: "Ingegneria moderna senza compromessi. La determinazione di chi guida lo studio.",
    subtitle: "Manifesto di visione e leadership di Riccardo Granza, fondatore e guida di TechPYRE.",
    name: "Riccardo Granza",
    role: "Fondatore & Head of Studio",
    ageBadge: "18 Anni · Fondatore e Capo dello Studio",
    leadershipBadge:
      "18 Anni · Visione, determinazione incrollabile e controllo rigoroso sui massimi standard dello studio.",
    manifesto: [
      "Chi conduce un'impresa seria riconosce subito la differenza tra un apparato burocratico che disperde energie e una leadership determinata che punta dritta all'obiettivo.",
      "Ho 18 anni. Per molti l'età è solo un dato anagrafico; per me è il moltiplicatore di una determinazione feroce, di una grinta instancabile e di una lucidità tecnica totale. Ho fondato TechPYRE e ne dirigo le operazioni per scardinare la mediocrità di un mercato dove agenzie sovradimensionate addebitano parcelle ingiustificate, finendo per delegare lo sviluppo a terzi su tecnologie già morte.",
      "Come capo dello studio, non accetto compromessi sulla qualità esecutiva. TechPYRE non è un'avventura improvvisata: è uno studio di ingegneria del software strutturato con processi solidi, metodologie rigorose e standard adottati dalle migliori tech company al mondo: Next.js nativo, TypeScript puro, architetture cloud edge e zero debito tecnico legacy.",
      "Pretendo per ogni committente ciò che le agenzie tradizionali non possono garantire: continuità operativa totale, rilascio di documentazione esecutiva esaustiva, codice standardizzato e pipeline automatizzate. L'azienda ha il vantaggio di rapportarsi con una figura di vertice energica e reattiva, con la sicurezza di un'infrastruttura ingegneristica completamente autonoma.",
      "Il codice sorgente, l'infrastruttura e i dati restano al 100% di proprietà dell'azienda committente fin dal primo rilascio. Chi sceglie TechPYRE sceglie la determinazione di una realtà moderna che lavora con ambizione e rigore per far vincere i propri clienti sul mercato.",
    ],
    quote:
      "«A 18 anni la mia ambizione e la mia determinazione sono chiare: guidare TechPYRE per renderlo il punto di riferimento delle imprese che pretendono software impeccabile, velocità di esecuzione e trasparenza assoluta.»",
    comparison: {
      legacyTitle: "La prassi delle agenzie tradizionali",
      legacyPoints: [
        "Tempi di risposta lunghi mediati da figure commerciali non tecniche",
        "Piattaforme obsolete, plugin insicuri e template riciclati tra committenti diversi",
        "Tariffe gravate da spese fisse di rappresentanza e riunioni sterili",
        "Codice trattenuto dall'agenzia con vincoli per ostacolare la migrazione",
      ],
      techPyreTitle: "Il modello di leadership e studio TechPYRE",
      techPyrePoints: [
        "Interlocutore diretto: risponde Riccardo Granza con la grinta e la reattività della guida dello studio",
        "Metodologia di studio: processi codificati, zero debito legacy e codice Next.js/TS nativo",
        "Continuità operativa garantita: documentazione esecutiva completa e pipeline CI/CD indipendenti",
        "Proprietà intellettuale integrale: repository e infrastruttura 100% dell'azienda",
      ],
    },
  },

  contact: {
    eyebrow: "REPERIBILITÀ DIRETTA CON IL FONDATORE",
    title: "Richiedi un primo confronto tecnico o una stima economica.",
    subtitle:
      "Compila il modulo indicando le tue necessità. Riceverai un riscontro entro poche ore direttamente da Riccardo Granza.",
    formLabels: {
      name: "Nome e Cognome",
      namePlaceholder: "Es. Mario Rossi",
      company: "Ragione Sociale / Impresa",
      companyPlaceholder: "Es. Meccanica Industriale S.r.l.",
      contact: "Email Aziendale o Telefono",
      contactPlaceholder: "Es. m.rossi@meccanicaindustriale.it oppure 340 1234567",
      service: "Servizio di interesse primario",
      message: "Descrizione del progetto",
      messagePlaceholder:
        "Descrivi sinteticamente lo stato attuale dei sistemi, gli obiettivi e i tempi previsti...",
      submit: "Invia Richiesta Diretta al Fondatore",
      submitting: "Elaborazione in corso...",
      privacyNote:
        "I dati forniti sono trattati con il massimo riserbo nel rispetto del GDPR. Nessun invio promozionale non richiesto.",
    },
    channels: [
      {
        label: "Email Diretta",
        value: "riccardo.granza@techpyre.eu",
        subtext: "Riscontro garantito entro 2–3 ore lavorative",
        href: "mailto:riccardo.granza@techpyre.eu",
      },
      {
        label: "Telefono e WhatsApp",
        value: "+39 379 115 9352",
        subtext: "Disponibile per comunicazioni rapide",
        href: "https://wa.me/393791159352",
        isExternal: true,
      },
      {
        label: "Orari di Reperibilità",
        value: "Lun — Ven · 08:30 — 19:30",
        subtext: "Fuso orario di Roma · Disponibilità per incontri in presenza",
        href: "#",
      },
    ],
    feedback: {
      successTitle: "Richiesta ricevuta con successo.",
      successMessage:
        "Grazie per l'interesse. Riccardo Granza ha preso in carico la richiesta e ti ricontatterà entro breve con la proposta per la prima sessione conoscitiva.",
      successReset: "Invia una nuova comunicazione",
      errorTitle: "Impossibile inviare la richiesta.",
      errorMessage:
        "Si è verificato un inconveniente di rete. Puoi scrivere direttamente a riccardo.granza@techpyre.eu o chiamare il +39 379 115 9352.",
    },
  },

  footer: {
    summary:
      "Studio di ingegneria del software e consulenza tecnologica ad alte prestazioni. Architetture proprietarie, portali B2B e landing page commerciali con il rigore, la trasparenza e la continuità propri della migliore consuetudine ingegneristica.",
    copyright: `© ${new Date().getFullYear()} TechPYRE STUDIO · Sviluppato e manutenuto con codice proprietario standard Next.js / TypeScript.`,
    links: [
      {
        title: "Patti e Principi",
        items: [
          { label: "Listino Servizi B2B", href: "#servizi" },
          { label: "Casi Studio & Architetture", href: "#progetti" },
          { label: "Simulatore B2B", href: "#simulatore" },
          { label: "Lo Studio & Metodo", href: "#storia" },
          { label: "Colloquio 30m Gratuito", href: "#contatto" },
        ],
      },
      {
        title: "Specifiche Operative",
        items: [
          { label: "Audit Tecnico (70€/h)", href: "#servizi" },
          { label: "Landing Page a 900€", href: "#servizi" },
          { label: "Sito Corporate (2.000€–4.000€)", href: "#servizi" },
          { label: "Web App & Ecosistema B2B", href: "#servizi" },
        ],
      },
      {
        title: "Recapiti Personali",
        items: [
          { label: "riccardo.granza@techpyre.eu", href: "mailto:riccardo.granza@techpyre.eu" },
          { label: "WhatsApp: +39 379 115 9352", href: "https://wa.me/393791159352", isExternal: true },
          { label: "Telefono: +39 379 115 9352", href: "tel:+393791159352" },
        ],
      },
    ],
  },
};

export const brandName = siteContent.brand.name;
