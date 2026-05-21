import { NextRequest, NextResponse } from "next/server";
import {
  getAllContent,
  setContent,
  CONTENT_KEYS,
  type ContentKey,
} from "@/lib/content";

function isAuthorized(request: NextRequest): boolean {
  const password = request.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD;
  return !!correct && password === correct;
}

export async function GET() {
  const content = await getAllContent();
  return NextResponse.json(content);
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { key, value } = body as Record<string, unknown>;

  if (typeof key !== "string" || !CONTENT_KEYS.includes(key as ContentKey)) {
    return NextResponse.json({ error: "Invalid content key." }, { status: 400 });
  }

  if (typeof value !== "string") {
    return NextResponse.json(
      { error: "Value must be a string." },
      { status: 400 }
    );
  }

  await setContent(key as ContentKey, value);
  return NextResponse.json({ ok: true });
}
