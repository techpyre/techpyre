# GUIDA OPERATIVA CLI & MANUALE PIPELINE B2B · TECHPYRE STUDIO

Questo documento è la guida pratica per utilizzare in completa autonomia la pipeline Outbound B2B di **TechPyre Studio** da terminale tramite la CLI unificata [`scripts/techpyre-cli.mjs`](file:///Users/riccardogranza/Documents/TechPyre/techpyre/scripts/techpyre-cli.mjs) (`npm run tp`).

> Tutte le regole architetturali e di posizionamento sono sincronizzate anche in [`AGENTS.md`](file:///Users/riccardogranza/Documents/TechPyre/techpyre/AGENTS.md), così che l'Agente AI le legga e le rispetti automaticamente in ogni sessione.

---

## 1. Panoramica Rapida dei Comandi (`npm run tp`)

Puoi invocare la CLI in due modi equivalenti dalla cartella del progetto (`/Users/riccardogranza/Documents/TechPyre/techpyre`):
- `npm run tp -- <comando> [opzioni]`
- `node scripts/techpyre-cli.mjs <comando> [opzioni]`

| Comando | Cosa fa | Esempio rapido |
| :--- | :--- | :--- |
| `help` | Mostra il riepilogo di tutti i comandi e le opzioni | `npm run tp -- help` |
| `scout` | Cerca aziende B2B reali, misura LCP mobile, estrae il titolare e l'email migliore, crea la demo Next.js e i 4 step email | `npm run tp -- scout --keywords="infissi catania" --count=5` |
| `dryrun` | Testa lo scraping, lo scoring email e il rilevamento Pixel su 3 keyword reali senza salvare file né inviare email | `npm run tp -- dryrun` |
| `list` | Mostra la tabella dei lead filtrabile per stato (`NEW`, `CONTACTED_STEP_1`, `HOT_LEAD`, `INVALID_TICKET_INBOX`, `BLACKLISTED`) | `npm run tp -- list --status=NEW --limit=30` |
| `inspect` | Mostra tutti i dettagli di un lead, i link della demo locale/produzione e il testo completo dei 4 step email | `npm run tp -- inspect <slug>` |
| `send` | Invia uno degli step (`--step=1\|2\|3\|4`) a un singolo lead o a un batch (`--batch=N`) con SMTP Threading reale (`In-Reply-To` / `References`) | `npm run tp -- send <slug> --step=1 --force` |
| `classify-reply` | Analizza la risposta ricevuta da un lead, aggiorna lo stato e genera la risposta consultiva pronta all'invio | `npm run tp -- classify-reply <slug> --text="..."` |
| `migrate` | Migra e ripulisce tutti i lead storici in `src/data/leads/*.json`, bloccando le caselle di ticketing/PEC e rigenerando i 4 step Zero-Fluff | `npm run tp -- migrate` |

---

## 2. Flusso di Lavoro Consigliato (Passo dopo Passo)

### Fase 1 · Verifica Preliminare (Dry-Run)
Prima di lanciare uno scouting su una nuova nicchia o città, puoi verificare in pochi secondi cosa trova il motore e come estrae email, titolare e pixel:
```bash
npm run tp -- dryrun --keywords="infissi catania,impianti fotovoltaici brescia,carpenteria metallica milano"
```

### Fase 2 · Scouting e Generazione Automatica delle Demo (`scout`)
Per trovare nuove aziende con **LCP mobile >= 5.0s**, scaricare gli asset reali in `public/leads/[slug]/` e generare il file `src/data/leads/[slug].json`:
```bash
# Genera 10 lead qualificati (senza inviare subito le email)
npm run tp -- scout --keywords="serramenti verona,infissi padova,fotovoltaico vicenza" --count=10 --min-lcp=5.0

# Se vuoi anche inviare subito in automatico lo Step 1 appena creata ogni demo:
npm run tp -- scout --keywords="carpenteria metallica bergamo" --count=5 --min-lcp=5.0 --send
```

### Fase 3 · Controllo delle Demo nel Browser e Ispezione del Copy (`list` & `inspect`)
1. Elenca i lead pronti da contattare:
   ```bash
   npm run tp -- list --status=NEW --limit=20
   ```
2. Ispeziona i dettagli e i 4 messaggi email di uno specifico lead:
   ```bash
   npm run tp -- inspect <slug>
   ```
3. Per vedere la demo interattiva in locale, avvia `npm run dev` e apri:
   - `http://localhost:3000/demo/<slug>` (oppure `https://www.techpyre.eu/demo/<slug>` una volta fatto `git push`).

### Fase 4 · Invio della Sequenza a 4 Step con SMTP Threading (`send`)
Il motore di invio salva automaticamente il `Message-ID` del primo invio dentro `meta.lastSentMessageId` nel file JSON del lead e lo usa negli header MIME `In-Reply-To` e `References` per gli Step 2, 3 e 4, così che tutte le email compaiano raggruppate **nello stesso thread** nella casella del destinatario e nella tua cartella **Posta Inviata (`INBOX.Sent`)** di Aruba.

```bash
# GIORNO 1 · Invia Step 1 (First Touch: 65-85 parole, ZERO link, ZERO prezzi)
npm run tp -- send <slug> --step=1

# Invia Step 1 in blocco a 20 lead nuovi (rispettando il limite di 35/giorno e il jitter anti-spam)
npm run tp -- send --batch=20 --step=1

# GIORNO 4 · Invia Step 2 (In-Thread: gira proattivamente il link della demo da 0.3s + invito call 10 min)
npm run tp -- send <slug> --step=2
# oppure in batch a chi ha già ricevuto lo Step 1:
npm run tp -- send --batch=20 --step=2

# GIORNO 8 · Invia Step 3 (In-Thread: Value Drop + ti avvisa in console del numero di telefono da chiamare!)
npm run tp -- send <slug> --step=3

# GIORNO 13 · Invia Step 4 (In-Thread: Breakup email cortese)
npm run tp -- send <slug> --step=4
```
> **Opzione `--force`:** Se stai facendo dei test la sera o nel weekend (fuori dalla finestra `Lun-Ven 08:30-17:30`), aggiungi `--force` al comando `send` per bypassare il blocco orario.

### Fase 5 · Gestione delle Risposte Ricevute (`classify-reply`)
Quando un'azienda risponde alla tua email:
```bash
npm run tp -- classify-reply <slug> --subject="Re: ..." --text="Incolla qui il testo della risposta del cliente"
```
Il classificatore:
- Se rileva un **bot di ticketing** (`Ticket #`, `abbiamo preso in carico`), sposta subito il lead in `INVALID_TICKET_INBOX` così non invierai mai più follow-up a quel bot.
- Se rileva una **richiesta del link** (`POSITIVE_REQUEST_LINK`), segna il lead come `HOT_LEAD` e ti mostra lo Step 2 col link della demo pronto da inviare.
- Se rileva una **domanda sul prezzo o un'obiezione agenzia** (`SKEPTICAL_OR_OBJECTION`), segna il lead come `HOT_LEAD` e ti genera una risposta su misura (senza listini prezzi) che invia il link della demo e propone 10 minuti di condivisione schermo o un video Loom di 2 minuti.
- Se rileva un **rifiuto / disiscrizione** (`UNSUBSCRIBE_OR_NO`), sposta il lead in `BLACKLISTED` e blocca ogni invio futuro.
