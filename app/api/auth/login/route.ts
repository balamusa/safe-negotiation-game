import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { password } = body as Record<string, unknown>;
  const correct = process.env.PARTICIPANT_PASSWORD;

  if (!correct) {
    return NextResponse.json(
      { error: "PARTICIPANT_PASSWORD is not configured on this server." },
      { status: 500 }
    );
  }

  if (password !== correct) {
    return NextResponse.json({ error: "Incorrect access code." }, { status: 401 });
  }

  const hash = createHash("sha256").update(correct).digest("hex");

  const response = NextResponse.json({ ok: true });
  response.cookies.set("participant_auth", hash, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return response;
}
