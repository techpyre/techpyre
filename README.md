# TechPYRE — B2B Web Engineering & Digital Consulting Platform

Questo repository contiene il codice sorgente del portale B2B di **TechPYRE** (nome configurabile dinamicamente), studio di ingegneria del software e consulenza di marketing digitale fondato da **Riccardo Granza**.

Il progetto non è una semplice vetrina, ma uno strumento di posizionamento ad alta conversione progettato con un'estetica istituzionale, umana e autorevole.

---

## 1. Filosofia Estetica: "Stile Mediolanum" & Anti-AI Design

L'identità visiva del sito rifiuta categoricamente l'estetica dei template SaaS moderni e dei siti generati dall'intelligenza artificiale. Il punto di riferimento visivo e comunicativo è il **Private Banking italiano di alta fascia (es. Banca Mediolanum)**: lusso discreto, solidità patrimoniale, chiarezza espositiva e centralità assoluta della relazione umana (*"Costruito intorno a te"*).

### 1.1 Cosa è SEVERAMENTE VIETATO (Pattern "Sospetto AI")
* **Visual:** Vietati sfondi nero assoluto (`#000000`) con luci al neon, mesh gradients viola/ciano, Bento Grid forzate, glassmorphism pesante, icone 3D fluttuanti o illustrazioni vettoriali astratte.
* **Copywriting:** Vietato il linguaggio "AI-ese". Sono bandite parole ed espressioni come: *"Nel panorama digitale odierno"*, *"Sblocca il tuo potenziale"*, *"Soluzioni a 360 gradi"*, *"Portiamo il tuo business al livello successivo"*, *"Sinergia"*, *"Rivoluziona"*, *"Crescita esponenziale"*. Il testo deve suonare scritto di pugno da un consulente umano esperto: asciutto, onesto, pragmatico e diretto.

### 1.2 Sistema Visivo e Palette Colori (Istituzionale & Umano)
Il design deve respirare attraverso spazi bianchi generosi, griglie editoriali rigorose (separate da filetti sottili `1px solid` a basso contrasto) e una palette cromatica che trasmetta fiducia, storicità e calore:
* **Background Primario (Luce Calda):** Alabastro / Carta Istituzionale (`#F8F7F4`) — mai bianco ottico accecante (`#FFFFFF`), per non affaticare la lettura e dare una sensazione tattile, quasi cartacea.
* **Background Secondario (Profondità Istituzionale):** Blu Notte Mediolanum (`#0A192F` o `#0D1F33`) — utilizzato per sezioni ad alto contrasto (es. Blueprint, Footer o sezioni di rottura) per trasmettere rigore bancario e affidabilità tecnica.
* **Testo Primario:** Inchiostro Antracite (`#14181F`).
* **Testo Secondario / Muted:** Grigio Ardesia Caldo (`#5A6270`).
* **Accento Primario (Prestigio & Azione):** Blu Istituzionale Intenso (`#003366`) abbinato a dettagli in **Bronzo/Oro Antico** (`#B8860B` o `#C5A059`) per gli indicatori di valore, i bordi attivi e i micro-dettagli di lusso non ostentato.

### 1.3 Tipografia
Abbinamento ad alto contrasto tra autorevolezza classica e precisione ingegneristica:
* **Headings (H1, H2, Citazioni):** Font Serif editoriale e scultoreo (*Playfair Display* o *Newsreader*). Trasmette cultura d'impresa, serietà e presenza umana.
* **Body & UI:** Font Sans-Serif umanista e iper-leggibile (*Plus Jakarta Sans* o *Inter*).
* **Prezzi, Dati & Specifiche Tecniche:** Font Monospace pulito (*JetBrains Mono*), per sottolineare la trasparenza numerica e il rigore ingegneristico.

---

## 2. Motion Design & Micro-interazioni

Le animazioni (realizzate con **Framer Motion**) sono un pilastro fondamentale dell'esperienza utente, ma non devono essere "virtuosistiche" o circensi. Devono comunicare **peso, stabilità e precisione meccanica**.

1. **Fisica del Movimento:** Nessun effetto "molla" (spring) rimbalzante. Utilizzare esclusivamente curve di easing progressive e solenni: `cubic-bezier(0.22, 1, 0.36, 1)` con durate comprese tra `0.6s` e `0.9s`.
2. **Grid Drawing:** Le linee divisorie delle sezioni e delle tabelle dei prezzi devono disegnarsi progressivamente (`scaleX: 0 -> 1` o `scaleY: 0 -> 1`) man mano che l'utente scorre la pagina.
3. **Text Reveal:** I titoli principali devono emergere dal basso tramite maschere di ritaglio (`overflow-hidden` sul contenitore e traslazione `y: "100%" -> 0%`), dando l'impressione di una stampa tipografica che prende vita.
4. **Interazioni Tattili (Hover):** 
   * I pulsanti primari hanno un riempimento fluido dal basso verso l'alto al passaggio del mouse.
   * Le righe del listino servizi si illuminano delicatamente cambiando contrasto e traslando il titolo di `8px` verso destra, segnalando reattività immediata.

