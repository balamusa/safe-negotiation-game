import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "@/lib/rooms";
import { getRoomData, updateRoomData } from "@/lib/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  const existing = await getRoomData(id);
  if (existing.discountRate == null) {
    return NextResponse.json(
      { error: "Negotiation terms must be submitted first." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { founderPct, safeHolderPct, newInvestorPct } = body as Record<
    string,
    unknown
  >;

  if (typeof founderPct !== "number" || founderPct < 0 || founderPct > 100) {
    return NextResponse.json(
      { error: "Founder percentage must be between 0 and 100." },
      { status: 400 }
    );
  }
  if (
    typeof safeHolderPct !== "number" ||
    safeHolderPct < 0 ||
    safeHolderPct > 100
  ) {
    return NextResponse.json(
      { error: "SAFE holder percentage must be between 0 and 100." },
      { status: 400 }
    );
  }
  if (
    typeof newInvestorPct !== "number" ||
    newInvestorPct < 0 ||
    newInvestorPct > 100
  ) {
    return NextResponse.json(
      { error: "New investor percentage must be between 0 and 100." },
      { status: 400 }
    );
  }

  await updateRoomData(id, { founderPct, safeHolderPct, newInvestorPct });
  return NextResponse.json({ ok: true });
}
