"use client";

import React from "react";
import { sound } from "@/lib/audio";

export default function Hero() {
  return (
    <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 md:px-10 max-w-6xl mx-auto">
      {/* Informazioni di contesto geografico ed editoriale */}
      <div className="flex items-center gap-3 text-xs font-mono tracking-[0.16em] uppercase text-[#A39E93] mb-8 border-b border-[#D7CCB9]/10 pb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C26749]" />
        <span>Studio di Ingegneria Software & Design // Catania — Taormina</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Titolo e Testo Principale */}
        <div className="lg:col-span-8 space-y-6">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#F5F3EF] font-normal tracking-tight leading-[1.12]">
            Costruiamo prodotti digitali <br className="hidden sm:inline" />
            e piattaforme web con la dedizione <br className="hidden sm:inline" />
            di una <span className="italic text-[#C49A58]">bottega su misura.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A39E93] leading-relaxed max-w-2xl font-sans pt-2">
            Siamo due sviluppatori e designer under 30. Uniamo architetture software contemporanee
            a una sensibilità estetica calda e materica, lavorando fianco a fianco con fondatori e aziende
            che vogliono crescere sul serio, senza intermediari o gergo opaco.
          </p>

          {/* Azioni calibrate */}
          <div className="flex flex-wrap items-center gap-4 pt-6">
            <a
              href="#contatto"
              data-cursor="INIZIA"
              onClick={() => sound.playTap()}
              className="px-6 py-3.5 rounded-full bg-[#C26749] text-[#F5F3EF] text-sm font-medium hover:bg-[#B3593D] transition-colors"
            >
              Richiedi una conversazione
            </a>

            {/* Bottone futuro Archivio Opere */}
            <a
              href="#archivio-info"
              data-cursor="ARCHIVIO"
              onClick={() => sound.playTap()}
              className="px-6 py-3.5 rounded-full border border-[#D7CCB9]/20 bg-[#1D1B19]/50 text-[#F5F3EF] text-sm font-medium hover:border-[#C49A58]/50 hover:bg-[#1D1B19] transition-all flex items-center gap-2"
            >
              <span>Archivio Opere</span>
              <span className="text-[10px] font-mono text-[#C49A58] border border-[#C49A58]/30 px-1.5 py-0.2 rounded">
                2024–2026
              </span>
            </a>
          </div>
        </div>

        {/* Scheda di sintesi chiara e sobria */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-2xl bg-[#1D1B19] border border-[#D7CCB9]/10 space-y-6">
          <div className="text-xs font-mono uppercase tracking-widest text-[#C49A58]">
          </div>

          <ul className="space-y-4 text-sm text-[#A39E93]">
            <li className="flex items-start gap-3">
              <span className="text-[#C26749] font-mono">01.</span>
              <div>
                <strong className="text-[#F5F3EF] block font-medium">Autonomia Totale</strong>
                Scriviamo codice pulito, documentato e scalabile che rimane di tua totale proprietà.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#C26749] font-mono">02.</span>
              <div>
                <strong className="text-[#F5F3EF] block font-medium">Contatto Diretto</strong>
                Rispondiamo personalmente al telefono o su WhatsApp: nessun project manager filtro.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#C26749] font-mono">03.</span>
              <div>
                <strong className="text-[#F5F3EF] block font-medium">Standard Prestazionali</strong>
                Tempi di caricamento sub-secondo per massimizzare le conversioni e l&apos;indicizzazione.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
