import { cookies } from "next/headers";

export const COOKIE_NAME = "techpyre_admin_session";
const SESSION_SECRET_SALT = process.env.SESSION_SECRET || "techpyre_enterprise_salt_2026_auth";

export interface UserProfile {
  username: string;
  displayName: string;
  role: "admin" | "member" | "special";
  roleLabel: string;
  defaultEmail?: string;
  isSpecialFriend?: boolean;
}

export const USERS_REGISTRY: Record<
  string,
  {
    password: string;
    profile: UserProfile;
  }
> = {
  riccardogranza: {
    password: "5149",
    profile: {
      username: "riccardogranza",
      displayName: "Riccardo Granza",
      role: "admin",
      roleLabel: "Founder & Admin TechPyre",
      defaultEmail: "riccardo.granza@techpyre.eu",
      isSpecialFriend: false,
    },
  },
  mattiabarb: {
    password: "2111",
    profile: {
      username: "mattiabarb",
      displayName: "Mattia Barb",
      role: "member",
      roleLabel: "Full Member",
      defaultEmail: "mattia@techpyre.eu",
      isSpecialFriend: false,
    },
  },
  andreadibella: {
    password: "5445",
    profile: {
      username: "andreadibella",
      displayName: "Andrea Di Bella",
      role: "special",
      roleLabel: "Outbound Partner",
      defaultEmail: "",
      isSpecialFriend: true,
    },
  },
};

function computeUserHash(username: string, pass: string): string {
  const str = `${username}:::${pass}:::${SESSION_SECRET_SALT}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function generateTokenForUser(username: string): string | null {
  const user = USERS_REGISTRY[username.toLowerCase().trim()];
  if (!user) return null;
  const hash = computeUserHash(user.profile.username, user.password);
  return `tp_${user.profile.username}_${hash}`;
}

export function validateUserCredentials(
  username: string,
  password: string
): UserProfile | null {
  if (!username || !password) return null;
  const cleanUser = username.toLowerCase().trim();
  const cleanPass = password.trim();

  const user = USERS_REGISTRY[cleanUser];
  if (user && user.password === cleanPass) {
    return user.profile;
  }
  return null;
}

export async function getAdminSession(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionValue) return null;

  // Format: tp_${username}_${hash}
  if (sessionValue.startsWith("tp_")) {
    const parts = sessionValue.split("_");
    if (parts.length >= 3) {
      const username = parts[1];
      const tokenHash = parts.slice(2).join("_");
      const user = USERS_REGISTRY[username];
      if (user) {
        const expectedHash = computeUserHash(user.profile.username, user.password);
        if (tokenHash === expectedHash) {
          return user.profile;
        }
      }
    }
  }

  return null;
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
      maxAge: 60 * 60 * 24 * 30, // 30 giorni
    },
  };
}
