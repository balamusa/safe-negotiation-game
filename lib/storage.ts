import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "submissions.json");

export type RoomSubmission = {
  discountRate?: number;
  valuationCap?: number;
  founderPct?: number;
  safeHolderPct?: number;
  newInvestorPct?: number;
};

type Submissions = Record<string, RoomSubmission>;

function readData(): Submissions {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeData(data: Submissions): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getRoomData(roomId: string): RoomSubmission {
  return readData()[roomId] ?? {};
}

export function updateRoomData(
  roomId: string,
  update: Partial<RoomSubmission>
): void {
  const data = readData();
  data[roomId] = { ...data[roomId], ...update };
  writeData(data);
}

export function getAllData(): Submissions {
  return readData();
}

export function resetData(): void {
  writeData({});
}
