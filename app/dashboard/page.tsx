"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";

export default function Dashboard() {
  const [rfps, setRfps] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/rfps")
      .then((res) => res.json())
      .then(setRfps);
  }, []);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this RFP?")) return;

    try {
      const res = await fetch(`/api/rfps/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRfps(rfps.filter((rfp) => rfp.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete RFP:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />

      <div className="p-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">RFP Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Manage your requests for proposal
            </p>
          </div>
        </div>

        {rfps.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
            <p className="text-slate-400 mb-4">
              No RFPs yet. Create your first one!
            </p>
            <Link
              href="/rfps/create"
              className="inline-block bg-emerald-500 text-slate-950 px-4 py-2 rounded-md hover:bg-emerald-400 transition font-medium"
            >
              + Create RFP
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rfps.map((rfp) => (
              <div
                key={rfp.id}
                className="border border-slate-800 rounded-lg p-5 hover:shadow-lg hover:border-emerald-500/50 transition bg-slate-900/60 text-slate-50 relative group"
              >
                <Link href={`/rfps/${rfp.id}`}>
                  <h2 className="font-semibold text-lg group-hover:text-emerald-400 transition">
                    {rfp.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-3">
                    Created {new Date(rfp.createdAt).toLocaleDateString()}
                  </p>
                </Link>
                <button
                  onClick={(e) => handleDelete(rfp.id, e)}
                  className="absolute bottom-5 right-3 text-red-400 hover:text-red-300 text-sm opacity-0 group-hover:opacity-100 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
