"use client";

import React from "react";

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
 * COMPONENTE BOTTONE ISTITUZIONALE CON BORDO BRILLANTE ("BORDER BEAM")
 * - Fascio di luce dorata e diamante che viaggia con precisione lungo il
 *   perimetro del bordo di 1.5px (zero sfocature, zero disordine visivo)
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
  withShimmer,
}: ButtonProps) {
  // Il bordo brillante è attivo di default per le varianti primary e gold
  const hasShimmer =
    withShimmer !== undefined ? withShimmer : variant === "primary" || variant === "gold";

  const isShimmerActive = hasShimmer && !disabled;

  const variantStyles = {
    primary: "bg-[#0A192F] text-[#F8F7F4]",
    secondary: "bg-white text-[#14181F] border border-[#E8E2D5] hover:border-[#0A192F]",
    gold: "bg-[#B8860B] text-white",
    outline:
      "bg-transparent text-[#0A192F] border border-[#0A192F]/30 hover:border-[#0A192F] hover:bg-[#0A192F]/5",
  };

  const innerContent = isShimmerActive ? (
    <div className="relative inline-flex p-[1.5px] rounded-sm overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99]">
      {/* Bordo sbrilluccicoso a fascio rotante (Oro & Diamante, 1.5px netto) */}
      <span
        aria-hidden="true"
        className="absolute inset-[-150%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_260deg,#C5A059_310deg,#FFFFFF_345deg,#B8860B_360deg)] animate-[spin_3.5s_linear_infinite] pointer-events-none"
      />

      {/* Corpo del pulsante nitido e solido */}
      <div
        className={`relative z-10 w-full h-full inline-flex items-center justify-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-sans font-semibold tracking-wide rounded-[1px] overflow-hidden ${
          variantStyles[variant]
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      >
        {/* Testo in primo piano */}
        <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-0.5">
          {children}
        </span>

        {/* Riflesso fluido dal basso verso l'alto all'hover */}
        <span
          className="absolute inset-0 bg-[#C5A059]/15 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
        />
      </div>
    </div>
  ) : (
    <div
      className={`relative inline-flex items-center justify-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-sans font-semibold tracking-wide rounded-sm transition-all group cursor-pointer ${
        variantStyles[variant]
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-0.5">
        {children}
      </span>
      <span
        className="absolute inset-0 bg-[#C5A059]/15 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
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
