"use client";

import { useEffect, useState, useCallback } from "react";

type RoomData = {
  id: string;
  name: string;
  scenarioId: string;
  discountRate?: number;
  valuationCap?: number;
  investmentAmount?: number;
  founderPct?: number;
  safeHolderPct?: number;
  newInvestorPct?: number;
};

const SCENARIO_LABELS: Record<string, string> = {
  A: "Scenario A — Strong Clinical Results, Stable Market ($11M)",
  B: "Scenario B — Milestones Missed, Market Froth ($14M)",
  C: "Scenario C — Clinical Setbacks, Redesign Required ($6M)",
  D: "Scenario D — Delays and Market Downturn ($5M)",
};

const SCENARIO_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-800 border-green-200",
  B: "bg-blue-100 text-blue-800 border-blue-200",
  C: "bg-orange-100 text-orange-800 border-orange-200",
  D: "bg-red-100 text-red-800 border-red-200",
};

function fmt(val: number | undefined, suffix = ""): string {
  if (val == null) return "—";
  return `${val.toLocaleString()}${suffix}`;
}

function fmtCap(val: number | undefined): string {
  if (val == null) return "—";
  return `$${val.toLocaleString()}`;
}

export default function DashboardPage() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/rooms", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
        setLastUpdated(new Date());
      }
    } catch {
      // silently retry next poll
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Group rooms by scenario
  const scenarios = ["A", "B", "C", "D"];
  const grouped = scenarios.map((sid) => ({
    scenarioId: sid,
    rooms: rooms.filter((r) => r.scenarioId === sid),
  }));

  async function handleReset() {
    if (
      !window.confirm(
        "Reset all submission data? This cannot be undone."
      )
    )
      return;
    await fetch("/api/admin/reset", { method: "POST" });
    fetchData();
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Game Master Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              MedNova SAFE Negotiation Activity
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchData}
              className="text-sm px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
            >
              ↻ Refresh
            </button>
            <button
              onClick={handleReset}
              className="text-sm px-4 py-2 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-500 transition-colors"
            >
              Reset Session
            </button>
          </div>
        </div>

        {/* Scenario groups */}
        <div className="space-y-8">
          {grouped.map(({ scenarioId, rooms: groupRooms }) => (
            <section key={scenarioId}>
              <div
                className={`inline-block text-sm font-semibold px-4 py-1.5 rounded-full border mb-4 ${SCENARIO_COLORS[scenarioId]}`}
              >
                {SCENARIO_LABELS[scenarioId]}
              </div>

              {groupRooms.length === 0 ? (
                <p className="text-gray-400 text-sm ml-1">No rooms assigned.</p>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-5 py-3 font-semibold text-gray-500">
                          Room
                        </th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-500">
                          Discount Rate
                        </th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-500">
                          Valuation Cap
                        </th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-500">
                          Investment
                        </th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-500">
                          Founders
                        </th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-500">
                          SAFE Holders
                        </th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-500">
                          New Investors
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupRooms.map((room, i) => (
                        <tr
                          key={room.id}
                          className={
                            i < groupRooms.length - 1
                              ? "border-b border-gray-50"
                              : ""
                          }
                        >
                          <td className="px-5 py-4 text-gray-700 font-medium max-w-xs">
                            <span className="block leading-snug">
                              {room.name}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Cell
                              value={
                                room.discountRate != null
                                  ? `${room.discountRate}%`
                                  : undefined
                              }
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Cell value={fmtCap(room.valuationCap) === "—" ? undefined : fmtCap(room.valuationCap)} />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Cell value={fmtCap(room.investmentAmount) === "—" ? undefined : fmtCap(room.investmentAmount)} />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Cell
                              value={
                                room.founderPct != null
                                  ? `${room.founderPct}%`
                                  : undefined
                              }
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Cell
                              value={
                                room.safeHolderPct != null
                                  ? `${room.safeHolderPct}%`
                                  : undefined
                              }
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Cell
                              value={
                                room.newInvestorPct != null
                                  ? `${room.newInvestorPct}%`
                                  : undefined
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>

        <p className="text-xs text-gray-300 text-center mt-10">
          Auto-refreshes every 15 seconds
        </p>
      </div>
    </main>
  );
}

function Cell({ value }: { value: string | undefined }) {
  if (!value) {
    return <span className="text-gray-300 text-base">—</span>;
  }
  return <span className="font-semibold text-gray-800">{value}</span>;
}
