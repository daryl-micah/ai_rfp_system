"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
    <div className="p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">RFP Dashboard</h1>
        <Link
          href="rfps/create"
          className="bg-black text-white px-4 py-2 rounded"
        >
          + Create RFP
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {rfps.map((rfp) => (
          <div
            key={rfp.id}
            className="border rounded-lg p-5 hover:shadow-lg transition relative"
          >
            <Link href={`/rfps/${rfp.id}`}>
              <h2 className="font-semibold text-lg">{rfp.title}</h2>
              <p className="text-xs text-gray-400 mt-3">
                Created {new Date(rfp.createdAt).toLocaleDateString()}
              </p>
            </Link>
            <button
              onClick={(e) => handleDelete(rfp.id, e)}
              className="absolute bottom-5 right-3 text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
