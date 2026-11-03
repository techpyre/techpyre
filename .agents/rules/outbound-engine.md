# WORKSPACE RULES: B2B OUTBOUND ENGINE · TECHPYRE STUDIO

## 1. Identità Aziendale e Tesi Strategica (Single Source of Truth)
- **Nome Brand:** **TechPYRE** (*TechPyre Studio*) · **Studio di Ingegneria ed Ecosistemi Digitali** (*Digital Systems & Growth Engineering Studio*)
- **Fondatore & Direzione:** **Riccardo Granza** · *Fondatore & Architetto di Sistemi Digitali (Digital Systems Architect)*
- **Contatti Ufficiali:** `riccardo.granza@techpyre.eu` · Tel & WhatsApp B2B: `+39 379 115 9352` · Dominio: `https://www.techpyre.eu` · GitHub: `github.com/techpyre`
- **Tesi Strategica (I 3 Danni Economici che Risolviamo):**
  Il 95% delle presenze online aziendali oggi è un costo morto: vetrine statiche realizzate con CMS monolitici lenti (4-8 secondi su mobile), scollegate dai gestionali interni e dotate di tracciamenti base che perdono fino al 50% dei dati per blocchi browser, cookie banner e ad-blocker.
  1. **Dispersione del budget pubblicitario:** oltre metà degli utenti che cliccano su un'inserzione Google o Meta abbandona la pagina prima ancora che si carichi sul telefono.
  2. **Cecità decisionale sul ROI:** senza tracciamento Server-Side (`GTM Server-Side`, `GA4`, `Meta CAPI`), l'azienda non sa quali campagne generano contratti reali e quali bruciano cassa.
  3. **Colli di bottiglia commerciali:** i contatti finiscono in email isolate, costringendo la rete vendita al data-entry manuale su fogli di calcolo e a richiamare i clienti con ore o giorni di ritardo invece di avere qualifica automatica e sincronizzazione diretta `API/Webhook` verso il CRM (`HubSpot` o CRM su misura).
- **Listino Ufficiale dei 4 Servizi B2B (Prezzi di partenza chiari, zero canoni di noleggio, 100% proprietà codice):**
  - **Servizio 01 · Infrastrutture Web & Architetture di Conversione:** `A partire da 900€` (Consegna a corpo · Zero canoni di noleggio · Da 5 giorni lavorativi · Architettura `Next.js / TypeScript` `< 0.4s` / `0.3s`).
  - **Servizio 02 · Portali Operativi Custom & Ecosistemi B2B:** `A partire da 5.000€` (Sviluppo a sprint · Da 4 settimane · `Next.js + TypeScript + PostgreSQL`, area riservata RBAC Clienti/Agenti/Amministrazione, listini per P.IVA, sync ERP e `Stripe B2B`).
  - **Servizio 03 · Data Engineering, Server-Side Tracking & Analytics:** `A partire da 1.200€` (Consegna in 7-10 giorni lavorativi · `GTM Server-Side`, `GA4`, `Meta CAPI`, `Google Ads`).
  - **Servizio 04 · Automazione Commerciale & Integrazione CRM (RevOps):** `A partire da 1.500€` (Consegna in 1-2 settimane · Integrazione `API/Webhook` con `HubSpot` o CRM aziendali).
- **Progetti Reference Live:**
  - **Valkiria International** (Servizio 02 · Ecosistema B2B & Portale Ordini Custom): `https://b2b-demo.techpyre.eu` (`LCP < 0.4s`, `100/100 CWV`)
  - **Kinetix Performance** (Servizio 01 + 04 · Infrastruttura di Conversione & Pipeline CRM): `https://headless-demo.techpyre.eu` (`0.3s`, `TTFB < 50ms`, `+68% Resa Lead`)

## 2. Architettura ed Economia dei Token
1. **MAI modificare il codice dei componenti React** (`src/components/templates/*`, `src/components/InteractiveQuiz.tsx`, `src/components/DiagnosticBanner.tsx`, `src/components/TechPyreFooter.tsx`) quando generi una demo per un singolo cliente.
2. Ogni nuova demo consiste ESCLUSIVAMENTE in:
   - Asset grafici reali salvati in `public/leads/[slug]/`
   - Un singolo file JSON validato su `src/types/lead.ts` salvato in `src/data/leads/[slug].json`
