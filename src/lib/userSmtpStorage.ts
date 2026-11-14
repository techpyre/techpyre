import crypto from "crypto";
import fs from "fs";
import path from "path";
import { getSessionSecret } from "./adminAuth";

export interface UserSmtpConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  senderName: string;
  senderEmail: string;
  updatedAt?: string;
}

const ENC_PREFIX = "enc:v1:";

function getEncryptionKey(): Buffer {
  const hex = process.env.SMTP_STORAGE_KEY?.trim();
  if (hex && /^[0-9a-fA-F]{64}$/.test(hex)) {
    return Buffer.from(hex, "hex");
  }
  return crypto.createHash("sha256").update(`smtp-storage:${getSessionSecret()}`).digest();
}

function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${ENC_PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${ciphertext.toString("hex")}`;
}

function decryptSecret(value: string): string | null {
  if (!value.startsWith(ENC_PREFIX)) return null;
  const parts = value.slice(ENC_PREFIX.length).split(":");
  if (parts.length !== 3) return null;
  const [ivHex, tagHex, cipherHex] = parts;
  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    const plain = Buffer.concat([
      decipher.update(Buffer.from(cipherHex, "hex")),
      decipher.final(),
    ]);
    return plain.toString("utf8");
  } catch {
    return null;
  }
}

function getFilePath(username: string): { primary: string; fallback: string } {
  const safeUsername = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const primary = path.join(process.cwd(), "src", "data", "user-profiles", `${safeUsername}.json`);
  const fallback = path.join("/tmp", `techpyre_smtp_${safeUsername}.json`);
  return { primary, fallback };
}

function readCandidate(filePath: string): { config: UserSmtpConfig; mtimeMs: number } | null {
  if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) return null;
  try {
    const stat = fs.statSync(/*turbopackIgnore: true*/ filePath);
    const parsed = JSON.parse(
      fs.readFileSync(/*turbopackIgnore: true*/ filePath, "utf-8")
    ) as UserSmtpConfig;
    const decryptedPass = decryptSecret(parsed.smtpPass);
    if (!decryptedPass) return null;
    return {
      config: { ...parsed, smtpPass: decryptedPass },
      mtimeMs: stat.mtimeMs,
    };
  } catch {
    return null;
  }
}

export function getUserSmtp(username: string): UserSmtpConfig | null {
  const { primary, fallback } = getFilePath(username);
  const candidates = [readCandidate(fallback), readCandidate(primary)].filter(
    (entry): entry is { config: UserSmtpConfig; mtimeMs: number } => entry !== null
  );
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0].config;
}

export function saveUserSmtp(username: string, config: UserSmtpConfig): boolean {
  const { primary, fallback } = getFilePath(username);
  const encryptedPass = config.smtpPass.startsWith(ENC_PREFIX)
    ? config.smtpPass
    : encryptSecret(config.smtpPass);
  const data: UserSmtpConfig = {
    ...config,
    smtpPass: encryptedPass,
    updatedAt: new Date().toISOString(),
  };
  const jsonStr = JSON.stringify(data, null, 2);

  let saved = false;
  try {
    const dir = path.dirname(primary);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(primary, jsonStr, "utf-8");
    saved = true;
  } catch {
    // Serverless read-only deployments fall back to /tmp
  }

  try {
    fs.writeFileSync(fallback, jsonStr, "utf-8");
    saved = true;
  } catch {
    // Ignore /tmp write failures if primary succeeded
  }

  return saved;
}
