"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "@/app/components/Navigation";
import Link from "next/link";

export default function RfpDetail() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rfps/${params.id}`)
      .then((res) => res.json())
      .then(setData);

    fetch("/api/vendors")
      .then((res) => res.json())
      .then(setVendors);
  }, [params.id]);

  const toggleVendor = (id: number) => {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSendRfp = async () => {
    if (selectedVendorIds.length === 0) {
      alert("Please select at least one vendor");
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const res = await fetch("/api/send-rfp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfpId: Number(params.id),
          vendorIds: selectedVendorIds,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setMessage(`✓ RFP sent to ${result.sentTo.length} vendor(s)`);
        setSelectedVendorIds([]);
      } else {
        setMessage(`✗ ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("✗ Failed to send RFP");
    } finally {
      setSending(false);
    }
  };

  if (!data)
    return (
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );

  const hasProposals = data.proposals && data.proposals.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navigation />

      <div className="max-w-6xl mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{data.rfp.title}</h1>
            <p className="text-sm text-slate-400">
              Created {new Date(data.rfp.createdAt).toLocaleDateString()}
            </p>
          </div>
          {hasProposals && (
            <Link
              href={`/compare/${params.id}`}
              className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-md hover:bg-emerald-400 transition font-medium"
            >
              Compare Proposals
            </Link>
          )}
        </div>

        {/* RFP Details */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold mb-4">RFP Details</h2>
          <pre className="bg-slate-950 p-4 rounded text-xs text-slate-300 overflow-x-auto">
            {JSON.stringify(data.rfp.structured, null, 2)}
          </pre>
        </section>

        {/* Send to Vendors */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="text-lg font-semibold">Send to Vendors</h2>

          {message && (
            <div
              className={`rounded-md px-3 py-2 text-sm ${
                message.startsWith("✓")
                  ? "bg-emerald-950/50 border border-emerald-500/40 text-emerald-200"
                  : "bg-red-950/50 border border-red-500/40 text-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {vendors.map((vendor) => (
              <label
                key={vendor.id}
                className="flex items-center gap-2 p-3 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer hover:border-emerald-500/50 transition"
              >
                <input
                  type="checkbox"
                  checked={selectedVendorIds.includes(vendor.id)}
                  onChange={() => toggleVendor(vendor.id)}
                  className="w-4 h-4"
                />
                <div>
                  <div className="text-sm font-medium">
                    {vendor.name || "Unnamed Vendor"}
                  </div>
                  <div className="text-xs text-slate-400">{vendor.email}</div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handleSendRfp}
            disabled={sending || selectedVendorIds.length === 0}
            className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-md hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {sending
              ? "Sending..."
              : `Send to ${selectedVendorIds.length} vendor(s)`}
          </button>
        </section>

        {/* Proposals */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            Vendor Proposals ({data.proposals.length})
          </h2>

          {!hasProposals ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center">
              <p className="text-slate-400">No proposals received yet.</p>
              <p className="text-sm text-slate-500 mt-2">
                Proposals will appear here when vendors reply to the RFP email.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.proposals.map((item: any) => (
                <div
                  key={item.proposal.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {item.vendor?.name || "Unknown Vendor"}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {item.vendor?.email}
                      </p>
                    </div>
                  </div>

                  {item.proposal.aiSummary && (
                    <div className="bg-emerald-950/30 border border-emerald-500/30 rounded p-3">
                      <p className="text-sm text-emerald-200">
                        {item.proposal.aiSummary}
                      </p>
                    </div>
                  )}

                  <pre className="text-xs bg-slate-950 p-3 rounded overflow-x-auto text-slate-300">
                    {JSON.stringify(item.proposal.parsed, null, 2)}
                  </pre>

                  <p className="text-xs text-slate-500">
                    Received{" "}
                    {new Date(item.proposal.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
