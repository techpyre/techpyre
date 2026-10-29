import React from "react";
import { LeadConfig } from "@/types/lead";

interface TechPyreFooterProps {
  data: LeadConfig;
}

export default function TechPyreFooter({ data }: TechPyreFooterProps) {
  const { meta } = data;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-stone-400 py-10 border-t border-stone-800 text-xs font-sans">
      <div className="demo-container space-y-6">
        {/* Informazioni Istituzionali Azienda */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-stone-400">
          <div>
            <strong className="text-white font-semibold">{meta.companyName}</strong>
            <span className="mx-2 text-stone-600">·</span>
            <span>Operatività: {meta.city} e provincia</span>
            {meta.vatNumber && meta.vatNumber !== "Non trovata" && (
              <>
                <span className="mx-2 text-stone-600">·</span>
                <span>P.IVA {meta.vatNumber}</span>
              </>
            )}
          </div>
          <div className="text-stone-300">
            <span className="text-stone-500 mr-1.5">Recapito diretto:</span>
            <span className="font-mono font-medium text-stone-200">{meta.phone}</span>
          </div>
        </div>

        {/* Riga Unica di Copyright e Firma Discreta TechPYRE */}
        <div className="pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <div>
            © {currentYear} {meta.companyName}. Tutti i diritti riservati.
          </div>
          <div className="flex items-center gap-1.5 text-stone-500">
            <span>Architettura ad alte prestazioni:</span>
            <a
              href="https://techpyre.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-stone-200 transition-colors font-medium underline underline-offset-2"
            >
              TechPYRE
            </a>
          </div>
        </div>
      </div>

      {/* Tag Nascosto per Attribuzione Ufficiale */}
      <div
        className="hidden"
        aria-hidden="true"
        dangerouslySetInnerHTML={{
          __html: "<!-- TechPYRE High-Performance CRO Architecture (https://techpyre.eu) -->",
        }}
      />
    </footer>
  );
}
