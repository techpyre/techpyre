import { NextRequest, NextResponse } from "next/server";
import { recordDemoVisit, getAllVisits } from "@/lib/visitsStorage";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, companyName, referrer, screenWidth, screenHeight, isFirstVisit } = body;

    if (!slug) {
      return NextResponse.json({ error: "Slug obbligatorio" }, { status: 400 });
    }

    // Estrai User-Agent e IP reale dal request
    const userAgent = req.headers.get("user-agent") || "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const { visitRecord, newVisit } = recordDemoVisit({
      slug,
      companyName,
      referrer,
      screenWidth,
      screenHeight,
      userAgent,
      ip,
      isFirstVisit: Boolean(isFirstVisit),
    });

    return NextResponse.json({
      success: true,
      slug,
      totalVisits: visitRecord.totalVisits,
      visitId: newVisit.id,
      timestamp: newVisit.timestamp,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore tracking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const visits = getAllVisits();
    return NextResponse.json({
      success: true,
      visits,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore lettura visite";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