---

## 3. Architettura Tecnica e Fattorizzazione del Codice

Il progetto è basato su **Next.js (App Router)** e **TypeScript** rigoroso (`strict: true`).

### 3.1 Regola d'Oro: Disaccoppiamento Totale (Single Source of Truth)
**È vietato hardcodare testi, prezzi, email o il nome dello studio all'interno dei componenti React (`.tsx`).**
Tutto il contenuto testuale e i parametri di business devono risiedere in un unico file di configurazione fortemente tipizzato: `src/config/siteContent.ts`.

* **Cambio Nome Istantaneo:** La proprietà `brand.name` (attualmente impostata su `"TechPYRE"`) controlla dinamicamente Navbar, Hero, Footer, Copywriting, Metadata SEO e template delle email di contatto. Modificando quella singola riga in `siteContent.ts`, l'intero sito cambia identità senza toccare la UI.
* **Manutenibilità:** Ogni sezione della pagina legge esclusivamente le proprie props dal file di configurazione, rendendo qualsiasi modifica a prezzi o testi una questione di secondi.

### 3.2 Albero delle Directory
```text
src/
├── config/
│   └── siteContent.ts          # UNICA FONTE DI VERITÀ: Brand, testi, prezzi, bio, contatti
├── types/
│   └── content.ts              # Interfacce TypeScript per siteContent e payload API
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Navigazione sobria, sticky con blur minimale
│   │   └── Footer.tsx          # Dati legali, contatti diretti, estetica scura istituzionale
│   ├── sections/
│   │   ├── Hero.tsx            # Posizionamento B2B, promessa di valore e CTA primaria
│   │   ├── ServicesMatrix.tsx  # Listino prezzi trasparente in stile Private Banking
│   │   ├── FounderLetter.tsx   # La storia di Riccardo Granza (focus umano e vision)
│   │   └── ContactBox.tsx      # Modulo di contatto integrato con stati interattivi
│   └── ui/
│       ├── AnimatedLine.tsx    # Divisori animati allo scroll
│       ├── RevealText.tsx      # Wrapper Framer Motion per la tipografia
│       └── Button.tsx          # Componente bottone con micro-interazioni
└── app/
    ├── api/
    │   └── contact/
    │       └── route.ts        # Endpoint POST funzionante con fallback intelligente
    ├── globals.css             # Setup Tailwind e variabili CSS per i colori
    ├── layout.tsx              # Configurazione Font (Serif + Sans + Mono) e Metadata dinamici
    └── page.tsx                # Assemblaggio pulito delle sezioni
```

---

## 4. Struttura dei Contenuti e Logica di Business (B2B)

Il sito si rivolge a imprenditori, PMI e decision-maker aziendali. La comunicazione punta sulla chiarezza contrattuale, sull'assenza di burocrazia e sul contatto diretto con chi scrive il codice e definisce la strategia.

### 4.1 Listino Servizi e Prezzi (Trasparenza Totale)
1. **Consulenza Informatica & Marketing Digitale:** Primi 30 min Gratuiti, poi 100€ / ora.
2. **Landing Page ad Alta Conversione:** 500€ (Prezzo Fisso).
3. **Blueprint Ingegneristico del Sito:** Da 1.500€ a 2.500€.
4. **Sito Web / Ecosistema Completo:** Da 5.000€ a 15.000€ (salvo imprese titaniche).

### 4.2 La Storia del Fondatore: Riccardo Granza
Manifesto del Family Banker tecnologico: Riccardo Granza, neodiciottenne, neoimprenditore. Zero overhead d'agenzia, tecnologie moderne di livello enterprise a prezzo onesto, qualità artigianale e determinazione assoluta.

---

## 5. Il Box di Contatto (Architettura Plug-and-Play)
* Form con campi Nome, Azienda, Email/Telefono, Selettore Servizio (con sync dalle CTA del listino) e Messaggio.
* Stati: `idle`, `submitting`, `success`, `error`.
* API Route con Smart Fallback (latente di 800ms e log ordinato in console se SMTP non è impostato).
