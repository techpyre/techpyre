"use client";

import React from "react";
import { motion } from "framer-motion";

interface AnimatedLineProps {
  className?: string;
  direction?: "horizontal" | "vertical";
  variant?: "light" | "dark" | "gold";
}

export default function AnimatedLine({
  className = "",
  direction = "horizontal",
  variant = "light",
}: AnimatedLineProps) {
  const variantColors = {
    light: "bg-[#E8E2D5]",
    dark: "bg-white/10",
    gold: "bg-[#C5A059]",
  };

  const isHorizontal = direction === "horizontal";

  return (
    <motion.div
      initial={isHorizontal ? { scaleX: 0, originX: 0 } : { scaleY: 0, originY: 0 }}
      whileInView={isHorizontal ? { scaleX: 1, originX: 0 } : { scaleY: 1, originY: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className={`${isHorizontal ? "h-[1px] w-full" : "w-[1px] h-full"} ${
        variantColors[variant]
      } ${className}`}
    />
  );
}
