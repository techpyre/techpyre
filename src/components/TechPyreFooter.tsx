import React from "react";
import { ShieldCheck, Zap, Lock, ExternalLink, Mail, Phone, Sparkles } from "lucide-react";
import { LeadConfig } from "@/types/lead";

interface TechPyreFooterProps {
  data: LeadConfig;
}

export default function TechPyreFooter({ data }: TechPyreFooterProps) {
  const { meta, audit } = data;

  return (
    <footer className="bg-[#090A0B] text-zinc-400 border-t border-zinc-800/80 text-xs font-sans">
      {/* Sezione Istituzionale Lead */}
      <div className="demo-container py-8 border-b border-zinc-800/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-zinc-400">
          <div>
            <span className="font-semibold text-zinc-200">{meta.companyName}</span>
            <span className="mx-2 text-zinc-600">·</span>
            <span>Sede e operatività: {meta.city} e provincia</span>
            {meta.vatNumber && meta.vatNumber !== "Non trovata" && (
              <>
                <span className="mx-2 text-zinc-600">·</span>
                <span>P.IVA {meta.vatNumber}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="text-zinc-500">Recapito diretto:</span>
            <span className="font-mono font-medium">{meta.phone}</span>
          </div>
        </div>
      </div>

      {/* Sezione Firma Ufficiale TechPYRE */}
      <div className="demo-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Colonna Sinistra: Identità Studio TechPYRE */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="font-black tracking-tight text-white text-base">
                Tech<span className="text-amber-400">PYRE</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                Ingegneria Web & Architettura CRO
              </span>
            </div>

            <p className="text-zinc-400 leading-relaxed text-[11px] sm:text-xs">
              Questa versione dimostrativa ad altissima velocità è stata sviluppata dal team
              ingegneristico di <strong>TechPYRE</strong> ad uso esclusivo della Direzione di{" "}
              <strong>{meta.companyName}</strong>, per illustrare l&apos;impatto concreto del
              caricamento a <strong>0.3 secondi</strong> e della profilazione interattiva del cliente
              sul rendimento delle campagne pubblicitarie.
            </p>

            <div className="pt-2 text-[11px] text-zinc-500">
              Progetto riservato · Tutti i marchi e i contenuti aziendali citati appartengono ai
              legittimi proprietari.
            </div>
          </div>

          {/* Colonna Centrale: Benchmark Prestazionale */}
          <div className="lg:col-span-4 space-y-3 lg:border-l lg:border-zinc-800/80 lg:pl-8">
            <div className="text-zinc-300 font-semibold text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Standard Prestazionali Certificati</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">Sito attuale</div>
                <div className="text-base font-bold text-amber-400 mt-0.5">
                  {audit.originalLcpSeconds}s
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">LCP medio su smartphone</div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/70 border border-zinc-800">
                <div className="text-[10px] uppercase tracking-wider text-zinc-500">Versione TechPYRE</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">0.3s</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Next.js Turbopack SSR</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% GDPR Compliant
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-zinc-400" /> Zero Cookie Profilanti
              </span>
            </div>
          </div>

          {/* Colonna Destra: Contatto Diretto con Riccardo Granza */}
          <div className="lg:col-span-3 space-y-3 lg:border-l lg:border-zinc-800/80 lg:pl-8">
            <div className="text-zinc-300 font-semibold text-xs">
              Studio Tecnico & Direzione
            </div>

            <div className="space-y-1.5 text-[11px] text-zinc-300">
              <div className="font-semibold text-white">Riccardo Granza</div>
              <div className="text-zinc-500">Fondatore & Lead Software Engineer</div>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px]">
              <a
                href="tel:+393791159352"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Phone className="w-3 h-3 text-amber-400" />
                <span>+39 379 115 9352</span>
              </a>
              <a
                href="mailto:riccardo.granza@techpyre.eu"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <Mail className="w-3 h-3 text-amber-400" />
                <span>riccardo.granza@techpyre.eu</span>
              </a>
              <a
                href="https://techpyre.eu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-zinc-400 hover:text-amber-400 transition-colors pt-1"
              >
                <span>techpyre.eu</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