3. **Zero Immagini Stock/Unsplash:** È severamente vietato usare URL di `images.unsplash.com` o `placehold.co`. Estrai sempre gli URL delle immagini reali dal DOM della landing page del cliente o fai uno screenshot pulito di una sezione visiva del loro sito/inserzione e salvalo localmente in `public/leads/[slug]/hero.jpg`.
4. **Rimozione Integrale dei Tratti Lunghi:** Non usare MAI tratti lunghi (em-dash o en-dash) in nessun testo, JSON, oggetto email o corpo email. Usa esclusivamente `-`, `:`, `,` oppure `·`.
5. **Regola Anti-Spam e Posizionamento B2B per l'Email (`emailPlainTextBody`):**
   - Testo puro, massimo 135 parole, tono professionale, esecutivo e rispettoso (usa il "Lei" o il "Voi" aziendale, mai il "tu" confidenziale al primo contatto).
   - **Presentazione Obbligatoria in apertura:** Apri sempre presentandoti chiaramente (*"Buongiorno [Nome / alla cortese attenzione della Direzione di Azienda], mi chiamo Riccardo Granza e sono il fondatore di TechPyre Studio: progettiamo infrastrutture web ad alte prestazioni, tracciamenti Server-Side e automazioni CRM per le aziende B2B che investono in campagne su Meta e Google."*).
   - Zero link cliccabili (`http://` o `https://` vietati nel primo messaggio).
   - Cita il titolo esatto della loro inserzione attiva e i danni economici riscontrati: il tempo di caricamento reale su mobile in secondi (`>= 5.0s`), la dispersione dei dati senza tracciamento Server-Side e l'assenza di qualifica e invio istantaneo al CRM.
   - Chiudi con l'invito cortese: *"Per presentarci in modo concreto, vi abbiamo ingegnerizzato una versione dimostrativa istantanea (0.3s) in Next.js con i vostri contenuti, pre-qualifica contatti e predisposizione CRM/Server-Side (fornita a corpo da 900 euro, zero canoni di noleggio e 100% di proprietà del codice). Se vi fa piacere provarla dal telefono, rispondetemi pure 'LINK' qui sotto e ve lo giro subito."*

## 3. Regola Senior UI/UX: 3 Archetipi Architetturali & Design System
Ogni demo generata in `src/data/leads/[slug].json` deve selezionare l'`archetype` corretto per il settore e rispettare rigorosamente le regole visive e psicologiche del compratore:

1. **Regole Globali (Tutti gli Archetipi):**
   - **Zero Gergo da Sviluppatore / Zero Finto-Codice:** MAI inserire nei testi prefissi come `//`, `01 //`, `SPEC //`, `[LIVE_DEMO]`, o scritte tecniche incomprensibili all'utente finale. Parla la lingua dell'imprenditore e del Direttore Commerciale.
   - **Contrast Safety (Zero Bianco su Bianco):** Imposta sempre correttamente `theme.headerBgMode` (`"light"` o `"dark"`) e `theme.logoBrightness` (`"light"` se il logo ha scritte bianche/chiare, `"dark"` se il logo ha scritte scure). Se un logo è chiaro su fondo trasparente, usa `headerBgMode: "dark"` o lascia che `AdaptiveLogo` applichi una pillola scura di contrasto.
   - **Color Discipline (60-30-10):** `primaryHex` e `accentHex` estratti dal sito reale del cliente vengono usati solo su CTA, badge e accenti chiave (10% della superficie).

2. **`local-leadgen` (Serramenti, Fotovoltaico, Ristrutturazioni, Climatizzazione, Edilizia):**
   - **Target:** Utente da traffico Meta/Google Ads che vuole sapere subito quanto costa, in quanto tempo e con quali agevolazioni/garanzie.
   - **Struttura:** Split Hero con **Simulatore / Configuratore Preventivo in 3 Passi** immediatamente visibile nella prima schermata.

3. **`b2b-authority` (Manifattura, Automazione Industriale, Macchinari, Distributori B2B, Logistica, Software/Servizi B2B):**
   - **Target:** Imprenditori, Direttori Tecnici, Responsabili Acquisti e Direttori Commerciali B2B.
   - **Struttura:** **VIETATO IL QUIZ GIOCOSO IN HERO**. Usa una Hero architettonica orientata a **ROI, Casi Studio documentati (`secondaryStats` con 3 KPI numerici forti) e Certificazioni ISO/Conformità (`clientReferenceWall`)**, seguita da Bento Grid metodologica in 3 fasi e modulo finale **"Richiedi Studio di Fattibilità / Tavolo Tecnico"**.

4. **`medical-clinic` (Cliniche Odontoiatriche, Centri Medici, Chirurgia Estetica, Diagnostica):**
   - **Target:** Paziente che cerca fiducia clinica, igiene, assenza di dolore e trasparenza medica.
   - **Struttura:** Palette chiara e rassicurante (`#FAF8F5` / `#FFFFFF`), scheda **"Direzione Sanitaria & Equipe"** (`medicalDetails` con nome Direttore Sanitario, Iscrizione Albo Medici, Specializzazione, Orari, Parcheggio/Accessibilità e Convenzioni assicurative) e modulo di **"Richiesta Disponibilità Prima Visita"** sobrio e rassicurante.
