/**
 * Content storage abstraction for editable page content.
 *
 * Keys: mentor | startup | scenario-A | scenario-B | scenario-C | scenario-D
 *
 * Dev  (no Redis env vars): reads .md files as defaults; runtime edits saved
 *      to data/content.json as overrides.
 * Prod (Redis env vars set): reads from Redis; falls back to bundled .md files
 *      if a key hasn't been set yet.
 */

import fs from "fs";
import path from "path";

export const CONTENT_KEYS = [
  "mentor",
  "startup",
  "scenario-A",
  "scenario-B",
  "scenario-C",
  "scenario-D",
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

const DEFAULT_PATHS: Partial<Record<ContentKey, string>> = {
  mentor: "content/mentor.md",
  startup: "content/startup.md",
};

function readDefault(key: ContentKey): string {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), DEFAULT_PATHS[key]),
      "utf-8"
    );
  } catch {
    return `# ${key}\n\nContent not yet available.`;
  }
}

// ── Dev file storage ─────────────────────────────────────────────────────────

const CONTENT_FILE = path.join(process.cwd(), "data", "content.json");

function devRead(): Record<string, string> {
  try {
    if (!fs.existsSync(CONTENT_FILE)) return {};
    return JSON.parse(fs.readFileSync(CONTENT_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function devWrite(data: Record<string, string>): void {
  const dir = path.dirname(CONTENT_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2));
}

// ── Redis storage ────────────────────────────────────────────────────────────

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

const REDIS_KEY = (key: ContentKey) => `content:${key}`;

// ── Public API ───────────────────────────────────────────────────────────────

export async function getContent(key: ContentKey): Promise<string> {
  if (useRedis) {
    const redis = getRedis();
    const val = await redis.get(REDIS_KEY(key));
    if (val != null) return val as string;
    return readDefault(key);
  }
  const overrides = devRead();
  return overrides[key] ?? readDefault(key);
}

export async function setContent(
  key: ContentKey,
  value: string
): Promise<void> {
  if (useRedis) {
    const redis = getRedis();
    await redis.set(REDIS_KEY(key), value);
    return;
  }
  const overrides = devRead();
  overrides[key] = value;
  devWrite(overrides);
}

export async function getAllContent(): Promise<Record<ContentKey, string>> {
  const entries = await Promise.all(
    CONTENT_KEYS.map(async (key) => [key, await getContent(key)] as const)
  );
  return Object.fromEntries(entries) as Record<ContentKey, string>;
}
