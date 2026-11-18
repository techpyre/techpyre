"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";

interface DemoOwnerBarProps {
  slug: string;
  companyName: string;
}

const FOUNDER_PHONE_DISPLAY =
  process.env.NEXT_PUBLIC_CONTACT_PHONE || "+39 379 115 9352";
const FOUNDER_PHONE_DIGITS = FOUNDER_PHONE_DISPLAY.replace(/[^\d]/g, "");
const FOUNDER_NAME =
  process.env.NEXT_PUBLIC_FOUNDER_NAME || "Riccardo Granza";

export default function DemoOwnerBar({ slug, companyName }: DemoOwnerBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const trackOwnerAction = (eventType: string) => {
    try {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          companyName,
          eventType,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {}
  };

  const whatsappText = encodeURIComponent(
    `Ciao ${FOUNDER_NAME.split(" ")[0]}, ho appena visto la demo preparata per ${companyName} e vorrei capire come funziona.`
  );
  const whatsappHref = `https://wa.me/${FOUNDER_PHONE_DIGITS}?text=${whatsappText}`;

  return (
    <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-5 sm:bottom-5 z-40 max-w-md">
      <div className="rounded-xl bg-[#101214]/95 backdrop-blur-md text-zinc-100 border border-zinc-700/80 shadow-2xl px-3.5 py-2.5 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider truncate">
            Bozza riservata · {companyName}
          </p>
          <p className="text-xs text-zinc-300 truncate">
            Vuoi attivarla o personalizzarla? Scrivici su WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOwnerAction("owner_whatsapp_click")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors"
            title="Scrivici direttamente su WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Scrivici su WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Chiudi barra"
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
