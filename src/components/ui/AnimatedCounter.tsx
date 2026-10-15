"use client";

import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * =====================================================================
 * COMPONENTE ANIMATED COUNTER
 * Incrementa dinamicamente un valore numerico quando entra nella viewport.
 * Trasmette precisione ingegneristica e dinamismo senza pesare sul rendering.
 * =====================================================================
 */
export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 35,
    stiffness: 90,
  });
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
      }
    });
    return () => unsubscribe();
  }, [springValue, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
