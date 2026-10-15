"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import Signature from "@/components/ui/Signature";
import { ArrowRightIcon, ChevronDownIcon } from "@/components/ui/Icons";

/**
 * =====================================================================
 * LETTERA APERTA & PROFILO DELLO STUDIO (RICCARDO GRANZA)
 * - Design editoriale omogeneo al resto del sito (#F8F7F4 + accenti #0B1E36 e #B8860B)
 * - Scheda profilo esecutiva in Deep Navy calibrata e non invasiva
 * - Manifesto editoriale su carta calda con firma e progressive disclosure
 * - Tabella comparativa chiara: agenzie tradizionali vs modello TechPYRE
 * =====================================================================
 */
export default function FounderLetter() {
  const { founder, brand } = siteContent;
  const [showFullManifesto, setShowFullManifesto] = useState(false);

  // Mostra sempre i primi 2 paragrafi cruciali; gli altri sono espandibili
  const visibleParagraphs = founder.manifesto.slice(0, 2);
  const remainingParagraphs = founder.manifesto.slice(2);

  return (
    <section id="storia" className="py-12 sm:py-16 md:py-20 bg-[#F8F7F4] relative border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Intestazione Editoriale di Sezione */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl space-y-2 pb-8 sm:pb-12"
        >
          <div className="text-[10px] sm:text-[11px] font-sans font-bold uppercase tracking-widest text-[#B8860B]">
            {founder.eyebrow}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#14181F] font-normal tracking-tight leading-[1.12]">
            {founder.title}
          </h1>
          <p className="text-sm sm:text-base text-[#5A6270] leading-relaxed font-sans pt-1">
            {founder.subtitle}
          </p>
        </motion.div>

        {/* Griglia Principale: Profilo Esecutivo (Navy) + Lettera Editoriale (Bianca) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ================================================================= */}
          {/* COLONNA SINISTRA: SCHEDA ESECUTIVA NAVY (AUTOREVOLE MA NON INVASIVA) */}
          {/* ================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 space-y-4"
          >
            <div className="p-5 sm:p-7 rounded-sm bg-[#0B1E36] text-[#F8F7F4] border border-[#0B1E36] shadow-sm relative overflow-hidden space-y-4">
              {/* Accento Superiore Oro Antico */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#B8860B]" />

              <div className="space-y-1">
                <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#B8860B]">
                  PROFILO ESECUTIVO FONDATORE
                </span>
                <div className="flex items-center gap-2.5 pt-0.5">
                  <h2 className="font-serif text-2xl sm:text-3xl text-white font-semibold">
                    {founder.name}
                  </h2>
                </div>
                <p className="text-xs font-sans text-[#CBD7E3] font-medium">
                  {founder.role}
                </p>
                <p className="text-xs font-sans text-[#B8860B] pt-0.5 font-semibold leading-snug">
                  {founder.leadershipBadge || founder.engineeringBadge}
                </p>
              </div>

              {/* Garanzie e Reperibilità Istituzionale */}
              <div className="pt-3 border-t border-white/10 space-y-2 text-xs font-sans">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">INTERLOCUTORE:</span>
                  <span className="text-white font-semibold text-right">Riccardo Granza (Unico riferimento)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">REPERIBILITÀ:</span>
                  <span className="text-[#B8860B] font-semibold text-right">Riscontro entro la giornata</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">STANDARD:</span>
                  <span className="text-white font-semibold text-right">Next.js / TypeScript nativo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">PROPRIETÀ:</span>
                  <span className="text-white font-semibold text-right">100% dell&apos;Azienda (Zero noleggi)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/60">CONTINUITÀ:</span>
                  <span className="text-white font-semibold text-right">CI/CD e documentazione su repo</span>
                </div>
              </div>

              {/* Citazione del Fondatore */}
              <div className="p-3.5 rounded-sm bg-white/5 border-l-2 border-[#B8860B] text-xs sm:text-sm text-[#F8F7F4] font-serif italic leading-relaxed">
                {founder.quote}
              </div>

              {/* CTA Contatto Diretto */}
              <div className="pt-2">
                <Link
                  href="/#contatto"
                  className="w-full py-2.5 px-4 rounded-sm bg-[#B8860B] hover:bg-[#9A7009] active:scale-[0.99] text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-2xs inline-flex items-center justify-center gap-2 group"
                >
                  <span>Invia messaggio diretto a Riccardo</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ================================================================= */}
          {/* COLONNA DESTRA: MANIFESTO EDITORIALE SU FONDO CALDO */}
          {/* ================================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 bg-white rounded-sm border border-[#E8E2D5] p-6 sm:p-8 md:p-10 shadow-xs relative space-y-5"
          >
            {/* Accento Superiore Navy */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#0B1E36]" />

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B8860B]">
                MANIFESTO DELLO STUDIO
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#14181F] font-normal tracking-tight">
                La Responsabilità Diretta sul Codice
              </h2>
            </div>

            {/* Paragrafi della Lettera */}
            <div className="space-y-3.5 text-[#5A6270] font-sans text-xs sm:text-sm md:text-base leading-relaxed">
              {visibleParagraphs.map((para, i) => (
                <p
                  key={i}
                  className={i === 0 ? "text-[#14181F] font-medium leading-relaxed" : ""}
                >
                  {para}
                </p>
              ))}

              {/* Paragrafi Espandibili con Animazione Fluida */}
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
                    className="text-xs font-sans font-bold text-[#B8860B] hover:text-[#0B1E36] transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap group"
                  >
                    <span>
                      {showFullManifesto
                        ? "Comprimi lettura"
                        : "Leggi il manifesto integrale"}
                    </span>
                    <ChevronDownIcon
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        showFullManifesto ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Firma Autografa Vettoriale (Stile Inchiostro su Carta) */}
            <div className="pt-4 border-t border-[#E8E2D5]">
              <Signature name={founder.name} role={`Fondatore · ${brand.name}`} />
            </div>
          </motion.div>
        </div>

        {/* =================================================================== */}
        {/* TABELLA DI CONFRONTO DI MERCATO (OMOGENEA E CHIARA) */}
        {/* =================================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 sm:mt-16 pt-8 border-t border-[#E8E2D5]"
        >
          <div className="max-w-2xl space-y-1 mb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B8860B]">
              IL CONFRONTO DI MERCATO
            </span>
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-[#14181F] font-normal">
              Perché le aziende scelgono la nostra partnership
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            {/* Agenzie Tradizionali */}
            <div className="p-5 sm:p-6 rounded-sm bg-white border border-[#E8E2D5] space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2.5">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase font-bold text-[#5A6270]">
                  L&apos;APPROCCIO TRADIZIONALE
                </span>
                <span className="text-rose-600 text-xs font-mono font-bold">✕ Web Agency standard</span>
              </div>
              <ul className="space-y-2 text-xs font-sans text-[#5A6270]">
                {founder.comparison.legacyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-600 font-bold text-xs mt-0.5 shrink-0">✕</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modello TechPYRE */}
            <div className="p-5 sm:p-6 rounded-sm bg-white border-2 border-[#B8860B] space-y-3 shadow-xs relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#B8860B]" />
              <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-2.5">
                <span className="text-[10px] sm:text-[11px] font-mono uppercase font-bold text-[#B8860B]">
                  IL MODELLO TECHPYRE
                </span>
                <span className="text-emerald-700 text-xs font-mono font-bold">✓ Studio Tecnico</span>
              </div>
              <ul className="space-y-2 text-xs font-sans text-[#14181F]">
                {founder.comparison.techPyrePoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold text-xs mt-0.5 shrink-0">✓</span>
                    <span className="font-semibold leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
