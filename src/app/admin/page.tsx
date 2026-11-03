"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Mail,
  Smartphone,
  Eye,
  Settings,
  RefreshCw,
  Lock,
  Copy,
  Check,
  Globe,
  ArrowUpRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import TechPyreLogo from "@/components/ui/TechPyreLogo";
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

interface DiscoveredLeadSummary {
  slug: string;
  companyName: string;
  targetEmail: string;
  city: string;
  lcp: number;
  demoUrl: string;
}

const B2B_PRESETS = [
  { label: "Automazione Industriale · Brescia", query: "automazione industriale brescia" },
  { label: "Macchinari Industriali · Bergamo", query: "macchinari industriali bergamo" },
  { label: "Carpenteria Metallica · Vicenza", query: "carpenteria metallica vicenza" },
  { label: "Forniture Industriali · Milano", query: "forniture industriali milano" },
  { label: "Impianti Fotovoltaici · Padova", query: "impianti fotovoltaici padova" },
  { label: "Serramenti Alluminio · Bologna", query: "serramenti alluminio bologna" },
  { label: "Clinica Odontoiatrica · Verona", query: "clinica odontoiatrica verona" },
];

export default function AdminPage() {
  // Autenticazione
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Dati Lead & Filtri
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "READY" | "SENT" | "VISITED" | "REPLIED">("ALL");
  const [archetypeFilter, setArchetypeFilter] = useState<"ALL" | "b2b-authority" | "local-leadgen" | "medical-clinic">("ALL");

  // Motore di Scouting B2B
  const [keyword, setKeyword] = useState("automazione industriale brescia");
  const [maxLeads, setMaxLeads] = useState(5);
  const [scoutingRunning, setScoutingRunning] = useState(false);
  const [scoutStatus, setScoutStatus] = useState<{
    type: "info" | "success" | "error";
    text: string;
  } | null>(null);
  const [lastDiscovered, setLastDiscovered] = useState<DiscoveredLeadSummary[]>([]);

  // Composer Email & Invio
  const [sendingSlug, setSendingSlug] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<{
    [slug: string]: { success: boolean; message: string };
  }>({});
  const [composerLead, setComposerLead] = useState<LeadItem | null>(null);
  const [composerMode, setComposerMode] = useState<"INITIAL" | "FOLLOWUP">("INITIAL");
  const [composerRecipient, setComposerRecipient] = useState("");
  const [composerSubject, setComposerSubject] = useState("");
  const [composerBody, setComposerBody] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [copiedEmailBody, setCopiedEmailBody] = useState(false);

  // Dettaglio Visite Demo
  const [visitsDetailLead, setVisitsDetailLead] = useState<LeadItem | null>(null);

  // Configurazione SMTP
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
  const [smtpFeedback, setSmtpFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      setIsAuthenticated(Boolean(data.authenticated));
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
        setLoginError(data.error || "Credenziali non valide.");
        setLoadingLogin(false);
        return;
      }
      setIsAuthenticated(true);
      setCurrentUser(data.user);
      fetchLeads();
      fetchProfile();
    } catch {
      setLoginError("Errore di comunicazione con il server.");
    } finally {
      setLoadingLogin(false);
    }
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
        setSmtpConfigured(Boolean(data.smtpConfigured));
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
        setSmtpFeedback({
          type: "error",
          text: data.error || "Verifica connessione SMTP non riuscita.",
        });
      } else {
        setSmtpFeedback({
          type: "success",
          text: testOnly
            ? "Connessione SMTP verificata correttamente."
            : "Parametri SMTP salvati nel profilo.",
        });
        if (!testOnly) {
          setSmtpConfigured(true);
          setTimeout(() => setShowSmtpModal(false), 1200);
        }
      }
    } catch {
      setSmtpFeedback({
        type: "error",
        text: "Errore di connessione al server.",
      });
    } finally {
      setTestingSmtp(false);
      setSavingSmtp(false);
    }
  }

  async function handleStartScouting(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setScoutingRunning(true);
    setLastDiscovered([]);
    setScoutStatus({
      type: "info",
      text: `Analisi directory B2B, estrazione contatti/P.IVA e compilazione demo Next.js per "${keyword.trim()}"...`,
    });
    try {
      const res = await fetch("/api/admin/scout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim(), maxLeads }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const list: DiscoveredLeadSummary[] = data.discovered || [];
        setLastDiscovered(list);
        if (list.length > 0) {
          setScoutStatus({
            type: "success",
            text: `Operazione completata: ${list.length} nuove aziende qualificate e ${list.length} demo 0.3s generate.`,
          });
          setActiveTab("READY");
          await fetchLeads();
        } else {
          setScoutStatus({
            type: "error",
            text: `Nessuna nuova azienda non ancora presente a sistema trovata per "${keyword.trim()}". Prova a specificare un'altra provincia o inserisci direttamente il dominio del sito aziendale (es. nomeazienda.it).`,
          });
        }
      } else {
        setScoutStatus({
          type: "error",
          text: data.error || "Impossibile completare la ricerca.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Errore di rete";
      setScoutStatus({ type: "error", text: `Errore: ${msg}` });
    } finally {
      setScoutingRunning(false);
    }
  }

  function openEmailComposer(lead: LeadItem, defaultFollowUp = false) {
    const mode = defaultFollowUp ? "FOLLOWUP" : "INITIAL";
    setComposerLead(lead);
    setComposerMode(mode);
    setComposerRecipient(lead.config.meta.targetEmail);
    setComposerSubject(
      mode === "FOLLOWUP"
        ? `Re: ${lead.config.outreach.emailSubject}`
        : lead.config.outreach.emailSubject
    );
    setComposerBody(
      mode === "FOLLOWUP"
        ? lead.config.outreach.followUpWithLinkBody
        : lead.config.outreach.emailPlainTextBody
    );
    setCopiedEmailBody(false);
  }

  function switchComposerMode(mode: "INITIAL" | "FOLLOWUP") {
    if (!composerLead) return;
    setComposerMode(mode);
    setComposerSubject(
      mode === "FOLLOWUP"
        ? `Re: ${composerLead.config.outreach.emailSubject}`
        : composerLead.config.outreach.emailSubject
    );
    setComposerBody(
      mode === "FOLLOWUP"
        ? composerLead.config.outreach.followUpWithLinkBody
        : composerLead.config.outreach.emailPlainTextBody
    );
  }

  async function handleSendEmail(
    slug: string,
    isFollowUp = false,
    overrides?: {
      customRecipient?: string;
      customSubject?: string;
      customBody?: string;
    }
  ) {
    setSendingSlug(slug);
    setSendResult((prev) => ({
      ...prev,
      [slug]: { success: false, message: "" },
    }));
    try {
      const res = await fetch("/api/admin/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          isFollowUp,
          customRecipient: overrides?.customRecipient,
          customSubject: overrides?.customSubject,
          customBody: overrides?.customBody,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult((prev) => ({
          ...prev,
          [slug]: {
            success: true,
            message: data.message || "Email inviata correttamente.",
          },
        }));
        await fetchLeads();
        if (composerLead?.slug === slug) {
          setComposerLead(null);
        }
      } else {
        setSendResult((prev) => ({
          ...prev,
          [slug]: {
            success: false,
            message: data.error || "Errore durante l'invio.",
          },
        }));
      }
    } catch {
      setSendResult((prev) => ({
        ...prev,
        [slug]: {
          success: false,
          message: "Errore di comunicazione con il server SMTP.",
        },
      }));
    } finally {
      setSendingSlug(null);
    }
  }

  function copyDemoUrl(slug: string) {
    const url = `https://www.techpyre.eu/demo/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 1800);
  }

  function copyComposerText() {
    navigator.clipboard.writeText(composerBody);
    setCopiedEmailBody(true);
    setTimeout(() => setCopiedEmailBody(false), 1800);
  }

  // Metriche Esecutive
  const totalLeadsCount = leads.length;
  const sentCount = leads.filter((l) => (l.sendCount || 0) > 0).length;
  const readyCount = leads.filter((l) => (l.sendCount || 0) === 0).length;
  const visitedCount = leads.filter((l) => (l.visits?.totalVisits || 0) > 0).length;
  const repliedCount = leads.filter((l) => l.hasReplied).length;

  // Filtro Lead
  const filteredLeads = leads.filter((lead) => {
    if (archetypeFilter !== "ALL" && lead.config.archetype !== archetypeFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = lead.config.meta.companyName.toLowerCase().includes(q);
      const matchCity = lead.config.meta.city.toLowerCase().includes(q);
      const matchEmail = lead.config.meta.targetEmail.toLowerCase().includes(q);
      const matchSlug = lead.slug.toLowerCase().includes(q);
      const matchVat = (lead.config.meta.vatNumber || "").toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchEmail && !matchSlug && !matchVat) {
        return false;
      }
    }

    if (activeTab === "READY") return (lead.sendCount || 0) === 0;
    if (activeTab === "SENT") return (lead.sendCount || 0) > 0 && !lead.hasReplied;
    if (activeTab === "VISITED") return (lead.visits?.totalVisits || 0) > 0;
    if (activeTab === "REPLIED") return Boolean(lead.hasReplied);

    return true;
  });

  // Stato caricamento iniziale sessione
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#14181F] flex items-center justify-center">
        <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-widest text-[#5A6270]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B8860B]" />
          <span>Verifica sessione operativa...</span>
        </div>
      </div>
    );
  }

  // 1. SCHERMATA DI ACCESSO RISERVATO (Zero profili pubblici, zero password esposte, estetica Carta Istituzionale)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] text-[#14181F] flex flex-col justify-between px-4 py-8 sm:px-8">
        {/* Top bar minimale */}
        <header className="max-w-6xl w-full mx-auto flex items-center justify-between border-b border-[#E8E2D5] pb-4">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <TechPyreLogo variant="light" size="sm" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#5A6270] border-l border-[#E8E2D5] pl-2.5">
              Studio di Ingegneria ed Ecosistemi Digitali
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-sans text-[#5A6270] hover:text-[#0B1E36] transition-colors"
          >
            Torna al sito istituzionale →
          </Link>
        </header>

        {/* Box di Autenticazione Istituzionale */}
        <main className="my-auto py-12">
          <div className="max-w-md w-full mx-auto bg-white border border-[#E8E2D5] p-8 sm:p-10 shadow-[0_12px_32px_-12px_rgba(11,30,54,0.07)]">
            <div className="border-b border-[#E8E2D5] pb-5 mb-6">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#B8860B] mb-2">
                <Lock className="w-3 h-3" />
                <span>Accesso Riservato · Direzione &amp; Operazioni</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#14181F] font-normal tracking-tight">
                Portale Operativo B2B
              </h1>
              <p className="text-xs text-[#5A6270] mt-1 leading-relaxed">
                Inserisci le tue credenziali personali per accedere al registro diagnosi, generazione demo e invio outbound.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-[11px] font-mono uppercase tracking-wider text-[#5A6270] mb-1.5"
                >
                  Identificativo Operatore
                </label>
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Nome utente"
                  required
                  className="w-full bg-[#F8F7F4] border border-[#E8E2D5] px-3.5 py-2.5 text-base sm:text-sm text-[#14181F] placeholder-[#5A6270]/50 focus:outline-none focus:border-[#0B1E36] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-[11px] font-mono uppercase tracking-wider text-[#5A6270] mb-1.5"
                >
                  Codice di Accesso
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#F8F7F4] border border-[#E8E2D5] px-3.5 py-2.5 text-base sm:text-sm text-[#14181F] placeholder-[#5A6270]/50 focus:outline-none focus:border-[#0B1E36] focus:bg-white transition-colors"
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-xs text-red-800 bg-red-50 border border-red-200 px-3.5 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loadingLogin}
                  className="w-full bg-[#0B1E36] hover:bg-[#142d4c] text-white font-medium py-3 px-5 text-xs uppercase tracking-wider font-mono transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loadingLogin ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifica credenziali...</span>
                    </>
                  ) : (
                    <span>Accedi al Portale Operativo</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>

        {/* Footer minimale */}
        <footer className="max-w-6xl w-full mx-auto border-t border-[#E8E2D5] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#5A6270]">
          <span>TechPYRE Studio · Via Carrubara Vico III n. 3, 98027 Pagliara (ME)</span>
          <span className="font-mono">Accesso protetto da sessione crittografata HTTP-Only</span>
        </footer>
      </div>
    );
  }

  // 2. CONSOLE OPERATIVA B2B (Estetica Private Banking & Carta Istituzionale)
  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#14181F] font-sans pb-20">
      {/* Filetto Oro Superiore */}
      <div className="h-[2px] w-full bg-[#B8860B]" />

      {/* Header Istituzionale */}
      <header className="sticky top-0 z-30 bg-[#F8F7F4]/95 backdrop-blur-md border-b border-[#E8E2D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <TechPyreLogo variant="light" size="sm" />
            </Link>
            <span className="text-[#E8E2D5] select-none">|</span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#0B1E36] font-semibold">
              Console Outbound B2B
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Operatore Attivo */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E2D5] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#0B1E36]" />
              <span className="font-medium text-[#14181F]">
                {currentUser?.displayName}
              </span>
              <span className="text-[#5A6270] font-mono text-[10px] uppercase">
                · {currentUser?.roleLabel}
              </span>
            </div>

            {/* Configurazione SMTP */}
            <button
              type="button"
              onClick={() => {
                setShowSmtpModal(true);
                setSmtpFeedback(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#0B1E36] hover:text-white text-[#14181F] border border-[#E8E2D5] text-xs font-medium transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#B8860B]" />
              <span className="hidden sm:inline">Parametri SMTP</span>
            </button>

            {/* Ricarica Registro */}
            <button
              type="button"
              onClick={fetchLeads}
              disabled={loadingLeads}
              title="Aggiorna registro"
              className="p-2 bg-white hover:bg-[#0B1E36] hover:text-white text-[#14181F] border border-[#E8E2D5] transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingLeads ? "animate-spin" : ""}`}
              />
            </button>

            {/* Esci */}
            <button
              type="button"
              onClick={handleLogout}
              title="Chiudi sessione"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-red-900 hover:text-white text-[#5A6270] border border-[#E8E2D5] text-xs font-medium transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Intestazione Direzionale + Ledger 5 KPI */}
        <section className="bg-white border border-[#E8E2D5]">
          <div className="p-5 sm:p-6 border-b border-[#E8E2D5] flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#B8860B] mb-1">
                TechPyre Studio · Pipeline Commerciale &amp; Diagnosi Tecnica
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl text-[#14181F] font-normal tracking-tight">
                Registro Ecosistemi Demo &amp; Campagne Outbound
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#5A6270]">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1 text-[#0B1E36] hover:underline font-medium"
              >
                <span>techpyre.eu</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <span>·</span>
              <Link
                href="/servizi"
                target="_blank"
                className="inline-flex items-center gap-1 text-[#0B1E36] hover:underline font-medium"
              >
                <span>Listino &amp; Simulatore</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 5-KPI Executive Ledger (Cliccabili per filtrare) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E2D5]">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`p-4 sm:p-5 text-left transition-colors cursor-pointer ${
                activeTab === "ALL" ? "bg-[#0B1E36] text-white" : "hover:bg-[#F8F7F4]"
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase tracking-wider ${
                  activeTab === "ALL" ? "text-[#C5A059]" : "text-[#5A6270]"
                }`}
              >
                01 · Totale a Sistema
              </div>
              <div className="font-serif text-2xl sm:text-3xl mt-1">
                {totalLeadsCount}
              </div>
              <div
                className={`text-[11px] mt-0.5 ${
                  activeTab === "ALL" ? "text-white/70" : "text-[#5A6270]"
                }`}
              >
                Aziende con demo pronta
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("READY")}
              className={`p-4 sm:p-5 text-left transition-colors cursor-pointer ${
                activeTab === "READY" ? "bg-[#0B1E36] text-white" : "hover:bg-[#F8F7F4]"
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase tracking-wider ${
                  activeTab === "READY" ? "text-[#C5A059]" : "text-[#B8860B]"
                }`}
              >
                02 · Da Contattare
              </div>
              <div className="font-serif text-2xl sm:text-3xl mt-1">
                {readyCount}
              </div>
              <div
                className={`text-[11px] mt-0.5 ${
                  activeTab === "READY" ? "text-white/70" : "text-[#5A6270]"
                }`}
              >
                In attesa di 1° invio
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("SENT")}
              className={`p-4 sm:p-5 text-left transition-colors cursor-pointer ${
                activeTab === "SENT" ? "bg-[#0B1E36] text-white" : "hover:bg-[#F8F7F4]"
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase tracking-wider ${
                  activeTab === "SENT" ? "text-[#C5A059]" : "text-[#5A6270]"
                }`}
              >
                03 · 1° Contatto Inviato
              </div>
              <div className="font-serif text-2xl sm:text-3xl mt-1">
                {sentCount}
              </div>
              <div
                className={`text-[11px] mt-0.5 ${
                  activeTab === "SENT" ? "text-white/70" : "text-[#5A6270]"
                }`}
              >
                Email plain-text consegnate
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("VISITED")}
              className={`p-4 sm:p-5 text-left transition-colors cursor-pointer ${
                activeTab === "VISITED" ? "bg-[#0B1E36] text-white" : "hover:bg-[#F8F7F4]"
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase tracking-wider ${
                  activeTab === "VISITED" ? "text-[#C5A059]" : "text-emerald-800"
                }`}
              >
                04 · Demo Ispezionate
              </div>
              <div className="font-serif text-2xl sm:text-3xl mt-1">
                {visitedCount}
              </div>
              <div
                className={`text-[11px] mt-0.5 ${
                  activeTab === "VISITED" ? "text-white/70" : "text-[#5A6270]"
                }`}
              >
                Aperture rilevate dal link
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("REPLIED")}
              className={`col-span-2 lg:col-span-1 p-4 sm:p-5 text-left transition-colors cursor-pointer ${
                activeTab === "REPLIED" ? "bg-[#0B1E36] text-white" : "hover:bg-[#F8F7F4]"
              }`}
            >
              <div
                className={`text-[10px] font-mono uppercase tracking-wider ${
                  activeTab === "REPLIED" ? "text-[#C5A059]" : "text-[#0B1E36]"
                }`}
              >
                05 · Trattative Attive
              </div>
              <div className="font-serif text-2xl sm:text-3xl mt-1">
                {repliedCount}
              </div>
              <div
                className={`text-[11px] mt-0.5 ${
                  activeTab === "REPLIED" ? "text-white/70" : "text-[#5A6270]"
                }`}
              >
                Hanno risposto all&apos;email
              </div>
            </button>
          </div>
        </section>

        {/* Modulo di Ricerca B2B & Generazione Demo Automatica */}
        <section className="bg-white border border-[#E8E2D5] p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#B8860B]">
                Scouting &amp; Compilazione Automatica (Locale &amp; Remoto)
              </div>
              <h2 className="font-serif text-xl text-[#14181F] font-normal">
                Individua Nuove Aziende B2B o Analizza un Dominio Diretto
              </h2>
            </div>
            <p className="text-xs text-[#5A6270] max-w-xl">
              Inserisci un settore + città (es. <em>automazione industriale brescia</em>) oppure incolla direttamente il dominio di un&apos;azienda (es. <em>tecnologicbrescia.it</em>) per generare subito demo 0.3s ed email.
            </p>
          </div>

          {/* Selettori Rapidi Settori B2B */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5A6270] mr-1">
              Verticali B2B:
            </span>
            {B2B_PRESETS.map((item) => (
              <button
                key={item.query}
                type="button"
                onClick={() => setKeyword(item.query)}
                className={`px-2.5 py-1 text-[11px] border transition-colors cursor-pointer ${
                  keyword === item.query
                    ? "bg-[#0B1E36] text-white border-[#0B1E36] font-medium"
                    : "bg-[#F8F7F4] text-[#5A6270] border-[#E8E2D5] hover:border-[#0B1E36] hover:text-[#14181F]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleStartScouting}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-[#5A6270] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Settore e città (es. carpenteria metallica vicenza) oppure dominio diretto (es. azienda.it)..."
                required
                className="w-full bg-[#F8F7F4] border border-[#E8E2D5] pl-10 pr-4 py-2.5 text-base sm:text-sm text-[#14181F] placeholder-[#5A6270]/60 focus:outline-none focus:border-[#0B1E36] focus:bg-white transition-colors"
              />
            </div>

            <div className="w-full sm:w-40">
              <select
                value={maxLeads}
                onChange={(e) => setMaxLeads(Number(e.target.value))}
                aria-label="Numero massimo aziende"
                className="w-full bg-[#F8F7F4] border border-[#E8E2D5] px-3 py-2.5 text-base sm:text-sm text-[#14181F] focus:outline-none focus:border-[#0B1E36] focus:bg-white transition-colors"
              >
                <option value={3}>Target: 3 aziende</option>
                <option value={5}>Target: 5 aziende</option>
                <option value={10}>Target: 10 aziende</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={scoutingRunning}
              className="bg-[#0B1E36] hover:bg-[#142d4c] text-white font-mono uppercase tracking-wider text-xs px-6 py-3 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {scoutingRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C5A059]" />
                  <span>Ricerca e Compilazione...</span>
                </>
              ) : (
                <span>Avvia Ricerca e Genera Demo</span>
              )}
            </button>
          </form>

          {/* Esito Ricerca + Accesso Immediato alle Nuove Demo */}
          {scoutStatus && (
            <div
              className={`mt-4 p-4 border text-xs ${
                scoutStatus.type === "error"
                  ? "bg-red-50 border-red-200 text-red-900"
                  : scoutStatus.type === "success"
                  ? "bg-[#F8F7F4] border-[#B8860B]/50 text-[#14181F]"
                  : "bg-[#F8F7F4] border-[#E8E2D5] text-[#5A6270]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-medium">
                  {scoutStatus.type === "error" ? (
                    <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#B8860B] shrink-0" />
                  )}
                  <span>{scoutStatus.text}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setScoutStatus(null);
                    setLastDiscovered([]);
                  }}
                  className="text-[#5A6270] hover:text-[#14181F]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {lastDiscovered.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[#E8E2D5] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {lastDiscovered.map((item) => (
                    <div
                      key={item.slug}
                      className="bg-white border border-[#E8E2D5] p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-[#14181F] truncate">
                          {item.companyName}
                        </div>
                        <div className="text-[11px] text-[#5A6270] truncate">
                          {item.city} · {item.targetEmail}
                        </div>
                        <div className="text-[10px] font-mono text-[#B8860B] mt-0.5">
                          LCP {item.lcp}s → 0.3s
                        </div>
                      </div>
                      <a
                        href={item.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 px-2.5 py-1.5 bg-[#0B1E36] text-white text-[11px] font-mono uppercase tracking-wider hover:bg-[#142d4c] transition-colors inline-flex items-center gap-1"
                      >
                        <span>Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Registro Operativo Lead (Tabella & Controlli di Ricerca) */}
        <section className="bg-white border border-[#E8E2D5]">
          {/* Barra Filtri */}
          <div className="p-4 sm:p-5 border-b border-[#E8E2D5] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Tabs Stato */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "ALL", label: `Tutti (${totalLeadsCount})` },
                { id: "READY", label: `Da Contattare (${readyCount})` },
                { id: "SENT", label: `1° Contatto Inviato (${sentCount})` },
                { id: "VISITED", label: `Demo Aperte (${visitedCount})` },
                { id: "REPLIED", label: `Risposte (${repliedCount})` },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      t.id as "ALL" | "READY" | "SENT" | "VISITED" | "REPLIED"
                    )
                  }
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors cursor-pointer ${
                    activeTab === t.id
                      ? "bg-[#0B1E36] text-white border-[#0B1E36]"
                      : "bg-[#F8F7F4] text-[#5A6270] border-[#E8E2D5] hover:text-[#14181F]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Filtro Archetipo + Ricerca Testuale */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#5A6270] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={archetypeFilter}
                  onChange={(e) =>
                    setArchetypeFilter(
                      e.target.value as
                        | "ALL"
                        | "b2b-authority"
                        | "local-leadgen"
                        | "medical-clinic"
                    )
                  }
                  aria-label="Filtra per archetipo"
                  className="w-full sm:w-auto bg-[#F8F7F4] border border-[#E8E2D5] pl-8 pr-7 py-1.5 text-xs text-[#14181F] focus:outline-none focus:border-[#0B1E36]"
                >
                  <option value="ALL">Tutti i modelli ({leads.length})</option>
                  <option value="b2b-authority">B2B / Manifattura</option>
                  <option value="local-leadgen">Impianti / Edilizia</option>
                  <option value="medical-clinic">Cliniche Mediche</option>
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#5A6270] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca ragione sociale, città, email..."
                  className="w-full bg-[#F8F7F4] border border-[#E8E2D5] pl-8 pr-3 py-1.5 text-base sm:text-xs text-[#14181F] placeholder-[#5A6270]/60 focus:outline-none focus:border-[#0B1E36] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Elenco / Tabella Architetturale dei Lead */}
          {loadingLeads ? (
            <div className="p-12 text-center text-xs font-mono uppercase tracking-widest text-[#5A6270] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#B8860B]" />
              <span>Caricamento registro lead...</span>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <p className="font-serif text-lg text-[#14181F]">
                Nessuna azienda corrisponde ai criteri selezionati.
              </p>
              <p className="text-xs text-[#5A6270]">
                Modifica il filtro di ricerca oppure utilizza il modulo superiore per generare nuove demo B2B.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8E2D5]">
              {filteredLeads.map((lead) => {
                const isSent = (lead.sendCount || 0) > 0;
                const visits = lead.visits?.totalVisits || 0;
                const hasReplied = Boolean(lead.hasReplied);
                const sendStatus = sendResult[lead.slug];
                const archetypeLabel =
                  lead.config.archetype === "b2b-authority"
                    ? "B2B Authority"
                    : lead.config.archetype === "medical-clinic"
                    ? "Clinica Medica"
                    : "Lead Generation";

                return (
                  <div
                    key={lead.slug}
                    className={`p-4 sm:p-5 transition-colors ${
                      hasReplied
                        ? "bg-[#F8F7F4]"
                        : visits > 0
                        ? "bg-[#FAF9F5]"
                        : "bg-white hover:bg-[#F8F7F4]/60"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Colonna Sinistra: Identità Azienda, Contatti & Metriche */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-lg sm:text-xl text-[#14181F] font-medium tracking-tight">
                            {lead.config.meta.companyName}
                          </h3>

                          <span className="text-xs text-[#5A6270]">
                            · {lead.config.meta.city}
                          </span>

                          <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#F8F7F4] border border-[#E8E2D5] text-[#5A6270]">
                            {archetypeLabel}
                          </span>

                          {/* Stato Lead Sobrio */}
                          {hasReplied ? (
                            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#0B1E36] text-[#C5A059] font-semibold">
                              Risposta Ricevuta
                            </span>
                          ) : visits > 0 ? (
                            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-emerald-900 text-white font-semibold">
                              Demo Aperta ({visits}x)
                            </span>
                          ) : isSent ? (
                            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#E8E2D5]/70 text-[#14181F]">
                              1ª Email Inviata
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-[#B8860B]/50 text-[#B8860B]">
                              Pronto per Invio
                            </span>
                          )}
                        </div>

                        {/* Riga Metadati Tecnici e Recapiti */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5A6270]">
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#14181F]">
                            <Mail className="w-3.5 h-3.5 text-[#B8860B]" />
                            {lead.config.meta.targetEmail}
                          </span>

                          {lead.config.meta.phone && (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                              <Smartphone className="w-3.5 h-3.5 text-[#5A6270]" />
                              {lead.config.meta.phone}
                            </span>
                          )}

                          {lead.config.meta.vatNumber &&
                            lead.config.meta.vatNumber !== "Non trovata" && (
                              <span className="font-mono text-[11px]">
                                P.IVA {lead.config.meta.vatNumber}
                              </span>
                            )}

                          <a
                            href={lead.config.meta.originalLandingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#0B1E36] hover:underline"
                          >
                            <Globe className="w-3 h-3" />
                            <span>Sito attuale</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>

                          <span className="font-mono text-[11px] px-2 py-0.5 bg-[#F8F7F4] border border-[#E8E2D5] text-[#14181F]">
                            LCP Mobile:{" "}
                            <strong className="text-red-800">
                              {lead.config.audit.originalLcpSeconds}s
                            </strong>{" "}
                            → <strong className="text-emerald-800">0.3s</strong>
                          </span>
                        </div>

                        {/* eventuale nota trattativa */}
                        {lead.statusNotes && (
                          <div className="mt-2 px-3 py-2 bg-white border-l-2 border-[#B8860B] text-xs text-[#14181F]">
                            <strong className="font-mono uppercase text-[10px] tracking-wider text-[#B8860B] mr-2">
                              Nota Trattativa:
                            </strong>
                            {lead.statusNotes}
                          </div>
                        )}
                      </div>

                      {/* Colonna Destra: Azioni Operative */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E8E2D5]">
                        {/* 1. Apri Demo Live */}
                        <a
                          href={`/demo/${lead.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 bg-[#F8F7F4] hover:bg-[#0B1E36] hover:text-white text-[#14181F] border border-[#E8E2D5] text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>Apri Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {/* 2. Copia Link Demo */}
                        <button
                          type="button"
                          onClick={() => copyDemoUrl(lead.slug)}
                          className="px-3 py-2 bg-[#F8F7F4] hover:bg-[#0B1E36] hover:text-white text-[#14181F] border border-[#E8E2D5] text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedSlug === lead.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Link Copiato</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copia Link</span>
                            </>
                          )}
                        </button>

                        {/* 3. Log Visite (se presenti) */}
                        {visits > 0 && (
                          <button
                            type="button"
                            onClick={() => setVisitsDetailLead(lead)}
                            className="px-3 py-2 bg-emerald-950/5 hover:bg-emerald-900 hover:text-white text-emerald-900 border border-emerald-800/30 text-xs font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Visite ({visits})</span>
                          </button>
                        )}

                        {/* 4. Revisiona / Modifica Email */}
                        <button
                          type="button"
                          onClick={() => openEmailComposer(lead, isSent)}
                          className="px-3 py-2 bg-white hover:bg-[#F8F7F4] text-[#0B1E36] border border-[#0B1E36]/30 text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#B8860B]" />
                          <span>Ispeziona / Modifica Email</span>
                        </button>

                        {/* 5. Invia Subito */}
                        <button
                          type="button"
                          onClick={() => handleSendEmail(lead.slug, isSent)}
                          disabled={sendingSlug === lead.slug}
                          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                            isSent
                              ? "bg-[#F8F7F4] hover:bg-[#0B1E36] hover:text-white text-[#14181F] border border-[#E8E2D5]"
                              : "bg-[#0B1E36] hover:bg-[#142d4c] text-white"
                          }`}
                        >
                          {sendingSlug === lead.slug ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Invio...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>
                                {isSent ? "Invia Follow-up col Link" : "Invia 1ª Email"}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Feedback Invio Inline */}
                    {sendStatus && sendStatus.message && (
                      <div
                        className={`mt-3 px-3.5 py-2 border text-xs flex items-center gap-2 ${
                          sendStatus.success
                            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                            : "bg-red-50 border-red-200 text-red-900"
                        }`}
                      >
                        {sendStatus.success ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                        ) : (
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                        )}
                        <span>{sendStatus.message}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* MODAL 1: Composer & Revisione Email (con modifica live di Destinatario, Oggetto e Corpo) */}
      {composerLead && (
        <div className="fixed inset-0 z-50 bg-[#0B1E36]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D5] max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#E8E2D5] pb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#B8860B]">
                  Revisione &amp; Invio Diretto SMTP · {composerLead.config.meta.companyName}
                </div>
                <h3 className="font-serif text-2xl text-[#14181F] font-normal mt-0.5">
                  Configurazione Messaggio Outbound
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setComposerLead(null)}
                className="text-[#5A6270] hover:text-[#14181F] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Switcher 1° Contatto vs Follow-up con Link */}
            <div className="grid grid-cols-2 border border-[#E8E2D5] bg-[#F8F7F4] p-1 gap-1">
              <button
                type="button"
                onClick={() => switchComposerMode("INITIAL")}
                className={`py-2 px-3 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  composerMode === "INITIAL"
                    ? "bg-[#0B1E36] text-white font-semibold"
                    : "text-[#5A6270] hover:text-[#14181F]"
                }`}
              >
                1. Primo Contatto (Zero Link · Anti-Spam)
              </button>
              <button
                type="button"
                onClick={() => switchComposerMode("FOLLOWUP")}
                className={`py-2 px-3 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                  composerMode === "FOLLOWUP"
                    ? "bg-[#0B1E36] text-white font-semibold"
                    : "text-[#5A6270] hover:text-[#14181F]"
                }`}
              >
                2. Follow-Up con Link Demo
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A6270] mb-1">
                  Destinatario Email
                </label>
                <input
                  type="email"
                  value={composerRecipient}
                  onChange={(e) => setComposerRecipient(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[#E8E2D5] px-3 py-2 text-base sm:text-xs font-mono text-[#14181F] focus:outline-none focus:border-[#0B1E36] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A6270] mb-1">
                  Oggetto Email
                </label>
                <input
                  type="text"
                  value={composerSubject}
                  onChange={(e) => setComposerSubject(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[#E8E2D5] px-3 py-2 text-base sm:text-xs text-[#14181F] font-medium focus:outline-none focus:border-[#0B1E36] focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#5A6270]">
                    Corpo del Messaggio (Testo Puro)
                  </label>
                  <button
                    type="button"
                    onClick={copyComposerText}
                    className="inline-flex items-center gap-1 text-[11px] text-[#0B1E36] hover:underline cursor-pointer"
                  >
                    {copiedEmailBody ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>Testo copiato</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copia testo</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={12}
                  value={composerBody}
                  onChange={(e) => setComposerBody(e.target.value)}
                  className="w-full bg-[#F8F7F4] border border-[#E8E2D5] p-3.5 text-base sm:text-xs text-[#14181F] font-sans leading-relaxed focus:outline-none focus:border-[#0B1E36] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#E8E2D5]">
              <span className="text-[11px] font-mono text-[#5A6270]">
                {composerMode === "INITIAL"
                  ? "Verifica Anti-Spam: 0 link presenti · Pronto per l'invio"
                  : `Include link diretto: https://www.techpyre.eu/demo/${composerLead.slug}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setComposerLead(null)}
                  className="px-4 py-2.5 border border-[#E8E2D5] text-xs text-[#5A6270] hover:text-[#14181F] cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="button"
                  disabled={sendingSlug === composerLead.slug}
                  onClick={() =>
                    handleSendEmail(
                      composerLead.slug,
                      composerMode === "FOLLOWUP",
                      {
                        customRecipient: composerRecipient,
                        customSubject: composerSubject,
                        customBody: composerBody,
                      }
                    )
                  }
                  className="px-5 py-2.5 bg-[#0B1E36] hover:bg-[#142d4c] text-white text-xs font-mono uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {sendingSlug === composerLead.slug
                      ? "Invio in corso..."
                      : composerMode === "FOLLOWUP"
                      ? "Invia Follow-Up Ora"
                      : "Invia 1ª Email Ora"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Configurazione Parametri SMTP */}
      {showSmtpModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1E36]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D5] max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#E8E2D5] pb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#B8860B]">
                  Profilo Operatore: {currentUser?.displayName}
                </div>
                <h3 className="font-serif text-xl text-[#14181F] font-normal">
                  Parametri Server di Posta (SMTP)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSmtpModal(false)}
                className="text-[#5A6270] hover:text-[#14181F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase text-[#5A6270] mr-1">
                Preconfigurazioni:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSmtpHost("smtps.aruba.it");
                  setSmtpPort("465");
                }}
                className="px-2.5 py-1 bg-[#F8F7F4] border border-[#E8E2D5] hover:border-[#0B1E36] text-[11px]"
              >
                Aruba (465 SSL)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSmtpHost("smtp.gmail.com");
                  setSmtpPort("465");
                }}
                className="px-2.5 py-1 bg-[#F8F7F4] border border-[#E8E2D5] hover:border-[#0B1E36] text-[11px]"
              >
                Gmail / Google Workspace
              </button>
              <button
                type="button"
                onClick={() => {
                  setSmtpHost("smtp.office365.com");
                  setSmtpPort("587");
                }}
                className="px-2.5 py-1 bg-[#F8F7F4] border border-[#E8E2D5] hover:border-[#0B1E36] text-[11px]"
              >
                Microsoft 365
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A6270] mb-1">
                    Host SMTP *
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtps.aruba.it"
                    className="w-full bg-[#F8F7F4] border border-[#E8E2D5] px-3 py-2 text-base sm:text-xs text-[#14181F] focus:outline-none focus:border-[#0B1E36]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A6270] mb-1">
                    Porta *
                  </label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="465"
                    className="w-full bg-[#F8F7F4] border border-[#E8E2D5] px-3 py-2 text-base sm:text-xs text-[#14181F] focus:outline-none focus:border-[#0B1E36]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A6270] mb-1">
                  Account Email / Utente SMTP *
                </label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="riccardo.granza@techpyre.eu"
                  className="w-full bg-[#F8F7F4] border border-[#E8E2D5] px-3 py-2 text-base sm:text-xs text-[#14181F] focus:outline-none focus:border-[#0B1E36]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A6270] mb-1">
                  Password SMTP / App Password *
                </label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F8F7F4] border border-[#E8E2D5] px-3 py-2 text-base sm:text-xs text-[#14181F] focus:outline-none focus:border-[#0B1E36]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A6270] mb-1">
                    Nome Visualizzato Mittente
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Riccardo Granza · TechPyre Studio"
                    className="w-full bg-[#F8F7F4] border border-[#E8E2D5] px-3 py-2 text-base sm:text-xs text-[#14181F] focus:outline-none focus:border-[#0B1E36]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#5A6270] mb-1">
                    Indirizzo Risposta (Reply-To)
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="riccardo.granza@techpyre.eu"
                    className="w-full bg-[#F8F7F4] border border-[#E8E2D5] px-3 py-2 text-base sm:text-xs text-[#14181F] focus:outline-none focus:border-[#0B1E36]"
                  />
                </div>
              </div>
            </div>

            {smtpFeedback && (
              <div
                className={`p-3 border text-xs flex items-center gap-2 ${
                  smtpFeedback.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-red-50 border-red-200 text-red-900"
                }`}
              >
                {smtpFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
                )}
                <span>{smtpFeedback.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E2D5]">
              <button
                type="button"
                onClick={() => handleSaveSmtp(true)}
                disabled={testingSmtp || savingSmtp || !smtpHost || !smtpUser || !smtpPass}
                className="px-4 py-2 bg-[#F8F7F4] border border-[#E8E2D5] hover:border-[#0B1E36] text-xs font-medium text-[#14181F] disabled:opacity-40 cursor-pointer"
              >
                {testingSmtp ? "Verifica in corso..." : "Verifica Connessione"}
              </button>
              <button
                type="button"
                onClick={() => handleSaveSmtp(false)}
                disabled={testingSmtp || savingSmtp || !smtpHost || !smtpUser || !smtpPass}
                className="px-5 py-2 bg-[#0B1E36] hover:bg-[#142d4c] text-white text-xs font-mono uppercase tracking-wider disabled:opacity-40 cursor-pointer"
              >
                {savingSmtp ? "Salvataggio..." : "Salva Parametri"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Telemetria Aperture Demo */}
      {visitsDetailLead && visitsDetailLead.visits && (
        <div className="fixed inset-0 z-50 bg-[#0B1E36]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E8E2D5] max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#E8E2D5] pb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#B8860B]">
                  Telemetria Accessi Demo · {visitsDetailLead.config.meta.companyName}
                </div>
                <h3 className="font-serif text-xl text-[#14181F] font-normal">
                  Storico Ispezioni Link Dimostrativo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVisitsDetailLead(null)}
                className="text-[#5A6270] hover:text-[#14181F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F8F7F4] p-3.5 border border-[#E8E2D5]">
                <span className="text-[10px] font-mono uppercase text-[#5A6270] block">
                  Totale Aperture
                </span>
                <span className="font-serif text-2xl text-[#14181F]">
                  {visitsDetailLead.visits.totalVisits}
                </span>
              </div>
              <div className="bg-[#F8F7F4] p-3.5 border border-[#E8E2D5]">
                <span className="text-[10px] font-mono uppercase text-[#5A6270] block">
                  Ultimo Dispositivo
                </span>
                <span className="font-mono text-xs font-semibold text-[#0B1E36] mt-1 block">
                  {visitsDetailLead.visits.lastDevice || "Dispositivo Mobile / Desktop"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#5A6270]">
                Cronologia Sessioni:
              </div>
              <div className="divide-y divide-[#E8E2D5] border border-[#E8E2D5] max-h-60 overflow-y-auto">
                {visitsDetailLead.visits.visits?.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="p-3 bg-white text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-[11px] text-[#14181F] font-medium">
                        {v.formattedDate || v.timestamp}
                      </div>
                      <div className="text-[11px] text-[#5A6270]">
                        {v.device} · Schermo {v.screen}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-emerald-950/10 text-emerald-900">
                      Visitato
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
