"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import Button from "@/components/ui/Button";
import TechPyreLogo from "@/components/ui/TechPyreLogo";

/**
 * =====================================================================
 * COMPONENTE NAVBAR ISTITUZIONALE (TECHPYRE)
 * - Supporto safe-area completo per iOS Safari (Dynamic Island / Notch)
 * - Schermatura superiore continua: nessun buco o spazio visibile sopra la barra
 * - Transizione fluida su compositor nativo (zero jitter o blocco durante lo scroll)
 * - Isteresi di scorrimento (soglia di 35px in discesa e 25px in salita)
 * - Sempre visibile nei primi 100px di pagina
 * =====================================================================
 */
export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { brand, navigation } = siteContent;
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScrollUpdate = () => {
      const currentScrollY = window.scrollY;

      // Ombreggiatura leggera allo scroll senza mutare l'altezza
      setScrolled(currentScrollY > 20);

      // Se il menu a schermo intero è aperto, la barra resta sempre visibile
      if (mobileMenuOpen) {
        setIsVisible(true);
        ticking = false;
        return;
      }

      // Protezione per i primi 100px e rimbalzo elastico superiore iOS (< 0)
      if (currentScrollY <= 100) {
        setIsVisible(true);
        lastScrollY = Math.max(0, currentScrollY);
        ticking = false;
        return;
      }

      const diff = currentScrollY - lastScrollY;

      // Soglia di intenzione: 35px in discesa per nascondere, 25px in salita per mostrare
      if (diff > 35) {
        setIsVisible(false);
        lastScrollY = currentScrollY;
      } else if (diff < -25) {
        setIsVisible(true);
        lastScrollY = currentScrollY;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScrollUpdate);
        ticking = true;
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileMenuOpen]);

  // Blocca lo scroll del body quando il drawer mobile è aperto
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
        className={`fixed top-0 left-0 right-0 z-50 bg-[#F8F7F4] border-b border-[#E8E2D5] pt-[env(safe-area-inset-top,0px)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        } ${scrolled ? "shadow-sm" : ""}`}
      >
        {/* Scudo continuo superiore: copre 300px oltre la sommità della navbar,
            garantendo che tra la navbar e la status bar o la tacca non ci sia MAI spazio trasparente */}
        <div
          aria-hidden="true"
          className="absolute -top-[300px] left-0 right-0 h-[300px] bg-[#F8F7F4] pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12 py-3 sm:py-3.5 flex items-center justify-between">
          {/* Logo Tipografico Ufficiale */}
          <a
            href="#"
            aria-label={`${brand.name} — Torna alla homepage`}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded-xs"
          >
            <TechPyreLogo size="md" />
          </a>

          {/* Link di Navigazione Desktop */}
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

          {/* CTA Visibile Sempre (Mobile & Desktop) + Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              href={navigation.cta.href}
              variant="primary"
              className="text-[11px] sm:text-xs px-3 sm:px-5 py-2 sm:py-2.5 font-bold shadow-xs whitespace-nowrap"
            >
              <span className="sm:hidden">Incontro 30m</span>
              <span className="hidden sm:inline">{navigation.cta.label}</span>
            </Button>

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

        {/* Filetto Sottile di Progressione Lettura */}
        <motion.div
          style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B8860B] pointer-events-none"
        />
      </header>

      {/* Drawer di Navigazione Mobile a Schermo Intero */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-[#F8F7F4] pt-[calc(env(safe-area-inset-top,0px)+4.75rem)] px-6 pb-8 flex flex-col justify-between lg:hidden border-b border-[#E8E2D5] overflow-y-auto"
          >
            <div className="space-y-5 pt-2">
              <div className="text-[10px] font-sans uppercase font-bold tracking-widest text-[#B8860B] border-b border-[#E8E2D5] pb-2.5">
                INDICE DI NAVIGAZIONE
              </div>
              <nav className="flex flex-col space-y-2.5">
                {navigation.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-lg font-serif text-[#0B1E36] hover:text-[#B8860B] transition-colors border-b border-[#E8E2D5]/40"
                  >
                    <span>{link.label}</span>
                    <span className="text-xs font-sans text-[#5A6270]">→</span>
                  </a>
                ))}
                <a
                  href="#simulatore"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-lg font-serif text-[#B8860B] font-semibold border-b border-[#E8E2D5]/40"
                >
                  <span>Simulatore Preventivo B2B</span>
                  <span className="text-xs font-sans text-[#B8860B]">→</span>
                </a>
              </nav>
            </div>

            <div className="pt-5 border-t border-[#E8E2D5] space-y-3">
              <a
                href={navigation.cta.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-3 bg-[#0A192F] text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#003366] transition-colors"
              >
                {navigation.cta.label}
              </a>
              <div className="text-[10px] font-sans text-center text-[#5A6270]">
                {brand.location}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
