import fs from "fs";
import path from "path";
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

export function getScenarioContent(scenarioId: string): string {
  const filePath = path.join(
    process.cwd(),
    "content",
    "scenarios",
    `scenario-${scenarioId}.md`
  );
  return fs.readFileSync(filePath, "utf-8");
}

export function getAllScenarioContents(): Record<string, string> {
  const scenarios: Record<string, string> = {};
  for (const id of SCENARIO_IDS) {
    const filePath = path.join(
      process.cwd(),
      "content",
      "scenarios",
      `scenario-${id}.md`
    );
    scenarios[id] = fs.readFileSync(filePath, "utf-8");
  }
  return scenarios;
}
