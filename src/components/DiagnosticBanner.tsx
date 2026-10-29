"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { LeadConfig } from "@/types/lead";

interface DiagnosticBannerProps {
  data: LeadConfig;
}

export default function DiagnosticBanner({ data }: DiagnosticBannerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#18181B] text-zinc-200 border-b border-zinc-800 sticky top-0 z-50 text-xs">
      <div className="demo-container py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium text-[11px]">
            Anteprima riservata
          </span>
          <span className="font-semibold text-white">
            {data.meta.companyName}
          </span>
          <span className="hidden sm:inline text-zinc-500">·</span>
          <span className="hidden sm:inline text-zinc-400">
            Per {data.meta.decisionMakerName}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-zinc-400">
              Pagina attuale:{" "}
              <strong className="text-amber-400 font-semibold">
                {data.audit.originalLcpSeconds}s
              </strong>
            </span>
            <span className="text-zinc-600">→</span>
            <span className="text-zinc-300">
              Questa versione:{" "}
              <strong className="text-emerald-400 font-semibold">
                0.3s
              </strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors text-[11px] font-medium cursor-pointer"
          >
            <span>Note sull&apos;analisi ({data.audit.threeCriticalFlaws.length})</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="bg-zinc-900 border-t border-zinc-800 py-5 text-xs">
          <div className="demo-container grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 space-y-2">
              <div className="text-zinc-400 font-medium">
                Inserzione attiva collegata a questa pagina
              </div>
              <p className="text-white font-semibold text-sm leading-snug">
                &ldquo;{data.audit.activeAdHeadline}&rdquo;
              </p>
              <p className="text-zinc-400 leading-relaxed">
                {data.audit.activeAdCopySummary}
              </p>
            </div>

            <div className="md:col-span-7 space-y-2 md:border-l md:border-zinc-800 md:pl-6">
              <div className="text-zinc-400 font-medium">
                3 aspetti migliorati rispetto alla pagina attuale
              </div>
              <ol className="space-y-2 text-zinc-300 list-decimal list-inside">
                {data.audit.threeCriticalFlaws.map((flaw, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {flaw}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
