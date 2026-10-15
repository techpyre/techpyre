"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import { requestContactPrefill } from "@/lib/contactPrefill";
import { useRouter } from "next/navigation";
import AnimatedLine from "@/components/ui/AnimatedLine";
import { ArrowRightIcon, ArrowUpRightIcon, GitHubIcon } from "@/components/ui/Icons";

interface CaseStudiesProps {
  variant?: "full" | "teaser";
}

/**
 * =====================================================================
 * SEZIONE ARCHITETTURE & CASI STUDIO B2B
 * - "teaser" (Homepage): Scalato, limpido, senza benchmark ridondanti,
 *   slider a scorrimento orizzontale singolo su mobile.
 * - "full" (/progetti): Schede complete con analisi tecnica approfondita
 * =====================================================================
 */
export default function CaseStudies({ variant = "teaser" }: CaseStudiesProps) {
  const router = useRouter();
  const { caseStudies } = siteContent;
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.clientWidth * 0.75;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveSlide(Math.min(Math.max(index, 0), caseStudies.items.length - 1));
    }
  };

  const scrollToSlide = (index: number) => {
    if (carouselRef.current) {
      const targetCard = carouselRef.current.children[index] as HTMLElement;
      targetCard?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setActiveSlide(index);
    }
  };

  const handleSelectCaseStudy = (serviceName: string, caseTitle: string) => {
    if (typeof window !== "undefined") {
      const customMessage = `Richiesta Informazioni su Architettura Reference:\n- Riferimento: ${caseTitle}\n- Servizio correlato: ${serviceName}\n\nDesidero valutare un'architettura con analoghi requisiti di velocità, sicurezza e scalabilità per la mia impresa.`;

      requestContactPrefill(
        {
          serviceTitle: serviceName,
          prefilledMessage: customMessage,
        },
        (href) => router.push(href)
      );
    }
  };

  // =====================================================================
  // VARIANTE HOME (TEASER): PULITA, IN SCALA, SENZA BENCHMARK, SLIDER MOBILE
  // =====================================================================
  if (variant === "teaser") {
    return (
      <section id="progetti" className="py-10 sm:py-14 bg-[#F8F7F4] border-t border-[#E8E2D5]">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 md:px-12">
          {/* Intestazione Sintetica */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-5">
            <div className="space-y-0.5">
              <div className="text-[10px] font-sans font-bold text-[#B8860B] uppercase tracking-widest">
                ARCHITETTURE REFERENCE LIVE
              </div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#14181F] font-normal tracking-tight">
                Due architetture live. Nessun mockup astratto.
              </h2>
            </div>
            <Link
              href="/progetti"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B1E36] hover:text-[#B8860B] transition-colors font-sans group shrink-0"
            >
              <span>Vedi analisi tecnica completa</span>
              <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Griglia Desktop / Slider Mobile (1 card per volta con snap fluido) */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex lg:grid lg:grid-cols-2 gap-4 sm:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none pb-3 pt-1 -mx-5 px-5 sm:mx-0 sm:px-0"
          >
            {caseStudies.items.map((project) => (
              <div
                key={project.id}
                className="w-[84vw] max-w-[340px] sm:w-[380px] lg:w-full shrink-0 snap-center bg-white rounded-sm border border-[#E8E2D5] hover:border-[#0B1E36] transition-all shadow-2xs hover:shadow-xs overflow-hidden flex flex-col justify-between group"
              >
                {/* Preview Screenshot in Scala Ridotta (Senza barra MacOS) */}
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-[16/10] max-h-[180px] sm:max-h-[200px] overflow-hidden bg-[#0A192F]/5 group/img border-b border-[#E8E2D5]"
                  aria-label={`Apri demo live di ${project.title}`}
                >
                  {project.screenshotUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.screenshotUrl}
                      alt={`Screenshot demo: ${project.title}`}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#5A6270]">
                      Screenshot demo
                    </div>
                  )}

                  {/* Badge LIVE pulito e discreto in sovrimpressione */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#0B1E36]/80 backdrop-blur-xs text-[9px] font-mono text-emerald-400 font-semibold flex items-center gap-1 shadow-xs border border-white/10 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LIVE</span>
                  </div>

                  {/* Hover overlay limpido */}
                  <div className="absolute inset-0 bg-[#0B1E36]/0 group-hover/img:bg-[#0B1E36]/15 transition-colors flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 py-1.5 px-3 rounded-xs bg-[#0B1E36] text-white font-sans text-xs font-semibold shadow-md flex items-center gap-1.5">
                      <span>Apri Demo</span>
                      <ArrowUpRightIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>

                {/* Contenuto Scheda: Limpido, Titolo, Descrizione Breve e 2 Bottoni (Senza Benchmark) */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B8860B]">
                      {project.tag}
                    </div>
                    <h3 className="font-serif text-base sm:text-lg text-[#0B1E36] font-semibold leading-snug">
                      {project.title}
                    </h3>
                    <p className="text-xs text-[#5A6270] font-sans leading-relaxed pt-0.5 line-clamp-2">
                      {project.shortDescription || project.description}
                    </p>
                  </div>

                  {/* Bottoni Rapidi */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E2D5]/70">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-sm bg-[#B8860B] hover:bg-[#9A7009] active:scale-[0.99] text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-2xs inline-flex items-center justify-center gap-1.5"
                      >
                        <span>Live Demo</span>
                        <ArrowUpRightIcon className="w-3 h-3" />
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
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
              </div>
            ))}
          </div>

          {/* Indicatori Paginazione Mobile (Pallini Animati per Scorrimento Singolo) */}
          <div className="lg:hidden flex items-center justify-center gap-1.5 pt-3">
            {caseStudies.items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeSlide === i ? "w-6 bg-[#B8860B]" : "w-2 bg-[#D4CBB8]"
                }`}
                aria-label={`Visualizza progetto ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // =====================================================================
  // VARIANTE COMPLETA (/progetti): ANALISI TECNICA APPROFONDITA
  // =====================================================================
  return (
    <section id="progetti" className="py-12 sm:py-16 md:py-20 bg-[#F8F7F4] border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Intestazione Sezione */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-5 sm:pb-6"
        >
          <div className="max-w-3xl space-y-1.5">
            <div className="text-[10px] sm:text-[11px] font-sans font-bold text-[#B8860B] uppercase tracking-widest">
              {caseStudies.eyebrow}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#14181F] font-normal tracking-tight leading-[1.14]">
              {caseStudies.title}
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-[#5A6270] leading-relaxed font-sans">
              {caseStudies.subtitle}
            </p>
          </div>

          <div className="text-xs font-mono text-[#5A6270] bg-white border border-[#E8E2D5] p-3 rounded-sm shrink-0 self-start md:self-auto shadow-2xs">
            <div className="text-[10px] font-sans uppercase font-bold text-[#5A6270]">VERIFICA PRESTAZIONALE</div>
            <div className="text-[#0B1E36] font-bold text-xs sm:text-sm">Metriche certificate su Web Edge</div>
          </div>
        </motion.div>

        <AnimatedLine className="mb-6 sm:mb-8" />

        {/* Griglia Completa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {caseStudies.items.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.6, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-sm border border-[#E8E2D5] shadow-xs flex flex-col justify-between overflow-hidden relative group hover:border-[#0B1E36] transition-all duration-200"
            >
              {/* Accento Superiore Pulito */}
              <div className="h-[2px] w-full bg-[#B8860B]" />

              {/* Screenshot Reale della Demo */}
              {project.screenshotUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-[16/10] max-h-[260px] overflow-hidden bg-[#0A192F]/5 border-b border-[#E8E2D5] group/img relative"
                  aria-label={`Apri demo di ${project.title}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.screenshotUrl}
                    alt={`Screenshot live demo: ${project.title}`}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/img:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#0B1E36]/80 backdrop-blur-xs text-[9px] font-mono text-emerald-400 font-semibold flex items-center gap-1 shadow-xs border border-white/10 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>LIVE DEMO</span>
                  </div>
                </a>
              )}

              {/* Contenuto Approfondito */}
              <div className="p-5 sm:p-7 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B8860B] bg-[#B8860B]/10 px-2 py-0.5 rounded-xs">
                      {project.tag}
                    </span>
                    {project.clientName && (
                      <span className="text-[11px] font-sans font-medium text-[#5A6270]">
                        {project.clientName}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-[#0B1E36] font-semibold tracking-tight pt-0.5">
                    {project.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5A6270] font-sans leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Box Problema & Soluzione */}
                {(project.businessProblem || project.solution) && (
                  <div className="space-y-2 pt-1">
                    {project.businessProblem && (
                      <div className="p-3 rounded-sm bg-rose-50/50 border border-rose-200/70 text-xs font-sans space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                          <span>⚠</span>
                          <span>Problema di Business Reale</span>
                        </div>
                        <p className="text-[#333333] leading-relaxed text-[11px] sm:text-xs">
                          {project.businessProblem}
                        </p>
                      </div>
                    )}

                    {project.solution && (
                      <div className="p-3 rounded-sm bg-[#B8860B]/5 border border-[#B8860B]/25 text-xs font-sans space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#B8860B] flex items-center gap-1.5">
                          <span>✓</span>
                          <span>Soluzione Applicata</span>
                        </div>
                        <p className="text-[#0B1E36] leading-relaxed text-[11px] sm:text-xs font-medium">
                          {project.solution}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Metriche */}
                <div className="grid grid-cols-3 gap-2 py-1">
                  {project.metrics.map((metric, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-2 sm:p-2.5 rounded-sm bg-[#F8F7F4] border border-[#E8E2D5] space-y-0.5"
                    >
                      <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#5A6270] truncate">
                        {metric.label}
                      </div>
                      <div className="font-mono font-bold text-xs sm:text-sm text-[#0B1E36]">
                        {metric.value}
                      </div>
                      {metric.subtext && (
                        <div className="text-[9px] text-[#8C95A6] font-sans truncate">
                          {metric.subtext}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Punti Salienti */}
                <div className="space-y-1.5 border-t border-[#E8E2D5] pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#0B1E36] font-sans">
                    Caratteristiche Ingegneristiche Chiave
                  </div>
                  <ul className="space-y-1 text-xs text-[#5A6270] font-sans">
                    {project.highlights.map((item, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-1.5">
                        <span className="text-[#B8860B] font-bold shrink-0 mt-0.5">▪</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Stack */}
                <div className="space-y-1.5 border-t border-[#E8E2D5] pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#0B1E36] font-sans">
                    Stack Architetturale Adottato
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-xs bg-[#0B1E36]/5 border border-[#0B1E36]/10 text-[#0B1E36] font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Barra Inferiore */}
              <div className="p-4 sm:p-5 bg-[#F8F7F4] border-t border-[#E8E2D5] space-y-3">
                {(project.demoUrl || project.repoUrl) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-sm bg-[#B8860B] hover:bg-[#9A7009] active:scale-[0.99] text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-xs inline-flex items-center justify-center gap-1.5 group/demo"
                      >
                        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        <span>Esplora Live Demo</span>
                        <ArrowUpRightIcon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover/demo:translate-x-0.5 group-hover/demo:-translate-y-0.5" />
                      </a>
                    )}
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-sm bg-white border border-[#0B1E36]/20 hover:border-[#0B1E36] active:scale-[0.99] text-[#0B1E36] font-sans text-xs font-semibold tracking-wide transition-all inline-flex items-center justify-center gap-1.5 group/repo"
                      >
                        <GitHubIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>Ispeziona su GitHub</span>
                        <ArrowUpRightIcon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover/repo:translate-x-0.5 group-hover/repo:-translate-y-0.5" />
                      </a>
                    )}
                  </div>
                )}

                {project.demoUrl && (
                  <p className="text-[10px] text-[#5A6270] font-sans text-center sm:text-left">
                    Sandbox pubblica senza registrazione · codice sorgente verificabile
                  </p>
                )}

                <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#E8E2D5]">
                  <span className="text-xs text-[#5A6270] font-sans hidden sm:inline">
                    Proprietà codice 100% dell&apos;azienda
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSelectCaseStudy(project.prefillService || "", project.title)}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-sm bg-[#0B1E36] hover:bg-[#002244] active:scale-[0.99] text-white font-sans text-xs font-semibold tracking-wide transition-all shadow-xs inline-flex items-center justify-center gap-2 group/btn cursor-pointer"
                  >
                    <span>{project.ctaText}</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 shrink-0 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

