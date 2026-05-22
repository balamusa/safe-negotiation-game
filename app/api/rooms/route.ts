import { NextResponse } from "next/server";
import { getRooms } from "@/lib/rooms";
import { getAllData } from "@/lib/storage";
import { getAllRoomNames } from "@/lib/roomNames";

export async function GET() {
  const rooms = getRooms();
  const [allData, names] = await Promise.all([
    getAllData(rooms.map((r) => r.id)),
    getAllRoomNames(rooms),
  ]);

  const result = rooms.map((room) => ({
    ...room,
    name: names[room.id],
    ...(allData[room.id] ?? {}),
  }));

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
