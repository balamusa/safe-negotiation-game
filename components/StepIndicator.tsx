const STEPS = [
  "Select Room",
  "Negotiate Terms",
  "Review Scenario",
  "Submit Ownership",
  "Complete",
];

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8 flex-wrap">
      {STEPS.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold shrink-0
                ${
                  i < current
                    ? "bg-blue-600 text-white"
                    : i === current
                    ? "bg-white text-blue-700 border-2 border-blue-600"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                i === current
                  ? "text-blue-700"
                  : i < current
                  ? "text-blue-500"
                  : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`w-10 h-0.5 mx-1 mb-4 ${
                i < current ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
