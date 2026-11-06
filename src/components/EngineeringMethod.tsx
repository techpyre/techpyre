"use client";

import React from "react";
import { motion } from "framer-motion";
const editorialEase = [0.22, 1, 0.36, 1] as const;
import { brandName } from "@/config/siteContent";

const methodPrinciples = [
  {
    number: "01",
    title: "Fondamenta Solide e Veloci",
    subtitle: "Pagine pronte in un battito di ciglia",
    description:
      "Non usiamo piattaforme pesanti piene di falle o plugin improvvisati. Sviluppiamo su server moderni e sicuri che fanno volare il sito della tua impresa senza intoppi e senza tempi d'attesa.",
  },
  {
    number: "02",
    title: "Zero Guasti e Rigore Artigianale",
    subtitle: "Collaudo severo prima della consegna",
    description:
      "Ogni pulsante, ogni modulo e ogni dettaglio viene controllato e testato personalmente. Non consegniamo mai un lavoro a metà: quando una pagina va online, deve funzionare senza sorprese.",
  },
  {
    number: "03",
    title: "Semplicità per Chi Naviga",
    subtitle: "La chiarezza che fa sentire a casa il cliente",
    description:
      "Disegniamo siti belli e intuitivi, facili da consultare sia per il giovane con lo smartphone che per l'imprenditore al computer. Nessun effetto speciale caotico: solo chiarezza e accoglienza.",
  },
  {
    number: "04",
    title: "Piena Proprietà, Zero Catene",
    subtitle: "Il lavoro svolto appartiene a te per sempre",
    description:
      "Non ti leghiamo con canoni di riscatto forzati. Ti consegniamo le chiavi in mano di tutto il materiale e del codice sorgente: la tua azienda resta libera e padrona del proprio futuro.",
  },
];

export default function EngineeringMethod() {
  return (
    <section id="metodo" className="py-24 md:py-32 bg-[#FAF7F2] border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Intestazione */}
        <div className="max-w-3xl space-y-4 pb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8E2D5] text-xs font-bold text-[#C99738] uppercase tracking-wider">
            <span>🏛️</span>
            <span>IL NOSTRO METODO // COME LAVORIAMO</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl text-[#0B2545] font-normal tracking-tight leading-[1.14]">
            Costruito per durare nel tempo, proprio come una buona casa in pietra.
          </h2>

          <p className="text-base sm:text-lg text-[#5C6B7A] leading-relaxed font-sans">
            In {brandName} crediamo che la vera innovazione non sia stupire con effetti speciali passeggeri,
            ma garantire affidabilità quotidiana e rispetto del valore del cliente.
          </p>
        </div>

        {/* 4 Riquadri Solidità */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {methodPrinciples.map((item, idx) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: editorialEase }}
              className="p-8 sm:p-10 rounded-2xl bg-white border border-[#E8E2D5] hover:border-[#C99738]/60 transition-all shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8E2D5] text-[#C99738] font-bold text-xs flex items-center justify-center font-mono">
                  {item.number}
                </span>
                <span className="text-[11px] font-sans font-bold text-[#5C6B7A] uppercase tracking-wider">
                  REGOLA DELLA BOTTEGA
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-2xl text-[#0B2545] font-semibold">
                  {item.title}
                </h3>
                <div className="text-xs font-sans font-bold text-[#C99738] tracking-wide">
                  {item.subtitle}
                </div>
              </div>

              <p className="text-sm text-[#5C6B7A] leading-relaxed font-sans pt-1">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
