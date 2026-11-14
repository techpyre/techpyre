"use client";

import React from "react";

interface TechPyreLogoProps {
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export default function TechPyreLogo({
  className = "",
  variant = "light",
  size = "md",
}: TechPyreLogoProps) {
  const sizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  const isDark = variant === "dark";

  return (
    <div
      className={`inline-flex items-baseline font-sans font-extrabold tracking-tight select-none ${sizeClasses[size]} ${className}`}
    >
      <span className={isDark ? "text-white" : "text-[#14181F]"}>
        Tech
      </span>
      <span className="text-[#B8860B]">
        PYRE
      </span>
    </div>
  );
}
