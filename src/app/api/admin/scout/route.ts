import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { scoutBusinessesViaHttp } from "@/lib/scoutService";

export async function POST(request: Request) {
  const user = await getAdminSession();
  if (!user) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  try {
    const { keyword, maxLeads } = await request.json();
    if (!keyword || !keyword.trim()) {
      return NextResponse.json(
        { error: "Specifica una parola chiave o nicchia da cercare (es. 'infissi torino' o 'dentista verona')." },
        { status: 400 }
      );
    }

    const count = Math.min(Math.max(Number(maxLeads || 5), 1), 10);
    const result = await scoutBusinessesViaHttp({
      keyword: keyword.trim(),
      maxLeads: count,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore durante lo scouting";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
