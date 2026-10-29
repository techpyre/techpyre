"use client";

import React, { useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  HeartHandshake,
  Lock,
  MapPin,
  Phone,
  RotateCcw,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react";
import { LeadConfig } from "@/types/lead";

interface TemplateProps {
  data: LeadConfig;
}

export default function MedicalClinic({ data }: TemplateProps) {
  const { meta, content } = data;

  const medical = content.medicalDetails || {
    directorName: meta.decisionMakerName,
    alboRegistration: `Iscr. Albo Provinciale degli Odontoiatri di ${meta.city} n. 4821`,
    specialization:
      "Chirurgia Orale, Implantologia Computer Guidata e Riabilitazione Protesica",
    clinicAddress: `Sede Clinica di ${meta.city}`,
    openingHours: "Lunedì - Venerdì: 08:30 - 19:30 · Sabato: 09:00 - 13:30",
    parkingAndAccess:
      "Ingresso privo di barriere architettoniche e parcheggio riservato ai pazienti",
    conventions: [
      "FASI",
      "UniSalute",
      "Previmedical",
      "Pronto-Care",
      "Rateizzazione Tasso Zero",
    ],
  };

  // Stato per il modulo di prenotazione colloquio / prima visita
  const [preferredSlot, setPreferredSlot] = useState<string>("Mattina (09:00 - 13:00)");
  const [visitReason, setVisitReason] = useState<string>(
    content.quiz.question1.options[0] || "Prima visita di valutazione"
  );
  const [patientName, setPatientName] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [bookingSubmitted, setBookingSubmitted] = useState<boolean>(false);

  const handleBookingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingSubmitted(true);
  };

  const handleSimulateBooking = () => {
    if (!patientName) setPatientName("Laura Ferri");
    if (!patientPhone) setPatientPhone("338 412 9087");
    setBookingSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#4A4642] font-[family-name:var(--font-jakarta)]">
      {/* Barra Informativa Superiore: Direzione Sanitaria, Albo e Orari */}
      <div className="bg-[#F3EFEA] border-b border-[#E5DFD6] text-xs text-[#57524E]">
        <div className="demo-container py-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium text-[#1F3A33]">
              Direzione Sanitaria: {medical.directorName}
            </span>
            <span className="hidden sm:inline text-[#A8A29E]">·</span>
            <span className="hidden sm:inline">{medical.alboRegistration}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#1F4E46]" strokeWidth={1.5} />
              {medical.clinicAddress}
            </span>
          </div>
        </div>
      </div>

      {/* Header Clinico con Navigazione e CTA Prenotazione */}
      <header className="sticky top-[37px] z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5DFD6]">
        <div className="demo-container h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {content.logoLocalPath ? (
              <img
                src={content.logoLocalPath}
                alt={`${meta.companyName} Logo`}
                width={160}
                height={48}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <span className="font-[family-name:var(--font-lora)] font-semibold text-xl text-[#1F2421] tracking-tight">
                {meta.companyName}
              </span>
            )}

            <nav className="hidden lg:flex items-center gap-6 text-sm text-[#57524E]">
              <a href="#trattamenti" className="hover:text-[#1F3A33] transition-colors">
                Percorsi di cura
              </a>
              <a href="#prima-visita" className="hover:text-[#1F3A33] transition-colors">
                Come si svolge il colloquio
              </a>
              <a href="#equipe-medica" className="hover:text-[#1F3A33] transition-colors">
                Direzione Sanitaria
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${meta.phone.replace(/\s+/g, "")}`}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#D6CFC5] text-[#1F2421] font-medium text-xs sm:text-sm hover:border-[#1F4E46] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#1F4E46]" strokeWidth={1.5} />
              <span>{meta.phone}</span>
            </a>
            <a
              href="#prenota-colloquio"
              className="demo-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F4E46] text-white font-medium text-xs sm:text-sm"
            >
              <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Prenota Prima Visita</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Editoriale Medica (Senza Quiz! Focus su Empatia, Fiducia e Prenotazione Visita) */}
      <section className="demo-section bg-[#FAF8F5] border-b border-[#E5DFD6]">
        <div className="demo-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EFECE6] text-xs font-medium text-[#1F4E46]">
                <Stethoscope className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{content.badgeTop}</span>
              </div>

              <h1 className="demo-h1 font-[family-name:var(--font-lora)] font-normal text-[#1F2421]">
                {content.heroHeadline}
              </h1>

              <p className="demo-body text-[#4A4642]">
                {content.heroSubheadline}
              </p>

              {/* Doppia CTA verso Prenotazione Colloquio e Segreteria */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <a
                  href="#prenota-colloquio"
                  className="demo-btn inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#1F4E46] text-white font-medium text-sm sm:text-[15px]"
                >
                  <Calendar className="w-4 h-4" strokeWidth={1.5} />
                  <span>Prenota un colloquio in studio</span>
                </a>
                <a
                  href={`tel:${meta.phone.replace(/\s+/g, "")}`}
                  className="demo-btn inline-flex items-center gap-2.5 px-6 py-4 rounded-full bg-white text-[#1F2421] border border-[#D6CFC5] hover:border-[#1F4E46] font-medium text-sm sm:text-[15px]"
                >
                  <Phone className="w-4 h-4 text-[#1F4E46]" strokeWidth={1.5} />
                  <span>Parla con la segreteria</span>
                </a>
              </div>

              {/* Rassicurazione Pazienti sotto i bottoni */}
              <div className="pt-4 border-t border-[#E5DFD6] flex flex-wrap items-center gap-6 text-xs text-[#57524E]">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <strong className="text-[#1F2421]">
                    {content.socialProof.reviewsSummary}
                  </strong>
                </div>
                <span>·</span>
                <span>
                  <strong className="text-[#1F2421]">{content.socialProof.mainStatValue}</strong>{" "}
                  {content.socialProof.mainStatLabel}
                </span>
              </div>
            </div>

            {/* Colonna Destra: Fotografia Luminosa dello Studio + Scheda Direzione Sanitaria */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-[#E5DFD6] bg-white demo-shadow">
                <img
                  src={content.heroImageLocalPath}
                  alt={`${meta.companyName} - Studio Medico a ${meta.city}`}
                  fetchPriority="high"
                  width={800}
                  height={560}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="p-5 sm:p-6 bg-white border-t border-[#E5DFD6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-[#1F4E46] font-semibold">
                      Direzione Sanitaria
                    </div>
                    <div className="font-[family-name:var(--font-lora)] text-lg font-medium text-[#1F2421] mt-0.5">
                      {medical.directorName}
                    </div>
                    <div className="text-xs text-[#57524E] mt-0.5">
                      {medical.alboRegistration}
                    </div>
                  </div>
                  <a
                    href="#prenota-colloquio"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#F3EFEA] hover:bg-[#E5DFD6] text-[#1F3A33] text-xs font-semibold transition-colors shrink-0"
                  >
                    Verifica orari disponibili →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione 1: Come si svolge il primo colloquio in studio (Rimuove l'ansia del paziente) */}
      <section id="prima-visita" className="demo-section bg-[#F3EFEA] border-b border-[#E5DFD6]">
        <div className="demo-container">
          <div className="max-w-[62ch] mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1F4E46] block mb-2">
              Accoglienza e Trasparenza
            </span>
            <h2 className="demo-h2 font-[family-name:var(--font-lora)] font-normal text-[#1F2421] mb-3">
              Come si svolge la prima visita conoscitiva nel nostro studio di {meta.city}
            </h2>
            <p className="demo-body text-[#4A4642]">
              Sappiamo che affrontare una visita specialistica può generare dubbi. Per questo il primo incontro è dedicato interamente all&apos;ascolto e a una diagnosi serena, senza alcun impegno.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD6]">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1F4E46] text-white font-[family-name:var(--font-lora)] text-sm mb-5">
                1
              </span>
              <h3 className="demo-h3 font-[family-name:var(--font-lora)] font-medium text-[#1F2421] mb-2.5">
                Colloquio in ambiente riservato
              </h3>
              <p className="text-sm sm:text-[15px] text-[#4A4642] leading-relaxed">
                Prima di qualsiasi controllo strumentale, il medico ascolta la tua storia clinica, le tue esigenze e le eventuali paure legate al trattamento.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD6]">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1F4E46] text-white font-[family-name:var(--font-lora)] text-sm mb-5">
                2
              </span>
              <h3 className="demo-h3 font-[family-name:var(--font-lora)] font-medium text-[#1F2421] mb-2.5">
                Esami diagnostici in sede
              </h3>
              <p className="text-sm sm:text-[15px] text-[#4A4642] leading-relaxed">
                Eseguiamo direttamente in studio gli approfondimenti necessari per avere un quadro clinico completo, senza doverti recare in centri esterni.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD6]">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#1F4E46] text-white font-[family-name:var(--font-lora)] text-sm mb-5">
                3
              </span>
              <h3 className="demo-h3 font-[family-name:var(--font-lora)] font-medium text-[#1F2421] mb-2.5">
                Piano di cura chiaro e scritto
              </h3>
              <p className="text-sm sm:text-[15px] text-[#4A4642] leading-relaxed">
                Ti illustriamo con parole semplici il percorso consigliato, le tempistiche di recupero, i costi trasparenti e le convenzioni assicurative attivabili.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione 2: Percorsi Clinici & Trattamenti */}
      <section id="trattamenti" className="demo-section bg-[#FAF8F5] border-b border-[#E5DFD6]">
        <div className="demo-container">
          <div className="max-w-[62ch] mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1F4E46] block mb-2">
              Specializzazioni Cliniche
            </span>
            <h2 className="demo-h2 font-[family-name:var(--font-lora)] font-normal text-[#1F2421]">
              Cure mediche all&apos;avanguardia pensate per il benessere del paziente
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.valueProps.map((prop, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white border border-[#E5DFD6] demo-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#F3EFEA] text-[#1F4E46] flex items-center justify-center mb-6">
                    {idx === 0 && <Stethoscope className="w-5 h-5" strokeWidth={1.5} />}
                    {idx === 1 && <HeartHandshake className="w-5 h-5" strokeWidth={1.5} />}
                    {idx === 2 && <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />}
                  </div>
                  <h3 className="demo-h3 font-[family-name:var(--font-lora)] font-medium text-[#1F2421] mb-3">
                    {prop.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-[#4A4642] leading-relaxed">
                    {prop.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F3EFEA] flex items-center justify-between text-xs">
                  <span className="font-medium text-[#1F4E46]">Protocollo certificato</span>
                  <a href="#prenota-colloquio" className="underline text-[#57524E] hover:text-[#1F2421]">
                    Richiedi colloquio →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sezione 3: Direzione Sanitaria, Logistica & Modulo di Prenotazione Colloquio */}
      <section id="prenota-colloquio" className="demo-section bg-[#F3EFEA] border-b border-[#E5DFD6]">
        <div className="demo-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Sinistra: Direzione Sanitaria, Orari, Sede, Convenzioni e Testimonianze */}
            <div id="equipe-medica" className="lg:col-span-6 space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#1F4E46] block">
                  Direzione Sanitaria &amp; Informazioni Utili
                </span>
                <h2 className="demo-h2 font-[family-name:var(--font-lora)] font-normal text-[#1F2421]">
                  Prenota la tua prima visita presso la sede di {meta.city}
                </h2>
                <p className="demo-body text-[#4A4642]">
                  La nostra segreteria coordina gli appuntamenti per garantire la massima puntualità ed evitare attese in sala d&apos;aspetto.
                </p>
              </div>

              {/* Scheda Medico & Iscrizione Albo */}
              <div className="p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD6] space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#1F4E46]">
                    Responsabile Sanitario
                  </div>
                  <div className="font-[family-name:var(--font-lora)] text-xl font-medium text-[#1F2421] mt-1">
                    {medical.directorName}
                  </div>
                  <div className="text-xs font-medium text-[#57524E] mt-0.5">
                    {medical.alboRegistration}
                  </div>
                </div>
                <p className="text-sm text-[#4A4642] leading-relaxed">
                  {medical.specialization}
                </p>

                <div className="pt-4 border-t border-[#E5DFD6] space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#1F4E46] shrink-0 mt-1" strokeWidth={1.5} />
                    <div>
                      <strong className="text-[#1F2421]">Indirizzo e Parcheggio:</strong>{" "}
                      <span>{medical.clinicAddress} - {medical.parkingAndAccess}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#1F4E46] shrink-0 mt-1" strokeWidth={1.5} />
                    <div>
                      <strong className="text-[#1F2421]">Orari dello Studio:</strong>{" "}
                      <span>{medical.openingHours}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {medical.conventions.map((conv, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full bg-white text-[#1F3A33] border border-[#D6CFC5] font-medium"
                    >
                      {conv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recensioni dei Pazienti */}
              <div className="space-y-4">
                {content.socialProof.testimonials.slice(0, 2).map((t, idx) => (
                  <blockquote
                    key={idx}
                    className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD6]"
                  >
                    <p className="text-sm text-[#4A4642] italic leading-relaxed mb-3">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <footer className="text-xs font-semibold text-[#1F2421]">
                      {t.name} · <span className="font-normal text-[#57524E]">{t.location}</span>
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>

            {/* Destra: Modulo Diretto per Prenotare il Colloquio / Prima Visita */}
            <div className="lg:col-span-6 lg:sticky lg:top-28">
              <div className="bg-white rounded-2xl border border-[#E5DFD6] p-7 sm:p-8 demo-shadow-elevated">
                <div className="pb-5 mb-6 border-b border-[#EFECE6]">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1F4E46] block mb-1">
                    Segreteria Pazienti · {meta.city}
                  </span>
                  <h3 className="font-[family-name:var(--font-lora)] text-2xl font-normal text-[#1F2421]">
                    Richiedi la disponibilità per una prima visita
                  </h3>
                  <p className="text-xs text-[#57524E] mt-1">
                    Indica la fascia oraria che preferisci: la nostra segreteria ti richiamerà entro 2 ore per confermare il giorno.
                  </p>
                </div>

                {!bookingSubmitted ? (
                  <form onSubmit={handleBookingSubmit} className="space-y-5">
                    {/* Scelta Esigenza Clinica */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1F2421] mb-2">
                        Motivo principale della visita
                      </label>
                      <div className="space-y-2">
                        {content.quiz.question1.options.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setVisitReason(opt)}
                            className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                              visitReason === opt
                                ? "border-[#1F4E46] bg-[#FAF8F5] font-medium text-[#1F2421]"
                                : "border-[#E5DFD6] bg-white text-[#4A4642] hover:border-[#A8A29E]"
                            }`}
                          >
                            <span>{opt}</span>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                visitReason === opt
                                  ? "border-[#1F4E46] bg-[#1F4E46]"
                                  : "border-[#A8A29E]"
                              }`}
                            >
                              {visitReason === opt && (
                                <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Scelta Fascia Oraria Preferita */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1F2421] mb-2">
                        Fascia oraria preferita per l&apos;appuntamento
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Mattina (09:00 - 13:00)", "Pomeriggio (14:30 - 19:00)"].map(
                          (slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setPreferredSlot(slot)}
                              className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                                preferredSlot === slot
                                  ? "border-[#1F4E46] bg-[#1F4E46] text-white"
                                  : "border-[#E5DFD6] bg-[#FAF8F5] text-[#4A4642] hover:border-[#A8A29E]"
                              }`}
                            >
                              {slot}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Dati Paziente */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="patient-name"
                          className="block text-xs font-semibold text-[#1F2421] mb-1"
                        >
                          Nome e Cognome
                        </label>
                        <input
                          id="patient-name"
                          type="text"
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="Es. Laura Ferri"
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#FAF8F5] border border-[#D6CFC5] text-[#1F2421] focus:border-[#1F4E46] focus:bg-white outline-none"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="patient-phone"
                          className="block text-xs font-semibold text-[#1F2421] mb-1"
                        >
                          Recapito Telefonico
                        </label>
                        <input
                          id="patient-phone"
                          type="tel"
                          required
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="Es. 338 412 9087"
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-[#FAF8F5] border border-[#D6CFC5] text-[#1F2421] focus:border-[#1F4E46] focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="demo-btn w-full py-4 px-6 rounded-full bg-[#1F4E46] text-white font-medium text-sm sm:text-[15px] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" strokeWidth={1.5} />
                      <span>{content.ctaButtonText}</span>
                    </button>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={handleSimulateBooking}
                        className="text-xs text-[#57524E] hover:text-[#1F2421] underline underline-offset-4 cursor-pointer"
                      >
                        Stai provando la demo? Simula la ricezione dell&apos;appuntamento →
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#F3EFEA] border border-[#D6CFC5]">
                      <p className="text-sm font-semibold text-[#1F3A33]">
                        Simulazione prenotazione completata
                      </p>
                      <p className="text-xs text-[#4A4642] mt-1 leading-relaxed">
                        Ecco la scheda paziente che la segreteria riceve subito per confermare il colloquio:
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E5DFD6] text-xs space-y-2">
                      <div>
                        <span className="text-[#57524E]">Paziente:</span>{" "}
                        <strong className="text-[#1F2421]">
                          {patientName || "Laura Ferri"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#57524E]">Telefono:</span>{" "}
                        <strong className="text-[#1F2421]">
                          {patientPhone || "338 412 9087"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#57524E]">Esigenza indicata:</span>{" "}
                        <strong className="text-[#1F2421]">{visitReason}</strong>
                      </div>
                      <div>
                        <span className="text-[#57524E]">Fascia oraria:</span>{" "}
                        <strong className="text-[#1F4E46]">{preferredSlot}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBookingSubmitted(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#57524E] hover:text-[#1F2421] cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Torna al modulo di prenotazione
                    </button>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-[#EFECE6] flex items-center justify-center gap-2 text-xs text-[#57524E]">
                  <Lock className="w-3.5 h-3.5 text-[#78716C] shrink-0" />
                  <span>{content.trustMicrocopy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Sanitario Conforme */}
      <footer className="bg-[#1F2421] text-[#A8A29E] py-10 text-xs">
        <div className="demo-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong className="text-white">{meta.companyName}</strong> · {meta.city}
            {meta.vatNumber && meta.vatNumber !== "Non trovata"
              ? ` · P.IVA ${meta.vatNumber}`
              : ""}{" "}
            · Dir. San. {medical.directorName} ({medical.alboRegistration})
          </div>
          <div>Segreteria Pazienti: {meta.phone}</div>
        </div>
      </footer>
    </div>
  );
}
