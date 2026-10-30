import fs from "fs";
import path from "path";

export interface UserSmtpConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  senderName: string;
  senderEmail: string;
  updatedAt?: string;
}

function getFilePath(username: string): { primary: string; fallback: string } {
  const safeUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const primary = path.join(process.cwd(), "src", "data", "user-profiles", `${safeUsername}.json`);
  const fallback = path.join("/tmp", `techpyre_smtp_${safeUsername}.json`);
  return { primary, fallback };
}

export function getUserSmtp(username: string): UserSmtpConfig | null {
  const { primary, fallback } = getFilePath(username);

  // Prova primary
  if (fs.existsSync(/*turbopackIgnore: true*/ primary)) {
    try {
      return JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ primary, "utf-8"));
    } catch {
      // continua con fallback
    }
  }

  // Prova fallback
  if (fs.existsSync(/*turbopackIgnore: true*/ fallback)) {
    try {
      return JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ fallback, "utf-8"));
    } catch {
      return null;
    }
  }

  return null;
}

export function saveUserSmtp(username: string, config: UserSmtpConfig): boolean {
  const { primary, fallback } = getFilePath(username);
  const data = {
    ...config,
    updatedAt: new Date().toISOString(),
  };
  const jsonStr = JSON.stringify(data, null, 2);

  let saved = false;

  // Prova primary
  try {
    const dir = path.dirname(primary);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(primary, jsonStr, "utf-8");
    saved = true;
  } catch {
    // filesystem read-only (es. Vercel runtime)
  }

  // Scrivi sempre anche in fallback per persistenza runtime serverless
  try {
    fs.writeFileSync(fallback, jsonStr, "utf-8");
    saved = true;
  } catch {
    // ignora errore se tmp fallisce
  }

  return saved;
}
