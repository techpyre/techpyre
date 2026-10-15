"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import Button from "@/components/ui/Button";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  GitHubIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/ui/Icons";

/**
 * =====================================================================
 * SEZIONE HERO (INGRESSO & POSIZIONAMENTO ISTITUZIONALE)
 * - Posizionamento asciutto: solo le informazioni decisive
 * - Scheda "Costruito intorno a te" compatta con i 4 KPI contrattuali
 * - Doppio slider verticale sotto l'intro: Progetti (sinistra) e Servizi (destra)
 * =====================================================================
 */
export default function Hero() {
  const { hero, brand, caseStudies, services } = siteContent;

  // Stato Slider Verticale Progetti (Colonna Sinistra)
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [projectDirection, setProjectDirection] = useState(1);
  const projects = caseStudies.items;
  const currentProject = projects[activeProjectIndex];

  const nextProject = () => {
    setProjectDirection(1);
    setActiveProjectIndex((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setProjectDirection(-1);
    setActiveProjectIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  // Stato Slider Verticale Servizi (Colonna Destra)
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [serviceDirection, setServiceDirection] = useState(1);
  const serviceList = services.items;
  const currentService = serviceList[activeServiceIndex];

  const nextService = () => {
    setServiceDirection(1);
    setActiveServiceIndex((prev) => (prev + 1) % serviceList.length);
  };

  const prevService = () => {
    setServiceDirection(-1);
    setActiveServiceIndex((prev) => (prev - 1 + serviceList.length) % serviceList.length);
  };

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

              {/* Tasto Leggi il profilo dello studio reso PROMINENTE come Call to Action */}
              <div className="pt-2.5 border-t border-[#E8E2D5]">
                <Link
                  href="/studio"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-sm bg-[#0B1E36] hover:bg-[#142944] active:scale-[0.99] text-[#F8F7F4] text-xs font-semibold tracking-wide transition-all shadow-xs border border-[#0B1E36] whitespace-nowrap group"
                >
                  <span>Leggi il profilo dello studio</span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-[#B8860B] shrink-0 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 
          =====================================================================
          DIVISIONE A METÀ SOTTO L'INTRODUZIONE (DOPPIO SLIDER VERTICALE):
          - Sinistra (Progetti): 1 alla volta, UI pulita come prima, scroll verticale
            con freccia sopra/sotto e freccia in alto a destra verso /progetti.
          - Destra (Servizi): 1 alla volta senza screenshot, scroll verticale con
            freccia sopra/sotto e freccia in alto a destra verso /servizi.
          - Mobile: card sinistra pulita a larghezza piena, destra nascosta per evitare clutter.
          =====================================================================
        */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[#E8E2D5]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            {/* ================================================================= */}
            {/* COLONNA SINISTRA: SLIDER VERTICALE PROGETTI (UI PULITA COME PRIMA) */}
            {/* ================================================================= */}
            <div className="flex flex-col">
              {/* Barra esterna poco fuori dal riquadro */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B8860B]">
                    [02] CASI STUDIO REFERENCE
                  </span>
                  <span className="text-[10px] font-mono text-[#5A6270]">
                    ({activeProjectIndex + 1}/{projects.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Frecce navigazione: orizzontali su mobile (◀ ▶), verticali su desktop (▲ ▼) */}
                  <div className="flex items-center gap-0.5 bg-white border border-[#E8E2D5] rounded-xs p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={prevProject}
                      className="w-6 h-6 lg:w-5 lg:h-5 flex items-center justify-center hover:bg-[#F8F7F4] text-[#0B1E36] hover:text-[#B8860B] transition-colors rounded-xs cursor-pointer active:scale-90"
                      aria-label="Progetto precedente"
                      title="Progetto precedente"
                    >
                      <ChevronLeftIcon className="w-3.5 h-3.5 lg:hidden" />
                      <ChevronUpIcon className="w-3.5 h-3.5 hidden lg:block" />
                    </button>
                    <div className="w-[1px] h-3 bg-[#E8E2D5]" />
                    <button
                      type="button"
                      onClick={nextProject}
                      className="w-6 h-6 lg:w-5 lg:h-5 flex items-center justify-center hover:bg-[#F8F7F4] text-[#0B1E36] hover:text-[#B8860B] transition-colors rounded-xs cursor-pointer active:scale-90"
                      aria-label="Progetto successivo"
                      title="Progetto successivo"
                    >
                      <ChevronRightIcon className="w-3.5 h-3.5 lg:hidden" />
                      <ChevronDownIcon className="w-3.5 h-3.5 hidden lg:block" />
                    </button>
                  </div>

                  {/* Freccia poco fuori dal riquadro che punta in alto a destra verso /progetti */}
                  <Link
                    href="/progetti"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B1E36] hover:text-[#B8860B] transition-colors group font-sans"
                    title="Vai alla pagina progetti con l'analisi tecnica completa"
                  >
                    <span className="hidden sm:inline font-sans text-[11px] text-[#5A6270] group-hover:text-[#0B1E36] transition-colors">
                      Tutti i progetti
                    </span>
                    <span className="w-6 h-6 rounded-xs bg-white border border-[#E8E2D5] group-hover:border-[#0B1E36] group-hover:bg-[#F8F7F4] flex items-center justify-center transition-all shadow-2xs">
                      <ArrowUpRightIcon className="w-3.5 h-3.5 text-[#0B1E36] group-hover:text-[#B8860B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* Riquadro Progetto: 1 alla volta, grande, limpido, a larghezza piena */}
              <div className="w-full bg-white rounded-sm border border-[#E8E2D5] shadow-xs flex flex-col justify-between overflow-hidden relative group hover:border-[#0B1E36] transition-all flex-1 min-h-[460px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentProject.id}
                    initial={{ opacity: 0, y: projectDirection * 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: projectDirection * -20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col justify-between h-full flex-1"
                  >
                    {/* Screenshot W-FULL pulito senza shrinkage bug */}
                    <a
                      href={currentProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative w-full aspect-[16/10] overflow-hidden bg-[#0A192F]/5 border-b border-[#E8E2D5] group/img"
                      aria-label={`Apri demo live di ${currentProject.title}`}
                    >
                      {currentProject.screenshotUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={currentProject.screenshotUrl}
                          alt={`Screenshot demo: ${currentProject.title}`}
                          className="w-full h-full object-cover object-top block transition-transform duration-500 group-hover/img:scale-[1.02]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#5A6270]">
                          Screenshot demo
                        </div>
                      )}

                      {/* Badge LIVE */}
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#0B1E36]/80 backdrop-blur-xs text-[9px] font-mono text-emerald-400 font-semibold flex items-center gap-1 shadow-xs border border-white/10 pointer-events-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>LIVE</span>
                      </div>

                      {/* Overlay limpido */}
                      <div className="absolute inset-0 bg-[#0B1E36]/0 group-hover/img:bg-[#0B1E36]/15 transition-colors flex items-center justify-center pointer-events-none">
                        <span className="opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 py-1.5 px-3 rounded-xs bg-[#0B1E36] text-white font-sans text-xs font-semibold shadow-md flex items-center gap-1.5">
                          <span>Apri Demo</span>
                          <ArrowUpRightIcon className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </a>

                    {/* Contenuto Scheda: Esattamente come prima */}
                    <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
                      <div className="space-y-1">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B8860B]">
                          {currentProject.tag}
                        </div>
                        <h3 className="font-serif text-base sm:text-lg text-[#0B1E36] font-semibold leading-snug">
                          {currentProject.title}
                        </h3>
                        <p className="text-xs text-[#5A6270] font-sans leading-relaxed pt-0.5 line-clamp-2">
                          {currentProject.shortDescription || currentProject.description}
                        </p>
                      </div>

                      {/* Bottoni Rapidi Demo + GitHub (Come prima) */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E2D5]/70">
                        {currentProject.demoUrl && (
                          <a
                            href={currentProject.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 rounded-sm bg-[#B8860B] hover:bg-[#9A7009] active:scale-[0.99] text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-2xs inline-flex items-center justify-center gap-1.5"
                          >
                            <span>Live Demo</span>
                            <ArrowUpRightIcon className="w-3 h-3" />
                          </a>
                        )}
                        {currentProject.repoUrl && (
                          <a
                            href={currentProject.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 rounded-sm bg-white border border-[#E8E2D5] hover:border-[#0B1E36] active:scale-[0.99] text-[#0B1E36] font-sans text-xs font-semibold tracking-wide transition-all inline-flex items-center justify-center gap-1.5"
                          >
                            <GitHubIcon className="w-3.5 h-3.5" />
                            <span>GitHub</span>
                            <ArrowUpRightIcon className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ================================================================= */}
            {/* COLONNA DESTRA: SLIDER VERTICALE SERVIZI (SENZA SCREENSHOT) */}
            {/* ================================================================= */}
            <div className="hidden sm:flex flex-col">
              {/* Barra esterna allineata alla colonna sinistra */}
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B8860B]">
                    [01] SERVIZI & TARIFFE B2B
                  </span>
                  <span className="text-[10px] font-mono text-[#5A6270]">
                    ({activeServiceIndex + 1}/{serviceList.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Frecce sopra/sotto per scorrimento verticale SU DESKTOP */}
                  <div className="hidden lg:flex items-center gap-0.5 bg-white border border-[#E8E2D5] rounded-xs p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={prevService}
                      className="w-5 h-5 flex items-center justify-center hover:bg-[#F8F7F4] text-[#0B1E36] hover:text-[#B8860B] transition-colors rounded-xs cursor-pointer"
                      aria-label="Servizio precedente"
                      title="Servizio precedente"
                    >
                      <ChevronUpIcon className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-3 bg-[#E8E2D5]" />
                    <button
                      type="button"
                      onClick={nextService}
                      className="w-5 h-5 flex items-center justify-center hover:bg-[#F8F7F4] text-[#0B1E36] hover:text-[#B8860B] transition-colors rounded-xs cursor-pointer"
                      aria-label="Servizio successivo"
                      title="Servizio successivo"
                    >
                      <ChevronDownIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Freccia poco fuori dal riquadro che porta a /servizi */}
                  <Link
                    href="/servizi"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B1E36] hover:text-[#B8860B] transition-colors group font-sans"
                    title="Vai alla pagina con il listino completo e il simulatore"
                  >
                    <span className="hidden sm:inline font-sans text-[11px] text-[#5A6270] group-hover:text-[#0B1E36] transition-colors">
                      Listino completo
                    </span>
                    <span className="w-6 h-6 rounded-xs bg-white border border-[#E8E2D5] group-hover:border-[#0B1E36] group-hover:bg-[#F8F7F4] flex items-center justify-center transition-all shadow-2xs">
                      <ArrowUpRightIcon className="w-3.5 h-3.5 text-[#0B1E36] group-hover:text-[#B8860B] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </Link>
                </div>
              </div>

              {/* Riquadro Servizio: Slider verticale senza screenshot */}
              <div className="w-full bg-white rounded-sm border border-[#E8E2D5] shadow-xs flex flex-col justify-between overflow-hidden relative group hover:border-[#B8860B] transition-all flex-1 min-h-[460px]">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#B8860B]" />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentService.id}
                    initial={{ opacity: 0, y: serviceDirection * 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: serviceDirection * -20 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="p-5 sm:p-6 flex flex-col justify-between h-full flex-1 gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B8860B]">
                          [{currentService.number}] PIANO OPERATIVO
                        </span>
                        <span className="text-[10px] font-mono text-[#5A6270] bg-[#F8F7F4] border border-[#E8E2D5] px-2 py-0.5 rounded-xs">
                          {currentService.timing}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif text-xl sm:text-2xl text-[#0B1E36] font-semibold leading-snug">
                          {currentService.name}
                        </h3>
                        <div className="flex items-baseline gap-2 pt-1.5">
                          <span className="text-base sm:text-lg font-bold text-[#B8860B] font-mono">
                            {currentService.price}
                          </span>
                          <span className="text-xs text-[#5A6270] font-sans">
                            · {currentService.priceSubtext}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#5A6270] font-sans leading-relaxed">
                        {currentService.summary}
                      </p>

                      {/* Deliverables / Caratteristiche Chiave */}
                      <div className="space-y-1.5 pt-2 border-t border-[#E8E2D5]/70">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0B1E36]/70">
                          DELIVERABLE CONTRATTUALI:
                        </div>
                        <ul className="space-y-1 text-xs font-sans text-[#14181F]">
                          {currentService.deliverables.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-[#B8860B] font-bold text-xs shrink-0 mt-0.5">▪</span>
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Footer del Servizio */}
                    <div className="pt-3 border-t border-[#E8E2D5]/70">
                      <Link
                        href="/servizi"
                        className="w-full py-2.5 px-4 rounded-sm bg-[#B8860B] hover:bg-[#9A7009] active:scale-[0.99] text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-2xs inline-flex items-center justify-center gap-2 group/btn"
                      >
                        <span>Configura e calcola preventivo</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

