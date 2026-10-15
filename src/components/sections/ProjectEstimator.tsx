"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

/**
 * =====================================================================
 * SIMULATORE DI PROGETTO B2B & PREVENTIVATORE TRASPARENTE
 * Permette ai clienti di configurare la portata dell'intervento e visualizzare
 * immediatamente tempi e costi indicativi con interazioni animate e reattive.
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
    id: "consulenza",
    name: "Consulenza & Audit",
    basePrice: "30 min Free, poi 100€/ora",
    defaultTimeline: "Entro 48 ore",
    description: "Analisi tecnica dell'infrastruttura, rimozione colli di bottiglia e roadmap operativa.",
  },
  {
    id: "landing",
    name: "Landing Page ad Alta Conversione",
    basePrice: "500€ (Fisso)",
    defaultTimeline: "5–7 giorni",
    description: "Pagina singola ultra-veloce Next.js, copywriting persuasivo, integrazione moduli e CRM.",
  },
  {
    id: "blueprint",
    name: "Blueprint Ingegneristico",
    basePrice: "Da 1.500€ a 2.500€",
    defaultTimeline: "10–14 giorni",
    description: "Progetto esecutivo completo: architettura di sistema, wireframe, database schema e specifiche.",
  },
  {
    id: "ecosistema",
    name: "Ecosistema Web Completo",
    basePrice: "Da 5.000€ a 15.000€",
    defaultTimeline: "4–8 settimane",
    description: "Piattaforma web custom full-stack, area riservata B2B, database scalabile e pannello di gestione.",
  },
];

const addonsList = [
  { id: "crm", label: "Integrazione Webhook CRM", cost: "Inclusa" },
  { id: "auth", label: "Area Riservata a Ruoli (RBAC)", cost: "+ Valutata nel piano" },
  { id: "seo", label: "Audit Core Web Vitals (< 300ms)", cost: "Inclusa" },
  { id: "payment", label: "Flussi di Pagamento B2B Stripe", cost: "+ Valutata nel piano" },
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

      const customMessage = `Configurazione dal Simulatore:\n- Servizio: ${selectedService.name}\n- Fascia di investimento: ${selectedService.basePrice}\n- Tempi stimati: ${selectedService.defaultTimeline}\n- Opzioni selezionate: ${addonNames || "Nessuna opzione aggiuntiva"}\n\nDesidero approfondire questa configurazione per la mia impresa.`;

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
              Seleziona la tipologia di intervento per visualizzare costi indicativi, tempi certi e requisiti tecnici.
            </p>
          </div>

          <div className="text-xs font-mono text-[#5A6270] bg-white border border-[#E8E2D5] p-3 rounded-sm shrink-0 self-start md:self-auto">
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
                      className={`p-3.5 rounded-sm text-left border transition-all cursor-pointer relative min-h-[54px] ${
                        isSelected
                          ? "bg-[#0B1E36] text-white border-[#0B1E36] shadow-xs"
                          : "bg-white text-[#14181F] border-[#E8E2D5] hover:border-[#B8860B]"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-serif font-bold text-sm sm:text-base leading-snug">
                          {opt.name}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-xs bg-[#B8860B] text-white text-[10px] flex items-center justify-center font-mono">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono font-semibold pt-0.5 text-[#B8860B]">
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
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#0B1E36]">
                2. Requisiti e Integrazioni Opzionali
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {addonsList.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-2.5 sm:p-3 rounded-sm border cursor-pointer flex items-center justify-between transition-colors ${
                        isChecked
                          ? "bg-[#0B1E36]/5 border-[#B8860B] text-[#0B1E36]"
                          : "bg-white border-[#E8E2D5] text-[#5A6270] hover:border-[#B8860B]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-xs border flex items-center justify-center text-[10px] font-mono transition-colors ${
                            isChecked
                              ? "bg-[#B8860B] border-[#B8860B] text-white"
                              : "border-[#E8E2D5] bg-white"
                          }`}
                        >
                          {isChecked ? "✓" : ""}
                        </div>
                        <span className="text-xs font-sans font-medium text-[#14181F]">
                          {addon.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#5A6270]">
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

              {/* Dettagli della Configurazione Selezionata */}
              <div className="p-3.5 rounded-sm bg-[#F8F7F4] border border-[#E8E2D5] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5A6270] font-sans">Soluzione Scelta:</span>
                  <span className="font-serif font-bold text-[#0B1E36] text-right">
                    {selectedService.name}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-[#E8E2D5] pt-1.5">
                  <span className="text-[#5A6270] font-sans">Fascia Economica:</span>
                  <span className="font-mono font-bold text-[#B8860B]">
                    {selectedService.basePrice}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-[#E8E2D5] pt-1.5">
                  <span className="text-[#5A6270] font-sans">Tempistica Stimata:</span>
                  <span className="font-sans font-semibold text-[#0B1E36]">
                    {selectedService.defaultTimeline}
                  </span>
                </div>
              </div>

              {/* Note e Garanzie */}
              <div className="space-y-1.5 text-xs font-sans text-[#5A6270]">
                <div className="flex items-center gap-2 text-[#14181F] font-medium">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>Incontro conoscitivo preliminare di 30 min gratuito</span>
                </div>
                <div className="flex items-center gap-2 text-[#14181F] font-medium">
                  <span className="text-[#B8860B] font-bold">▪</span>
                  <span>Proprietà integrale del codice sorgente rilasciato</span>
                </div>
              </div>

              {/* Pulsante Trasferisci a Preventivo */}
              <div className="pt-2">
                <Button
                  onClick={handleApplyToContact}
                  variant="primary"
                  className="w-full text-center text-xs py-3 justify-center"
                >
                  Trasferisci Configurazione al Modulo →
                </Button>
                <div className="text-[10px] text-center text-[#5A6270] pt-1.5 font-sans">
                  Compila i dati nel modulo di contatto in calce
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
