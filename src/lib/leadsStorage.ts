import fs from "fs";
import path from "path";
import type { LeadConfig } from "@/types/lead";
import { migrateOldLeadConfig } from "./scoutService";

const LOCAL_LEADS_DIR = path.join(process.cwd(), "src", "data", "leads");
const TMP_LEADS_DIR = path.join("/tmp", "techpyre-leads");

function sanitizeSlug(slug: string): string {
  return slug.replace(/[^a-zA-Z0-9-_]/g, "");
}

function readLeadIfValid(filePath: string, withMigrationWrite: boolean): { config: LeadConfig; mtimeMs: number } | null {
  try {
    if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) return null;
    const stat = fs.statSync(/*turbopackIgnore: true*/ filePath);
    const rawLead = JSON.parse(
      fs.readFileSync(/*turbopackIgnore: true*/ filePath, "utf-8")
    ) as LeadConfig;
    return {
      config: migrateOldLeadConfig(rawLead, withMigrationWrite),
      mtimeMs: stat.mtimeMs,
    };
  } catch {
    return null;
  }
}

export function saveLeadConfig(slug: string, config: LeadConfig): void {
  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) return;
  const jsonStr = JSON.stringify(config, null, 2) + "\n";

  try {
    fs.mkdirSync(/*turbopackIgnore: true*/ TMP_LEADS_DIR, { recursive: true });
    fs.writeFileSync(
      /*turbopackIgnore: true*/ path.join(TMP_LEADS_DIR, `${safeSlug}.json`),
      jsonStr,
      "utf-8"
    );
  } catch {
    // Ignore /tmp failure when local directory is writable
  }

  try {
    fs.mkdirSync(/*turbopackIgnore: true*/ LOCAL_LEADS_DIR, { recursive: true });
    fs.writeFileSync(
      /*turbopackIgnore: true*/ path.join(LOCAL_LEADS_DIR, `${safeSlug}.json`),
      jsonStr,
      "utf-8"
    );
  } catch {
    // Read-only deployments use /tmp
  }
}

export function loadLeadConfig(slug: string): LeadConfig | null {
  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) return null;

  const candidates = [
    readLeadIfValid(path.join(TMP_LEADS_DIR, `${safeSlug}.json`), true),
    readLeadIfValid(path.join(LOCAL_LEADS_DIR, `${safeSlug}.json`), true),
  ].filter((entry): entry is { config: LeadConfig; mtimeMs: number } => entry !== null);

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0].config;
}

export function listAllLeadConfigs(): Array<{ slug: string; config: LeadConfig }> {
  const bySlug = new Map<string, { config: LeadConfig; mtimeMs: number }>();

  const loadFromDir = (dir: string) => {
    try {
      if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) return;
      const files = fs
        .readdirSync(/*turbopackIgnore: true*/ dir)
        .filter((f) => f.endsWith(".json") && f !== "outreach-history.json");

      for (const file of files) {
        const slug = file.replace(/\.json$/, "");
        const parsed = readLeadIfValid(/*turbopackIgnore: true*/ path.join(dir, file), false);
        if (!parsed) continue;
        const existing = bySlug.get(slug);
        if (!existing || parsed.mtimeMs > existing.mtimeMs) {
          bySlug.set(slug, parsed);
        }
      }
    } catch {
      // Ignore unreadable directory
    }
  };

  loadFromDir(LOCAL_LEADS_DIR);
  loadFromDir(TMP_LEADS_DIR);

  return Array.from(bySlug.entries()).map(([slug, entry]) => ({ slug, config: entry.config }));
}
