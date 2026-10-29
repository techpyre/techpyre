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

    const handleScrollUpdate = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      // Se il menu a schermo intero è aperto, mantieni sempre visibile
      if (mobileMenuOpen) {
        setIsVisible(true);
        return;
      }

      // Nei primi 90px della pagina rimane sempre visibile
      if (currentScrollY <= 90) {
        setIsVisible(true);
        lastScrollY = Math.max(0, currentScrollY);
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
      {/* 
        HEADER CONTAINER:
        - Su Mobile: Barra volante essenziale (Logo + Hamburger)
        - Su Desktop: Barra classica a piena larghezza con CTA inclusa
      */}
      <header
        className={`fixed z-50 bg-[#F8F7F4] border border-[#E8E2D5] transition-[transform,opacity,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] 
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
          <Link
            href="/"
            onClick={() => {
              if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] rounded-xs"
            aria-label="TechPYRE — Torna alla pagina iniziale"
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
      </header>

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
          className="relative inline-flex p-[1.5px] rounded-sm overflow-hidden group cursor-pointer shadow-xl shadow-black/30 active:scale-95 transition-transform"
        >
          {/* Bordo sbrilluccicoso rotante */}
          <span
            aria-hidden="true"
            className="absolute inset-[-150%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_250deg,#C5A059_300deg,#FFFFFF_340deg,#B8860B_360deg)] animate-[spin_3s_linear_infinite] motion-reduce:animate-none pointer-events-none"
          />

          {/* Corpo del FAB mobile */}
          <div className="relative z-10 bg-[#0A192F] text-white px-3.5 py-3 rounded-[1px] flex items-center gap-2 font-sans font-bold text-xs tracking-wide min-h-[44px]">
            <CalendarIcon className="w-4 h-4 text-[#C5A059] shrink-0" />
            <span className="whitespace-nowrap">Incontro 30m</span>
            <ArrowRightIcon className="w-3.5 h-3.5 text-[#C5A059] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
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
              <div className="flex items-center justify-between px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-[#B8860B] border-b border-[#E8E2D5]/70">
                <span>Navigazione</span>
                <span className="text-[#5A6270] font-sans font-normal">TechPYRE</span>
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
