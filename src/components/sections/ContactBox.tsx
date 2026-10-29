"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteContent } from "@/config/siteContent";
import { ContactPayload, ContactApiResponse } from "@/types/content";
import {
  ArrowRightIcon,
  WhatsAppIcon,
  MailIcon,
  GitHubIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
} from "@/components/ui/Icons";
import PrivacyModal from "@/components/ui/PrivacyModal";
import { consumeContactPrefill } from "@/lib/contactPrefill";


/**
 * =====================================================================
 * BOX DI CONTATTO ISTITUZIONALE & MODULO DI RICHIESTA B2B
 * - Riceve eventi custom per pre-selezionare il servizio da listino/simulatore
 * - Validazione front-end client-side immediata con messaggi d'errore chiari
 * - Invia i dati alla route API (/api/contact) collegata ad Aruba SMTP
 * - Input con dimensione minima di 16px (text-base sm:text-sm) per impedire
 *   lo zoom automatico sgradevole su iOS Safari
 * - Consenso informato GDPR con modale informativa privacy integrata
 * - Form chiuso di default per ridurre il carico visivo, espandibile su richiesta
 * =====================================================================
 */
export default function ContactBox() {
  const { contact, services, brand } = siteContent;

  const [formData, setFormData] = useState<ContactPayload>({
    name: "",
    company: "",
    contact: "",
    service: services.items[0]?.name || "Audit Tecnico & Consulenza Architetturale",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    const handleSelectService = (event: Event) => {
      const customEvent = event as CustomEvent<{ serviceTitle: string }>;
      if (customEvent.detail && customEvent.detail.serviceTitle) {
        setFormData((prev) => ({ ...prev, service: customEvent.detail.serviceTitle }));
        setIsMobileFormOpen(true);
      }
    };

    const handleSelectWithDetails = (event: Event) => {
      const customEvent = event as CustomEvent<{ serviceTitle: string; prefilledMessage: string }>;
      if (customEvent.detail) {
        setFormData((prev) => ({
          ...prev,
          service: customEvent.detail.serviceTitle,
          message: customEvent.detail.prefilledMessage,
        }));
        setIsMobileFormOpen(true);
      }
    };

    window.addEventListener("techpyre:select-service", handleSelectService);
    window.addEventListener(
      "techpyre:select-service-with-details",
      handleSelectWithDetails
    );

    return () => {
      window.removeEventListener("techpyre:select-service", handleSelectService);
      window.removeEventListener(
        "techpyre:select-service-with-details",
        handleSelectWithDetails
      );
    };
  }, []);

  // Precompilato proveniente da un'altra pagina (Servizi, Simulatore, Progetti) via sessionStorage
  useEffect(() => {
    const prefill = consumeContactPrefill();
    if (!prefill) return;
    // Applicato dopo il mount (sessionStorage esiste solo sul client)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => ({
      ...prev,
      service: prefill.serviceTitle,
      message: prefill.prefilledMessage ?? prev.message,
    }));
    setIsMobileFormOpen(true);
    const timer = window.setTimeout(() => {
      document.getElementById("contatto")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
    return () => window.clearTimeout(timer);
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
    if (!gdprAccepted) {
      errors.gdpr = "È necessario confermare l'accettazione della Privacy Policy per inviare la richiesta.";
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
        body: JSON.stringify({ ...formData, website: honeypot }),
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
    setGdprAccepted(false);
    setIsMobileFormOpen(false);
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

        {/* Griglia Contatto: Canali & Modulo perfettamente allineati su desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Canali Diretti (Colonna Sinistra) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 bg-white rounded-sm border border-[#E8E2D5] shadow-xs flex flex-col justify-between overflow-hidden h-full"
          >
            {/* Header del Box Allineato al Modulo Desktop */}
            <div className="p-5 sm:p-6 lg:p-7 pb-4 border-b border-[#E8E2D5] space-y-0.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B]">
                REPERIBILITÀ DIRETTA
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#0B1E36] font-semibold">
                Il contatto con le persone
              </h3>
              <p className="text-xs text-[#5A6270]">
                Nessun centralino o intermediario: risponde Riccardo Granza
              </p>
            </div>

            {/* Contenuto Canali con spaziatura armoniosa e bilanciata */}
            <div className="p-5 sm:p-6 lg:p-7 flex-1 flex flex-col justify-between gap-5">
              <div className="space-y-3.5">
                {/* 01: Email Diretta */}
                <div className="p-3.5 rounded-sm bg-[#F8F7F4]/80 border border-[#E8E2D5] space-y-1 hover:border-[#B8860B] transition-colors">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6270] flex items-center gap-1.5">
                    <MailIcon className="w-3.5 h-3.5 text-[#B8860B]" />
                    <span>Email Diretta</span>
                  </div>
                  <a
                    href="mailto:riccardo.granza@techpyre.eu"
                    className="font-serif text-base sm:text-lg text-[#0B1E36] hover:text-[#B8860B] transition-colors font-semibold block break-all"
                  >
                    riccardo.granza@techpyre.eu
                  </a>
                  <div className="text-[11px] text-[#B8860B] font-medium font-sans">
                    Riscontro garantito entro la giornata lavorativa
                  </div>
                </div>

                {/* 02: WhatsApp & Telefono */}
                <div className="p-3.5 rounded-sm bg-[#25D366]/5 border border-[#25D366]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d6938] flex items-center gap-1.5">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                      <span>WhatsApp & Telefono</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#0d6938] bg-[#25D366]/15 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                      Canale Rapido
                    </span>
                  </div>

                  <div className="font-serif text-base sm:text-lg text-[#0B1E36] font-bold">
                    +39 379 115 9352
                  </div>

                  <p className="text-[11px] text-[#5A6270]">
                    Per quesiti immediati o note operative sul progetto.
                  </p>

                  <a
                    href="https://wa.me/393791159352"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-sm bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-sans text-xs font-bold shadow-xs flex items-center justify-between transition-all group/wa cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-2">
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-white" />
                      <span>Avvia conversazione WhatsApp</span>
                    </span>
                    <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover/wa:translate-x-1 shrink-0" />
                  </a>
                </div>

                {/* 03: Repository GitHub */}
                <div className="p-3.5 rounded-sm bg-[#F8F7F4]/80 border border-[#E8E2D5] space-y-1 hover:border-[#0B1E36] transition-colors">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6270] flex items-center gap-1.5">
                    <GitHubIcon className="w-3.5 h-3.5 text-[#0B1E36]" />
                    <span>Architetture Reference & GitHub</span>
                  </div>
                  <a
                    href="https://github.com/techpyre"
                    target="_blank"
                    rel="noreferrer"
                    className="font-serif text-base sm:text-lg text-[#0B1E36] hover:text-[#B8860B] transition-colors inline-flex items-center gap-1.5 font-semibold group/gh"
                  >
                    <span>github.com/techpyre</span>
                    <ArrowUpRightIcon className="w-3.5 h-3.5 text-[#5A6270] group-hover/gh:text-[#B8860B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                  <div className="text-[11px] text-[#5A6270] font-sans">
                    Codice sorgente aperto e architetture dimostrative
                  </div>
                </div>

                {/* 04: Orari & Reperibilità */}
                <div className="p-3.5 rounded-sm bg-[#F8F7F4]/80 border border-[#E8E2D5] space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A6270]">
                    Orari di Reperibilità
                  </div>
                  <div className="font-serif text-base text-[#0B1E36] font-semibold">
                    Lun — Ven · 08:30 — 19:30
                  </div>
                  <div className="text-[11px] text-[#5A6270] font-sans">
                    Fuso orario di Roma · Sede in Italia · Operatività nazionale
                  </div>
                </div>
              </div>

              {/* Riquadri Rassicuranti B2B a Fondo Scheda (Bilanciamento Visivo) */}
              <div className="space-y-2 pt-2 border-t border-[#E8E2D5]">
                <div className="p-3 rounded-sm bg-[#0B1E36]/5 border border-[#0B1E36]/10 flex items-start gap-2.5 text-xs text-[#0B1E36]">
                  <span className="text-[#B8860B] font-bold shrink-0 mt-0.5">▪</span>
                  <span>
                    <strong>Incontro in presenza?</strong> Disponibile per sessioni di lavoro strategiche e briefing tecnici presso la sede dell&apos;impresa committente.
                  </span>
                </div>

                <div className="p-3 rounded-sm bg-[#B8860B]/5 border border-[#B8860B]/20 flex items-start gap-2.5 text-xs text-[#0B1E36]">
                  <span className="text-[#B8860B] font-bold shrink-0 mt-0.5">▪</span>
                  <span>
                    <strong>Zero intermediari:</strong> Dialoghi esclusivamente con chi progetta l&apos;architettura e scrive il codice sorgente.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Modulo di Contatto Email Unificato & Omogeneo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-7 bg-white rounded-sm border border-[#E8E2D5] shadow-xs overflow-hidden h-full flex flex-col justify-between transition-all duration-300"
          >
            {/* Header del Modulo su Mobile: Singola riga interattiva perfettamente integrata nella scheda */}
            <button
              type="button"
              onClick={() => setIsMobileFormOpen(!isMobileFormOpen)}
              className="w-full p-4 lg:hidden flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-[#F8F7F4]/60 select-none group"
              aria-expanded={isMobileFormOpen}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xs bg-[#B8860B]/10 flex items-center justify-center text-[#B8860B] shrink-0 group-hover:bg-[#B8860B]/15 transition-colors">
                  <MailIcon className="w-4 h-4 text-[#B8860B]" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#B8860B] leading-none mb-1">
                    Modulo Email
                  </div>
                  <div className="font-serif text-base font-semibold text-[#0B1E36] leading-none">
                    Contattaci via email
                  </div>
                </div>
              </div>
              <div className="w-7 h-7 rounded-xs bg-[#F8F7F4] border border-[#E8E2D5] flex items-center justify-center text-[#5A6270] shrink-0 ml-2 group-hover:border-[#0B1E36] transition-colors">
                <ChevronDownIcon
                  className={`w-4 h-4 text-[#5A6270] transition-transform duration-300 ${
                    isMobileFormOpen ? "rotate-180 text-[#B8860B]" : ""
                  }`}
                />
              </div>
            </button>

            {/* Header Istituzionale del Modulo su Desktop */}
            <div className="hidden lg:block p-5 sm:p-7 lg:p-8 pb-4 border-b border-[#E8E2D5] space-y-0.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#B8860B]">
                MODULO DI RICHIESTA DIRETTA
              </div>
              <h3 className="font-serif text-xl sm:text-2xl text-[#0B1E36] font-semibold">
                Scrivi allo Studio
              </h3>
              <p className="text-xs text-[#5A6270]">
                Riscontro garantito entro la giornata lavorativa direttamente da Riccardo Granza.
              </p>
            </div>

            {/* Corpo del Modulo (visibile sempre su desktop, espandibile al tocco su mobile) */}
            <div
              className={`p-5 sm:p-7 lg:p-8 flex-1 flex flex-col justify-between ${
                isMobileFormOpen ? "block border-t border-[#E8E2D5] lg:border-t-0" : "hidden lg:flex"
              } lg:pt-5`}
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
                    {status === "error" && (
                      <div className="p-3 rounded-sm bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                        <div className="font-bold">{contact.feedback.errorTitle}</div>
                        <div>{errorMessage}</div>
                      </div>
                    )}


                  {/* Honeypot anti-bot nascosto */}
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden pointer-events-none"
                    aria-hidden="true"
                  />

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
                      name="name"
                      autoComplete="name"
                      spellCheck={false}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={contact.formLabels.namePlaceholder}
                      className={`w-full px-3.5 py-2.5 rounded-sm border bg-[#F8F7F4]/40 text-[#14181F] text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] transition-[border-color,background-color,box-shadow] ${
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
                        name="company"
                        autoComplete="organization"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder={contact.formLabels.companyPlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-sm border border-[#E8E2D5] bg-[#F8F7F4]/40 text-[#14181F] text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] transition-[border-color,background-color,box-shadow]"
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
                        name="contact"
                        autoComplete="email tel"
                        inputMode={formData.contact.includes("@") ? "email" : "text"}
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        placeholder={contact.formLabels.contactPlaceholder}
                        className={`w-full px-3.5 py-2.5 rounded-sm border bg-[#F8F7F4]/40 text-[#14181F] text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] transition-[border-color,background-color,box-shadow] ${
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
                      name="service"
                      autoComplete="off"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-sm border border-[#E8E2D5] bg-[#F8F7F4]/40 text-[#14181F] text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] transition-[border-color,background-color,box-shadow]"
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
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={contact.formLabels.messagePlaceholder}
                      className={`w-full px-3.5 py-2.5 rounded-sm border bg-[#F8F7F4]/40 text-[#14181F] text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#B8860B] transition-[border-color,background-color,box-shadow] ${
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
                    {/* Checkbox Obbligatoria Consenso GDPR */}
                    <div
                      className={`p-3 rounded-sm border transition-colors ${
                        validationErrors.gdpr
                          ? "bg-rose-50/30 border-rose-400"
                          : "bg-[#F8F7F4] border-[#E8E2D5]"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          id="gdpr-consent"
                          name="gdpr-consent"
                          checked={gdprAccepted}
                          onChange={(e) => {
                            setGdprAccepted(e.target.checked);
                            if (validationErrors.gdpr) {
                              setValidationErrors((prev) => {
                                const next = { ...prev };
                                delete next.gdpr;
                                return next;
                              });
                            }
                          }}
                          className="mt-0.5 w-4 h-4 rounded-xs border-[#E8E2D5] text-[#B8860B] focus:ring-[#B8860B] cursor-pointer shrink-0 accent-[#B8860B]"
                          required
                        />
                        <label
                          htmlFor="gdpr-consent"
                          className="text-[11px] text-[#5A6270] leading-snug cursor-pointer select-none"
                        >
                          Dichiaro di aver preso visione e accetto la{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsPrivacyModalOpen(true);
                            }}
                            className="text-[#0B1E36] font-bold underline decoration-[#B8860B] hover:text-[#B8860B] transition-colors inline"
                          >
                            Privacy Policy
                          </button>{" "}
                          per il trattamento dei dati personali ai sensi del GDPR (Reg. UE 2016/679).
                        </label>
                      </div>
                      {validationErrors.gdpr && (
                        <p className="text-[11px] text-rose-600 font-medium pt-1.5 pl-6.5">
                          {validationErrors.gdpr}
                        </p>
                      )}
                    </div>

                    <div className="relative p-[1.5px] rounded-sm overflow-hidden group cursor-pointer">
                      <span
                        aria-hidden="true"
                        className="absolute inset-[-150%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_260deg,#C5A059_310deg,#FFFFFF_345deg,#B8860B_360deg)] animate-[spin_3.5s_linear_infinite] motion-reduce:animate-none pointer-events-none"
                      />
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={status === "submitting"}
                        className="relative z-10 w-full py-3.5 px-6 rounded-[1px] bg-[#B8860B] hover:bg-[#9a7008] text-white font-sans text-xs sm:text-sm font-bold tracking-wide transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
                      >
                        {status === "submitting" ? (
                          <span>{contact.formLabels.submitting}</span>
                        ) : (
                          <>
                            <span>{contact.formLabels.submit}</span>
                            <ArrowRightIcon className="w-4 h-4 shrink-0" />
                          </>
                        )}
                      </motion.button>
                    </div>

                    <p className="text-[11px] text-[#5A6270] text-center leading-relaxed">
                      Nessun vincolo o costo preventivo · Risposta tecnica diretta del Fondatore entro 24 ore lavorative
                    </p>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>


      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </section>
  );
}
