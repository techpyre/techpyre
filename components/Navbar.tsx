"use client";

import React, { useEffect, useState } from "react";
import { sound } from "@/lib/audio";

export default function Navbar() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsub = sound.subscribe(setAudioEnabled);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      unsub();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-[#151413]/90 backdrop-blur-md border-b border-[#D7CCB9]/10 py-4 shadow-sm"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Brand */}
        <a
          href="#"
          data-cursor="STUDIO"
          className="flex items-center gap-2.5 text-[#F5F3EF] hover:text-[#C49A58] transition-colors focus:outline-none"
        >
          <span className="w-2 h-2 rounded-full bg-[#C26749]" />
          <span className="font-serif text-lg tracking-tight font-medium">TechPyre</span>
          <span className="text-[11px] font-mono tracking-widest text-[#A39E93] uppercase ml-1">
            Sicilia
          </span>
        </a>

        {/* Voci di Navigazione */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.14em] font-mono text-[#A39E93]">
          <a
            href="#metodo"
            data-cursor="METODO"
            className="hover:text-[#F5F3EF] transition-colors"
          >
            Metodo
          </a>
          <a
            href="#chi-siamo"
            data-cursor="PERSONE"
            className="hover:text-[#F5F3EF] transition-colors"
          >
            Studio
          </a>

          {/* Bottone elegante per il futuro Archivio Opere */}
          <div className="relative group">
            <button
              data-cursor="PRESTO"
              className="hover:text-[#C49A58] transition-colors flex items-center gap-1.5 focus:outline-none"
              onClick={() => sound.playTap()}
            >
              <span>Archivio Opere</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2A2622] text-[#C49A58] border border-[#C49A58]/25 font-sans">
                In arrivo
              </span>
            </button>
          </div>
        </nav>

        {/* Azioni: Audio e Contatto */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => sound.toggle()}
            data-cursor="AUDIO"
            className={`px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase border transition-all ${
              audioEnabled
                ? "border-[#C49A58]/50 bg-[#C49A58]/10 text-[#C49A58]"
                : "border-[#D7CCB9]/15 text-[#A39E93] hover:text-[#F5F3EF]"
            }`}
          >
            {audioEnabled ? "Audio On" : "Audio Off"}
          </button>

          <a
            href="#contatto"
            data-cursor="SCRIVICI"
            onClick={() => sound.playTap()}
            className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#F5F3EF] text-[#151413] hover:bg-[#E5E2DC] transition-colors"
          >
            Parla con noi
          </a>
        </div>
      </div>
    </header>
  );
}
