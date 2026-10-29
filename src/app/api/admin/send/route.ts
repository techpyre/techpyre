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
    const { slug, isFollowUp } = await request.json();
    if (!slug) {
      return NextResponse.json({ error: "Slug mancante" }, { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), "scripts", "send-outreach.mjs");
    const args = [scriptPath, slug, "--send"];
    if (isFollowUp) args.push("--followup");

    const { stdout, stderr } = await execFilePromise(process.execPath, args, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PATH: `/opt/homebrew/bin:/usr/local/bin:${process.env.PATH || ""}`,
      },
    });

    return NextResponse.json({
      success: true,
      stdout,
      stderr,
      message: `Email inviata con successo per [${slug}]`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore durante l'invio dell'email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
