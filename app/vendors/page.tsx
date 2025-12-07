// app/vendor/page.tsx
"use client";

import { useEffect, useState } from "react";
import Navigation from "@/app/components/Navigation";

type Vendor = {
  id: number;
  name: string | null;
  email: string;
  contact: string | null;
  createdAt: string | null;
};

export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");

  const [selectedVendorIds, setSelectedVendorIds] = useState<number[]>([]);
  const [rfpId, setRfpId] = useState<string>("");

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendors");
      const data = await res.json();
      setVendors(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCreate = async () => {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Email is required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, contact }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      setName("");
      setEmail("");
      setContact("");
      await fetchVendors();
      setMessage("Vendor created");
    } catch (err: any) {
      console.error(err);
      setError("Failed to create vendor");
    } finally {
      setCreating(false);
    }
  };

  const toggleVendorSelection = (id: number) => {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id]
    );
  };

  const handleSendRfp = async () => {
    setError(null);
    setMessage(null);

    const numericRfpId = Number(rfpId);
    if (!numericRfpId || Number.isNaN(numericRfpId)) {
      setError("Please enter a valid RFP ID");
      return;
    }
    if (selectedVendorIds.length === 0) {
      setError("Select at least one vendor");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/send-rfp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfpId: numericRfpId,
          vendorIds: selectedVendorIds,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const json = await res.json();
      setMessage(`RFP sent to: ${(json.sentTo || []).join(", ")}`);
    } catch (err: any) {
      console.error(err);
      setError("Failed to send RFP emails");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navigation />
      <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
        <header>
          <h1 className="text-2xl font-semibold">Vendors</h1>
          <p className="text-sm text-slate-400">
            Manage your vendor master data and send RFPs via email.
          </p>
        </header>

        {/* Alerts */}
        {message && (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-200">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-red-500/40 bg-red-950/50 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Create vendor form */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <h2 className="text-lg font-medium">Add vendor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Name (optional)</label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Email *</label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rfp@vendor.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">
                Contact (optional)
              </label>
              <input
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+1 555-1234"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
          >
            {creating ? "Saving..." : "Save vendor"}
          </button>
        </section>

        {/* Send RFP section */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
          <h2 className="text-lg font-medium">Send RFP to selected vendors</h2>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">
                RFP ID (you can copy this from the dashboard)
              </label>
              <input
                className="w-40 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
                value={rfpId}
                onChange={(e) => setRfpId(e.target.value)}
                placeholder="e.g. 1"
              />
            </div>
            <button
              onClick={handleSendRfp}
              disabled={sending || selectedVendorIds.length === 0}
              className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-1.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send RFP emails"}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Select vendors in the table below, then provide the RFP ID and click
            &quot;Send RFP emails&quot;.
          </p>
        </section>

        {/* Vendors table */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium">Vendor list</h2>
            <span className="text-xs text-slate-500">
              {vendors.length} vendor{vendors.length === 1 ? "" : "s"}
            </span>
          </div>

          {loading ? (
            <div className="py-6 text-sm text-slate-400">
              Loading vendors...
            </div>
          ) : vendors.length === 0 ? (
            <div className="py-6 text-sm text-slate-400">
              No vendors yet. Add your first vendor above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400">
                    <th className="py-2 pr-2 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedVendorIds.length > 0 &&
                          selectedVendorIds.length === vendors.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVendorIds(vendors.map((v) => v.id));
                          } else {
                            setSelectedVendorIds([]);
                          }
                        }}
                      />
                    </th>
                    <th className="py-2 px-2 text-left">Name</th>
                    <th className="py-2 px-2 text-left">Email</th>
                    <th className="py-2 px-2 text-left hidden md:table-cell">
                      Contact
                    </th>
                    <th className="py-2 px-2 text-left hidden md:table-cell">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => {
                    const checked = selectedVendorIds.includes(v.id);
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-slate-800/60 last:border-0"
                      >
                        <td className="py-2 pr-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleVendorSelection(v.id)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <div className="font-medium">
                            {v.name || "(no name)"}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <span className="text-slate-200">{v.email}</span>
                        </td>
                        <td className="py-2 px-2 hidden md:table-cell">
                          <span className="text-slate-400">
                            {v.contact || "—"}
                          </span>
                        </td>
                        <td className="py-2 px-2 hidden md:table-cell">
                          <span className="text-slate-500 text-xs">
                            {v.createdAt
                              ? new Date(v.createdAt).toLocaleString()
                              : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
