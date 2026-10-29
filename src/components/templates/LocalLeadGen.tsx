"use client";

import React from "react";
import { Check, MapPin, Phone, ShieldCheck, Star, Award, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { LeadConfig } from "@/types/lead";
import InteractiveQuiz from "@/components/InteractiveQuiz";
import AdaptiveLogo from "@/components/AdaptiveLogo";
import TechPyreFooter from "@/components/TechPyreFooter";

interface TemplateProps {
  data: LeadConfig;
}

export default function LocalLeadGen({ data }: TemplateProps) {
  const { meta, content, theme } = data;
  const isDarkHeader = theme.headerBgMode === "dark";

  const bullets: [string, string, string] = content.heroBullets || [
    `Sopralluogo tecnico e preventivo scritto a ${meta.city} e provincia`,
    "Squadre di installazione interne abilitate (nessun subappalto esterno)",
    "Garanzia contrattuale sui tempi di posa e assistenza post-intervento",
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-stone-700 pb-28 md:pb-0 font-sans">
      {/* Header Sticky con Logo Adattivo e Contatto */}
      <header
        className={`sticky top-[29px] sm:top-[36px] z-40 backdrop-blur-md border-b transition-colors ${
          isDarkHeader
            ? "bg-[#0E1013]/95 text-white border-zinc-800"
            : "bg-white/95 text-stone-800 border-stone-200"
        }`}
        style={theme.headerBgHex ? { backgroundColor: theme.headerBgHex } : undefined}
      >
        <div className="demo-container h-15 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AdaptiveLogo
              src={content.logoLocalPath}
              alt={meta.companyName}
              className="h-8 sm:h-10 w-auto object-contain"
              headerBgMode={theme.headerBgMode}
              logoBrightness={theme.logoBrightness}
              fallbackName={meta.companyName}
            />
            <span
              className={`hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-md border ${
                isDarkHeader
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300"
                  : "bg-stone-100 border-stone-200 text-stone-700"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-stone-500" />
              Operativi a {meta.city} e provincia
            </span>
          </div>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={`tel:${meta.phone.replace(/\s+/g, "")}`}
            style={{ backgroundColor: "var(--primary)" }}
            className="demo-btn inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-lg text-white font-semibold text-xs sm:text-sm shadow-sm shrink-0"
          >
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Chiama ora:</span>
            <span>{meta.phone}</span>
          </motion.a>
        </div>
      </header>

      {/* Hero Split 50/50: A sinistra promessa e garanzie, a destra il Quiz Preventivo */}
      <section className="demo-section bg-[#FAFAF9] border-b border-stone-200">
        <div className="demo-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-6 space-y-6 pt-2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-stone-200 text-xs font-semibold text-stone-800 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>{content.badgeTop}</span>
              </div>

              <h1 className="demo-h1 font-[family-name:var(--font-jakarta)] font-extrabold text-stone-900 tracking-tight">
                {content.heroHeadline}
              </h1>

              <p className="demo-body text-stone-600 leading-relaxed text-base sm:text-lg">
                {content.heroSubheadline}
              </p>

              {/* 3 Punti Chiave con spunta verde */}
              <ul className="space-y-3 pt-1">
                {bullets.map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.1 + idx * 0.08 }}
                    className="flex items-start gap-3 text-[15px] sm:text-base font-medium text-stone-800"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-600/12 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Box Recensioni Google Verificate */}
              <div className="p-4 rounded-xl bg-white border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex text-amber-500" aria-label="Valutazione 5 stelle">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-stone-900">
                    {content.socialProof.reviewsSummary}
                  </span>
                </div>
                <span className="text-xs font-medium text-stone-600">
                  <strong className="text-stone-900 font-bold">{content.socialProof.mainStatValue}</strong>{" "}
                  {content.socialProof.mainStatLabel}
                </span>
              </div>

              {/* CTA Immediata per Mobile (Sopra la piega, potente ma non invasiva) */}
              <div className="pt-1 sm:hidden">
                <motion.a
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  href="#preventivo-rapido"
                  style={{ backgroundColor: "var(--primary)" }}
                  className="demo-btn w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>{content.ctaButtonText || "Calcola Preventivo Rapido"}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </motion.a>
              </div>
            </motion.div>

            {/* Colonna Destra: Simulatore Preventivo a 3 Step */}
            <motion.div
              id="preventivo-rapido"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-6"
            >
              <InteractiveQuiz data={data} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sezione Lavori sul Territorio & Metodo Operativo */}
      <section className="demo-section bg-white border-b border-stone-200">
        <div className="demo-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-7"
            >
              <figure className="rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shadow-sm">
                <img
                  src={content.heroImageLocalPath}
                  alt={`${meta.companyName} - Intervento a ${meta.city}`}
                  fetchPriority="high"
                  width={800}
                  height={500}
                  className="w-full aspect-[16/10] object-cover"
                />
                {content.heroImageCaption && (
                  <figcaption className="px-5 py-3 bg-white border-t border-stone-200 text-xs text-stone-600 font-medium flex items-center justify-between">
                    <span>{content.heroImageCaption}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Installazione Certificata
                    </span>
                  </figcaption>
                )}
              </figure>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="lg:col-span-5 space-y-4"
            >
              <span
                style={{ color: "var(--primary)" }}
                className="text-xs font-bold uppercase tracking-wider block"
              >
                Presenza diretta a {meta.city}
              </span>
              <h2 className="demo-h2 font-[family-name:var(--font-jakarta)] font-extrabold text-stone-900 leading-tight">
                Un unico referente tecnico dal sopralluogo alla posa in opera
              </h2>
              <p className="demo-body text-stone-600 leading-relaxed">
                A differenza dei portali nazionali che rivendono la tua richiesta a più ditte esterne, gestiamo ogni intervento con i nostri tecnici interni, garantendo tempi certi e assistenza diretta sul territorio.
              </p>
              <div className="pt-2">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#preventivo-rapido"
                  style={{ backgroundColor: "var(--accent)" }}
                  className="demo-btn inline-flex items-center gap-2 px-5 py-3 rounded-lg text-white font-semibold text-sm shadow-sm"
                >
                  <span>Calcola il tuo preventivo in 30 secondi</span>
                </motion.a>
              </div>
            </motion.div>
          </div>

          {/* 3 Garanzie Operative */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.valueProps.map((prop, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="p-7 rounded-xl bg-[#FAFAF9] border border-stone-200/90 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-800 shadow-2xs">
                      <ShieldCheck className="w-5 h-5" style={{ color: "var(--primary)" }} />
                    </div>
                    {prop.metric && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-stone-100 border border-stone-200 text-stone-800 font-mono">
                        {prop.metric}
                      </span>
                    )}
                  </div>
                  <h3 className="demo-h3 font-[family-name:var(--font-jakarta)] font-bold text-stone-900 mb-2.5">
                    {prop.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-stone-600 leading-relaxed">
                    {prop.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/80 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Garanzia scritta inclusa nel preventivo</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recensioni dei Clienti della Zona - NO STOCK BULLSHIT */}
      <section className="demo-section bg-[#FAFAF9]">
        <div className="demo-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-[60ch]">
              <span
                style={{ color: "var(--primary)" }}
                className="text-xs font-bold uppercase tracking-wider block mb-2"
              >
                Esperienze Reali sul Territorio
              </span>
              <h2 className="demo-h2 font-[family-name:var(--font-jakarta)] font-extrabold text-stone-900">
                Cosa dicono i clienti di {meta.city} e provincia
              </h2>
            </div>

            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white border border-stone-200 text-sm font-semibold text-stone-900 shadow-2xs">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <span>{content.socialProof.reviewsSummary}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.socialProof.testimonials.map((t, idx) => (
              <motion.article
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="p-7 rounded-xl bg-white border border-stone-200/90 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500" />
                      ))}
                    </div>
                    {t.roleOrContext && (
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded">
                        {t.roleOrContext}
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] text-stone-700 leading-relaxed mb-6 font-normal">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <strong className="text-stone-900 font-bold">{t.name}</strong>
                  <span className="text-stone-500 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" /> {t.location}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Ufficiale con Firma TechPYRE */}
      <TechPyreFooter data={data} />

      {/* Barra Fissa Mobile — Call To Action Potenziata ma Non Invasiva */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-stone-200/90 py-2.5 px-4 shadow-[0_-6px_24px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-12 gap-2.5 items-center">
          {/* Secondario: Chiama Subito (4/12 = 33% larghezza) */}
          <a
            href={`tel:${meta.phone.replace(/\s+/g, "")}`}
            className="col-span-4 flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold text-xs border border-stone-200/90 transition-colors active:scale-98"
          >
            <Phone className="w-3.5 h-3.5 text-stone-700 shrink-0" />
            <span>Chiama</span>
          </a>

          {/* Primario: Preventivo Rapido con colore brand e freccia (8/12 = 67% larghezza) */}
          <a
            href="#preventivo-rapido"
            style={{ backgroundColor: "var(--primary)" }}
            className="col-span-8 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98"
          >
            <span className="truncate">{content.ctaButtonText || "Preventivo Rapido"}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}
