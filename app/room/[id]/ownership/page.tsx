"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";

export default function OwnershipPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const roomId = params.id;

  const [founderPct, setFounderPct] = useState("");
  const [safeHolderPct, setSafeHolderPct] = useState("");
  const [newInvestorPct, setNewInvestorPct] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    fetch(`/api/rooms/${roomId}`)
      .then((r) => r.json())
      .then((data) => {
        setRoomName(data.name ?? "");
        if (
          data.founderPct != null &&
          data.safeHolderPct != null &&
          data.newInvestorPct != null
        ) {
          setAlreadySubmitted(true);
          setFounderPct(String(data.founderPct));
          setSafeHolderPct(String(data.safeHolderPct));
          setNewInvestorPct(String(data.newInvestorPct));
        } else if (data.discountRate == null) {
          router.push(`/room/${roomId}`);
        }
      })
      .catch(() => {});
  }, [roomId, router]);

  function checkSum() {
    const f = parseFloat(founderPct);
    const s = parseFloat(safeHolderPct);
    const n = parseFloat(newInvestorPct);
    if (!isNaN(f) && !isNaN(s) && !isNaN(n)) {
      const sum = f + s + n;
      if (Math.abs(sum - 100) > 0.5) {
        setWarning(
          `These percentages sum to ${sum.toFixed(1)}% — they should add up to 100%. Double-check your calculator results before submitting.`
        );
      } else {
        setWarning("");
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const f = parseFloat(founderPct);
    const s = parseFloat(safeHolderPct);
    const n = parseFloat(newInvestorPct);

    if (isNaN(f) || f < 0 || f > 100) {
      setError("Please enter a valid Founder percentage (0–100).");
      return;
    }
    if (isNaN(s) || s < 0 || s > 100) {
      setError("Please enter a valid SAFE Holder percentage (0–100).");
      return;
    }
    if (isNaN(n) || n < 0 || n > 100) {
      setError("Please enter a valid New Investor percentage (0–100).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/ownership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          founderPct: f,
          safeHolderPct: s,
          newInvestorPct: n,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/room/${roomId}/complete`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  const fields = [
    {
      label: "Founder Ownership (%)",
      value: founderPct,
      setter: setFounderPct,
    },
    {
      label: "SAFE Holder Ownership (%)",
      value: safeHolderPct,
      setter: setSafeHolderPct,
    },
    {
      label: "New Investor Ownership (%)",
      value: newInvestorPct,
      setter: setNewInvestorPct,
    },
  ];

  if (alreadySubmitted) {
    return (
      <PageShell step={3} title="Ownership Percentages Submitted">
        <p className="text-gray-500 mb-4">
          Your room has already submitted ownership percentages.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Founders</span>
            <span className="font-semibold text-gray-800">{founderPct}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SAFE Holders</span>
            <span className="font-semibold text-gray-800">
              {safeHolderPct}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">New Investors</span>
            <span className="font-semibold text-gray-800">
              {newInvestorPct}%
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push(`/room/${roomId}/complete`)}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Continue to Results →
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell step={3} title="Submit Ownership Percentages">
      {roomName && (
        <p className="text-sm text-blue-600 font-medium mb-5 bg-blue-50 px-4 py-2 rounded-lg">
          Room: {roomName}
        </p>
      )}
      <p className="text-gray-500 mb-6">
        Using the results from the{" "}
        <a
          href="https://www.equidam.com/safe-calculator/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          SAFE calculator
        </a>
        , enter the post-raise ownership percentages for each party.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {fields.map(({ label, value, setter }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={value}
              onChange={(e) => {
                setter(e.target.value);
                setWarning("");
              }}
              onBlur={checkSum}
              placeholder="e.g. 60"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
            />
          </div>
        ))}

        {warning && (
          <p className="text-amber-700 text-sm bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl">
            ⚠ {warning}
          </p>
        )}

        {error && (
          <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Submit Ownership Percentages →"}
        </button>
      </form>
    </PageShell>
  );
}
