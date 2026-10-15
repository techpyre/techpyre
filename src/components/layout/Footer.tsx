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
 * - Layout a colonne responsive: 1 colonna su mobile, 3 colonne su tablet/desktop
 * - Logo TechPYRE in modalità scura
 * - Link di navigazione, recapiti diretti e link di conformità GDPR
 * - Riga placeholder per dati fiscali/legali (invisibile al pubblico, pronta per compilazione)
 * =====================================================================
 */
export default function Footer() {
  const { brand, footer } = siteContent;
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  return (
    <footer className="bg-[#0A192F] text-[#F8F7F4] pt-12 sm:pt-14 pb-8 sm:pb-10 relative overflow-hidden border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 relative z-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
          {/* Brand & Manifesto */}
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            <TechPyreLogo variant="dark" size="md" />

            <p className="font-sans text-xs sm:text-sm text-[#A4B3C6] leading-relaxed max-w-md pt-1">
              {footer.summary}
            </p>

            <div className="text-xs font-sans text-[#A4B3C6] pt-1">
              <span>Fondatore: {brand.founder}</span>
              <span className="mx-2 text-[#C5A059]">·</span>
              <span>{brand.location}</span>
            </div>

            {/* 
              =====================================================================
              DATI FISCALI & SOCIETARI B2B (INVISIBILE AL PUBBLICO - PRONTO PER COMPILAZIONE)
              Decommentare e compilare quando saranno disponibili i dati fiscali ufficiali:
              =====================================================================
            */}
            {/*
            <div className="text-[11px] font-mono text-[#A4B3C6]/80 pt-2 border-t border-white/10 flex flex-wrap gap-x-3 gap-y-1">
              <span>P.IVA: [INSERIRE_PIVA]</span>
              <span className="text-[#C5A059]">·</span>
              <span>Sede Operativa: [CITTÀ], Italia</span>
              <span className="text-[#C5A059]">·</span>
              <span>PEC: [INSERIRE_PEC]</span>
            </div>
            */}
          </div>

          {/* Colonne di Navigazione */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {footer.links.map((col, idx) => (
              <div key={idx} className="space-y-3">
                <div className="text-[10px] sm:text-[11px] font-sans uppercase font-bold tracking-widest text-[#C5A059] border-b border-white/10 pb-2">
                  {col.title}
                </div>
                <ul className="space-y-2 font-sans text-xs">
                  {col.items.map((link, i) => (
                    <li key={i}>
                      {link.href.includes("wa.me") ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors py-0.5"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                          <span>{link.label}</span>
                        </a>
                      ) : link.href.startsWith("tel:") ? (
                        <a
                          href={link.href}
                          className="text-[#A4B3C6] hover:text-[#C5A059] font-medium transition-colors block py-0.5"
                        >
                          {link.label}
                        </a>
                      ) : link.href.startsWith("/") ? (
                        <Link
                          href={link.href}
                          className="text-[#A4B3C6] hover:text-[#C5A059] transition-colors block py-0.5"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          target={link.isExternal ? "_blank" : undefined}
                          rel={link.isExternal ? "noreferrer" : undefined}
                          className="text-[#A4B3C6] hover:text-[#C5A059] transition-colors block py-0.5"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <AnimatedLine variant="dark" />

        {/* Barra Inferiore di Copyright, Note Legali & Riferimenti */}
        <div className="pt-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-sans text-[#A4B3C6]">
          <div className="space-y-1">
            <div>{footer.copyright}</div>
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
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <span>Codice proprietario senza lock-in</span>
            <span className="hidden md:inline">•</span>
            <Link
              href="/#contatto"
              className="text-[#C5A059] hover:text-white font-bold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
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
