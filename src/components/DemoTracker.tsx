"use client";

import { useEffect } from "react";

interface DemoTrackerProps {
  slug: string;
  companyName: string;
}

export default function DemoTracker({ slug, companyName }: DemoTrackerProps) {
  useEffect(() => {
    try {
      // Evita doppi ping istantanei nella stessa sessione di navigazione
      const sessionKey = `tp_session_visit_${slug}`;
      const alreadyTrackedThisSession = sessionStorage.getItem(sessionKey);

      const firstVisitKey = `tp_lead_first_${slug}`;
      const isFirstVisit = !localStorage.getItem(firstVisitKey);
      if (isFirstVisit) {
        localStorage.setItem(firstVisitKey, new Date().toISOString());
      }

      if (!alreadyTrackedThisSession) {
        sessionStorage.setItem(sessionKey, "1");

        const payload = {
          slug,
          companyName,
          referrer: document.referrer || "diretto / link email",
          screenWidth: window.innerWidth || screen.width,
          screenHeight: window.innerHeight || screen.height,
          isFirstVisit,
        };

        // Usa fetch asincrono non bloccante con keepalive
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {
          // Ignora silenziosamente eventuali errori di rete per non disturbare l'utente
        });
      }
    } catch {
      // Fail-safe in caso di storage bloccato da impostazioni browser
    }
  }, [slug, companyName]);

  return null;
}
