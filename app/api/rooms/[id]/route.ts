import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "@/lib/rooms";
import { getRoomData } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const data = await getRoomData(id);
  return NextResponse.json(
    { ...room, ...data },
    { headers: { "Cache-Control": "no-store" } }
  );
}
