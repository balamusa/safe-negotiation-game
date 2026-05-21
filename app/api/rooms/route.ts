import { NextResponse } from "next/server";
import { getRooms } from "@/lib/rooms";
import { getAllData } from "@/lib/storage";

export async function GET() {
  const rooms = getRooms();
  const allData = await getAllData(rooms.map((r) => r.id));

  const result = rooms.map((room) => ({
    ...room,
    ...(allData[room.id] ?? {}),
  }));

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
