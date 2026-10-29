"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Search,
  Send,
  ExternalLink,
  ShieldCheck,
  Zap,
  Building,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Mail,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  Smartphone,
} from "lucide-react";
import { LeadConfig } from "@/types/lead";

interface LeadItem {
  slug: string;
  config: LeadConfig;
  preflight: {
    targetUrl?: string;
    estimatedMobileLcpSeconds?: number;
    qualification?: {
      recommendedStrategy?: string;
      strategyReason?: string;
      agencyDetection?: {
        detectedAgencyLinks?: Array<{ href: string; label: string }>;
        detectedAgencyNames?: string[];
      };
    };
  } | null;
  hasAssets: {
    hasOldMobile: boolean;
    hasNewMobile: boolean;
    hasLogo: boolean;
    hasHero: boolean;
  };
  outreachPackPreview: string | null;
  fullOutreachPack: string | null;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Dashboard Data
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [smtpUser, setSmtpUser] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Scouting Form
  const [keyword, setKeyword] = useState("infissi pvc cuneo");
  const [maxLeads, setMaxLeads] = useState(5);
  const [scoutingRunning, setScoutingRunning] = useState(false);
  const [scoutingOutput, setScoutingOutput] = useState<string | null>(null);

  // Filter & UI State
  const [filterStrategy, setFilterStrategy] = useState<"ALL" | "DIRECT" | "WHITELABEL">("ALL");
  const [expandedOutreach, setExpandedOutreach] = useState<Record<string, boolean>>({});
  const [sendingSlug, setSendingSlug] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<Record<string, { success: boolean; message: string }>>({});

