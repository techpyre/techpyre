<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# WORKSPACE RULES: B2B OUTBOUND ENGINE · TECHPYRE STUDIO

## Identità Ufficiale e Posizionamento (Single Source of Truth)
- **Brand:** **TechPYRE** (*TechPyre Studio*) · **Studio di Ingegneria ed Ecosistemi Digitali** (*Digital Systems & Growth Engineering Studio*)
- **Fondatore:** **Riccardo Granza** · *Fondatore & Architetto di Sistemi Digitali (Digital Systems Architect)*
- **Contatti Ufficiali:** `riccardo.granza@techpyre.eu` · Tel & WhatsApp B2B: `+39 379 115 9352` · Dominio: `https://www.techpyre.eu` · GitHub: `github.com/techpyre`
- **Tesi Strategica:** Il 95% delle presenze online aziendali oggi è un costo morto (vetrine statiche con CMS monolitici lenti 4-8s su mobile, scollegate dai gestionali interni e con tracciamenti base che perdono fino al 50% dei dati per ad-blocker e cookie banner). TechPyre risolve 3 danni economici diretti:
  1. **Dispersione del budget pubblicitario:** oltre metà degli utenti che cliccano su un'inserzione Google o Meta abbandona prima che la pagina si carichi sul telefono.
  2. **Cecità decisionale sul ROI:** assenza di tracciamento Server-Side (`GTM Server-Side`, `GA4`, `Meta CAPI`).
  3. **Colli di bottiglia commerciali:** contatti in email isolate e data-entry manuale invece di qualifica automatica e sincronizzazione istantanea `API/Webhook` col CRM (`HubSpot` o CRM su misura).
- **I 4 Servizi B2B e Listino Ufficiale:**
  - **Servizio 01 · Infrastrutture Web & Architetture di Conversione:** `A partire da 900€` (Consegna a corpo · Zero canoni di noleggio · Da 5 giorni lavorativi · Architettura `Next.js / TypeScript` `< 0.4s` / `0.3s` · Proprietà codice 100%).
  - **Servizio 02 · Portali Operativi Custom & Ecosistemi B2B:** `A partire da 5.000€` (Sviluppo a sprint · Da 4 settimane · `Next.js + TypeScript + PostgreSQL`, area riservata RBAC Clienti/Agenti/Amministrazione, listini per P.IVA, sync ERP e `Stripe B2B`).
  - **Servizio 03 · Data Engineering, Server-Side Tracking & Analytics:** `A partire da 1.200€` (Consegna in 7-10 giorni lavorativi · `GTM Server-Side`, `GA4`, `Meta CAPI`, `Google Ads`, recupero 30-50% conversioni perse).
  - **Servizio 04 · Automazione Commerciale & Integrazione CRM (RevOps):** `A partire da 1.500€` (Consegna in 1-2 settimane · Integrazione `API/Webhook` con `HubSpot` o CRM aziendali, qualifica automatica e notifica immediata alla rete vendita).
- **Progetti Reference Live:**
  - **Valkiria International** (Servizio 02 · Ecosistema B2B & Portale Ordini Custom): `https://b2b-demo.techpyre.eu` (`LCP < 0.4s`, `100/100 CWV`)
  - **Kinetix Performance** (Servizio 01 + 04 · Infrastruttura di Conversione & Pipeline CRM): `https://headless-demo.techpyre.eu` (`0.3s`, `TTFB < 50ms`, `+68% Resa Lead`)

## Architettura, Stile ed Economia dei Token
1. **MAI modificare il codice dei componenti React** (`src/components/templates/*`, `src/components/InteractiveQuiz.tsx`, `src/components/DiagnosticBanner.tsx`) quando generi una demo per un singolo cliente.
2. Ogni nuova demo consiste ESCLUSIVAMENTE in:
   - Asset grafici reali salvati in `public/leads/[slug]/`
   - Un singolo file JSON validato su `src/types/lead.ts` salvato in `src/data/leads/[slug].json`
3. **Zero Immagini Stock/Unsplash e Zero Tratti Lunghi:**
   - È severamente vietato usare URL di `images.unsplash.com` o `placehold.co`. Estrai sempre gli URL delle immagini reali dal DOM della landing page del cliente o fai uno screenshot pulito della loro pagina e salvalo localmente in `public/leads/[slug]/hero.jpg`.
   - **Rimozione integrale dei tratti lunghi:** non usare mai em-dash o en-dash nelle email, nei JSON o nei testi. Usa esclusivamente `-`, `:`, `,` oppure `·`.
4. **Regola Anti-Spam e Posizionamento B2B per l'Email (`emailPlainTextBody`):**
   - Testo puro, massimo 135 parole, tono esecutivo, sobrio e rispettoso (usa il "Lei" o il "Voi" aziendale, zero gergo finto-tecnico, zero tratti lunghi).
   - **Presentazione Obbligatoria in apertura:** Apri sempre presentandoti chiaramente (*"Buongiorno [Nome / alla cortese attenzione della Direzione di Azienda], mi chiamo Riccardo Granza e sono il fondatore di TechPyre Studio: progettiamo infrastrutture web ad alte prestazioni, tracciamenti Server-Side e automazioni CRM per le aziende B2B che investono in campagne su Meta e Google."*).
   - Zero link cliccabili (`http://` o `https://` vietati nel primo messaggio).
   - Cita il titolo esatto della loro inserzione attiva e i 3 danni economici rilevati: il tempo di caricamento reale su mobile in secondi (dispersione dei clic pagati), la perdita di dati di conversione senza tracciamento Server-Side e l'assenza di un flusso automatico di qualifica verso il CRM.
   - Chiudi con l'invito cortese: *"Per presentarci in modo concreto, vi abbiamo ingegnerizzato una versione dimostrativa istantanea (0.3s) in Next.js con i vostri contenuti, pre-qualifica contatti e predisposizione CRM/Server-Side (fornita a corpo da 900 euro, zero canoni di noleggio e 100% di proprietà del codice). Se vi fa piacere provarla dal telefono, rispondetemi pure 'LINK' qui sotto e ve lo giro subito."*
5. **Filtro di Qualifica B2B High-Ticket & LCP Elevato (Urgenza e Dolore Commerciale Acuto):**
   - Cerca e qualifica prioritariamente **aziende B2B strutturate** (PMI manifatturiere, automazione industriale, distributori B2B, società di servizi strutturate, impiantistica industriale/fotovoltaico, serramenti e cliniche strutturate) con un **LCP su rete mobile pari o superiore a 5.0 secondi** (range ideale: 5.5s - 14.0s).
   - I bersagli ottimali sono siti realizzati con CMS monolitici lenti (WordPress, Elementor, Divi, Wix, Joomla), scollegati dai gestionali/CRM interni e privi di tracciamento Server-Side: per loro il passaggio ai `< 0.4s` (`0.3s`) e all'ecosistema sincronizzato di TechPyre genera un ritorno sull'investimento immediato.
   - Salta o scarta siti che caricano già rapidamente (< 4.0s).
