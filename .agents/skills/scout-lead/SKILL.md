---
name: scout-lead
description: Esegue lo scouting 100% autonomo sulla Meta Ad Library e sul web tramite l'Agente AI per una keyword/nicchia B2B indicata dall'utente, filtra le aziende con LCP mobile >= 5.0s, lancia il preflight con qualifica buyer/agency/white-label, scarica logo/hero reali e cattura lo screenshot mobile. Usa quando l'utente chiede di trovare nuovi lead per una nicchia.
---

# Skill: Scout Lead (100% Autonomous B2B High-Ticket Discovery & Pre-Flight)

## Posizionamento TechPyre Studio (Single Source of Truth)
TechPYRE (*TechPyre Studio*) è uno **Studio di Ingegneria ed Ecosistemi Digitali** fondato da **Riccardo Granza** (*Fondatore & Architetto di Sistemi Digitali*).
Cerchiamo **aziende B2B strutturate e alto-spendenti** il cui sito web attuale rappresenta un costo morto e genera 3 danni economici diretti:
1. **Dispersione del budget pubblicitario:** pagina lenta su mobile (`LCP >= 5.0s`, CMS monolitici WordPress/Elementor/Divi/Wix).
2. **Cecità decisionale sul ROI:** assenza di tracciamento `Server-Side` (`GTM Server-Side`, `GA4`, `Meta CAPI`).
3. **Colli di bottiglia commerciali:** contatti dispersi in email isolate invece di pre-qualifica e sincronizzazione automatica `API/Webhook` verso il CRM (`HubSpot` o CRM su misura).

## Obiettivo
Trovare **in totale autonomia** (senza mai chiedere all'utente di navigare a mano o incollare URL) aziende italiane che stanno pagando inserzioni attive o cercano infrastrutture di conversione/portali B2B, verificare se sono **compratori qualificati**, scegliere la strategia commerciale più adatta (`DIRECT_BUYER` vs `AGENCY_COEXISTENCE_OR_WHITELABEL`), ed estrarre tutti i dati tecnici e visivi in `public/leads/[slug]/preflight.json`.

## Mercati Target Prioritari
1. **Industria, Manifattura & B2B (`b2b-authority`):** Automazione industriale, macchinari industriali, carpenteria metallica, logistica e magazzini automatici, distributori B2B, forniture industriali, impianti fotovoltaici industriali, software e servizi B2B strutturati.
2. **Edilizia & Impiantistica High-Ticket (`local-leadgen`):** Serramenti e facciate continue, impianti fotovoltaici residenziali/aziendali, ristrutturazioni chiavi in mano, climatizzazione e pompe di calore.
3. **Cliniche & Poliambulatori Strutturati (`medical-clinic`):** Cliniche odontoiatriche, implantologia dentale, poliambulatori specialistici.

## Procedura Passo-Passo (Zero Intervento Umano)

### 1. Ricerca Automatica con lo Script di Scouting AI
Quando l'utente ti chiede di trovare lead per una nicchia o città (es. *"Trovami 3 lead per automazione industriale brescia"* o *"Fai scouting per fotovoltaico industriale"*), lancia immediatamente nel terminale:

```bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
node scripts/scout-ad-library.mjs "<keyword>" <numero_lead>
```

Lo script esegue in automatico:
1. L'apertura headless di Chromium sulla **Meta Ad Library (IT)** per la keyword richiesta;
2. L'estrazione dal DOM renderizzato di tutti gli inserzionisti attivi che mandano traffico a una landing page esterna;
3. L'esecuzione di `scripts/preflight.mjs` su ciascun candidato (con controllo automatico anche della Home Page principale se la landing non espone email o P.IVA);
4. **Il filtro automatico di Qualifica Commerciale (`qualification`)** che **scarta in automatico**:
   - Chi ha già una pagina veloce (`LCP < 4.0s`);
   - Gli E-commerce puri con carrello (`Shopify`, `Aggiungi al carrello`);
   - Le grandi corporate burocratiche irraggiungibili (`Numero Verde 800`);
   - I siti privi di qualsiasi contatto diretto (né email né telefono);
5. **Il Rilevamento Agenzia & Strategia White-Label (`agencyDetection`)** che individua se il prospect è già seguito da una Web Agency (crediti nel footer, GTM + Pixel + CRM) e suggerisce l'angolo **Coesistenza / White-Label**;
6. Il download automatico di `logo.png` e `hero.jpg` reali e la cattura di `old-site-mobile.png` con emulazione iPhone 14 Pro reale via CDP.

### 2. Ispezione dei Risultati e Scelta del Angolo di Attacco
Leggi l'output JSON generato da `scripts/scout-ad-library.mjs` o i file `public/leads/[slug]/preflight.json`:
- **Priorità Assoluta:** Seleziona aziende con **`estimatedMobileLcpSeconds >= 5.0`** (idealmente `5.5s - 14.0s`).
- Se `qualification.recommendedStrategy === "DIRECT_BUYER"`: procedi con l'angolo diretto al titolare / Direttore Commerciale sui 3 danni economici (dispersione clic mobile, assenza Server-Side Tracking, assenza automazione CRM).
- Se `qualification.recommendedStrategy === "AGENCY_COEXISTENCE_OR_WHITELABEL"`: nel campo `outreach` del lead usa l'angolo collaborativo (*"Non sostituiamo chi vi gestisce le campagne: forniamo l'infrastruttura Next.js da 0.3s con tracciamento Server-Side e invio diretto al CRM"*), oppure proponi la partnership B2B2B direttamente all'agenzia rilevata in `detectedAgencyLinks`.

### 3. Passaggio Diretto alla Costruzione Demo
Non fermarti a chiedere conferme intermedie: appena `scout-ad-library.mjs` ha preparato la cartella `public/leads/[slug]/`, passa subito alla skill **`build-and-pitch`** per compilare `src/data/leads/[slug].json` e generare il pacchetto di outreach.
