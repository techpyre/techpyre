import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "techpyre_admin_session";

function base64UrlToUint8Array(input: string): Uint8Array | null {
  try {
    const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    return null;
  }
}

async function hasValidAdminCookie(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0 || dotIdx === token.length - 1) return false;

  const payloadB64 = token.slice(0, dotIdx);
  const sigB64 = token.slice(dotIdx + 1);
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  // When running local dev without ADMIN_SESSION_SECRET, defer cryptographic check to Node route handlers
  if (!secret || secret.length < 16) {
    return process.env.NODE_ENV !== "production";
  }

  const sigBytes = base64UrlToUint8Array(sigB64);
  const payloadBytes = base64UrlToUint8Array(payloadB64);
  if (!sigBytes || !payloadBytes) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const validSig = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes.buffer as ArrayBuffer,
    encoder.encode(payloadB64)
  );
  if (!validSig) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      u?: unknown;
      exp?: unknown;
    };
    return (
      typeof payload.u === "string" &&
      typeof payload.exp === "number" &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get("host") || "";

  if (host.startsWith("outbound.")) {
    if (url.pathname === "/") {
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
    if (!url.pathname.startsWith("/admin") && !url.pathname.startsWith("/api")) {
      url.pathname = `/admin${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  const isProtectedAdminApi =
    url.pathname.startsWith("/api/admin/") && !url.pathname.startsWith("/api/admin/auth");
  const isProtectedTrackRead = url.pathname === "/api/track" && request.method === "GET";

  if (isProtectedAdminApi || isProtectedTrackRead) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!(await hasValidAdminCookie(token))) {
      return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
