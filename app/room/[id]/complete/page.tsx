import { redirect, notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getRoom, getAllScenarioContents, SCENARIO_IDS } from "@/lib/rooms";
import { getRoomData } from "@/lib/storage";
import { PageShell } from "@/components/PageShell";

export default async function CompletePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) notFound();

  const submission = await getRoomData(id);
  if (submission.founderPct == null) {
    redirect(`/room/${id}/ownership`);
  }

  const allScenarios = getAllScenarioContents();

  const scenarioColors: Record<string, string> = {
    A: "border-green-200 bg-green-50",
    B: "border-blue-200 bg-blue-50",
    C: "border-orange-200 bg-orange-50",
    D: "border-red-200 bg-red-50",
  };

  return (
    <PageShell step={4} title="Activity Complete!">
      <p className="text-sm text-blue-600 font-medium mb-5 bg-blue-50 px-4 py-2 rounded-lg">
        Room: {room.name}
      </p>

      {/* Results summary */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-3">
          Your Results — Scenario {room.scenarioId}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Discount Rate" value={`${submission.discountRate}%`} />
          <Stat
            label="Valuation Cap"
            value={`$${submission.valuationCap?.toLocaleString()}`}
          />
          <Stat label="Founders" value={`${submission.founderPct}%`} />
          <Stat
            label="SAFE Holders"
            value={`${submission.safeHolderPct}%`}
          />
          <Stat
            label="New Investors"
            value={`${submission.newInvestorPct}%`}
          />
        </div>
      </div>

      {/* All scenarios for comparison */}
      <h3 className="text-base font-semibold text-gray-700 mb-4">
        What Could Have Happened — All Scenarios
      </h3>
      <p className="text-sm text-gray-500 mb-5">
        Below are all four possible scenarios. Your room received Scenario{" "}
        <strong>{room.scenarioId}</strong>. Consider how you might have
        negotiated differently if you had known the outcome in advance.
      </p>

      <div className="space-y-4">
        {SCENARIO_IDS.map((sid) => (
          <div
            key={sid}
            className={`rounded-xl border p-5 ${scenarioColors[sid]} ${
              sid === room.scenarioId ? "ring-2 ring-offset-2 ring-blue-400" : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Scenario {sid}
              </span>
              {sid === room.scenarioId && (
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  Your scenario
                </span>
              )}
            </div>
            <div className="prose prose-sm prose-gray max-w-none text-gray-800 [&_h1]:text-gray-900 [&_p]:text-gray-800">
              <ReactMarkdown>{allScenarios[sid]}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg px-3 py-2 border border-green-100">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}
