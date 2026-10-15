"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import Button from "@/components/ui/Button";
import TechPyreLogo from "@/components/ui/TechPyreLogo";

/**
 * =====================================================================
 * COMPONENTE NAVBAR (NAVIGAZIONE PRINCIPALE ISTITUZIONALE)
 * - Supporto safe-area iOS completo: zero spazio vuoto tra navbar e barra di stato
 * - Schermatura superiore antiriflesso (estensione continua dello sfondo #F8F7F4)
 * - Transizione fluida e priva di scatti (soglia di scorrimento con isteresi)
 * - Nessun ridimensionamento dell'altezza durante lo scroll (altezza costante)
 * - CTA "Incontro 30m" sempre visibile anche su mobile senza aprire il menu
 * =====================================================================
 */
export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { brand, navigation } = siteContent;
  const { scrollYProgress } = useScroll();

  // Gestione avanzata dello scroll con buffer/isteresi per eliminare scatti e jitter
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;

      // Ombreggiatura sottile senza variare l'altezza o il padding
      setScrolled(currentScrollY > 15);

      // Se il menu mobile è aperto, mantieni sempre visibile
      if (mobileMenuOpen) {
        setIsVisible(true);
        ticking = false;
        return;
      }

      // Se siamo vicini alla cima della pagina, sempre visibile
      if (currentScrollY <= 45) {
        setIsVisible(true);
        lastScrollY = currentScrollY;
        ticking = false;
        return;
      }

      // Calcola lo scostamento
      const delta = currentScrollY - lastScrollY;

      // Richiede uno scorrimento intenzionale di almeno 16px per evitare scatti
      if (Math.abs(delta) >= 16) {
        if (delta > 0 && currentScrollY > 80) {
          // Scroll verso il basso deliberato: nascondi con animazione fluida
          setIsVisible(false);
        } else if (delta < 0) {
          // Scroll verso l'alto deliberato: mostra con grazia
          setIsVisible(true);
        }
        lastScrollY = currentScrollY;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
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
      <motion.header
        initial={false}
        animate={{
          y: isVisible ? 0 : "-100%",
        }}
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`fixed top-0 left-0 right-0 z-50 bg-[#F8F7F4] border-b border-[#E8E2D5] pt-[env(safe-area-inset-top,0px)] transition-shadow duration-300 ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        {/* Schermatura superiore continua: estende lo sfondo solido di 380px sopra la navbar
            impedendo qualunque fessura visibile con la status bar in caso di rimbalzo o scroll iOS */}
        <div
          aria-hidden="true"
          className="absolute bottom-full left-0 right-0 h-96 bg-[#F8F7F4] pointer-events-none"
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

        {/* Filetto Sottile di Progressione Lettura (Oro Bruciato) */}
        <motion.div
          style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B8860B] pointer-events-none"
        />
      </motion.header>

      {/* Drawer di Navigazione Mobile a Schermo Intero */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
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
