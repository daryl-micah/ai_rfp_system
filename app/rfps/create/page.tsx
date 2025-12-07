"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/app/components/Navigation";
import Link from "next/link";

export default function CreateRFPPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const generate = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rfps/from-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const rfp = await res.json();

      // Redirect to the newly created RFP detail page
      router.push(`/rfps/${rfp.id}`);
    } catch (error) {
      console.error("Error generating RFP:", error);
      alert("Failed to generate RFP. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />

      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-emerald-400 hover:text-emerald-300 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-50">
            Create RFP from Natural Language
          </h1>
          <p className="text-slate-400 mt-2">
            Describe what you want to procure in plain language, and AI will
            structure it into an RFP.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Procurement Description
            </label>
            <textarea
              className="w-full h-64 p-4 border border-slate-700 rounded-lg bg-slate-900 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/60 resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
            />
          </div>

          <div className="flex gap-3">
            <button
              className="bg-emerald-500 text-slate-950 px-6 py-2 rounded-md hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              onClick={generate}
              disabled={loading || !text.trim()}
            >
              {loading ? "Generating..." : "Generate RFP"}
            </button>

            {text && !loading && (
              <button
                className="text-slate-400 hover:text-slate-300 px-4 py-2"
                onClick={() => setText("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Example prompts */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Example Prompts:
          </h3>
          <div className="space-y-2">
            <button
              onClick={() =>
                setText(
                  "I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
                )
              }
              className="block text-left text-sm text-slate-400 hover:text-emerald-400 transition"
            >
              • Office equipment (laptops & monitors)
            </button>
            <button
              onClick={() =>
                setText(
                  "Looking to purchase cloud hosting services for our SaaS platform. Need 99.9% uptime SLA, support for 10,000 concurrent users, daily backups, and 24/7 support. Budget is $5,000/month. Contract period is 12 months with option to extend."
                )
              }
              className="block text-left text-sm text-slate-400 hover:text-emerald-400 transition"
            >
              • Cloud hosting services
            </button>
            <button
              onClick={() =>
                setText(
                  "We need office furniture for 50 employees - desks, chairs, and storage cabinets. Ergonomic chairs are a must. Budget is $75,000. Delivery and installation required within 45 days. Payment net 60 days."
                )
              }
              className="block text-left text-sm text-slate-400 hover:text-emerald-400 transition"
            >
              • Office furniture procurement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
