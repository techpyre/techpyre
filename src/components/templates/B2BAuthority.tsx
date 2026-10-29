"use client";

import React, { useState } from "react";
import { ArrowRight, Building2, Check, FileText, Lock, MapPin, Phone, RotateCcw, Shield } from "lucide-react";
import { LeadConfig } from "@/types/lead";

interface TemplateProps {
  data: LeadConfig;
}

export default function B2BAuthority({ data }: TemplateProps) {
  const { meta, content } = data;

  const referenceWall = content.socialProof.clientReferenceWall || [
    "Qualità Certificata ISO 9001",
    "Conformità Transizione 5.0",
    "Direttiva Macchine 2006/42/CE",
    "Integrazione MES / ERP",
    "Assistenza Tecnica Diretta",
  ];

  const kpiStats = content.socialProof.secondaryStats || [
    {
      value: content.socialProof.mainStatValue,
      label: content.socialProof.mainStatLabel,
    },
    {
      value: "+42%",
      label: "Incremento medio della produttività di reparto registrato post-collaudo",
    },
    {
      value: "14 mesi",
      label: "Tempo medio di rientro dell'investimento grazie a efficienza e incentivi",
    },
  ];

  const [contactName, setContactName] = useState("");
  const [companyRole, setCompanyRole] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [selectedScope, setSelectedScope] = useState(
    content.quiz.question1.options[0] || "Studio di fattibilità tecnica"
  );
  const [b2bSubmitted, setB2bSubmitted] = useState(false);

  const handleB2BSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setB2bSubmitted(true);
  };

  const handleSimulateB2B = () => {
    if (!contactName) setContactName("Ing. Paolo Ferretti");
    if (!companyRole) setCompanyRole("Direttore di Stabilimento - Officine Meccaniche S.p.A.");
    if (!contactInfo) setContactInfo("p.ferretti@officinemeccaniche.it · 348 712 9034");
    setB2bSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#4B5563]">
      {/* Header Istituzionale B2B */}
      <header className="sticky top-[37px] z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="demo-container h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {content.logoLocalPath ? (
              <img
                src={content.logoLocalPath}
                alt={`${meta.companyName} Logo`}
                width={160}
                height={48}
                className="h-9 md:h-10 w-auto object-contain"
              />
            ) : (
              <span className="font-bold text-lg md:text-xl tracking-tight text-zinc-950">
                {meta.companyName}
              </span>
            )}

            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-600">
              <a href="#casi-studio" className="hover:text-zinc-950 transition-colors">
                Casi Studio
              </a>
              <a href="#metodologia" className="hover:text-zinc-950 transition-colors">
                Metodologia
              </a>
              <a href="#numeri-roi" className="hover:text-zinc-950 transition-colors">
                Risultati e ROI
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${meta.phone.replace(/\s+/g, "")}`}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold text-zinc-800 border border-zinc-300 hover:border-zinc-900 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{meta.phone}</span>
            </a>
            <a
              href="#tavolo-tecnico"
              className="demo-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-zinc-900 text-white font-semibold text-xs sm:text-sm"
            >
              <span>Richiedi Studio di Fattibilità</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Architettonica B2B (Senza Quiz! Focus su ROI, Numeri e Casi Studio) */}
      <section className="demo-section bg-white border-b border-zinc-200">
        <div className="demo-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end mb-12">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-zinc-100 text-xs font-semibold text-zinc-800">
                <Building2 className="w-3.5 h-3.5 text-zinc-600" />
                <span>{content.badgeTop}</span>
              </div>

              <h1 className="demo-h1-b2b font-bold text-zinc-950">
                {content.heroHeadline}
              </h1>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <p className="text-base text-zinc-600 leading-relaxed">
                {content.heroSubheadline}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#casi-studio"
                  style={{ backgroundColor: "var(--accent)" }}
                  className="demo-btn inline-flex items-center gap-2 px-5 py-3 rounded-md text-white font-semibold text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Esplora i Casi Studio</span>
                </a>
                <a
                  href="#tavolo-tecnico"
                  className="demo-btn inline-flex items-center gap-2 px-5 py-3 rounded-md bg-white text-zinc-900 border border-zinc-300 hover:border-zinc-900 font-semibold text-sm"
                >
                  <span>Parla con l&apos;Ufficio Tecnico</span>
                </a>
              </div>
            </div>
          </div>

          {/* Griglia Immagine Principale + 3 Indicatori di Impatto Economico */}
          <div id="numeri-roi" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <figure className="lg:col-span-8 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 flex flex-col justify-between">
              <img
                src={content.heroImageLocalPath}
                alt={`${meta.companyName} - Soluzione Industriale`}
                fetchPriority="high"
                width={900}
                height={520}
                className="w-full h-full min-h-[280px] max-h-[440px] object-cover"
              />
              <figcaption className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-600">
                <span className="font-medium text-zinc-900">
                  {content.heroImageCaption || `Progettazione e realizzazione interna - ${meta.companyName} (${meta.city})`}
                </span>
                <span>{content.socialProof.reviewsSummary}</span>
              </figcaption>
            </figure>

            {/* Colonna KPI per il Decision Maker */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-4">
              {kpiStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-lg bg-zinc-50 border border-zinc-200 flex-1 flex flex-col justify-center"
                >
                  <div className="font-mono text-3xl sm:text-4xl font-bold text-zinc-950 tracking-tight">
                    {stat.value}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 mt-2 leading-relaxed">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fascia Monocromatica Certificazioni & Standard */}
      <section className="py-6 bg-zinc-50 border-b border-zinc-200">
        <div className="demo-container flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Standard Tecnici e Conformità:
          </span>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            {referenceWall.map((item, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold text-zinc-600"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sezione Protagonista: Casi Studio Documentati (Per convincere razionalmente il cliente B2B) */}
      <section id="casi-studio" className="demo-section bg-white border-b border-zinc-200">
        <div className="demo-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-[62ch]">
              <span
                style={{ color: "var(--accent)" }}
                className="text-xs font-bold uppercase tracking-wider block mb-2"
              >
                Referenze e Casi Studio Reali
              </span>
              <h2 className="demo-h2 font-bold text-zinc-950">
                Risultati misurati presso le aziende che hanno scelto {meta.companyName}
              </h2>
            </div>
            <a
              href="#tavolo-tecnico"
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 hover:underline shrink-0"
            >
              <span>Richiedi referenze del tuo settore</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="space-y-6">
            {content.socialProof.testimonials.map((t, idx) => {
              const matchedProp = content.valueProps[idx] || content.valueProps[0];
              return (
                <article
                  key={idx}
                  className="p-7 sm:p-9 rounded-lg bg-zinc-50 border border-zinc-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                >
                  <div className="lg:col-span-4 space-y-2 lg:border-r lg:border-zinc-200 lg:pr-8">
                    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded bg-white border border-zinc-200 text-zinc-700">
                      Caso Studio 0{idx + 1} · {t.location}
                    </span>
                    <h3 className="text-lg font-bold text-zinc-950 pt-1">
                      {t.name}
                    </h3>
                    {matchedProp && (
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        Ambito: <strong className="text-zinc-700">{matchedProp.title}</strong>
                      </p>
                    )}
                  </div>

                  <div className="lg:col-span-8 space-y-4">
                    <p className="text-base sm:text-[17px] text-zinc-800 leading-relaxed font-medium">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-zinc-600">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        Commessa collaudata nei tempi contrattuali
                      </span>
                      <span className="inline-flex items-center gap-1 text-zinc-500">
                        <MapPin className="w-3.5 h-3.5" /> {t.location}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bento Grid Asimmetrica: Metodologia di Lavoro & Riduzione del Rischio */}
      <section id="metodologia" className="demo-section bg-zinc-50 border-b border-zinc-200">
        <div className="demo-container">
          <div className="max-w-[62ch] mb-12">
            <span
              style={{ color: "var(--accent)" }}
              className="text-xs font-bold uppercase tracking-wider block mb-2"
            >
              Metodo Operativo e Garanzie
            </span>
            <h2 className="demo-h2 font-bold text-zinc-950 mb-3">
              Ingegneria progettata per garantire continuità produttiva e ritorno sull&apos;investimento
            </h2>
            <p className="demo-body text-zinc-600">
              Affianchiamo la direzione tecnica e amministrativa in ogni fase della commessa, dallo studio di fattibilità preliminare al collaudo in stabilimento.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {content.valueProps[0] && (
              <div className="lg:col-span-7 p-8 rounded-lg bg-white border border-zinc-200 demo-shadow flex flex-col justify-between">
                <div>
                  <span className="inline-block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    Fase 1 · Analisi e Progettazione
                  </span>
                  <h3 className="demo-h3 font-bold text-zinc-950 mb-3">
                    {content.valueProps[0].title}
                  </h3>
                  <p className="demo-body text-zinc-600">
                    {content.valueProps[0].description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                  <span className="font-semibold text-zinc-900">
                    Capitolato tecnico e tempi di consegna vincolanti
                  </span>
                  {content.valueProps[0].metric && (
                    <span className="font-mono font-semibold text-zinc-800">
                      {content.valueProps[0].metric}
                    </span>
                  )}
                </div>
              </div>
            )}

            {content.valueProps[1] && (
              <div className="lg:col-span-5 p-8 rounded-lg bg-white border border-zinc-200 demo-shadow flex flex-col justify-between">
                <div>
                  <span className="inline-block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                    Fase 2 · Integrazione e Conformità
                  </span>
                  <h3 className="demo-h3 font-bold text-zinc-950 mb-3">
                    {content.valueProps[1].title}
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
                    {content.valueProps[1].description}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center gap-2 text-xs font-semibold text-zinc-900">
                  <Shield className="w-4 h-4 text-zinc-700" />
                  <span>Documentazione tecnica e perizia incluse</span>
                </div>
              </div>
            )}

            {content.valueProps[2] && (
              <div className="lg:col-span-12 p-8 rounded-lg bg-white border border-zinc-200 demo-shadow grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-2">
                  <span className="inline-block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Fase 3 · Avviamento e Assistenza Post-Vendita
                  </span>
                  <h3 className="demo-h3 font-bold text-zinc-950">
                    {content.valueProps[2].title}
                  </h3>
                  <p className="demo-body text-zinc-600">
                    {content.valueProps[2].description}
                  </p>
                </div>
                <div className="lg:col-span-4 lg:text-right">
                  <a
                    href="#tavolo-tecnico"
                    style={{ backgroundColor: "var(--accent)" }}
                    className="demo-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md text-white font-semibold text-sm"
                  >
                    <span>Richiedi un incontro tecnico</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sezione Finale in Dark Mode Sobrio: Richiesta Tavolo Tecnico / Consulenza B2B */}
      <section id="tavolo-tecnico" className="demo-section bg-[#141619] text-zinc-200">
        <div className="demo-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 block">
                Contatto Diretto Ufficio Ingegneria
              </span>
              <h2 className="demo-h2 font-bold text-white">
                Richiedi uno studio di fattibilità o prenota un tavolo tecnico con i nostri ingegneri
              </h2>
              <p className="demo-body text-zinc-300">
                Analizziamo le specifiche della vostra linea o del vostro progetto nel pieno rispetto della riservatezza industriale (NDA), fornendo una stima preliminare di tempi, costi e ritorno sull&apos;investimento.
              </p>

              <div className="pt-4 space-y-3 border-t border-zinc-800 text-sm text-zinc-300">
                <div>
                  <strong className="text-white">Sede Operativa:</strong> {meta.companyName} -{" "}
                  {meta.city}
                </div>
                <div>
                  <strong className="text-white">Linea Diretta Ufficio Tecnico:</strong>{" "}
                  {meta.phone}
                </div>
                {meta.vatNumber && meta.vatNumber !== "Non trovata" && (
                  <div>
                    <strong className="text-white">Partita IVA:</strong> {meta.vatNumber}
                  </div>
                )}
              </div>
            </div>

            {/* Modulo Contatto Direzionale B2B */}
            <div className="lg:col-span-6">
              <div className="bg-white text-zinc-900 rounded-lg p-7 sm:p-8 border border-zinc-200">
                <h3 className="text-xl font-bold text-zinc-950 mb-1">
                  Richiedi colloquio tecnico preliminare
                </h3>
                <p className="text-xs text-zinc-500 mb-6">
                  Compila i riferimenti aziendali per essere ricontattato da un responsabile tecnico entro 24 ore lavorative.
                </p>

                {!b2bSubmitted ? (
                  <form onSubmit={handleB2BSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                        Ambito principale di interesse
                      </label>
                      <select
                        value={selectedScope}
                        onChange={(e) => setSelectedScope(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-md bg-zinc-50 border border-zinc-300 text-zinc-900 focus:border-zinc-900 outline-none"
                      >
                        {content.quiz.question1.options.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="b2b-name"
                          className="block text-xs font-semibold text-zinc-800 mb-1"
                        >
                          Nome e Cognome
                        </label>
                        <input
                          id="b2b-name"
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Es. Ing. Paolo Ferretti"
                          className="w-full px-3.5 py-2.5 text-sm rounded-md bg-white border border-zinc-300 text-zinc-900 focus:border-zinc-900 outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="b2b-role"
                          className="block text-xs font-semibold text-zinc-800 mb-1"
                        >
                          Azienda e Ruolo
                        </label>
                        <input
                          id="b2b-role"
                          type="text"
                          required
                          value={companyRole}
                          onChange={(e) => setCompanyRole(e.target.value)}
                          placeholder="Es. Resp. Produzione - Alfa S.r.l."
                          className="w-full px-3.5 py-2.5 text-sm rounded-md bg-white border border-zinc-300 text-zinc-900 focus:border-zinc-900 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="b2b-contact"
                        className="block text-xs font-semibold text-zinc-800 mb-1"
                      >
                        Email Aziendale o Telefono Diretto
                      </label>
                      <input
                        id="b2b-contact"
                        type="text"
                        required
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="Es. p.ferretti@azienda.it oppure 348 123 4567"
                        className="w-full px-3.5 py-2.5 text-sm rounded-md bg-white border border-zinc-300 text-zinc-900 focus:border-zinc-900 outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      style={{ backgroundColor: "var(--accent)" }}
                      className="demo-btn w-full py-3.5 px-6 rounded-md text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{content.ctaButtonText}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleSimulateB2B}
                        className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-4 cursor-pointer"
                      >
                        Stai provando la demo? Simula l&apos;invio di una richiesta B2B →
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200">
                      <p className="text-sm font-semibold text-emerald-950">
                        Simulazione richiesta B2B completata
                      </p>
                      <p className="text-xs text-emerald-900 mt-1">
                        Ecco la scheda contatto che l&apos;ufficio commerciale/tecnico riceve in tempo reale:
                      </p>
                    </div>

                    <div className="p-4 rounded-md bg-zinc-50 border border-zinc-200 text-xs space-y-2 text-zinc-700">
                      <div>
                        <span className="text-zinc-500">Referente:</span>{" "}
                        <strong className="text-zinc-950">
                          {contactName || "Ing. Paolo Ferretti"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">Azienda / Ruolo:</span>{" "}
                        <strong className="text-zinc-950">
                          {companyRole || "Direttore di Stabilimento - Officine Meccaniche S.p.A."}
                        </strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">Recapito:</span>{" "}
                        <strong className="text-zinc-950">
                          {contactInfo || "p.ferretti@officinemeccaniche.it · 348 712 9034"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">Ambito richiesto:</span>{" "}
                        <strong className="text-zinc-950">{selectedScope}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setB2bSubmitted(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-950 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Torna al modulo di richiesta
                    </button>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>{content.trustMicrocopy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F1113] text-zinc-500 py-8 border-t border-zinc-800/80 text-xs">
        <div className="demo-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-zinc-300">{meta.companyName}</strong> · {meta.city}
            {meta.vatNumber && meta.vatNumber !== "Non trovata"
              ? ` · P.IVA ${meta.vatNumber}`
              : ""}
          </div>
          <div>Contatto Ufficio Tecnico: {meta.phone}</div>
        </div>
      </footer>
    </div>
  );
}
