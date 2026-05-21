@AGENTS.md

# MedNova SAFE Negotiation Game — Project Context

## What this project is
A web app supporting a live SAFE negotiation activity for startup cohorts running over Zoom breakout rooms. Seven groups each negotiate SAFE terms (discount rate, valuation cap, investment amount), receive a pre-assigned scenario outcome, calculate equity ownership via an external calculator, and compare results across all groups.

**Live site:** https://safe.patrickbeattie.com  
**GitHub:** https://github.com/balamusa/safe-negotiation-game  
**Vercel auto-deploys** on every push to `master`.

---

## Git workflow
- Always work on a **feature branch** (`feature/`, `chore/`, `fix/`), never commit directly to `master`
- Do **not push** until the user explicitly says to
- When pushing: merge all pending feature branches into `master`, then `git push`
- Fast-forward merges are the norm (linear history)

---

## Local development environment (Windows)

Node.js is **not in the system PATH** in PowerShell. Two workarounds exist:

1. Use the `.claude/launch.json` preview server — it uses `start-dev.cmd` which sets the PATH correctly
2. Reference Node binaries by full path: `C:\Program Files\nodejs\npm.cmd`

PowerShell `.ps1` scripts may be blocked by execution policy — use `.cmd` file equivalents.

The dev server runs on **http://localhost:3000**.

---

## Storage architecture

Two separate storage layers, both in `lib/`:

### `lib/storage.ts` — submission data (per-room)
Stores negotiation terms and ownership percentages for each of the 7 rooms.

- **Dev:** `data/submissions.json` (created automatically, gitignored)
- **Prod:** Upstash Redis, one hash per room (`room:{id}` key, `hset`/`hgetall`)

```typescript
type RoomSubmission = {
  discountRate?: number;
  valuationCap?: number;
  investmentAmount?: number;
  founderPct?: number;
  safeHolderPct?: number;
  newInvestorPct?: number;
};
```

### `lib/content.ts` — editable page content
Stores markdown for the mentor brief, startup brief, and all four scenario descriptions.

- **Dev:** `.md` files as defaults; runtime edits go to `data/content.json` (gitignored)
- **Prod:** Upstash Redis, one string per section (`content:{key}`); falls back to bundled `.md` files if a key isn't set yet

Content keys: `mentor` | `startup` | `scenario-A` | `scenario-B` | `scenario-C` | `scenario-D`

### Redis environment variables
The correct Vercel KV variable names are:
```
KV_REST_API_URL
KV_REST_API_TOKEN
```
**Not** `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` — those are wrong and will silently fall back to file storage in production.

---

## Admin password
The `/admin` content editor requires an `ADMIN_PASSWORD` environment variable set in Vercel. Without it, the auth route returns a 500. This is separate from the Vercel KV variables.

---

## URL structure

| URL | Description |
|-----|-------------|
| `/` | Room selection (home page) |
| `/room/[id]` | Step 1: negotiate & submit SAFE terms |
| `/room/[id]/scenario` | Step 2: view assigned scenario outcome |
| `/room/[id]/ownership` | Step 3: submit equity ownership percentages |
| `/room/[id]/complete` | Step 4: results & all-scenario comparison |
| `/dashboard` | Game master dashboard (no auth, URL-only) |
| `/capital` | Mentor brief (public, markdown-rendered) |
| `/founders` | Startup brief (public, markdown-rendered) |
| `/admin` | Content editor (password-gated) |

**Important:** `/capital` is the **mentor** brief and `/founders` is the **startup** brief. The URLs are intentionally decoupled so participants can't guess one from the other. Do not rename them to anything more obvious.

---

## Room and scenario configuration

Rooms are defined in `config/rooms.json` (7 rooms, ids `room-1` through `room-7`).  
Scenario assignments: Rooms 1–2 → A, Rooms 3–4 → B, Rooms 5–6 → C, Room 7 → D.

Scenario markdown files live in `content/scenarios/scenario-{A-D}.md`. These are the *defaults* — the game master can override them at runtime via `/admin` without a redeploy.

Fictional company: **MedNova** (medtech). Series A valuations: A=$11M, B=$14M, C=$6M, D=$5M.

---

## CSS / styling gotchas

- **Dark mode was removed.** The original Next.js boilerplate included a `@media (prefers-color-scheme: dark)` block in `globals.css` that set `--foreground: #ededed`. This caused faded, near-invisible text on the light amber/blue scenario backgrounds. That block has been deleted — do not re-add it.
- Prose containers (markdown via `react-markdown` + `@tailwindcss/typography`) need explicit color overrides: `text-gray-800 [&_h1]:text-gray-900 [&_p]:text-gray-800` because Tailwind's `.prose` classes inherit from CSS variables that may not resolve correctly on coloured backgrounds.

---

## Key architectural decisions (don't re-litigate without cause)

- **Dual storage with file fallback:** keeps the dev experience zero-config while being Redis-backed in production.
- **Content separate from submission data:** different Redis key namespaces and different abstraction files. Don't merge them.
- **No auth on `/dashboard`:** the game master dashboard is URL-only access by design.
- **`export const dynamic = "force-dynamic"`** on `/capital` and `/founders` pages so content changes in Redis appear immediately without stale caches.
- **`react-markdown` + `@tailwindcss/typography`** for all markdown rendering.

---

## Before running the cohort
The game master should:
1. Go to `/admin`, paste in the mentor and startup brief content from Word docs
2. Verify `/capital` and `/founders` look correct
3. Use the **Reset Session** button on `/dashboard` to clear any test submission data
