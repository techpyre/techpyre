<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` - verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# WORKSPACE RULES: B2B OUTBOUND ENGINE

## Architettura ed Economia dei Token
1. **MAI modificare il codice dei componenti React** (`src/components/templates/*`, `src/components/InteractiveQuiz.tsx`, `src/components/DiagnosticBanner.tsx`) quando generi una demo per un cliente.
2. Ogni nuova demo consiste ESCLUSIVAMENTE in:
   - Asset grafici reali salvati in `public/leads/[slug]/`
   - Un singolo file JSON validato su `src/types/lead.ts` salvato in `src/data/leads/[slug].json`
3. **Zero Immagini Stock/Unsplash:** È severamente vietato usare URL di `images.unsplash.com` o `placehold.co`. Estrai sempre gli URL delle immagini reali dal DOM della landing page del cliente o fai uno screenshot pulito di una sezione visiva del loro sito/inserzione e salvalo localmente in `public/leads/[slug]/hero.jpg`.
4. **Regola Anti-Spam e Presentazione B2B per l'Email (`emailPlainTextBody`):**
   - Testo puro, massimo 130 parole, tono professionale e rispettoso (usa il "Lei" o il "Voi" aziendale, mai il "tu" confidenziale da collaboratore al primo contatto).
   - **Presentazione Obbligatoria in apertura:** Apri sempre presentandoti chiaramente (*"Buongiorno [Nome / alla cortese attenzione della Direzione], mi chiamo Riccardo Granza e sono il fondatore di TechPyre: sviluppiamo landing page ad alta conversione per le aziende che investono in pubblicità su Meta e Google."*).
   - Zero link cliccabili (`http://` o `https://` vietati nel primo messaggio).
   - Cita il titolo esatto della loro inserzione attiva su Meta e il tempo di caricamento reale in secondi.
   - Chiudi con l'invito cortese: *"Per presentarci in modo concreto, vi abbiamo preparato una versione dimostrativa veloce (0.3s) con i vostri testi e un simulatore di preventivo. Se vi fa piacere provarla dal telefono, rispondetemi pure 'LINK' qui sotto e ve lo giro subito."*
