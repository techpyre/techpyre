"use client";

import React, { useState, useEffect, useRef } from "react";

interface AdaptiveLogoProps {
  src: string;
  alt: string;
  className?: string;
  headerBgMode?: "light" | "dark" | "adaptive";
  logoBrightness?: "dark" | "light";
  fallbackName?: string;
  onContrastDetected?: (isLightLogo: boolean) => void;
}

export default function AdaptiveLogo({
  src,
  alt,
  className = "h-10 w-auto object-contain",
  headerBgMode = "light",
  logoBrightness,
  fallbackName,
  onContrastDetected,
}: AdaptiveLogoProps) {
  const [hasError, setHasError] = useState(false);
  // Inizializza con la prop se presente, ma consentiamo all'analisi pixel di correggere
  const [isLightLogo, setIsLightLogo] = useState<boolean>(logoBrightness === "light");
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (logoBrightness === "light") {
      setIsLightLogo(true);
      onContrastDetected?.(true);
    }
  }, [logoBrightness, onContrastDetected]);

  // Analizza i pixel reali dell'immagine per rilevare elementi bianchi/chiari su sfondo trasparente
  const handleImageLoad = () => {
    try {
      const img = imgRef.current;
      if (!img || img.naturalWidth === 0) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Campiona a 64x32 per accuratezza e leggerezza
      const sampleWidth = Math.min(64, img.naturalWidth);
      const sampleHeight = Math.min(32, img.naturalHeight);
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;

      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
      const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;

      let totalLum = 0;
      let visiblePixels = 0;
      let whitePixels = 0;
      let transparentPixels = 0;

      for (let i = 0; i < imgData.length; i += 4) {
        const a = imgData[i + 3];
        if (a < 35) {
          transparentPixels++;
        } else {
          visiblePixels++;
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          totalLum += lum;
          if (lum > 0.82) {
            whitePixels++;
          }
        }
      }

      if (visiblePixels > 0) {
        const avgLum = totalLum / visiblePixels;
        const whiteRatio = whitePixels / visiblePixels;
        const isTransparent = transparentPixels / (sampleWidth * sampleHeight) > 0.15;

        // Rileva come "light" (cioè necessita sfondo scuro) se:
        // 1. Ha elementi bianchi (>12%) su trasparenza (es. scritte/cornici bianche)
        // 2. Oppure la luminanza media supera 0.60
        const detectedLight = (isTransparent && whiteRatio > 0.12) || avgLum > 0.60;

        if (detectedLight) {
          setIsLightLogo(true);
          onContrastDetected?.(true);
        } else if (logoBrightness !== "light") {
          setIsLightLogo(false);
          onContrastDetected?.(false);
        }
      }
    } catch {
      // In caso di limitazioni browser/CORS locali, mantieni fallback
    }
  };

  if (hasError || !src) {
    return (
      <span className="font-[family-name:var(--font-jakarta)] font-extrabold text-lg sm:text-xl text-zinc-900 tracking-tight">
        {fallbackName || alt}
      </span>
    );
  }

  // Se l'header è scuro, il logo con elementi chiari risalta già magnificamente.
  // Se invece l'header è chiaro e il logo contiene elementi bianchi/chiari,
  // incapsuliamo il logo in un contenitore scuro ad alto contrasto per non renderli invisibili.
  const needsContrastPill = isLightLogo && headerBgMode !== "dark";

  if (needsContrastPill) {
    return (
      <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-zinc-950/95 border border-zinc-800 shadow-sm transition-all duration-200">
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          crossOrigin="anonymous"
          onLoad={handleImageLoad}
          onError={() => setHasError(true)}
          className={`${className} filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]`}
        />
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      crossOrigin="anonymous"
      onLoad={handleImageLoad}
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
