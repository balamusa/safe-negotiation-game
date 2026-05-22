import Link from "next/link";
import { getRooms } from "@/lib/rooms";
import { getAllRoomNames } from "@/lib/roomNames";
import { PageShell } from "@/components/PageShell";

export default async function HomePage() {
  const rooms = getRooms();
  const names = await getAllRoomNames(rooms);

  return (
    <PageShell step={0} title="Select Your Breakout Room">
      <p className="text-gray-500 mb-6">
        Find your room below and click to begin the activity. Choose the room
        that includes your name.
      </p>
      <ul className="space-y-3">
        {rooms.map((room) => (
          <li key={room.id}>
            <Link
              href={`/room/${room.id}`}
              className="block w-full text-left px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors text-gray-700 font-medium leading-snug"
            >
              {names[room.id]}
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
