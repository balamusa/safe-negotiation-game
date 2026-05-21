import { redirect, notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getRoom, getScenarioContent } from "@/lib/rooms";
import { getRoomData } from "@/lib/storage";
import { PageShell } from "@/components/PageShell";
import Link from "next/link";

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = getRoom(id);
  if (!room) notFound();

  const submission = await getRoomData(id);
  if (submission.discountRate == null) {
    redirect(`/room/${id}`);
  }

  const scenarioContent = getScenarioContent(room.scenarioId);

  return (
    <PageShell step={2} title={`Scenario ${room.scenarioId} — Your Outcome`}>
      <p className="text-sm text-blue-600 font-medium mb-5 bg-blue-50 px-4 py-2 rounded-lg">
        Room: {room.name}
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-3">
          Your Scenario
        </p>
        <div className="prose prose-gray max-w-none text-gray-800 [&_h1]:text-gray-900 [&_p]:text-gray-800">
          <ReactMarkdown>{scenarioContent}</ReactMarkdown>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          Next Step: Calculate Ownership Percentages
        </p>
        <p className="text-sm text-gray-500 mb-3">
          Using your negotiated terms (
          <strong>{submission.discountRate}% discount</strong>,{" "}
          <strong>${submission.valuationCap?.toLocaleString()} cap</strong>) and
          the Series A valuation in your scenario, use the SAFE calculator to
          determine the ownership percentage for:
        </p>
        <ul className="text-sm text-gray-500 list-disc list-inside mb-4 space-y-1">
          <li>Founders</li>
          <li>SAFE holders (your investor)</li>
          <li>New Series A investors</li>
        </ul>
        <a
          href="https://www.equidam.com/safe-calculator/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white border border-blue-300 text-blue-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
        >
          Open SAFE Calculator ↗
        </a>
      </div>

      <Link
        href={`/room/${id}/ownership`}
        className="block w-full text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
      >
        I've Calculated the Percentages — Continue →
      </Link>
    </PageShell>
  );
}
