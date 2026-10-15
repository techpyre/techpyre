"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";

/**
 * =====================================================================
 * SIMULATORE DI PROGETTO B2B & PREVENTIVATORE TRASPARENTE
 * Permette ai clienti di configurare la portata dell'intervento e visualizzare
 * immediatamente tempi e costi indicativi con pieno disaccoppiamento dei dati.
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
    description: "Analisi tecnica dell'infrastruttura, rimozione colli di bottiglia e roadmap di acquisizione clienti.",
  },
  {
    id: "landing",
    name: "Landing Page ad Alta Conversione",
    basePrice: "500€ (Fisso)",
    defaultTimeline: "5–7 giorni",
    description: "Pagina singola ultra-veloce, copywriting persuasivo, integrazione moduli e CRM per raccolta lead.",
  },
  {
    id: "blueprint",
    name: "Blueprint Ingegneristico",
    basePrice: "Da 1.500€ a 2.500€",
    defaultTimeline: "10–14 giorni",
    description: "Progetto esecutivo completo di architettura, wireframe, database schema e specifiche tecniche.",
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
  { id: "auth", label: "Area Riservata con Ruoli (RBAC)", cost: "+ Valutata nel piano" },
  { id: "seo", label: "Audit Core Web Vitals (< 300ms)", cost: "Inclusa" },
  { id: "payment", label: "Flussi di Pagamento Stripe B2B", cost: "+ Valutata nel piano" },
];

export default function ProjectEstimator() {
  const [selectedService, setSelectedService] = useState<ServiceOption>(serviceOptions[1]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["crm", "seo"]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Invia i dati configurati al form di contatto via CustomEvent e fa scorrere la pagina
  const handleApplyToContact = () => {
    if (typeof window !== "undefined") {
      const addonNames = selectedAddons
        .map((aId) => addonsList.find((a) => a.id === aId)?.label)
        .filter(Boolean)
        .join(", ");

      const customMessage = `Configurazione dal Simulatore:\n- Servizio: ${selectedService.name}\n- Fascia di investimento: ${selectedService.basePrice}\n- Tempi stimati: ${selectedService.defaultTimeline}\n- Opzioni selezionate: ${addonNames || "Nessun addon"}\n\nVorrei approfondire questa soluzione per la mia azienda.`;

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
    <section id="simulatore" className="py-14 sm:py-16 md:py-20 bg-[#F8F7F4] border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Intestazione Pragmatica */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 sm:gap-6 pb-6 sm:pb-8 border-b border-[#E8E2D5]">
          <div className="space-y-2 max-w-2xl">
            <div className="text-[10px] sm:text-[11px] font-sans font-bold text-[#B8860B] uppercase tracking-widest">
              SIMULATORE B2B · TRASPARENZA PREVENTIVA
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#14181F] font-normal tracking-tight">
              Configura il tuo progetto e verifica i parametri esecutivi.
            </h2>
            <p className="text-xs sm:text-sm text-[#5A6270] font-sans leading-relaxed">
              Come in una consulenza patrimoniale trasparente: seleziona la tipologia di intervento per visualizzare costi indicativi, tempi certi e requisiti architetturali.
            </p>
          </div>

          <div className="text-xs font-mono text-[#5A6270] bg-white border border-[#E8E2D5] p-3 rounded-sm shrink-0">
            <div className="text-[10px] font-sans uppercase font-bold text-[#5A6270]">GARANZIA DI PREZZO CERTO</div>
            <div className="text-[#0B1E36] font-bold text-xs sm:text-sm">Nessun costo occulto a consuntivo</div>
          </div>
        </div>

        {/* Console Interattiva a 2 Colonne (Stacca verticalmente su mobile, affiancata su desktop) */}
        <div className="pt-6 sm:pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Selettore Tipologia & Opzioni (Colonna Sinistra) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#0B1E36]">
                1. Seleziona la Tipologia di Intervento
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {serviceOptions.map((opt) => {
                  const isSelected = selectedService.id === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedService(opt)}
                      className={`p-3.5 sm:p-4 rounded-sm text-left border transition-all cursor-pointer relative min-h-[56px] ${
                        isSelected
                          ? "bg-[#0B1E36] text-white border-[#0B1E36] shadow-xs"
                          : "bg-white text-[#14181F] border-[#E8E2D5] hover:border-[#B8860B]"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="font-serif text-sm sm:text-base font-semibold">{opt.name}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 bg-[#C5A059]" />
                        )}
                      </div>
                      <div
                        className={`text-xs font-mono font-medium ${
                          isSelected ? "text-[#C5A059]" : "text-[#5A6270]"
                        }`}
                      >
                        {opt.basePrice}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opzioni Aggiuntive */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-[#0B1E36]">
                2. Requisiti e Moduli Aggiuntivi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {addonsList.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-3 rounded-sm border flex items-center justify-between text-xs font-sans cursor-pointer transition-all min-h-[44px] ${
                        isChecked
                          ? "bg-white border-[#B8860B] shadow-2xs"
                          : "bg-white/60 border-[#E8E2D5] text-[#5A6270] hover:border-slate-300"
                      }`}
                    >
                      <span className={isChecked ? "font-semibold text-[#14181F]" : ""}>
                        {addon.label}
                      </span>
                      <span
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center text-[10px] shrink-0 ml-2 ${
                          isChecked
                            ? "bg-[#0B1E36] border-[#0B1E36] text-white font-bold"
                            : "border-[#E8E2D5]"
                        }`}
                      >
                        {isChecked ? "✓" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Scheda Risultato / Stima Bancaria (Colonna Destra) */}
          <div className="lg:col-span-5 bg-white border border-[#E8E2D5] rounded-sm p-5 sm:p-7 shadow-xs space-y-5 sm:space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#B8860B]" />

            <div className="flex items-center justify-between border-b border-[#E8E2D5] pb-3">
              <div className="text-[10px] sm:text-[11px] font-sans uppercase font-bold text-[#5A6270] tracking-wider">
                PROSPETTO DI STIMA ESECUTIVA
              </div>
              <span className="text-[9px] sm:text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-xs font-semibold uppercase">
                Verificato B2B
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-sans text-[#5A6270]">Soluzione selezionata:</div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#0B1E36] font-semibold">
                {selectedService.name}
              </h3>
              <p className="text-xs text-[#5A6270] font-sans pt-1 leading-relaxed">
                {selectedService.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 py-3 sm:py-4 border-y border-[#E8E2D5]">
              <div>
                <span className="text-[9px] sm:text-[10px] font-sans uppercase font-bold text-[#5A6270] block">
                  INVESTIMENTO INDICATIVO:
                </span>
                <span className="font-serif text-lg sm:text-xl md:text-2xl text-[#0B1E36] font-bold">
                  {selectedService.basePrice}
                </span>
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-sans uppercase font-bold text-[#5A6270] block">
                  TEMPO DI RILASCIO STIMATO:
                </span>
                <span className="font-serif text-lg sm:text-xl md:text-2xl text-[#B8860B] font-bold">
                  {selectedService.defaultTimeline}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-sans text-[#5A6270]">
              <div className="flex items-center gap-2 text-[#14181F]">
                <span className="text-[#B8860B] font-bold">▪</span>
                <span>Interlocutore unico: Riccardo Granza</span>
              </div>
              <div className="flex items-center gap-2 text-[#14181F]">
                <span className="text-[#B8860B] font-bold">▪</span>
                <span>Codice sorgente di tua proprietà al 100%</span>
              </div>
              <div className="flex items-center gap-2 text-[#14181F]">
                <span className="text-[#B8860B] font-bold">▪</span>
                <span>Fattura italiana a milestone verificate</span>
              </div>
            </div>

            <Button
              onClick={handleApplyToContact}
              variant="primary"
              className="w-full text-center py-3.5"
            >
              Trasferisci Configurazione nel Form →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
