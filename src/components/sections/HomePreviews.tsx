import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/Icons";

/**
 * =====================================================================
 * ANTEPRIME HOME (SOLO DESKTOP: PROGETTI & STUDIO)
 * - Su mobile è nascosto (hidden md:block) perché l'utente ha i bottoni
 *   volanti dedicati in basso a sinistra.
 * - Su desktop offre due approfondimenti concreti e con scopo, collegando
 *   direttamente i Casi Studio e lo Studio/Fondatore.
 * =====================================================================
 */
export default function HomePreviews() {
  return (
    <section aria-label="Approfondimenti" className="hidden md:block py-16 lg:py-20 bg-[#F8F7F4] border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Card Progetti Reference */}
          <div className="bg-white p-7 lg:p-8 rounded-sm border border-[#E8E2D5] shadow-2xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B8860B] bg-[#B8860B]/10 px-2 py-0.5 rounded-xs">
                  INGEGNERIA VERIFICABILE
                </span>
                <span className="text-xs font-mono text-[#5A6270]">2 Casi Studio Live</span>
              </div>

              <h2 className="font-serif text-2xl lg:text-[1.75rem] text-[#0B1E36] font-semibold tracking-tight">
                Architetture Reference & Casi Studio
              </h2>

              <p className="text-sm text-[#5A6270] leading-relaxed font-sans">
                Due ecosistemi B2B completi, pronti per essere testati senza autenticazione bloccante e con codice sorgente aperto su GitHub.
              </p>

              <div className="pt-2 space-y-2 border-t border-[#E8E2D5]/70 text-xs text-[#5A6270] font-sans">
                <div className="flex items-start gap-2">
                  <span className="text-[#B8860B] font-bold mt-0.5">▪</span>
                  <span><strong>Valkiria Fluidodinamica:</strong> Portale ordini con RBAC, listini a scaglioni per P.IVA e webhook Stripe.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#B8860B] font-bold mt-0.5">▪</span>
                  <span><strong>Kinetix Robotics:</strong> Infrastruttura headless con coda failover dei lead (TTFB &lt; 50ms, +68% efficienza).</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E2D5]/80 flex items-center justify-between">
              <Link
                href="/progetti"
                className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-[#0B1E36] hover:text-[#B8860B] transition-colors group"
              >
                <span>Esplora i casi studio e il codice GitHub</span>
                <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Card Studio & Metodo */}
          <div className="bg-white p-7 lg:p-8 rounded-sm border border-[#E8E2D5] shadow-2xs flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0B1E36] bg-[#0B1E36]/5 px-2 py-0.5 rounded-xs">
                  DIREZIONE & LEADERSHIP
                </span>
                <span className="text-xs font-mono text-[#5A6270]">18 Anni · Head of Studio</span>
              </div>

              <h2 className="font-serif text-2xl lg:text-[1.75rem] text-[#0B1E36] font-semibold tracking-tight">
                Lo Studio & Continuità Operativa
              </h2>

              <p className="text-sm text-[#5A6270] leading-relaxed font-sans">
                Guidato da Riccardo Granza con determinazione feroce e rigore esecutivo. Zero debito tecnico legacy, codice Next.js/TS nativo e processi che garantiscono la piena autonomia dell&apos;azienda cliente.
              </p>

              <div className="pt-2 space-y-2 border-t border-[#E8E2D5]/70 text-xs text-[#5A6270] font-sans">
                <div className="flex items-start gap-2">
                  <span className="text-[#B8860B] font-bold mt-0.5">▪</span>
                  <span><strong>Nessun intermediario:</strong> Interlocutore diretto al vertice dello studio via telefono e WhatsApp.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#B8860B] font-bold mt-0.5">▪</span>
                  <span><strong>Zero lock-in:</strong> Codice standardizzato, repository e cloud 100% intestati all&apos;azienda committente.</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E2D5]/80 flex items-center justify-between">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-[#0B1E36] hover:text-[#B8860B] transition-colors group"
              >
                <span>Leggi il manifesto del fondatore</span>
                <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
