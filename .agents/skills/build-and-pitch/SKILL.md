---
name: build-and-pitch
description: Genera la demo Next.js compilando il file JSON del lead secondo il nuovo posizionamento B2B High-Ticket di TechPyre Studio e gli standard Senior UI/UX per archetipo, verifica visivamente la demo nel browser locale con emulazione iPhone CDP reale, cattura lo screenshot comparativo e prepara l'email di cold outreach. Usa quando uno slug ha già il suo preflight.json pronto.
---

# Skill: Build & Pitch (Senior UI/UX Demo Builder + B2B High-Ticket Outreach)

## Posizionamento Ufficiale TechPyre Studio (Single Source of Truth)
- **Brand:** **TechPYRE** (*TechPyre Studio*) · **Studio di Ingegneria ed Ecosistemi Digitali**
- **Fondatore:** **Riccardo Granza** · *Fondatore & Architetto di Sistemi Digitali*
- **Recapiti:** `riccardo.granza@techpyre.eu` · Tel & WhatsApp B2B: `+39 379 115 9352` · `https://www.techpyre.eu` · `github.com/techpyre`
- **Tesi Strategica nei Pitch e negli Audit:**
  Il 95% dei siti aziendali è un costo morto (CMS monolitici lenti 4-8s su mobile, pixel bloccati dagli ad-blocker che perdono fino al 50% dei dati e contatti isolati via email senza collegamento CRM). TechPyre ingegnerizza ecosistemi digitali proprietari su 3 livelli:
  1. **Infrastruttura Web in Next.js / TypeScript (`< 0.4s` / `0.3s`)**: Servizio 01 a partire da `900€` a corpo, zero canoni di noleggio, consegna da 5 giorni lavorativi, 100% proprietà codice sul repository del cliente.
  2. **Portali Operativi Custom & Ecosistemi B2B (`Next.js + PostgreSQL`)**: Servizio 02 a partire da `5.000€` a sprint (listini per P.IVA, area riservata Clienti/Agenti/Amministrazione, sync ERP). Reference live: **Valkiria International** (`https://b2b-demo.techpyre.eu`).
  3. **Data Engineering & Server-Side Tracking (`GTM Server-Side`, `GA4`, `Meta CAPI`)**: Servizio 03 a partire da `1.200€` (recupero 30-50% conversioni perse).
  4. **Automazione Commerciale & Integrazione CRM (`API/Webhook` verso `HubSpot` o CRM aziendale)**: Servizio 04 a partire da `1.500€` (qualifica automatica e notifica istantanea alla rete vendita). Reference live: **Kinetix Performance** (`https://headless-demo.techpyre.eu`).

## Prerequisiti
Assicurati che esista `public/leads/[slug]/preflight.json` (generato dalla skill `scout-lead`).

## Procedura Passo-Passo

### 1. Scelta dell'Archetipo e Compilazione di `src/data/leads/[slug].json`
Puoi usare `node scripts/autofill-lead.mjs [slug] [archetype]` oppure compilare il JSON seguendo lo schema `LeadConfig` in `src/types/lead.ts`:
- **Scegli l'`archetype` corretto per la psicologia del settore:**
  - `'b2b-authority'` per manifattura, automazione industriale, macchinari, distribuzione B2B, logistica, carpenteria, impianti industriali, software/servizi B2B (**Hero orientata a ROI/Numeri, Casi Studio documentati e modulo Studio di Fattibilità / Tavolo Tecnico**).
  - `'local-leadgen'` per serramenti, fotovoltaico, ristrutturazioni, climatizzazione (**Simulatore Preventivo in 3 passi in Hero**).
  - `'medical-clinic'` per studi dentistici, cliniche, chirurgia estetica (**Focus su Direzione Sanitaria, Albo Medici, Igiene/Sicurezza e Prenotazione Prima Visita**).
- **Regola Zero Tratti Lunghi:** Non usare MAI tratti lunghi (em-dash o en-dash) in nessun campo del JSON o delle email. Usa solo `-`, `:`, `,` oppure `·`.
- **Regola Zero Gergo Tecnico Superfluo:** Non usare prefissi come `//`, `01 //`, `SPEC //`. Parla all'imprenditore e al Direttore Commerciale di ritorno sull'investimento, dispersione clic, tracciamento Server-Side e collegamento CRM.
- **Audit Tecnico Reale (`threeCriticalFlaws`):**
  1. Lentezza mobile reale (`${originalLcpSeconds}s` e script bloccanti) che disperde oltre metà dei clic pagati sulle campagne prima dell'apertura della pagina.
  2. Assenza di un flusso immediato di pre-qualifica e sincronizzazione automatica `API/Webhook` con il CRM aziendale (collo di bottiglia commerciale e data-entry manuale).
  3. Dispersione dei dati di conversione su mobile senza tracciamento di prima parte `Server-Side` (`GTM Server-Side` e `Meta CAPI`).
- **Scrittura Email (`outreach.emailPlainTextBody` & `outreach.followUpWithLinkBody`):**
  - **Apertura obbligatoria:** *"Buongiorno, alla cortese attenzione della Direzione di [Nome Azienda], mi chiamo Riccardo Granza e sono il fondatore di TechPyre Studio: progettiamo infrastrutture web ad alte prestazioni, tracciamenti Server-Side e automazioni CRM per le aziende B2B che investono in campagne su Meta e Google."*
  - **Corpo:** Cita la loro campagna/pagina attiva per la città di riferimento, il tempo reale di caricamento su mobile (`${originalLcpSeconds}s`) e i colli di bottiglia nella raccolta e qualifica dei contatti.
  - **Proposta di valore:** Spiega che abbiamo ingegnerizzato una versione dimostrativa istantanea (`0.3s`) in `Next.js` con i loro contenuti, configuratore di qualifica lead e predisposizione `Server-Side / CRM` (soluzione fornita a corpo a partire da `900 euro`, zero canoni di noleggio e `100%` di proprietà del codice).
  - **Call to Action Anti-Spam (Zero Link in 1ª email):** *"Se vi fa piacere provarla dal telefono, rispondetemi pure 'LINK' qui sotto e ve lo giro subito."*
  - **Firma Ufficiale:**
    ```text
    Un cordiale saluto,
    Riccardo Granza
    Fondatore & Architetto di Sistemi Digitali · TechPyre Studio
    Tel & WhatsApp B2B: +39 379 115 9352
    ```

### 2. Verifica Visiva Mobile Reale (CDP iPhone Emulation)
Se richiesto per verifica visiva, cattura lo screenshot retina della demo su `http://localhost:3000/demo/[slug]` in `public/leads/[slug]/new-demo-mobile.png` e verifica:
1. Logo perfettamente leggibile nell'header;
2. Hero image reale caricata senza link rotti;
3. Layout pulito e privo di tratti lunghi o finto-codice.

### 3. Generazione Pacchetto Outbound e Invio Email
Esegui:
```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
node scripts/send-outreach.mjs [slug]
```
Se l'utente ha richiesto anche l'invio dell'email, aggiungi il flag `--send`:
```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
node scripts/send-outreach.mjs [slug] --send
```
