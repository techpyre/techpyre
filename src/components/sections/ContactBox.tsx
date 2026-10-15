"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import { ContactPayload, ContactApiResponse } from "@/types/content";

/**
 * =====================================================================
 * BOX DI CONTATTO ISTITUZIONALE & MODULO DI RICHIESTA B2B
 * - Riceve eventi custom per pre-selezionare il servizio dal listino o simulatore
 * - Validazione front-end client-side immediata con messaggi d'errore chiari
 * - Invia i dati alla route API (/api/contact) con fallback sicuro anti-crash
 * - Input con dimensione minima di 16px su mobile per impedire lo zoom automatico su iOS
 * =====================================================================
 */
export default function ContactBox() {
  const { contact, services, brand } = siteContent;

  // Stato iniziale dei dati del modulo
  const [formData, setFormData] = useState<ContactPayload>({
    name: "",
    company: "",
    contact: "",
    service: services.items[0]?.name || "Consulenza Informatica & Marketing Digitale",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Ascolta sia la selezione semplice da listino sia i dettagli dal simulatore interattivo
  useEffect(() => {
    const handleSelectService = (event: CustomEvent<{ serviceTitle: string }>) => {
      if (event.detail && event.detail.serviceTitle) {
        setFormData((prev) => ({ ...prev, service: event.detail.serviceTitle }));
      }
    };

    const handleSelectWithDetails = (
      event: CustomEvent<{ serviceTitle: string; prefilledMessage: string }>
    ) => {
      if (event.detail) {
        setFormData((prev) => ({
          ...prev,
          service: event.detail.serviceTitle,
          message: event.detail.prefilledMessage,
        }));
      }
    };

    window.addEventListener("techpyre:select-service" as any, handleSelectService as EventListener);
    window.addEventListener(
      "techpyre:select-service-with-details" as any,
      handleSelectWithDetails as EventListener
    );

    return () => {
      window.removeEventListener("techpyre:select-service" as any, handleSelectService as EventListener);
      window.removeEventListener(
        "techpyre:select-service-with-details" as any,
        handleSelectWithDetails as EventListener
      );
    };
  }, []);

  // Validazione client-side prima dell'inoltro alla route API
  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = "Inserisci nome e cognome (minimo 2 caratteri).";
    }
    if (!formData.contact.trim() || formData.contact.trim().length < 5) {
      errors.contact = "Inserisci un recapito valido (email aziendale o telefono).";
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = "Fornisci una descrizione minima di 10 caratteri per la richiesta.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: ContactApiResponse = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(data.message || contact.feedback.errorMessage);
        if (data.errors) {
          setValidationErrors(data.errors);
        }
      }
    } catch (err) {
      console.error(`[${brand.name} Contact Form Error]:`, err);
      setStatus("error");
      setErrorMessage(contact.feedback.errorMessage);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      company: "",
      contact: "",
      service: services.items[0]?.name || "",
      message: "",
    });
    setValidationErrors({});
    setStatus("idle");
    setErrorMessage("");
  };

  return (
    <section id="contatto" className="py-14 sm:py-16 md:py-24 bg-[#F8F7F4] relative border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Intestazione Pragmatica */}
        <div className="max-w-3xl space-y-2 pb-6 sm:pb-8">
          <div className="text-[10px] sm:text-[11px] font-sans font-bold text-[#B8860B] uppercase tracking-widest">
            {contact.eyebrow}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#14181F] font-normal tracking-tight leading-[1.14]">
            {contact.title}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-[#5A6270] leading-relaxed font-sans">
            {contact.subtitle}
          </p>
        </div>

        {/* Griglia Contatto: Canali & Modulo (Stacca su mobile, affiancata su desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          {/* Canali Diretti (Colonna Sinistra) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-5">
            <div className="p-5 sm:p-7 rounded-sm bg-white border border-[#E8E2D5] shadow-xs space-y-4 sm:space-y-5">
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B]">
                  REPERIBILITÀ DIRETTA
                </div>
                <h3 className="font-serif text-lg sm:text-xl text-[#0B1E36] font-semibold">
                  Il contatto con le persone
                </h3>
                <p className="text-xs text-[#5A6270]">Nessun centralino, parli direttamente con noi</p>
              </div>

              <div className="space-y-3 divide-y divide-[#E8E2D5] border-y border-[#E8E2D5] pt-1">
                {contact.channels.map((channel, i) => (
                  <div key={i} className="pt-2.5 sm:pt-3 pb-2.5 sm:pb-3 first:pt-2.5 space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6270]">
                      {channel.label}
                    </div>
                    {channel.href !== "#" ? (
                      <a
                        href={channel.href}
                        target={channel.isExternal ? "_blank" : undefined}
                        rel={channel.isExternal ? "noreferrer" : undefined}
                        className="font-serif text-base sm:text-lg md:text-xl text-[#0B1E36] hover:text-[#B8860B] transition-colors block font-semibold break-all sm:break-normal"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <div className="font-serif text-base sm:text-lg md:text-xl text-[#0B1E36] font-semibold">
                        {channel.value}
                      </div>
                    )}
                    <div className="text-xs text-[#B8860B] font-medium pt-0.5">
                      {channel.subtext}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 sm:p-3.5 rounded-sm bg-[#0B1E36]/5 border border-[#0B1E36]/10 flex items-center gap-3 text-xs text-[#0B1E36]">
                <span className="text-[#B8860B] font-bold shrink-0">▪</span>
                <span>
                  <strong>Preferisci un confronto di persona?</strong> Fissiamo volentieri un incontro
                  presso la sede della tua impresa.
                </span>
              </div>
            </div>
          </div>

          {/* Modulo di Contatto (Colonna Destra) */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-7 md:p-9 rounded-sm border border-[#E8E2D5] shadow-xs">
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 text-left py-4 sm:py-6"
                >
                  <div className="w-10 h-10 rounded-sm bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 text-lg font-bold">
                    ✓
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-xl sm:text-2xl text-[#0B1E36] font-semibold">
                      {contact.feedback.successTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A6270] leading-relaxed font-sans">
                      {contact.feedback.successMessage}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-sm bg-[#F8F7F4] border border-[#E8E2D5] text-xs font-sans text-[#5A6270] space-y-0.5">
                    <div>Recapito indicato: <strong className="text-[#0B1E36]">{formData.contact}</strong></div>
                    <div>Servizio di interesse: <strong className="text-[#0B1E36]">{formData.service}</strong></div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-5 py-3 rounded-sm bg-[#0B1E36] hover:bg-[#003366] text-white font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {contact.feedback.successReset}
                  </button>
                </motion.div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
                  {status === "error" && (
                    <div className="p-3.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 text-xs font-sans space-y-0.5">
                      <div className="font-bold">{contact.feedback.errorTitle}</div>
                      <div>{errorMessage}</div>
                    </div>
                  )}

                  {/* Nome e Cognome */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#0B1E36]">
                      {contact.formLabels.name} <span className="text-[#B8860B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={status === "submitting"}
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (validationErrors.name) setValidationErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      placeholder={contact.formLabels.namePlaceholder}
                      className={`w-full px-4 py-3 rounded-sm bg-[#F8F7F4] border text-[#14181F] text-base sm:text-sm font-sans placeholder-[#5A6270]/50 focus:outline-none focus:border-[#0B1E36] focus:bg-white transition-all ${
                        validationErrors.name ? "border-rose-400" : "border-[#E8E2D5]"
                      }`}
                    />
                    {validationErrors.name && (
                      <p className="text-rose-600 text-[11px] pt-0.5">{validationErrors.name}</p>
                    )}
                  </div>

                  {/* Azienda & Recapito */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#0B1E36]">
                        {contact.formLabels.company}
                      </label>
                      <input
                        type="text"
                        disabled={status === "submitting"}
                        value={formData.company}
                        onChange={(e) => {
                          setFormData({ ...formData, company: e.target.value });
                        }}
                        placeholder={contact.formLabels.companyPlaceholder}
                        className="w-full px-4 py-3 rounded-sm bg-[#F8F7F4] border border-[#E8E2D5] text-[#14181F] text-base sm:text-sm font-sans placeholder-[#5A6270]/50 focus:outline-none focus:border-[#0B1E36] focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#0B1E36]">
                        {contact.formLabels.contact} <span className="text-[#B8860B]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        disabled={status === "submitting"}
                        value={formData.contact}
                        onChange={(e) => {
                          setFormData({ ...formData, contact: e.target.value });
                          if (validationErrors.contact) setValidationErrors((prev) => ({ ...prev, contact: "" }));
                        }}
                        placeholder={contact.formLabels.contactPlaceholder}
                        className={`w-full px-4 py-3 rounded-sm bg-[#F8F7F4] border text-[#14181F] text-base sm:text-sm font-sans placeholder-[#5A6270]/50 focus:outline-none focus:border-[#0B1E36] focus:bg-white transition-all ${
                          validationErrors.contact ? "border-rose-400" : "border-[#E8E2D5]"
                        }`}
                      />
                      {validationErrors.contact && (
                        <p className="text-rose-600 text-[11px] pt-0.5">{validationErrors.contact}</p>
                      )}
                    </div>
                  </div>

                  {/* Servizio di Interesse */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#0B1E36]">
                      {contact.formLabels.service}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {services.items.map((item) => {
                        const isSelected = formData.service === item.name;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            disabled={status === "submitting"}
                            onClick={() => setFormData({ ...formData, service: item.name })}
                            className={`p-2.5 sm:p-3 rounded-sm text-left border transition-all text-xs font-sans cursor-pointer flex items-center justify-between min-h-[44px] ${
                              isSelected
                                ? "border-[#0B1E36] bg-[#0B1E36] text-white font-semibold"
                                : "border-[#E8E2D5] bg-[#F8F7F4] text-[#5A6270] hover:border-[#0B1E36]"
                            }`}
                          >
                            <span className="line-clamp-1">{item.name}</span>
                            <span
                              className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center text-[9px] shrink-0 ml-1.5 font-bold ${
                                isSelected ? "border-white bg-white text-[#0B1E36]" : "border-[#E8E2D5]"
                              }`}
                            >
                              {isSelected ? "✓" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Messaggio */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#0B1E36]">
                      {contact.formLabels.message} <span className="text-[#B8860B]">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      disabled={status === "submitting"}
                      value={formData.message}
                      onChange={(e) => {
                        setFormData({ ...formData, message: e.target.value });
                        if (validationErrors.message) setValidationErrors((prev) => ({ ...prev, message: "" }));
                      }}
                      placeholder={contact.formLabels.messagePlaceholder}
                      className={`w-full px-4 py-3 rounded-sm bg-[#F8F7F4] border text-[#14181F] text-base sm:text-sm font-sans placeholder-[#5A6270]/50 focus:outline-none focus:border-[#0B1E36] focus:bg-white transition-all resize-none ${
                        validationErrors.message ? "border-rose-400" : "border-[#E8E2D5]"
                      }`}
                    />
                    {validationErrors.message && (
                      <p className="text-rose-600 text-[11px] pt-0.5">{validationErrors.message}</p>
                    )}
                  </div>

                  {/* Pulsante Invio */}
                  <div className="pt-1 space-y-2">
                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="w-full py-3.5 rounded-sm bg-[#0B1E36] hover:bg-[#003366] text-white font-sans text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[48px]"
                    >
                      {status === "submitting" ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{contact.formLabels.submitting}</span>
                        </>
                      ) : (
                        <span>{contact.formLabels.submit} →</span>
                      )}
                    </button>

                    <p className="text-[10px] sm:text-[11px] text-[#5A6270] text-center font-sans">
                      {contact.formLabels.privacyNote}
                    </p>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
