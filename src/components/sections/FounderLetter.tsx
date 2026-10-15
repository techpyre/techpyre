"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import Signature from "@/components/ui/Signature";
import { ArrowRightIcon, ArrowDownIcon } from "@/components/ui/Icons";

/**
 * =====================================================================
 * LETTERA APERTA & MANIFESTO DEL FONDATORE (RICCARDO GRANZA)
 * - Dossier esecutivo Deep Navy con dettagli in bronzo e oro antico
 * - Animazioni d'ingresso e progressive disclosure dei testi lunghi
 * - Solo le informazioni ad alto impatto sempre visibili, approfondimento opzionale
 * - Tabella di confronto qualitativo: agenzie tradizionali vs modello TechPYRE
 * =====================================================================
 */
export default function FounderLetter() {
  const { founder, brand } = siteContent;
  const [showFullManifesto, setShowFullManifesto] = useState(false);

  // Mostra sempre i primi 2 paragrafi cruciali; gli altri sono espandibili
  const visibleParagraphs = founder.manifesto.slice(0, 2);
  const remainingParagraphs = founder.manifesto.slice(2);

  return (
    <section id="storia" className="py-12 sm:py-16 md:py-24 bg-[#F8F7F4] relative border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Contenitore Istituzionale Esecutivo Deep Navy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-sm bg-[#0A192F] text-[#F8F7F4] p-5 sm:p-9 md:p-12 border border-[#C5A059]/40 shadow-md relative overflow-hidden"
        >
          {/* Filetto oro superiore */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#C5A059]" />

          {/* Intestazione del Dossier */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10 mb-6 sm:mb-8">
            <span className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-widest text-[#C5A059]">
              {founder.eyebrow}
            </span>

            <div className="text-xs font-sans text-[#A4B3C6]">
              LETTERA APERTA · RESPONSABILITÀ DIRETTA SUL CODICE
            </div>
          </div>

          {/* Griglia Principale: Profilo & Lettera */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-12 items-start">
            {/* Colonna Sinistra: Identità Notarile e Garanzie */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 sm:p-6 rounded-sm bg-white/5 border border-white/10 space-y-3.5">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C5A059]">
                    PROFILO ESECUTIVO FONDATORE
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-semibold">
                    {founder.name}
                  </h3>
                  <p className="text-xs font-sans text-[#CBD7E3] font-medium">
                    {founder.role}
                  </p>
                  <p className="text-xs font-sans text-[#C5A059] pt-1 leading-snug">
                    {founder.engineeringBadge}
                  </p>
                </div>

                {/* Garanzie Essenziali */}
                <div className="pt-2.5 border-t border-white/10 space-y-1.5 text-xs font-sans text-[#A4B3C6]">
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
                    <span className="text-white/60">CONTINUITÀ:</span>
                    <span className="text-white font-semibold">CI/CD e documentazione esecutiva</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">PROPRIETÀ CODICE:</span>
                    <span className="text-white font-semibold">100% dell&apos;Azienda Cliente</span>
                  </div>
                </div>

                {/* Citazione del Fondatore */}
                <div className="p-3 rounded-sm bg-white/5 border-l-2 border-[#C5A059] text-xs sm:text-sm text-white font-serif italic leading-relaxed">
                  {founder.quote}
                </div>
              </div>

              {/* Box Contatto Rapido */}
              <div className="p-3.5 rounded-sm bg-[#C5A059]/10 border border-[#C5A059]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-sans">
                <span className="text-white font-medium">Vuoi parlare direttamente con Riccardo?</span>
                <a
                  href="#contatto"
                  className="text-[#C5A059] hover:text-white font-bold transition-colors whitespace-nowrap inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto group"
                >
                  <span>Invia messaggio</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>

            {/* Colonna Destra: Manifesto del Fondatore */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-normal tracking-tight leading-[1.14]">
                  {founder.title}
                </h2>
                <p className="text-xs font-sans font-bold uppercase tracking-wider text-[#C5A059]">
                  {founder.subtitle}
                </p>
              </div>

              {/* Paragrafi della Lettera: Core sempre visibile */}
              <div className="space-y-3.5 text-[#CBD7E3] font-sans text-xs sm:text-sm md:text-base leading-relaxed">
                {visibleParagraphs.map((para, i) => (
                  <p
                    key={i}
                    className={i === 0 ? "text-white font-medium leading-relaxed" : ""}
                  >
                    {para}
                  </p>
                ))}

                {/* Paragrafi Espandibili con Animazione */}
                <AnimatePresence>
                  {showFullManifesto && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden space-y-3.5 pt-1"
                    >
                      {remainingParagraphs.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pulsante Toggle Manifesto */}
                {remainingParagraphs.length > 0 && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowFullManifesto(!showFullManifesto)}
                      className="text-xs font-sans font-bold text-[#C5A059] hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap group"
                    >
                      <span>
                        {showFullManifesto
                          ? "Comprimi lettura"
                          : "Leggi il manifesto integrale"}
                      </span>
                      <ArrowDownIcon
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          showFullManifesto ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* Firma Autografa Vettoriale */}
              <Signature name={founder.name} role={`Fondatore · ${brand.name}`} />
            </div>
          </div>

          {/* Tabella di Confronto di Mercato */}
          <div className="mt-8 sm:mt-10 pt-6 border-t border-white/10">
            <div className="mb-4 space-y-0.5">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#C5A059]">
                IL CONFRONTO DI MERCATO
              </span>
              <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-white font-normal">
                Perché le aziende scelgono la nostra partnership
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {/* Agenzie Tradizionali */}
              <div className="p-4 rounded-sm bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] sm:text-[11px] font-sans uppercase font-bold text-white/60">
                    L&apos;APPROCCIO TRADIZIONALE
                  </span>
                  <span className="text-rose-400/80 text-xs font-mono">✕ Agenzie</span>
                </div>
                <ul className="space-y-1.5 text-xs font-sans text-white/70">
                  {founder.comparison.legacyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-400 font-mono text-xs mt-0.5">✕</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modello TechPYRE */}
              <div className="p-4 rounded-sm bg-[#C5A059]/10 border border-[#C5A059]/40 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#C5A059]/30 pb-2">
                  <span className="text-[10px] sm:text-[11px] font-sans uppercase font-bold text-[#C5A059]">
                    IL MODELLO TECHPYRE
                  </span>
                  <span className="text-emerald-400 text-xs font-mono">✓ Partnership</span>
                </div>
                <ul className="space-y-1.5 text-xs font-sans text-white">
                  {founder.comparison.techPyrePoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-mono text-xs mt-0.5">✓</span>
                      <span className="font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
