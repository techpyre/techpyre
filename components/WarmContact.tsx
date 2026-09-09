"use client";

import React, { useState } from "react";
import { soundEngine } from "@/lib/audio";

export default function WarmContact() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", contact: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playChime();
    setSubmitted(true);
  };

  return (
    <section id="contatto" className="py-24 px-6 sm:px-8 max-w-7xl mx-auto">
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#18161D]/90 to-[#100F13]/90 backdrop-blur-2xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
        {/* Filo di luce ambrata in alto */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Informazioni e Tono Umano */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-widest font-mono text-amber-400 block">

            </span>

            <h2 className="font-serif text-3xl sm:text-5xl text-[#FBF9F5] font-normal leading-tight">
              Offriamo noi il caffè. <br />
              <span className="italic text-amber-300">O una granita, se sei a Catania.</span>
            </h2>

            <p className="text-base text-[#B8B2A6] leading-relaxed">
              Hai una bottega storica da lanciare nell&apos;online, una struttura ricettiva di pregio da
              affrancare dalle OTA o un&apos;idea per una nuova startup digitale?
              Scrivici due righe o chiamaci. Niente preventivi generati da algoritmi: parliamo di persona.
            </p>

            <div className="space-y-4 pt-4 text-sm">
              <div className="flex items-center gap-3 text-[#B8B2A6]">
                <span className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                  📍
                </span>
                <span>Base operativa: Catania centro &amp; Taormina Coast</span>
              </div>
              <div className="flex items-center gap-3 text-[#B8B2A6]">
                <span className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                  ⚡
                </span>
                <span>Risposta umana diretta garantita entro 3 ore lavorative</span>
              </div>
              <div className="flex items-center gap-3 text-[#B8B2A6]">
                <span className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                  💬
                </span>
                <span>
                  Disponibili anche per un audio rapido su WhatsApp:{" "}
                  <a
                    href="https://wa.me/393400000000"
                    target="_blank"
                    rel="noreferrer"
                    data-cursor="WHATSAPP"
                    className="text-amber-300 underline underline-offset-4 hover:text-amber-200"
                  >
                    +39 340 000 0000
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Modulo di Contatto Diretto */}
          <div className="lg:col-span-6">
            {submitted ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-8 rounded-2xl bg-amber-500/10 border border-amber-400/30">
                <span className="text-4xl mb-4">☀️</span>
                <h3 className="font-serif text-2xl text-[#FBF9F5] mb-2">
                  Messaggio ricevuto con gioia!
                </h3>
                <p className="text-sm text-[#B8B2A6] max-w-sm">
                  Uno di noi due ti risponderà personalmente entro poche ore. A prestissimo!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#B8B2A6] mb-2">
                    Come ti chiami / Nome Azienda
                  </label>
                  <input
                    type="text"
                    required
                    data-cursor="SCRIVI"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Es. Mario Russo — Tenuta Etnea"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-[#FBF9F5] placeholder-[#B8B2A6]/40 focus:outline-none focus:border-amber-400/60 focus:bg-amber-500/[0.03] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#B8B2A6] mb-2">
                    Il tuo recapito (Email o Cellulare / WhatsApp)
                  </label>
                  <input
                    type="text"
                    required
                    data-cursor="RECAPITO"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Es. mario@tenutarussa.it oppure 333 1234567"
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-[#FBF9F5] placeholder-[#B8B2A6]/40 focus:outline-none focus:border-amber-400/60 focus:bg-amber-500/[0.03] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#B8B2A6] mb-2">
                    Cosa possiamo costruire insieme?
                  </label>
                  <textarea
                    rows={4}
                    required
                    data-cursor="DETTAGLI"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Raccontaci brevemente i tuoi obiettivi..."
                    className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-[#FBF9F5] placeholder-[#B8B2A6]/40 focus:outline-none focus:border-amber-400/60 focus:bg-amber-500/[0.03] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  data-cursor="INVIA"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-[#0F0E11] font-semibold text-sm uppercase tracking-wider shadow-[0_6px_25px_rgba(244,162,97,0.35)] hover:shadow-[0_8px_32px_rgba(244,162,97,0.5)] active:scale-[0.99] transition-all"
                >
                  Invia messaggio ai Founder
                </button>

                <p className="text-[11px] text-center text-[#B8B2A6]/60 pt-2 font-mono">
                  Nessuna newsletter né spam. Solo una conversazione reale.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer caldo editoriale */}
      <footer className="mt-20 pt-8 border-t border-amber-400/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#B8B2A6]/60 font-mono gap-4">
        <div>
          © {new Date().getFullYear()} TECHPYRE STUDIO — P.IVA REGIONE SICILIANA
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-amber-300 transition-colors">Taormina</a>
          <a href="#" className="hover:text-amber-300 transition-colors">Catania</a>
          <a href="#" className="hover:text-amber-300 transition-colors">Privacy con rispetto</a>
        </div>
      </footer>
    </section>
  );
}
