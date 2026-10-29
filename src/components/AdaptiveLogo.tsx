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

  // Se non specificato esplicitamente, analizza il contrasto reale dell'immagine caricata
  const handleImageLoad = () => {
    if (logoBrightness) return; // Priorità alla configurazione salvata

    try {
      const img = imgRef.current;
      if (!img || img.naturalWidth === 0) return;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Campiona a risoluzione ridotta per efficienza
      const sampleWidth = Math.min(64, img.naturalWidth);
      const sampleHeight = Math.min(32, img.naturalHeight);
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;

      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
      const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;

      let totalLum = 0;
      let visiblePixels = 0;

      for (let i = 0; i < imgData.length; i += 4) {
        const a = imgData[i + 3];
        // Considera solo pixel non trasparenti
        if (a > 35) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          // Formula standard di luminanza percepita
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          totalLum += lum;
          visiblePixels++;
        }
      }

      if (visiblePixels > 0) {
        const avgLum = totalLum / visiblePixels;
        // Se la luminanza media dei pixel visibili supera 0.60, il logo è prevalentemente chiaro/bianco
        const detectedLight = avgLum > 0.60;
        setIsLightLogo(detectedLight);
        onContrastDetected?.(detectedLight);
      }
    } catch {
      // In caso di limitazioni CORS locali, mantieni fallback
    }
  };

  if (hasError || !src) {
    return (
      <span className="font-[family-name:var(--font-jakarta)] font-extrabold text-lg sm:text-xl text-zinc-900 tracking-tight">
        {fallbackName || alt}
      </span>
    );
  }

  // Se l'header è in modalità scura, il logo chiaro è già perfetto.
  // Se invece l'header è chiaro e il logo è chiaro/bianco, incapsuliamo il logo in un contenitore ad alto contrasto.
  const needsContrastPill = isLightLogo && headerBgMode !== "dark";

  if (needsContrastPill) {
    return (
      <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-zinc-950/95 border border-zinc-800 shadow-sm transition-all duration-200">
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          crossOrigin="anonymous"
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
