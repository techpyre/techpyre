import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE_NAME = "techpyre_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export interface UserProfile {
  username: string;
  displayName: string;
  role: "admin" | "member" | "special";
  roleLabel: string;
  defaultEmail?: string;
  isSpecialFriend?: boolean;
}

export interface StoredAdminUser {
  passwordHash: string;
  profile: UserProfile;
}

const EPHEMERAL_DEV_SECRET_KEY = "__techpyreEphemeralSessionSecret";

export function getSessionSecret(): string {
  const configured = process.env.ADMIN_SESSION_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET is required in production.");
  }
  const g = globalThis as Record<string, unknown>;
  if (typeof g[EPHEMERAL_DEV_SECRET_KEY] !== "string") {
    g[EPHEMERAL_DEV_SECRET_KEY] = crypto.randomBytes(32).toString("hex");
  }
  return g[EPHEMERAL_DEV_SECRET_KEY] as string;
}

export function hashPassword(password: string, saltHex = crypto.randomBytes(16).toString("hex")): string {
  const derived = crypto.scryptSync(password, saltHex, 64).toString("hex");
  return `scrypt$${saltHex}$${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, expectedHex] = parts;
  if (!saltHex || !expectedHex) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const actual = crypto.scryptSync(password, saltHex, expected.length);
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}

export function loadUsersRegistry(): Record<string, StoredAdminUser> {
  const raw = process.env.ADMIN_USERS_JSON?.trim();
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }

  const list = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" && parsed !== null
    ? Object.values(parsed)
    : [];

  const registry: Record<string, StoredAdminUser> = {};
  for (const entry of list) {
    if (typeof entry !== "object" || entry === null) continue;
    const item = entry as Record<string, unknown>;
    const username = typeof item.username === "string" ? item.username.toLowerCase().trim() : "";
    const passwordHash = typeof item.passwordHash === "string" ? item.passwordHash.trim() : "";
    if (!username || !passwordHash.startsWith("scrypt$")) continue;

    const roleRaw = item.role;
    const role: UserProfile["role"] =
      roleRaw === "admin" || roleRaw === "member" || roleRaw === "special" ? roleRaw : "member";

    registry[username] = {
      passwordHash,
      profile: {
        username,
        displayName: typeof item.displayName === "string" ? item.displayName : username,
        role,
        roleLabel: typeof item.roleLabel === "string" ? item.roleLabel : "Operator",
        defaultEmail: typeof item.defaultEmail === "string" ? item.defaultEmail : "",
        isSpecialFriend: Boolean(item.isSpecialFriend ?? role === "special"),
      },
    };
  }
  return registry;
}

function signPayloadB64(payloadB64: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

export function createSessionToken(username: string, nowSeconds = Math.floor(Date.now() / 1000)): string | null {
  const registry = loadUsersRegistry();
  const user = registry[username.toLowerCase().trim()];
  if (!user) return null;

  const payload = JSON.stringify({
    u: user.profile.username,
    exp: nowSeconds + SESSION_TTL_SECONDS,
  });
  const payloadB64 = Buffer.from(payload, "utf8").toString("base64url");
  const sigB64 = signPayloadB64(payloadB64, getSessionSecret());
  return `${payloadB64}.${sigB64}`;
}

export function verifySessionToken(
  token: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): UserProfile | null {
  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0 || dotIdx === token.length - 1) return null;

  const payloadB64 = token.slice(0, dotIdx);
  const sigB64 = token.slice(dotIdx + 1);
  if (!payloadB64 || !sigB64) return null;

  let expectedSig: string;
  try {
    expectedSig = signPayloadB64(payloadB64, getSessionSecret());
  } catch {
    return null;
  }

  const providedBuf = Buffer.from(sigB64, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return null;
  }

  let parsed: { u?: unknown; exp?: unknown };
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      u?: unknown;
      exp?: unknown;
    };
  } catch {
    return null;
  }

  if (typeof parsed.u !== "string" || typeof parsed.exp !== "number" || !Number.isFinite(parsed.exp)) {
    return null;
  }
  if (parsed.exp <= nowSeconds) {
    return null;
  }

  const registry = loadUsersRegistry();
  return registry[parsed.u.toLowerCase().trim()]?.profile ?? null;
}

export function generateTokenForUser(username: string): string | null {
  return createSessionToken(username);
}

export function validateUserCredentials(username: string, password: string): UserProfile | null {
  if (!username || !password) return null;
  const cleanUser = username.toLowerCase().trim();
  const cleanPass = password.trim();
  const registry = loadUsersRegistry();
  const user = registry[cleanUser];
  if (!user) return null;
  return verifyPassword(cleanPass, user.passwordHash) ? user.profile : null;
}

export async function getAdminSession(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionValue) return null;
  return verifySessionToken(sessionValue);
}

export async function verifyAdminSession(): Promise<boolean> {
  const session = await getAdminSession();
  return Boolean(session);
}

export function getSessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    },
  };
}
