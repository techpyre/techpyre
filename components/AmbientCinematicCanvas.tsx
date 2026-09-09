"use client";

import React, { useEffect, useRef } from "react";

export default function AmbientCinematicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;

    const mouse = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
    };

    const handlePointerMove = (e: PointerEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);

    const startTime = performance.now();

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.0003; // Progressione lenta e organica nel tempo

      // Inerzia fluida del puntatore
      mouse.x += (mouse.targetX - mouse.x) * 0.035;
      mouse.y += (mouse.targetY - mouse.y) * 0.035;

      // Sfondo solido: Basalto minerale caldo
      ctx.fillStyle = "#151413";
      ctx.fillRect(0, 0, width, height);

      // --- SORGENTE 1: Evoluzione temporale autonoma (La luce che gira durante il giorno) ---
      const sunCycleX = width * 0.5 + Math.cos(elapsed * 0.7) * (width * 0.35);
      const sunCycleY = height * 0.45 + Math.sin(elapsed * 0.5) * (height * 0.25);
      const sunRadius = Math.min(width, height) * 0.65;

      // Tonalità calda minerale modulata dal tempo
      const timeGrad = ctx.createRadialGradient(
        sunCycleX,
        sunCycleY,
        0,
        sunCycleX,
        sunCycleY,
        sunRadius
      );
      // Variazione continua e impercettibile tra ocra e terracotta calda
      const redVal = Math.floor(190 + Math.sin(elapsed) * 15);
      const greenVal = Math.floor(110 + Math.cos(elapsed * 0.8) * 15);
      const blueVal = 70;

      timeGrad.addColorStop(0, `rgba(${redVal}, ${greenVal}, ${blueVal}, 0.09)`);
      timeGrad.addColorStop(0.55, `rgba(${redVal - 30}, ${greenVal - 20}, ${blueVal}, 0.03)`);
      timeGrad.addColorStop(1, "transparent");

      ctx.fillStyle = timeGrad;
      ctx.beginPath();
      ctx.arc(sunCycleX, sunCycleY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // --- SORGENTE 2: Reattività gentile del Cursore (Diffusione tattile) ---
      const mouseRadius = Math.min(width, height) * 0.5;
      const mouseGrad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        mouseRadius
      );
      mouseGrad.addColorStop(0, "rgba(196, 154, 88, 0.07)"); // Ocra dorata
      mouseGrad.addColorStop(0.5, "rgba(194, 103, 73, 0.025)"); // Terracotta
      mouseGrad.addColorStop(1, "transparent");

      ctx.fillStyle = mouseGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, mouseRadius, 0, Math.PI * 2);
      ctx.fill();

      // --- SORGENTE 3: Ombra terrosa inferiore fissa (Contrasto e leggibilità testi) ---
      const bottomGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
      bottomGrad.addColorStop(0, "transparent");
      bottomGrad.addColorStop(1, "rgba(17, 16, 15, 0.45)");
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, height * 0.6, width, height * 0.4);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 h-full w-full opacity-100"
    />
  );
}
