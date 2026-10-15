import { SiteContent } from "@/types/content";

/**
 * =====================================================================
 * UNICA FONTE DI VERITÀ (SINGLE SOURCE OF TRUTH)
 * Testi snelli, pragmatici ed essenziali.
 * Cambiando `brand.name`, il nome dello studio si aggiorna ovunque.
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
      { label: "Simulatore B2B", href: "#simulatore" },
      { label: "Il Fondatore", href: "#storia" },
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
      "Architetture web proprietarie, landing page ad alta resa commerciale ed ecosistemi B2B. Unico referente tecnico, costi certi prima di iniziare e codice 100% di proprietà dell'azienda.",
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
        title: "Responsabilità Diretta",
        description:
          "Unico referente tecnico: risponde direttamente Riccardo Granza senza commerciali intermediari.",
      },
      {
        id: "02",
        title: "Patti Chiari e Prezzo Certo",
        description:
          "Importi definiti prima di iniziare le attività. Nessun canone occulto e codice 100% tuo.",
      },
      {
        id: "03",
        title: "Ingegneria Nativa",
        description:
          "Next.js e TypeScript nativo per tempi di risposta sub-secondo (< 400ms) e manutenzione minima.",
      },
    ],
  },

  services: {
    eyebrow: "LISTINO B2B · TRASPARENZA CONTRATTUALE",
    title: "Quattro soluzioni chiare. Tariffe certe prima dell'inizio.",
    subtitle:
      "Specifiche definite, tempi certi e piena titolarità del codice rilasciato sul repository della tua azienda.",
    guarantee:
      "Ogni importo concordato è definitivo. Repository e infrastruttura intestati interamente alla società cliente.",
    items: [
      {
        id: "consulenza",
        number: "01",
        name: "Consulenza Informatica & Marketing Digitale",
        price: "Primi 30 min Gratuiti, poi 100€ / ora",
        priceSubtext: "Prima sessione di inquadramento a costo zero",
        summary:
          "Audit analitico dei sistemi esistenti, diagnosi delle inefficienze e piano di acquisizione clienti.",
        description:
          "Confronto pragmatico per verificare le prestazioni dell'infrastruttura, risolvere colli di bottiglia commerciali o definire le specifiche prima di investimenti importanti.",
        deliverables: [
          "Colloquio preliminare di 30 minuti gratuito",
          "Audit tecnico su prestazioni, sicurezza e tracciamenti",
          "Revisione della pipeline commerciale e conversioni",
          "Relazione con le priorità di intervento operativo",
        ],
        timing: "Pianificazione su appuntamento concordato",
        target:
          "Imprenditori e dirigenti che desiderano un parere tecnico indipendente e misurato.",
        ctaText: "Prenota i 30 Minuti Gratuiti",
      },
      {
        id: "landing-page",
        number: "02",
        name: "Landing Page ad Alta Conversione",
        price: "500€ (Prezzo Fisso)",
        priceSubtext: "Consegna a corpo · Nessun canone periodico",
        summary:
          "Pagina singola ultra-performante per acquisizione di lead qualificati e validazione di offerta.",
        description:
          "Sviluppata senza page builder pesanti. Codice nativo Next.js ultra-leggero, testi persuasivi e moduli integrati per una resa commerciale immediata.",
        deliverables: [
          "Design su misura calibrato sull'identità aziendale",
          "Frontend Next.js per risposta istantanea (< 400ms)",
          "Integrazione moduli con notifica email immediata e CRM",
          "Piena titolarità del codice sul repository dell'impresa",
        ],
        timing: "Consegna online in 5–7 giorni lavorativi",
        target:
          "Aziende che lanciano un servizio mirato o campagne Google/LinkedIn Ads.",
        ctaText: "Richiedi la Landing Page a 500€",
      },
      {
        id: "blueprint",
        number: "03",
        name: "Blueprint Ingegneristico del Sito",
        price: "Da 1.500€ a 2.500€",
        priceSubtext: "Faldone esecutivo di proprietà dell'azienda",
        summary:
          "Il piano tecnico architetturale completo prima dello sviluppo: schemi dati, wireframe e preventivi analitici.",
        description:
          "La documentazione esecutiva completa del vostro software: liberi di affidarne lo sviluppo a noi o a chiunque altro, senza vincoli di dipendenza.",
        deliverables: [
          "Documento formale dei requisiti e dell'architettura",
          "Schema dati relazionale con criteri di sicurezza",
          "Wireframe ad alta fedeltà di tutti i flussi utente",
          "Stima esatta tempi e costi di sviluppo per milestone",
        ],
        timing: "Consegna in 10–14 giorni lavorativi",
        target:
          "Aziende che pianificano piattaforme complesse, gestionali o portali ad alto traffico.",
        ctaText: "Richiedi il Blueprint Tecnico",
      },
      {
        id: "ecosistema",
        number: "04",
        name: "Sito Web ed Ecosistema Completo",
        price: "Da 5.000€ a 15.000€",
        priceSubtext: "Fatturazione a stati di avanzamento verificati",
        summary:
          "Piattaforma aziendale su misura, area riservata B2B e web application custom con standard di sicurezza elevati.",
        description:
          "Dalla progettazione alla messa in produzione. Infrastruttura resiliente per alti volumi, integrata con gestionali, CRM e flussi di pagamento.",
        deliverables: [
          "Architettura Full-Stack su Next.js e TypeScript",
          "Area riservata con autenticazione a ruoli sicura",
          "Integrazione API con gestionali aziendali o Stripe",
          "60 giorni di assistenza e monitoraggio post-rilascio",
        ],
        timing: "Sviluppo a sprint settimanali (4–8 settimane)",
        target:
          "Industrie manifatturiere, società di servizi e realtà strutturate.",
        ctaText: "Esponi le Tue Esigenze",
      },
    ],
  },

  founder: {
    eyebrow: "RELAZIONE E RESPONSABILITÀ · IL PROFILO DEL FONDATORE",
    title: "Responsabilità diretta sul codice. Risponde il fondatore.",
    subtitle: "Manifesto professionale di Riccardo Granza, fondatore di TechPYRE.",
    name: "Riccardo Granza",
    role: "Fondatore e Lead Software Engineer",
    ageBadge: "Diciotto anni. La serietà di chi garantisce ogni riga di codice in prima persona.",
    manifesto: [
      "Chi conduce un'impresa seria sa che la parola data e la precisione esecutiva contano più di qualsiasi presentazione patinata.",
      "Ho 18 anni e ho fondato questo studio per offrire un'alternativa concreta all'inefficienza di molte agenzie tradizionali: strutture sovradimensionate che addebitano parcelle elevate per sostenere uffici di rappresentanza, finendo per delegare lo sviluppo a terzi su tecnologie obsolete.",
      "La mia giovane età è una garanzia tangibile per il committente: chi si affaccia sul mercato con il proprio nome e la propria reputazione ha un solo mezzo per affermarsi, ovvero garantire una qualità tecnica, una rapidità e un'attenzione scrupolosa che le grandi strutture non sono più in grado di esprimere.",
      "In TechPYRE utilizziamo le architetture adottate dai migliori centri di ingegneria al mondo: Next.js nativo, TypeScript, reti edge distribuite. Il codice sorgente, l'infrastruttura e i dati restano al 100% di proprietà dell'azienda cliente.",
    ],
    quote:
      "«La reputazione nel B2B si costruisce con software stabile che non cede, consegne puntuali e risultati economici concreti per l'azienda cliente.»",
    comparison: {
      legacyTitle: "La prassi delle agenzie tradizionali",
      legacyPoints: [
        "Tempi di risposta lunghi mediati da commerciali non tecnici",
        "Piattaforme obsolete e template riciclati tra committenti diversi",
        "Tariffe gravate da spese fisse di rappresentanza e riunioni sterili",
        "Codice trattenuto dall'agenzia con vincoli per ostacolare la migrazione",
      ],
      techPyreTitle: "Il modello di partnership diretta di TechPYRE",
      techPyrePoints: [
        "Contatto diretto con Riccardo Granza su telefono e WhatsApp",
        "Codice proprietario su misura (Next.js e TypeScript nativo)",
        "Tariffe pattuite prima dell'inizio e fatturate a milestone verificate",
        "Proprietà intellettuale integrale: repository e server del cliente",
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
        "I dati forniti sono trattati con il massimo riserbo. Nessun invio promozionale non richiesto.",
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
      "Studio di ingegneria del software e consulenza tecnologica ad alte prestazioni. Architetture proprietarie, portali B2B e landing page commerciali con il rigore e la trasparenza propri della migliore consuetudine professionale.",
    copyright: `© ${new Date().getFullYear()} TechPYRE STUDIO · Sviluppato e manutenuto con codice proprietario.`,
    links: [
      {
        title: "Patti e Principi",
        items: [
          { label: "Listino Servizi B2B", href: "#servizi" },
          { label: "Il Fondatore", href: "#storia" },
          { label: "Simulatore B2B", href: "#simulatore" },
          { label: "Colloquio 30m Gratuito", href: "#contatto" },
        ],
      },
      {
        title: "Specifiche Operative",
        items: [
          { label: "Audit e Consulenza", href: "#servizi" },
          { label: "Landing Page a 500€", href: "#servizi" },
          { label: "Blueprint Architetturale", href: "#servizi" },
          { label: "Ecosistema Completo", href: "#servizi" },
        ],
      },
      {
        title: "Recapiti Personali",
        items: [
          { label: "riccardo.granza@techpyre.eu", href: "mailto:riccardo.granza@techpyre.eu" },
          { label: "WhatsApp: +39 379 115 9352", href: "https://wa.me/393791159352", isExternal: true },
          { label: "Telefono Fondatore", href: "tel:+393791159352" },
        ],
      },
    ],
  },
};

export const brandName = siteContent.brand.name;
