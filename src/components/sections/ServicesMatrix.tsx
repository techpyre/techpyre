"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import AnimatedLine from "@/components/ui/AnimatedLine";
import { ServiceItem } from "@/types/content";

/**
 * =====================================================================
 * MATRICE DEI SERVIZI & LISTINO TRASPARENTE B2B
 * - Esposizione tabellare dei 4 livelli di servizio con prezzi prefissati
 * - Righe interattive con hover translation e pannello espandibile
 * - Integrazione con il form di contatto: cliccando "Richiedi", compila
 *   automaticamente il servizio selezionato e scorre alla sezione #contatto.
 * =====================================================================
 */
export default function ServicesMatrix() {
  const { services } = siteContent;
  // Di default teniamo aperta la prima scheda di consulenza per mostrare subito il contenuto
  const [expandedId, setExpandedId] = useState<string | null>("consulenza");

  // Invia un evento custom per pre-selezionare il servizio nel form di contatto in calce
  const handleSelectService = (service: ServiceItem) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("techpyre:select-service", {
          detail: { serviceTitle: service.name, serviceId: service.id },
        })
      );
      const contactEl = document.getElementById("contatto");
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section id="servizi" className="py-14 sm:py-16 md:py-20 relative bg-[#F8F7F4] border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Intestazione Sezione Pragmatica */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 pb-6">
          <div className="max-w-3xl space-y-2">
            <div className="text-[10px] sm:text-[11px] font-sans font-bold text-[#B8860B] uppercase tracking-widest">
              {services.eyebrow}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#14181F] font-normal tracking-tight leading-[1.14]">
              {services.title}
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-[#5A6270] leading-relaxed font-sans">
              {services.subtitle}
            </p>
          </div>

          <div className="text-xs font-sans text-[#5A6270] bg-white border border-[#E8E2D5] p-3 rounded-sm shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6270]">GARANZIA DI TRASPARENZA</div>
            <div className="text-[#0B1E36] font-bold text-xs sm:text-sm">Fatturazione B2B a milestone</div>
          </div>
        </div>

        <AnimatedLine className="mb-6 sm:mb-8" />

        {/* Matrice dei Servizi con Tagli Architetturali */}
        <div className="space-y-3">
          {services.items.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-sm border transition-all duration-200 bg-white overflow-hidden shadow-xs ${
                  isExpanded ? "border-[#B8860B] ring-1 ring-[#B8860B]/20" : "border-[#E8E2D5] hover:border-[#0B1E36]"
                }`}
              >
                {/* Riga Principale Interattiva */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 sm:p-6 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 group"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleExpand(item.id);
                    }
                  }}
                >
                  {/* Titolo e Indice senza bolle rotonde */}
                  <div className="flex items-start gap-3 sm:gap-5 lg:max-w-2xl transition-transform duration-300 group-hover:translate-x-1 sm:group-hover:translate-x-2">
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#B8860B] pt-0.5 sm:pt-1 shrink-0">
                      [{item.number}]
                    </span>
                    <div>
                      <h3 className="font-serif text-lg sm:text-xl md:text-2xl text-[#0B1E36] font-semibold leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#5A6270] pt-1 font-sans leading-relaxed">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  {/* Prezzo e Indicatore di Espansione (Adattabile su Mobile) */}
                  <div className="flex items-center justify-between lg:justify-end gap-4 sm:gap-8 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E8E2D5]/60">
                    <div className="text-left lg:text-right">
                      <div className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#0B1E36]">
                        {item.price}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-sans text-[#5A6270] uppercase tracking-wide">
                        {item.priceSubtext}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="text-xs font-sans font-bold text-[#B8860B] group-hover:text-[#0B1E36] transition-colors hidden sm:inline-block">
                        {isExpanded ? "Nascondi specifiche" : "Consulta scheda"}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-sm border border-[#E8E2D5] flex items-center justify-center text-xs font-mono transition-transform duration-300 ${
                          isExpanded
                            ? "rotate-180 bg-[#0B1E36] text-white border-[#0B1E36]"
                            : "bg-[#F8F7F4] text-[#0B1E36]"
                        }`}
                      >
                        ↓
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scheda Tecnica Dettagliata Espandibile */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-t border-[#E8E2D5] bg-[#F8F7F4]/60"
                    >
                      <div className="p-5 sm:p-7 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Specifiche e Deliverables */}
                        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                          <div>
                            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#B8860B] mb-1.5 font-sans">
                              SPECIFICA ESECUTIVA DEL SERVIZIO
                            </div>
                            <p className="text-xs sm:text-sm text-[#14181F] leading-relaxed font-sans">
                              {item.description}
                            </p>
                          </div>

                          <div>
                            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#0B1E36] mb-2 font-sans">
                              COSA INCLUDE IL CONTRATTO:
                            </div>
                            <ul className="space-y-2">
                              {item.deliverables.map((del, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#14181F]">
                                  <span className="text-[#B8860B] font-bold text-xs shrink-0 mt-0.5">▪</span>
                                  <span>{del}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Tempistiche e CTA */}
                        <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#E8E2D5] pt-5 lg:pt-0 lg:pl-6 space-y-4 sm:space-y-5">
                          <div className="space-y-2.5 sm:space-y-3 text-xs font-sans">
                            <div className="p-3 sm:p-3.5 rounded-sm bg-white border border-[#E8E2D5] space-y-0.5 sm:space-y-1">
                              <span className="text-[#5A6270] uppercase block text-[9px] sm:text-[10px] font-bold tracking-wider">
                                TEMPISTICHE DI RILASCIO:
                              </span>
                              <span className="text-[#0B1E36] font-bold text-xs sm:text-sm">
                                {item.timing}
                              </span>
                            </div>

                            <div className="p-3 sm:p-3.5 rounded-sm bg-white border border-[#E8E2D5] space-y-0.5 sm:space-y-1">
                              <span className="text-[#5A6270] uppercase block text-[9px] sm:text-[10px] font-bold tracking-wider">
                                TARGET AZIENDALE DI RIFERIMENTO:
                              </span>
                              <span className="text-[#14181F] text-xs leading-relaxed block font-medium">
                                {item.target}
                              </span>
                            </div>
                          </div>

                          <div>
                            <button
                              onClick={() => handleSelectService(item)}
                              className="w-full py-3 sm:py-3.5 px-5 sm:px-6 rounded-sm bg-[#0B1E36] hover:bg-[#003366] text-white font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs flex items-center justify-between group/btn cursor-pointer min-h-[44px]"
                            >
                              <span>{item.ctaText}</span>
                              <span className="transition-transform group-hover/btn:translate-x-1">→</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Nota di Trasparenza in calce */}
        <div className="mt-6 sm:mt-8 p-4 rounded-sm bg-white border border-[#E8E2D5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 text-xs font-sans text-[#5A6270]">
          <div>{services.guarantee}</div>
          <div className="text-[#0B1E36] font-bold">
            Fatturazione B2B trasparente · Nessun vincolo forzato
          </div>
        </div>
      </div>
    </section>
  );
}
