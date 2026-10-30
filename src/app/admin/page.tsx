"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Search,
  Send,
  ExternalLink,
  Zap,
  Building,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Mail,
  Clock,
  Sparkles,
  Smartphone,
  Eye,
  Settings,
  RefreshCw,
  MessageSquare,
  Flame,
  User,
  KeyRound,
  Filter,
  Check,
  Globe,
} from "lucide-react";
import { LeadConfig } from "@/types/lead";

interface UserProfile {
  username: string;
  displayName: string;
  role: "admin" | "member" | "special";
  roleLabel: string;
  defaultEmail?: string;
  isSpecialFriend?: boolean;
}

interface LeadItem {
  slug: string;
  config: LeadConfig;
  preflight?: {
    targetUrl?: string;
    estimatedMobileLcpSeconds?: number;
  } | null;
  hasAssets: {
    hasLogo: boolean;
    hasHero: boolean;
  };
  lastSend?: {
    sentAt: string;
    type: string;
    recipient: string;
    subject: string;
    messageId: string;
    sentBy?: string;
  } | null;
  sendCount?: number;
  visits?: {
    slug: string;
    companyName: string;
    totalVisits: number;
    uniqueSessions: number;
    firstVisitAt: string;
    lastVisitAt: string;
    lastDevice: string;
    lastDeviceType: string;
    visits: Array<{
      id: string;
      timestamp: string;
      formattedDate: string;
      device: string;
      deviceType: string;
      referrer: string;
      screen: string;
      ip: string;
    }>;
  } | null;
  hasReplied?: boolean;
  statusNotes?: string | null;
}

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Leads & Data
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "READY" | "SENT" | "VISITED" | "REPLIED">("ALL");

  // Scout State
  const [keyword, setKeyword] = useState("infissi torino");
  const [maxLeads, setMaxLeads] = useState(5);
  const [scoutingRunning, setScoutingRunning] = useState(false);
  const [scoutMessage, setScoutMessage] = useState<string | null>(null);

  // Email Sending & Modals
  const [sendingSlug, setSendingSlug] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{ [slug: string]: { success: boolean; message: string } }>({});
  const [previewLead, setPreviewLead] = useState<LeadItem | null>(null);
  const [visitsDetailLead, setVisitsDetailLead] = useState<LeadItem | null>(null);

  // SMTP Settings Modal
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [smtpFeedback, setSmtpFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
        fetchLeads();
        fetchProfile();
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
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Credenziali non corrette.");
        setLoadingLogin(false);
        return;
      }
      setIsAuthenticated(true);
      setCurrentUser(data.user);
      fetchLeads();
      fetchProfile();
    } catch {
      setLoginError("Errore durante il login.");
    } finally {
      setLoadingLogin(false);
    }
  }

  function handleQuickLogin(user: string, pass: string) {
    setUsernameInput(user);
    setPasswordInput(pass);
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsernameInput("");
    setPasswordInput("");
  }

  async function fetchLeads() {
    setLoadingLeads(true);
    try {
      const res = await fetch("/api/admin/leads");
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
      if (data.currentUser) {
        setCurrentUser(data.currentUser);
      }
    } catch (err) {
      console.error("Errore recupero lead:", err);
    } finally {
      setLoadingLeads(false);
    }
  }

  async function fetchProfile() {
    try {
      const res = await fetch("/api/admin/profile");
      const data = await res.json();
      if (data.smtpDetails) {
        setSmtpConfigured(data.smtpConfigured);
        setSmtpHost(data.smtpDetails.smtpHost || "");
        setSmtpPort(String(data.smtpDetails.smtpPort || 465));
        setSmtpUser(data.smtpDetails.smtpUser || "");
        setSenderName(data.smtpDetails.senderName || "");
        setSenderEmail(data.smtpDetails.senderEmail || "");
      }
    } catch {}
  }

  async function handleSaveSmtp(testOnly = false) {
    setSmtpFeedback(null);
    if (testOnly) setTestingSmtp(true);
    else setSavingSmtp(true);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smtpHost,
          smtpPort: Number(smtpPort),
          smtpUser,
          smtpPass,
          senderName,
          senderEmail,
          testOnly,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSmtpFeedback({ type: "error", text: data.error || "Verifica SMTP fallita." });
      } else {
        setSmtpFeedback({
          type: "success",
          text: testOnly
            ? "Connessione SMTP verificata con successo!"
            : "Credenziali email salvate e pronte all'uso!",
        });
        if (!testOnly) {
          setSmtpConfigured(true);
          setTimeout(() => setShowSmtpModal(false), 1500);
        }
      }
    } catch {
      setSmtpFeedback({ type: "error", text: "Errore di comunicazione col server." });
    } finally {
      setTestingSmtp(false);
      setSavingSmtp(false);
    }
  }

  async function handleStartScouting(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setScoutingRunning(true);
    setScoutMessage(`Ricerca lead in corso per: "${keyword}"...`);
    try {
      const res = await fetch("/api/admin/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), maxLeads }),
      });
      const data = await res.json();
      if (data.success) {
        setScoutMessage(
          `Completato! ${data.discovered?.length || 0} nuove aziende qualificate.`
        );
        fetchLeads();
      } else {
        setScoutMessage(`Errore: ${data.error || "Impossibile completare la ricerca"}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Errore di connessione";
      setScoutMessage(`Errore: ${msg}`);
    } finally {
      setScoutingRunning(false);
    }
  }

  async function handleSendEmail(slug: string, isFollowUp = false) {
    setSendingSlug(slug);
    setSendResult((prev) => ({ ...prev, [slug]: { success: false, message: "" } }));
    try {
      const res = await fetch("/api/admin/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, isFollowUp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult((prev) => ({
          ...prev,
          [slug]: { success: true, message: data.message || "Email inviata!" },
        }));
        fetchLeads();
      } else {
        setSendResult((prev) => ({
          ...prev,
          [slug]: { success: false, message: data.error || "Errore durante l'invio" },
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

  // KPIs
  const totalLeadsCount = leads.length;
  const sentCount = leads.filter((l) => (l.sendCount || 0) > 0).length;
  const readyCount = leads.filter((l) => (l.sendCount || 0) === 0).length;
  const visitedCount = leads.filter((l) => (l.visits?.totalVisits || 0) > 0).length;
  const repliedCount = leads.filter((l) => l.hasReplied).length;

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = lead.config.meta.companyName.toLowerCase().includes(q);
      const matchCity = lead.config.meta.city.toLowerCase().includes(q);
      const matchEmail = lead.config.meta.targetEmail.toLowerCase().includes(q);
      const matchSlug = lead.slug.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchEmail && !matchSlug) return false;
    }

    // Tab filter
    if (activeTab === "READY") return (lead.sendCount || 0) === 0;
    if (activeTab === "SENT") return (lead.sendCount || 0) > 0 && !lead.hasReplied;
    if (activeTab === "VISITED") return (lead.visits?.totalVisits || 0) > 0;
    if (activeTab === "REPLIED") return Boolean(lead.hasReplied);

    return true;
  });

  // 1. Schermata di Login con 3 Profili
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090E] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Background glow subtle */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0D121D] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Tech<span className="text-blue-500">PYRE</span>
                <span className="text-xs uppercase px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full font-mono">
                  Engine
                </span>
              </h1>
              <p className="text-xs text-white/50">Outbound Intelligence Platform</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                Username Profilo
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="es. riccardogranza"
                required
                className="w-full bg-[#121826] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Inserisci la password"
                required
                className="w-full bg-[#121826] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingLogin ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Accesso in corso...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Accedi alla Dashboard
                </>
              )}
            </button>
          </form>

          {/* Quick profile selectors per comodità */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[11px] uppercase tracking-wider text-white/40 font-mono mb-3">
              Profili autorizzati:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("riccardogranza", "5149")}
                className="text-left px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-xs text-white/80 transition-all flex items-center justify-between group"
              >
                <span>
                  <strong>Riccardo Granza</strong>{" "}
                  <span className="text-blue-400">(Admin)</span>
                </span>
                <span className="text-[10px] text-white/30 font-mono group-hover:text-white/60">
                  5149
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("mattiabarb", "2111")}
                className="text-left px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-xs text-white/80 transition-all flex items-center justify-between group"
              >
                <span>
                  <strong>Mattia Barb</strong>{" "}
                  <span className="text-white/50">(Member)</span>
                </span>
                <span className="text-[10px] text-white/30 font-mono group-hover:text-white/60">
                  2111
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("andreadibella", "5445")}
                className="text-left px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs text-emerald-300 transition-all flex items-center justify-between group"
              >
                <span>
                  <strong>Andrea Di Bella</strong>{" "}
                  <span className="text-emerald-400 font-medium">(Outbound Speciale)</span>
                </span>
                <span className="text-[10px] text-emerald-300/50 font-mono group-hover:text-emerald-200">
                  5445
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Dashboard Principale
  const isSpecialFriend = currentUser?.username === "andreadibella";

  return (
    <div className="min-h-screen bg-[#07090E] text-white font-sans selection:bg-blue-600 selection:text-white pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">
                  Tech<span className="text-blue-500">PYRE</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-white/10 px-2 py-0.5 rounded text-white/70">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-white/40">Outbound Intelligence Engine</p>
            </div>
          </div>

          {/* User Profile Badge & Quick Settings */}
          <div className="flex items-center gap-3">
            {/* Active User Badge */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isSpecialFriend ? "bg-emerald-400" : "bg-blue-400"
                } animate-pulse`}
              />
              <div className="text-left">
                <p className="text-xs font-semibold text-white leading-tight">
                  {currentUser?.displayName}
                </p>
                <p className="text-[10px] text-white/40 leading-tight">
                  {currentUser?.roleLabel}
                </p>
              </div>
            </div>

            {/* Impostazioni Email Personali */}
            <button
              onClick={() => {
                setShowSmtpModal(true);
                setSmtpFeedback(null);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isSpecialFriend && !smtpConfigured
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-bounce"
                  : "bg-white/[0.05] hover:bg-white/[0.1] text-white/80 border border-white/10"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>
                {isSpecialFriend && !smtpConfigured
                  ? "⚠️ Configura la tua Email"
                  : "Impostazioni Email"}
              </span>
            </button>

            {/* Refresh */}
            <button
              onClick={fetchLeads}
              disabled={loadingLeads}
              title="Aggiorna Dati"
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loadingLeads ? "animate-spin" : ""}`} />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Disconnetti"
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 hover:text-rose-400 text-white/70 border border-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-8 space-y-8">
        {/* Banner Speciale per Andrea Di Bella */}
        {isSpecialFriend && (
          <div className="bg-gradient-to-r from-emerald-950/40 via-[#0E1522] to-blue-950/30 border border-emerald-500/30 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-semibold uppercase">
                  Area Partner Andrea
                </span>
                <span className="text-xs text-white/50">· Cerca qualsiasi settore in Italia</span>
              </div>
              <h2 className="text-base font-semibold text-white">
                Cerca aziende da contattare con la tua casella email
              </h2>
              <p className="text-xs text-white/60">
                Inserisci la parola chiave (es. <em>ristoranti firenze</em>, <em>fotovoltaico brescia</em> o <em>dentisti torino</em>). Le email partiranno direttamente dal tuo indirizzo personale.
              </p>
            </div>
            <button
              onClick={() => {
                setShowSmtpModal(true);
                setSmtpFeedback(null);
              }}
              className="shrink-0 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5" />
              {smtpConfigured ? "Gestisci Email Personale" : "Imposta la tua Email"}
            </button>
          </div>
        )}

        {/* Executive KPI Stats Cards */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-white/50 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Totale Lead</span>
              <Building className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {totalLeadsCount}
            </div>
            <p className="text-[11px] text-white/40 mt-1">Aziende nel database</p>
          </div>

          <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-white/50 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Da Contattare</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 tracking-tight">
              {readyCount}
            </div>
            <p className="text-[11px] text-white/40 mt-1">Demo pronte per l&apos;invio</p>
          </div>

          <div className="bg-[#0E131F] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-white/50 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Email Inviate</span>
              <Send className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-400 tracking-tight">
              {sentCount}
            </div>
            <p className="text-[11px] text-white/40 mt-1">Outbound 1° contatto</p>
          </div>

          <div className="bg-[#0E131F] border border-emerald-500/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-400/70 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Demo Visitate
              </span>
              <Eye className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">
              {visitedCount}
            </div>
            <p className="text-[11px] text-emerald-400/60 mt-1">Aperture dimostrate dal telefono</p>
          </div>

          <div className="col-span-2 md:col-span-1 bg-[#0E131F] border border-purple-500/20 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-purple-400/70 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Risposte</span>
              <MessageSquare className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-400 tracking-tight">
              {repliedCount}
            </div>
            <p className="text-[11px] text-purple-400/60 mt-1">Prospect interessati</p>
          </div>
        </section>

        {/* Sezione Scouting / Ricerca Aziende */}
        <section className="bg-[#0E131F] border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                Trova Nuove Aziende &amp; Genera Demo Automatiche
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Cerca su qualsiasi nicchia o città in Italia: il motore individua le aziende, calcola i tempi di caricamento reali e prepara la demo.
              </p>
            </div>
          </div>

          <form onSubmit={handleStartScouting} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="es. infissi brescia, dentista verona, fotovoltaico bergamo..."
                required
                className="w-full bg-[#121826] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="w-full sm:w-36">
              <select
                value={maxLeads}
                onChange={(e) => setMaxLeads(Number(e.target.value))}
                className="w-full bg-[#121826] border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value={3}>3 Aziende</option>
                <option value={5}>5 Aziende</option>
                <option value={10}>10 Aziende</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={scoutingRunning}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              {scoutingRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Ricerca in corso...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Avvia Ricerca
                </>
              )}
            </button>
          </form>

          {scoutMessage && (
            <div
              className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                scoutMessage.includes("Errore")
                  ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                  : "bg-blue-500/10 text-blue-300 border border-blue-500/20"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{scoutMessage}</span>
            </div>
          )}
        </section>

        {/* Tab & Filtri Lead */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            {/* Filtri a Schede Chiari */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  activeTab === "ALL"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                Tutti ({totalLeadsCount})
              </button>

              <button
                onClick={() => setActiveTab("READY")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "READY"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                    : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                Da Contattare ({readyCount})
              </button>

              <button
                onClick={() => setActiveTab("SENT")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "SENT"
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/30"
                    : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Send className="w-3 h-3" />
                Email Inviata ({sentCount})
              </button>

              <button
                onClick={() => setActiveTab("VISITED")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "VISITED"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                    : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <Flame className="w-3 h-3 text-emerald-400" />
                Demo Visitata ({visitedCount})
              </button>

              <button
                onClick={() => setActiveTab("REPLIED")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === "REPLIED"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <MessageSquare className="w-3 h-3 text-purple-400" />
                Ha Risposto ({repliedCount})
              </button>
            </div>

            {/* Ricerca per Nome / Città */}
            <div className="relative w-full sm:w-64">
              <Filter className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtra per azienda o città..."
                className="w-full bg-[#121826] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Lista Lead (Cards eleganti ed essenziali) */}
          <div className="space-y-3">
            {loadingLeads ? (
              <div className="p-12 text-center text-white/40 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                <p className="text-xs">Caricamento lead in corso...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-12 text-center text-white/40 bg-[#0E131F] border border-white/5 rounded-2xl">
                <Building className="w-8 h-8 mx-auto text-white/20 mb-2" />
                <p className="text-sm font-medium text-white/60">Nessun lead trovato per questo filtro.</p>
                <p className="text-xs text-white/30 mt-1">
                  Prova a selezionare &quot;Tutti&quot; o esegui una nuova ricerca in alto.
                </p>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const isSent = (lead.sendCount || 0) > 0;
                const visits = lead.visits?.totalVisits || 0;
                const hasReplied = Boolean(lead.hasReplied);
                const sendStatus = sendResult[lead.slug];

                return (
                  <div
                    key={lead.slug}
                    className={`bg-[#0E131F] border rounded-2xl p-4 sm:p-5 transition-all ${
                      hasReplied
                        ? "border-purple-500/40 bg-purple-950/10 shadow-lg shadow-purple-950/20"
                        : visits > 0
                        ? "border-emerald-500/40 bg-emerald-950/10 shadow-lg shadow-emerald-950/20"
                        : isSent
                        ? "border-blue-500/20"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Dati Azienda & Velocità */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                          {lead.hasAssets.hasLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/leads/${lead.slug}/logo.png`}
                              alt={lead.config.meta.companyName}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building className="w-5 h-5 text-white/30" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-white text-sm sm:text-base">
                              {lead.config.meta.companyName}
                            </h3>

                            {/* Badge Stato Chiaro */}
                            {hasReplied ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Ha Risposto!
                              </span>
                            ) : visits > 0 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                Demo Aperta ({visits}x)
                              </span>
                            ) : isSent ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Inviata
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                                Da Contattare
                              </span>
                            )}

                            <span className="text-xs text-white/40">· {lead.config.meta.city}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-white/40" />
                              <strong className="text-white/80">{lead.config.meta.targetEmail}</strong>
                            </span>
                            {lead.config.meta.phone && (
                              <span className="flex items-center gap-1">
                                <Smartphone className="w-3 h-3 text-white/40" />
                                {lead.config.meta.phone}
                              </span>
                            )}
                            <a
                              href={lead.config.meta.originalLandingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <Globe className="w-3 h-3" />
                              Sito originale
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>

                          {/* Velocità e Flaw */}
                          <div className="flex items-center gap-2 pt-1 text-xs">
                            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-mono text-[11px] border border-rose-500/20">
                              Attuale: {lead.config.audit.originalLcpSeconds}s
                            </span>
                            <span className="text-white/30">→</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-[11px] border border-emerald-500/20 font-semibold">
                              TechPyre: 0.3s
                            </span>
                          </div>

                          {/* Note su risposte se presenti */}
                          {lead.statusNotes && (
                            <p className="text-xs text-purple-300 bg-purple-950/30 border border-purple-500/20 p-2 rounded-lg mt-2">
                              💬 <strong>Nota Risposta:</strong> {lead.statusNotes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Azioni Rapide */}
                      <div className="flex flex-wrap items-center gap-2 lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
                        {/* 1. Vedi Demo */}
                        <a
                          href={`/demo/${lead.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-1.5"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                          Vedi Demo
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>

                        {/* 2. Dettagli Visite (se visitato) */}
                        {visits > 0 && (
                          <button
                            onClick={() => setVisitsDetailLead(lead)}
                            className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-all flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Dettagli Visite ({visits})
                          </button>
                        )}

                        {/* 3. Anteprima Email */}
                        <button
                          onClick={() => setPreviewLead(lead)}
                          className="px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Leggi Email
                        </button>

                        {/* 4. Invia Email */}
                        <button
                          onClick={() => handleSendEmail(lead.slug, isSent)}
                          disabled={sendingSlug === lead.slug}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md ${
                            isSent
                              ? "bg-white/[0.06] hover:bg-white/[0.12] text-white/80 border border-white/10"
                              : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                          } disabled:opacity-50`}
                        >
                          {sendingSlug === lead.slug ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Invio in corso...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              {isSent ? "Reinvia / Follow-up" : "Invia 1ª Email"}
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Feedback Invio Inline */}
                    {sendStatus && (
                      <div
                        className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                          sendStatus.success
                            ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        }`}
                      >
                        {sendStatus.success ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0" />
                        )}
                        <span>{sendStatus.message}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* MODAL 1: Impostazioni Email Personali (per Andrea Di Bella o chiunque altro) */}
      {showSmtpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Configurazione Email Personale</h3>
                  <p className="text-xs text-white/50">Profilo: {currentUser?.displayName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowSmtpModal(false)}
                className="text-white/40 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/60">
              Imposta qui i parametri della tua casella di posta per fare in modo che le email di presentazione vengano inviate direttamente dal tuo indirizzo personale.
            </p>

            {/* Presets rapidi */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-white/40 self-center mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setSmtpHost("smtp.gmail.com");
                  setSmtpPort("465");
                }}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[11px] text-white/70"
              >
                Gmail
              </button>
              <button
                type="button"
                onClick={() => {
                  setSmtpHost("smtp.office365.com");
                  setSmtpPort("587");
                }}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[11px] text-white/70"
              >
                Outlook / 365
              </button>
              <button
                type="button"
                onClick={() => {
                  setSmtpHost("smtps.aruba.it");
                  setSmtpPort("465");
                }}
                className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[11px] text-white/70"
              >
                Aruba
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Server SMTP Host *
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="es. smtp.gmail.com"
                    className="w-full bg-[#121826] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Porta *
                  </label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="465 o 587"
                    className="w-full bg-[#121826] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1">
                  Email / Username *
                </label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="la-tua-email@dominio.it"
                  className="w-full bg-[#121826] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/70 mb-1 flex items-center justify-between">
                  <span>Password / Password per le app *</span>
                  <span className="text-[10px] text-blue-400">
                    (Per Gmail crea una App Password)
                  </span>
                </label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="Inserisci la password SMTP"
                  className="w-full bg-[#121826] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Nome Mittente
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="es. Andrea Di Bella"
                    className="w-full bg-[#121826] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-white/70 mb-1">
                    Email Mittente
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="Se diversa da user"
                    className="w-full bg-[#121826] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {smtpFeedback && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  smtpFeedback.type === "success"
                    ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                }`}
              >
                {smtpFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{smtpFeedback.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleSaveSmtp(true)}
                disabled={testingSmtp || savingSmtp || !smtpHost || !smtpUser || !smtpPass}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors disabled:opacity-40"
              >
                {testingSmtp ? "Test in corso..." : "Testa Connessione"}
              </button>

              <button
                type="button"
                onClick={() => handleSaveSmtp(false)}
                disabled={testingSmtp || savingSmtp || !smtpHost || !smtpUser || !smtpPass}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-40"
              >
                {savingSmtp ? "Salvataggio..." : "Salva Credenziali"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Anteprima Email */}
      {previewLead && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-white/10 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Anteprima Email di Presentazione</h3>
                <p className="text-xs text-white/50">{previewLead.config.meta.companyName}</p>
              </div>
              <button
                onClick={() => setPreviewLead(null)}
                className="text-white/40 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-white/40">Destinatario:</span>{" "}
                <strong className="text-white">{previewLead.config.meta.targetEmail}</strong>
              </div>
              <div>
                <span className="text-white/40">Oggetto:</span>{" "}
                <strong className="text-blue-400">{previewLead.config.outreach.emailSubject}</strong>
              </div>
              <div className="border border-white/10 bg-[#07090E] p-4 rounded-xl text-white/90 whitespace-pre-wrap font-sans leading-relaxed">
                {previewLead.config.outreach.emailPlainTextBody}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="text-[11px] text-white/40">
                Regola Anti-Spam: 0 link · Tono professionale · Firma automatica
              </span>
              <button
                onClick={() => {
                  handleSendEmail(previewLead.slug, false);
                  setPreviewLead(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Invia Questa Email Ora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Dettagli Visite Demo Tracker */}
      {visitsDetailLead && visitsDetailLead.visits && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E131F] border border-emerald-500/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-400 animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-white">Log Visite dal Telefono</h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    {visitsDetailLead.config.meta.companyName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVisitsDetailLead(null)}
                className="text-white/40 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-white/40 block">Totale Aperture:</span>
                <span className="text-xl font-bold text-white">
                  {visitsDetailLead.visits.totalVisits}
                </span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="text-white/40 block">Dispositivo Rilevato:</span>
                <span className="text-sm font-semibold text-emerald-300">
                  {visitsDetailLead.visits.lastDevice || "Smartphone"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white/70">Storico eventi di apertura:</h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {visitsDetailLead.visits.visits?.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white/80 font-medium">{v.formattedDate || v.timestamp}</div>
                      <div className="text-[11px] text-white/40">
                        {v.device} · {v.screen}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      APERTO
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
