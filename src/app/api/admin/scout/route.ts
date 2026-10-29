import { NextResponse } from "next/server";
import { execFile } from "child_process";
import util from "util";
import path from "path";
import { verifyAdminSession } from "@/lib/adminAuth";

const execFilePromise = util.promisify(execFile);

export async function POST(request: Request) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
  }

  try {
    const { keyword, maxLeads } = await request.json();
    if (!keyword) {
      return NextResponse.json(
        { error: "Specifica una parola chiave o nicchia da cercare su Meta Ad Library" },
        { status: 400 }
      );
    }

    const scriptPath = path.join(process.cwd(), "scripts", "scout-ad-library.mjs");
    const count = Math.min(Math.max(Number(maxLeads || 5), 1), 10);

    const { stdout, stderr } = await execFilePromise(
      process.execPath,
      [scriptPath, keyword, String(count)],
      {
        cwd: process.cwd(),
        timeout: 180000, // 3 minuti di timeout massimo
        env: {
          ...process.env,
          PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ""}`,
        },
      }
    );

    return NextResponse.json({
      success: true,
      stdout,
      stderr,
      message: `Scouting completato per la nicchia: "${keyword}"`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore durante lo scouting";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
