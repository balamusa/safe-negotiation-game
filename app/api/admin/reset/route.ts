import { NextResponse } from "next/server";
import { resetData } from "@/lib/storage";

export async function POST() {
  resetData();
  return NextResponse.json({ ok: true });
}
