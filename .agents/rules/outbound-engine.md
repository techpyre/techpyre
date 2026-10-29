# WORKSPACE RULES: B2B OUTBOUND ENGINE & SENIOR UI/UX STANDARDS

## 1. Architettura ed Economia dei Token
1. **MAI modificare il codice dei componenti React** (`src/components/templates/*`, `src/components/InteractiveQuiz.tsx`, `src/components/DiagnosticBanner.tsx`) quando generi una demo per un cliente.
2. Ogni nuova demo consiste ESCLUSIVAMENTE in:
   - Asset grafici reali salvati in `public/leads/[slug]/` (`logo.png`, `hero.jpg`, `old-site-mobile.png`, `new-demo-mobile.png`)
   - Un singolo file JSON validato su `src/types/lead.ts` salvato in `src/data/leads/[slug].json`
3. **Zero Immagini Stock/Unsplash e Zero Stringhe Artificiali da IA:**
   - È severamente vietato usare URL di `images.unsplash.com` o `placehold.co`. Estrai sempre gli URL delle immagini reali dal DOM della landing page del cliente (cantiere, furgoni, studio medico, macchinari reali) e salvali localmente in `public/leads/[slug]/hero.jpg`.
   - È severamente vietato usare prefissi finto-codice come `//`, `01 //`, `SPEC //`, emoji nei titoli o colori saturi innaturali.

## 2. Struttura Differenziata dei 3 Archetipi
Ogni archetipo ha una struttura di pagina e un obiettivo psicologico completamente diversi:
- **Archetipo `local-leadgen` (Edilizia, Fotovoltaico, Infissi, Idraulici, Impianti):**
  - **Unico archetipo con il Quiz Preventivo (`InteractiveQuiz`) nella Hero Split 50/50.**
  - Palette: primario `#1C2D42` (o colore scuro del brand), accento `#C2410C` o `#15803D`.
  - Compila sempre `heroBullets` con 3 garanzie operative concrete.
- **Archetipo `medical-clinic` (Dentisti, Cliniche, Chirurgia, Fisioterapia):**
  - **Senza Quiz.** Struttura editoriale calda (`#FAF8F5`, verde salvia/bosco `#1F4E46`, serif `Lora`) interamente focalizzata sullo **spingere il paziente a prenotare il colloquio / prima visita**.
  - Compila sempre `medicalDetails` includendo `directorName`, `alboRegistration` (Numero Iscrizione all'Albo Provinciale dei Medici/Odontoiatri), `openingHours`, `parkingAndAccess` e `conventions`.
- **Archetipo `b2b-authority` (Consulenza, SaaS, Automazione Industriale, Manifattura B2B):**
  - **Senza Quiz.** Struttura direzionale focalizzata sul **convincere il decision-maker e presentare Casi Studio documentati**, metriche di impatto economico (`secondaryStats`), metodo di lavoro (Bento Grid) e richiesta tavolo tecnico in fondo alla pagina.
  - Palette: primario `#18181B`, accento `#1E3A5F`, dark mode `#141619`.

## 3. Regola di Scrittura Email B2B (`emailPlainTextBody`)
- **Zero trattini lunghi (`—` o `–`):** È severamente vietato usare il trattino lungo tipico dell IA in qualsiasi testo, oggetto email, JSON o componente. Usa solo il trattino normale `-`, i due punti `:` o le virgole.
- **Presentazione Obbligatoria in apertura:** Apri sempre presentandoti chiaramente con il "Lei" o il "Voi" aziendale (*"Buongiorno [Nome / alla cortese attenzione della Direzione], mi chiamo Riccardo Granza e sono il fondatore di TechPyre: sviluppiamo landing page ad alta conversione per le aziende che investono in pubblicità su Facebook e Google."*).
- **Diagnosi Terra-Terra con Dati Reali + Impatto Economico:** Anche superando le 150-250 parole, spiega in modo concreto e comprensibile per un imprenditore:
  1. **Perché e come il sito attuale è fallato (con dati veri):** Cita il titolo dell inserzione, i secondi esatti di attesa su mobile (`estimatedMobileLcpSeconds`), il numero di script bloccanti (`renderBlockingScripts`), il punteggio mobile, il numero di voci di menu dispersive (`navLinksCount`) e i difetti visivi reali riscontrati nello screenshot mobile (testi o bottoni tagliati fuori dallo schermo a destra, popup bloccanti, assenza di modulo sopra la piega).
  2. **Perché gli conviene chiudere un contratto con te (ROI pratico):** Spiega che sopra i 3 secondi oltre metà dei clic pagati a Facebook esce prima di leggere, e che sostituendo il link con la tua pagina da `0.3 secondi` con simulatore guidato a 2 domande raddoppiano le richieste di preventivo qualificate a parità di spesa pubblicitaria.
- **Zero link cliccabili (`http://` o `https://`)** nel primo messaggio per garantire il recapito nella tab Principale.
- Chiudi con l invito a rispondere `"LINK"` e firma con nome, ruolo (`Fondatore TechPyre`) e telefono (`Tel: +39 379 115 9352`).