  // Check Auth on Mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated) {
        fetchLeads();
      }
    } catch {
      setIsAuthenticated(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoadingLogin(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Password errata.");
        setLoadingLogin(false);
        return;
      }
      setIsAuthenticated(true);
      fetchLeads();
    } catch {
      setLoginError("Errore durante il login.");
    } finally {
      setLoadingLogin(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAuthenticated(false);
    setPassword("");
  }

  async function fetchLeads() {
    setLoadingLeads(true);
    try {
      const res = await fetch("/api/admin/leads");
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
        setSmtpConfigured(data.smtpConfigured);
        setSmtpUser(data.smtpUser);
      }
    } catch (err) {
      console.error("Errore fetch leads:", err);
    } finally {
      setLoadingLeads(false);
    }
  }

  async function handleStartScouting(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setScoutingRunning(true);
    setScoutingOutput(`Avvio ricerca autonoma Meta Ad Library per: "${keyword}"...`);
    try {
      const res = await fetch("/api/admin/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, maxLeads }),
      });
      const data = await res.json();
      if (data.success) {
        setScoutingOutput(`Completato!\n\n${data.stdout || data.message}`);
        fetchLeads();
      } else {
        setScoutingOutput(`Errore: ${data.error || "Impossibile completare lo scouting"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Errore di connessione";
      setScoutingOutput(`Errore: ${msg}`);
    } finally {
      setScoutingRunning(false);
    }
  }

  async function handleSendEmail(slug: string, isFollowUp = false) {
    setSendingSlug(slug);
    try {
      const res = await fetch("/api/admin/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, isFollowUp }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendResult((prev) => ({
          ...prev,
          [slug]: {
            success: true,
            message: isFollowUp
              ? "Follow-up con demo inviato con successo!"
              : "Prima email plain-text inviata con successo!",
          },
        }));
      } else {
        setSendResult((prev) => ({
          ...prev,
          [slug]: { success: false, message: data.error || "Errore invio email" },
        }));
      }
    } catch {
      setSendResult((prev) => ({
        ...prev,
        [slug]: { success: false, message: "Errore di connessione al server" },
      }));
    } finally {
      setSendingSlug(null);
    }
  }

  // Loading Screen
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">TechPyre Outbound</h1>
              <p className="text-xs text-zinc-400">Command Center Riservato</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Chiave d&apos;Accesso Amministratore
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci password..."
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2"
            >
              {loadingLogin ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifica...</span>
                </>
              ) : (
                <span>Accedi al Command Center</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-center text-zinc-600">
            TechPyre Autonomous Outbound Engine - 24/7 Deployment
          </p>
        </div>
      </div>
    );
  }

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    const strat = l.preflight?.qualification?.recommendedStrategy;
    if (filterStrategy === "DIRECT") return strat === "DIRECT_BUYER";
    if (filterStrategy === "WHITELABEL") return strat === "AGENCY_COEXISTENCE_OR_WHITELABEL";
    return true;
  });

  const totalLeads = leads.length;
  const directBuyers = leads.filter(
    (l) => l.preflight?.qualification?.recommendedStrategy === "DIRECT_BUYER"
  ).length;
  const agencyLeads = leads.filter(
    (l) => l.preflight?.qualification?.recommendedStrategy === "AGENCY_COEXISTENCE_OR_WHITELABEL"
  ).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">TechPyre Outbound Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Antigravity Bridge &middot; Aruba SMTP:{" "}
                <span className="text-zinc-300 font-mono">{smtpUser}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://techpyre.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <span>techpyre.eu</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Esci</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 w-full">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-400 mb-1">Lead & Demo Attive</div>
            <div className="text-2xl font-bold text-white">{totalLeads}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Con asset locali & JSON</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-emerald-400 mb-1">Direct Buyer Puri</div>
            <div className="text-2xl font-bold text-emerald-300">{directBuyers}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Zero agenzia, sito lento</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-purple-400 mb-1">White-Label / Agenzia</div>
            <div className="text-2xl font-bold text-purple-300">{agencyLeads}</div>
            <div className="text-[11px] text-zinc-500 mt-1">Coesistenza o B2B2B</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-amber-400 mb-1">Velocita Guadagnata</div>
            <div className="text-2xl font-bold text-amber-300">&gt; 10s &rarr; 0.3s</div>
            <div className="text-[11px] text-zinc-500 mt-1">Next.js Edge SSG</div>
          </div>
        </div>

        {/* Section 1: Launcher Scouting Meta Ad Library */}
        <section className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">
              Lancia Nuovo Scouting Meta Ad Library
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mb-5 max-w-2xl leading-relaxed">
            Inserisci la nicchia o parola chiave (es. &ldquo;infissi serramenti cuneo&rdquo;, &ldquo;impianti fotovoltaici brescia&rdquo;, &ldquo;dentisti milano&rdquo;). L&apos;agente cerchera le inserzioni attive, filtrera i funnel WhatsApp e i siti gia performanti, scarichera i loghi e creera la demo.
          </p>

          <form onSubmit={handleStartScouting} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Es. serramenti infissi cuneo..."
                  disabled={scoutingRunning}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              </div>

              <div className="md:col-span-2">
                <select
                  value={maxLeads}
                  onChange={(e) => setMaxLeads(Number(e.target.value))}
                  disabled={scoutingRunning}
                  className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={3}>3 Lead</option>
                  <option value={5}>5 Lead</option>
                  <option value={10}>10 Lead</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={scoutingRunning}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-zinc-950 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  {scoutingRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Ricerca...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Avvia Scout</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {scoutingOutput && (
              <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                {scoutingOutput}
              </div>
            )}
          </form>
        </section>

        {/* Section 2: Lista Lead & Dettaglio Outreach */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">Lead & Demo CRO Pronte</h2>
              <p className="text-xs text-zinc-400">
                Visualizza la demo, revisiona l&apos;email o invia l&apos;outreach con 1 click.
              </p>
            </div>

            {/* Strategy Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <button
                onClick={() => setFilterStrategy("ALL")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterStrategy === "ALL"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Tutti ({leads.length})
              </button>
              <button
                onClick={() => setFilterStrategy("DIRECT")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterStrategy === "DIRECT"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Direct Buyer ({directBuyers})
              </button>
              <button
                onClick={() => setFilterStrategy("WHITELABEL")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterStrategy === "WHITELABEL"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                White-Label ({agencyLeads})
              </button>
            </div>
          </div>

          {loadingLeads ? (
            <div className="text-center py-12 text-zinc-500 text-xs">Caricamento lead...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800 rounded-2xl text-zinc-500 text-xs">
              Nessun lead trovato con i filtri selezionati.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map((item) => {
                const isDirect =
                  item.preflight?.qualification?.recommendedStrategy === "DIRECT_BUYER";
                const isAgency =
                  item.preflight?.qualification?.recommendedStrategy ===
                  "AGENCY_COEXISTENCE_OR_WHITELABEL";
                const isExpanded = Boolean(expandedOutreach[item.slug]);
                const sending = sendingSlug === item.slug;
                const result = sendResult[item.slug];

                return (
                  <div
                    key={item.slug}
                    className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4 hover:border-zinc-700 transition-colors"
                  >
                    {/* Lead Card Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-bold text-base text-white">
                            {item.config.meta.companyName}
                          </h3>
                          {isDirect && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                              Direct Buyer
                            </span>
                          )}
                          {isAgency && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 text-[11px] font-semibold border border-purple-500/20">
                              White-Label / Agenzia
                            </span>
                          )}
                          <span className="text-xs text-zinc-500">
                            P.IVA: {item.config.meta.vatNumber || "N/D"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                          <span>
                            <strong className="text-zinc-300">Titolare:</strong>{" "}
                            {item.config.meta.decisionMakerName}
                          </span>
                          <span>&middot;</span>
                          <span>
                            <strong className="text-zinc-300">Email:</strong>{" "}
                            <a
                              href={`mailto:${item.config.meta.targetEmail}`}
                              className="text-emerald-400 hover:underline"
                            >
                              {item.config.meta.targetEmail}
                            </a>
                          </span>
                          <span>&middot;</span>
                          <span>
                            <strong className="text-zinc-300">Citta:</strong>{" "}
                            {item.config.meta.city}
                          </span>
                        </div>
                      </div>

                      {/* Speed Metrics */}
                      <div className="flex items-center gap-3 bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800 text-xs">
                        <div className="text-center">
                          <div className="text-[10px] text-zinc-500">Sito Attuale</div>
                          <div className="font-bold text-amber-400">
                            {item.config.audit.originalLcpSeconds}s
                          </div>
                        </div>
                        <div className="text-zinc-600">&rarr;</div>
                        <div className="text-center">
                          <div className="text-[10px] text-zinc-500">Demo CRO</div>
                          <div className="font-bold text-emerald-400">0.3s</div>
                        </div>
                      </div>
                    </div>

                    {/* Agency Callout if detected */}
                    {isAgency &&
                      item.preflight?.qualification?.agencyDetection?.detectedAgencyLinks &&
                      item.preflight.qualification.agencyDetection.detectedAgencyLinks.length >
                        0 && (
                        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
                          <Building className="w-4 h-4 shrink-0 text-purple-400" />
                          <span>
                            <strong>Agenzia rilevata nel footer:</strong>{" "}
                            {item.preflight.qualification.agencyDetection.detectedAgencyLinks
                              .map((a) => `${a.label} (${a.href})`)
                              .join(", ")}
                          </span>
                        </div>
                      )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/60">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Demo Links */}
                        <a
                          href={`/demo/${item.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Vedi Demo Live</span>
                        </a>

                        <a
                          href={`/demo/${item.slug}?wl=1`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                          <span>Demo White-Label (?wl=1)</span>
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedOutreach((prev) => ({
                              ...prev,
                              [item.slug]: !prev[item.slug],
                            }))
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/40 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Testi Email & DM</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* 1-Click Send Button via Aruba SMTP */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={sending}
                          onClick={() => handleSendEmail(item.slug, false)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-xs font-semibold text-zinc-950 transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                        >
                          {sending ? (
                            <>
                              <div className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                              <span>Invio...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              <span>Invia 1ª Email SMTP</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Feedback Alert */}
                    {result && (
                      <div
                        className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                          result.success
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                        }`}
                      >
                        {result.success ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        )}
                        <span>{result.message}</span>
                      </div>
                    )}

                    {/* Expandable Outreach Pack */}
                    {isExpanded && (
                      <div className="mt-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-4">
                        <div>
                          <div className="font-semibold text-emerald-400 mb-1">
                            1. Prima Email al Titolare (Zero Link)
                          </div>
                          <div className="text-zinc-400 text-[11px] mb-1 font-mono">
                            Oggetto: {item.config.outreach.emailSubject}
                          </div>
                          <div className="p-3 bg-zinc-900 rounded-lg text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {item.config.outreach.emailPlainTextBody}
                          </div>
                        </div>

                        <div>
                          <div className="font-semibold text-purple-400 mb-1">
                            2. Follow-Up con Link Demo (Quando risponde &ldquo;LINK&rdquo;)
                          </div>
                          <div className="p-3 bg-zinc-900 rounded-lg text-zinc-300 whitespace-pre-wrap leading-relaxed">
                            {item.config.outreach.followUpWithLinkBody}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
