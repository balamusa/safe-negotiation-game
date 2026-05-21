import { NextRequest, NextResponse } from "next/server";
import { getRoom } from "@/lib/rooms";
import { updateRoomData } from "@/lib/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) {
    return NextResponse.json({ error: "Room not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const { discountRate, valuationCap } = body as Record<string, unknown>;

  if (
    typeof discountRate !== "number" ||
    discountRate <= 0 ||
    discountRate > 100
  ) {
    return NextResponse.json(
      { error: "Discount rate must be a number between 0 and 100." },
      { status: 400 }
    );
  }

  if (typeof valuationCap !== "number" || valuationCap <= 0) {
    return NextResponse.json(
      { error: "Valuation cap must be a positive number." },
      { status: 400 }
    );
  }

  await updateRoomData(id, { discountRate, valuationCap });
  return NextResponse.json({ ok: true });
}
