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
  const [isLightLogo, setIsLightLogo] = useState<boolean>(logoBrightness === "light");
  const [hasWhiteCanvasBg, setHasWhiteCanvasBg] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (logoBrightness === "light") {
      setIsLightLogo(true);
      onContrastDetected?.(true);
    } else if (logoBrightness === "dark") {
      setIsLightLogo(false);
      onContrastDetected?.(false);
    }
  }, [logoBrightness, onContrastDetected]);

  // Analizza i pixel reali dell'immagine per rilevare elementi bianchi su trasparenza vs canvas bianco pieno
  const handleImageLoad = () => {
    try {
      const img = imgRef.current;
      if (!img || img.naturalWidth === 0) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const sampleWidth = Math.min(64, img.naturalWidth);
      const sampleHeight = Math.min(32, img.naturalHeight);
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;

      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
      const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;

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
          if (lum > 0.85) {
            whitePixels++;
          }
        }
      }

      const total = sampleWidth * sampleHeight;
      const transRatio = transparentPixels / total;
      const isTransparent = transRatio > 0.15;
      const whiteRatio = visiblePixels > 0 ? (whitePixels / visiblePixels) : 0;

      // Se l'immagine NON è trasparente ma prevalentemente bianca (es. logo con canvas bianco),
      // è un'immagine con sfondo bianco solido. Su header chiaro applichiamo mix-blend-multiply per fonderla al 100%.
      if (!isTransparent && whiteRatio > 0.60) {
        setHasWhiteCanvasBg(true);
        setIsLightLogo(false);
        onContrastDetected?.(false);
        return;
      }

      // È un logo chiaro (che necessita sfondo scuro) SOLO SE ha elementi bianchi su sfondo trasparente
      const detectedLight = isTransparent && whiteRatio > 0.15;

      if (detectedLight) {
        setIsLightLogo(true);
        onContrastDetected?.(true);
      } else if (logoBrightness !== "light") {
        setIsLightLogo(false);
        onContrastDetected?.(false);
      }
    } catch {
      // Fallback
    }
  };

  if (hasError || !src) {
    return (
      <span className="font-[family-name:var(--font-jakarta)] font-extrabold text-lg sm:text-xl text-zinc-900 tracking-tight">
        {fallbackName || alt}
      </span>
    );
  }

  // Se l'header è scuro e il logo ha elementi bianchi su trasparenza, si legge già benissimo.
  // Se l'header è chiaro ma il logo ha elementi bianchi su trasparenza (es. scritte bianche),
  // inseriamo il pill scuro.
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
      className={`${className} ${hasWhiteCanvasBg && headerBgMode !== "dark" ? "mix-blend-multiply" : ""}`}
    />
  );
}
