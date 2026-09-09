"use client";

import React from "react";

export default function StoryAndCraft() {
  return (
    <section id="chi-siamo" className="py-24 px-6 md:px-10 max-w-6xl mx-auto border-t border-[#D7CCB9]/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs font-mono uppercase tracking-[0.16em] text-[#C49A58] block">

          </span>

          <h2 className="font-serif text-3xl sm:text-4xl text-[#F5F3EF] font-normal leading-tight">
            Due giovani specialisti. <br />
            La trasparenza di un patto tra persone.
          </h2>

          <div className="space-y-4 text-sm sm:text-base text-[#A39E93] leading-relaxed">
            <p>
              Abbiamo fondato TechPyre con un obiettivo chiaro: dimostrare che in Sicilia possiamo
              esprimere un livello di ingegneria e cura estetica pari a quello dei migliori studi
              di Zurigo, Milano o Londra, mantenendo l&apos;accoglienza e la disponibilità che ci contraddistinguono.
            </p>
            <p>
              Non abbiamo commerciali che ti promettono la luna per poi affidare il lavoro a stagisti.
              Chi vedi qui è chi scrive ogni singola riga di codice e chi progetta ogni pixel della tua interfaccia.
            </p>
          </div>
        </div>

        {/* Schede Founder */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#1D1B19] border border-[#D7CCB9]/10 space-y-4">
            <div className="h-40 rounded-xl bg-[#25221F] flex flex-col justify-end p-4 border border-[#D7CCB9]/5">
              <span className="text-[11px] font-mono text-[#C49A58]">ARCHITETTURA SOFTWARE</span>
              <span className="font-serif text-lg text-[#F5F3EF]">Dario</span>
            </div>
            <p className="text-xs text-[#A39E93] leading-relaxed">
              Specializzato in Next.js, database distribuiti e infrastrutture ad alte prestazioni senza latenza.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#1D1B19] border border-[#D7CCB9]/10 space-y-4">
            <div className="h-40 rounded-xl bg-[#25221F] flex flex-col justify-end p-4 border border-[#D7CCB9]/5">
              <span className="text-[11px] font-mono text-[#C49A58]">DESIGN & BRANDING</span>
              <span className="font-serif text-lg text-[#F5F3EF]">Marco</span>
            </div>
            <p className="text-xs text-[#A39E93] leading-relaxed">
              Cura l&apos;identità di marca, la tipografia editoriale e le interazioni che rendono memorabile il prodotto.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
