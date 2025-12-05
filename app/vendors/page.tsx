"use client";

import { useEffect, useState } from "react";

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);

  async function load() {
    const res = await fetch("/api/vendors");
    setVendors(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-bold">Vendors</h1>

      <a
        href="/vendors/create"
        className="px-4 py-2 bg-black text-white inline-block"
      >
        Add Vendor
      </a>

      <div className="mt-4 space-y-3">
        {vendors.map((v: any) => (
          <div key={v.id} className="border rounded p-3">
            <p className="font-semibold">{v.name}</p>
            <p>{v.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
