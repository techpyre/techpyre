import { SiteContent } from "@/types/content";

/**
 * =====================================================================
 * UNICA FONTE DI VERITÀ (SINGLE SOURCE OF TRUTH)
 * Modificando il valore di `brand.name`, il nome dello studio si aggiorna
 * istantaneamente in tutta la piattaforma (Navbar, Hero, Bio, Footer,
 * Metadata SEO, Box di Contatto e Notifiche email).
 * =====================================================================
 */
export const siteContent: SiteContent = {
  brand: {
    name: "TechPYRE",
    founder: "Riccardo Granza",
    tagline:
      "Studio di ingegneria del software e posizionamento digitale per imprese.",
    contactEmail: "riccardo@techpyre.com",
    phone: "+39 340 000 0000",
    location: "Sede in Italia · Operatività nazionale",
    badge: "Ingegneria del Software B2B",
    availabilityNote: "Sede in Italia · Operatività su tutto il territorio nazionale",
  },

  navigation: {
    links: [
      { label: "Listino Servizi", href: "#servizi" },
      { label: "Simulatore di Progetto", href: "#simulatore" },
      { label: "Il Metodo e la Visione", href: "#storia" },
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
      "Progettiamo e sviluppiamo architetture web proprietarie, landing page ad alta resa commerciale e piattaforme aziendali complesse. Con l'onestà e la serietà tipiche della migliore tradizione bancaria e professionale italiana, poniamo al centro la responsabilità personale, la certezza dei costi e la durata nel tempo.",
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
          "Nessuna delega a commerciali o figure intermedie. L'interlocutore unico è chi pianifica l'architettura tecnica e ne garantisce il funzionamento in prima persona.",
      },
      {
        id: "02",
        title: "Patti Chiari e Prezzo Certo",
        description:
          "Tariffe pubbliche, contrattualizzate prima dell'inizio delle attività. Nessun canone occulto: l'intero codice sorgente e i dati restano di proprietà esclusiva dell'impresa.",
      },
      {
        id: "03",
        title: "Ingegneria Resiliente",
        description:
          "Codice proprietario redatto riga per riga su standard moderni (Next.js, TypeScript nativo). Pagine con rendering istantaneo, sicurezza solida e manutenzione ridotta.",
      },
    ],
  },

  services: {
    eyebrow: "LISTINO B2B · TRASPARENZA CONTRATTUALE",
    title: "La fiducia nasce dalla chiarezza. I nostri quattro livelli di intervento.",
    subtitle:
      "A differenza delle prassi di mercato che dissimulano i costi dietro preventivi opachi, presentiamo specifiche esecutive dettagliate con importi definiti prima dell'avvio dei lavori.",
    guarantee:
      "Ogni importo concordato è definitivo. Il codice sorgente e l'infrastruttura di erogazione sono intestati interamente alla società cliente.",
    items: [
      {
        id: "consulenza",
        number: "01",
        name: "Consulenza Informatica & Marketing Digitale",
        price: "Primi 30 min Gratuiti, poi 100€ / ora",
        priceSubtext: "Prima sessione di inquadramento sempre offerta a costo zero",
        summary:
          "Audit analitico dei sistemi esistenti, diagnosi delle inefficienze e pianificazione della strategia di acquisizione clienti.",
        description:
          "Un confronto pragmatico e approfondito per verificare la solidità dell'infrastruttura attuale, comprendere le ragioni del mancato rendimento commerciale del sito o definire i requisiti corretti prima di stanziare investimenti importanti.",
        deliverables: [
          "Colloquio preliminare di 30 minuti completamente gratuito",
          "Audit tecnico delle prestazioni, della sicurezza e dei tracciamenti analitici",
          "Revisione della pipeline commerciale e delle pagine di acquisizione contatti",
          "Relazione sintetica con le priorità di intervento operativo a breve termine",
        ],
        timing: "Pianificazione su appuntamento concordato",
        target:
          "Titolari d'azienda, direttori operativi e professionisti che desiderano un parere tecnico indipendente e misurato.",
        ctaText: "Prenota i 30 Minuti Gratuiti",
      },
      {
        id: "landing-page",
        number: "02",
        name: "Landing Page ad Alta Conversione",
        price: "500€ (Prezzo Fisso)",
        priceSubtext: "Consegna a corpo · Nessun costo periodico obbligatorio",
        summary:
          "Pagina singola progettata con precisione per un obiettivo commerciale definito: validazione di offerta o acquisizione di lead qualificati.",
        description:
          "Rifiutiamo l'impiego di template preconfezionati o page builder approssimativi. Sviluppiamo codice proprietario leggero e sicuro, accompagnato da un impianto testuale sobrio e mirato alla decisione di acquisto nel segmento B2B.",
        deliverables: [
          "Layout e composizione grafica esclusiva, calibrati sull'identità dell'azienda",
          "Testi redatti con cura editoriale e privi di formule promozionali abusate",
          "Frontend su misura Next.js per un tempo di risposta istantaneo (< 400ms)",
          "Integrazione dei moduli con inoltro immediato a email aziendale e CRM",
          "Configurazione rigorosa degli strumenti analitici nel rispetto delle normative",
          "Piena titolarità del codice rilasciato sul repository dell'impresa",
        ],
        timing: "Consegna e pubblicazione online in 5–7 giorni lavorativi",
        target:
          "Imprese che promuovono un servizio specifico, studi professionali e campagne su circuiti Google o LinkedIn.",
        ctaText: "Richiedi la Landing Page a 500€",
      },
      {
        id: "blueprint",
        number: "03",
        name: "Blueprint Ingegneristico del Sito",
        price: "Da 1.500€ a 2.500€",
        priceSubtext: "Faldone esecutivo di proprietà assoluta del committente",
        summary:
          "Il piano tecnico architetturale completo prima della fase di sviluppo: schemi dati, wireframe esecutivi e preventivazione analitica.",
        description:
          "Nessuna opera duratura viene intrapresa senza il calcolo dell'ingegnere. Il Blueprint fornisce la documentazione esecutiva completa del vostro software: resterete liberi di affidarne la costruzione a noi o a qualsiasi altro team tecnico sul mercato, senza alcuna dipendenza vincolante.",
        deliverables: [
          "Documento formale dei requisiti funzionali e dell'architettura di sistema",
          "Schema relazionale del database con definizione dei criteri di sicurezza",
          "Wireframe strutturali ad alta definizione di tutti i percorsi utente",
          "Analisi comparativa dei fornitori cloud e stima esatta dei costi di esercizio",
          "Specifiche tecniche delle interfacce applicative (API) per integrazioni gestionali",
        ],
        timing: "Elaborazione e consegna in 10–14 giorni lavorativi",
        target:
          "Aziende che pianificano una piattaforma web complessa, un gestionale interno o un portale ad alto traffico.",
        ctaText: "Richiedi il Blueprint Tecnico",
      },
      {
        id: "ecosistema",
        number: "04",
        name: "Sito Web ed Ecosistema Completo",
        price: "Da 5.000€ a 15.000€",
        priceSubtext: "Fatturazione a stati di avanzamento concordati e verificati",
        summary:
          "Sviluppo completo di piattaforme aziendali complesse, aree riservate B2B e web application custom con standard di sicurezza bancari.",
        description:
          "Dalla fase progettuale alla messa in produzione. Realizziamo infrastrutture tecnologiche resilienti capaci di reggere volumi significativi senza flessioni prestazionali, corredate da un'interfaccia di amministrazione chiara e accessibile.",
        deliverables: [
          "Architettura Full-Stack completa su tecnologie contemporanee (Next.js, TypeScript)",
          "Database relazionale con replica, cifratura e procedure di backup automatizzate",
          "Area riservata con autenticazione sicura a più fattori e gestione permessi di ruolo",
          "Pannello di controllo su misura per la gestione autonoma dei contenuti",
          "Integrazione con i software gestionali aziendali, sistemi documentali e pagamenti",
          "Pipeline di rilascio automatizzata con 60 giorni di assistenza e monitoraggio inclusi",
        ],
        timing: "Sviluppo cadenzato a sprint settimanali (4–10 settimane con collaudi congiunti)",
        target:
          "Società strutturate, industrie manifatturiere e realtà di servizi che richiedono una presenza digitale definitiva.",
        ctaText: "Esponi le Tue Esigenze",
      },
    ],
  },

  founder: {
    eyebrow: "RELAZIONE E RESPONSABILITÀ · IL PROFILO DEL FONDATORE",
    title: "Un impegno di trasparenza verso l'impresa. La reputazione è la misura di ogni nostro lavoro.",
    subtitle: "Manifesto professionale di Riccardo Granza, fondatore di TechPYRE.",
    name: "Riccardo Granza",
    role: "Fondatore e Lead Software Engineer",
    ageBadge: "Diciotto anni. La serietà e la determinazione di chi risponde personalmente.",
    manifesto: [
      "Chi conduce un'impresa seria sa che la parola data e la precisione esecutiva contano più di qualsiasi presentazione patinata.",
      "Ho 18 anni e ho fondato questo studio per offrire un'alternativa concreta all'inefficienza di molte agenzie tradizionali: strutture sovradimensionate che addebitano parcelle elevate per sostenere uffici di rappresentanza e strati di gestione burocratica, finendo poi per delegare lo sviluppo a figure junior su tecnologie obsolete.",
      "La mia giovane età non è una circostanza da nascondere dietro un artificioso pluralismo societario: per il cliente è una garanzia tangibile. Chi entra sul mercato con il proprio nome e la propria reputazione ha un solo mezzo per affermarsi: garantire una qualità tecnica, una rapidità e un'attenzione scrupolosa che le strutture sedute sulle consuetudini non sono più in grado di esprimere.",
      "In TechPYRE mettiamo a disposizione delle imprese le medesime architetture adottate dai centri di ingegneria più avanzati al mondo: Next.js, TypeScript nativo, reti distribuite ed elaborazione edge. Il risultato sono prodotti stabili, sicuri e proprietari, proposti a condizioni eque perché depurati da ogni intermediario non produttivo.",
      "Come accade nei rapporti professionali più solidi, tracciamo idealmente un perimetro di tutela attorno all'impresa: al suo interno si collocano gli obiettivi concordati, il rispetto scrupoloso degli investimenti e una responsabilità personale costante. Al di fuori rimangono le complicazioni superflue e le promesse prive di fondamento.",
    ],
    quote:
      "«La credibilità nei rapporti B2B non si ottiene con formule a effetto, ma con software che non presenta cedimenti, scadenze rispettate con puntualità e risultati misurabili a beneficio dell'impresa cliente.»",
    comparison: {
      legacyTitle: "La prassi delle strutture tradizionali",
      legacyPoints: [
        "Tempi di reazione lunghi mediati da figure commerciali non tecniche",
        "Piattaforme obsolete e modelli precostituiti riciclati tra committenti diversi",
        "Tariffe gravate da oneri fissi di rappresentanza e riunioni inconcludenti",
        "Codice trattenuto dall'agenzia con vincoli tesi a ostacolare la migrazione",
      ],
      techPyreTitle: "Il modello di partnership diretta di TechPYRE",
      techPyrePoints: [
        "Contatto diretto con Riccardo Granza tramite linea telefonica, video-call e messaggistica",
        "Codice proprietario redatto su misura su standard tecnici contemporanei",
        "Condizioni economiche chiare, pattuite preventivamente e fatturate a stati di avanzamento",
        "Proprietà intellettuale integrale: repository e server appartengono alla società cliente",
      ],
    },
  },

  contact: {
    eyebrow: "REPERIBILITÀ DIRETTA CON IL FONDATORE",
    title: "Richiedi un primo confronto tecnico o una stima economica definita.",
    subtitle:
      "Compila il modulo indicando le caratteristiche del progetto. Riceverai un riscontro dettagliato entro poche ore con l'analisi preliminare e la proposta per un colloquio di approfondimento.",
    formLabels: {
      name: "Nome e Cognome",
      namePlaceholder: "Es. Mario Rossi",
      company: "Ragione Sociale o Denominazione Impresa",
      companyPlaceholder: "Es. Meccanica Industriale S.r.l.",
      contact: "Email Aziendale o Recapito Telefonico Diretto",
      contactPlaceholder: "Es. m.rossi@meccanicaindustriale.it oppure 340 1234567",
      service: "Servizio di interesse primario",
      message: "Descrizione delle necessità e finalità del progetto",
      messagePlaceholder:
        "Descrivi sinteticamente lo stato attuale dei sistemi, le problematiche da risolvere e i traguardi temporali previsti...",
      submit: "Invia Richiesta Diretta al Fondatore",
      submitting: "Elaborazione in corso...",
      privacyNote:
        "I dati forniti sono trattati con il massimo riserbo professionale nel rispetto delle normative vigenti. Nessun invio promozionale non richiesto.",
    },
    channels: [
      {
        label: "Indirizzo Email Diretto",
        value: "riccardo@techpyre.com",
        subtext: "Riscontro garantito entro 2–3 ore lavorative",
        href: "mailto:riccardo@techpyre.com",
      },
      {
        label: "Recapito Telefonico e WhatsApp",
        value: "+39 340 000 0000",
        subtext: "Disponibile per brevi comunicazioni preliminari",
        href: "https://wa.me/393400000000",
        isExternal: true,
      },
      {
        label: "Orari di Reperibilità Professionale",
        value: "Dal Lunedì al Venerdì · 08:30 — 19:30",
        subtext: "Fuso orario di Roma (CET) · Disponibilità per incontri in presenza",
        href: "#",
      },
    ],
    feedback: {
      successTitle: "Richiesta acquisita con regolarità.",
      successMessage:
        "Ringraziamo per l'interesse dimostrato. I dettagli trasmessi sono stati presi in carico personalmente dal fondatore, che provvederà a ricontattarvi entro breve termine con la proposta per la prima sessione conoscitiva.",
      successReset: "Invia una nuova comunicazione",
      errorTitle: "Comunicazione non riuscita per un inconveniente temporaneo.",
      errorMessage:
        "Non è stato possibile inoltrare la richiesta a causa di un'anomalia di rete. È possibile inviare una comunicazione diretta all'indirizzo riccardo@techpyre.com o telefonare al numero +39 340 000 0000.",
    },
  },

  footer: {
    summary:
      "Studio di ingegneria del software e consulenza tecnologica ad alte prestazioni. Progettiamo architetture web proprietarie, portali B2B e landing page commerciali con il rigore, la solidità patrimoniale e la trasparenza propri della migliore consuetudine professionale.",
    copyright: `© ${new Date().getFullYear()} TechPYRE STUDIO · Tutti i diritti riservati. Sviluppato e manutenuto con codice proprietario.`,
    links: [
      {
        title: "Patti e Principi",
        items: [
          { label: "Listino Servizi B2B", href: "#servizi" },
          { label: "La Visione e il Fondatore", href: "#storia" },
          { label: "Simulatore di Progetto", href: "#simulatore" },
          { label: "Colloquio Preliminare", href: "#contatto" },
        ],
      },
      {
        title: "Specifiche Operative",
        items: [
          { label: "Audit e Consulenza (30m Free)", href: "#servizi" },
          { label: "Landing Page a 500€", href: "#servizi" },
          { label: "Blueprint Architetturale", href: "#servizi" },
          { label: "Ecosistema Digitale Completo", href: "#servizi" },
        ],
      },
      {
        title: "Recapiti Personali",
        items: [
          { label: "riccardo@techpyre.com", href: "mailto:riccardo@techpyre.com" },
          { label: "WhatsApp: +39 340 000 0000", href: "https://wa.me/393400000000", isExternal: true },
          { label: "Telefono Fondatore", href: "tel:+393400000000" },
        ],
      },
    ],
  },
};

export const brandName = siteContent.brand.name;
