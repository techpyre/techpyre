"use client";

import React from "react";
import { siteContent } from "@/config/siteContent";
import AnimatedLine from "@/components/ui/AnimatedLine";
import TechPyreLogo from "@/components/ui/TechPyreLogo";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/ui/Icons";

/**
 * =====================================================================
 * FOOTER ISTITUZIONALE
 * - Layout a colonne responsive: 1 colonna su mobile, 3 colonne su tablet/desktop
 * - Logo TechPYRE in modalità scura (Tech bianco + PYRE ottone)
 * - Link di navigazione e contatti diretti
 * =====================================================================
 */
export default function Footer() {
  const { brand, footer } = siteContent;

  return (
    <footer className="bg-[#0A192F] text-[#F8F7F4] pt-12 sm:pt-14 pb-8 sm:pb-10 relative overflow-hidden border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 pb-10 sm:pb-12">
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
          </div>

          {/* Colonne di Navigazione (1 colonna su mobile piccolo, 3 colonne da sm in su) */}
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

        {/* Barra Inferiore di Copyright & Riferimenti */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans text-[#A4B3C6]">
          <div>{footer.copyright}</div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <span>Codice proprietario senza abbonamenti forzati</span>
            <span className="hidden md:inline">•</span>
            <a
              href="#contatto"
              className="text-[#C5A059] hover:text-white font-bold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Parla con {brand.founder}</span>
              <ArrowRightIcon className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
