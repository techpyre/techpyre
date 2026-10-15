"use client";

import React from "react";

interface SignatureProps {
  name?: string;
  role?: string;
  className?: string;
}

export default function Signature({
  name = "Riccardo Granza",
  role = "Fondatore · Lead Software Engineer",
  className = "",
}: SignatureProps) {
  return (
    <div className={`space-y-2 pt-2 ${className}`}>
      {/* Firma Autografa Vettoriale sobria e autentica */}
      <div className="relative w-48 h-11 text-[#C5A059]">
        <svg
          className="w-full h-full"
          viewBox="0 0 240 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M10 45 C35 15, 45 5, 55 25 C65 45, 60 50, 75 35 C90 20, 110 30, 130 25 C145 22, 160 38, 175 28 C190 20, 205 32, 230 18"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25 35 C50 42, 90 40, 140 36 C170 34, 210 38, 235 30"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
        </svg>
      </div>

      <div className="border-t border-white/15 pt-2">
        <div className="font-serif text-lg font-semibold text-white tracking-wide">
          {name}
        </div>
        <div className="text-[11px] font-sans text-[#A4B3C6] uppercase tracking-wider">
          {role}
        </div>
      </div>
    </div>
  );
}
