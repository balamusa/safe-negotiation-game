/**
 * Storage abstraction for editable room names.
 *
 * Dev  (no Redis env vars): overrides saved to data/room-names.json
 * Prod (Redis env vars set): overrides stored in Redis; falls back to the
 *      default name from rooms.json if no override has been saved.
 */

import fs from "fs";
import path from "path";

const useRedis = !!(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

function getRedis() {
  const { Redis } = require("@upstash/redis");
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

const REDIS_KEY = (id: string) => `room-name:${id}`;
const DEV_FILE = path.join(process.cwd(), "data", "room-names.json");

function devRead(): Record<string, string> {
  try {
    if (!fs.existsSync(DEV_FILE)) return {};
    return JSON.parse(fs.readFileSync(DEV_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function devWrite(data: Record<string, string>): void {
  const dir = path.dirname(DEV_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DEV_FILE, JSON.stringify(data, null, 2));
}

export async function getRoomName(
  id: string,
  defaultName: string
): Promise<string> {
  if (useRedis) {
    const redis = getRedis();
    const val = await redis.get(REDIS_KEY(id));
    return val ? String(val) : defaultName;
  }
  return devRead()[id] ?? defaultName;
}

export async function setRoomName(id: string, name: string): Promise<void> {
  if (useRedis) {
    const redis = getRedis();
    await redis.set(REDIS_KEY(id), name);
    return;
  }
  const data = devRead();
  data[id] = name;
  devWrite(data);
}

export async function getAllRoomNames(
  rooms: { id: string; name: string }[]
): Promise<Record<string, string>> {
  if (useRedis) {
    const redis = getRedis();
    const entries = await Promise.all(
      rooms.map(async ({ id, name }) => {
        const val = await redis.get(REDIS_KEY(id));
        return [id, val ? String(val) : name] as const;
      })
    );
    return Object.fromEntries(entries);
  }
  const overrides = devRead();
  return Object.fromEntries(
    rooms.map(({ id, name }) => [id, overrides[id] ?? name])
  );
}
