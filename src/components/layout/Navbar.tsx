"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import Button from "@/components/ui/Button";
import TechPyreLogo from "@/components/ui/TechPyreLogo";
import {
  ArrowRightIcon,
  CalendarIcon,
  ServicesIcon,
  ProjectsIcon,
  StudioIcon,
} from "@/components/ui/Icons";

/**
 * =====================================================================
 * COMPONENTE NAVBAR ISTITUZIONALE
 * - SU MOBILE: Isola volante compatta (solo Logo + Menu), con CTA spostata
 *   in basso a destra in un Floating Action Button (FAB) ergonomico
 * - SU DESKTOP: Intestazione a piena larghezza con CTA integrata
 * - ACCESSIBILITÀ: Link semantici, touch target minimi di 44px
 * =====================================================================
 */
export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { navigation } = siteContent;
  const { scrollYProgress } = useScroll();
  const pathname = usePathname();

  // Link attivo: pagina corrente
  const isActive = (href: string) => !href.includes("#") && pathname === href;

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let accumulatedDiff = 0;

    const handleScrollUpdate = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 16);

      // Se il menu mobile è aperto, mantieni sempre visibile
      if (mobileMenuOpen) {
        setIsVisible(true);
        lastScrollY = currentScrollY;
        accumulatedDiff = 0;
        return;
      }

      // Nei primi 70px della pagina rimane sempre visibile
      if (currentScrollY <= 70) {
        setIsVisible(true);
        lastScrollY = Math.max(0, currentScrollY);
        accumulatedDiff = 0;
        return;
      }

      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Se cambia direzione di scroll, azzera l'accumulatore per una risposta immediata
      if ((delta > 0 && accumulatedDiff < 0) || (delta < 0 && accumulatedDiff > 0)) {
        accumulatedDiff = 0;
      }

      accumulatedDiff += delta;

      // Soglia calibrata: 28px in discesa per nascondere, 12px in salita per riapparire subito
      if (accumulatedDiff > 28) {
        setIsVisible(false);
        accumulatedDiff = 0;
      } else if (accumulatedDiff < -12) {
        setIsVisible(true);
        accumulatedDiff = 0;
      }
    };

    window.addEventListener("scroll", handleScrollUpdate, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollUpdate);
  }, [mobileMenuOpen]);

  // Gestione tasto Escape per chiudere menu mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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
      {/* Filetto di progressione lettura persistente a bordo schermo quando la navbar si ritrae */}
      <div
        className={`fixed top-0 left-0 right-0 h-[2px] bg-[#E8E2D5]/50 z-50 pointer-events-none transition-opacity duration-500 ${
          !isVisible && scrolled ? "opacity-100" : "opacity-0"
        }`}
      >
        <motion.div
          style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
          className="h-full bg-[#B8860B]"
        />
      </div>

      {/* 
        HEADER CONTAINER:
        - Animazione Framer Motion calibrata: scorrimento verticale fluido e presente (0.52s)
          senza scatti né restringimenti orizzontali invasivi.
      */}
      <motion.header
        initial={false}
        animate={{
          y: isVisible ? "0%" : "-118%",
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          y: {
            duration: isVisible ? 0.46 : 0.54,
            ease: [0.22, 1, 0.36, 1],
          },
          opacity: {
            duration: isVisible ? 0.32 : 0.44,
            delay: isVisible ? 0 : 0.06,
            ease: [0.22, 1, 0.36, 1],
          },
        }}
        className={`fixed z-50 bg-[#F8F7F4]/95 backdrop-blur-md border border-[#E8E2D5] transition-[box-shadow,border-color,background-color] duration-300
          /* Geometria Mobile: Isola Volante */
          top-[calc(env(safe-area-inset-top,0px)+0.75rem)] left-3.5 right-3.5 sm:left-6 sm:right-6 rounded-sm
          /* Geometria Desktop: Classica Piena Larghezza */
          lg:top-0 lg:left-0 lg:right-0 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:border-b
          ${!isVisible ? "pointer-events-none" : ""}
          ${
            scrolled
              ? "shadow-lg shadow-[#0B1E36]/8 border-[#D8CFC0] lg:shadow-sm lg:shadow-[#0B1E36]/5"
              : "shadow-md shadow-black/5 lg:shadow-none"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-2.5 sm:py-3 lg:py-3.5 flex items-center justify-between">
          {/* Logo Tipografico Ufficiale */}
          <Link
            href="/"
            onClick={() => {
              if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded-xs"
            aria-label="TechPYRE · Torna alla pagina iniziale"
          >
            <TechPyreLogo size="md" />
          </Link>

          {/* Link di Navigazione Desktop */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10" aria-label="Navigazione principale">
            {navigation.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`text-[13px] font-sans font-medium tracking-wide transition-colors relative py-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded-xs ${
                  isActive(link.href) ? "text-[#0B1E36]" : "text-[#5A6270] hover:text-[#0B1E36]"
                }`}
              >
                <span>{link.label}</span>
                <span
                  className={`absolute bottom-0 left-0 h-[2px] bg-[#B8860B] transition-[width] duration-300 group-hover:w-full ${
                    isActive(link.href) ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* CTA Desktop & Hamburger Mobile */}
          <div className="flex items-center gap-3">
            {/* CTA Desktop (Solo da 1024px in su) */}
            <div className="hidden lg:block">
              <Button
                href={navigation.cta.href}
                variant="primary"
                withShimmer={true}
                className="text-xs px-5 py-2.5 font-bold"
              >
                <span>{navigation.cta.label}</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Pulsante Hamburger Mobile Touch-Friendly (min 44x44px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-11 h-11 flex items-center justify-center text-[#0B1E36] hover:text-[#B8860B] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded-xs cursor-pointer"
              aria-label={mobileMenuOpen ? "Chiudi menu di navigazione" : "Apri menu di navigazione"}
              aria-expanded={mobileMenuOpen}
            >
              <div className="w-5 h-4 flex flex-col justify-between items-end">
                <span
                  className={`h-[2px] bg-current transition-transform duration-300 origin-center ${
                    mobileMenuOpen ? "w-5 rotate-45 translate-y-1.5" : "w-5"
                  }`}
                />
                <span
                  className={`h-[2px] bg-current transition-opacity duration-200 ${
                    mobileMenuOpen ? "opacity-0" : "w-3.5"
                  }`}
                />
                <span
                  className={`h-[2px] bg-current transition-transform duration-300 origin-center ${
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
      </motion.header>

      {/* 
        FLOATING QUICK NAV (SOLO SU MOBILE) IN BASSO A SINISTRA
        - 3 link semantici per Servizi, Progetti, Studio
        - Navigazione standard Next.js <Link>, scroll to top se già sulla pagina
      */}
      <nav
        aria-label="Navigazione rapida pagine"
        className={`fixed bottom-5 left-4 z-40 lg:hidden flex items-center gap-1.5 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {[
          { href: "/servizi", label: "Servizi", Icon: ServicesIcon },
          { href: "/progetti", label: "Progetti", Icon: ProjectsIcon },
          { href: "/studio", label: "Studio", Icon: StudioIcon },
        ].map(({ href, label, Icon }) => {
          const isCurrent = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => {
                if (isCurrent) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              aria-label={label}
              aria-current={isCurrent ? "page" : undefined}
              className={`w-11 h-11 flex flex-col items-center justify-center rounded-sm backdrop-blur-md shadow-xl shadow-black/25 cursor-pointer active:scale-95 transition-[color,background-color,border-color,transform] duration-200 relative ${
                isCurrent
                  ? "bg-[#0A192F] border-2 border-[#C5A059] text-[#C5A059]"
                  : "bg-[#0A192F]/90 border border-white/15 text-white hover:border-[#C5A059]/40"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 transition-colors ${
                  isCurrent ? "text-[#C5A059]" : "text-[#CBD7E3]"
                }`}
              />
              <span
                className={`text-[8px] font-sans font-semibold mt-0.5 leading-none transition-colors ${
                  isCurrent ? "text-[#C5A059]" : "text-[#CBD7E3]"
                }`}
              >
                {label}
              </span>
              {isCurrent && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C5A059] shadow-xs" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 
        FLOATING ACTION BUTTON (SOLO SU MOBILE) IN BASSO A DESTRA
      */}
      <div
        className={`fixed bottom-5 right-4 z-40 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <Link
          href="/#contatto"
          aria-label="Richiedi incontro di 30 minuti"
          className="inline-flex rounded-sm bg-[#0A192F] hover:bg-[#142944] border border-[#C5A059]/60 text-white px-3.5 py-3 items-center gap-2 font-sans font-bold text-xs tracking-wide min-h-[44px] shadow-xl shadow-black/30 active:scale-95 transition-all group cursor-pointer"
        >
          <CalendarIcon className="w-4 h-4 text-[#C5A059] shrink-0" />
          <span className="whitespace-nowrap">Diagnosi 30m</span>
          <ArrowRightIcon className="w-3.5 h-3.5 text-[#C5A059] shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* MENU MOBILE POPOVER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-[calc(env(safe-area-inset-top,0px)+3.85rem)] right-3.5 sm:right-6 w-60 sm:w-64 bg-white/98 backdrop-blur-xl rounded-sm border border-[#E8E2D5] shadow-2xl z-50 p-2.5 space-y-1.5"
            >
              <div className="flex items-center justify-between px-2 py-1 text-[9px] font-sans font-bold uppercase tracking-widest text-[#B8860B] border-b border-[#E8E2D5]/70">
                <span>Navigazione</span>
                <span className="text-[#5A6270] font-serif font-semibold">TechPyre</span>
              </div>

              <nav className="flex flex-col space-y-0.5" aria-label="Menu mobile">
                {navigation.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive(link.href) ? "page" : undefined}
                    className={`flex items-center justify-between px-2.5 py-2.5 rounded-xs text-xs font-serif transition-colors ${
                      isActive(link.href)
                        ? "bg-[#0B1E36]/5 text-[#B8860B] font-bold"
                        : "text-[#0B1E36] hover:bg-[#F8F7F4] hover:text-[#B8860B]"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRightIcon className="w-3 h-3 text-[#5A6270]" />
                  </Link>
                ))}
              </nav>

              <div className="pt-1.5 border-t border-[#E8E2D5]/70">
                <Link
                  href={navigation.cta.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-3 rounded-xs bg-[#0B1E36] hover:bg-[#B8860B] text-white text-[11px] font-sans font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{navigation.cta.label}</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
