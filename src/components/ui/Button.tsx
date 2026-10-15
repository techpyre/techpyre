"use client";

import React from "react";
import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "gold" | "outline";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  withShimmer?: boolean;
}

/**
 * =====================================================================
 * COMPONENTE BOTTONE ISTITUZIONALE
 * - Bordo brillante sbrilluccicoso (Border Beam) rotante per CTA principali
 * - Stile secondario sobrio ed elegante, privo di effetti di riempimento invasivi
 * - Transizioni nitide e ponderate
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
  withShimmer,
}: ButtonProps) {
  // Il bordo sbrilluccicoso è attivo per la variante primaria e gold
  const hasShimmer =
    withShimmer !== undefined ? withShimmer : variant === "primary" || variant === "gold";

  const isShimmerActive = hasShimmer && !disabled;

  const variantStyles = {
    primary:
      "bg-[#0A192F] text-[#F8F7F4] hover:bg-[#002244] transition-colors duration-200",
    secondary:
      "bg-white text-[#0B1E36] border border-[#E8E2D5] hover:border-[#B8860B] hover:text-[#B8860B] hover:bg-[#F8F7F4] transition-all duration-200 shadow-xs",
    gold: "bg-[#B8860B] text-white hover:bg-[#9a7008] transition-colors duration-200",
    outline:
      "bg-transparent text-[#0A192F] border border-[#0A192F]/30 hover:border-[#0A192F] hover:bg-[#0A192F]/5 transition-colors duration-200",
  };

  const innerContent = isShimmerActive ? (
    <div className="relative inline-flex p-[1.5px] rounded-sm overflow-hidden group cursor-pointer transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]">
      {/* Bordo brillante sbrilluccicoso a fascio rotante continuo (1.5px netto) */}
      <span
        aria-hidden="true"
        className="absolute inset-[-150%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_260deg,#C5A059_310deg,#FFFFFF_345deg,#B8860B_360deg)] animate-[spin_3.5s_linear_infinite] pointer-events-none"
      />

      {/* Corpo del pulsante nitido */}
      <div
        className={`relative z-10 w-full h-full inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-sans font-semibold tracking-wide rounded-[1px] ${
          variantStyles[variant]
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      >
        <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
          {children}
        </span>
      </div>
    </div>
  ) : (
    <div
      className={`relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-sans font-semibold tracking-wide rounded-sm cursor-pointer group active:scale-[0.99] ${
        variantStyles[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2 whitespace-nowrap">
        {children}
      </span>
    </div>
  );

  // Link interni tra pagine (/servizi, /#contatto…) con navigazione client-side di Next.js
  if (href && href.startsWith("/")) {
    return (
      <Link href={href} className="inline-block" onClick={onClick}>
        {innerContent}
      </Link>
    );
  }

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
