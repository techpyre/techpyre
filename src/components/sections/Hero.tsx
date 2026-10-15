"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import Button from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";

/**
 * =====================================================================
 * SEZIONE HERO (INGRESSO & POSIZIONAMENTO ISTITUZIONALE)
 * - Posizionamento asciutto: solo le informazioni decisive
 * - Scheda "Costruito intorno a te" compatta con i 4 KPI contrattuali
 * - 3 riquadri sintetici in una riga per le pagine dedicate
 * =====================================================================
 */
export default function Hero() {
  const { hero, brand } = siteContent;

  return (
    <section className="relative pt-24 pb-10 sm:pt-28 sm:pb-14 lg:pt-32 lg:pb-16 overflow-hidden bg-[#F8F7F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 relative z-10">
        {/* Barra Istituzionale Top */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] sm:text-[11px] font-sans font-medium tracking-wider uppercase text-[#5A6270]/80"
        >
          <div className="text-[#0B1E36]/80">{hero.badge}</div>
          <div>{brand.location}</div>
        </motion.div>

        {/* Griglia Principale: Headline & Scheda Patto di Fiducia */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-6 sm:pt-10">
          {/* Colonna Testo Principale */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 space-y-4"
          >
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.85rem] text-[#14181F] font-normal tracking-tight leading-[1.12]">
              <span>{hero.headline.line1}</span>
              <span className="relative inline-block text-[#B8860B] italic font-serif">
                {hero.headline.highlight}
                <svg
                  className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#C5A059]/40"
                  viewBox="0 0 200 9"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 6.5C50 2.5 150 2 197.5 6.5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#5A6270] leading-relaxed max-w-2xl font-sans">
              {hero.subheadline}
            </p>

            {/* Pulsanti di Azione */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="space-y-1">
                <Button href={hero.primaryCta.href} variant="primary" className="w-full sm:w-auto">
                  <span className="sm:hidden">Richiedi primo colloquio (30 min)</span>
                  <span className="hidden sm:inline">{hero.primaryCta.label}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 shrink-0" />
                </Button>
                <div className="hidden sm:block text-[10px] sm:text-[11px] text-[#5A6270] pl-1 font-sans">
                  {hero.primaryCta.note}
                </div>
              </div>

              <div className="sm:self-start sm:pt-0">
                <Button href={hero.secondaryCta.href} variant="secondary" className="w-full sm:w-auto">
                  <span>{hero.secondaryCta.label}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 shrink-0 text-[#5A6270] group-hover:text-[#B8860B] transition-colors" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Scheda Istituzionale "Costruito intorno a te" (Compatta e non espansa) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4"
          >
            <div className="p-5 sm:p-6 rounded-sm bg-white border border-[#E8E2D5] shadow-xs space-y-3.5 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#B8860B]" />

              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B] font-sans">
                  IL PATTO DI FIDUCIA
                </div>
                <h3 className="font-serif text-lg sm:text-xl text-[#0B1E36] font-semibold">
                  Costruito intorno a te
                </h3>
              </div>

              <div className="space-y-2 text-xs font-sans text-[#5A6270] pt-1">
                <div className="flex items-center gap-2 text-[#14181F]">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>
                    Interlocutore diretto: <strong className="text-[#0B1E36] font-semibold">{brand.founder}</strong>{" "}
                    (<span className="text-[#B8860B] font-semibold">riscontro in giornata</span>)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#14181F]">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>
                    Caricamento istantaneo: <strong className="text-[#0B1E36] font-semibold">sub-secondo</strong>{" "}
                    (<span className="text-[#B8860B] font-semibold">zero clienti persi da ads</span>)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#14181F]">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>
                    Tempi certi: <strong className="text-[#0B1E36] font-semibold">5–7 gg per landing</strong> ·{" "}
                    <span className="text-[#B8860B] font-semibold">sprint a prezzo fisso</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#14181F]">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>
                    Proprietà integrale: <strong className="text-[#0B1E36] font-semibold">100% dell&apos;azienda</strong>{" "}
                    (<span className="text-[#B8860B] font-semibold">zero canoni di noleggio</span>)
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E2D5]">
                <Link
                  href="/studio"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-sm bg-[#F8F7F4] hover:bg-[#E8E2D5]/70 text-[#0B1E36] text-xs font-semibold tracking-wide transition-colors border border-[#E8E2D5] whitespace-nowrap group"
                >
                  <span>Leggi il profilo dello studio</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 3 piccoli riquadri in una riga per invitare alle altre pagine (solo desktop/tablet, su mobile ci sono i bottoni volanti) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="hidden sm:grid sm:grid-cols-3 gap-3.5 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#E8E2D5]"
        >
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Link
              href="/servizi"
              className="p-3.5 rounded-sm bg-white border border-[#E8E2D5] hover:border-[#B8860B] transition-all flex items-center justify-between group shadow-2xs hover:shadow-xs h-full"
            >
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B8860B]">
                  [01] LISTINO & SIMULATORE
                </span>
                <div className="font-serif text-sm font-semibold text-[#0B1E36] group-hover:text-[#B8860B] transition-colors">
                  Servizi & Tariffe
                </div>
              </div>
              <ArrowRightIcon className="w-3.5 h-3.5 text-[#5A6270] group-hover:text-[#B8860B] group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Link
              href="/progetti"
              className="p-3.5 rounded-sm bg-white border border-[#E8E2D5] hover:border-[#B8860B] transition-all flex items-center justify-between group shadow-2xs hover:shadow-xs h-full"
            >
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B8860B]">
                  [02] CASI STUDIO LIVE
                </span>
                <div className="font-serif text-sm font-semibold text-[#0B1E36] group-hover:text-[#B8860B] transition-colors">
                  Progetti & Codice GitHub
                </div>
              </div>
              <ArrowRightIcon className="w-3.5 h-3.5 text-[#5A6270] group-hover:text-[#B8860B] group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Link
              href="/studio"
              className="p-3.5 rounded-sm bg-white border border-[#E8E2D5] hover:border-[#B8860B] transition-all flex items-center justify-between group shadow-2xs hover:shadow-xs h-full"
            >
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#B8860B]">
                  [03] METODO & AUTONOMIA
                </span>
                <div className="font-serif text-sm font-semibold text-[#0B1E36] group-hover:text-[#B8860B] transition-colors">
                  Lo Studio & Fondatore
                </div>
              </div>
              <ArrowRightIcon className="w-3.5 h-3.5 text-[#5A6270] group-hover:text-[#B8860B] group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}

