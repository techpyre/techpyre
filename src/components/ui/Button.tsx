"use client";

import React from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "gold" | "outline";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  withGlow?: boolean;
}

/**
 * =====================================================================
 * COMPONENTE BOTTONE ISTITUZIONALE CON AMBIENT GLOW
 * - Sottile bagliore dorato istituzionale ("Quiet Luxury Glow") sui pulsanti d'azione
 * - Riempimento fluido all'hover e micro-interazione al tocco
 * =====================================================================
 */
export default function Button({
  children,
  onClick,
  href,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  withGlow,
}: ButtonProps) {
  // Il glow è attivo di default per le varianti primary e gold, oppure se esplicitamente richiesto
  const hasGlow = withGlow !== undefined ? withGlow : variant === "primary" || variant === "gold";

  const variantStyles = {
    primary:
      "bg-[#0A192F] text-[#F8F7F4] border border-[#C5A059]/60 hover:border-[#C5A059] shadow-sm",
    secondary:
      "bg-white text-[#14181F] border border-[#E8E2D5] hover:border-[#0A192F] shadow-xs",
    gold:
      "bg-[#B8860B] text-white border border-[#B8860B] hover:bg-[#A07408] shadow-sm",
    outline:
      "bg-transparent text-[#0A192F] border border-[#0A192F]/30 hover:border-[#0A192F] hover:bg-[#0A192F]/5",
  };

  const innerContent = (
    <div
      className={`relative inline-flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-sans font-semibold tracking-wide rounded-sm transition-all group cursor-pointer ${
        variantStyles[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {/* Bagliore dorato sobrio ed elegante ("Quiet Luxury Glow") che invita all'azione */}
      {hasGlow && !disabled && (
        <span
          aria-hidden="true"
          className="absolute -inset-[1.5px] rounded-sm bg-gradient-to-r from-[#B8860B]/40 via-[#C5A059]/70 to-[#B8860B]/40 blur-[4px] opacity-75 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 animate-pulse"
          style={{ animationDuration: "3.5s" }}
        />
      )}

      {/* Testo in primo piano */}
      <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-0.5">
        {children}
      </span>

      {/* Riempimento fluido dal basso verso l'alto all'hover */}
      <span
        className="absolute inset-0 bg-[#C5A059]/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
      />
    </div>
  );

  if (href) {
    return (
      <a href={href} className="inline-block" onClick={onClick}>
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-block bg-transparent p-0 border-0 cursor-pointer focus:outline-none"
    >
      {innerContent}
    </button>
  );
}
