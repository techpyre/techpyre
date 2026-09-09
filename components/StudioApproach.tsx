"use client";

import React from "react";
import { sound } from "@/lib/audio";

const pillars = [
  {
    num: "01",
    title: "Ingegneria Web & E-Commerce",
    desc: "Architetture Next.js e Shopify Headless ultra-veloci progettate per convertire il traffico qualificato in fatturato misurabile.",
  },
  {
    num: "02",
    title: "Brand Identity & Art Direction",
    desc: "Sistemi d'identità visiva, tipografia su misura e direzione visiva ispirata ai grandi maestri editoriali italiani.",
  },
  {
    num: "03",
    title: "Software & Prodotti Digitali",
    desc: "Applicazioni web su misura, portali di prenotazione diretta per l'ospitalità di lusso e strumenti interni di gestione.",
  },
];

export default function StudioApproach() {
  return (
    <section id="metodo" className="py-24 px-6 md:px-10 max-w-6xl mx-auto border-t border-[#D7CCB9]/10">
      <div className="mb-16">
        <span className="text-xs font-mono uppercase tracking-[0.16em] text-[#C49A58] block mb-2">
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F3EF] font-normal max-w-xl">
          Niente complessità gratuita. <br />
          Solo quello che serve al tuo business.
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pillars.map((item, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl bg-[#1D1B19] border border-[#D7CCB9]/10 space-y-4 hover:border-[#D7CCB9]/25 transition-colors"
          >
            <span className="font-mono text-sm text-[#C26749]">{item.num}.</span>
            <h3 className="font-serif text-xl text-[#F5F3EF] font-normal">{item.title}</h3>
            <p className="text-sm text-[#A39E93] leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Box Dedicato all'Archivio Opere Futuro */}
      <div
        id="archivio-info"
        className="mt-16 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#1D1B19] to-[#24211D] border border-[#C49A58]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#C49A58]">
            <span className="w-2 h-2 rounded-full bg-[#C49A58] animate-pulse" />
            <span>ARCHIVIO PROGETTI IN ALLESTIMENTO</span>
          </div>
          <h4 className="font-serif text-2xl text-[#F5F3EF]">
            Stiamo fotografando e documentando le opere 2024–2026.
          </h4>
          <p className="text-sm text-[#A39E93] max-w-xl">
            La galleria completa con metriche economiche, dettagli tipografici e architetture tecniche
            sarà consultabile in una pagina dedicata. Se desideri vedere privatamente i nostri case study, contattaci.
          </p>
        </div>

        <button
          data-cursor="CASE STUDY"
          onClick={() => {
            sound.playTap();
            const el = document.getElementById("contatto");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          className="px-5 py-3 rounded-full border border-[#C49A58]/40 text-[#F5F3EF] text-xs font-mono tracking-wider uppercase hover:bg-[#C49A58]/10 transition-colors whitespace-nowrap"
        >
          Richiedi Portfolio PDF Privato →
        </button>
      </div>
    </section>
  );
}
