"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";

export default function NegotiationPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const roomId = params.id;

  const [discountRate, setDiscountRate] = useState("");
  const [valuationCap, setValuationCap] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [submitted, setSubmitted] = useState<{
    discountRate: number;
    valuationCap: number;
    investmentAmount: number;
  } | null>(null);
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    fetch(`/api/rooms/${roomId}`)
      .then((r) => r.json())
      .then((data) => {
        setRoomName(data.name ?? "");
        if (
          data.discountRate != null &&
          data.valuationCap != null &&
          data.investmentAmount != null
        ) {
          setAlreadySubmitted(true);
          setSubmitted({
            discountRate: data.discountRate,
            valuationCap: data.valuationCap,
            investmentAmount: data.investmentAmount,
          });
        }
      })
      .catch(() => {});
  }, [roomId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const dr = parseFloat(discountRate);
    const vc = parseFloat(valuationCap.replace(/,/g, ""));
    const ia = parseFloat(investmentAmount.replace(/,/g, ""));

    if (isNaN(dr) || dr <= 0 || dr > 100) {
      setError("Please enter a valid discount rate between 0 and 100.");
      return;
    }
    if (isNaN(vc) || vc <= 0) {
      setError("Please enter a valid valuation cap greater than 0.");
      return;
    }
    if (isNaN(ia) || ia <= 0) {
      setError("Please enter a valid investment amount greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/negotiation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discountRate: dr, valuationCap: vc, investmentAmount: ia }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      router.push(`/room/${roomId}/scenario`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (alreadySubmitted && submitted) {
    return (
      <PageShell step={1} title="Negotiation Terms Submitted">
        <p className="text-gray-500 mb-4">
          Your room has already submitted negotiation terms.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Discount Rate</span>
            <span className="font-semibold text-gray-800">
              {submitted.discountRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Valuation Cap</span>
            <span className="font-semibold text-gray-800">
              ${submitted.valuationCap.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">SAFE Investment Amount</span>
            <span className="font-semibold text-gray-800">
              ${submitted.investmentAmount.toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => router.push(`/room/${roomId}/scenario`)}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Continue to Scenario →
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell step={1} title="Negotiate Your SAFE Terms">
      {roomName && (
        <p className="text-sm text-blue-600 font-medium mb-5 bg-blue-50 px-4 py-2 rounded-lg">
          Room: {roomName}
        </p>
      )}
      <p className="text-gray-500 mb-6">
        Use the materials provided to negotiate a mutually acceptable{" "}
        <strong>Discount Rate</strong> and <strong>Valuation Cap</strong> with
        your counterpart. Once you have verbally agreed, enter the values below
        and submit.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={discountRate}
            onChange={(e) => setDiscountRate(e.target.value)}
            placeholder="e.g. 20"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valuation Cap ($)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={valuationCap}
            onChange={(e) => setValuationCap(e.target.value)}
            placeholder="e.g. 8000000"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            required
          />
          {valuationCap && !isNaN(parseFloat(valuationCap)) && (
            <p className="text-xs text-gray-400 mt-1">
              = ${parseFloat(valuationCap).toLocaleString()}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SAFE Investment Amount ($)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            placeholder="e.g. 1000000"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            required
          />
          {investmentAmount && !isNaN(parseFloat(investmentAmount)) && (
            <p className="text-xs text-gray-400 mt-1">
              = ${parseFloat(investmentAmount).toLocaleString()}
            </p>
          )}
        </div>

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
          {submitting ? "Submitting…" : "Submit Negotiated Terms →"}
        </button>
      </form>
    </PageShell>
  );
}
