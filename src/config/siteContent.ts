import { SiteContent } from "@/types/content";

/**
 * =====================================================================
 * UNICA FONTE DI VERITÀ (SINGLE SOURCE OF TRUTH)
 * Posizionamento: TechPyre — Studio di Ingegneria ed Ecosistemi Digitali
 * Digital Systems & Growth Engineering Studio | High-Ticket B2B
 * =====================================================================
 */
export const siteContent: SiteContent = {
  brand: {
    name: "TechPYRE",
    founder: "Riccardo Granza",
    tagline:
      "Studio di Ingegneria ed Ecosistemi Digitali. Progettiamo infrastrutture web proprietarie, architetture di conversione, data engineering e automazione RevOps per imprese B2B.",
    contactEmail: "riccardo.granza@techpyre.eu",
    phone: "+39 379 115 9352",
    location: "Pagliara (Messina) · Operatività nazionale",
    headquarters: "Via Carrubara Vico III n. 3, 98027 Pagliara (Messina)",
    vatNumber: "In stato di costituzione",
    badge: "STUDIO DI INGEGNERIA ED ECOSISTEMI DIGITALI B2B",
    availabilityNote: "Sede in Italia · Operatività su tutto il territorio nazionale",
  },

  navigation: {
    links: [
      { label: "Pilastri", href: "/servizi" },
      { label: "Architetture", href: "/progetti" },
      { label: "Studio", href: "/studio" },
      { label: "Diagnosi", href: "/#contatto" },
    ],
    cta: {
      label: "Sessione di Diagnosi Architetturale",
      href: "/#contatto",
    },
  },

  hero: {
    badge: "STUDIO DI INGEGNERIA ED ECOSISTEMI DIGITALI · DIGITAL SYSTEMS & GROWTH ENGINEERING",
    headline: {
      line1: "Ingegnerizziamo ecosistemi digitali proprietari per l'acquisizione B2B e l'",
      highlight: "efficienza operativa.",
      line2: "",
    },
    subheadline:
      "Il 95% delle presenze online aziendali è un costo morto scollegato dai ricavi. Progettiamo infrastrutture web in Next.js/TypeScript a latenza zero, tracciamento dati Server-Side e pipeline di automazione CRM (RevOps) che trasformano il traffico in fatturato misurabile. Codice e dati al 100% di proprietà dell'impresa.",
    primaryCta: {
      label: "Richiedi Sessione di Diagnosi Architetturale",
      href: "/#contatto",
      note: "Valutazione ingegneristica di 30 minuti · Analisi di infrastruttura, tracking e flussi CRM",
    },
    secondaryCta: {
      label: "Esplora i 4 Pilastri Architetturali",
      href: "/servizi",
    },
    pillars: [
      {
        id: "01",
        title: "Ecosistemi Digitali Proprietari",
        description:
          "Codice sorgente Next.js/TypeScript e infrastruttura dati intestati al 100% all'azienda committente. Zero lock-in contrattuale e indipendenza tecnica assoluta.",
      },
      {
        id: "02",
        title: "Ingegneria dei Dati & Server-Side",
        description:
          "Superamento strutturale di ad-blocker e restrizioni cookie tramite GTM Server-Side, GA4 custom events e attribuzione millimetrica del ROI pubblicitario.",
      },
      {
        id: "03",
        title: "Latenza Zero & Automazione RevOps",
        description:
          "Caricamento sub-secondo (< 400ms) su rete Edge globale integrato nativamente con HubSpot e CRM custom per azzerare il data-entry manuale.",
      },
    ],
  },

  services: {
    eyebrow: "ARCHITETTURA D'OFFERTA · I 4 PILASTRI INGEGNERISTICI",
    title: "Quattro pilastri architetturali. Un unico ecosistema integrato.",
    subtitle:
      "Non vendiamo ore di sviluppo né vetrine statiche. Ingegnerizziamo l'infrastruttura di acquisizione, l'intelligenza del dato e l'automazione dei processi commerciali con titolarità integrale del codice.",
    guarantee:
      "Modello trasparente CapEx (Setup Infrastrutturale a milestone certe) + OpEx opzionale (Growth Engineering & Continuità). Repository e dati intestati al 100% alla società cliente.",
    items: [
      {
        id: "infrastrutture-conversione",
        number: "01",
        name: "Infrastrutture Web & Architetture di Conversione",
        price: "Da 900€ a 4.000€",
        priceSubtext: "900€ Landing System · 2.000€–4.000€ Piattaforma Corporate",
        summary:
          "Sviluppo di piattaforme web e landing system in Next.js/TypeScript progettati per tempi di caricamento istantanei, SEO tecnica/programmatica e massimizzazione matematica dei tassi di conversione (CRO).",
        description:
          "Le piattaforme monolitiche tradizionali disperdono oltre il 50% del budget pubblicitario a causa di tempi di caricamento superiori ai 3 secondi e architetture informative prive di logica commerciale. Sostituiamo i vecchi CMS con infrastrutture frontend in Next.js e TypeScript distribuite su rete Edge globale, ingegnerizzate per azzerare l'attrito cognitivo e massimizzare la resa di ogni singolo clic.",
        deliverables: [
          "Architettura di conversione in Next.js / TypeScript con tempo di risposta sub-secondo (LCP < 0.4s)",
          "SEO tecnica nativa, alberatura semantica, dati strutturati Schema.org e indicizzazione programmatica",
          "Pannello Headless decoupled per il controllo autonomo dei contenuti senza degradare le prestazioni",
          "Cessione integrale del codice sorgente sul repository GitHub dell'impresa committente",
        ],
        timing: "5–7 giorni (Landing System) · 2–3 settimane (Piattaforma)",
        target:
          "PMI strutturate e aziende B2B con campagne Google/Meta/LinkedIn attive o necessità di posizionamento istituzionale autorevole.",
        ctaText: "Richiedi Diagnosi sull'Infrastruttura Web",
      },
      {
        id: "portali-ecosistemi-b2b",
        number: "02",
        name: "Portali Operativi Custom & Ecosistemi B2B",
        price: "Da 5.000€ a 15.000€",
        priceSubtext: "Sviluppo a sprint settimanali · Fatturazione a milestone",
        summary:
          "Applicazioni web su misura, aree riservate clienti/fornitori, cataloghi dinamici e portali operativi che digitalizzano e snelliscono il lavoro interno ed esterno dell'azienda.",
        description:
          "Quando ordini, listini riservati, documentazioni tecniche e preventivazioni vengono gestiti tramite fogli di calcolo, email o PDF statici, l'azienda subisce errori operativi e colli di bottiglia amministrativi. Progettiamo applicazioni web full-stack proprietarie che centralizzano le operazioni tra azienda, rete vendita, distributori e clienti finali.",
        deliverables: [
          "Applicazione Full-Stack proprietaria su architettura Next.js, TypeScript e database relazionale PostgreSQL",
          "Aree riservate multi-livello con controllo accessi basato sui ruoli (RBAC: Buyer, Agenti, Amministrazione)",
          "Cataloghi B2B dinamici con listini personalizzati per partita IVA, scontistiche a scaglioni e riordino rapido",
          "Sincronizzazione API bidirezionale con gestionali/ERP esistenti e flussi di pagamento/fatturazione Stripe B2B",
        ],
        timing: "Sviluppo a sprint settimanali (4–8 settimane)",
        target:
          "Aziende manifatturiere, distributori B2B e imprese di servizi che necessitano di digitalizzare processi operativi critici.",
        ctaText: "Valuta l'Ingegnerizzazione del Portale B2B",
      },
      {
        id: "data-engineering-tracking",
        number: "03",
        name: "Data Engineering, Server-Side Tracking & Analytics",
        price: "Da 1.200€ a 3.000€",
        priceSubtext: "Setup infrastruttura dati · Audit preliminare incluso",
        summary:
          "Superamento dei limiti di cookie e ad-blocker. Implementazione di tracciamenti avanzati (GA4 custom events, GTM Server-Side) e dashboard direzionali per tracciare il ROI reale di ogni singolo euro investito.",
        description:
          "I tracciamenti client-side standard perdono oggi tra il 30% e il 55% delle conversioni reali a causa di blocchi browser (ITP/Safari), ad-blocker e consensi cookie mal configurati, costringendo il management a prendere decisioni alla cieca. Costruiamo infrastrutture di raccolta dati proprietarie di prima parte (First-Party Data) che restituiscono visibilità chirurgica sull'intero ciclo di acquisizione.",
        deliverables: [
          "Infrastruttura Google Tag Manager Server-Side su cloud dedicato con dominio di prima parte",
          "Architettura eventi custom su GA4, Meta Conversions API (CAPI) e LinkedIn/Google Enhanced Conversions",
          "Riconciliazione del dato tra clic pubblicitario, lead generato e opportunità chiusa a contratto nel CRM",
          "Dashboard direzionale di Business Intelligence per il monitoraggio in tempo reale di CAC, CPL e ROI",
        ],
        timing: "Consegna e validazione dati in 7–10 giorni lavorativi",
        target:
          "Imprenditori e Direttori Commerciali che investono in acquisizione a pagamento ed esigono attribuzione certa del ritorno sull'investimento.",
        ctaText: "Richiedi Audit sull'Infrastruttura Dati",
      },
      {
        id: "automazione-revops-crm",
        number: "04",
        name: "Automazione Commerciale & Integrazione CRM (RevOps)",
        price: "Da 1.500€ a 4.500€",
        priceSubtext: "Architettura pipeline B2B · Integrazione HubSpot / CRM Custom",
        summary:
          "Connessione diretta tra l'infrastruttura web e la rete vendita (HubSpot e CRM custom). Cattura, arricchimento e qualificazione automatica dei lead, eliminando il data-entry manuale e i colli di bottiglia commerciali.",
        description:
          "Un lead B2B contattato dopo 24 ore ha una probabilità di chiusura inferiore dell'80% rispetto a uno gestito nei primi 5 minuti. Eliminiamo la frattura tra marketing e vendite ingegnerizzando pipeline RevOps automatizzate: dal momento in cui il prospect interagisce con l'ecosistema web, il dato viene validato, arricchito con informazioni societarie, classificato per priorità e assegnato istantaneamente al commerciale competente.",
        deliverables: [
          "Integrazione nativa bidirezionale via API/Webhook tra ecosistema web, HubSpot o CRM proprietari",
          "Flussi automatizzati di lead capture, arricchimento dati B2B, lead scoring e qualificazione pre-chiamata",
          "Notifiche operative istantanee alla rete vendita con contesto completo dell'interazione del prospect",
          "Eliminazione del data-entry manuale, sequenze di follow-up automatizzate e tracciamento della pipeline",
        ],
        timing: "Implementazione e collaudo in 1–2 settimane lavorative",
        target:
          "Direzioni Commerciali e reti vendita B2B che vogliono azzerare i tempi di presa in carico dei lead e scalare le conversioni.",
        ctaText: "Ingegnerizza la Pipeline Commerciale",
      },
    ],
  },

  caseStudies: {
    eyebrow: "ARCHITETTURE REFERENCE & ECOSISTEMI DIMOSTRATIVI",
    title: "Ingegneria applicata, latenza zero e metriche verificabili.",
    subtitle:
      "Ecosistemi dimostrativi progettati secondo rigorosi standard industriali: infrastrutture Next.js/TypeScript, automazione dei flussi operativi e totale assenza di debito tecnico legacy.",
    items: [
      {
        id: "portale-b2b",
        tag: "PILASTRO 02 · PORTALE OPERATIVO & ECOSISTEMA B2B",
        title: "Ecosistema B2B & Portale Ordini Custom",
        clientName: "Valkiria International (Architettura Reference Manifatturiero B2B)",
        businessProblem:
          "Processi commerciali frammentati con ordini trasmessi via email o PDF, listini complessi gestiti manualmente su fogli di calcolo, errori ricorrenti di preventivazione e colli di bottiglia amministrativi.",
        solution:
          "Portale operativo B2B proprietario con area riservata RBAC, listini dinamici per partita IVA, riordino automatizzato e sincronizzazione contabile in tempo reale.",
        description:
          "Architettura reference per la digitalizzazione dei processi d'ordine B2B, gestione di cataloghi riservati, scontistiche contrattuali personalizzate e riconciliazione amministrativa automatica.",
        shortDescription: "Portale operativo B2B con listini dinamici per partita IVA, controllo accessi RBAC e automazione ordini.",
        metrics: [
          { label: "Largest Contentful Paint", value: "LCP < 0.4s", subtext: "Latenza zero su catalogo" },
          { label: "Core Web Vitals", value: "100 / 100", subtext: "Efficienza architetturale" },
          { label: "Continuità Operativa", value: "Zero Downtime", subtext: "Infrastruttura Edge ridondata" },
        ],
        stack: [
          "Next.js App Router",
          "TypeScript",
          "PostgreSQL",
          "Prisma ORM",
          "Stripe B2B Webhook",
          "Autenticazione RBAC",
        ],
        highlights: [
          "Area riservata con controllo accessi granulare (Buyer aziendali, Rete Agenti, Direzione Amministrativa)",
          "Listini dinamici calcolati in tempo reale per partita IVA, accordi quadro e scaglioni di volume",
          "Automazione del ciclo attivo e sincronizzazione via webhook senza data-entry manuale",
          "Codice sorgente tipizzato e documentato secondo standard industriali OpenAPI",
        ],
        ctaText: "Richiedi un Ecosistema Operativo Simile",
        prefillService: "Portali Operativi Custom & Ecosistemi B2B",
        screenshotUrl: "/images/demos/b2b-demo.png",
        demoUrl: "https://b2b-demo.techpyre.eu",
        repoUrl: "https://github.com/techpyre/techpyre-b2b-portal-reference",
      },
      {
        id: "infrastruttura-headless",
        tag: "PILASTRO 01 + 04 · ARCHITETTURA DI CONVERSIONE & REVOPS",
        title: "Infrastruttura di Conversione & Pipeline RevOps",
        clientName: "Kinetix Performance (Architettura Reference Acquisizione B2B)",
        businessProblem:
          "Piattaforma legacy monolitica con oltre 5 secondi di caricamento mobile e tracciamento client-side bloccato: oltre il 60% del traffico pagato abbandonava prima del rendering e i lead acquisiti venivano lavorati con ore di ritardo.",
        solution:
          "Infrastruttura di conversione in Next.js su CDN Edge globale (0.3s), tracking Server-Side e iniezione istantanea dei lead qualificati nel CRM della rete vendita.",
        description:
          "Sostituzione di una vetrina statica ad alta dispersione con un'architettura di conversione ad alte prestazioni collegata direttamente alla pipeline commerciale aziendale.",
        shortDescription: "Infrastruttura Next.js a latenza zero (0.3s) con tracking Server-Side e automazione webhook verso il CRM.",
        metrics: [
          { label: "Lighthouse Performance", value: "100 / 100", subtext: "Architettura Mobile & Desktop" },
          { label: "Time to First Byte", value: "TTFB < 50ms", subtext: "Distribuzione Edge Globale" },
          { label: "Resa di Conversione", value: "+68%", subtext: "Abbattimento dispersione traffico" },
        ],
        stack: [
          "Next.js",
          "TypeScript",
          "Edge Caching",
          "Server-Side Tracking",
          "Webhook CRM / RevOps",
        ],
        highlights: [
          "Rimozione totale di page-builder, plugin vulnerabili e colli di bottiglia di rendering",
          "Coda asincrona di failover per garantire zero perdita di dati anche in caso di picchi di traffico",
          "Pre-rendering ibrido (SSG/ISR) per caricamento istantaneo su rete mobile in meno di 400 millisecondi",
          "Qualificazione automatica del lead e instradamento diretto su HubSpot e database proprietari",
        ],
        ctaText: "Valuta l'Architettura di Conversione",
        prefillService: "Infrastrutture Web & Architetture di Conversione",
        screenshotUrl: "/images/demos/headless-demo.png",
        demoUrl: "https://headless-demo.techpyre.eu",
        repoUrl: "https://github.com/techpyre/techpyre-headless-leadgen-reference",
      },
    ],
  },

  founder: {
    eyebrow: "DIREZIONE TECNICA · ARCHITETTURA DI SISTEMI DIGITALI",
    title: "Perché il 95% delle presenze online aziendali è un costo morto. E come lo trasformiamo in un asset.",
    subtitle: "Tesi strategica, metodo ingegneristico in 4 fasi e posizionamento di Riccardo Granza, Architetto di Sistemi Digitali e fondatore di TechPYRE.",
    name: "Riccardo Granza",
    role: "Fondatore & Architetto di Sistemi Digitali",
    ageBadge: "Digital Systems Architect · Direzione Tecnica",
    leadershipBadge:
      "Approccio First-Principles · Ingegneria del software, architettura dei dati e automazione dei processi commerciali B2B.",
    manifesto: [
      "Nell'era dei generatori basati su intelligenza artificiale e dei page-builder No-Code, commissionare una semplice vetrina statica equivale a immobilizzare capitale in un passivo di bilancio. Una pagina scollegata dai sistemi informativi dell'azienda, che impiega sei secondi a caricarsi su rete mobile e perde metà dei dati di tracciamento a causa dei blocchi browser, non è un asset commerciale: è un attrito operativo che brucia budget pubblicitario e credibilità.",
      "Ho fondato TechPYRE con una tesi ingegneristica precisa: unire l'ingegneria informatica pura — stack moderno Next.js e TypeScript, sicurezza strutturale, latenza zero su rete Edge — con l'ingegneria della conversione, del dato Server-Side e dell'automazione commerciale (RevOps). Come Architetto di Sistemi Digitali, progetto ecosistemi proprietari in cui piattaforma web, tracciamento analitico e CRM operano come un unico organismo sincronizzato.",
      "Rifiutiamo il bloatware, i temi preconfezionati e i modelli di fornitura basati sulla vendita di ore o canoni di locazione del codice. Al nostro interno utilizziamo l'intelligenza artificiale non come surrogato economico per produrre artefatti mediocri, ma come acceleratore ingegneristico nei processi di analisi, testing e automazione. Questo ci consente di comprimere i tempi di rilascio da mesi a poche settimane, consegnando alle PMI strutturate infrastrutture di livello enterprise con un ritorno sull'investimento matematicamente verificabile.",
      "Il nostro metodo operativo si articola in quattro fasi sequenziali: (1) Audit Architetturale & Mappatura dei Flussi per isolare dispersioni di traffico e colli di bottiglia commerciali; (2) Ingegnerizzazione & Sviluppo Infrastrutturale con codice custom, GTM Server-Side e integrazione CRM; (3) Deploy, Stress-Test & Integrazione Operativa a latenza zero; (4) Growth Engineering & Ottimizzazione Continua basata su telemetria GA4, test statistici e scalabilità evolutiva.",
      "Ogni riga di codice sorgente, ogni container di tracciamento e ogni pipeline dati viene rilasciata sul repository ufficiale dell'azienda committente fin dal primo giorno. Chi sceglie TechPYRE acquisisce un'infrastruttura digitale proprietaria costruita per generare margine, efficienza e vantaggio competitivo misurabile.",
    ],
    quote:
      "«Un'infrastruttura digitale ha valore solo se riduce il costo di acquisizione cliente, restituisce la proprietà integrale del dato o elimina un collo di bottiglia operativo. Tutto il resto è rumore estetico.»",
    comparison: {
      legacyTitle: "Fornitori Tradizionali & Soluzioni No-Code / Low-Cost",
      legacyPoints: [
        "Proprietà e Qualità del Codice: CMS monolitici gonfi di plugin, template condivisi o piattaforme No-Code a noleggio con lock-in tecnico e vulnerabilità croniche",
        "Tracciamento Dati e Privacy: Pixel client-side elementari che perdono fino al 50% delle conversioni reali per via di ad-blocker e restrizioni ITP/cookie",
        "Integrazione Processi (CRM/RevOps): Moduli di contatto isolati che inviano semplici email, costringendo il team commerciale al data-entry manuale e a ritardi di ore",
        "Performance, Scalabilità e ROI: Tempi di caricamento superiori a 4–8 secondi su mobile che bruciano budget pubblicitario senza metriche di impatto sul fatturato",
      ],
      techPyreTitle: "TechPYRE — Studio di Ingegneria ed Ecosistemi Digitali",
      techPyrePoints: [
        "Proprietà e Qualità del Codice: Architettura custom in Next.js/TypeScript intestata al 100% all'azienda su repository GitHub proprietario, zero debito legacy",
        "Tracciamento Dati e Privacy: Data engineering di prima parte con GTM Server-Side, GA4 custom events e Conversions API per un'attribuzione certa del ROI",
        "Integrazione Processi (CRM/RevOps): Sincronizzazione bidirezionale via API/Webhook con HubSpot e CRM custom per qualificazione, arricchimento e assegnazione istantanea dei lead",
        "Performance, Scalabilità e ROI: Infrastruttura Edge a latenza zero (LCP < 0.4s) progettata per massimizzare il tasso di conversione e il ritorno sull'investimento B2B",
      ],
    },
  },

  contact: {
    eyebrow: "VALUTAZIONE TECNICA · ACCESSO DIRETTO ALL'ARCHITETTO DI SISTEMI",
    title: "Richiedi una Sessione di Diagnosi Architetturale.",
    subtitle:
      "Sottoponi la tua attuale infrastruttura digitale a un'analisi ingegneristica preliminare. Esamineremo metriche di caricamento, dispersione dei tracciamenti e colli di bottiglia nella pipeline CRM direttamente con Riccardo Granza.",
    formLabels: {
      name: "Nome, Cognome e Ruolo Aziendale",
      namePlaceholder: "Es. Marco Ferri — CEO / Direttore Commerciale",
      company: "Ragione Sociale e Settore B2B",
      companyPlaceholder: "Es. Siderurgica Lombarda S.r.l. (Manifatturiero)",
      contact: "Email Aziendale o Recapito Diretto",
      contactPlaceholder: "Es. m.ferri@azienda.it oppure +39 340 1234567",
      service: "Pilastro Architetturale di Interesse Primario",
      message: "Infrastruttura Attuale e Collo di Bottiglia Principale",
      messagePlaceholder:
        "Indica lo stack attuale (CMS, CRM in uso, campagne attive) e la criticità principale da risolvere (dispersione lead, lentezza mobile, assenza di tracciamento ROI o processi manuali)...",
      submit: "Richiedi Sessione di Diagnosi Architetturale",
      submitting: "Trasmissione specifica tecnica in corso...",
      privacyNote:
        "I dati aziendali trasmessi sono protetti da riservatezza professionale e trattati nel rigoroso rispetto del GDPR (Reg. UE 2016/679).",
    },
    channels: [
      {
        label: "Email Direzione Tecnica",
        value: "riccardo.granza@techpyre.eu",
        subtext: "Riscontro analitico entro la giornata lavorativa",
        href: "mailto:riccardo.granza@techpyre.eu",
      },
      {
        label: "Linea Diretta & WhatsApp B2B",
        value: "+39 379 115 9352",
        subtext: "Comunicazioni operative dirette con il Fondatore",
        href: "https://wa.me/393791159352",
        isExternal: true,
      },
      {
        label: "Repository & Architetture Reference",
        value: "github.com/techpyre",
        subtext: "Ispezione pubblica della qualità del codice sorgente",
        href: "https://github.com/techpyre",
        isExternal: true,
      },
      {
        label: "Operatività dello Studio",
        value: "Lun — Ven · 08:30 — 19:30",
        subtext: "Fuso orario di Roma · Sessioni da remoto o presso la sede cliente",
        href: "#",
      },
    ],
    feedback: {
      successTitle: "Richiesta di Diagnosi Architetturale registrata.",
      successMessage:
        "La specifica preliminare è stata acquisita. Riccardo Granza esaminerà i parametri indicati e ti contatterà entro la giornata lavorativa per pianificare la Sessione di Diagnosi Architetturale.",
      successReset: "Invia una nuova specifica tecnica",
      errorTitle: "Anomalia di trasmissione rilevata.",
      errorMessage:
        "Non è stato possibile recapitare il modulo. Contatta direttamente la direzione tecnica a riccardo.granza@techpyre.eu o al numero +39 379 115 9352.",
    },
  },

  footer: {
    summary:
      "Studio di Ingegneria ed Ecosistemi Digitali (Digital Systems & Growth Engineering Studio). Progettiamo infrastrutture web ad alte prestazioni, portali operativi B2B, data engineering Server-Side e automazione RevOps con proprietà integrale del codice.",
    copyright: `© ${new Date().getFullYear()} TechPYRE — Studio di Ingegneria ed Ecosistemi Digitali · Architettura proprietaria Next.js / TypeScript.`,
    links: [
      {
        title: "Architettura & Metodo",
        items: [
          { label: "I 4 Pilastri Architetturali", href: "/servizi" },
          { label: "Ecosistemi Reference Live", href: "/progetti" },
          { label: "Configuratore Architetturale", href: "/servizi#simulatore" },
          { label: "Tesi Strategica & Metodo", href: "/studio" },
          { label: "Sessione di Diagnosi (30m)", href: "/#contatto" },
        ],
      },
      {
        title: "Pilastri d'Offerta",
        items: [
          { label: "Infrastrutture Web & Conversione", href: "/servizi" },
          { label: "Portali Operativi & Ecosistemi B2B", href: "/servizi" },
          { label: "Data Engineering & Server-Side", href: "/servizi" },
          { label: "Automazione Commerciale & RevOps", href: "/servizi" },
        ],
      },
      {
        title: "Direzione Tecnica",
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
