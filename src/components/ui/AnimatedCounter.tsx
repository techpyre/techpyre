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
 * - SSR Fallback: Renderizza il valore target reale nel markup statico
 *   (es. 100 / 100, 100% Tua, < 2 Ore) per crawler, no-JS e SEO audit
 * - Client Hydration: Avvia l'incremento fluido da 0 a target solo al
 *   primo ingresso nella viewport (useInView) senza mai esporre "0" in SSR
 * =====================================================================
 */
export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, {
    damping: 32,
    stiffness: 85,
  });
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Solo dopo il mount sul client e quando entra in viewport:
    // avviamo l'animazione da 0 a value per un effetto reattivo
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      motionValue.set(0);
      const frameId = requestAnimationFrame(() => {
        motionValue.set(value);
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current && hasAnimated.current) {
        ref.current.textContent = `${prefix}${Math.round(latest)}${suffix}`;
      }
    });
    return () => unsubscribe();
  }, [springValue, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value}{suffix}
    </span>
  );
}
