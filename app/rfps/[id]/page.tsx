"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function RfpDetailPage() {
  const { id } = useParams();
  const [rfp, setRfp] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/rfps/${id}`)
      .then((res) => res.json())
      .then(setRfp);
  }, [id]);

  if (!rfp) return <p className="p-8">Loading RFP...</p>;

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">{rfp.title}</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="font-semibold mb-2">Structured RFP</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(rfp.structured, null, 2)}
        </pre>
      </div>
    </div>
  );
}
