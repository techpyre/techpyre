"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import AnimatedLine from "@/components/ui/AnimatedLine";
import { ServiceItem } from "@/types/content";
import { ArrowRightIcon, ArrowDownIcon } from "@/components/ui/Icons";

/**
 * =====================================================================
 * MATRICE DEI SERVIZI & LISTINO TRASPARENTE B2B
 * - Esposizione chiara dei 4 livelli di servizio con prezzi prefissati
 * - Schede compatte con reveal progressivo per evitare scroll infinito su mobile
 * - Animazioni fluide Framer Motion (stagger, accordion ad alta reattività)
 * - Selezione diretta con precompilazione modulo di contatto
 * =====================================================================
 */
export default function ServicesMatrix() {
  const { services } = siteContent;
  // Di default teniamo le schede chiuse per un colpo d'occhio immediato e pulito su mobile
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    <section id="servizi" className="py-12 sm:py-16 md:py-20 relative bg-[#F8F7F4] border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Intestazione Sezione con Animazione */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-5 sm:pb-6"
        >
          <div className="max-w-3xl space-y-1.5">
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

          <div className="text-xs font-sans text-[#5A6270] bg-white border border-[#E8E2D5] p-3 rounded-sm shrink-0 self-start md:self-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6270]">TRASPARENZA</div>
            <div className="text-[#0B1E36] font-bold text-xs sm:text-sm">Fatturazione a milestone certe</div>
          </div>
        </motion.div>

        <AnimatedLine className="mb-6 sm:mb-8" />

        {/* Matrice dei Servizi con Tagli Architetturali */}
        <div className="space-y-3">
          {services.items.map((item, index) => {
            const isExpanded = expandedId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-sm border transition-colors duration-200 bg-white overflow-hidden shadow-xs ${
                  isExpanded ? "border-[#B8860B] ring-1 ring-[#B8860B]/20" : "border-[#E8E2D5] hover:border-[#0B1E36]"
                }`}
              >
                {/* Riga Principale Interattiva */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 sm:p-5 cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-6 group"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleExpand(item.id);
                    }
                  }}
                >
                  {/* Titolo e Indice */}
                  <div className="flex items-start gap-3 sm:gap-4 lg:max-w-2xl transition-transform duration-200 group-hover:translate-x-1">
                    <span className="font-mono text-xs sm:text-sm font-bold text-[#B8860B] pt-0.5 shrink-0">
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

                  {/* Prezzo e Indicatore di Espansione */}
                  <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-6 border-t lg:border-t-0 pt-2.5 lg:pt-0 border-[#E8E2D5]/60">
                    <div className="text-left lg:text-right">
                      <div className="font-serif text-lg sm:text-xl md:text-2xl font-bold text-[#0B1E36]">
                        {item.price}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-sans text-[#5A6270] uppercase tracking-wide">
                        {item.priceSubtext}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-sans font-bold text-[#B8860B] group-hover:text-[#0B1E36] transition-colors hidden sm:inline-block">
                        {isExpanded ? "Nascondi" : "Specifiche"}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className={`w-7 h-7 rounded-sm border flex items-center justify-center font-mono ${
                          isExpanded
                            ? "bg-[#0B1E36] text-white border-[#0B1E36]"
                            : "bg-[#F8F7F4] text-[#0B1E36] border-[#E8E2D5]"
                        }`}
                      >
                        <ArrowDownIcon className="w-3.5 h-3.5" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Scheda Tecnica Dettagliata Espandibile con Animazione Fluida */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-t border-[#E8E2D5] bg-[#F8F7F4]/50"
                    >
                      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* Specifiche e Deliverables */}
                        <div className="lg:col-span-7 space-y-3.5">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#B8860B] mb-1 font-sans">
                              SPECIFICA ESECUTIVA
                            </div>
                            <p className="text-xs sm:text-sm text-[#14181F] leading-relaxed font-sans">
                              {item.description}
                            </p>
                          </div>

                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#0B1E36] mb-1.5 font-sans">
                              COSA INCLUDE:
                            </div>
                            <ul className="space-y-1.5">
                              {item.deliverables.map((del, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-[#14181F]">
                                  <span className="text-[#B8860B] font-bold text-xs shrink-0 mt-0.5">▪</span>
                                  <span>{del}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Tempistiche e CTA */}
                        <div className="lg:col-span-5 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#E8E2D5] pt-4 lg:pt-0 lg:pl-5 space-y-3.5">
                          <div className="space-y-2 text-xs font-sans">
                            <div className="p-3 rounded-sm bg-white border border-[#E8E2D5] space-y-0.5">
                              <span className="text-[#5A6270] uppercase block text-[9px] font-bold tracking-wider">
                                TEMPISTICHE DI CONSEGNA:
                              </span>
                              <span className="text-[#0B1E36] font-bold text-xs sm:text-sm">
                                {item.timing}
                              </span>
                            </div>

                            <div className="p-3 rounded-sm bg-white border border-[#E8E2D5] space-y-0.5">
                              <span className="text-[#5A6270] uppercase block text-[9px] font-bold tracking-wider">
                                TARGET DI RIFERIMENTO:
                              </span>
                              <span className="text-[#14181F] text-xs leading-relaxed block font-medium">
                                {item.target}
                              </span>
                            </div>
                          </div>

                          <div className="relative p-[1.5px] rounded-sm overflow-hidden group cursor-pointer">
                            <span
                              aria-hidden="true"
                              className="absolute inset-[-150%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_260deg,#C5A059_310deg,#FFFFFF_345deg,#B8860B_360deg)] animate-[spin_3.5s_linear_infinite] pointer-events-none"
                            />
                            <motion.button
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSelectService(item)}
                              className="w-full py-3 px-4 rounded-[1px] bg-[#0B1E36] hover:bg-[#003366] text-white font-sans text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs flex items-center justify-between group/btn cursor-pointer min-h-[44px] relative z-10"
                            >
                              <span>{item.ctaText}</span>
                              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 shrink-0" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Garanzia in calce */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 p-3.5 sm:p-4 rounded-sm bg-white border border-[#E8E2D5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-sans text-[#5A6270]"
        >
          <div>{services.guarantee}</div>
          <div className="text-[#0B1E36] font-bold">
            Fatturazione B2B a stati di avanzamento · Nessun vincolo
          </div>
        </motion.div>
      </div>
    </section>
  );
}
