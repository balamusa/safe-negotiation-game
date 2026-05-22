import { NextRequest, NextResponse } from "next/server";
import { getRooms } from "@/lib/rooms";
import { getAllRoomNames, setRoomName } from "@/lib/roomNames";

function isAuthorized(request: NextRequest): boolean {
  const password = request.headers.get("x-admin-password");
  const correct = process.env.ADMIN_PASSWORD;
  return !!correct && password === correct;
}

export async function GET() {
  const rooms = getRooms();
  const names = await getAllRoomNames(rooms);
  return NextResponse.json(
    rooms.map((r) => ({ id: r.id, name: names[r.id], scenarioId: r.scenarioId })),
    { headers: { "Cache-Control": "no-store" } }
  );
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

  const { id, name } = body as Record<string, unknown>;

  if (typeof id !== "string" || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Invalid id or name." }, { status: 400 });
  }

  const rooms = getRooms();
  if (!rooms.find((r) => r.id === id)) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  await setRoomName(id, name.trim());
  return NextResponse.json({ ok: true });
}
