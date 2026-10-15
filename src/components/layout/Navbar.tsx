"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import Button from "@/components/ui/Button";
import TechPyreLogo from "@/components/ui/TechPyreLogo";

/**
 * =====================================================================
 * COMPONENTE NAVBAR (NAVIGAZIONE PRINCIPALE)
 * - Riconosce automaticamente lo stato di scroll per applicare sfondo semitrasparente
 * - Gestisce il drawer mobile responsive per smartphone e tablet
 * - Blocca lo scroll del body quando il menu mobile è aperto per evitare glitch UX
 * =====================================================================
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { brand, navigation } = siteContent;

  // Effetto per rilevare lo scroll della pagina e chiudere il menu mobile su schermi grandi
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenuOpen]);

  // Blocca lo scroll della pagina quando il drawer mobile è aperto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#F8F7F4]/98 backdrop-blur-md border-b border-[#E8E2D5] py-3 shadow-xs"
            : "bg-[#F8F7F4]/90 backdrop-blur-xs py-4 sm:py-4.5 border-b border-[#E8E2D5]/70"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 flex items-center justify-between">
          {/* Logo Tipografico Ufficiale */}
          <a
            href="#"
            aria-label={`${brand.name} — Torna alla homepage`}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded-xs"
          >
            <TechPyreLogo size="md" />
          </a>

          {/* Link di Navigazione Desktop (Visibili da 1024px in su) */}
          <nav className="hidden lg:flex items-center gap-7 xl:gap-8">
            {navigation.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-sans font-semibold tracking-wide text-[#5A6270] hover:text-[#0B1E36] transition-colors relative py-1 group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#B8860B] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <a
              href="#simulatore"
              className="text-xs font-sans font-bold tracking-wide text-[#B8860B] hover:text-[#0B1E36] transition-colors relative py-1"
            >
              Simulatore B2B
            </a>
          </nav>

          {/* CTA Desktop & Hamburger Mobile */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Button href={navigation.cta.href} variant="primary" className="text-xs px-5 py-2.5">
                {navigation.cta.label}
              </Button>
            </div>

            {/* Pulsante Hamburger con Target Touch 44x44px */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-11 h-11 flex items-center justify-center text-[#0B1E36] hover:text-[#B8860B] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded-xs"
              aria-label={mobileMenuOpen ? "Chiudi menu di navigazione" : "Apri menu di navigazione"}
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-6 h-5 flex flex-col justify-between items-end">
                <span
                  className={`h-[2px] bg-current transition-all duration-300 ${
                    mobileMenuOpen ? "w-6 rotate-45 translate-y-2" : "w-6"
                  }`}
                />
                <span
                  className={`h-[2px] bg-current transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0" : "w-4"
                  }`}
                />
                <span
                  className={`h-[2px] bg-current transition-all duration-300 ${
                    mobileMenuOpen ? "w-6 -rotate-45 -translate-y-2" : "w-5"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer di Navigazione Mobile a Schermo Intero */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-[#F8F7F4] pt-24 px-6 pb-10 flex flex-col justify-between lg:hidden border-b border-[#E8E2D5] overflow-y-auto"
          >
            <div className="space-y-6 pt-4">
              <div className="text-[11px] font-sans uppercase font-bold tracking-widest text-[#B8860B] border-b border-[#E8E2D5] pb-3">
                INDICE DI NAVIGAZIONE
              </div>
              <nav className="flex flex-col space-y-3">
                {navigation.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-xl font-serif text-[#0B1E36] hover:text-[#B8860B] transition-colors border-b border-[#E8E2D5]/40"
                  >
                    <span>{link.label}</span>
                    <span className="text-xs font-sans text-[#5A6270]">→</span>
                  </a>
                ))}
                <a
                  href="#simulatore"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-xl font-serif text-[#B8860B] font-semibold border-b border-[#E8E2D5]/40"
                >
                  <span>Simulatore Preventivo B2B</span>
                  <span className="text-xs font-sans text-[#B8860B]">→</span>
                </a>
              </nav>
            </div>

            <div className="pt-6 border-t border-[#E8E2D5] space-y-3">
              <a
                href={navigation.cta.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3.5 bg-[#0A192F] text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#003366] transition-colors"
              >
                {navigation.cta.label}
              </a>
              <div className="text-[11px] font-sans text-center text-[#5A6270]">
                {brand.location}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
