---
name: build-and-pitch
description: Genera la demo Next.js compilando il file JSON del lead secondo gli standard Senior UI/UX per archetipo, verifica visivamente la demo nel browser locale, cattura lo screenshot comparativo e prepara l'email di cold outreach. Usa quando uno slug ha già il suo preflight.json pronto.
---
# Build Demo & Pitch Drafter (Senior UI/UX Edition)

## Procedura Passo-Passo
1. **Lettura Dati:**
   - Leggi `public/leads/[slug]/preflight.json` e `src/types/lead.ts`.

2. **Generazione Configurazione Demo (`src/data/leads/[slug].json`):**
   - Crea il file `src/data/leads/[slug].json` rispettando rigorosamente l'interfaccia `LeadConfig` e la psicologia dell'archetipo:
     - **`'local-leadgen'`** (Edilizia, Fotovoltaico, Infissi, Idraulici, Impianti):
       - `theme`: `primaryHex: "#1E3A8A"`, `accentHex: "#EA580C"` (o `#16A34A`), `darkBgHex: "#0F172A"`, `borderRadius: "8px"`.
       - Compila `content.heroBullets` con 3 punti di forza concreti (es. "Sopralluogo gratuito a [Città]", "Squadre interne senza subappalti", "Garanzia contrattuale").
     - **`'medical-clinic'`** (Dentisti, Cliniche, Chirurgia, Fisioterapia):
       - `theme`: `primaryHex: "#0D9488"`, `accentHex: "#0F766E"`, `darkBgHex: "#1E293B"`, `borderRadius: "16px"`.
       - Compila `content.medicalDetails` con `directorName`, `alboRegistration` (Numero Iscrizione all'Albo dei Medici/Odontoiatri), `specialization`, `openingHours`, `parkingAndAccess` e `conventions`.
     - **`'b2b-authority'`** (Consulenza, SaaS Enterprise, Automazione Industriale, Manifattura B2B):
       - `theme`: `primaryHex: "#0F172A"`, `accentHex: "#2563EB"`, `darkBgHex: "#090D16"`, `borderRadius: "6px"`.
       - Compila `content.socialProof.secondaryStats` (3 KPI con numeri di impatto) e `content.socialProof.clientReferenceWall` (certificazioni ISO, standard tecnici, partner).
   - **Copywriting Realistico e Serio:** Evita qualsiasi frase generica da IA, emoji nei titoli o punti esclamativi inutili. Usa terminologia tecnica reale del settore italiano.
   - **Message Match:** `content.heroHeadline` deve riprendere la promessa esatta di `activeAdHeadline` migliorandone la chiarezza.
   - **Micro-Quiz:** Crea 2 domande tecniche iper-specifiche per il settore del cliente con 3 opzioni chiare ciascuna.
   - **Cold Email:** Compila `outreach.emailSubject`, `outreach.emailPlainTextBody` (senza link, max 110 parole!) e `outreach.followUpWithLinkBody` (con il link `https://techpyre.eu/demo/[slug]`).
   - Esegui `node scripts/send-outreach.mjs <slug>` per validare i limiti anti-spam e generare `public/leads/[slug]/outreach-pack.txt`.

3. **Verifica Visiva Obbligatoria (Browser di Antigravity):**
   - Assicurati che `npm run dev` sia attivo su `http://localhost:3000`.
   - Apri nel Browser di Antigravity `http://localhost:3000/demo/[slug]` in vista mobile (390x844) e desktop.
   - Verifica il contrasto WCAG AA (4.5:1), le spaziature, il caricamento di logo e foto hero e l'assenza di errori Next.js.
   - Scatta lo screenshot della nuova demo e salvalo in `public/leads/[slug]/new-demo-mobile.png`.

4. **Generazione Artifact Finale:**
   - Produci un Artifact di riepilogo per l'utente che mostra affiancati:
     - Dati del Lead (Azienda, Nome Titolare, Email trovata, Telefono, URL Demo Live `https://techpyre.eu/demo/[slug]`)
     - Screenshot prima (`old-site-mobile.png`) e dopo (`new-demo-mobile.png`)
     - Oggetto, Corpo dell'Email pronta da inviare e messaggio DM Instagram/WhatsApp.
