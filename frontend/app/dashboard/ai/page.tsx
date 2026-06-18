// frontend/app/dashboard/ai/page.tsx
"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Bot } from "lucide-react";

export default function AICommandPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const runAI = async () => {
    if (!prompt.trim()) return;
    try {
      setLoading(true);
      setResponse("");
      const result = await apiClient("/api/ai/agent", {
        method: "POST",
        body: JSON.stringify({ goal: prompt }),
      });
      setResponse(JSON.stringify(result, null, 2));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setResponse(`Error: ${err.message}`);
      } else {
        setResponse("Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          AI Command Center
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Direct control over the Nexora AI agent
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Bot size={14} className="text-primary" />
          <span className="text-[13px] font-medium text-foreground">
            What would you like the AI to accomplish?
          </span>
        </div>

        <textarea
          className="w-full h-28 sm:h-32 rounded-lg border bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition"
          placeholder="Tell Nexora AI what you want to accomplish..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />

        <button
          onClick={runAI}
          disabled={loading || !prompt.trim()}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? "Running AI..." : "Execute AI"}
        </button>
      </div>

      {response && (
        <div className="rounded-lg border bg-card p-4 sm:p-5">
          <h2 className="text-[14px] font-semibold text-foreground mb-3">
            AI Result
          </h2>
          <pre className="text-[12px] text-muted-foreground overflow-x-auto bg-muted rounded-lg p-3 whitespace-pre-wrap break-words">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
