"use client";

import React from "react";
import { siteContent } from "@/config/siteContent";
import Button from "@/components/ui/Button";
import RevealText from "@/components/ui/RevealText";

/**
 * =====================================================================
 * SEZIONE HERO (INGRESSO & POSIZIONAMENTO ISTITUZIONALE)
 * - Riconoscimento automatico viewport: headline fluida da mobile a 4K
 * - Scheda "Patto di Fiducia" con garanzie immediate per decision maker B2B
 * - Griglia metrica svizzera unificata (4 KPI oggettivi senza box rotonde)
 * =====================================================================
 */
export default function Hero() {
  const { hero, brand } = siteContent;

  // Indicatori di prestazione oggettivi calcolati sugli standard di settore
  const quickMetrics = [
    { label: "PRESTAZIONI CORE WEB VITALS", value: "99 / 100", note: "Velocità di caricamento sub-secondo" },
    { label: "TEMPO DI RILASCIO MEDIO", value: "5–7 Giorni", note: "Per landing page commerciali complete" },
    { label: "PROPRIETÀ INTELLETTUALE", value: "100% Tua", note: "Nessun canone forzato di riscatto" },
    { label: "TEMPO DI RISPOSTA GARANTITO", value: "< 2 Ore", note: "Linea telefonica diretta con il fondatore" },
  ];

  return (
    <section className="relative pt-20 pb-12 sm:pt-24 sm:pb-14 lg:pt-32 lg:pb-16 overflow-hidden bg-[#F8F7F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 relative z-10">
        {/* Barra Istituzionale Top (Pragmatica, scalabile su mobile e tablet) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E8E2D5] text-[10px] sm:text-[11px] font-sans font-bold tracking-wider uppercase text-[#5A6270]">
          <div className="text-[#0B1E36]">
            {hero.badge}
          </div>
          <div>
            {brand.location}
          </div>
        </div>

        {/* Griglia Principale: Headline & Scheda Valore */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-6 sm:pt-8">
          {/* Colonna Testo Principale (8 colonne su desktop, 12 su mobile) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-5">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.85rem] text-[#14181F] font-normal tracking-tight leading-[1.12]">
              <RevealText as="span">
                {hero.headline.line1}
              </RevealText>
              <RevealText as="span" delay={0.12} className="mt-1">
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
              </RevealText>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#5A6270] leading-relaxed max-w-2xl font-sans">
              {hero.subheadline}
            </p>

            {/* Pulsanti di Azione Primari & Secondari */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="space-y-1">
                <Button href={hero.primaryCta.href} variant="primary" className="w-full sm:w-auto">
                  {hero.primaryCta.label} →
                </Button>
                <div className="text-[10px] sm:text-[11px] text-[#5A6270] pl-1 font-sans">
                  {hero.primaryCta.note}
                </div>
              </div>

              <div className="sm:self-start sm:pt-0">
                <Button href={hero.secondaryCta.href} variant="secondary" className="w-full sm:w-auto">
                  {hero.secondaryCta.label}
                </Button>
              </div>
            </div>
          </div>

          {/* Scheda Istituzionale "Costruito intorno a te" (4 colonne su desktop, piena larghezza su mobile) */}
          <div className="lg:col-span-4">
            <div className="p-6 sm:p-7 rounded-sm bg-white border border-[#E8E2D5] shadow-xs space-y-4 sm:space-y-5 relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#B8860B]" />

              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B] font-sans">
                  IL PATTO DI FIDUCIA
                </div>
                <h3 className="font-serif text-lg sm:text-xl text-[#0B1E36] font-semibold">
                  Costruito intorno a te
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#5A6270] leading-relaxed font-sans">
                Rifiutiamo i pacchetti standardizzati e i contratti a scatola chiusa.
                Pianifichiamo solo architetture digitali che portano valore effettivo e duraturo al conto economico della tua impresa.
              </p>

              <div className="pt-3 border-t border-[#E8E2D5] space-y-2 text-xs font-sans text-[#5A6270]">
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

              <div className="pt-1">
                <a
                  href="#storia"
                  className="block text-center py-2.5 px-3 rounded-sm bg-[#F8F7F4] hover:bg-[#E8E2D5]/60 text-[#0B1E36] text-xs font-semibold tracking-wide transition-colors border border-[#E8E2D5]"
                >
                  Leggi il manifesto del fondatore →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Nastro Metriche Istituzionali (2 colonne su mobile, 4 su desktop) */}
        <div className="mt-10 sm:mt-12 border border-[#E8E2D5] bg-white rounded-sm divide-y sm:divide-y-0 sm:divide-x divide-[#E8E2D5] grid grid-cols-2 lg:grid-cols-4 shadow-xs">
          {quickMetrics.map((qm, i) => (
            <div key={i} className="p-4 sm:p-5 space-y-1">
              <div className="text-[9px] sm:text-[10px] font-sans font-bold text-[#5A6270] uppercase tracking-wider">
                {qm.label}
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#0B1E36]">
                {qm.value}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#5A6270] font-sans">
                {qm.note}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
