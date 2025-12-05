"use client";

import { useEffect, useState } from "react";

export default function ComparePage({ params }: any) {
  const [proposals, setProposals] = useState([]);
  const [rec, setRec] = useState(null);

  async function load() {
    const res = await fetch(`/api/proposals?rfpId=${params.id}`);
    setProposals(await res.json());
  }

  async function recommend() {
    const res = await fetch(`/api/rfp/${params.id}/recommend`);
    setRec(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-bold">Proposal Comparison</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Vendor</th>
            <th>Price</th>
            <th>Delivery</th>
            <th>Warranty</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p: any) => (
            <tr key={p.id} className="border">
              <td>{p.vendorId}</td>
              <td>{p.parsed.price}</td>
              <td>{p.parsed.delivery_days}</td>
              <td>{p.parsed.warranty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={recommend}
        className="px-4 py-2 mt-4 bg-black text-white"
      >
        Get Recommendation
      </button>

      {rec && (
        <div className="p-4 bg-green-100 mt-4">
          <h2 className="font-semibold">Recommended Vendor</h2>
          <pre>{JSON.stringify(rec, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
