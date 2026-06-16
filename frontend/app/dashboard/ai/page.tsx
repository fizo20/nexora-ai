// frontend/app/dashboard/ai/page.tsx
// This is a simple page to test out the AI agent. It allows you to input a prompt and see the response from the AI.
"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";

export default function AICommandPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const runAI = async () => {
    try {
      setLoading(true);

      const result = await apiClient("/api/ai/agent", {
        method: "POST",
        body: JSON.stringify({
          goal: prompt,
        }),
      });

      setResponse(JSON.stringify(result, null, 2));
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">AI Command Center</h1>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <textarea
          className="w-full h-32 bg-zinc-800 rounded p-4"
          placeholder="Tell Nexora AI what you want to accomplish..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button onClick={runAI} className="mt-4 px-6 py-2 bg-blue-600 rounded">
          {loading ? "Running AI..." : "Execute AI"}
        </button>
      </div>

      {response && (
        <div className="bg-black border border-zinc-800 rounded-xl p-6">
          <h2 className="mb-4 text-lg font-medium">AI Result</h2>

          <pre className="text-sm overflow-x-auto">{response}</pre>
        </div>
      )}
    </div>
  );
}
