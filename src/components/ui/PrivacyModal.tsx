"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * =====================================================================
 * MODALE PRIVACY POLICY & COOKIE POLICY (GDPR)
 * Informativa formale conforme al Regolamento UE 2016/679.
 * Consultabile istantaneamente senza abbandonare il flusso di conversione.
 * =====================================================================
 */
export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Overlay di sfondo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Finestra di Dialogo */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl bg-[#F8F7F4] border border-[#E8E2D5] rounded-sm shadow-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto overscroll-contain text-[#14181F] font-sans text-xs sm:text-sm space-y-5"
          >
            {/* Intestazione */}
            <div className="flex items-start justify-between border-b border-[#E8E2D5] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B] font-sans">
                  INFORMATIVA SULLA PRIVACY & NOTE LEGALI
                </span>
                <h3 id="privacy-modal-title" className="font-serif text-xl sm:text-2xl text-[#0B1E36] font-semibold mt-1">
                  Trattamento Dati Personali (GDPR)
                </h3>
                <p className="text-xs text-[#5A6270] mt-0.5">
                  Ai sensi dell&apos;art. 13 del Regolamento UE 2016/679 (GDPR)
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-sm bg-white border border-[#E8E2D5] hover:border-[#0B1E36] text-[#0B1E36] flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                aria-label="Chiudi informativa privacy"
              >
                ✕
              </button>
            </div>

            {/* Contenuto Informativa */}
            <div className="space-y-4 leading-relaxed text-[#4A5260]">
              <div className="space-y-1">
                <h4 className="font-bold text-[#0B1E36] uppercase text-[11px] tracking-wider">
                  1. Titolare del Trattamento
                </h4>
                <p>
                  Il titolare del trattamento dei dati è <strong>TechPYRE Studio</strong> di Riccardo Granza, con sede operativa in Via Carrubara Vico III n. 3, Pagliara (Messina) — P.IVA in stato di costituzione. Per qualsiasi richiesta, rettifica o cancellazione è possibile scrivere direttamente all&apos;indirizzo email:{" "}
                  <a
                    href="mailto:riccardo.granza@techpyre.eu"
                    className="text-[#B8860B] font-semibold underline hover:text-[#0B1E36]"
                  >
                    riccardo.granza@techpyre.eu
                  </a>
                  {" "}o contattare il numero +39 379 115 9352.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#0B1E36] uppercase text-[11px] tracking-wider">
                  2. Finalità della Raccolta dei Dati
                </h4>
                <p>
                  I dati conferiti spontaneamente dall&apos;utente tramite i moduli di richiesta (Nome, Ragione Sociale, Email Aziendale, Recapito Telefonico e dettagli del progetto) sono trattati esclusivamente per:
                </p>
                <ul className="list-disc pl-5 space-y-0.5 pt-0.5">
                  <li>Dare riscontro a richieste di preventivo, audit preliminari o sessioni conoscitive;</li>
                  <li>Definire le specifiche tecniche e commerciali pattuite tra le parti;</li>
                  <li>Adempiere agli obblighi legali, amministrativi e fiscali connessi alla prestazione.</li>
                </ul>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#0B1E36] uppercase text-[11px] tracking-wider">
                  3. Riservatezza, Sicurezza e Terzi
                </h4>
                <p>
                  I dati <strong>non vengono ceduti, venduti né comunicati a terzi</strong> per scopi promozionali o di profilazione. L&apos;invio telematico avviene mediante protocolli crittografici sicuri (HTTPS / TLS) e le comunicazioni vengono instradate attraverso server di posta certificati.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#0B1E36] uppercase text-[11px] tracking-wider">
                  4. Cookie Policy
                </h4>
                <p>
                  Questo sito utilizza <strong>esclusivamente cookie tecnici essenziali</strong> al corretto funzionamento della navigazione e al mantenimento della sessione applicativa. Non vengono impiegati cookie di profilazione, tracker comportamentali invasivi né pixel di terze parti.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#0B1E36] uppercase text-[11px] tracking-wider">
                  5. Diritti dell&apos;Interessato
                </h4>
                <p>
                  Ai sensi degli artt. 15-22 del GDPR, l&apos;utente ha diritto di richiedere l&apos;accesso ai propri dati, la rettifica, la cancellazione immediata (diritto all&apos;oblio) o la limitazione del trattamento inviando una comunicazione senza formalità a riccardo.granza@techpyre.eu.
                </p>
              </div>
            </div>

            {/* Chiusura */}
            <div className="border-t border-[#E8E2D5] pt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-5 rounded-sm bg-[#0B1E36] hover:bg-[#002244] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Ho compreso e accetto
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
