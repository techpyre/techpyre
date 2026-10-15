"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import Button from "@/components/ui/Button";
import TechPyreLogo from "@/components/ui/TechPyreLogo";

/**
 * =====================================================================
 * COMPONENTE NAVBAR ISTITUZIONALE
 * - SU MOBILE: Barra volante indipendente (Floating Island) staccata dai bordi
 * - SU DESKTOP: Intestazione classica a piena larghezza
 * - ANIMAZIONE FLUIDA PIÙ LUNGA: durata estesa a 650ms con curva armonica
 *   cubic-bezier(0.22, 1, 0.36, 1) sia per la scomparsa che per la ricomparsa
 * - CTA CON BORDO SBRILLUCCICOSO: fascio di luce dorata continuo lungo il perimetro
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

      setScrolled(currentScrollY > 20);

      // Se il menu a schermo intero è aperto, mantieni sempre visibile
      if (mobileMenuOpen) {
        setIsVisible(true);
        ticking = false;
        return;
      }

      // Nei primi 90px della pagina rimane sempre visibile
      if (currentScrollY <= 90) {
        setIsVisible(true);
        lastScrollY = Math.max(0, currentScrollY);
        ticking = false;
        return;
      }

      const diff = currentScrollY - lastScrollY;

      // Movimento intenzionale: 30px in discesa per nascondere, 20px in salita per mostrare
      if (diff > 30) {
        setIsVisible(false);
        lastScrollY = currentScrollY;
      } else if (diff < -20) {
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

  // Blocca lo scroll del body quando il menu mobile è aperto
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
      {/* 
        HEADER CONTAINER:
        - Su Mobile: Barra volante staccata dai bordi, rounded-sm, shadow-md
        - Su Desktop: Barra classica a piena larghezza
        - Animazione calibrata a 650ms per massima fluidità e peso visivo
      */}
      <header
        className={`fixed z-50 bg-[#F8F7F4] border border-[#E8E2D5] transition-all duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] 
          /* Geometria Mobile: Isola Volante */
          top-[calc(env(safe-area-inset-top,0px)+0.75rem)] left-3.5 right-3.5 sm:left-6 sm:right-6 rounded-sm shadow-md shadow-black/6
          /* Geometria Desktop: Classica Piena Larghezza */
          lg:top-0 lg:left-0 lg:right-0 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:border-b lg:shadow-none
          ${
            isVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "-translate-y-24 opacity-0 scale-[0.98] pointer-events-none"
          } 
          ${scrolled ? "shadow-lg shadow-black/8 lg:shadow-xs" : ""}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-2.5 sm:py-3 lg:py-3.5 flex items-center justify-between">
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

          {/* CTA con Bordo Sbrilluccicoso + Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              href={navigation.cta.href}
              variant="primary"
              withShimmer={true}
              className="text-[11px] sm:text-xs px-3 sm:px-5 py-2 sm:py-2.5 font-bold whitespace-nowrap"
            >
              <span className="sm:hidden">Incontro 30m</span>
              <span className="hidden sm:inline">{navigation.cta.label}</span>
            </Button>

            {/* Pulsante Hamburger Touch-Friendly */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-[#0B1E36] hover:text-[#B8860B] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded-xs"
              aria-label={mobileMenuOpen ? "Chiudi menu di navigazione" : "Apri menu di navigazione"}
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-5 h-4 flex flex-col justify-between items-end">
                <span
                  className={`h-[2px] bg-current transition-all duration-300 ${
                    mobileMenuOpen ? "w-5 rotate-45 translate-y-1.5" : "w-5"
                  }`}
                />
                <span
                  className={`h-[2px] bg-current transition-all duration-300 ${
                    mobileMenuOpen ? "opacity-0" : "w-3.5"
                  }`}
                />
                <span
                  className={`h-[2px] bg-current transition-all duration-300 ${
                    mobileMenuOpen ? "w-5 -rotate-45 -translate-y-1.5" : "w-4.5"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Filetto Sottile di Progressione Lettura */}
        <motion.div
          style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B8860B] rounded-b-sm pointer-events-none"
        />
      </header>

      {/* Drawer di Navigazione Mobile a Schermo Intero */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-[#F8F7F4] pt-[calc(env(safe-area-inset-top,0px)+5.5rem)] px-6 pb-8 flex flex-col justify-between lg:hidden border-b border-[#E8E2D5] overflow-y-auto"
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
              <Button
                href={navigation.cta.href}
                onClick={() => setMobileMenuOpen(false)}
                variant="primary"
                withShimmer={true}
                className="w-full text-center"
              >
                {navigation.cta.label}
              </Button>
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
