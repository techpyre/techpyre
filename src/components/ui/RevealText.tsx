"use client";

import React from "react";
import { motion } from "framer-motion";

interface RevealTextProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export default function RevealText({
  children,
  delay = 0,
  className = "",
  as: Component = "div",
}: RevealTextProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.75,
          delay,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <Component>{children}</Component>
      </motion.div>
    </div>
  );
}
