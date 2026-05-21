import { NextResponse } from "next/server";
import { getRooms } from "@/lib/rooms";
import { resetData } from "@/lib/storage";

export async function POST() {
  const rooms = getRooms();
  await resetData(rooms.map((r) => r.id));
  return NextResponse.json({ ok: true });
}
