import roomsConfig from "@/config/rooms.json";

export type Room = {
  id: string;
  name: string;
  scenarioId: string;
};

export const SCENARIO_IDS = ["A", "B", "C", "D"] as const;
export type ScenarioId = (typeof SCENARIO_IDS)[number];

export function getRooms(): Room[] {
  return roomsConfig as Room[];
}

export function getRoom(id: string): Room | undefined {
  return (roomsConfig as Room[]).find((r) => r.id === id);
}

