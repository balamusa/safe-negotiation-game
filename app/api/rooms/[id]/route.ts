import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "@/lib/rooms";
import { getRoomData } from "@/lib/storage";
import { getRoomName } from "@/lib/roomNames";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const [data, name] = await Promise.all([
    getRoomData(id),
    getRoomName(id, room.name),
  ]);

  return NextResponse.json(
    { ...room, name, ...data },
    { headers: { "Cache-Control": "no-store" } }
  );
}
