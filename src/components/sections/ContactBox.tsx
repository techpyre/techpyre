"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import { ContactPayload, ContactApiResponse } from "@/types/content";

/**
 * =====================================================================
 * BOX DI CONTATTO ISTITUZIONALE & MODULO DI RICHIESTA B2B
 * - Riceve eventi custom per pre-selezionare il servizio da listino/simulatore
 * - Validazione front-end client-side immediata con messaggi d'errore chiari
 * - Invia i dati alla route API (/api/contact) collegata ad Aruba SMTP
 * - Input con dimensione minima di 16px (text-base sm:text-sm) per impedire
 *   lo zoom automatico sgradevole su iOS Safari
 * =====================================================================
 */
export default function ContactBox() {
  const { contact, services, brand } = siteContent;

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
    <section id="contatto" className="py-12 sm:py-16 md:py-24 bg-[#F8F7F4] relative border-t border-[#E8E2D5]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-12">
        {/* Intestazione */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl space-y-1.5 pb-6 sm:pb-8"
        >
          <div className="text-[10px] sm:text-[11px] font-sans font-bold text-[#B8860B] uppercase tracking-widest">
            {contact.eyebrow}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#14181F] font-normal tracking-tight leading-[1.14]">
            {contact.title}
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-[#5A6270] leading-relaxed font-sans">
            {contact.subtitle}
          </p>
        </motion.div>

        {/* Griglia Contatto: Canali & Modulo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Canali Diretti (Colonna Sinistra) */}
          <div className="lg:col-span-5 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-5 sm:p-6 rounded-sm bg-white border border-[#E8E2D5] shadow-xs space-y-4"
            >
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B]">
                  REPERIBILITÀ DIRETTA
                </div>
                <h3 className="font-serif text-lg sm:text-xl text-[#0B1E36] font-semibold">
                  Il contatto con le persone
                </h3>
                <p className="text-xs text-[#5A6270]">Nessun centralino, risponde Riccardo Granza</p>
              </div>

              <div className="space-y-2.5 divide-y divide-[#E8E2D5] border-y border-[#E8E2D5] pt-1">
                {contact.channels.map((channel, i) => (
                  <div key={i} className="pt-2.5 pb-2.5 first:pt-2 space-y-0.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6270]">
                      {channel.label}
                    </div>
                    {channel.href !== "#" ? (
                      <a
                        href={channel.href}
                        target={channel.isExternal ? "_blank" : undefined}
                        rel={channel.isExternal ? "noreferrer" : undefined}
                        className="font-serif text-base sm:text-lg text-[#0B1E36] hover:text-[#B8860B] transition-colors block font-semibold break-all sm:break-normal"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <div className="font-serif text-base sm:text-lg text-[#0B1E36] font-semibold">
                        {channel.value}
                      </div>
                    )}
                    <div className="text-xs text-[#B8860B] font-medium">
                      {channel.subtext}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-sm bg-[#0B1E36]/5 border border-[#0B1E36]/10 flex items-center gap-2.5 text-xs text-[#0B1E36]">
                <span className="text-[#B8860B] font-bold shrink-0">▪</span>
                <span>
                  <strong>Incontro in presenza?</strong> Disponibile per incontri presso la sede aziendale.
                </span>
              </div>
            </motion.div>
          </div>

          {/* Modulo di Contatto (Colonna Destra) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7 bg-white p-5 sm:p-7 md:p-8 rounded-sm border border-[#E8E2D5] shadow-xs"
          >
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 text-left py-4"
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
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="py-2.5 px-4 rounded-sm bg-[#0B1E36] text-white text-xs font-semibold hover:bg-[#003366] transition-colors cursor-pointer"
                    >
                      {contact.feedback.successReset}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-4"
                >
                  <div className="space-y-0.5 border-b border-[#E8E2D5] pb-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B]">
                      MODULO DI RICHIESTA DIRETTA
                    </div>
                    <div className="text-xs text-[#5A6270]">
                      I campi contrassegnati con (*) sono necessari per un riscontro accurato.
                    </div>
                  </div>

                  {status === "error" && (
                    <div className="p-3 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      <div className="font-bold">{contact.feedback.errorTitle}</div>
                      <div>{errorMessage}</div>
                    </div>
                  )}

                  {/* Nome e Cognome */}
                  <div className="space-y-1">
                    <label
                      htmlFor="name"
                      className="block text-xs font-sans font-bold uppercase tracking-wider text-[#0B1E36]"
                    >
                      {contact.formLabels.name} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={contact.formLabels.namePlaceholder}
                      className={`w-full px-3.5 py-2.5 rounded-sm border bg-[#F8F7F4]/40 text-[#14181F] text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] transition-all ${
                        validationErrors.name ? "border-rose-400 bg-rose-50/20" : "border-[#E8E2D5]"
                      }`}
                      required
                    />
                    {validationErrors.name && (
                      <p className="text-[11px] text-rose-600 font-medium">{validationErrors.name}</p>
                    )}
                  </div>

                  {/* Ragione Sociale & Contatto Diretto */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label
                        htmlFor="company"
                        className="block text-xs font-sans font-bold uppercase tracking-wider text-[#0B1E36]"
                      >
                        {contact.formLabels.company}
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder={contact.formLabels.companyPlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-sm border border-[#E8E2D5] bg-[#F8F7F4]/40 text-[#14181F] text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="contact"
                        className="block text-xs font-sans font-bold uppercase tracking-wider text-[#0B1E36]"
                      >
                        {contact.formLabels.contact} *
                      </label>
                      <input
                        type="text"
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder={contact.formLabels.contactPlaceholder}
                        className={`w-full px-3.5 py-2.5 rounded-sm border bg-[#F8F7F4]/40 text-[#14181F] text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] transition-all ${
                          validationErrors.contact ? "border-rose-400 bg-rose-50/20" : "border-[#E8E2D5]"
                        }`}
                        required
                      />
                      {validationErrors.contact && (
                        <p className="text-[11px] text-rose-600 font-medium">{validationErrors.contact}</p>
                      )}
                    </div>
                  </div>

                  {/* Servizio di Interesse */}
                  <div className="space-y-1">
                    <label
                      htmlFor="service"
                      className="block text-xs font-sans font-bold uppercase tracking-wider text-[#0B1E36]"
                    >
                      {contact.formLabels.service}
                    </label>
                    <select
                      id="service"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-sm border border-[#E8E2D5] bg-[#F8F7F4]/40 text-[#14181F] text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] transition-all"
                    >
                      {services.items.map((srv) => (
                        <option key={srv.id} value={srv.name}>
                          {srv.name} — {srv.price}
                        </option>
                      ))}
                      <option value="Altro / Progetto Speciale">Altro / Esigenza Speciale Personalizzata</option>
                    </select>
                  </div>

                  {/* Messaggio */}
                  <div className="space-y-1">
                    <label
                      htmlFor="message"
                      className="block text-xs font-sans font-bold uppercase tracking-wider text-[#0B1E36]"
                    >
                      {contact.formLabels.message} *
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={contact.formLabels.messagePlaceholder}
                      className={`w-full px-3.5 py-2.5 rounded-sm border bg-[#F8F7F4]/40 text-[#14181F] text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] transition-all ${
                        validationErrors.message ? "border-rose-400 bg-rose-50/20" : "border-[#E8E2D5]"
                      }`}
                      required
                    />
                    {validationErrors.message && (
                      <p className="text-[11px] text-rose-600 font-medium">{validationErrors.message}</p>
                    )}
                  </div>

                  {/* Privacy & Invio */}
                  <div className="pt-2 space-y-3">
                    <p className="text-[11px] text-[#5A6270] leading-relaxed">
                      {contact.formLabels.privacyNote}
                    </p>

                    <div className="relative p-[1.5px] rounded-sm overflow-hidden group cursor-pointer">
                      <span
                        aria-hidden="true"
                        className="absolute inset-[-150%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_260deg,#C5A059_310deg,#FFFFFF_345deg,#B8860B_360deg)] animate-[spin_3.5s_linear_infinite] pointer-events-none"
                      />
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === "submitting"}
                        className="relative z-10 w-full py-3.5 px-6 rounded-[1px] bg-[#B8860B] hover:bg-[#9a7008] text-white font-sans text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                      >
                        {status === "submitting" ? (
                          <span>{contact.formLabels.submitting}</span>
                        ) : (
                          <>
                            <span>{contact.formLabels.submit}</span>
                            <span>→</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
