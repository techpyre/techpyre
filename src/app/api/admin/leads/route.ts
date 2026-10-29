import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyAdminSession } from "@/lib/adminAuth";
import { LeadConfig } from "@/types/lead";

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  const leadsDir = path.join(process.cwd(), "src", "data", "leads");
  if (!fs.existsSync(leadsDir)) {
    return NextResponse.json({ leads: [] });
  }

  const files = fs.readdirSync(leadsDir).filter((f) => f.endsWith(".json"));
  const leads = [];

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
        } catch {
          preflight = null;
        }
      }

      let outreachPack = null;
      const outreachPackPath = path.join(leadPublicDir, "outreach-pack.txt");
      if (fs.existsSync(outreachPackPath)) {
        try {
          outreachPack = fs.readFileSync(outreachPackPath, "utf-8");
        } catch {
          outreachPack = null;
        }
      }

      const hasOldMobile = fs.existsSync(path.join(leadPublicDir, "old-site-mobile.png"));
      const hasNewMobile = fs.existsSync(path.join(leadPublicDir, "new-demo-mobile.png"));
      const hasLogo = fs.existsSync(path.join(leadPublicDir, "logo.png"));
      const hasHero = fs.existsSync(path.join(leadPublicDir, "hero.jpg"));

      leads.push({
        slug,
        config,
        preflight,
        hasAssets: {
          hasOldMobile,
          hasNewMobile,
          hasLogo,
          hasHero,
        },
        outreachPackPreview: outreachPack ? outreachPack.slice(0, 1500) : null,
        fullOutreachPack: outreachPack,
      });
    } catch {
      // Ignora file malformati
    }
  }

  // Ordina mettendo per primi i lead con LCP originale piu alto (maggior urgenza)
  leads.sort((a, b) => (b.config.audit.originalLcpSeconds || 0) - (a.config.audit.originalLcpSeconds || 0));

  return NextResponse.json({
    leads,
    smtpConfigured: Boolean(process.env.SMTP_HOST || process.env.OUTBOUND_SMTP_HOST),
    smtpUser: process.env.SMTP_USER || process.env.OUTBOUND_SMTP_USER || "Non configurato",
  });
}
