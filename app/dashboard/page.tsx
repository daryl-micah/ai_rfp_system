"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Rfp = {
  id: number;
  title: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [rfps, setRfps] = useState<Rfp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rfps")
      .then((res) => res.json())
      .then((data) => setRfps(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📊 RFP Dashboard</h1>
        <Link
          href="rfps/create"
          className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          + Create RFP
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-gray-500">Loading RFPs...</p>
      ) : rfps.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500 mb-4">No RFPs created yet</p>
          <Link href="/create" className="underline text-blue-600">
            Create your first RFP →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rfps.map((rfp) => (
            <Link
              key={rfp.id}
              href={`/rfps/${rfp.id}`}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="font-semibold text-lg mb-2">{rfp.title}</h2>
              <p className="text-sm text-gray-500">
                Created on {new Date(rfp.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-4 text-blue-600 text-sm">View Details →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
