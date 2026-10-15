"use client";

import React from "react";
import Link from "next/link";
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

          {/* Scheda Istituzionale "Costruito intorno a te" con le 4 informazioni integrate */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-4"
          >
            <div className="pt-2 lg:pt-1 lg:pl-8 lg:border-l lg:border-[#E8E2D5] space-y-4 relative">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#B8860B] font-bold">
                  APPROCCIO DIRETTO
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-[#0B1E36] font-semibold">
                  Costruito intorno a te
                </h3>
              </div>

              {/* Le 4 informazioni ingegneristiche chiave integrate qui */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded-sm bg-white border border-[#E8E2D5] shadow-2xs">
                  <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#5A6270]">
                    Core Web Vitals
                  </div>
                  <div className="font-serif text-lg sm:text-xl font-bold text-[#0B1E36]">
                    <AnimatedCounter value={100} />
                    <span className="text-[#5A6270] text-xs font-normal"> / 100</span>
                  </div>
                  <div className="text-[9px] text-[#5A6270] font-sans truncate">Sub-secondo</div>
                </div>

                <div className="p-2.5 rounded-sm bg-white border border-[#E8E2D5] shadow-2xs">
                  <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#5A6270]">
                    Rilascio medio
                  </div>
                  <div className="font-serif text-lg sm:text-xl font-bold text-[#0B1E36]">
                    5–7 gg
                  </div>
                  <div className="text-[9px] text-[#5A6270] font-sans truncate">Landing page</div>
                </div>

                <div className="p-2.5 rounded-sm bg-white border border-[#E8E2D5] shadow-2xs">
                  <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#5A6270]">
                    Proprietà codice
                  </div>
                  <div className="font-serif text-lg sm:text-xl font-bold text-[#0B1E36]">
                    100%
                    <span className="text-[#B8860B] italic text-xs ml-0.5">Tua</span>
                  </div>
                  <div className="text-[9px] text-[#5A6270] font-sans truncate">Zero canoni</div>
                </div>

                <div className="p-2.5 rounded-sm bg-white border border-[#E8E2D5] shadow-2xs">
                  <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#5A6270]">
                    Risposta diretta
                  </div>
                  <div className="font-serif text-lg sm:text-xl font-bold text-[#0B1E36]">
                    &lt; <AnimatedCounter value={2} />h
                  </div>
                  <div className="text-[9px] text-[#5A6270] font-sans truncate">Col fondatore</div>
                </div>
              </div>

              <div className="pt-1 text-xs text-[#5A6270] flex items-center justify-between border-t border-[#E8E2D5]/80">
                <span>Capo Studio: <strong>{brand.founder}</strong></span>
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-1 text-[#0B1E36] hover:text-[#B8860B] font-semibold text-xs transition-colors group"
                >
                  <span>Profilo</span>
                  <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Accenno ai Servizi nello spazio liberato sotto l'introduzione */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-[#E8E2D5]"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#B8860B]">
                I QUATTRO FORMATI OPERATIVI
              </span>
              <h2 className="font-serif text-xl sm:text-2xl text-[#14181F] font-normal">
                Soluzioni a prezzo certo prima dell&apos;inizio
              </h2>
            </div>
            <Link
              href="/servizi"
              className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[#0B1E36] hover:text-[#B8860B] transition-colors shrink-0 group"
            >
              <span>Vedi listino completo e calcola preventivo</span>
              <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {siteContent.services.items.map((srv) => (
              <Link
                key={srv.id}
                href="/servizi"
                className="p-4 rounded-sm bg-white border border-[#E8E2D5] hover:border-[#0B1E36] transition-all duration-150 flex flex-col justify-between group shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#5A6270]">
                    <span>[{srv.number}]</span>
                    <ArrowRightIcon className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#B8860B]" />
                  </div>
                  <div className="font-serif text-base text-[#0B1E36] font-semibold leading-snug group-hover:text-[#B8860B] transition-colors">
                    {srv.name}
                  </div>
                  <p className="text-xs text-[#5A6270] font-sans line-clamp-2 pt-0.5">
                    {srv.summary}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#E8E2D5]/60 mt-3">
                  <div className="text-xs font-semibold text-[#0B1E36] font-mono">
                    {srv.price}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
