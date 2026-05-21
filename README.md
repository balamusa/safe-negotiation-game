# MedNova SAFE Negotiation Game

A web application supporting a live SAFE (Simple Agreement for Future Equity) negotiation activity for startup cohorts. Designed to run over Zoom breakout rooms, it guides participant groups through negotiating SAFE terms, receiving a scenario outcome, calculating equity ownership, and comparing results across all groups.

**Live site:** [https://safe.patrickbeattie.com](https://safe.patrickbeattie.com)

---

## How the Activity Works

Seven breakout rooms, each containing a startup team and a mentor investor, work through the following steps:

1. **Select your room** — Each group navigates to their assigned room on the home page.
2. **Negotiate SAFE terms** — Groups verbally agree on a Discount Rate, Valuation Cap, and Investment Amount, then submit those terms.
3. **Receive your scenario** — Each room is pre-assigned one of four Series A outcome scenarios (A–D) for the fictional company MedNova. The scenario reveals the actual Series A valuation.
4. **Calculate ownership** — Using the Y Combinator SAFE calculator, groups determine the post-money equity split between Founders, SAFE Holders, and new Series A investors.
5. **Submit ownership percentages** — Groups enter their calculated Founder %, SAFE Holder %, and New Investor % into the app.
6. **Compare all scenarios** — The completion page shows the group's own results alongside all four possible scenarios, prompting reflection on how different negotiated terms would have played out under each outcome.

The **Game Master Dashboard** (`/dashboard`) shows all seven rooms' submitted data in real time, grouped by scenario, and auto-refreshes every 15 seconds.

---

## Scenarios

| Scenario | Series A Valuation | Description |
|----------|--------------------|-------------|
| A | $11M | Strong clinical results, stable market |
| B | $14M | Milestones missed, but market froth drives high valuation |
| C | $6M  | Clinical setbacks, redesign required |
| D | $5M  | Delays and market downturn |

Rooms 1–2 receive Scenario A, Rooms 3–4 receive B, Rooms 5–6 receive C, and Room 7 receives D.

---

## Tech Stack

- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 + `@tailwindcss/typography`
- **Markdown rendering:** `react-markdown`
- **Storage:** File-based JSON in development; [Upstash Redis](https://upstash.com/) in production (via Vercel KV)
- **Deployment:** Vercel (auto-deploys on push to `main`/`master`)

---

## Project Structure

```
config/
  rooms.json              # Room definitions (id, name, scenarioId)
content/
  scenarios/              # Scenario markdown files (scenario-A.md … scenario-D.md)
app/
  page.tsx                # Home page — room selection
  dashboard/page.tsx      # Game master dashboard
  room/[id]/
    page.tsx              # Step 1: negotiate & submit SAFE terms
    scenario/page.tsx     # Step 2: view assigned scenario
    ownership/page.tsx    # Step 3: submit ownership percentages
    complete/page.tsx     # Step 4: results & scenario comparison
  api/
    rooms/route.ts        # GET all rooms with submission data
    rooms/[id]/route.ts   # GET single room data
    rooms/[id]/negotiation/route.ts  # POST negotiation terms
    rooms/[id]/ownership/route.ts    # POST ownership percentages
    admin/reset/route.ts  # POST reset all submission data
lib/
  rooms.ts                # Room config + scenario content loader
  storage.ts              # Storage abstraction (file or Redis)
components/
  PageShell.tsx           # Page wrapper with header and step indicator
  StepIndicator.tsx       # 4-step progress indicator
```

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In development, submission data is stored in `data/submissions.json` (created automatically, gitignored).

---

## Configuration

### Adding or changing rooms

Edit `config/rooms.json`. Each room needs an `id`, a display `name`, and a `scenarioId` (A, B, C, or D).

### Editing scenarios

Scenario content lives in `content/scenarios/scenario-A.md` through `scenario-D.md`. Standard Markdown is supported.

### Environment variables (production)

| Variable | Description |
|----------|-------------|
| `KV_REST_API_URL` | Upstash Redis REST endpoint (set automatically by Vercel KV) |
| `KV_REST_API_TOKEN` | Upstash Redis auth token (set automatically by Vercel KV) |

If neither variable is set, the app falls back to local file storage.

---

## Game Master Notes

- Visit `/dashboard` to monitor all rooms in real time.
- Use the **Reset Session** button on the dashboard to clear all submission data before starting a new cohort.
- The dashboard auto-refreshes every 15 seconds; use the manual **↻ Refresh** button if you need an immediate update.
