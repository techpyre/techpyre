<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# WORKSPACE RULES & GUIDA OPERATIVA CLI: B2B OUTBOUND ENGINE · TECHPYRE STUDIO

> **IMPORTANTE (PER L'AGENTE AI E PER IL FONDATORE):**
> Questo file costituisce la **Single Source of Truth** architetturale, commerciale e operativa di **TechPyre Studio**.
> L'Agente AI legge automaticamente questo file ad ogni avvio di sessione e deve applicarne senza eccezioni le **7 Direttive Architetturali**. Il Fondatore può usare in completa autonomia i comandi della **CLI Unificata (`npm run tp -- ...`)** documentati nella Sezione 3.

---

## 1. Identità Ufficiale e Posizionamento (Single Source of Truth)
- **Brand:** **TechPYRE** (*TechPyre Studio*) · **Studio di Ingegneria ed Ecosistemi Digitali** (*Digital Systems & Growth Engineering Studio*)
- **Fondatore:** **Riccardo Granza** · *Fondatore & Architetto di Sistemi Digitali (Digital Systems Architect)*
- **Sede Operativa:** Via Carrubara Vico III n. 3, 98027 Pagliara (Messina), Italia (Operatività nazionale da remoto o in presenza)
- **Contatti Ufficiali:** `riccardo.granza@techpyre.eu` · Tel & WhatsApp B2B: `+39 379 115 9352` · Dominio: `https://www.techpyre.eu` · GitHub: `github.com/techpyre`
- **Tesi Strategica:** Il 95% delle presenze online aziendali oggi è un costo morto (vetrine statiche con CMS monolitici lenti 4-8s su mobile, scollegate dai gestionali interni e con tracciamenti base che perdono fino al 50% dei dati per ad-blocker e cookie banner). TechPyre risolve 3 danni economici diretti:
  1. **Dispersione del budget pubblicitario / abbandono mobile:** oltre metà degli utenti da smartphone abbandona prima che la pagina si carichi.
  2. **Cecità decisionale sul ROI:** assenza di tracciamento Server-Side (`GTM Server-Side`, `GA4`, `Meta CAPI`).
  3. **Colli di bottiglia commerciali:** contatti in email isolate e data-entry manuale invece di qualifica automatica e sincronizzazione istantanea `API/Webhook` col CRM (`HubSpot` o CRM su misura).
- **I 4 Servizi B2B e Listino Ufficiale (Da citare sul sito/call, MAI nel primo messaggio cold email):**
  - **Servizio 01 · Infrastrutture Web & Architetture di Conversione:** `A partire da 900€` (Consegna a corpo · Zero canoni di noleggio · Da 5 giorni lavorativi · Architettura `Next.js / TypeScript` `< 0.4s` / `0.3s` · Proprietà codice 100%).
  - **Servizio 02 · Portali Operativi Custom & Ecosistemi B2B:** `A partire da 5.000€` (Sviluppo a sprint · Da 4 settimane · `Next.js + TypeScript + PostgreSQL`, area riservata RBAC Clienti/Agenti/Amministrazione, listini per P.IVA, sync ERP e `Stripe B2B`).
  - **Servizio 03 · Data Engineering, Server-Side Tracking & Analytics:** `A partire da 1.200€` (Consegna in 7-10 giorni lavorativi · `GTM Server-Side`, `GA4`, `Meta CAPI`, `Google Ads`, recupero 30-50% conversioni perse).
  - **Servizio 04 · Automazione Commerciale & Integrazione CRM (RevOps):** `A partire da 1.500€` (Consegna in 1-2 settimane · Integrazione `API/Webhook` con `HubSpot` o CRM aziendali, qualifica automatica e notifica immediata alla rete vendita).
- **Progetti Reference Live:**
  - **Valkiria International** (Servizio 02 · Ecosistema B2B & Portale Ordini Custom): `https://b2b-demo.techpyre.eu` (`LCP < 0.4s`, `100/100 CWV`)
  - **Kinetix Performance** (Servizio 01 + 04 · Infrastruttura di Conversione & Pipeline CRM): `https://headless-demo.techpyre.eu` (`0.3s`, `TTFB < 50ms`, `+68% Resa Lead`)

---

## 2. Le 7 Direttive Architetturali Obbligatorie della Pipeline Outbound

### Direttiva 1 · Validazione Dominio Esterno Reale & Stop Bug PagineGialle
- Scarta categoricamente qualsiasi candidato che non possieda un **dominio web proprietario reale e raggiungibile** (`isPagineGialleUrl` o `!externalSiteUrl` -> scarto immediato).
- Se la fetch del `targetUrl` fallisce o restituisce un HTML inferiore a `300` caratteri, scarta il candidato. È vietato generare audit su metriche stimate senza aver scaricato il DOM reale del sito del prospect.
- Qualifica prioritariamente aziende B2B strutturate con **LCP mobile reale >= 5.0 secondi** (misurato tramite Google PageSpeed Insights API v5 o Chromium Headless CDP reale).

### Direttiva 2 · Motore di Scoring Email & Blocco Caselle di Ticketing (`selectBestDecisionMakerEmail`)
- **Scraping proattivo multi-pagina:** scarica sempre in parallelo (`Promise.allSettled`, timeout `3500ms`) le sottopagine `/contatti`, `/chi-siamo`, `/azienda`, `/team`, `/privacy-policy`.
- **Inversione priorità:** le email estratte dal sito/sottopagine hanno sempre priorità rispetto a `fallbackEmail` di directory esterne.
- **Hard Blacklist (`HARD_BLOCKED_EMAIL_PREFIXES`):** scarta immediatamente qualsiasi email il cui local-part o dominio contenga: `assistenza`, `support`, `supporto`, `help`, `ticket`, `noreply`, `no-reply`, `donotreply`, `privacy`, `dpo`, `gdpr`, `pec`, `legalmail`, `arubapec`, `postecert`, `fatture`, `fatturazione`, `fornitori`, `acquisti`, `curriculum`, `cv`, `jobs`, `carriere`, `hr`, `lavoraconnoi`, `webmaster`, `postmaster`, `abuse`, `reclami`, `clienti`, `servizioclienti`.
- **Sistema di Scoring:**
  - `+30 pt` se il dominio coincide col dominio del sito aziendale (penalizza `gmail.com`, `libero.it`, ecc.)
  - `+60 pt` per pattern nominali `nome.cognome@` o `n.cognome@` (Gold Standard)
  - `+50 pt` per pattern nome proprio singolo (`marco@`, `alessandro@`)
  - `+45 pt` per caselle direzionali (`direzione@`, `ceo@`, `titolare@`, `founder@`, `presidenza@`)
  - `+15 pt` per `commerciale@` / `vendite@` / `marketing@`
  - `+5 pt` (ultimo fallback) per `info@`, `contatti@`, `segreteria@`, `amministrazione@`

### Direttiva 3 · Estrazione Reale del Decision Maker (`extractDecisionMakerFromHtml`)
- Scansiona il testo delle pagine scaricate cercando pattern vicino a: `Legale Rappresentante`, `Amministratore Unico`, `Amministratore Delegato`, `Titolare del trattamento`, `nella persona di`, `Fondatore`, `CEO`, `Titolare`, `Dott.`, `Ing.`, `Geom.`, `Arch.`.
- Applica la **Stopword Blacklist** per bloccare falsi positivi (*"Sede Legale"*, *"Privacy Policy"*, *"Titolare Trattamento"*, città, vie, termini tecnici).
- **Fallback da Email Nominale:** se il DOM non restituisce un nome ma `bestEmail` è `nome.cognome@dominio.it`, estrae `Nome Cognome` dall'email.
- **Salvaguardia `info@`:** se `isGenericInbox === true` e abbiamo estratto `fullName`, l'oggetto dell'email deve iniziare con `"Per ${fullName} · ..."`.

### Direttiva 4 · Rilevamento Reale Ads & Pixel (`detectActiveAdTracking`)
- Verifica nel DOM la presenza di `connect.facebook.net` / `fbq(`, `googletagmanager.com` / `gtag(` / `googleadservices.com` / `AW-`, `analytics.tiktok.com` / `snap.licdn.com`.
- **Biforcazione dinamica del Copy e dei 3 Difetti (`threeCriticalFlaws`):**
  - Se `runsAds === true`: punta su **Dispersione del Traffico Pagato** (`LCP` lento su mobile) e **Perdita Dati di Conversione (Assenza Server-Side)**.
  - Se `runsAds === false`: **VIETATO parlare di campagne o clic pagati**. Punta su **Abbandono dei Preventivi da Mobile** (`LCP` lento) e **Mancata Qualifica Automatica delle Richieste verso il CRM**.

### Direttiva 5 · Zero-Fluff Protocol (Regole Ferree sul Copy Email)
- **Zero tratti lunghi:** vietato usare em-dash o en-dash nelle email, nei JSON o nei testi. Usa esclusivamente `-`, `:`, `,` oppure `·`.
- **Zero immagini stock/Unsplash:** vietato usare `images.unsplash.com` o `placehold.co`. Usa solo asset reali estratti dal sito o screenshot reali salvati in `public/leads/[slug]/`.
- **MAI modificare i componenti React dei template** (`src/components/templates/*`, `src/components/InteractiveQuiz.tsx`, `src/components/DiagnosticBanner.tsx`) per un singolo lead.
- **Regole Copy Step 1 (`step1FirstTouch`):**
  1. **Vietato iniziare con** *"Mi chiamo..."* o *"Siamo un'agenzia che..."*. Entra subito nel merito sul problema misurato sul loro sito.
  2. **Vietato menzionare prezzi** (*"900 euro"*), sconti o *"zero canoni"* nelle email di contatto a freddo.
  3. **Vietato chiedere di rispondere `'LINK'`**.
  4. **Lunghezza Step 1:** **65 - 85 parole totali**. **Zero link cliccabili** (`http://` o `https://` vietati nello Step 1).
  5. **Chiusura a bassa frizione:** *"Vi fa piacere se vi giro qui sotto il link di prova cosi la testate direttamente dal vostro smartphone senza impegno?"*

### Direttiva 6 · Sequenza Multi-Step a 4 Touchpoint & SMTP Threading Reale
Ogni lead in `src/data/leads/[slug].json` contiene i 4 step in `outreach`:
- **`step1FirstTouch` (Giorno 1):** 65-85 parole, diagnosi tecnica + proposta invio demo, zero link. Salva il `Message-ID` restituito dal server SMTP in `meta.lastSentMessageId`.
- **`step2FollowUpLink` (Giorno 4 · In-Thread o su risposta positiva):** 40-50 parole, oggetto `Re: [Oggetto Originale]`, header MIME `In-Reply-To` e `References` valorizzati con `<lastSentMessageId>`, invio proattivo dell'URL `https://www.techpyre.eu/demo/${slug}` + invito a call di 10 minuti.
- **`step3ValueDropAndCallTrigger` (Giorno 8 · In-Thread):** 30-40 parole sul collo di bottiglia commerciale + `requiresFollowUpCall: true` (attiva la chiamata telefonica di 45s al numero dell'azienda).
- **`step4Breakup` (Giorno 13 · In-Thread):** Breakup email cortese e de-pressurizzante.

### Direttiva 7 · Pacing, Deliverability & Classificatore Risposte (`classifyInboundReply`)
- **Pacing & Finestra Oraria:** massimo `35` nuovi First Touch al giorno per casella mittente (`DAILY_FIRST_TOUCH_LIMIT = 35`), solo `Lun-Ven` tra le `08:30` e le `17:30` (`Europe/Rome`), con jitter randomizzato tra gli invii.
- **Classificatore Inbound (`classifyInboundReply`):**
  1. `AUTO_REPLY_OR_TICKET`: se contiene *"abbiamo preso in carico"*, *"ticket #"*, *"non rispondere"*, marca il lead come `INVALID_TICKET_INBOX` e ferma la sequenza.
  2. `POSITIVE_REQUEST_LINK`: segna come `HOT_LEAD`, ferma la sequenza automatica e prepara lo Step 2 col link demo.
  3. `SKEPTICAL_OR_OBJECTION`: (*"Quanto costa?"*, *"Siamo già seguiti da un'agenzia"*, *"Non so se ci serve"*): segna come `HOT_LEAD`, ferma la sequenza e genera una risposta consultiva che valida l'obiezione, invia il link della demo e propone 10 minuti di condivisione schermo o un video Loom di 2 minuti (senza mai inviare listini prezzi).
  4. `UNSUBSCRIBE_OR_NO`: segna come `BLACKLISTED` e interrompe ogni contatto.

---

## 3. Guida Operativa CLI (`npm run tp -- <comando>`) per Uso Autonomo

Abbiamo creato la CLI unificata **`scripts/techpyre-cli.mjs`** (registrata in `package.json` come `npm run tp`) per permetterti di gestire in totale autonomia dal terminale **Scouting, Generazione Demo, Validazione Dry-Run, Ispezione, Invio Sequenze 4-Step e Classificazione Risposte**.

### 3.1 Mostrare la Guida Rapida dei Comandi
```bash
npm run tp -- help
```

### 3.2 Cercare Nuove Aziende B2B + Creare Demo Next.js (`scout`)
Cerca aziende reali su Meta Ad Library e Web B2B, scarta chi non ha sito proprietario o ha LCP < 5.0s, scarica in parallelo `/contatti`, `/chi-siamo`, `/azienda`, `/team`, `/privacy-policy`, calcola lo score email (bloccando `assistenza@`, `privacy@`, `pec@`), estrae il nome del titolare, cattura gli screenshot e genera la demo completa + i 4 step email:

```bash
# Genera 5 nuovi lead + demo per una o più keyword (senza inviare subito le email)
npm run tp -- scout --keywords="infissi catania,serramenti palermo" --count=5 --min-lcp=5.0

# Genera 3 nuovi lead + demo E invia subito lo Step 1 (First Touch) via SMTP
npm run tp -- scout --keywords="impianti fotovoltaici brescia" --count=3 --min-lcp=5.0 --send
```

### 3.3 Eseguire un Test Dry-Run su Keyword Reali (`dryrun`)
Permette di testare in tempo reale lo scraping, lo scoring email, l'estrazione del Decision Maker e il rilevamento Pixel su 3 keyword **senza salvare file né inviare email**:

```bash
# Usa le 3 keyword di test predefinite ("infissi catania", "impianti fotovoltaici brescia", "carpenteria metallica milano")
npm run tp -- dryrun

# Oppure specifica le tue keyword personalizzate
npm run tp -- dryrun --keywords="automazione industriale bologna,climatizzazione industriale verona"
```

### 3.4 Vedere la Lista dei Lead e Filtrarli per Stato (`list`)
```bash
# Mostra i lead presenti nel database con email, score, titolare, LCP, Ads e stato
npm run tp -- list --limit=40

# Filtra solo i lead nuovi ancora da contattare
npm run tp -- list --status=NEW --limit=30

# Filtra i lead a cui hai già inviato lo Step 1
npm run tp -- list --status=CONTACTED_STEP_1

# Filtra i lead caldi (che hanno risposto)
npm run tp -- list --status=HOT_LEAD

# Vedi i lead bloccati perché avevano solo caselle di ticketing/PEC
npm run tp -- list --status=INVALID_TICKET_INBOX
```

### 3.5 Ispezionare un Singolo Lead, i Link della Demo e i 4 Step Email (`inspect`)
Mostra la scheda completa di un lead, i link alla demo (`http://localhost:3000/demo/<slug>` e `https://www.techpyre.eu/demo/<slug>`), il `lastSentMessageId` e il testo integrale dei 4 Step:

```bash
npm run tp -- inspect <slug>
# Esempio:
npm run tp -- inspect af-serramenti-srl
```

### 3.6 Inviare le Email della Sequenza 4-Step (`send`)
Gestisce automaticamente la migrazione, il controllo anti-ticket, il controllo anti-link sullo Step 1, gli header di threading SMTP (`Message-ID`, `In-Reply-To`, `References`) per gli Step 2, 3 e 4, e la sincronizzazione nella cartella **Posta Inviata (`INBOX.Sent`)** di Aruba.
> **Nota:** Di default gli invii sono permessi solo `Lun-Ven 08:30-17:30` (ora di Roma) con limite di `35` First Touch/giorno. Aggiungi `--force` se vuoi forzare un invio fuori orario lavorativo.

```bash
# Invia lo Step 1 (First Touch · 65-85 parole · Zero Link) a un singolo lead
npm run tp -- send <slug> --step=1

# Forza l'invio dello Step 1 anche fuori orario lavorativo (es. di sera o nel weekend)
npm run tp -- send <slug> --step=1 --force

# Invia lo Step 2 (Follow-Up In-Thread col Link della Demo 0.3s) nello stesso thread email
npm run tp -- send <slug> --step=2 --force

# Invia lo Step 3 (Value Drop In-Thread + Avviso Chiamata Telefonica al numero dell'azienda)
npm run tp -- send <slug> --step=3 --force

# Invia lo Step 4 (Breakup Email In-Thread)
npm run tp -- send <slug> --step=4 --force

# INVIO MASSIVO (BATCH): Invia automaticamente lo Step 1 ai prossimi 15 lead idonei in stato NEW
npm run tp -- send --batch=15 --step=1

# INVIO MASSIVO FOLLOW-UP (BATCH): Invia lo Step 2 (in-thread col link demo) a 15 lead già in CONTACTED_STEP_1
npm run tp -- send --batch=15 --step=2
```

### 3.7 Classificare una Risposta Ricevuta e Generare la Risposta Su Misura (`classify-reply`)
Quando ricevi una risposta da un prospect, passa il testo a `classify-reply`: il comando aggiorna automaticamente lo stato del lead (`HOT_LEAD`, `INVALID_TICKET_INBOX` o `BLACKLISTED`) e ti stampa in console la risposta esatta pronta da inviare:

```bash
# Esempio 1: Risposta scettica / obiezione prezzo o agenzia
npm run tp -- classify-reply <slug> --subject="Re: ..." --text="Siamo già seguiti da un'agenzia, quanto costa?"

# Esempio 2: Risposta positiva che chiede il link della demo
npm run tp -- classify-reply <slug> --subject="Re: ..." --text="Sì grazie, mandatemi pure il link di prova"

# Esempio 3: Auto-responder di ticketing
npm run tp -- classify-reply <slug> --subject="Ticket #4912" --text="Abbiamo preso in carico la tua richiesta"
```

### 3.8 Migrare e Ripulire Tutti i Lead Storici (`migrate`)
Aggiorna in blocco tutti i file JSON in `src/data/leads/`, sostituendo eventuali email generiche/bloccate con le migliori email trovate in `preflight.json`, marcando come `INVALID_TICKET_INBOX` le caselle di assistenza/privacy/PEC, estraendo i nomi reali dai pattern `nome.cognome@` e rigenerando i 4 step secondo il protocollo Zero-Fluff:

```bash
npm run tp -- migrate
```
