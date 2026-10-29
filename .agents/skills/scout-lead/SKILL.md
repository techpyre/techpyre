---
name: scout-lead
description: Esegue lo scouting 100% autonomo sulla Meta Ad Library tramite l'Agente AI per una keyword/nicchia indicata dall'utente, filtra gli inserzionisti con landing page esterna, lancia il preflight con qualifica buyer/agency/white-label, scarica logo/hero reali e cattura lo screenshot mobile. Usa quando l'utente chiede di trovare nuovi lead per una nicchia.
---
# Scout Lead (Autonomous AI Ad Library & Technical Auditor)

## Procedura 100% Autonoma dell'Agente AI (Zero Intervento Manuale dell'Utente)
1. **Esecuzione Scouting Automatico su Meta Ad Library (Terminale):**
   - L'utente ti fornisce solo la keyword/nicchia (es. *"impianti fotovoltaici Brescia"*, *"implantologia dentale Milano"*, *"infissi pvc Bergamo"*) e il numero di lead desiderati (default: `5`).
   - Esegui direttamente nel terminale:
     `node scripts/scout-ad-library.mjs "<KEYWORD>" <NUMERO_LEAD>`
   - Questo script apre in autonomia Meta Ad Library (Paese: Italia, Annunci Attivi) in modalità headless, estrae tutti gli inserzionisti con landing page esterna, esegue `scripts/preflight.mjs` e applica il **Filtro di Qualificazione Commerciale & White-Label**:
     - 🔴 **`DISQUALIFIED_SKIP` (Scartati in automatico):** Aziende che hanno già una landing page veloce (`LCP < 2.6s` o Funnel Builder performante ClickFunnels/GoHighLevel/Unbounce), E-commerce con carrello, S.p.A./Franchising strutturati con ufficio acquisti bloccato, funnel solo WhatsApp/Messenger, o siti privi di contatti.
     - 🟢 **`DIRECT_BUYER` (Vendita Diretta al Titolare):** PMI che pagano le sponsorizzate ma mandano il traffico su un sito vetrina lento (`LCP > 3.0s`) senza agenzia performance strutturata.
     - 🟣 **`AGENCY_COEXISTENCE_OR_WHITELABEL` (Modalità White-Label / Coesistenza Agenzia):** Aziende seguite da una Web Agency (rilevata nel footer o dallo stack GTM/CRM/URL `/optin`) ma con pagina lenta o rotta su mobile. Per questi lead `scripts/send-outreach.mjs` genera sia la risposta anti-obiezione *"Non sostituiamo la vostra agenzia, forniamo solo la pagina 0.3s in White-Label"* sia il pitch B2B2B diretto per l'Agenzia rilevata.

2. **Analisi Multimodale e Arricchimento Dati (Agente AI):**
   - Per ciascuno degli `[slug]` restituiti dallo script:
     - Leggi `public/leads/[slug]/preflight.json` e osserva lo screenshot `public/leads/[slug]/old-site-mobile.png` con `read_file`.
     - Se `decisionMakerName` o l'email non sono ancora espliciti in `legalSnippets`, recupera con `curl -sL` la Privacy Policy o la pagina Contatti/Chi Siamo del dominio per estrarre Nome e Cognome del Titolare/Amministratore o Direttore Sanitario.
     - Aggiorna `public/leads/[slug]/preflight.json` aggiungendo:
       - `activeAdHeadline` (titolo dell'inserzione o H1 della landing collegata)
       - `activeAdCopy` (sintesi dell'offerta)
       - `decisionMakerName`
       - `threeCriticalFlaws` (3 difetti concreti visibili nello screenshot mobile `old-site-mobile.png`).

3. **Avvio Parallelo delle Demo (Opzionale o su richiesta):**
   - Se l'utente chiede di generare anche le demo per i lead appena trovati, lancia un subagent (`invoke_subagent`) per ciascuno `[slug]` chiedendogli di eseguire la skill `build-and-pitch`.
