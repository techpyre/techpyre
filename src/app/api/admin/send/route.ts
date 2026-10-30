import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { sendLeadOutreach } from "@/lib/emailService";

export async function POST(request: Request) {
  const user = await getAdminSession();
  if (!user) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  try {
    const { slug, isFollowUp } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: "Slug lead mancante" }, { status: 400 });
    }

    const result = await sendLeadOutreach({
      slug,
      isFollowUp: Boolean(isFollowUp),
      user,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore durante l'invio dell'email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
