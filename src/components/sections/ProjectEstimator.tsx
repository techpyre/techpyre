"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";

/**
 * =====================================================================
 * SIMULATORE DI PROGETTO B2B & PREVENTIVATORE TRASPARENTE
 * Permette ai clienti di configurare la portata dell'intervento e visualizzare
 * immediatamente tempi e costi indicativi con interazioni animate e reattive.
 * - Stato reattivo (useState) con aggiornamento dinamico in tempo reale
 * - 4 Tier allineati al listino contrattuale
 * - Visualizzazione immediata degli add-on nel prospetto di riepilogo
 * =====================================================================
 */
interface ServiceOption {
  id: string;
  name: string;
  basePrice: string;
  defaultTimeline: string;
  description: string;
}

const serviceOptions: ServiceOption[] = [
  {
    id: "audit",
    name: "Audit Tecnico & Consulenza Architetturale",
    basePrice: "30 min Free, poi 70€ / ora",
    defaultTimeline: "Entro 48 ore",
    description: "Analisi tecnica dell'infrastruttura, rimozione colli di bottiglia e roadmap tecnica esecutiva.",
  },
  {
    id: "landing",
    name: "Landing Page ad Alta Conversione",
    basePrice: "900€ (Prezzo Fisso)",
    defaultTimeline: "5–7 giorni lavorativi",
    description: "Pagina singola ultra-veloce Next.js, copywriting persuasivo, integrazione moduli e webhook CRM.",
  },
  {
    id: "corporate",
    name: "Sito Corporate & Architettura Avanzata",
    basePrice: "Da 2.000€ a 4.000€",
    defaultTimeline: "2–3 settimane",
    description: "Sito multi-pagina Next.js ultra-rapido, SEO tecnica nativa, CMS headless e Blueprint architetturale incluso.",
  },
  {
    id: "ecosistema",
    name: "Web Application & Ecosistema B2B Custom",
    basePrice: "Da 5.000€ a 15.000€",
    defaultTimeline: "4–8 settimane",
    description: "Piattaforma su misura, aree riservate (RBAC), integrazioni API/ERP, flussi Stripe B2B e architettura scalabile.",
  },
];

interface AddonOption {
  id: string;
  label: string;
  cost: string;
  includedInTiers?: string[];
}

const addonsList: AddonOption[] = [
  { id: "crm", label: "Integrazione Webhook CRM", cost: "Inclusa" },
  { id: "auth", label: "Area Riservata a Ruoli (RBAC)", cost: "Inclusa in Web App" },
  { id: "seo", label: "Audit Core Web Vitals (< 300ms)", cost: "Inclusa" },
  { id: "payment", label: "Flussi di Pagamento B2B Stripe", cost: "Valutata nel piano" },
];

