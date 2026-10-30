"use client";

import React, { useState } from "react";
import Link from "next/link";
import { siteContent } from "@/config/siteContent";
import AnimatedLine from "@/components/ui/AnimatedLine";
import TechPyreLogo from "@/components/ui/TechPyreLogo";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/ui/Icons";
import PrivacyModal from "@/components/ui/PrivacyModal";

/**
 * =====================================================================
 * FOOTER ISTITUZIONALE B2B
 * - Layout armonioso e integrato: Identità di Studio + 3 Colonne tematiche
 * - Colonna 1: Patti & Principi (Listino, Progetti, Metodo, Simulatore)
 * - Colonna 2: Competenze & Specifiche Operative (Audit, Landing Page, Portali B2B)
 * - Colonna 3: Sede Operativa, Dati Fiscali e Canali Diretti integrati organicamente
 * - Barra inferiore: Copyright ufficiale, P.IVA in costituzione, Sede, GDPR e CTA
 * =====================================================================
 */
export default function Footer() {
  const { brand, footer } = siteContent;
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0A192F] text-[#F8F7F4] pt-12 sm:pt-16 pb-28 sm:pb-12 relative overflow-hidden border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 relative z-10 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
          {/* Brand, Manifesto & Status Fondatore (5 Colonne) */}
          <div className="lg:col-span-5 space-y-4">
            <TechPyreLogo variant="dark" size="md" />

            <p className="font-sans text-xs sm:text-sm text-[#A4B3C6] leading-relaxed max-w-md pt-1">
              {footer.summary}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xs bg-white/5 border border-white/10 text-xs font-sans text-[#CBD7E3]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Fondatore: <strong className="text-white font-semibold">{brand.founder}</strong>
              </span>
              <span className="text-[#C5A059]">·</span>
              <span className="text-[#A4B3C6]">Operatività Nazionale</span>
            </div>
          </div>

          {/* Colonne di Navigazione & Dati Aziendali (7 Colonne) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Colonna 1: Patti & Principi */}
            <div className="space-y-3">
              <div className="text-[10px] sm:text-[11px] font-sans uppercase font-bold tracking-widest text-[#C5A059] border-b border-white/10 pb-2">
                {footer.links[0]?.title || "Patti e Principi"}
              </div>
              <ul className="space-y-2 font-sans text-xs">
                {footer.links[0]?.items.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-[#A4B3C6] hover:text-[#C5A059] transition-colors block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonna 2: Specifiche Operative */}
            <div className="space-y-3">
              <div className="text-[10px] sm:text-[11px] font-sans uppercase font-bold tracking-widest text-[#C5A059] border-b border-white/10 pb-2">
                {footer.links[1]?.title || "Specifiche Operative"}
              </div>
              <ul className="space-y-2 font-sans text-xs">
                {footer.links[1]?.items.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-[#A4B3C6] hover:text-[#C5A059] transition-colors block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonna 3: Sede & Recapiti Ufficiali Organica */}
            <div className="space-y-3">
              <div className="text-[10px] sm:text-[11px] font-sans uppercase font-bold tracking-widest text-[#C5A059] border-b border-white/10 pb-2">
                Sede & Dati
              </div>

              <div className="space-y-3 font-sans text-xs">
                <div>
                  <span className="text-[10px] font-mono text-[#C5A059]/90 uppercase tracking-wider block">
                    Sede Operativa
                  </span>
                  <p className="text-[#F8F7F4] font-medium leading-relaxed pt-0.5">
                    Via Carrubara Vico III n. 3<br />
                    98027 Pagliara (Messina)
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[#C5A059]/90 uppercase tracking-wider block">
                    Dati Fiscali
                  </span>
                  <p className="text-[#A4B3C6] pt-0.5">
                    P.IVA: <span className="text-[#F8F7F4] font-medium">In stato di costituzione</span>
                  </p>
                </div>

                <div className="space-y-1 pt-0.5">
                  <span className="text-[10px] font-mono text-[#C5A059]/90 uppercase tracking-wider block">
                    Contatto Rapido
                  </span>
                  <a
                    href={`mailto:${brand.contactEmail}`}
                    className="text-[#A4B3C6] hover:text-[#C5A059] transition-colors block truncate py-0.5"
                  >
                    {brand.contactEmail}
                  </a>
                  <a
                    href="https://wa.me/393791159352"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors py-0.5"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                    <span>WhatsApp: +39 379 115 9352</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AnimatedLine variant="dark" />

        {/* Barra Inferiore: Copyright Completo, Dati Societari, Note Legali & CTA */}
        <div className="pt-2 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs font-sans text-[#A4B3C6]">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#CBD7E3]">
              <span>© {currentYear} TechPYRE STUDIO di Riccardo Granza</span>
              <span className="text-[#C5A059]">·</span>
              <span>Sede Operativa: Via Carrubara Vico III n. 3, Pagliara (Messina)</span>
              <span className="text-[#C5A059]">·</span>
              <span>P.IVA in stato di costituzione</span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#A4B3C6]/75">
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="hover:text-[#C5A059] transition-colors cursor-pointer underline decoration-white/20"
              >
                Privacy Policy (GDPR)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="hover:text-[#C5A059] transition-colors cursor-pointer underline decoration-white/20"
              >
                Cookie Policy
              </button>
              <span>·</span>
              <span>Codice proprietario senza lock-in</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap shrink-0">
            <Link
              href="/#contatto"
              className="text-[#C5A059] hover:text-white font-bold transition-all inline-flex items-center gap-1.5 whitespace-nowrap text-xs bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xs border border-[#C5A059]/30 hover:border-[#C5A059]"
            >
              <span>Parla con {brand.founder}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </footer>
  );
}
