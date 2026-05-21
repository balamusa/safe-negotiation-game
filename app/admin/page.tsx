"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

type ContentKey =
  | "mentor"
  | "startup"
  | "scenario-A"
  | "scenario-B"
  | "scenario-C"
  | "scenario-D";

const SECTIONS: { key: ContentKey; label: string; description: string }[] = [
  {
    key: "mentor",
    label: "Mentor Brief",
    description: "Shown at /capital",
  },
  {
    key: "startup",
    label: "Startup Brief",
    description: "Shown at /founders",
  },
  {
    key: "scenario-A",
    label: "Scenario A",
    description: "Strong clinical results, stable market ($11M)",
  },
  {
    key: "scenario-B",
    label: "Scenario B",
    description: "Milestones missed, market froth ($14M)",
  },
  {
    key: "scenario-C",
    label: "Scenario C",
    description: "Clinical setbacks, redesign required ($6M)",
  },
  {
    key: "scenario-D",
    label: "Scenario D",
    description: "Delays and market downturn ($5M)",
  },
];

// ── Password gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: (pw: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onAuth(password);
      } else {
        const body = await res.json();
        setError(body.error ?? "Incorrect password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Admin Panel</h1>
        <p className="text-sm text-gray-400 mb-6">
          Aspire SAFE Negotiation — Content Editor
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Enter admin password"
              required
              autoFocus
            />
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
            {submitting ? "Checking…" : "Sign In →"}
          </button>
        </form>
      </div>
    </main>
  );
}

// ── Editor section ────────────────────────────────────────────────────────────

function EditorSection({
  section,
  initialValue,
  password,
}: {
  section: (typeof SECTIONS)[number];
  initialValue: string;
  password: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ key: section.key, value }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const body = await res.json();
        setError(body.error ?? "Save failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            {section.label}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{section.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((p) => !p)}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div className="px-6 py-5 min-h-[200px]">
          <div className="prose prose-gray max-w-none text-gray-800 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_p]:text-gray-700 [&_li]:text-gray-700">
            <ReactMarkdown>{value}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-6 py-5 text-sm font-mono text-gray-800 focus:outline-none resize-none min-h-[200px]"
          placeholder="Enter markdown content…"
          rows={Math.max(10, value.split("\n").length + 2)}
        />
      )}

      {/* Status */}
      {error && (
        <p className="text-red-600 text-sm bg-red-50 px-6 py-3 border-t border-red-100">
          {error}
        </p>
      )}
    </section>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [content, setContent] = useState<Record<ContentKey, string> | null>(
    null
  );
  const [loadError, setLoadError] = useState("");

  // Restore session
  useEffect(() => {
    const stored = sessionStorage.getItem("admin-password");
    if (stored) setPassword(stored);
  }, []);

  const fetchContent = useCallback(async (pw: string) => {
    try {
      const res = await fetch("/api/admin/content");
      if (res.ok) {
        setContent(await res.json());
      } else {
        setLoadError("Failed to load content.");
      }
    } catch {
      setLoadError("Network error loading content.");
    }
  }, []);

  function handleAuth(pw: string) {
    sessionStorage.setItem("admin-password", pw);
    setPassword(pw);
    fetchContent(pw);
  }

  // Fetch content once password is restored from session
  useEffect(() => {
    if (password && !content) {
      fetchContent(password);
    }
  }, [password, content, fetchContent]);

  if (!password) {
    return <PasswordGate onAuth={handleAuth} />;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-sm text-gray-400 mt-1">
              Aspire SAFE Negotiation — Content Editor
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/capital"
              target="_blank"
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
            >
              /capital ↗
            </a>
            <a
              href="/founders"
              target="_blank"
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
            >
              /founders ↗
            </a>
            <button
              onClick={() => {
                sessionStorage.removeItem("admin-password");
                setPassword(null);
                setContent(null);
              }}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-8">
          Content is saved to the database immediately when you click{" "}
          <strong>Save</strong> and will appear on the live pages right away.
          Use <strong>Preview</strong> to check formatting before saving.
          Markdown is supported.
        </p>

        {loadError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-red-600 text-sm">
            {loadError}
          </div>
        )}

        {content ? (
          <div className="space-y-6">
            {SECTIONS.map((section) => (
              <EditorSection
                key={section.key}
                section={section}
                initialValue={content[section.key]}
                password={password}
              />
            ))}
          </div>
        ) : (
          !loadError && (
            <div className="text-center py-20 text-gray-400">Loading…</div>
          )
        )}
      </div>
    </main>
  );
}
