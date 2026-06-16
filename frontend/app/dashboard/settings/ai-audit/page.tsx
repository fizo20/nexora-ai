// frontend/app/dashboard/settings/ai-audit/page.tsx
"use client";

import { useAIAudit } from "@/lib/react-query/audit/use-ai-audit";

import { AIAuditLog } from "@/types/audit";

export default function AIAuditPage() {
  const { data, isLoading } = useAIAudit();

  const logs: AIAuditLog[] = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">AI Audit Logs</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Monitor AI usage, cost, and activity
        </p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="grid grid-cols-6 border-b bg-muted/50 p-4 text-sm font-medium">
          <div>Action</div>

          <div>Model</div>

          <div>Input</div>

          <div>Output</div>

          <div>Cost</div>

          <div>Time</div>
        </div>

        {isLoading && (
          <div className="p-6 text-sm text-muted-foreground">
            Loading AI audit logs...
          </div>
        )}

        {!isLoading && logs.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">
            No AI audit logs found
          </div>
        )}

        {logs.map((log) => (
          <div key={log._id} className="grid grid-cols-6 border-b p-4 text-sm">
            <div>{log.action}</div>

            <div>{log.aiModel}</div>

            <div>{log.inputSize}</div>

            <div>{log.outputSize}</div>

            <div>${log.cost.toFixed(4)}</div>

            <div>{new Date(log.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
