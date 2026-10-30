import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getAdminSession } from "@/lib/adminAuth";
import { LeadConfig } from "@/types/lead";
import { getAllVisits } from "@/lib/visitsStorage";
import { getOutreachHistory } from "@/lib/emailService";

export async function GET() {
  const user = await getAdminSession();
  if (!user) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  const leadsDir = path.join(process.cwd(), "src", "data", "leads");
  if (!fs.existsSync(leadsDir)) {
    return NextResponse.json({ leads: [], allVisits: {} });
  }

  const files = fs
    .readdirSync(leadsDir)
    .filter((f) => f.endsWith(".json") && f !== "outreach-history.json" && f !== "leads-status.json");

  const leads = [];
  const globalHistory = getOutreachHistory();
  const allVisits = getAllVisits();

  // Carica custom status (es. lead che hanno risposto)
  let customStatuses: Record<string, { status: string; notes?: string }> = {};
  const statusPath = path.join(process.cwd(), "src", "data", "leads-status.json");
  if (fs.existsSync(statusPath)) {
    try {
      customStatuses = JSON.parse(fs.readFileSync(statusPath, "utf-8"));
    } catch {}
  }

  for (const file of files) {
    const slug = file.replace(/\.json$/, "");
    const filePath = path.join(leadsDir, file);
    try {
      const config = JSON.parse(fs.readFileSync(filePath, "utf-8")) as LeadConfig;
      const leadPublicDir = path.join(process.cwd(), "public", "leads", slug);

      let preflight = null;
      const preflightPath = path.join(leadPublicDir, "preflight.json");
      if (fs.existsSync(preflightPath)) {
        try {
          preflight = JSON.parse(fs.readFileSync(preflightPath, "utf-8"));
        } catch {}
      }

      const hasLogo = fs.existsSync(path.join(leadPublicDir, "logo.png"));
      const hasHero = fs.existsSync(path.join(leadPublicDir, "hero.jpg"));

      const leadHistory = globalHistory.filter((h) => h.slug === slug);
      const lastSend = leadHistory.length ? leadHistory[leadHistory.length - 1] : null;
      const visitData = allVisits[slug] || null;

      const customStatus = customStatuses[slug];
      const hasReplied = Boolean(customStatus?.status === "REPLIED");

      leads.push({
        slug,
        config,
        preflight,
        hasAssets: {
          hasLogo,
          hasHero,
        },
        lastSend,
        sendCount: leadHistory.length,
        visits: visitData,
        hasReplied,
        statusNotes: customStatus?.notes || null,
      });
    } catch {
      // Ignora file malformati
    }
  }

  // Ordina per priorità:
  // 1. Chi ha risposto
  // 2. Chi ha visitato la demo
  // 3. Chi ha LCP più lento (maggior margine di miglioramento)
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
    currentUser: user,
  });
}
