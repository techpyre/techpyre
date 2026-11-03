import fs from "fs";
import path from "path";
import { LeadConfig } from "@/types/lead";

const LOCAL_LEADS_DIR = path.join(process.cwd(), "src", "data", "leads");
const TMP_LEADS_DIR = path.join("/tmp", "techpyre-leads");

export function saveLeadConfig(slug: string, config: LeadConfig): void {
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");
  const jsonStr = JSON.stringify(config, null, 2) + "\n";

  // 1. Salva sempre in /tmp (funziona sia in locale che su Vercel Serverless read-only)
  try {
    fs.mkdirSync(/*turbopackIgnore: true*/ TMP_LEADS_DIR, { recursive: true });
    fs.writeFileSync(
      /*turbopackIgnore: true*/ path.join(TMP_LEADS_DIR, `${safeSlug}.json`),
      jsonStr,
      "utf-8"
    );
  } catch {
    // ignora
  }

  // 2. Salva anche in src/data/leads se il filesystem è scrivibile (ambiente locale)
  try {
    fs.mkdirSync(/*turbopackIgnore: true*/ LOCAL_LEADS_DIR, { recursive: true });
    fs.writeFileSync(
      /*turbopackIgnore: true*/ path.join(LOCAL_LEADS_DIR, `${safeSlug}.json`),
      jsonStr,
      "utf-8"
    );
  } catch {
    // Su Vercel /var/task è read-only: il salvataggio in /tmp garantisce il funzionamento immediato
  }
}

export function loadLeadConfig(slug: string): LeadConfig | null {
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");

  // Controlla prima in /tmp (eventuali lead appena generati da remoto) e poi in src/data/leads
  const candidates = [
    path.join(TMP_LEADS_DIR, `${safeSlug}.json`),
    path.join(LOCAL_LEADS_DIR, `${safeSlug}.json`),
  ];

  for (const filePath of candidates) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
        return JSON.parse(
          fs.readFileSync(/*turbopackIgnore: true*/ filePath, "utf-8")
        ) as LeadConfig;
      }
    } catch {
      continue;
    }
  }

  return null;
}

export function listAllLeadConfigs(): Array<{ slug: string; config: LeadConfig }> {
  const map = new Map<string, LeadConfig>();

  // 1. Carica lead statici da src/data/leads
  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ LOCAL_LEADS_DIR)) {
      const files = fs
        .readdirSync(/*turbopackIgnore: true*/ LOCAL_LEADS_DIR)
        .filter(
          (f) =>
            f.endsWith(".json") &&
            f !== "outreach-history.json" &&
            f !== "leads-status.json"
        );
      for (const file of files) {
        const slug = file.replace(/\.json$/, "");
        try {
          const raw = fs.readFileSync(
            /*turbopackIgnore: true*/ path.join(LOCAL_LEADS_DIR, file),
            "utf-8"
          );
          map.set(slug, JSON.parse(raw) as LeadConfig);
        } catch {
          continue;
        }
      }
    }
  } catch {
    // ignora
  }

  // 2. Unisci eventuali lead generati a runtime in /tmp/techpyre-leads
  try {
    if (fs.existsSync(/*turbopackIgnore: true*/ TMP_LEADS_DIR)) {
      const tmpFiles = fs
        .readdirSync(/*turbopackIgnore: true*/ TMP_LEADS_DIR)
        .filter((f) => f.endsWith(".json"));
      for (const file of tmpFiles) {
        const slug = file.replace(/\.json$/, "");
        try {
          const raw = fs.readFileSync(
            /*turbopackIgnore: true*/ path.join(TMP_LEADS_DIR, file),
            "utf-8"
          );
          map.set(slug, JSON.parse(raw) as LeadConfig);
        } catch {
          continue;
        }
      }
    }
  } catch {
    // ignora
  }

  return Array.from(map.entries()).map(([slug, config]) => ({ slug, config }));
}
