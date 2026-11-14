import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  generateTokenForUser,
  getAdminSession,
  getSessionCookieOptions,
  validateUserCredentials,
} from "@/lib/adminAuth";

export async function GET() {
  const user = await getAdminSession();
  return NextResponse.json({
    authenticated: Boolean(user),
    user: user || null,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Inserisci username e password." },
        { status: 400 }
      );
    }

    const userProfile = validateUserCredentials(username, password);

    if (!userProfile) {
      return NextResponse.json(
        { error: "Credenziali non valide. Verifica username e password." },
        { status: 401 }
      );
    }

    const token = generateTokenForUser(userProfile.username);
    if (!token) {
      return NextResponse.json(
        { error: "Errore durante la generazione del token." },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const cookieConfig = getSessionCookieOptions(token);
    cookieStore.set(cookieConfig.name, cookieConfig.value, cookieConfig.options);

    return NextResponse.json({
      success: true,
      message: `Benvenuto, ${userProfile.displayName}!`,
      user: userProfile,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore durante l'autenticazione";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true, message: "Disconnesso con successo." });
}
