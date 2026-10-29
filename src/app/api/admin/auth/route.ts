import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkPassword, getSessionCookieConfig, verifyAdminSession } from "@/lib/adminAuth";

export async function GET() {
  const isAuth = await verifyAdminSession();
  return NextResponse.json({ authenticated: isAuth });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!checkPassword(password)) {
      return NextResponse.json(
        { error: "Password non corretta. Accesso negato." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    const cookieConfig = getSessionCookieConfig();
    cookieStore.set(cookieConfig.name, cookieConfig.value, cookieConfig.options);

    return NextResponse.json({ success: true, message: "Autenticato con successo." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore durante l'autenticazione";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("techpyre_admin_session");
  return NextResponse.json({ success: true, message: "Disconnesso." });
}
