import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAdminSession } from "@/lib/adminAuth";
import { getAllVisits } from "@/lib/visitsStorage";
import { getOutreachHistory, OutreachLogEntry } from "@/lib/emailService";
import {
  computePipelineCounters,
  deriveLeadStatus,
  groupOutreachHistoryBySlug,
  LeadStatus,
} from "@/lib/leadLifecycle";
import { listAllLeadConfigs } from "@/lib/leadsStorage";

export async function GET() {
  const user = await getAdminSession();
  if (!user) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  const allConfigs = listAllLeadConfigs();
  const leads = [];
  const globalHistory = getOutreachHistory();
  const historyProgressBySlug = groupOutreachHistoryBySlug(globalHistory);
  const historyBySlug = new Map<string, OutreachLogEntry[]>();
  for (const entry of globalHistory) {
    if (!entry.slug) continue;
    const list = historyBySlug.get(entry.slug);
    if (list) {
      list.push(entry);
    } else {
      historyBySlug.set(entry.slug, [entry]);
    }
  }
  const allVisits = getAllVisits();
  const derivedStatuses: LeadStatus[] = [];

  for (const { slug, config } of allConfigs) {
    try {
      const leadPublicDir = path.join(process.cwd(), "public", "leads", slug);
      const artifactDir = path.join(process.cwd(), "src", "data", "lead-artifacts", slug);

      let preflight = null;
      const preflightPath = path.join(artifactDir, "preflight.json");
      if (fs.existsSync(preflightPath)) {
        try {
          preflight = JSON.parse(fs.readFileSync(preflightPath, "utf-8"));
        } catch {}
      }

      const logoPath = config.content?.logoLocalPath || "";
      const heroPath = config.content?.heroImageLocalPath || "";
      const hasLogo =
        logoPath.startsWith("http") ||
        fs.existsSync(path.join(leadPublicDir, "logo.png"));
      const hasHero =
        heroPath.startsWith("http") ||
        fs.existsSync(path.join(leadPublicDir, "hero.jpg"));

      const leadHistory = historyBySlug.get(slug) || [];
      const progress = historyProgressBySlug.get(slug);
      const derivedStatus = deriveLeadStatus(config.meta.status, progress);
      derivedStatuses.push(derivedStatus);

      const lastSend = leadHistory.length ? leadHistory[leadHistory.length - 1] : null;
      const visitData = allVisits[slug] || null;
      const hasReplied = derivedStatus === "HOT_LEAD";

      leads.push({
        slug,
        config: {
          ...config,
          meta: {
            ...config.meta,
            status: derivedStatus,
          },
        },
        preflight,
        hasAssets: {
          hasLogo,
          hasHero,
        },
        lastSend,
        sendCount: leadHistory.length,
        sentSteps: progress ? Array.from(progress.sentSteps).sort((a, b) => a - b) : [],
        visits: visitData,
        hasReplied,
        statusNotes: null,
      });
    } catch {
      // Ignora file malformati
    }
  }

  leads.sort((a, b) => {
    if (a.hasReplied && !b.hasReplied) return -1;
    if (!a.hasReplied && b.hasReplied) return 1;
    const aVisits = a.visits?.totalVisits || 0;
    const bVisits = b.visits?.totalVisits || 0;
    if (aVisits !== bVisits) return bVisits - aVisits;
    return (b.config.audit.originalLcpSeconds || 0) - (a.config.audit.originalLcpSeconds || 0);
  });

  return NextResponse.json({
    leads,
    allVisits,
    pipelineCounters: computePipelineCounters(derivedStatuses),
    currentUser: user,
  });
}
