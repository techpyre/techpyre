import { SiteContent } from "@/types/content";

/**
 * =====================================================================
 * UNICA FONTE DI VERITÀ (SINGLE SOURCE OF TRUTH)
 * Posizionamento: TechPyre | Studio di Ingegneria ed Ecosistemi Digitali
 * Copywriting asciutto, diretto, zero bloat, ottimizzato per mobile.
 * =====================================================================
 */
export const siteContent: SiteContent = {
  brand: {
    name: "TechPyre",
    founder: "Riccardo Granza",
    tagline:
      "Studio di Ingegneria ed Ecosistemi Digitali per imprese B2B.",
    contactEmail: "riccardo.granza@techpyre.eu",
    phone: "+39 379 115 9352",
    location: "Pagliara (Messina) · Operatività nazionale",
    headquarters: "Via Carrubara Vico III n. 3, 98027 Pagliara (Messina)",
    vatNumber: "In stato di costituzione",
    badge: "STUDIO DI INGEGNERIA ED ECOSISTEMI DIGITALI",
    availabilityNote: "Sede in Italia · Operatività su tutto il territorio nazionale",
  },

  navigation: {
    links: [
      { label: "Servizi", href: "/servizi" },
      { label: "Progetti", href: "/progetti" },
      { label: "Studio", href: "/studio" },
      { label: "Contatti", href: "/#contatto" },
    ],
    cta: {
      label: "Richiedi Diagnosi (30 min)",
      href: "/#contatto",
    },
  },

  hero: {
    badge: "STUDIO DI INGEGNERIA ED ECOSISTEMI DIGITALI B2B",
    headline: {
      line1: "Ingegnerizziamo ecosistemi digitali per l'acquisizione B2B e l'",
      highlight: "efficienza operativa.",
      line2: "",
    },
    subheadline:
      "Progettiamo infrastrutture web istantanee, sistemi di tracciamento dati e automazioni CRM che trasformano il traffico in fatturato misurabile. Codice e dati al 100% di proprietà della tua impresa.",
    primaryCta: {
      label: "Richiedi Sessione di Diagnosi",
      href: "/#contatto",
      note: "Valutazione preliminare di 30 minuti · Analisi di infrastruttura, dati e flussi commerciali",
    },
    secondaryCta: {
      label: "Esplora i Servizi",
      href: "/servizi",
    },
    pillars: [
      {
        id: "01",
        title: "Ecosistemi Proprietari",
        description:
          "Codice sorgente e infrastruttura dati intestati al 100% alla tua azienda. Zero canoni di noleggio o vincoli contrattuali.",
      },
      {
        id: "02",
        title: "Controllo del Dato",
        description:
          "Tracciamento Server-Side per superare ad-blocker e misurare il ritorno reale di ogni euro investito in pubblicità.",
      },
      {
        id: "03",
        title: "Latenza Zero & Automazione",
        description:
          "Caricamento istantaneo su mobile collegato direttamente al CRM aziendale per azzerare il lavoro manuale.",
      },
    ],
  },

  services: {
    eyebrow: "SERVIZI & ARCHITETTURE B2B",
    title: "Quattro servizi integrati. Costi chiari prima dell'avvio.",
    subtitle:
      "Infrastrutture di acquisizione, portali operativi, intelligenza del dato e automazione commerciale con piena proprietà del codice.",
    guarantee:
      "Preventivo chiuso a milestone prima dell'inizio. Repository e dati intestati al 100% alla società cliente.",
    items: [
      {
        id: "infrastrutture-conversione",
        number: "01",
        name: "Infrastrutture Web & Architetture di Conversione",
        price: "A partire da 900€",
        priceSubtext: "Consegna a corpo · Zero canoni di noleggio",
        summary:
          "Piattaforme web e landing system in Next.js progettati per caricamento istantaneo, SEO tecnica e massimizzazione delle conversioni.",
        description:
          "Le pagine lente fanno perdere oltre metà dei contatti provenienti dalle campagne pubblicitarie. Sviluppiamo infrastrutture web in Next.js/TypeScript con tempi di risposta inferiori a 0.4 secondi, progettate per convertire il traffico in opportunità commerciali.",
        deliverables: [
          "Architettura Next.js / TypeScript con caricamento istantaneo (< 0.4s)",
          "SEO tecnica nativa, dati strutturati Schema.org e indicizzazione rapida",
          "Pannello di gestione contenuti autonomo e veloce",
          "Piena proprietà del codice sul repository della tua azienda",
        ],
        timing: "Da 5 giorni lavorativi",
        target:
          "Aziende B2B con campagne attive o che necessitano di un posizionamento autorevole.",
        ctaText: "Richiedi questo Servizio",
      },
      {
        id: "portali-ecosistemi-b2b",
        number: "02",
        name: "Portali Operativi Custom & Ecosistemi B2B",
        price: "A partire da 5.000€",
        priceSubtext: "Sviluppo a sprint · Fatturazione a milestone",
        summary:
          "Applicazioni web su misura, aree riservate clienti/fornitori, cataloghi dinamici e portali che digitalizzano i processi aziendali.",
        description:
          "Sostituiamo la gestione manuale su fogli di calcolo, email e PDF con portali web proprietari. Centralizziamo ordini, listini riservati e comunicazioni tra azienda, rete vendita e clienti finali.",
        deliverables: [
          "Applicazione Full-Stack su misura (Next.js, TypeScript e PostgreSQL)",
          "Area riservata con accessi differenziati (Clienti, Agenti, Amministrazione)",
          "Cataloghi B2B con listini personalizzati per partita IVA e riordino rapido",
          "Sincronizzazione diretta con gestionali/ERP e pagamenti Stripe B2B",
        ],
        timing: "Da 4 settimane (a sprint)",
        target:
          "Imprese manifatturiere, distributori B2B e società di servizi strutturate.",
        ctaText: "Configura il Portale B2B",
      },
      {
        id: "data-engineering-tracking",
        number: "03",
        name: "Data Engineering, Server-Side Tracking & Analytics",
        price: "A partire da 1.200€",
        priceSubtext: "Setup infrastruttura dati · Audit incluso",
        summary:
          "Superamento dei limiti di cookie e ad-blocker tramite tracciamenti Server-Side e dashboard direzionali sul ROI reale.",
        description:
          "I tracciamenti standard perdono fino al 50% dei dati a causa dei blocchi browser. Implementiamo infrastrutture GTM Server-Side e GA4 avanzato per attribuire con certezza ogni contatto e vendita alla campagna che l'ha generata.",
        deliverables: [
          "Configurazione Google Tag Manager Server-Side su dominio proprietario",
          "Tracciamento eventi avanzato su GA4, Meta CAPI e Google Ads",
          "Allineamento dei dati tra clic pubblicitario, lead e vendita nel CRM",
          "Dashboard direzionale per il controllo di costi di acquisizione e ROI",
        ],
        timing: "Consegna in 7-10 giorni lavorativi",
        target:
          "Imprenditori e Direttori Commerciali che investono in campagne pubblicitarie.",
        ctaText: "Richiedi Audit sui Dati",
      },
      {
        id: "automazione-revops-crm",
        number: "04",
        name: "Automazione Commerciale & Integrazione CRM (RevOps)",
        price: "A partire da 1.500€",
        priceSubtext: "Integrazione HubSpot e CRM Custom",
        summary:
          "Connessione diretta tra sito web e rete vendita: cattura, qualificazione e assegnazione automatica dei lead senza data-entry manuale.",
        description:
          "Eliminiamo i tempi morti tra la richiesta di contatto e la chiamata del commerciale. Ogni nuovo lead viene qualificato automaticamente, arricchito con i dati aziendali e inviato in tempo reale sul CRM del venditore.",
        deliverables: [
          "Integrazione diretta via API/Webhook con HubSpot o CRM aziendali",
          "Qualificazione e classificazione automatica dei contatti in ingresso",
          "Notifica immediata alla rete vendita con storico del cliente",
          "Azzeramento del data-entry manuale e tracciamento della trattativa",
        ],
        timing: "Consegna in 1-2 settimane lavorative",
        target:
          "Reti vendita e Direzioni Commerciali B2B che vogliono velocizzare le chiusure.",
        ctaText: "Automatizza il Flusso CRM",
      },
    ],
  },

  caseStudies: {
    eyebrow: "PROGETTI & ARCHITETTURE REFERENCE",
    title: "Ingegneria applicata e risultati misurabili.",
    subtitle:
      "Architetture dimostrative progettate secondo standard enterprise: caricamento istantaneo, flussi automatizzati e codice verificabile.",
    items: [
      {
        id: "portale-b2b",
        tag: "SERVIZIO 02 · PORTALE OPERATIVO B2B",
        title: "Ecosistema B2B & Portale Ordini Custom",
        clientName: "Valkiria International (Settore Manifatturiero B2B)",
        businessProblem:
          "Ordini gestiti via email o PDF e listini complessi aggiornati a mano, con errori di preventivazione e ritardi amministrativi.",
        solution:
          "Portale operativo B2B con area riservata, listini dinamici per partita IVA e sincronizzazione contabile immediata.",
        description:
          "Piattaforma B2B per la gestione di cataloghi riservati, scontistiche dedicate per cliente e automazione degli ordini.",
        shortDescription: "Portale operativo B2B con listini dinamici per partita IVA e gestione ordini automatizzata.",
        metrics: [
          { label: "Caricamento", value: "LCP < 0.4s", subtext: "Catalogo istantaneo" },
          { label: "Core Web Vitals", value: "100 / 100", subtext: "Massima efficienza" },
          { label: "Affidabilità", value: "Zero Downtime", subtext: "Rete Edge globale" },
        ],
        stack: [
          "Next.js",
          "TypeScript",
          "PostgreSQL",
          "Prisma",
          "Stripe B2B",
          "Accessi RBAC",
        ],
        highlights: [
          "Area riservata per Buyer aziendali, Agenti e Amministrazione",
          "Listini calcolati in tempo reale per partita IVA e volumi d'acquisto",
          "Fatturazione e sincronizzazione ordini senza inserimento manuale",
          "Codice sorgente interamente documentato e di proprietà aziendale",
        ],
        ctaText: "Richiedi un Portale B2B Simile",
        prefillService: "Portali Operativi Custom & Ecosistemi B2B",
        screenshotUrl: "/images/demos/b2b-demo.png",
        demoUrl: "https://b2b-demo.techpyre.eu",
        repoUrl: "https://github.com/techpyre/techpyre-b2b-portal-reference",
      },
      {
        id: "infrastruttura-headless",
        tag: "SERVIZIO 01 + 04 · CONVERSIONE & CRM",
        title: "Infrastruttura di Conversione & Pipeline CRM",
        clientName: "Kinetix Performance (Acquisizione Clienti B2B)",
        businessProblem:
          "Sito lento su CMS tradizionale (> 5 secondi su mobile): oltre il 60% del traffico da campagne pubblicitarie abbandonava la pagina prima del caricamento.",
        solution:
          "Infrastruttura Next.js con caricamento in 0.3 secondi, tracciamento Server-Side e invio istantaneo dei lead nel CRM.",
        description:
          "Sostituzione di una vetrina lenta con un'architettura di conversione ad alta velocità collegata direttamente alla rete vendita.",
        shortDescription: "Infrastruttura veloce (0.3s) con tracciamento Server-Side e invio automatico dei lead al CRM.",
        metrics: [
          { label: "Performance", value: "100 / 100", subtext: "Mobile & Desktop" },
          { label: "Risposta Server", value: "TTFB < 50ms", subtext: "Rete Edge Globale" },
          { label: "Resa Contatti", value: "+68%", subtext: "Traffico recuperato" },
        ],
        stack: [
          "Next.js",
          "TypeScript",
          "Edge Caching",
          "Server-Side Tracking",
          "Webhook CRM",
        ],
        highlights: [
          "Eliminazione di plugin lenti e blocchi di caricamento su mobile",
          "Salvataggio sicuro dei contatti con invio immediato al reparto vendite",
          "Caricamento in meno di 400 millisecondi da qualsiasi dispositivo",
          "Integrazione nativa con HubSpot e gestionali proprietari",
        ],
        ctaText: "Valuta questa Architettura",
        prefillService: "Infrastrutture Web & Architetture di Conversione",
        screenshotUrl: "/images/demos/headless-demo.png",
        demoUrl: "https://headless-demo.techpyre.eu",
        repoUrl: "https://github.com/techpyre/techpyre-headless-leadgen-reference",
      },
    ],
  },

  founder: {
    eyebrow: "DIREZIONE TECNICA · LO STUDIO E IL METODO",
    title: "Perché il 95% dei siti aziendali è un costo morto. E come lo trasformiamo in un asset.",
    subtitle: "Posizionamento e metodo di lavoro di Riccardo Granza, Architetto di Sistemi Digitali e fondatore di TechPyre.",
    name: "Riccardo Granza",
    role: "Fondatore & Architetto di Sistemi Digitali",
    ageBadge: "Architetto di Sistemi Digitali",
    leadershipBadge:
      "Ingegneria del software, controllo dei dati e automazione dei processi commerciali per imprese B2B.",
    manifesto: [
      "Oggi commissionare una semplice vetrina statica significa immobilizzare budget in un costo morto. Una pagina scollegata dai processi aziendali, che impiega sei secondi a caricarsi sul telefono e perde metà dei tracciamenti, brucia investimenti pubblicitari e opportunità commerciali.",
      "Ho fondato TechPyre con un obiettivo preciso: unire lo sviluppo software ad alte prestazioni con il tracciamento dei dati e l'automazione della rete vendita. Progettiamo ecosistemi digitali in cui piattaforma web, analisi del ROI e CRM lavorano come un unico sistema sincronizzato.",
      "Non vendiamo ore di lavoro né template a noleggio. Grazie a un metodo ingegneristico collaudato e ad architetture modulari proprietarie, consegniamo in poche settimane infrastrutture di livello enterprise, riducendo tempi e costi per le PMI strutturate.",
      "Lavoriamo in 4 fasi chiare: (1) Audit dei flussi attuali e delle dispersioni di traffico; (2) Sviluppo dell'infrastruttura, del tracciamento Server-Side e dei collegamenti CRM; (3) Messa online a latenza zero; (4) Ottimizzazione continua basata sui dati reali di vendita.",
      "Ogni riga di codice e ogni dato raccolto restano al 100% di proprietà della tua azienda fin dal primo giorno, garantendo piena indipendenza tecnica e un ritorno sull'investimento misurabile.",
    ],
    quote:
      "«Un sistema digitale ha valore solo se riduce il costo di acquisizione cliente, restituisce il controllo dei dati o elimina un collo di bottiglia operativo.»",
    comparison: {
      legacyTitle: "Fornitori Tradizionali & Soluzioni Low-Cost",
      legacyPoints: [
        "Proprietà e Codice: Piattaforme pesanti o a noleggio con vincoli tecnici e scarsa sicurezza",
        "Tracciamento Dati: Pixel base che perdono fino al 50% delle conversioni per colpa di blocchi browser e cookie",
        "Processi e CRM: Moduli che inviano semplici email, costringendo i commerciali a copiare i dati a mano",
        "Prestazioni e ROI: Caricamenti lenti (4-8 secondi su mobile) che disperdono il budget pubblicitario",
      ],
      techPyreTitle: "TechPyre · Studio di Ingegneria Digitale",
      techPyrePoints: [
        "Proprietà e Codice: Architettura proprietaria intestata al 100% all'azienda, zero canoni di locazione",
        "Tracciamento Dati: Infrastruttura Server-Side per misurare il ritorno reale di ogni campagna",
        "Processi e CRM: Invio e qualificazione automatica dei lead direttamente sul CRM della rete vendita",
        "Prestazioni e ROI: Caricamento istantaneo (< 0.4s) progettato per massimizzare i contatti qualificati",
      ],
    },
  },

  contact: {
    eyebrow: "CONTATTO DIRETTO · SESSIONE DI DIAGNOSI",
    title: "Richiedi una Sessione di Diagnosi Architetturale.",
    subtitle:
      "Analizziamo in 30 minuti le prestazioni attuali, la qualità dei tracciamenti e i flussi commerciali della tua azienda direttamente con Riccardo Granza.",
    formLabels: {
      name: "Nome, Cognome e Ruolo",
      namePlaceholder: "Es. Marco Ferri · Titolare / Direttore Commerciale",
      company: "Azienda / Ragione Sociale",
      companyPlaceholder: "Es. Meccanica Lombarda S.r.l.",
      contact: "Email Aziendale o Telefono",
      contactPlaceholder: "Es. m.ferri@azienda.it o +39 340 1234567",
      service: "Servizio di Interesse Primario",
      message: "Situazione Attuale e Obiettivo",
      messagePlaceholder:
        "Indica sinteticamente gli strumenti attuali e il problema principale da risolvere (lentezza, tracciamento conversioni, integrazione CRM o nuovo portale)...",
      submit: "Richiedi Sessione di Diagnosi",
      submitting: "Invio in corso...",
      privacyNote:
        "Dati trattati con la massima riservatezza nel rispetto del GDPR (Reg. UE 2016/679).",
    },
    channels: [
      {
        label: "Email Diretta",
        value: "riccardo.granza@techpyre.eu",
        subtext: "Riscontro entro la giornata lavorativa",
        href: "mailto:riccardo.granza@techpyre.eu",
      },
      {
        label: "Telefono & WhatsApp",
        value: "+39 379 115 9352",
        subtext: "Contatto rapido con il Fondatore",
        href: "https://wa.me/393791159352",
        isExternal: true,
      },
      {
        label: "Repository GitHub",
        value: "github.com/techpyre",
        subtext: "Architetture dimostrative e codice aperto",
        href: "https://github.com/techpyre",
        isExternal: true,
      },
      {
        label: "Orari dello Studio",
        value: "Lun - Ven · 08:30 - 19:30",
        subtext: "Sessioni da remoto o presso la sede aziendale",
        href: "#",
      },
    ],
    feedback: {
      successTitle: "Richiesta ricevuta con successo.",
      successMessage:
        "Riccardo Granza ha preso in carico la richiesta e ti contatterà entro la giornata lavorativa per fissare la Sessione di Diagnosi.",
      successReset: "Invia una nuova richiesta",
      errorTitle: "Impossibile inviare il modulo.",
      errorMessage:
        "Si è verificato un errore di rete. Scrivi a riccardo.granza@techpyre.eu o chiama il +39 379 115 9352.",
    },
  },

  footer: {
    summary:
      "Studio di Ingegneria ed Ecosistemi Digitali. Infrastrutture web ad alte prestazioni, portali operativi B2B, tracciamento Server-Side e automazione CRM con proprietà del codice al 100%.",
    copyright: `© ${new Date().getFullYear()} TechPyre · Studio di Ingegneria ed Ecosistemi Digitali.`,
    links: [
      {
        title: "Navigazione",
        items: [
          { label: "Servizi B2B", href: "/servizi" },
          { label: "Progetti & Casi Studio", href: "/progetti" },
          { label: "Simulatore Preventivo", href: "/servizi#simulatore" },
          { label: "Lo Studio & Metodo", href: "/studio" },
          { label: "Sessione di Diagnosi (30m)", href: "/#contatto" },
        ],
      },
      {
        title: "Servizi",
        items: [
          { label: "Infrastrutture Web (da 900€)", href: "/servizi" },
          { label: "Portali & Ecosistemi B2B", href: "/servizi" },
          { label: "Data Engineering & Tracking", href: "/servizi" },
          { label: "Automazione CRM (RevOps)", href: "/servizi" },
        ],
      },
      {
        title: "Recapiti Diretti",
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
