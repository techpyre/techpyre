import nodemailer from "nodemailer";
import tls from "tls";
import fs from "fs";
import path from "path";

async function main() {
  const envPath = path.join(process.cwd(), ".env.local");
  const env = fs.readFileSync(envPath, "utf-8");
  const host = env.match(/SMTP_HOST=["']?([^"'\r\n]+)/)[1];
  const port = Number(env.match(/SMTP_PORT=["']?([^"'\r\n]+)/)?.[1] || 465);
  const user = env.match(/SMTP_USER=["']?([^"'\r\n]+)/)[1];
  const pass = env.match(/SMTP_PASS=["']?([^"'\r\n]+)/)[1];
  const fromName = "Riccardo Granza - TechPyre";

  const targetEmail = "info@professionistidelserramento.com";
  const subject = "Re: Sulla vostra sponsorizzata Facebook a Ragusa - Presentazione TechPyre";
  const inReplyTo = "<CAOC-KtmLG-3vrc-Xq2FQSHVn1UCphMGKKjZwQZpHQsXvUBJb8w@mail.gmail.com>";
  const references = "<ce09d225-6748-12a4-355c-ff8b8714ec08@techpyre.eu> <CAOC-KtmLG-3vrc-Xq2FQSHVn1UCphMGKKjZwQZpHQsXvUBJb8w@mail.gmail.com>";

  const text = `Gentile Direzione di Professionisti Del Serramento,

comprendo e condivido pienamente la vostra richiesta: quando si investe sul proprio brand e sulle campagne pubblicitarie, è fondamentale sapere con chiarezza con chi si sta parlando e poter verificare la solidità tecnica del partner.

Mi ripresento volentieri: mi chiamo Riccardo Granza e sono il fondatore di TechPyre. Trovate la presentazione del nostro studio e la nostra visione aziendale all'indirizzo https://www.techpyre.eu

Siamo una realtà specializzata nello sviluppo di landing page ad altissime prestazioni per le aziende che investono in campagne su Meta e Google. Il nostro obiettivo è semplice: eliminare i rallentamenti e i tempi di attesa tipici dei siti tradizionali (come WordPress, che da cellulare disperdono gran parte dei visitatori prima ancora che la pagina si apra), offrendo pagine istantanee (0.3 secondi) che caricano subito e non fanno attendere il cliente.

Per il vostro caso specifico, abbiamo sviluppato e reso già operativa una versione dimostrativa completa e tarata sulla vostra realtà di Ragusa e Niscemi, consultabile a questo indirizzo:
https://www.techpyre.eu/demo/professionistidelserramento

Provandola dal vostro telefono, potrete notare la velocità immediata di risposta, la valorizzazione del marchio Schüco, le agevolazioni fiscali attive e il modulo rapido a due domande per richiedere il contatto.

Siamo pronti a rifinire la pagina nei minimi dettagli e a pubblicarla direttamente sul vostro dominio (ad esempio su preventivi.professionistidelserramento.com o come pagina di atterraggio delle inserzioni). Se desiderate qualsiasi modifica a testi, colori, domande del modulo o impostazione generale, interveniamo subito secondo le vostre preferenze.

Per procedere con la pubblicazione online ci occorrono soltanto questi elementi:
1. Eventuali correzioni o integrazioni ai testi e alle promozioni attuali;
2. Eventuali fotografie recenti dei vostri lavori o dei due showroom di Ragusa e Niscemi da inserire;
3. I recapiti definitivi (indirizzo email o recapito WhatsApp aziendale) a cui trasmettere in tempo reale le notifiche delle richieste ricevute;
4. Un contatto rapido con il responsabile del vostro dominio o l'accesso ai record DNS per collegare la pagina (operazione da dieci minuti), oltre all'eventuale codice Pixel di Meta per tracciare le conversioni.

Sul piano economico operiamo con una formula di totale garanzia:
- Il costo complessivo è di 900 euro una tantum, senza canoni periodici o costi ricorrenti, con codice e contenuti al 100% di vostra proprietà;
- Non richiediamo alcun acconto: il saldo viene corrisposto solo a lavoro ultimato e a pagina pubblicata online sul vostro dominio, dopo che avrete verificato che tutto funzioni esattamente come desiderate.

Resto a vostra completa disposizione per qualsiasi chiarimento o per una breve chiamata conoscitiva.

Un cordiale saluto,

Riccardo Granza
Fondatore, TechPyre
Sito web: https://www.techpyre.eu
Telefono e WhatsApp: +39 379 115 9352
Email: riccardo.granza@techpyre.eu`;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 15000,
  });

  console.log("Invio email in corso a:", targetEmail);
  const info = await transporter.sendMail({
    from: `"${fromName}" <${user}>`,
    replyTo: user,
    to: targetEmail,
    subject,
    text,
    inReplyTo,
    references,
  });

  console.log("Email inviata con successo! Message-ID:", info.messageId);

  // Sincronizzazione in Aruba INBOX.Sent
  function appendToArubaSent(rawEmail) {
    return new Promise((resolve) => {
      const socket = tls.connect({ host: "imaps.aruba.it", port: 993 }, () => {});
      socket.setEncoding("utf-8");
      let step = 0;
      const timeout = setTimeout(() => {
        try { socket.destroy(); } catch {}
        resolve(false);
      }, 8000);

      socket.on("data", (data) => {
        if (step === 0 && data.includes("* OK")) {
          step = 1;
          socket.write(`A1 LOGIN "${user}" "${pass}"\r\n`);
        } else if (step === 1 && data.includes("A1 OK")) {
          step = 2;
          const len = Buffer.byteLength(rawEmail, "utf-8");
          socket.write(`A2 APPEND "INBOX.Sent" (\\Seen) {${len}}\r\n`);
        } else if (step === 2 && data.includes("+")) {
          step = 3;
          socket.write(rawEmail + "\r\n");
        } else if (step === 3 && data.includes("A2 OK")) {
          clearTimeout(timeout);
          socket.write("A3 LOGOUT\r\n");
          resolve(true);
        } else if (data.includes("NO") || data.includes("BAD")) {
          clearTimeout(timeout);
          resolve(false);
        }
      });

      socket.on("error", () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  const rawMessage = [
    `From: "${fromName}" <${user}>`,
    `To: ${targetEmail}`,
    `Subject: ${subject}`,
    `In-Reply-To: ${inReplyTo}`,
    `References: ${references}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${info.messageId}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    text,
  ].join("\r\n");

  const sentSynced = await appendToArubaSent(rawMessage);
  console.log("Sincronizzazione in Posta Inviata Aruba:", sentSynced ? "Completata con successo" : "Non riuscita");

  // Aggiorna storico
  const historyPath = path.join(process.cwd(), "src", "data", "outreach-history.json");
  let history = [];
  if (fs.existsSync(historyPath)) {
    try { history = JSON.parse(fs.readFileSync(historyPath, "utf-8")); } catch {}
  }
  history.push({
    slug: "professionistidelserramento",
    companyName: "Professionisti Del Serramento",
    recipient: targetEmail,
    type: "FOLLOW_UP_CREDENTIALS_AND_OFFER",
    subject,
    messageId: info.messageId,
    sentAt: new Date().toISOString(),
    sentBy: "Riccardo Granza (Founder)",
  });
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), "utf-8");

  // Aggiorna status
  const statusPath = path.join(process.cwd(), "src", "data", "leads-status.json");
  let statuses = {};
  if (fs.existsSync(statusPath)) {
    try { statuses = JSON.parse(fs.readFileSync(statusPath, "utf-8")); } catch {}
  }
  statuses["professionistidelserramento"] = {
    status: "FOLLOWUP_SENT",
    notes: "Follow-up con presentazione TechPyre, link demo, requisiti go-live e offerta 900 euro a lavoro ultimato inviato il 30 Ottobre alle 12:14",
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(statusPath, JSON.stringify(statuses, null, 2), "utf-8");
  console.log("Stato lead salvato in leads-status.json.");
}

main().catch(console.error);
