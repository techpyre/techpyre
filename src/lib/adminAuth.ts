import { cookies } from "next/headers";

const COOKIE_NAME = "techpyre_admin_session";
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "TechPyre2026!Outbound";

// Hash semplice e sicuro per la sessione cookie basato sulla password
function getExpectedToken(): string {
  const secret = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  // Creiamo un hash deterministico basato su secret + salt fisso
  let hash = 0;
  const str = `techpyre_secret_${secret}_salt_2026`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `tp_${Math.abs(hash).toString(36)}`;
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  if (!session) return false;
  return session === getExpectedToken();
}

export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  return Boolean(password && password.trim() === expected.trim());
}

export function getSessionCookieConfig() {
  return {
    name: COOKIE_NAME,
    value: getExpectedToken(),
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 giorni
    },
  };
}
