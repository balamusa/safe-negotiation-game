/**
 * Storage abstraction:
 *  - Development (no UPSTASH_REDIS_REST_URL): reads/writes data/submissions.json
 *  - Production (Upstash Redis env vars set):  reads/writes via Redis REST API
 */

import fs from "fs";
import path from "path";

export type RoomSubmission = {
  discountRate?: number;
  valuationCap?: number;
  founderPct?: number;
  safeHolderPct?: number;
  newInvestorPct?: number;
};

type Submissions = Record<string, RoomSubmission>;

// ── Helpers ─────────────────────────────────────────────────────────────────

const useRedis = !!(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

function getRedis() {
  // Lazy import so the package isn't touched in dev
  const { Redis } = require("@upstash/redis");
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

// ── File storage (dev) ───────────────────────────────────────────────────────

const DATA_FILE = path.join(process.cwd(), "data", "submissions.json");

function fileRead(): Submissions {
  try {
    if (!fs.existsSync(DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function fileWrite(data: Submissions): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ── Redis storage (production) ───────────────────────────────────────────────

const KEY = (id: string) => `room:${id}`;

async function redisGet(roomId: string): Promise<RoomSubmission> {
  const redis = getRedis();
  const data = await redis.hgetall(KEY(roomId));
  if (!data) return {};
  // Redis returns strings; coerce numeric fields back to numbers
  const result: RoomSubmission = {};
  for (const [k, v] of Object.entries(data)) {
    (result as Record<string, unknown>)[k] = Number(v);
  }
  return result;
}

async function redisUpdate(
  roomId: string,
  update: Partial<RoomSubmission>
): Promise<void> {
  const redis = getRedis();
  await redis.hset(KEY(roomId), update);
}

async function redisGetAll(roomIds: string[]): Promise<Submissions> {
  const entries = await Promise.all(
    roomIds.map(async (id) => [id, await redisGet(id)] as const)
  );
  return Object.fromEntries(entries);
}

async function redisReset(roomIds: string[]): Promise<void> {
  const redis = getRedis();
  if (roomIds.length === 0) return;
  await redis.del(...roomIds.map(KEY));
}

// ── Public API (always async) ────────────────────────────────────────────────

export async function getRoomData(roomId: string): Promise<RoomSubmission> {
  if (useRedis) return redisGet(roomId);
  return fileRead()[roomId] ?? {};
}

export async function updateRoomData(
  roomId: string,
  update: Partial<RoomSubmission>
): Promise<void> {
  if (useRedis) {
    await redisUpdate(roomId, update);
    return;
  }
  const data = fileRead();
  data[roomId] = { ...data[roomId], ...update };
  fileWrite(data);
}

export async function getAllData(roomIds: string[]): Promise<Submissions> {
  if (useRedis) return redisGetAll(roomIds);
  const all = fileRead();
  // Ensure every room has an entry (even if empty)
  return Object.fromEntries(roomIds.map((id) => [id, all[id] ?? {}]));
}

export async function resetData(roomIds: string[]): Promise<void> {
  if (useRedis) {
    await redisReset(roomIds);
    return;
  }
  fileWrite({});
}
