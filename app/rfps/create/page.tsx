"use client";

import { useState } from "react";

export default function CreateRFPPage() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [rfp, setRfp] = useState(null);

  const generate = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/rfps/from-text", {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      setRfp(await res.json());
    } catch (error) {
      console.error("Error generating RFP:", error);
      alert("Failed to generate RFP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl font-bold">Create RFP from Natural Language</h1>
      <textarea
        className="h-40 p-3 border rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
        onClick={generate}
        disabled={loading || !text}
      >
        {loading ? "Generating..." : "Generate RFP"}
      </button>
      {rfp && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Generated RFP:</h2>
          <pre>{JSON.stringify(rfp, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
