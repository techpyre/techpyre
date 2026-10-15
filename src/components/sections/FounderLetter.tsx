"use client";

import React from "react";
import { siteContent } from "@/config/siteContent";
import Signature from "@/components/ui/Signature";

/**
 * =====================================================================
 * LETTERA APERTA & MANIFESTO DEL FONDATORE (RICCARDO GRANZA)
 * - Dossier esecutivo in Deep Navy con dettagli in bronzo e oro antico
 * - Firma autografa vettoriale con attestazione di responsabilità diretta
 * - Tabella di confronto qualitativo: agenzie tradizionali vs modello TechPYRE
 * =====================================================================
 */
export default function FounderLetter() {
  const { founder, brand } = siteContent;

  return (
    <section id="storia" className="py-14 sm:py-16 md:py-24 bg-[#F8F7F4] relative border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Contenitore Istituzionale Esecutivo Deep Navy con Linee Architetturali */}
        <div className="rounded-sm bg-[#0A192F] text-[#F8F7F4] p-6 sm:p-10 md:p-14 border border-[#C5A059]/40 shadow-md relative overflow-hidden">
          {/* Sottile filetto oro superiore */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C5A059]" />

          {/* Intestazione del Dossier del Fondatore */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-white/10 mb-6 sm:mb-8">
            <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-widest text-[#C5A059]">
              {founder.eyebrow}
            </span>

            <div className="text-xs font-sans text-[#A4B3C6]">
              LETTERA APERTA · RESPONSABILITÀ DIRETTA SUL CODICE
            </div>
          </div>

          {/* Griglia Principale: Profilo & Lettera */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Colonna Sinistra: Identità Notarile e Garanzie */}
            <div className="lg:col-span-5 space-y-5 sm:space-y-6">
              <div className="p-5 sm:p-7 rounded-sm bg-white/5 border border-white/10 space-y-4 sm:space-y-5">
                <div className="space-y-1">
                  <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C5A059]">
                    PROFILO ESECUTIVO FONDATORE
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-semibold">
                    {founder.name}
                  </h3>
                  <p className="text-xs font-sans text-[#CBD7E3] pt-0.5 font-medium">
                    {founder.role}
                  </p>
                  <p className="text-xs font-sans text-[#C5A059] pt-1">
                    {founder.ageBadge}
                  </p>
                </div>

                {/* Garanzie e Impegni */}
                <div className="pt-3 border-t border-white/10 space-y-2 text-xs font-sans text-[#A4B3C6]">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">CONTATTO DIRETTO:</span>
                    <span className="text-white font-semibold">Telefono e WhatsApp personale</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">ETICA COMMERCIALE:</span>
                    <span className="text-white font-semibold">Prezzo pattuito prima, zero extra</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">STANDARD TECNICO:</span>
                    <span className="text-white font-semibold">Next.js / TypeScript nativo</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">PROPRIETÀ CODICE:</span>
                    <span className="text-white font-semibold">100% dell&apos;Azienda Cliente</span>
                  </div>
                </div>

                {/* Citazione del Fondatore */}
                <div className="p-3.5 sm:p-4 rounded-sm bg-white/5 border-l-2 border-[#C5A059] text-xs sm:text-sm text-white font-serif italic leading-relaxed">
                  {founder.quote}
                </div>
              </div>

              {/* Box Contatto Rapido */}
              <div className="p-3.5 sm:p-4 rounded-sm bg-[#C5A059]/10 border border-[#C5A059]/30 flex items-center justify-between text-xs font-sans">
                <span className="text-white">Vuoi parlare direttamente con Riccardo?</span>
                <a
                  href="#contatto"
                  className="text-[#C5A059] hover:text-white font-bold transition-colors underline underline-offset-4"
                >
                  Invia messaggio →
                </a>
              </div>
            </div>

            {/* Colonna Destra: Manifesto del Fondatore */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              <div className="space-y-1.5">
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-normal tracking-tight leading-[1.14]">
                  {founder.title}
                </h2>
                <p className="text-xs font-sans font-bold uppercase tracking-wider text-[#C5A059]">
                  {founder.subtitle}
                </p>
              </div>

              {/* Paragrafi della Lettera */}
              <div className="space-y-3 sm:space-y-3.5 text-[#CBD7E3] font-sans text-xs sm:text-sm md:text-base leading-relaxed">
                {founder.manifesto.map((para, i) => (
                  <p
                    key={i}
                    className={i === 0 ? "text-white font-medium leading-relaxed" : ""}
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* Firma Autografa Vettoriale */}
              <Signature name={founder.name} role={`Fondatore · ${brand.name}`} />
            </div>
          </div>

          {/* Tabella di Confronto di Mercato (Stacca su mobile, affiancata su tablet e desktop) */}
          <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
            <div className="mb-5 sm:mb-6 space-y-1">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C5A059]">
                IL CONFRONTO DI MERCATO
              </span>
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-white font-normal">
                Perché i clienti aziendali scelgono la nostra partnership
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Agenzie Tradizionali */}
              <div className="p-4 sm:p-6 rounded-sm bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-[10px] sm:text-[11px] font-sans uppercase font-bold text-white/60">
                    L&apos;APPROCCIO TRADIZIONALE
                  </span>
                  <span className="text-rose-300 text-xs font-bold font-sans">✕ Strutture pesanti</span>
                </div>
                <h4 className="font-serif text-sm sm:text-base text-white">
                  {founder.comparison.legacyTitle}
                </h4>
                <ul className="space-y-2 font-sans text-xs sm:text-sm text-[#A4B3C6]">
                  {founder.comparison.legacyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold shrink-0">✕</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* TechPYRE */}
              <div className="p-4 sm:p-6 rounded-sm bg-white/10 border border-[#C5A059] relative space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="text-[10px] sm:text-[11px] font-sans uppercase font-bold text-[#C5A059]">
                    STANDARD {brand.name.toUpperCase()}
                  </span>
                  <span className="text-[#C5A059] text-xs font-bold font-sans">✓ Garantito sul territorio</span>
                </div>
                <h4 className="font-serif text-sm sm:text-base text-white">
                  {founder.comparison.techPyreTitle}
                </h4>
                <ul className="space-y-2 font-sans text-xs sm:text-sm text-white">
                  {founder.comparison.techPyrePoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#C5A059] font-bold shrink-0">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
