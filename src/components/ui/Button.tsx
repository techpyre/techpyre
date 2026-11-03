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
 * - Stile sobrio, solido e umano (ispirato al Private Banking tradizionale)
 * - Zero fasci luminosi rotanti o pattern artificiali da template AI
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
}: ButtonProps) {
  const variantStyles = {
    primary:
      "bg-[#0B1E36] text-[#F8F7F4] border border-[#0B1E36] hover:bg-[#142944] shadow-2xs transition-colors duration-200",
    secondary:
      "bg-white text-[#0B1E36] border border-[#E8E2D5] hover:border-[#B8860B] hover:text-[#B8860B] hover:bg-[#F8F7F4] transition-colors duration-200 shadow-2xs",
    gold: "bg-[#B8860B] text-white border border-[#B8860B] hover:bg-[#9a7008] shadow-2xs transition-colors duration-200",
    outline:
      "bg-transparent text-[#0A192F] border border-[#0A192F]/30 hover:border-[#0A192F] hover:bg-[#0A192F]/5 transition-colors duration-200",
  };

  const innerContent = (
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
      <Link
        href={href}
        className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-2"
        onClick={onClick}
      >
        {innerContent}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className="inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-2"
        onClick={onClick}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-block bg-transparent p-0 border-0 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B] focus-visible:ring-offset-2"
    >
      {innerContent}
    </button>
  );
}
