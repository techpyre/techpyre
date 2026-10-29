"use client";

import React, { useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Lock, RotateCcw } from "lucide-react";
import { LeadConfig } from "@/types/lead";

interface InteractiveQuizProps {
  data: LeadConfig;
}

export default function InteractiveQuiz({ data }: InteractiveQuizProps) {
  const { meta, content } = data;
  const { quiz, ctaButtonText, trustMicrocopy } = content;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [answer1, setAnswer1] = useState<string>(quiz.question1.options[0]);
  const [answer2, setAnswer2] = useState<string>(quiz.question2.options[0]);
  const [fullName, setFullName] = useState<string>("");
  const [phoneOrEmail, setPhoneOrEmail] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const syncAriaInvalid = (
    e: React.FocusEvent<HTMLInputElement> | React.FormEvent<HTMLInputElement>
  ) => {
    const el = e.currentTarget;
    if (typeof el.matches === "function") {
      try {
        el.setAttribute("aria-invalid", el.matches(":user-invalid") ? "true" : "false");
      } catch {
        el.setAttribute("aria-invalid", !el.checkValidity() ? "true" : "false");
      }
    }
  };

  const handleSelectStep1 = (opt: string) => {
    setAnswer1(opt);
    setStep(2);
  };

  const handleSelectStep2 = (opt: string) => {
    setAnswer2(opt);
    setStep(3);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(4);
    }, 250);
  };

  const handleInstantDemoSimulation = () => {
    if (!fullName) setFullName("Marco Bianchi");
    if (!phoneOrEmail) setPhoneOrEmail("340 892 3411");
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setFullName("");
    setPhoneOrEmail("");
  };

  return (
    <div className="w-full bg-white rounded-xl border border-stone-200 shadow-[0_12px_32px_-8px_rgba(28,25,23,0.08)] text-stone-900 overflow-hidden">
      {/* Header del simulatore */}
      <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
        <div>
          <span className="block text-sm font-bold text-stone-900">
            Richiedi un preventivo gratuito
          </span>
          <span className="text-xs text-stone-500">
            {step === 1 && "Passaggio 1 di 3 · Tipologia di intervento"}
            {step === 2 && "Passaggio 2 di 3 · Dettagli"}
            {step === 3 && "Passaggio 3 di 3 · Dove inviarti la stima"}
            {step === 4 && "Riepilogo richiesta inviata"}
          </span>
        </div>

        <span className="text-xs font-semibold text-stone-600 px-2.5 py-1 rounded-md bg-white border border-stone-200">
          {step === 4 ? "Completato" : `${step} / 3`}
        </span>
      </div>

      {/* Barra di progresso */}
      <div className="w-full h-1 bg-stone-100">
        <div
          style={{
            backgroundColor: "var(--primary)",
            width: step === 1 ? "33%" : step === 2 ? "66%" : "100%",
          }}
          className="h-full transition-all duration-300"
        />
      </div>

      <div className="p-6 sm:p-7">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                {quiz.question1.title}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Seleziona una risposta per continuare:
              </p>
            </div>

            <div className="space-y-2.5">
              {quiz.question1.options.map((opt, idx) => {
                const selected = answer1 === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectStep1(opt)}
                    className={`w-full text-left p-4 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      selected
                        ? "border-stone-900 bg-stone-50/80"
                        : "border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        style={{
                          borderColor: selected ? "var(--primary)" : "#A8A29E",
                          backgroundColor: selected ? "var(--primary)" : "transparent",
                        }}
                        className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                      >
                        {selected && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                      </span>
                      <span className="font-medium text-sm sm:text-[15px] text-stone-900">
                        {opt}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Indietro
              </button>
              <span className="text-xs text-stone-500 truncate max-w-[220px]">
                Scelta: <strong className="text-stone-800">{answer1}</strong>
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                {quiz.question2.title}
              </h3>
            </div>

            <div className="space-y-2.5">
              {quiz.question2.options.map((opt, idx) => {
                const selected = answer2 === opt;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectStep2(opt)}
                    className={`w-full text-left p-4 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      selected
                        ? "border-stone-900 bg-stone-50/80"
                        : "border-stone-200 bg-white hover:border-stone-400 hover:bg-stone-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        style={{
                          borderColor: selected ? "var(--primary)" : "#A8A29E",
                          backgroundColor: selected ? "var(--primary)" : "transparent",
                        }}
                        className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                      >
                        {selected && <Check className="w-3 h-3 text-white stroke-[2.5]" />}
                      </span>
                      <span className="font-medium text-sm sm:text-[15px] text-stone-900">
                        {opt}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Modifica risposte
              </button>
              <span className="text-xs text-emerald-700 font-medium">
                Ultimo passaggio
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                {quiz.finalStepTitle}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Riepilogo: <strong className="text-stone-700">{answer1}</strong> ·{" "}
                <strong className="text-stone-700">{answer2}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="lead-name"
                  className="block text-xs font-semibold text-stone-800 mb-1"
                >
                  Nome e Cognome
                </label>
                <span id="lead-name-hint" className="block text-xs text-stone-500 mb-1.5">
                  Es. Marco Bianchi
                </span>
                <input
                  id="lead-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={syncAriaInvalid}
                  onInput={syncAriaInvalid}
                  aria-describedby="lead-name-hint"
                  aria-errormessage="lead-name-error"
                  placeholder="Il tuo nome e cognome"
                  className="quiz-input w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-stone-900 outline-none transition-colors"
                />
                <div
                  id="lead-name-error"
                  className="quiz-error-msg hidden items-center gap-1.5 text-xs text-red-700 mt-1.5 font-medium"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Inserisci il tuo nome (almeno 2 caratteri).</span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="lead-phone"
                  className="block text-xs font-semibold text-stone-800 mb-1"
                >
                  Numero di Telefono
                </label>
                <span id="lead-phone-hint" className="block text-xs text-stone-500 mb-1.5">
                  Per ricevere il preventivo o concordare il sopralluogo (es. 340 123 4567)
                </span>
                <input
                  id="lead-phone"
                  name="tel"
                  type="tel"
                  inputMode="tel"
                  required
                  pattern="[0-9+\s\-()]{7,20}"
                  autoComplete="tel"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  onBlur={syncAriaInvalid}
                  onInput={syncAriaInvalid}
                  aria-describedby="lead-phone-hint"
                  aria-errormessage="lead-phone-error"
                  placeholder="Es. 340 123 4567"
                  className="quiz-input w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-stone-900 outline-none transition-colors"
                />
                <div
                  id="lead-phone-error"
                  className="quiz-error-msg hidden items-center gap-1.5 text-xs text-red-700 mt-1.5 font-medium"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Inserisci un numero di telefono valido.</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: "var(--accent)" }}
              className="demo-btn w-full py-3.5 px-6 rounded-lg text-white font-semibold text-sm sm:text-[15px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isSubmitting ? "Invio in corso..." : ctaButtonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleInstantDemoSimulation}
                className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-4 cursor-pointer"
              >
                Stai provando la demo? Clicca qui per vedere cosa riceve l&apos;azienda →
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SCHERMATA DI CONFERMA PER L'IMPRENDITORE */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-sm font-semibold text-emerald-950">
                Simulazione completata
              </p>
              <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                Ecco la scheda già filtrata che riceveresti in tempo reale su WhatsApp o via
                email ogni volta che un potenziale cliente compila il modulo:
              </p>
            </div>

            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 font-semibold text-stone-900">
                <span>Nuova richiesta preventivo · {meta.city}</span>
                <span className="text-emerald-700">Qualificata</span>
              </div>
              <div className="space-y-1.5 text-stone-700">
                <div>
                  <span className="text-stone-500">Cliente:</span>{" "}
                  <strong className="text-stone-900">{fullName || "Marco Bianchi"}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Telefono:</span>{" "}
                  <strong className="text-stone-900">{phoneOrEmail || "340 892 3411"}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Immobile / Intervento:</span>{" "}
                  <strong className="text-stone-900">{answer1}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Dettaglio:</span>{" "}
                  <strong className="text-stone-900">{answer2}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Riprova il simulatore dall&apos;inizio
            </button>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-center gap-1.5 text-xs text-stone-500">
          <Lock className="w-3.5 h-3.5 shrink-0 text-stone-400" />
          <span>{trustMicrocopy}</span>
        </div>
      </div>
    </div>
  );
}
