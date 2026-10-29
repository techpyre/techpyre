---
name: build-and-pitch
description: Genera la demo Next.js compilando il file JSON del lead secondo gli standard Senior UI/UX per archetipo, verifica visivamente la demo nel browser locale con emulazione iPhone CDP reale, cattura lo screenshot comparativo e prepara l'email di cold outreach. Usa quando uno slug ha già il suo preflight.json pronto.
---
# Build Demo & Pitch Drafter (Senior UI/UX Edition)

## Procedura Passo-Passo
1. **Lettura Dati e Verifica Reale del Viewport Mobile:**
   - Leggi `public/leads/[slug]/preflight.json` (incluso `mobileViewportAudit`) e osserva `public/leads/[slug]/old-site-mobile.png`.
   - **REGOLA CRITICA ANTI-ALLUCINAZIONE MOBILE:**
     - **MAI usare `Brave Browser --window-size=390,844 --screenshot`** perché su macOS renderizza il layout desktop ritagliandolo a 390px e facendo sembrare tutti i siti tagliati a destra!
     - Usa **ESCLUSIVAMENTE** `node scripts/mobile-audit-cdp.mjs "<url>" "<out.png>"` che imposta l'emulazione iPhone reale via Chrome DevTools Protocol (`Emulation.setDeviceMetricsOverride({ width: 390, height: 844, deviceScaleFactor: 2, mobile: true })`).
     - Non scrivere **MAI** nell'email che il sito ha testi o bottoni tagliati fuori dallo schermo a meno che `preflight.mobileViewportAudit.hasRealHorizontalOverflow === true`! Basati sui difetti reali rilevati da `mobileViewportAudit` (es. `formVisibleAboveTheFold === false`, atterraggio sulla Home Page generica con `navLinksCount` voci di menu, assenza di simulatore preventivo, incongruenza tra l'inserzione e la slide mostrata, o tempo di caricamento `estimatedMobileLcpSeconds`).

2. **Generazione Configurazione Demo (`src/data/leads/[slug].json`):**
   - Crea il file `src/data/leads/[slug].json` rispettando rigorosamente l'interfaccia `LeadConfig` e la psicologia dell'archetipo:
     - **`'local-leadgen'`** (Edilizia, Fotovoltaico, Infissi, Idraulici, Impianti):
       - `theme`: `primaryHex: "#1C2D42"`, `accentHex: "#C2410C"` (o `#15803D`), `darkBgHex: "#0F172A"`, `borderRadius: "8px"`.
       - Compila `content.heroBullets` con 3 punti di forza concreti e il `quiz` a 2 domande tecniche.
     - **`'medical-clinic'`** (Dentisti, Cliniche, Chirurgia, Fisioterapia):
       - `theme`: `primaryHex: "#1F4E46"`, `accentHex: "#1F4E46"`, `darkBgHex: "#182220"`, `borderRadius: "12px"`.
       - Compila `content.medicalDetails` con `directorName`, `alboRegistration` (Numero Iscrizione all'Albo dei Medici/Odontoiatri), `specialization`, `openingHours`, `parkingAndAccess` e `conventions`.
     - **`'b2b-authority'`** (Consulenza, SaaS Enterprise, Automazione Industriale, Manifattura B2B):
       - `theme`: `primaryHex: "#18181B"`, `accentHex: "#1E3A5F"`, `darkBgHex: "#141619"`, `borderRadius: "6px"`.
       - Compila `content.socialProof.secondaryStats` (3 KPI con numeri di impatto) e `content.b2bAuthority.caseStudies`.
   - **Copywriting Realistico e Serio:** Zero trattini lunghi (`-` al posto di `—`), zero `//`, zero emoji nei titoli.
   - **Cold Email (`outreach`):**
     - Presentazione formale B2B in apertura (`Buongiorno [Nome / Direzione], mi chiamo Riccardo Granza e sono il fondatore di TechPyre...`).
     - Spiegazione terra-terra con i dati veri del sito (`estimatedMobileLcpSeconds`, `renderBlockingScripts`, assenza di form sopra la piega, dispersione sul sito vetrina) e del ritorno economico concreto nel passare a una pagina da `0.3s` con simulatore guidato.
     - Zero link cliccabili nella prima email.
   - Esegui `node scripts/send-outreach.mjs <slug>` per generare `public/leads/[slug]/outreach-pack.txt`.

3. **Cattura Screenshot Mobile Reale della Nuova Demo:**
   - Esegui:
     `node scripts/mobile-audit-cdp.mjs "http://localhost:3000/demo/[slug]" "public/leads/[slug]/new-demo-mobile.png"`
