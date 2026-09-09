"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Sottoscrizione standard al media query per rilevare touch screen senza setState
function subscribeTouch(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(pointer: coarse)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getTouchSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(pointer: coarse)").matches;
}

function getTouchServerSnapshot(): boolean {
  return true; // Su SSR si assume touch attivo per prevenire sfarfallii
}

export default function CustomCursor() {
  const isTouchDevice = useSyncExternalStore(
    subscribeTouch,
    getTouchSnapshot,
    getTouchServerSnapshot
  );

  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  const [cursorText, setCursorText] = useState<string>("");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  // Gestione classe su <body> senza setState
  useEffect(() => {
    if (isTouchDevice) return;
    document.body.classList.add("has-custom-cursor");
    return () => {
      document.body.classList.remove("has-custom-cursor");
    };
  }, [isTouchDevice]);

  // Listener del puntatore
  useEffect(() => {
    if (isTouchDevice) return;

    const handlePointerMove = (e: PointerEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisible) {
        setIsVisible(true);
        ringPos.current.x = e.clientX;
        ringPos.current.y = e.clientY;
      }

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const handlePointerOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest<HTMLElement>(
        "a, button, [role='button'], [data-cursor], input, textarea"
      );

      if (interactive) {
        setIsHovered(true);
        const text = interactive.getAttribute("data-cursor") || "";
        setCursorText(text);
      } else {
        setIsHovered(false);
        setCursorText("");
      }
    };

    // Fix TypeScript: si usa solo standard e.relatedTarget senza toElement
    const handlePointerLeaveDoc = (e: PointerEvent) => {
      if (!e.relatedTarget) {
        setIsVisible(false);
      }
    };

    const handlePointerEnterDoc = () => {
      setIsVisible(true);
    };

    const handleWindowBlur = () => {
      setIsVisible(false);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mouseover", handlePointerOver, { passive: true });
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("pointerleave", handlePointerLeaveDoc);
    document.addEventListener("pointerenter", handlePointerEnterDoc);

    // Render loop a 60fps con lerp
    let rafId: number;
    const updateRing = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.2;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.2;

      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafId = requestAnimationFrame(updateRing);
    };

    rafId = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mouseover", handlePointerOver);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("pointerleave", handlePointerLeaveDoc);
      document.removeEventListener("pointerenter", handlePointerEnterDoc);
      cancelAnimationFrame(rafId);
    };
  }, [isTouchDevice, isVisible]);

  if (isTouchDevice) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* Centro solido */}
      <div
        ref={cursorDotRef}
        className={`fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#C49A58] transition-transform duration-100 ${
          isHovered ? "scale-0" : "scale-100"
        }`}
      />

      {/* Anello esterno ergonomico */}
      <div
        ref={cursorRingRef}
        className={`fixed top-0 left-0 rounded-full flex items-center justify-center transition-[width,height,background-color,border-color] duration-200 ease-out ${
          isHovered
            ? cursorText
              ? "w-20 h-20 bg-[#26221E]/80 border border-[#C49A58]/50 backdrop-blur-xs"
              : "w-11 h-11 bg-[#C26749]/20 border border-[#C26749]/60"
            : "w-8 h-8 bg-transparent border border-[#F5F3EF]/30"
        }`}
      >
        {cursorText && (
          <span className="text-[9px] font-mono tracking-widest uppercase text-[#F5F3EF] px-1 text-center font-medium">
            {cursorText}
          </span>
        )}
      </div>
    </div>
  );
}
