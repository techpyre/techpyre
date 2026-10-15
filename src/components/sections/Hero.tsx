"use client";

import React from "react";
import { motion } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import Button from "@/components/ui/Button";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { ArrowRightIcon } from "@/components/ui/Icons";

/**
 * =====================================================================
 * SEZIONE HERO (INGRESSO & POSIZIONAMENTO ISTITUZIONALE)
 * - Animazioni orchestrate con Framer Motion (stagger e curve progressive)
 * - Contatori animati di precisione sui 4 KPI ingegneristici
 * - Layout fluido e asciutto: solo le informazioni decisive
 * =====================================================================
 */
export default function Hero() {
  const { hero, brand } = siteContent;

  const quickMetrics = [
    {
      label: "CORE WEB VITALS",
      renderValue: () => (
        <span>
          <AnimatedCounter value={100} />
          <span className="text-[#5A6270] text-base font-normal"> / 100</span>
        </span>
      ),
      note: "Velocità di risposta sub-secondo",
    },
    {
      label: "TEMPO DI RILASCIO MEDIO",
      renderValue: () => <span>5–7 Giorni</span>,
      note: "Per landing page commerciali complete",
    },
    {
      label: "PROPRIETÀ CODICE",
      renderValue: () => (
        <span>
          <AnimatedCounter value={100} suffix="%" />
          <span className="text-[#B8860B] font-serif italic ml-1">Tua</span>
        </span>
      ),
      note: "Nessun canone di riscatto",
    },
    {
      label: "RISPOSTA GARANTITA",
      renderValue: () => (
        <span>
          &lt; <AnimatedCounter value={2} /> Ore
        </span>
      ),
      note: "Linea diretta con il fondatore",
    },
  ];

  return (
    <section className="relative pt-24 pb-10 sm:pt-28 sm:pb-14 lg:pt-32 lg:pb-16 overflow-hidden bg-[#F8F7F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 relative z-10">
        {/* Barra Istituzionale Top */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-3 border-b border-[#E8E2D5] text-[10px] sm:text-[11px] font-sans font-bold tracking-wider uppercase text-[#5A6270]"
        >
          <div className="text-[#0B1E36]">{hero.badge}</div>
          <div>{brand.location}</div>
        </motion.div>

        {/* Griglia Principale: Headline & Scheda Patto di Fiducia */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-center pt-5 sm:pt-8">
          {/* Colonna Testo Principale */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-8 space-y-4"
          >
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.85rem] text-[#14181F] font-normal tracking-tight leading-[1.12]">
              <span>{hero.headline.line1} </span>
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
                  <span>{hero.primaryCta.label}</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 shrink-0" />
                </Button>
                <div className="text-[10px] sm:text-[11px] text-[#5A6270] pl-1 font-sans">
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

          {/* Scheda Istituzionale "Il Patto di Fiducia" (Compatta, scannabile e priva di prolissità) */}
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
                <div className="flex items-center gap-2 text-[#14181F] font-medium">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>Interlocutore diretto: {brand.founder}</span>
                </div>
                <div className="flex items-center gap-2 text-[#14181F] font-medium">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>Prezzo certo e pattuito prima di iniziare</span>
                </div>
                <div className="flex items-center gap-2 text-[#14181F] font-medium">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>Proprietà intellettuale del codice al 100%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E2D5]">
                <a
                  href="#storia"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-sm bg-[#F8F7F4] hover:bg-[#E8E2D5]/70 text-[#0B1E36] text-xs font-semibold tracking-wide transition-colors border border-[#E8E2D5] whitespace-nowrap"
                >
                  <span>Leggi il profilo del fondatore</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Nastro Metriche Istituzionali con Animazione d'Ingresso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 sm:mt-12 border border-[#E8E2D5] bg-white rounded-sm divide-y sm:divide-y-0 sm:divide-x divide-[#E8E2D5] grid grid-cols-2 lg:grid-cols-4 shadow-xs"
        >
          {quickMetrics.map((metric, i) => (
            <div
              key={i}
              className="p-3.5 sm:p-5 flex flex-col justify-between hover:bg-[#F8F7F4]/40 transition-colors"
            >
              <span className="text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-wider text-[#5A6270]">
                {metric.label}
              </span>
              <div className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#0B1E36] my-1 sm:my-1.5">
                {metric.renderValue()}
              </div>
              <span className="text-[10px] sm:text-xs text-[#5A6270] font-sans leading-tight">
                {metric.note}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
