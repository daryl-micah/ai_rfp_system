"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navigation from "@/app/components/Navigation";
import Link from "next/link";

interface Proposal {
  id: number;
  rfpId: number;
  vendorId: number;
  parsed: {
    price: number;
    delivery_days: number;
    warranty: string;
    terms: string;
    notes: string;
  };
  aiSummary: string;
  vendor: {
    id: number;
    name: string;
    email: string;
  };
}

export default function ComparePage() {
  const params = useParams();
  const [rfp, setRfp] = useState<any>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [rec, setRec] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    // Load RFP details
    const rfpRes = await fetch(`/api/rfps/${params.id}`);
    const rfpData = await rfpRes.json();
    setRfp(rfpData.rfp);

    // Load proposals with vendor data
    const proposalsWithVendors = rfpData.proposals.map((item: any) => ({
      ...item.proposal,
      vendor: item.vendor,
    }));
    setProposals(proposalsWithVendors);
  }

  async function recommend() {
    setLoading(true);
    try {
      const res = await fetch(`/api/rfps/${params.id}/recommend`);
      const data = await res.json();
      setRec(data);
    } catch (error) {
      console.error("Failed to get recommendation:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [params.id]);

  if (!rfp) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link
              href={`/rfps/${params.id}`}
              className="text-sm text-emerald-400 hover:text-emerald-300 mb-2 inline-block"
            >
              ← Back to RFP
            </Link>
            <h1 className="text-3xl font-bold">Proposal Comparison</h1>
            <p className="text-slate-400 mt-1">{rfp.title}</p>
          </div>
        </div>

        {proposals.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
            <p className="text-slate-400">No proposals to compare yet.</p>
          </div>
        ) : (
          <>
            {/* Comparison Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Vendor
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Delivery
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Warranty
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Terms
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {proposals.map((p) => {
                      const isWinner = rec && rec.winner === p.vendorId;
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-800/30 transition ${
                            isWinner
                              ? "bg-emerald-950/30 border-l-4 border-emerald-500"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium">
                                {p.vendor?.name || "Unknown Vendor"}
                                {isWinner && (
                                  <span className="ml-2 text-xs bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full font-semibold">
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400">
                                {p.vendor?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono">
                            {p.parsed?.price
                              ? `$${p.parsed.price.toLocaleString()}`
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            {p.parsed?.delivery_days
                              ? `${p.parsed.delivery_days} days`
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {p.parsed?.warranty || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {p.parsed?.terms || "N/A"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proposals.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2"
                >
                  <h3 className="font-semibold">
                    {p.vendor?.name || "Unknown"}
                  </h3>
                  {p.aiSummary && (
                    <p className="text-sm text-slate-300">{p.aiSummary}</p>
                  )}
                  {p.parsed?.notes && (
                    <p className="text-xs text-slate-400 italic">
                      “{p.parsed.notes}”
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Get Recommendation */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <h2 className="text-xl font-semibold">AI Recommendation</h2>

              {!rec ? (
                <button
                  onClick={recommend}
                  disabled={loading}
                  className="bg-emerald-500 text-slate-950 px-6 py-2 rounded-md hover:bg-emerald-400 disabled:opacity-50 transition font-medium"
                >
                  {loading ? "Analyzing..." : "Get AI Recommendation"}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-lg p-4">
                    <h3 className="font-semibold text-emerald-400 mb-2">
                      Recommended Vendor:{" "}
                      {proposals.find((p) => p.vendorId === rec.winner)?.vendor
                        ?.name || `Vendor ID ${rec.winner}`}
                    </h3>
                    <p className="text-slate-200">{rec.explanation}</p>
                  </div>
                  <button
                    onClick={() => setRec(null)}
                    className="text-sm text-slate-400 hover:text-slate-300 underline"
                  >
                    Clear recommendation
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