export default function ProjectEstimator() {
  const [selectedService, setSelectedService] = useState<ServiceOption>(serviceOptions[1]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["crm", "seo"]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyToContact = () => {
    if (typeof window !== "undefined") {
      const addonNames = selectedAddons
        .map((aId) => addonsList.find((a) => a.id === aId)?.label)
        .filter(Boolean)
        .join(", ");

      const customMessage = `Configurazione dal Simulatore:\n- Servizio: ${selectedService.name}\n- Fascia economica: ${selectedService.basePrice}\n- Tempi stimati: ${selectedService.defaultTimeline}\n- Moduli opzionali selezionati: ${addonNames || "Nessun modulo aggiuntivo"}\n\nDesidero approfondire questa configurazione per la mia impresa con Riccardo Granza.`;

      window.dispatchEvent(
        new CustomEvent("techpyre:select-service-with-details", {
          detail: {
            serviceTitle: selectedService.name,
            prefilledMessage: customMessage,
          },
        })
      );

      const contactSection = document.getElementById("contatto");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section id="simulatore" className="py-12 sm:py-16 md:py-20 bg-[#F8F7F4] border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Intestazione con Animazione */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-[#E8E2D5]"
        >
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-[10px] sm:text-[11px] font-sans font-bold text-[#B8860B] uppercase tracking-widest">
              SIMULATORE B2B · TRASPARENZA PREVENTIVA
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#14181F] font-normal tracking-tight">
              Configura il tuo progetto e verifica i parametri esecutivi.
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6270] font-sans leading-relaxed">
              Seleziona la tipologia di intervento per visualizzare costi indicativi, tempi certi e requisiti tecnici in tempo reale.
            </p>
          </div>

          <div className="text-xs font-mono text-[#5A6270] bg-white border border-[#E8E2D5] p-3 rounded-sm shrink-0 self-start md:self-auto shadow-2xs">
            <div className="text-[10px] font-sans uppercase font-bold text-[#5A6270]">GARANZIA DI PREZZO CERTO</div>
            <div className="text-[#0B1E36] font-bold text-xs sm:text-sm">Nessun costo occulto a consuntivo</div>
          </div>
        </motion.div>

        {/* Console Interattiva a 2 Colonne */}
        <div className="pt-6 sm:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Selettore Tipologia & Opzioni (Colonna Sinistra) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="space-y-2.5">
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#0B1E36]">
                1. Seleziona la Tipologia di Intervento
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {serviceOptions.map((opt) => {
                  const isSelected = selectedService.id === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedService(opt)}
                      className={`p-3.5 rounded-sm text-left border transition-all duration-200 cursor-pointer relative min-h-[58px] ${
                        isSelected
                          ? "bg-[#0B1E36] text-white border-[#0B1E36] shadow-md ring-1 ring-[#0B1E36]"
                          : "bg-white text-[#14181F] border-[#E8E2D5] hover:border-[#B8860B] hover:shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 pb-1">
                        <span className="font-serif font-bold text-sm sm:text-base leading-snug">
                          {opt.name}
                        </span>
                        {isSelected ? (
                          <span className="w-4 h-4 rounded-xs bg-[#B8860B] text-white text-[10px] flex items-center justify-center font-mono shrink-0 mt-0.5">
                            ✓
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-xs border border-[#E8E2D5] bg-[#F8F7F4] shrink-0 mt-0.5" />
                        )}
                      </div>
                      <div className="text-xs font-mono font-bold pt-0.5 text-[#B8860B]">
                        {opt.basePrice}
                      </div>
                      <div
                        className={`text-[11px] pt-1 leading-snug font-sans ${
                          isSelected ? "text-[#CBD7E3]" : "text-[#5A6270]"
                        }`}
                      >
                        {opt.description}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Caratteristiche Accessorie */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#0B1E36]">
                  2. Requisiti e Integrazioni Opzionali
                </label>
                <span className="text-[11px] text-[#5A6270] font-sans">
                  {selectedAddons.length} selezionat{selectedAddons.length === 1 ? "o" : "i"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {addonsList.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3 rounded-sm border cursor-pointer flex items-center justify-between transition-all duration-200 select-none ${
                        isChecked
                          ? "bg-[#0B1E36]/5 border-[#B8860B] shadow-2xs ring-1 ring-[#B8860B]/30"
                          : "bg-white border-[#E8E2D5] text-[#5A6270] hover:border-[#B8860B]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-xs border flex items-center justify-center text-[10px] font-mono transition-colors shrink-0 ${
                            isChecked
                              ? "bg-[#B8860B] border-[#B8860B] text-white"
                              : "border-[#E8E2D5] bg-white"
                          }`}
                        >
                          {isChecked ? "✓" : ""}
                        </div>
                        <span
                          className={`text-xs font-sans font-medium transition-colors ${
                            isChecked ? "text-[#0B1E36] font-bold" : "text-[#14181F]"
                          }`}
                        >
                          {addon.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#5A6270] shrink-0 pl-1">
                        {addon.cost}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scheda Riepilogo Parametri (Colonna Destra) */}
          <div className="lg:col-span-5">
            <motion.div
              layout
              className="p-5 sm:p-6 rounded-sm bg-white border border-[#E8E2D5] shadow-xs space-y-4 relative sticky top-24"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#B8860B]" />

              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B] font-sans">
                  PROSPETTO INDICATIVO B2B
                </span>
                <h3 className="font-serif text-xl text-[#0B1E36] font-semibold">
                  Riepilogo Parametri
                </h3>
              </div>

              {/* Dettagli della Configurazione Selezionata con Aggiornamento Dinamico */}
              <div className="p-4 rounded-sm bg-[#F8F7F4] border border-[#E8E2D5] space-y-2.5">
                <div className="flex justify-between items-start gap-2 text-xs">
                  <span className="text-[#5A6270] font-sans shrink-0">Soluzione Scelta:</span>
                  <span className="font-serif font-bold text-[#0B1E36] text-right">
                    {selectedService.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-[#E8E2D5] pt-2">
                  <span className="text-[#5A6270] font-sans">Fascia Economica:</span>
                  <span className="font-mono font-bold text-[#B8860B]">
                    {selectedService.basePrice}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-[#E8E2D5] pt-2">
                  <span className="text-[#5A6270] font-sans">Tempistica Stimata:</span>
                  <span className="font-sans font-semibold text-[#0B1E36]">
                    {selectedService.defaultTimeline}
                  </span>
                </div>

                {/* Sezione Add-on Selezionati Reattiva */}
                <div className="border-t border-[#E8E2D5] pt-2 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#5A6270] font-sans">Moduli / Requisiti:</span>
                    <span className="font-mono text-[11px] font-semibold text-[#0B1E36]">
                      {selectedAddons.length} attiv{selectedAddons.length === 1 ? "o" : "i"}
                    </span>
                  </div>
                  {selectedAddons.length > 0 ? (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selectedAddons.map((aId) => {
                        const addon = addonsList.find((a) => a.id === aId);
                        if (!addon) return null;
                        return (
                          <span
                            key={aId}
                            className="inline-flex items-center gap-1 text-[10px] font-sans px-2 py-0.5 rounded-xs bg-white border border-[#E8E2D5] text-[#0B1E36]"
                          >
                            <span className="text-[#B8860B] font-bold">▪</span>
                            {addon.label}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#8C95A6] italic font-sans pt-0.5">
                      Nessun modulo aggiuntivo selezionato
                    </div>
                  )}
                </div>
              </div>

              {/* Note e Garanzie di Continuità */}
              <div className="space-y-1.5 text-xs font-sans text-[#5A6270]">
                <div className="flex items-center gap-2 text-[#14181F] font-medium">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>Incontro conoscitivo preliminare di 30 min gratuito</span>
                </div>
                <div className="flex items-center gap-2 text-[#14181F] font-medium">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>Proprietà integrale del codice sorgente su repository aziendale</span>
                </div>
                <div className="flex items-center gap-2 text-[#14181F] font-medium">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>Continuità garantita: documentazione tecnica e stack standard Next.js/TS</span>
                </div>
              </div>

              {/* Pulsante Trasferisci a Preventivo */}
              <div className="pt-2">
                <Button
                  onClick={handleApplyToContact}
                  variant="primary"
                  className="w-full text-center text-xs py-3 justify-center"
                >
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    Trasferisci Configurazione al Modulo
                    <ArrowRightIcon className="w-4 h-4 shrink-0" />
                  </span>
                </Button>
                <div className="text-[10px] text-center text-[#5A6270] pt-1.5 font-sans">
                  Compila e pre-seleziona i dettagli nel modulo in calce
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
