#!/usr/bin/env node
import http from 'node:http';
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4321;
const PROJECT_ROOT = fs.existsSync(path.join(__dirname, 'scripts', 'techpyre-cli.mjs'))
  ? __dirname
  : (fs.existsSync(path.join(process.cwd(), 'scripts', 'techpyre-cli.mjs'))
      ? process.cwd()
      : __dirname);

const LEADS_DIR = path.join(PROJECT_ROOT, 'src', 'data', 'leads');
const CLI_PATH = path.join(PROJECT_ROOT, 'scripts', 'techpyre-cli.mjs');

// Se c'è una vecchia istanza della GUI attiva sulla porta PORT, la chiude in automatico
try {
  const pids = execSync(`lsof -ti:${PORT}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
  if (pids) {
    pids.split('\n').forEach(p => {
      const targetPid = parseInt(p.trim(), 10);
      if (targetPid && targetPid !== process.pid) {
        try { process.kill(targetPid, 'SIGKILL'); } catch {}
      }
    });
  }
} catch {}

function stripAnsi(str) {
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

// Estrae e normalizza tutti i dati dai file JSON dei lead per il CRM visuale
function getLeadsData() {
  try {
    if (!fs.existsSync(LEADS_DIR)) return [];
    const files = fs.readdirSync(LEADS_DIR).filter(f => f.endsWith('.json'));

    const historyPath = path.join(PROJECT_ROOT, 'src', 'data', 'outreach-history.json');
    const sentStepMap = new Map();
    if (fs.existsSync(historyPath)) {
      try {
        const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
        if (Array.isArray(history)) {
          for (const h of history) {
            const s = h.stepNumber || (h.type === 'FOLLOW_UP' ? 2 : (h.type === 'STEP_1' || h.type === 'INITIAL' ? 1 : 0));
            const prev = sentStepMap.get(h.slug) || 0;
            if (s > prev) sentStepMap.set(h.slug, s);
          }
        }
      } catch {}
    }

    const leads = files.map(file => {
      const slug = file.replace('.json', '');
      const fullPath = path.join(LEADS_DIR, file);
      const stat = fs.statSync(fullPath);
      try {
        const raw = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        const step = sentStepMap.get(slug) || 0;
        const status = raw.status || raw.meta?.status || (step > 0 ? `CONTACTED_STEP_${step}` : 'NEW');
        const company = raw.companyName || raw.businessName || raw.name || raw.company?.name || raw.meta?.companyName || slug;
        const email = raw.email || raw.bestEmail || raw.contact?.email || raw.meta?.targetEmail || (Array.isArray(raw.emails) ? raw.emails[0] : '') || '';
        const owner = raw.owner || raw.ownerName || raw.titolare || raw.contact?.owner || raw.decisionMaker || raw.meta?.decisionMakerName || '';
        const phone = raw.phone || raw.telefono || raw.contact?.phone || raw.meta?.phone || '';
        const website = raw.website || raw.url || raw.domain || raw.meta?.originalLandingUrl || '';
        const lcp = raw.lcp ?? raw.mobileLcp ?? raw.metrics?.lcp ?? raw.audit?.originalLcpSeconds ?? raw.audit?.lcp ?? raw.performance?.lcp ?? null;
        const keyword = raw.keyword || raw.niche || raw.category || raw.meta?.keyword || raw.meta?.city || '';
        const threadId = raw.meta?.lastSentMessageId || raw.lastSentMessageId || null;

        return {
          slug,
          company,
          status,
          email,
          owner,
          phone,
          website,
          lcp: typeof lcp === 'number' ? lcp.toFixed(1) : (lcp ? String(lcp) : null),
          keyword,
          threadId,
          updatedAt: stat.mtimeMs,
          raw
        };
      } catch {
        return { slug, company: slug, status: 'UNKNOWN', email: '', owner: '', phone: '', website: '', lcp: null, keyword: '', threadId: null, updatedAt: stat.mtimeMs, raw: {} };
      }
    });

    return leads.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

const HTML_UI = `<!DOCTYPE html>
<html lang="it" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TechPyre Studio · Tactical Outbound Deck</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            display: ['Space Grotesk', 'sans-serif'],
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          animation: {
            'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            'float': 'float 4s ease-in-out infinite',
            'radar': 'radar 3.5s linear infinite',
            'glow': 'glow 2.5s ease-in-out infinite alternate',
          },
          keyframes: {
            float: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-5px)' },
            },
            radar: {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
            glow: {
              '0%': { boxShadow: '0 0 15px -3px rgba(249, 115, 22, 0.25)' },
              '100%': { boxShadow: '0 0 28px 2px rgba(249, 115, 22, 0.55)' },
            }
          }
        }
      }
    }
  </script>
  <style>
    :root {
      --bg-deep: #06060a;
      --pyre-orange: #ff5500;
      --pyre-amber: #f59e0b;
    }
    body {
      background-color: var(--bg-deep);
      color: #f4f4f6;
      background-image:
        radial-gradient(circle at 15% 0%, rgba(255, 85, 0, 0.12), transparent 35%),
        radial-gradient(circle at 85% 100%, rgba(14, 165, 233, 0.08), transparent 35%),
        linear-gradient(to right, rgba(255,255,255,0.018) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.018) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 32px 32px, 32px 32px;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(9, 9, 11, 0.4); }
    ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 9999px; }
    ::-webkit-scrollbar-thumb:hover { background: #f97316; }

    /* Tactile & Arcade Card Effects */
    .cyber-card {
      background: linear-gradient(180deg, rgba(24, 24, 30, 0.78) 0%, rgba(14, 14, 18, 0.88) 100%);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.07);
      box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.07);
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .cyber-card-interactive:hover {
      transform: translateY(-3px) scale(1.005);
      border-color: rgba(249, 115, 22, 0.45);
      box-shadow: 0 16px 35px -10px rgba(249, 115, 22, 0.18), inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
    }
    .btn-juice {
      transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .btn-juice:hover {
      transform: translateY(-1.5px);
    }
    .btn-juice:active {
      transform: translateY(1px) scale(0.96);
    }
    .view-enter {
      animation: viewIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes viewIn {
      from { opacity: 0; transform: translateY(8px) scale(0.992); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .shimmer-bar {
      background: linear-gradient(90deg, #f97316 0%, #fbbf24 50%, #f97316 100%);
      background-size: 200% 100%;
      animation: shimmer 2.5s linear infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .radar-sweep {
      background: conic-gradient(from 0deg, transparent 70%, rgba(249, 115, 22, 0.45) 100%);
    }
    .hot-pulse {
      box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7);
      animation: hotPulse 1.8s infinite;
    }
    @keyframes hotPulse {
      0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.55); }
      70% { box-shadow: 0 0 0 8px rgba(249, 115, 22, 0); }
      100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
    }
  </style>
</head>
<body class="h-screen flex flex-col overflow-hidden select-none antialiased relative">

  <!-- AMBIENT EMBER PARTICLES CANVAS -->
  <canvas id="ember-canvas" class="fixed inset-0 pointer-events-none z-0 opacity-60"></canvas>

  <!-- TOAST NOTIFICATION CONTAINER -->
  <div id="toast-container" class="fixed top-16 right-5 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <!-- TOP NAVIGATION BAR (COMMAND DECK HEADER) -->
  <header class="h-16 border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-5 shrink-0 z-30 relative">
    <div class="flex items-center gap-5">
      <!-- Brand Logo -->
      <div onclick="triggerPyreBurst(event)" class="flex items-center gap-3 cursor-pointer group" title="Clicca per accendere la forgia!">
        <div class="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-200 animate-glow">
          <i data-lucide="flame" class="w-5 h-5 text-white fill-white/20"></i>
          <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping"></span>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="font-display font-bold text-base tracking-tight text-white group-hover:text-orange-400 transition">TECHPYRE</span>
            <span class="text-[10px] font-mono font-semibold uppercase tracking-widest bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-300 px-2 py-0.5 rounded-full">OS v2.5</span>
          </div>
          <div class="text-[11px] text-zinc-400 font-medium flex items-center gap-1.5">
            <span>Outbound Forge</span>
            <span class="text-zinc-600">•</span>
            <span id="rank-title" class="text-amber-400 font-mono font-semibold">Lv.1 Pyro Hunter</span>
          </div>
        </div>
      </div>

      <!-- GAMIFIED XP & LEVEL WIDGET -->
      <div class="hidden xl:flex items-center gap-3 bg-zinc-900/90 border border-white/[0.07] px-3.5 py-1.5 rounded-xl">
        <div class="flex flex-col">
          <div class="flex items-center justify-between gap-4 text-[10px] font-mono uppercase">
            <span class="text-zinc-400 flex items-center gap-1"><i data-lucide="zap" class="w-3 h-3 text-amber-400"></i> Forge XP</span>
            <span id="xp-counter" class="text-white font-bold">0 XP</span>
          </div>
          <div class="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
            <div id="xp-bar" class="h-full shimmer-bar rounded-full transition-all duration-700" style="width: 15%"></div>
          </div>
        </div>
        <div class="h-6 w-px bg-zinc-800"></div>
        <div class="text-center px-1" title="Hot Leads / Conversion Power">
          <div class="text-[9px] font-mono uppercase text-zinc-500">Combo</div>
          <div id="combo-badge" class="text-xs font-mono font-bold text-orange-400">1.0x 🔥</div>
        </div>
      </div>

      <!-- Navigation Pills -->
      <nav class="flex items-center gap-1.5 bg-zinc-900/90 p-1.5 rounded-xl border border-white/[0.07] shadow-inner">
        <button onclick="switchMainView('crm')" id="nav-crm" class="nav-tab btn-juice flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20">
          <i data-lucide="layers" class="w-3.5 h-3.5"></i>
          <span>Pipeline CRM</span>
          <span id="nav-badge-crm" class="ml-0.5 px-1.5 py-0.2 bg-black/30 rounded-full text-[10px] font-mono">0</span>
        </button>
        <button onclick="switchMainView('scout')" id="nav-scout" class="nav-tab btn-juice flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all">
          <i data-lucide="radar" class="w-3.5 h-3.5 text-emerald-400"></i>
          <span>Radar Scouting</span>
        </button>
        <button onclick="switchMainView('campaigns')" id="nav-campaigns" class="nav-tab btn-juice flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all">
          <i data-lucide="rocket" class="w-3.5 h-3.5 text-sky-400"></i>
          <span>Sequenze Batch</span>
        </button>
        <button onclick="switchMainView('tools')" id="nav-tools" class="nav-tab btn-juice flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all">
          <i data-lucide="flask-conical" class="w-3.5 h-3.5 text-purple-400"></i>
          <span>Alchimia & Tools</span>
        </button>
      </nav>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-2.5">
      <!-- Sound FX Toggle -->
      <button onclick="toggleSound()" id="sfx-btn" class="btn-juice flex items-center justify-center w-9 h-9 rounded-xl border border-white/[0.08] bg-zinc-900/90 hover:bg-zinc-800 text-amber-400 transition" title="Attiva/Disattiva Effetti Sonori Sintetizzati">
        <i id="sfx-icon" data-lucide="volume-2" class="w-4 h-4"></i>
      </button>

      <!-- Refresh Button -->
      <button onclick="refreshLeadsWithJuice()" class="btn-juice flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] bg-zinc-900/90 hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition group">
        <i id="refresh-icon" data-lucide="refresh-cw" class="w-3.5 h-3.5 text-orange-400 group-hover:rotate-180 transition-transform duration-500"></i>
        <span>Sync Lead</span>
      </button>

      <!-- Console Drawer Toggle -->
      <button onclick="toggleConsole()" class="btn-juice flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-zinc-900/90 hover:border-orange-500/40 hover:bg-zinc-800 text-xs font-mono text-zinc-200 transition">
        <span id="top-status-dot" class="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
        <span>Terminale</span>
        <kbd class="text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">⌘J</kbd>
      </button>
    </div>
  </header>

  <!-- MAIN WORKSPACE -->
  <main class="flex-1 overflow-hidden relative flex flex-col z-10">

    <!-- ==================== VIEW 1: PIPELINE CRM ==================== -->
    <section id="view-crm" class="flex-1 flex flex-col overflow-hidden view-enter">

      <!-- KPI Strip (Arcade Stat Modules) -->
      <div class="grid grid-cols-5 gap-3.5 px-5 pt-4 pb-3 shrink-0">
        <!-- TOTALE -->
        <button onclick="setFilterStatus('ALL')" id="kpi-ALL" class="kpi-card cyber-card cyber-card-interactive text-left p-3.5 rounded-2xl relative overflow-hidden group">
          <div class="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span class="font-medium tracking-wide uppercase text-[11px]">Totale Arsenale</span>
            <div class="w-7 h-7 rounded-lg bg-zinc-800/80 border border-white/5 flex items-center justify-center group-hover:scale-110 transition">
              <i data-lucide="database" class="w-3.5 h-3.5 text-zinc-300"></i>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <div id="count-ALL" class="text-2xl font-display font-bold text-white font-mono">0</div>
            <span class="text-[10px] font-mono text-zinc-500">lead</span>
          </div>
          <div class="w-full h-1 bg-zinc-800/80 rounded-full mt-2.5 overflow-hidden">
            <div class="h-full bg-zinc-400 rounded-full" style="width: 100%"></div>
          </div>
        </button>

        <!-- PRONTI (NEW) -->
        <button onclick="setFilterStatus('NEW')" id="kpi-NEW" class="kpi-card cyber-card cyber-card-interactive text-left p-3.5 rounded-2xl relative overflow-hidden group">
          <div class="flex items-center justify-between text-xs text-emerald-400 mb-1">
            <span class="font-semibold tracking-wide uppercase text-[11px]">Munizioni (NEW)</span>
            <div class="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-400"></i>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <div id="count-NEW" class="text-2xl font-display font-bold text-emerald-400 font-mono">0</div>
            <span class="text-[10px] font-mono text-emerald-500/70">pronti al lancio</span>
          </div>
          <div class="w-full h-1 bg-zinc-800/80 rounded-full mt-2.5 overflow-hidden">
            <div id="bar-NEW" class="h-full bg-emerald-400 rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>
        </button>

        <!-- IN SEQUENZA -->
        <button onclick="setFilterStatus('CONTACTED')" id="kpi-CONTACTED" class="kpi-card cyber-card cyber-card-interactive text-left p-3.5 rounded-2xl relative overflow-hidden group">
          <div class="flex items-center justify-between text-xs text-sky-400 mb-1">
            <span class="font-semibold tracking-wide uppercase text-[11px]">In Orbita (Step 1-4)</span>
            <div class="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center group-hover:scale-110 transition">
              <i data-lucide="send" class="w-3.5 h-3.5 text-sky-400"></i>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <div id="count-CONTACTED" class="text-2xl font-display font-bold text-sky-400 font-mono">0</div>
            <span class="text-[10px] font-mono text-sky-500/70">attivi</span>
          </div>
          <div class="w-full h-1 bg-zinc-800/80 rounded-full mt-2.5 overflow-hidden">
            <div id="bar-CONTACTED" class="h-full bg-sky-400 rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>
        </button>

        <!-- HOT LEADS -->
        <button onclick="setFilterStatus('HOT_LEAD')" id="kpi-HOT_LEAD" class="kpi-card cyber-card cyber-card-interactive text-left p-3.5 rounded-2xl relative overflow-hidden group">
          <div class="flex items-center justify-between text-xs text-orange-400 mb-1">
            <span class="font-semibold tracking-wide uppercase text-[11px]">Hot Leads 🔥</span>
            <div class="w-7 h-7 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center group-hover:scale-110 transition">
              <i data-lucide="flame" class="w-3.5 h-3.5 text-orange-400"></i>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <div id="count-HOT_LEAD" class="text-2xl font-display font-bold text-orange-400 font-mono">0</div>
            <span class="text-[10px] font-mono text-orange-400/80">+150 XP cad.</span>
          </div>
          <div class="w-full h-1 bg-zinc-800/80 rounded-full mt-2.5 overflow-hidden">
            <div id="bar-HOT_LEAD" class="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>
        </button>

        <!-- SHIELDED / BLACKLIST -->
        <button onclick="setFilterStatus('BLOCKED')" id="kpi-BLOCKED" class="kpi-card cyber-card cyber-card-interactive text-left p-3.5 rounded-2xl relative overflow-hidden group">
          <div class="flex items-center justify-between text-xs text-rose-400 mb-1">
            <span class="font-semibold tracking-wide uppercase text-[11px]">Scudati / Bot</span>
            <div class="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center group-hover:scale-110 transition">
              <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-rose-400"></i>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <div id="count-BLOCKED" class="text-2xl font-display font-bold text-rose-400 font-mono">0</div>
            <span class="text-[10px] font-mono text-rose-500/70">filtrati</span>
          </div>
          <div class="w-full h-1 bg-zinc-800/80 rounded-full mt-2.5 overflow-hidden">
            <div id="bar-BLOCKED" class="h-full bg-rose-500 rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>
        </button>
      </div>

      <!-- Master-Detail Container -->
      <div class="flex-1 flex overflow-hidden border-t border-white/[0.07]">

        <!-- Left: Lead List / Kanban Area -->
        <div class="flex-1 flex flex-col overflow-hidden border-r border-white/[0.07] bg-zinc-950/30">
          <!-- Search, Filter & View Mode Bar -->
          <div class="p-3 border-b border-white/[0.07] bg-zinc-950/70 backdrop-blur flex items-center gap-2.5">
            <div class="relative flex-1">
              <i data-lucide="search" class="w-4 h-4 text-orange-400/80 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
              <input id="crm-search" type="text" oninput="renderLeadsView()" placeholder="Cerca bersaglio per azienda, slug, email, titolare o nicchia... (⌘K)"
                class="w-full bg-zinc-900/90 border border-white/[0.08] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition">
            </div>

            <select id="exact-status-filter" onchange="setFilterStatus(this.value)" class="bg-zinc-900/90 border border-white/[0.08] hover:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none cursor-pointer">
              <option value="ALL">⚡ Tutti gli stati</option>
              <option value="NEW">✨ NEW (Pronti)</option>
              <option value="CONTACTED">🚀 Tutti i CONTACTED</option>
              <option value="CONTACTED_STEP_1">📬 CONTACTED_STEP_1</option>
              <option value="CONTACTED_STEP_2">📬 CONTACTED_STEP_2</option>
              <option value="CONTACTED_STEP_3">📞 CONTACTED_STEP_3</option>
              <option value="CONTACTED_STEP_4">👋 CONTACTED_STEP_4</option>
              <option value="HOT_LEAD">🔥 HOT_LEAD</option>
              <option value="INVALID_TICKET_INBOX">🤖 INVALID_TICKET_INBOX</option>
              <option value="BLACKLISTED">⛔ BLACKLISTED</option>
            </select>

            <!-- Toggle Table vs Kanban -->
            <div class="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-white/[0.08]">
              <button onclick="setCrmLayout('table')" id="layout-table-btn" class="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 text-orange-400 flex items-center gap-1 transition" title="Vista Tabella Tattica">
                <i data-lucide="list" class="w-3.5 h-3.5"></i>
              </button>
              <button onclick="setCrmLayout('kanban')" id="layout-kanban-btn" class="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition" title="Vista Board Arcade">
                <i data-lucide="columns-3" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          </div>

          <!-- Layout A: Table Body -->
          <div id="crm-table-container" class="flex-1 overflow-y-auto">
            <table class="w-full text-left border-collapse">
              <thead class="sticky top-0 bg-zinc-950/95 backdrop-blur-md border-b border-white/[0.07] text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider z-10">
                <tr>
                  <th class="py-3 pl-5 pr-3">Bersaglio / Slug</th>
                  <th class="py-3 px-3">Stato Missione</th>
                  <th class="py-3 px-3">Decision Maker & Email</th>
                  <th class="py-3 px-3">LCP Mobile</th>
                  <th class="py-3 pl-3 pr-5 text-right">Demo & Lancio</th>
                </tr>
              </thead>
              <tbody id="leads-tbody" class="divide-y divide-white/[0.04] text-xs"></tbody>
            </table>
          </div>

          <!-- Layout B: Kanban Arcade Board -->
          <div id="crm-kanban-container" class="flex-1 overflow-x-auto overflow-y-hidden p-4 hidden">
            <div id="kanban-columns" class="flex gap-4 h-full min-w-[920px]"></div>
          </div>
        </div>

        <!-- Right: Tactical Lead Inspector Panel -->
        <div id="inspector-panel" class="w-[520px] xl:w-[580px] bg-zinc-950/90 backdrop-blur-xl flex flex-col overflow-hidden shrink-0 relative">
          <!-- Empty State -->
          <div id="inspector-empty" class="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 flex items-center justify-center mb-4 animate-float">
              <i data-lucide="crosshair" class="w-7 h-7 text-orange-400"></i>
            </div>
            <p class="text-base font-display font-bold text-zinc-200">Aggancia un bersaglio dalla lista</p>
            <p class="text-xs text-zinc-500 mt-1.5 max-w-xs leading-relaxed">Sbloccherai il telemetro LCP, i 4 step Zero-Fluff, l'invio istantaneo in thread e l'analizzatore AI delle risposte.</p>
          </div>

          <!-- Active Lead Inspector -->
          <div id="inspector-content" class="flex-1 flex flex-col overflow-hidden hidden">
            <!-- Inspector HUD Header -->
            <div class="p-4 border-b border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h2 id="ins-company" class="text-base font-display font-bold text-white truncate"></h2>
                    <span id="ins-status-badge"></span>
                  </div>
                  <div class="flex items-center gap-2 mt-1">
                    <p id="ins-slug" class="text-[11px] font-mono text-zinc-400 select-all truncate"></p>
                    <button onclick="copySlug()" class="text-zinc-500 hover:text-orange-400 transition" title="Copia Slug">
                      <i data-lucide="copy" class="w-3 h-3"></i>
                    </button>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button onclick="openSelectedDemo('local')" class="btn-juice px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-white/10 text-xs font-semibold text-zinc-100 flex items-center gap-1.5 transition" title="Apri Demo su localhost:3000">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> :3000
                  </button>
                  <button onclick="openSelectedDemo('prod')" class="btn-juice px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 hover:from-orange-500/30 hover:to-amber-500/30 border border-orange-500/40 text-xs font-semibold text-orange-300 flex items-center gap-1.5 transition" title="Apri Demo su techpyre.eu">
                    <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Live Demo
                  </button>
                </div>
              </div>

              <!-- VISUAL QUEST STEPPER (1 -> 2 -> 3 -> 4) & LCP TELEMETRY -->
              <div class="grid grid-cols-12 gap-2.5 mt-3.5">
                <!-- 4-Step Pipeline Progress -->
                <div class="col-span-7 bg-zinc-900/90 border border-white/[0.06] rounded-xl p-2.5 flex flex-col justify-between">
                  <div class="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400">
                    <span>Sequenza Outbound</span>
                    <span id="ins-step-label" class="text-orange-400 font-bold">Pronto</span>
                  </div>
                  <div id="ins-quest-nodes" class="flex items-center justify-between gap-1 mt-2">
                    <!-- Populated via JS -->
                  </div>
                </div>

                <!-- LCP Speedometer Comparison -->
                <div class="col-span-5 bg-zinc-900/90 border border-white/[0.06] rounded-xl p-2.5 flex flex-col justify-between">
                  <div class="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400">
                    <span>Gap Velocità</span>
                    <i data-lucide="gauge" class="w-3 h-3 text-rose-400"></i>
                  </div>
                  <div class="flex items-center justify-between mt-1">
                    <div>
                      <span class="text-[9px] text-zinc-500 block uppercase">Sito Attuale</span>
                      <span id="ins-lcp-val" class="text-xs font-mono font-bold text-rose-400">—</span>
                    </div>
                    <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-zinc-600"></i>
                    <div class="text-right">
                      <span class="text-[9px] text-emerald-400/80 block uppercase">Demo Pyre</span>
                      <span class="text-xs font-mono font-bold text-emerald-400">0.3s ⚡</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Metadata Grid -->
              <div class="grid grid-cols-2 gap-2 mt-2.5 text-xs">
                <div onclick="copyText(document.getElementById('ins-email').textContent, 'Email copiata!')" class="bg-zinc-900/70 hover:bg-zinc-900 px-3 py-2 rounded-xl border border-white/[0.06] truncate cursor-pointer group transition" title="Clicca per copiare l'email">
                  <div class="flex items-center justify-between">
                    <span class="text-zinc-500 text-[10px] font-mono uppercase">Email Migliore</span>
                    <i data-lucide="copy" class="w-3 h-3 text-zinc-600 group-hover:text-orange-400 transition"></i>
                  </div>
                  <span id="ins-email" class="font-mono text-zinc-200 text-[11px] truncate block mt-0.5"></span>
                </div>
                <div class="bg-zinc-900/70 px-3 py-2 rounded-xl border border-white/[0.06] truncate">
                  <span class="text-zinc-500 block text-[10px] font-mono uppercase">Decision Maker & Tel</span>
                  <span id="ins-owner" class="text-zinc-200 text-[11px] truncate block mt-0.5 select-all"></span>
                </div>
              </div>

              <!-- Quick Send Tactical Launchpad -->
              <div class="mt-3 pt-3 border-t border-white/[0.07]">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <i data-lucide="zap" class="w-3 h-3"></i> Cannone SMTP Diretto (Singolo Lead)
                  </span>
                  <label class="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer">
                    <input type="checkbox" id="ins-force-send" class="accent-orange-500 rounded">
                    <span class="font-mono text-[10px]">--force (fuori orario)</span>
                  </label>
                </div>
                <div class="grid grid-cols-4 gap-2">
                  <button onclick="sendSingleStep(1)" class="btn-juice py-2 px-2 rounded-xl bg-zinc-900 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm">
                    <i data-lucide="send" class="w-3 h-3"></i> Step 1
                  </button>
                  <button onclick="sendSingleStep(2)" class="btn-juice py-2 px-2 rounded-xl bg-zinc-900 hover:bg-sky-600 border border-sky-500/30 text-sky-300 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm">
                    <i data-lucide="send" class="w-3 h-3"></i> Step 2
                  </button>
                  <button onclick="sendSingleStep(3)" class="btn-juice py-2 px-2 rounded-xl bg-zinc-900 hover:bg-amber-600 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm">
                    <i data-lucide="phone-forwarded" class="w-3 h-3"></i> Step 3
                  </button>
                  <button onclick="sendSingleStep(4)" class="btn-juice py-2 px-2 rounded-xl bg-zinc-900 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm">
                    <i data-lucide="flame" class="w-3 h-3"></i> Step 4
                  </button>
                </div>
              </div>

              <!-- Sub-navigation inside Inspector -->
              <div class="flex gap-1.5 mt-3 bg-zinc-950 p-1 rounded-xl border border-white/[0.07]">
                <button onclick="switchInspectorTab('inspect')" id="instab-inspect" class="btn-juice flex-1 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-white shadow transition">
                  📧 Copy 4 Step
                </button>
                <button onclick="switchInspectorTab('reply')" id="instab-reply" class="btn-juice flex-1 py-1.5 text-xs font-semibold rounded-lg text-zinc-400 hover:text-white transition">
                  🧠 AI Reply Classifier
                </button>
                <button onclick="switchInspectorTab('json')" id="instab-json" class="btn-juice flex-1 py-1.5 text-xs font-semibold rounded-lg text-zinc-400 hover:text-white transition">
                  { } Raw JSON
                </button>
              </div>
            </div>

            <!-- Sub-tab 1: Inspect Output (Copy & Steps) -->
            <div id="ins-pane-inspect" class="flex-1 overflow-y-auto p-4 relative">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Output Ispezione CLI</span>
                <button onclick="copyInspectOutput()" class="btn-juice text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 flex items-center gap-1">
                  <i data-lucide="copy" class="w-3 h-3 text-orange-400"></i> Copia Tutto
                </button>
              </div>
              <div id="ins-inspect-loading" class="text-xs text-orange-400 font-mono animate-pulse py-6 text-center">⚡ Decrittazione sequenza 4 step in corso...</div>
              <pre id="ins-inspect-output" class="text-xs font-mono text-zinc-200 whitespace-pre-wrap leading-relaxed select-text bg-zinc-900/50 border border-white/[0.05] rounded-xl p-3.5"></pre>
            </div>

            <!-- Sub-tab 2: Classify Reply for this Lead -->
            <div id="ins-pane-reply" class="flex-1 overflow-y-auto p-4 hidden space-y-3">
              <div class="cyber-card rounded-2xl p-4 space-y-3">
                <div class="flex items-center gap-2 text-xs text-zinc-200 font-semibold">
                  <i data-lucide="bot" class="w-4 h-4 text-orange-400"></i>
                  <span>Analizza la risposta di <span id="reply-lead-name" class="text-orange-400 underline decoration-orange-500/40"></span></span>
                </div>
                <div>
                  <label class="block text-[11px] font-mono text-zinc-400 mb-1">Oggetto (--subject) [Opzionale]</label>
                  <input id="ins-reply-subject" type="text" placeholder="Re: ..." class="w-full bg-zinc-950/90 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500">
                </div>
                <div>
                  <label class="block text-[11px] font-mono text-zinc-400 mb-1">Testo della risposta del cliente (--text)</label>
                  <textarea id="ins-reply-text" rows="5" placeholder="Incolla qui l'email ricevuta dal prospect per generare la contro-risposta consultiva..." class="w-full bg-zinc-950/90 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-orange-500 select-text"></textarea>
                </div>
                <button onclick="submitClassifyReply()" class="btn-juice w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2">
                  <i data-lucide="sparkles" class="w-4 h-4"></i> Classifica & Genera Risposta Consultiva
                </button>
              </div>
              <div id="ins-reply-result-box" class="hidden cyber-card rounded-2xl p-4 border-emerald-500/30">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Risultato AI Classifier</span>
                  <button onclick="copyText(document.getElementById('ins-reply-result').textContent, 'Risposta copiata!')" class="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1">
                    <i data-lucide="copy" class="w-3 h-3"></i> Copia
                  </button>
                </div>
                <pre id="ins-reply-result" class="text-xs font-mono text-emerald-300 whitespace-pre-wrap select-text leading-relaxed"></pre>
              </div>
            </div>

            <!-- Sub-tab 3: Raw JSON -->
            <div id="ins-pane-json" class="flex-1 overflow-y-auto p-4 hidden">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Payload JSON Originale</span>
                <button onclick="copyText(document.getElementById('ins-json-output').textContent, 'JSON copiato!')" class="btn-juice text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 flex items-center gap-1">
                  <i data-lucide="copy" class="w-3 h-3 text-orange-400"></i> Copia JSON
                </button>
              </div>
              <pre id="ins-json-output" class="text-[11px] font-mono text-amber-200/90 bg-zinc-900/60 border border-white/5 rounded-xl p-3.5 whitespace-pre-wrap select-text"></pre>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ==================== VIEW 2: SCOUTING & DEMO (THE RADAR ROOM) ==================== -->
    <section id="view-scout" class="flex-1 overflow-y-auto p-8 hidden view-enter">
      <div class="max-w-5xl mx-auto grid grid-cols-12 gap-6 items-start">

        <!-- Left 7 Cols: Controls -->
        <div class="col-span-12 lg:col-span-7 space-y-5">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> RADAR_ENGINE_ONLINE
            </div>
            <h1 class="text-2xl font-display font-bold text-white flex items-center gap-2.5">
              Scouting B2B & Forgia Demo Next.js
            </h1>
            <p class="text-sm text-zinc-400 mt-1">Scansiona nicchie ad alto margine, individua siti lenti su mobile, estrae il titolare e compila automaticamente la demo da 0.3s.</p>
          </div>

          <div class="cyber-card rounded-3xl p-6 space-y-5">
            <div>
              <label class="block text-xs font-mono font-bold uppercase tracking-wider text-orange-400 mb-2">
                🎯 Coordinate Keywords & Città (--keywords)
              </label>
              <input id="scout-kw" type="text" value="serramenti verona,infissi padova,fotovoltaico vicenza"
                placeholder="es. infissi catania, carpenteria metallica bergamo"
                class="w-full bg-zinc-950/90 border border-white/10 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-2xl px-4 py-3.5 text-sm text-white font-mono outline-none transition">

              <!-- Preset Chips -->
              <div class="flex flex-wrap items-center gap-2 mt-3">
                <span class="text-[11px] font-mono text-zinc-500 mr-1">Preset Tattici:</span>
                <button onclick="setScoutKw('infissi catania,serramenti palermo')" class="btn-juice text-xs bg-zinc-800/90 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 border border-white/5 text-zinc-300 px-3 py-1 rounded-xl transition">🌞 Infissi Sicilia</button>
                <button onclick="setScoutKw('serramenti verona,infissi padova,fotovoltaico vicenza')" class="btn-juice text-xs bg-zinc-800/90 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 border border-white/5 text-zinc-300 px-3 py-1 rounded-xl transition">⚡ Veneto Misto</button>
                <button onclick="setScoutKw('carpenteria metallica bergamo,carpenteria metallica brescia')" class="btn-juice text-xs bg-zinc-800/90 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 border border-white/5 text-zinc-300 px-3 py-1 rounded-xl transition">🏗️ Carpenteria Lombardia</button>
                <button onclick="setScoutKw('impianti fotovoltaici bologna,pannelli solari modena')" class="btn-juice text-xs bg-zinc-800/90 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 border border-white/5 text-zinc-300 px-3 py-1 rounded-xl transition">🔋 Solar Emilia</button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-zinc-950/80 border border-white/10 rounded-2xl p-4">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs font-mono text-zinc-400">Target Lead (--count)</label>
                  <i data-lucide="users" class="w-4 h-4 text-sky-400"></i>
                </div>
                <input id="scout-count" type="number" value="10" min="1" max="50" class="w-full bg-transparent text-3xl font-display font-bold font-mono text-white outline-none">
                <p class="text-[11px] text-zinc-500 mt-1">Lead qualificati da generare</p>
              </div>

              <div class="bg-zinc-950/80 border border-white/10 rounded-2xl p-4">
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs font-mono text-zinc-400">Soglia LCP (--min-lcp)</label>
                  <i data-lucide="gauge" class="w-4 h-4 text-orange-400"></i>
                </div>
                <div class="flex items-baseline gap-1">
                  <input id="scout-lcp" type="number" value="5.0" step="0.1" class="w-full bg-transparent text-3xl font-display font-bold font-mono text-orange-400 outline-none">
                  <span class="text-sm font-mono text-zinc-500">sec</span>
                </div>
                <p class="text-[11px] text-zinc-500 mt-1">Più è alto, più il sito è lento</p>
              </div>
            </div>

            <label class="flex items-center gap-3.5 p-4 rounded-2xl bg-zinc-950/70 border border-white/10 cursor-pointer hover:border-orange-500/40 transition">
              <input id="scout-send" type="checkbox" class="w-5 h-5 accent-orange-500 rounded">
              <div>
                <div class="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <span>Fuoco Automatico Step 1 (<code>--send</code>)</span>
                  <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">Auto-Strike</span>
                </div>
                <div class="text-xs text-zinc-400 mt-0.5">Appena forgiata la demo, spedisce immediatamente la prima email al lead.</div>
              </div>
            </label>

            <button onclick="launchScout()" class="btn-juice w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-display font-bold text-base shadow-xl shadow-orange-500/25 transition flex items-center justify-center gap-3">
              <i data-lucide="radar" class="w-5 h-5 animate-spin"></i>
              <span>AVVIA SCANSIONE & FORGIA DEMO</span>
            </button>
          </div>
        </div>

        <!-- Right 5 Cols: Live Tactical Radar Visualizer -->
        <div class="col-span-12 lg:col-span-5">
          <div class="cyber-card rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div class="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <i data-lucide="satellite" class="w-4 h-4 text-orange-400"></i> Telemetria Scanner B2B
            </div>

            <!-- Animated Radar Circle -->
            <div class="relative w-64 h-64 rounded-full border-2 border-orange-500/30 bg-zinc-950/90 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.15)]">
              <!-- Concentric Rings -->
              <div class="absolute w-48 h-48 rounded-full border border-orange-500/20"></div>
              <div class="absolute w-32 h-32 rounded-full border border-orange-500/20"></div>
              <div class="absolute w-16 h-16 rounded-full border border-orange-500/20"></div>
              <!-- Crosshairs -->
              <div class="absolute inset-x-0 h-px bg-orange-500/20"></div>
              <div class="absolute inset-y-0 w-px bg-orange-500/20"></div>
              <!-- Rotating Radar Beam -->
              <div class="absolute inset-0 rounded-full radar-sweep animate-radar"></div>
              <!-- Blipping Targets -->
              <span class="absolute top-12 left-20 w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981] animate-ping"></span>
              <span class="absolute bottom-16 right-14 w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_#f97316] animate-pulse"></span>
              <span class="absolute top-28 right-12 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_10px_#fbbf24] animate-ping" style="animation-delay: 0.7s"></span>
              <!-- Center Core -->
              <div class="relative z-10 w-4 h-4 rounded-full bg-orange-500 shadow-[0_0_15px_#f97316]"></div>
            </div>

            <div class="grid grid-cols-3 gap-2 w-full mt-6 text-left">
              <div class="bg-zinc-950/80 border border-white/5 rounded-xl p-2.5">
                <span class="text-[10px] font-mono text-zinc-500 block">MOTORE</span>
                <span class="text-xs font-mono font-bold text-emerald-400">PageSpeed + AI</span>
              </div>
              <div class="bg-zinc-950/80 border border-white/5 rounded-xl p-2.5">
                <span class="text-[10px] font-mono text-zinc-500 block">ANTI-BOT</span>
                <span class="text-xs font-mono font-bold text-sky-400">Filtro PEC/Ticket</span>
              </div>
              <div class="bg-zinc-950/80 border border-white/5 rounded-xl p-2.5">
                <span class="text-[10px] font-mono text-zinc-500 block">COPY</span>
                <span class="text-xs font-mono font-bold text-orange-400">4 Step Ready</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ==================== VIEW 3: BATCH CAMPAIGNS ==================== -->
    <section id="view-campaigns" class="flex-1 overflow-y-auto p-8 hidden view-enter">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono mb-2">
              <i data-lucide="git-merge" class="w-3.5 h-3.5"></i> SMTP_THREADING_PROTOCOL
            </div>
            <h1 class="text-2xl font-display font-bold text-white">
              Sequenze Batch Multi-Stadio (Step 1 → 4)
            </h1>
            <p class="text-sm text-zinc-400 mt-1">Jitter umano anti-spam automatico e concatenazione nella stessa conversazione tramite header <code>In-Reply-To</code>.</p>
          </div>

          <div class="flex items-center gap-4 cyber-card px-5 py-3 rounded-2xl">
            <div>
              <label class="text-[10px] font-mono uppercase text-zinc-400 block">Dimensione Batch (--batch)</label>
              <input id="batch-size" type="number" value="20" min="1" max="35" class="bg-transparent font-mono font-bold text-xl text-orange-400 w-16 outline-none">
            </div>
            <div class="h-8 w-px bg-zinc-800"></div>
            <label class="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer">
              <input id="batch-force" type="checkbox" class="w-4 h-4 accent-orange-500 rounded">
              <div>
                <span class="font-semibold block">Forza Orario</span>
                <span class="text-[10px] font-mono text-zinc-500">--force</span>
              </div>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Step 1 Card -->
          <div class="cyber-card cyber-card-interactive rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div class="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Giorno 1 · Step 1</span>
                <span class="text-xs font-mono text-zinc-400">Target: <code>NEW</code></span>
              </div>
              <h3 class="text-lg font-display font-bold text-white flex items-center gap-2">
                <span>First Touch (Zero-Fluff)</span>
              </h3>
              <p class="text-xs text-zinc-400 mt-2 leading-relaxed">Email chirurgica da 65-85 parole, ZERO link e ZERO prezzi per massimizzare il tasso di apertura e risposta. Salva il <code>Message-ID</code> per i follow-up.</p>
            </div>
            <button onclick="runBatchStep(1)" class="btn-juice mt-6 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2">
              <i data-lucide="play" class="w-4 h-4 fill-white"></i> LANCIA BATCH STEP 1
            </button>
          </div>

          <!-- Step 2 Card -->
          <div class="cyber-card cyber-card-interactive rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div class="absolute -right-8 -top-8 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">Giorno 4 · Step 2</span>
                <span class="text-xs font-mono text-zinc-400">In-Thread Reply</span>
              </div>
              <h3 class="text-lg font-display font-bold text-white">Consegna Demo 0.3s + Call</h3>
              <p class="text-xs text-zinc-400 mt-2 leading-relaxed">Risponde direttamente nel thread dello Step 1 consegnando proattivamente il link del prototipo veloce e proponendo 10 minuti di call.</p>
            </div>
            <button onclick="runBatchStep(2)" class="btn-juice mt-6 w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-display font-bold text-xs shadow-lg shadow-sky-600/25 transition flex items-center justify-center gap-2">
              <i data-lucide="play" class="w-4 h-4 fill-white"></i> LANCIA BATCH STEP 2
            </button>
          </div>

          <!-- Step 3 Card -->
          <div class="cyber-card cyber-card-interactive rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div class="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">Giorno 8 · Step 3</span>
                <span class="text-xs font-mono text-zinc-400">In-Thread + Phone Alert</span>
              </div>
              <h3 class="text-lg font-display font-bold text-white">Value Drop + Allerta Telefonica</h3>
              <p class="text-xs text-zinc-400 mt-2 leading-relaxed">Invia il terzo tocco tecnico nel thread ed estrae in console il numero diretto del lead per l'affondo telefonico rapido.</p>
            </div>
            <button onclick="runBatchStep(3)" class="btn-juice mt-6 w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-display font-bold text-xs shadow-lg shadow-amber-600/25 transition flex items-center justify-center gap-2">
              <i data-lucide="play" class="w-4 h-4 fill-white"></i> LANCIA BATCH STEP 3
            </button>
          </div>

          <!-- Step 4 Card -->
          <div class="cyber-card cyber-card-interactive rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden">
            <div class="absolute -right-8 -top-8 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">Giorno 13 · Step 4</span>
                <span class="text-xs font-mono text-zinc-400">In-Thread Breakup</span>
              </div>
              <h3 class="text-lg font-display font-bold text-white">Breakup Email Cortese</h3>
              <p class="text-xs text-zinc-400 mt-2 leading-relaxed">Ultimo messaggio di congedo professionale nello stesso thread: sfrutta la psicologia della perdita per sbloccare i ritardatari.</p>
            </div>
            <button onclick="runBatchStep(4)" class="btn-juice mt-6 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-display font-bold text-xs shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2">
              <i data-lucide="play" class="w-4 h-4 fill-white"></i> LANCIA BATCH STEP 4
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== VIEW 4: DRYRUN & TOOLS ==================== -->
    <section id="view-tools" class="flex-1 overflow-y-auto p-8 hidden view-enter">
      <div class="max-w-3xl mx-auto space-y-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono mb-2">
            <i data-lucide="cpu" class="w-3.5 h-3.5"></i> DIAGNOSTICS_&_ALCHEMIST_LAB
          </div>
          <h1 class="text-2xl font-display font-bold text-white">Laboratorio Dry-Run & Manutenzione DB</h1>
        </div>

        <div class="cyber-card rounded-3xl p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
              <i data-lucide="flask-conical" class="w-5 h-5 text-orange-400"></i>
            </div>
            <div>
              <h2 class="text-base font-display font-bold text-white">Simulazione Preliminare (Dry-Run)</h2>
              <p class="text-xs text-zinc-400">Testa scraping, scoring email e rilevamento Pixel su keyword reali senza salvare file né inviare email.</p>
            </div>
          </div>
          <input id="dryrun-kw" type="text" value="infissi catania,impianti fotovoltaici brescia,carpenteria metallica milano"
            class="w-full bg-zinc-950/90 border border-white/10 rounded-2xl px-4 py-3 text-sm font-mono text-white outline-none focus:border-orange-500">
          <button onclick="runDryRun()" class="btn-juice py-3 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-display font-bold text-xs shadow-lg shadow-orange-500/20 transition flex items-center gap-2">
            <i data-lucide="play" class="w-4 h-4 fill-white"></i> AVVIA SIMULAZIONE DRY-RUN
          </button>
        </div>

        <div class="cyber-card rounded-3xl p-6 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
              <i data-lucide="wand-2" class="w-5 h-5 text-sky-400"></i>
            </div>
            <div>
              <h2 class="text-base font-display font-bold text-white">Purificazione Database Lead (Migrate & Help)</h2>
              <p class="text-xs text-zinc-400"><code>migrate</code> bonifica tutti i JSON in <code>src/data/leads/*.json</code>, filtra caselle ticket/PEC e rigenera i 4 step Zero-Fluff.</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3 pt-1">
            <button onclick="runCliStream(['migrate'], true)" class="btn-juice py-3 px-5 rounded-xl bg-zinc-800 hover:bg-sky-600 text-white font-semibold text-xs border border-white/10 transition flex items-center gap-2">
              <i data-lucide="refresh-ccw" class="w-4 h-4 text-sky-400"></i> Esegui Migrate sui JSON
            </button>
            <button onclick="runCliStream(['help'], true)" class="btn-juice py-3 px-5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-white/10 transition flex items-center gap-2">
              <i data-lucide="book-open" class="w-4 h-4 text-amber-400"></i> Manuale Comandi CLI
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== COLLAPSIBLE LIVE CYBER CONSOLE DRAWER ==================== -->
    <div id="console-drawer" class="border-t border-white/10 bg-zinc-950/95 backdrop-blur-2xl transition-all duration-300 flex flex-col shrink-0 h-10 z-30">
      <!-- Console Header Bar -->
      <div onclick="toggleConsole()" class="h-10 px-5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/80 select-none shrink-0">
        <div class="flex items-center gap-3 text-xs font-mono">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
          </div>
          <i data-lucide="terminal" class="w-3.5 h-3.5 text-orange-400 ml-1"></i>
          <span id="console-status-text" class="text-zinc-400 font-semibold">READY</span>
          <span class="text-zinc-700">│</span>
          <span id="console-cmd-label" class="text-amber-300/90 truncate max-w-md">npm run tp</span>
        </div>
        <div class="flex items-center gap-2" onclick="event.stopPropagation()">
          <button id="kill-btn" onclick="killActiveProcess()" class="hidden btn-juice px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 text-[11px] font-mono font-bold">
            ⏹ TERMINA PROCESSO
          </button>
          <button onclick="copyText(document.getElementById('console-output').textContent, 'Log console copiato!')" class="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono">Copia Log</button>
          <button onclick="clearConsole()" class="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono">Pulisci</button>
          <button onclick="toggleConsole()" class="p-1 text-zinc-400 hover:text-white">
            <i id="console-chevron" data-lucide="chevron-up" class="w-4 h-4 transition-transform duration-300"></i>
          </button>
        </div>
      </div>
      <!-- Console Output Body -->
      <pre id="console-output" class="flex-1 p-5 overflow-y-auto font-mono text-xs text-emerald-300/90 bg-black/60 whitespace-pre-wrap leading-relaxed select-text border-t border-white/[0.06]"></pre>
    </div>

  </main>

  <script>
    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    let allLeads = [];
    let currentFilterStatus = 'ALL';
    let selectedSlug = null;
    let consoleOpen = false;
    let crmLayout = 'table'; // 'table' | 'kanban'
    let soundEnabled = true;

    // ==================== WEB AUDIO API SYNTHESIZER (LUDIC SFX) ====================
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    let audioCtx = null;

    function playSound(type = 'click') {
      if (!soundEnabled) return;
      try {
        if (!audioCtx) audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;

        if (type === 'click') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
        } else if (type === 'tab') {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(340, now);
          osc.frequency.exponentialRampToValueAtTime(680, now + 0.07);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        } else if (type === 'launch') {
          [440, 554.37, 659.25, 880].forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.055);
            gain.gain.setValueAtTime(0.07, now + idx * 0.055);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.18);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + idx * 0.055);
            osc.stop(now + idx * 0.055 + 0.19);
          });
        }
      } catch {}
    }

    function toggleSound() {
      soundEnabled = !soundEnabled;
      const btn = document.getElementById('sfx-btn');
      btn.innerHTML = \`<i data-lucide="\${soundEnabled ? 'volume-2' : 'volume-x'}" class="w-4 h-4 \${soundEnabled ? 'text-amber-400' : 'text-zinc-500'}"></i>\`;
      lucide.createIcons();
      if (soundEnabled) playSound('launch');
      showToast(soundEnabled ? 'Effetti Sonori Arcade Attivati 🔊' : 'Audio Disattivato 🔇', 'info');
    }

    // ==================== CONFETTI & PYRE SPARKS ====================
    function triggerPyreBurst(e) {
      playSound('launch');
      if (typeof confetti === 'function') {
        const x = e ? e.clientX / window.innerWidth : 0.5;
        const y = e ? e.clientY / window.innerHeight : 0.3;
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { x, y },
          colors: ['#ff5500', '#f59e0b', '#10b981', '#38bdf8']
        });
      }
    }

    // ==================== TOAST NOTIFICATIONS ====================
    function showToast(msg, type = 'orange') {
      const container = document.getElementById('toast-container');
      const el = document.createElement('div');
      const colors = {
        orange: 'border-orange-500/40 bg-zinc-900/95 text-orange-300',
        emerald: 'border-emerald-500/40 bg-zinc-900/95 text-emerald-300',
        info: 'border-white/15 bg-zinc-900/95 text-zinc-200'
      };
      el.className = \`px-4 py-2.5 rounded-xl border backdrop-blur-xl shadow-xl text-xs font-mono flex items-center gap-2 transition-all duration-300 \${colors[type] || colors.orange}\`;
      el.innerHTML = \`<span class="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span><span>\${msg}</span>\`;
      container.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(20px)';
        setTimeout(() => el.remove(), 300);
      }, 2600);
    }

    function copyText(text, toastMsg = 'Copiato negli appunti!') {
      if (!text || text === '—') return;
      navigator.clipboard.writeText(text);
      playSound('click');
      showToast(toastMsg, 'emerald');
    }

    function copySlug() {
      if (selectedSlug) copyText(selectedSlug, \`Slug "\${selectedSlug}" copiato!\`);
    }

    function copyInspectOutput() {
      const txt = document.getElementById('ins-inspect-output').textContent;
      copyText(txt, 'Copy dei 4 Step copiato negli appunti!');
    }

    // ==================== STATUS BADGES ====================
    function getStatusBadgeHTML(status) {
      const map = {
        'NEW': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
        'HOT_LEAD': 'bg-gradient-to-r from-orange-500/30 to-amber-500/30 text-orange-200 border-orange-500/50 hot-pulse',
        'INVALID_TICKET_INBOX': 'bg-zinc-800/90 text-zinc-400 border-zinc-700',
        'BLACKLISTED': 'bg-rose-500/15 text-rose-300 border-rose-500/35',
      };
      const cls = map[status] || (status.startsWith('CONTACTED')
        ? 'bg-sky-500/15 text-sky-300 border-sky-500/35'
        : 'bg-zinc-800 text-zinc-300 border-zinc-700');
      const icon = status === 'HOT_LEAD' ? '🔥 ' : status === 'NEW' ? '✨ ' : status.startsWith('CONTACTED') ? '🚀 ' : '';
      return \`<span class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold border \${cls}">\${icon}\${status}</span>\`;
    }

    // ==================== NAVIGATION & VIEWS ====================
    function switchMainView(view) {
      playSound('tab');
      ['crm', 'scout', 'campaigns', 'tools'].forEach(v => {
        const sec = document.getElementById('view-' + v);
        sec.classList.toggle('hidden', v !== view);
        const btn = document.getElementById('nav-' + v);
        if (v === view) {
          btn.className = 'nav-tab btn-juice flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/20';
        } else {
          btn.className = 'nav-tab btn-juice flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all';
        }
      });
    }

    function setCrmLayout(mode) {
      playSound('click');
      crmLayout = mode;
      document.getElementById('crm-table-container').classList.toggle('hidden', mode !== 'table');
      document.getElementById('crm-kanban-container').classList.toggle('hidden', mode !== 'kanban');
      document.getElementById('layout-table-btn').className = mode === 'table'
        ? 'px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 text-orange-400 flex items-center gap-1 transition'
        : 'px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition';
      document.getElementById('layout-kanban-btn').className = mode === 'kanban'
        ? 'px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 text-orange-400 flex items-center gap-1 transition'
        : 'px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition';
      renderLeadsView();
    }

    function toggleConsole(forceState) {
      playSound('click');
      consoleOpen = typeof forceState === 'boolean' ? forceState : !consoleOpen;
      const drawer = document.getElementById('console-drawer');
      const chev = document.getElementById('console-chevron');
      drawer.style.height = consoleOpen ? '340px' : '40px';
      if (chev) chev.style.transform = consoleOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    function clearConsole() {
      playSound('click');
      document.getElementById('console-output').textContent = '';
    }

    // ==================== DATA LOADING & GAMIFICATION XP ====================
    async function refreshLeadsWithJuice() {
      playSound('tab');
      await loadLeads(true);
      showToast('Arsenale Lead sincronizzato! ⚡', 'emerald');
    }

    async function loadLeads(preserveSelection = true) {
      const res = await fetch('/api/leads');
      allLeads = await res.json();
      updateKPIsAndXP();
      renderLeadsView();
      if (preserveSelection && selectedSlug) {
        const stillExists = allLeads.find(l => l.slug === selectedSlug);
        if (stillExists) selectLead(selectedSlug, false);
      } else if (!selectedSlug && allLeads.length > 0) {
        selectLead(allLeads[0].slug, true);
      }
    }

    function animateCounter(el, target) {
      if (!el) return;
      const start = parseInt(el.textContent || '0', 10) || 0;
      if (start === target) {
        el.textContent = target;
        return;
      }
      const duration = 350;
      const startTime = performance.now();
      function step(now) {
        const p = Math.min((now - startTime) / duration, 1);
        el.textContent = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function updateKPIsAndXP() {
      const counts = { ALL: allLeads.length, NEW: 0, CONTACTED: 0, HOT_LEAD: 0, BLOCKED: 0 };
      allLeads.forEach(l => {
        if (l.status === 'NEW') counts.NEW++;
        else if (l.status.startsWith('CONTACTED')) counts.CONTACTED++;
        else if (l.status === 'HOT_LEAD') counts.HOT_LEAD++;
        else if (l.status === 'BLACKLISTED' || l.status === 'INVALID_TICKET_INBOX') counts.BLOCKED++;
      });

      Object.keys(counts).forEach(k => {
        animateCounter(document.getElementById('count-' + k), counts[k]);
        const bar = document.getElementById('bar-' + k);
        if (bar && counts.ALL > 0) {
          bar.style.width = Math.min(100, Math.round((counts[k] / counts.ALL) * 100)) + '%';
        }
      });

      const navBadge = document.getElementById('nav-badge-crm');
      if (navBadge) navBadge.textContent = counts.ALL;

      // Gamified XP calculation
      const xp = (counts.ALL * 15) + (counts.CONTACTED * 45) + (counts.HOT_LEAD * 150);
      const level = Math.max(1, Math.floor(xp / 500) + 1);
      const progressPct = Math.min(100, Math.max(10, Math.round(((xp % 500) / 500) * 100)));
      const ranks = [
        'Pyro Scout', 'Spark Forger', 'Outbound Ranger', 'Thread Tactician',
        'Pipeline Commander', 'Demo Alchemist', 'Conversion Knight', 'Pyre Warlord', 'Apex Closer'
      ];
      const rankName = ranks[Math.min(ranks.length - 1, level - 1)];

      const xpEl = document.getElementById('xp-counter');
      const xpBar = document.getElementById('xp-bar');
      const rankEl = document.getElementById('rank-title');
      const comboEl = document.getElementById('combo-badge');

      if (xpEl) xpEl.textContent = \`\${xp.toLocaleString('it-IT')} XP\`;
      if (xpBar) xpBar.style.width = \`\${progressPct}%\`;
      if (rankEl) rankEl.textContent = \`Lv.\${level} · \${rankName}\`;
      if (comboEl) {
        const mult = (1 + (counts.HOT_LEAD * 0.25) + (counts.CONTACTED * 0.05)).toFixed(1);
        comboEl.textContent = \`\${mult}x 🔥\`;
      }
    }

    function setFilterStatus(status) {
      playSound('click');
      currentFilterStatus = status;
      document.getElementById('exact-status-filter').value = status;
      ['ALL', 'NEW', 'CONTACTED', 'HOT_LEAD', 'BLOCKED'].forEach(k => {
        const card = document.getElementById('kpi-' + k);
        if (card) {
          if (k === status) {
            card.classList.add('ring-2', 'ring-orange-500/70');
          } else {
            card.classList.remove('ring-2', 'ring-orange-500/70');
          }
        }
      });
      renderLeadsView();
    }

    function getFilteredLeads() {
      const q = document.getElementById('crm-search').value.toLowerCase().trim();
      return allLeads.filter(l => {
        if (currentFilterStatus === 'NEW' && l.status !== 'NEW') return false;
        if (currentFilterStatus === 'CONTACTED' && !l.status.startsWith('CONTACTED')) return false;
        if (currentFilterStatus === 'HOT_LEAD' && l.status !== 'HOT_LEAD') return false;
        if (currentFilterStatus === 'BLOCKED' && l.status !== 'BLACKLISTED' && l.status !== 'INVALID_TICKET_INBOX') return false;
        if (!['ALL', 'NEW', 'CONTACTED', 'HOT_LEAD', 'BLOCKED'].includes(currentFilterStatus) && l.status !== currentFilterStatus) return false;

        if (!q) return true;
        return (
          l.slug.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.owner && l.owner.toLowerCase().includes(q)) ||
          (l.keyword && l.keyword.toLowerCase().includes(q))
        );
      });
    }

    function renderLeadsView() {
      const filtered = getFilteredLeads();
      if (crmLayout === 'kanban') {
        renderKanbanBoard(filtered);
      } else {
        renderLeadsTable(filtered);
      }
    }

    function renderLeadsTable(filtered) {
      const tbody = document.getElementById('leads-tbody');
      if (filtered.length === 0) {
        tbody.innerHTML = \`<tr><td colspan="5" class="py-16 text-center text-zinc-500 font-mono">Nessun bersaglio rilevato con questi filtri radar.</td></tr>\`;
        return;
      }

      tbody.innerHTML = filtered.map(l => {
        const isSelected = l.slug === selectedSlug;
        const rowCls = isSelected
          ? 'bg-gradient-to-r from-orange-500/15 via-orange-500/5 to-transparent border-l-2 border-l-orange-500 cursor-pointer transition'
          : 'hover:bg-white/[0.03] cursor-pointer transition';

        const numLcp = parseFloat(l.lcp);
        const lcpBadge = l.lcp
          ? \`<span class="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg \${numLcp >= 5 ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'}">🐢 \${l.lcp}s</span>\`
          : '<span class="text-zinc-600 font-mono">—</span>';

        return \`
          <tr onclick="selectLead('\${l.slug}', true)" class="\${rowCls}">
            <td class="py-3.5 pl-5 pr-3">
              <div class="font-display font-bold text-zinc-100 truncate max-w-[210px]">\${l.company}</div>
              <div class="text-[11px] font-mono text-zinc-500 truncate max-w-[210px]">\${l.slug}</div>
            </td>
            <td class="py-3.5 px-3">\${getStatusBadgeHTML(l.status)}</td>
            <td class="py-3.5 px-3">
              <div class="text-zinc-200 font-mono text-[11px] truncate max-w-[195px]">\${l.email || '<span class="text-zinc-600">Nessuna email</span>'}</div>
              <div class="text-[11px] text-zinc-400 truncate max-w-[195px]">\${l.owner || 'Titolare N/D'} \${l.phone ? '· <span class="text-amber-400/90 font-mono">' + l.phone + '</span>' : ''}</div>
            </td>
            <td class="py-3.5 px-3">\${lcpBadge}</td>
            <td class="py-3.5 pl-3 pr-5 text-right" onclick="event.stopPropagation()">
              <div class="inline-flex items-center gap-1.5">
                <a href="http://localhost:3000/demo/\${l.slug}" target="_blank" class="btn-juice px-2.5 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-white/10 text-zinc-200 text-[11px] font-mono" title="Apri Demo Locale">:3000</a>
                <a href="https://www.techpyre.eu/demo/\${l.slug}" target="_blank" class="btn-juice px-2.5 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 text-[11px] font-mono" title="Apri Demo Produzione">Prod ↗</a>
              </div>
            </td>
          </tr>
        \`;
      }).join('');
    }

    function renderKanbanBoard(filtered) {
      const cols = [
        { key: 'NEW', title: '✨ Pronti (NEW)', color: 'border-emerald-500/30 text-emerald-400', items: filtered.filter(l => l.status === 'NEW') },
        { key: 'STEP_1_2', title: '🚀 Step 1 & 2', color: 'border-sky-500/30 text-sky-400', items: filtered.filter(l => l.status === 'CONTACTED_STEP_1' || l.status === 'CONTACTED_STEP_2' || l.status === 'CONTACTED') },
        { key: 'STEP_3_4', title: '📞 Step 3 & 4', color: 'border-amber-500/30 text-amber-400', items: filtered.filter(l => l.status === 'CONTACTED_STEP_3' || l.status === 'CONTACTED_STEP_4') },
        { key: 'HOT', title: '🔥 Hot Leads', color: 'border-orange-500/40 text-orange-400', items: filtered.filter(l => l.status === 'HOT_LEAD') }
      ];

      const container = document.getElementById('kanban-columns');
      container.innerHTML = cols.map(col => \`
        <div class="flex-1 flex flex-col bg-zinc-900/50 border border-white/[0.06] rounded-2xl overflow-hidden">
          <div class="p-3 border-b border-white/[0.06] flex items-center justify-between bg-zinc-950/60">
            <span class="text-xs font-display font-bold \${col.color}">\${col.title}</span>
            <span class="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">\${col.items.length}</span>
          </div>
          <div class="flex-1 overflow-y-auto p-2.5 space-y-2">
            \${col.items.length === 0 ? '<div class="text-[11px] font-mono text-zinc-600 text-center py-8">Vuoto</div>' : col.items.map(l => \`
              <div onclick="selectLead('\${l.slug}', true)" class="p-3 rounded-xl border \${l.slug === selectedSlug ? 'border-orange-500 bg-orange-500/10' : 'border-white/[0.06] bg-zinc-950/80 hover:border-zinc-700'} cursor-pointer transition space-y-1.5">
                <div class="flex items-start justify-between gap-2">
                  <span class="font-display font-bold text-xs text-white truncate">\${l.company}</span>
                  \${l.lcp ? \`<span class="text-[10px] font-mono text-rose-400 shrink-0">\${l.lcp}s</span>\` : ''}
                </div>
                <div class="text-[10px] font-mono text-zinc-400 truncate">\${l.email || l.slug}</div>
                <div class="flex items-center justify-between pt-1">
                  \${getStatusBadgeHTML(l.status)}
                  <span class="text-[10px] text-zinc-500 truncate max-w-[90px]">\${l.owner || ''}</span>
                </div>
              </div>
            \`).join('')}
          </div>
        </div>
      \`).join('');
    }

    function renderQuestStepper(status) {
      let activeStep = 0;
      if (status === 'CONTACTED_STEP_1' || status === 'CONTACTED') activeStep = 1;
      else if (status === 'CONTACTED_STEP_2') activeStep = 2;
      else if (status === 'CONTACTED_STEP_3') activeStep = 3;
      else if (status === 'CONTACTED_STEP_4') activeStep = 4;
      else if (status === 'HOT_LEAD') activeStep = 4;

      const labelEl = document.getElementById('ins-step-label');
      if (labelEl) {
        labelEl.textContent = status === 'HOT_LEAD' ? '🔥 HOT LEAD!' : activeStep > 0 ? \`Step \${activeStep}/4\` : 'Pronto al lancio';
      }

      const nodesEl = document.getElementById('ins-quest-nodes');
      if (!nodesEl) return;

      nodesEl.innerHTML = [1, 2, 3, 4].map(s => {
        const done = s <= activeStep;
        return \`
          <div class="flex-1 flex items-center gap-1">
            <div class="w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center border transition-all \${done ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-zinc-950 text-zinc-500 border-zinc-800'}">
              S\${s}
            </div>
            \${s < 4 ? \`<div class="flex-1 h-1 rounded-full \${s < activeStep ? 'bg-orange-500' : 'bg-zinc-800'}"></div>\` : ''}
          </div>
        \`;
      }).join('');
    }

    async function selectLead(slug, fetchInspect = true) {
      if (selectedSlug !== slug) playSound('click');
      selectedSlug = slug;
      renderLeadsView();
      const lead = allLeads.find(l => l.slug === slug);
      if (!lead) return;

      document.getElementById('inspector-empty').classList.add('hidden');
      document.getElementById('inspector-content').classList.remove('hidden');

      document.getElementById('ins-company').textContent = lead.company;
      document.getElementById('ins-slug').textContent = lead.slug;
      document.getElementById('ins-status-badge').innerHTML = getStatusBadgeHTML(lead.status);
      document.getElementById('ins-email').textContent = lead.email || '—';
      document.getElementById('ins-owner').textContent = [lead.owner, lead.phone].filter(Boolean).join(' · ') || '—';
      document.getElementById('ins-lcp-val').textContent = lead.lcp ? \`\${lead.lcp}s 🐢\` : 'N/D';
      document.getElementById('reply-lead-name').textContent = lead.company;
      document.getElementById('ins-json-output').textContent = JSON.stringify(lead.raw, null, 2);

      renderQuestStepper(lead.status);

      if (fetchInspect) {
        document.getElementById('ins-inspect-loading').classList.remove('hidden');
        document.getElementById('ins-inspect-output').textContent = '';
        try {
          const res = await fetch('/api/inspect?slug=' + encodeURIComponent(slug));
          const text = await res.text();
          document.getElementById('ins-inspect-output').textContent = text;
        } catch (e) {
          document.getElementById('ins-inspect-output').textContent = 'Errore durante inspect: ' + e.message;
        } finally {
          document.getElementById('ins-inspect-loading').classList.add('hidden');
        }
      }
    }

    function switchInspectorTab(tab) {
      playSound('tab');
      ['inspect', 'reply', 'json'].forEach(t => {
        document.getElementById('ins-pane-' + t).classList.toggle('hidden', t !== tab);
        const btn = document.getElementById('instab-' + t);
        btn.className = t === tab
          ? 'btn-juice flex-1 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-300 shadow transition'
          : 'btn-juice flex-1 py-1.5 text-xs font-semibold rounded-lg text-zinc-400 hover:text-white transition';
      });
    }

    function openSelectedDemo(env) {
      if (!selectedSlug) return;
      playSound('launch');
      const url = env === 'local'
        ? \`http://localhost:3000/demo/\${selectedSlug}\`
        : \`https://www.techpyre.eu/demo/\${selectedSlug}\`;
      window.open(url, '_blank');
    }

    // ==================== CLI STREAMING & EXECUTION ====================
    async function runCliStream(args, openDrawer = true) {
      triggerPyreBurst();
      if (openDrawer) toggleConsole(true);

      const out = document.getElementById('console-output');
      const statusText = document.getElementById('console-status-text');
      const dot = document.getElementById('top-status-dot');
      const cmdLabel = document.getElementById('console-cmd-label');
      const killBtn = document.getElementById('kill-btn');

      const prettyCmd = 'npm run tp -- ' + args.map(a => a.includes(' ') ? \`"\${a}"\` : a).join(' ');
      cmdLabel.textContent = prettyCmd;
      statusText.textContent = 'RUNNING';
      statusText.className = 'text-orange-400 font-bold animate-pulse';
      dot.className = 'w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping';
      killBtn.classList.remove('hidden');

      out.textContent += \`\\n⚡ \${prettyCmd}\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\`;
      out.scrollTop = out.scrollHeight;

      let fullOutput = '';
      try {
        const res = await fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ args })
        });
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullOutput += chunk;
          out.textContent += chunk;
          out.scrollTop = out.scrollHeight;
        }
        showToast('Operazione CLI completata con successo! 🔥', 'emerald');
      } catch (e) {
        out.textContent += \`\\n[Errore]: \${e.message}\\n\`;
      } finally {
        statusText.textContent = 'READY';
        statusText.className = 'text-zinc-400 font-semibold';
        dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]';
        killBtn.classList.add('hidden');
        await loadLeads(true);
      }
      return fullOutput;
    }

    async function killActiveProcess() {
      playSound('click');
      await fetch('/api/kill', { method: 'POST' });
      showToast('Processo interrotto manualmente ⏹', 'orange');
    }

    function sendSingleStep(step) {
      if (!selectedSlug) return;
      const force = document.getElementById('ins-force-send').checked;
      const args = ['send', selectedSlug, \`--step=\${step}\`];
      if (force) args.push('--force');
      showToast(\`Invio Step \${step} a \${selectedSlug}... 🚀\`, 'orange');
      runCliStream(args, true);
    }

    async function submitClassifyReply() {
      if (!selectedSlug) return;
      const subj = document.getElementById('ins-reply-subject').value.trim();
      const text = document.getElementById('ins-reply-text').value.trim();
      if (!text) return showToast('Incolla prima il testo della risposta del cliente!', 'orange');

      const args = ['classify-reply', selectedSlug];
      if (subj) args.push(\`--subject=\${subj}\`);
      args.push(\`--text=\${text}\`);

      const resultBox = document.getElementById('ins-reply-result-box');
      const resultPre = document.getElementById('ins-reply-result');
      resultBox.classList.remove('hidden');
      resultPre.textContent = '🧠 Analisi semantica e generazione risposta consultiva in corso...';

      const output = await runCliStream(args, false);
      resultPre.textContent = output;
    }

    function setScoutKw(val) {
      playSound('click');
      document.getElementById('scout-kw').value = val;
      showToast('Coordinate keyword caricate nel radar!', 'info');
    }

    function launchScout() {
      const kw = document.getElementById('scout-kw').value.trim();
      const count = document.getElementById('scout-count').value;
      const lcp = document.getElementById('scout-lcp').value;
      const send = document.getElementById('scout-send').checked;
      if (!kw) return showToast('Inserisci almeno una keyword nel radar!', 'orange');
      const args = ['scout', \`--keywords=\${kw}\`, \`--count=\${count}\`, \`--min-lcp=\${lcp}\`];
      if (send) args.push('--send');
      runCliStream(args, true);
    }

    function runBatchStep(step) {
      const batch = document.getElementById('batch-size').value;
      const force = document.getElementById('batch-force').checked;
      const args = ['send', \`--batch=\${batch}\`, \`--step=\${step}\`];
      if (force) args.push('--force');
      runCliStream(args, true);
    }

    function runDryRun() {
      const kw = document.getElementById('dryrun-kw').value.trim();
      const args = ['dryrun'];
      if (kw) args.push(\`--keywords=\${kw}\`);
      runCliStream(args, true);
    }

    // ==================== FLOATING EMBER PARTICLES BACKGROUND ====================
    function initEmberCanvas() {
      const canvas = document.getElementById('ember-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let w = (canvas.width = window.innerWidth);
      let h = (canvas.height = window.innerHeight);

      window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      });

      const embers = Array.from({ length: 32 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.55 - 0.15,
        alpha: Math.random() * 0.65 + 0.15,
        color: Math.random() > 0.35 ? '#f97316' : '#fbbf24'
      }));

      function draw() {
        ctx.clearRect(0, 0, w, h);
        for (const p of embers) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) {
            p.y = h + 10;
            p.x = Math.random() * w;
          }
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        }
        requestAnimationFrame(draw);
      }
      draw();
    }

    // Scorciatoie da tastiera (Cmd+K cerca, Cmd+J console)
    window.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        switchMainView('crm');
        document.getElementById('crm-search').focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleConsole();
      }
    });

    lucide.createIcons();
    initEmberCanvas();
    loadLeads(false);
  </script>
</body>
</html>`;

let activeChild = null;

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && urlObj.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(HTML_UI);
  }

  if (req.method === 'GET' && urlObj.pathname === '/api/leads') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(getLeadsData()));
  }

  // Endpoint rapido che esegue "inspect <slug>" dietro le quinte per popolare l'Inspector visuale
  if (req.method === 'GET' && urlObj.pathname === '/api/inspect') {
    const slug = urlObj.searchParams.get('slug');
    if (!slug) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Slug mancante');
    }
    const child = spawn('node', [CLI_PATH, 'inspect', slug], {
      cwd: PROJECT_ROOT,
      env: {
        ...process.env,
        PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ''}`,
        FORCE_COLOR: '0'
      }
    });
    let out = '';
    child.stdout.on('data', d => (out += stripAnsi(d.toString())));
    child.stderr.on('data', d => (out += stripAnsi(d.toString())));
    child.on('error', err => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end(`Errore inspect: ${err.message}`);
    });
    child.on('close', () => {
      if (!res.headersSent) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end(out || 'Nessun output restituito da inspect.');
    });
    return;
  }

  if (req.method === 'POST' && urlObj.pathname === '/api/kill') {
    if (activeChild) {
      try {
        activeChild.kill('SIGTERM');
      } catch {}
      activeChild = null;
    }
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('OK');
  }

  if (req.method === 'POST' && urlObj.pathname === '/api/run') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const { args } = JSON.parse(body || '{}');
        if (!Array.isArray(args)) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('Argomenti non validi: "args" deve essere un array');
        }

        if (activeChild) {
          try { activeChild.kill('SIGTERM'); } catch {}
          activeChild = null;
        }

        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked'
        });

        activeChild = spawn('node', [CLI_PATH, ...args], {
          cwd: PROJECT_ROOT,
          env: {
            ...process.env,
            PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ''}`,
            FORCE_COLOR: '0'
          }
        });

        activeChild.stdout.on('data', data => res.write(stripAnsi(data.toString())));
        activeChild.stderr.on('data', data => res.write(stripAnsi(data.toString())));

        activeChild.on('close', code => {
          const statusMsg = code !== null ? `exit code ${code}` : 'interrotto';
          res.write(`\n[Completato · ${statusMsg}]\n`);
          res.end();
          activeChild = null;
        });

        activeChild.on('error', err => {
          res.write(`\n[Errore processo]: ${err.message}\n`);
          res.end();
          activeChild = null;
        });
      } catch (err) {
        if (!res.headersSent) {
          res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        }
        res.end(`Richiesta non valida: ${err.message}`);
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Porta ${PORT} già in uso. Prova ad impostare una porta alternativa (es. PORT=4322 node techpyre-gui.mjs)`);
  } else {
    console.error('\n❌ Errore del server:', err.message);
  }
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n🔥 TechPyre Outbound Command Center attivo su: ${url}`);
  try {
    const opener = spawn('open', [url]);
    opener.on('error', () => {});
  } catch {}
});
