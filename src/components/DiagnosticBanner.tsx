"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LeadConfig } from "@/types/lead";

interface DiagnosticBannerProps {
  data: LeadConfig;
}

export default function DiagnosticBanner({ data }: DiagnosticBannerProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#101214] text-zinc-200 border-b border-zinc-800/90 sticky top-0 z-50 text-xs font-sans">
      {/* Versione Mobile Compatta (Riga Singola Ottimizzata 34px) */}
      <div className="demo-container py-1.5 sm:hidden flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wide shrink-0">
            Audit
          </span>
          <div className="flex items-center gap-1 font-mono text-[11px] shrink-0">
            <span className="text-amber-400 font-semibold">{data.audit.originalLcpSeconds}s</span>
            <span className="text-zinc-600">→</span>
            <span className="text-emerald-400 font-bold flex items-center">
              0.3s
            </span>
          </div>
          <span className="text-zinc-600 shrink-0">·</span>
          <span className="text-zinc-300 font-medium truncate text-[11px]">
            {data.meta.companyName}
          </span>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 text-[10px] font-medium shrink-0 cursor-pointer"
        >
          <span>Note ({data.audit.threeCriticalFlaws.length})</span>
          {expanded ? (
            <ChevronUp className="w-3 h-3 text-zinc-400" />
          ) : (
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          )}
        </motion.button>
      </div>

      {/* Versione Desktop / Tablet (Completa e Istituzionale) */}
      <div className="demo-container py-2 hidden sm:flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 uppercase tracking-wider">
            Audit Tecnico Riservato
          </span>
          <span className="font-semibold text-white tracking-tight">
            {data.meta.companyName}
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400 text-[11px]">
            Alla c.a. di {data.meta.decisionMakerName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-zinc-400">
              Sito attuale:{" "}
              <strong className="text-amber-400 font-semibold font-mono">
                {data.audit.originalLcpSeconds}s
              </strong>
            </span>
            <span className="text-zinc-600">→</span>
            <span className="text-zinc-300">
              Versione TechPYRE:{" "}
              <strong className="text-emerald-400 font-semibold font-mono">
                0.3s
              </strong>
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 border border-zinc-700/50 transition-colors text-[11px] font-medium cursor-pointer"
          >
            <span>Note Tecniche Audit ({data.audit.threeCriticalFlaws.length})</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden bg-[#0C0E10] border-t border-zinc-800 text-xs"
          >
            <div className="demo-container py-4 sm:py-5 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-start">
              <div className="md:col-span-5 space-y-1.5">
                <div className="text-zinc-400 font-medium text-[11px]">
                  Inserzione attiva collegata a questa pagina
                </div>
                <p className="text-white font-semibold text-xs sm:text-sm leading-snug">
                  &ldquo;{data.audit.activeAdHeadline}&rdquo;
                </p>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  {data.audit.activeAdCopySummary}
                </p>
              </div>

              <div className="md:col-span-7 space-y-1.5 md:border-l md:border-zinc-800 md:pl-6">
                <div className="text-zinc-400 font-medium text-[11px]">
                  3 aspetti migliorati rispetto alla pagina attuale
                </div>
                <ol className="space-y-1.5 text-zinc-300 text-[11px] sm:text-xs list-decimal list-inside">
                  {data.audit.threeCriticalFlaws.map((flaw, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {flaw}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
