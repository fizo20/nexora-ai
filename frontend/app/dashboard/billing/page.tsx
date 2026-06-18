// frontend/app/dashboard/billing/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { ArrowUpRight } from "lucide-react";

type UsageData = {
  totalUsage: number;
  limit: number;
  remaining: number;
  plan: string;
};

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBilling = async () => {
    try {
      const res = await apiClient("/api/billing/usage");
      const usageArray = res?.usage || [];
      const totalUsage = usageArray.reduce(
        (sum: number, item: { total: number }) => sum + item.total,
        0,
      );
      const workspaceRes = await apiClient("/api/workspaces");
      const currentPlan =
        workspaceRes?.data?.[0]?.plan || workspaceRes?.data?.plan || "FREE";
      const PLAN_LIMITS: Record<string, number> = {
        FREE: 50,
        PRO: 500,
        ENTERPRISE: Infinity,
      };
      const limit = PLAN_LIMITS[currentPlan] ?? 50;
      setUsage({
        totalUsage,
        limit,
        remaining: limit === Infinity ? Infinity : limit - totalUsage,
        plan: currentPlan,
      });
    } catch (err) {
      console.error("Billing fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const handleUpgrade = async () => {
    try {
      setActionLoading(true);
      const res = await apiClient("/api/billing/upgrade", {
        method: "POST",
        body: JSON.stringify({ targetPlan: "PRO" }),
      });
      window.location.href = res.checkoutUrl;
    } catch (err) {
      console.error("Upgrade failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setActionLoading(true);
      const res = await apiClient("/api/billing/portal", { method: "POST" });
      window.location.href = res.url;
    } catch (err) {
      console.error("Portal failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const usagePercent =
    usage && usage.limit !== Infinity
      ? Math.min((usage.totalUsage / usage.limit) * 100, 100)
      : 0;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Billing</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Manage your subscription and usage
        </p>
      </div>

      {/* Plan card */}
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Current Plan
            </p>
            <h2 className="text-xl font-semibold text-foreground">
              {usage?.plan || "FREE"}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {usage?.plan === "FREE" && (
              <button
                onClick={handleUpgrade}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                Upgrade to PRO <ArrowUpRight size={14} />
              </button>
            )}
            <button
              onClick={handleManageBilling}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg border bg-background text-[13px] font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60"
            >
              Manage Billing
            </button>
          </div>
        </div>
      </div>

      {/* Usage card */}
      <div className="rounded-lg border bg-card p-5">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">
          Usage
        </h2>

        {loading || !usage ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                  Used
                </p>
                <p className="text-xl font-semibold tabular-nums text-foreground">
                  {usage.totalUsage}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                  Limit
                </p>
                <p className="text-xl font-semibold tabular-nums text-foreground">
                  {usage.limit === Infinity ? "∞" : usage.limit}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
                  Left
                </p>
                <p className="text-xl font-semibold tabular-nums text-foreground">
                  {usage.remaining === Infinity ? "∞" : usage.remaining}
                </p>
              </div>
            </div>

            {usage.limit !== Infinity && (
              <div>
                <div className="flex justify-between text-[12px] text-muted-foreground mb-1.5">
                  <span>{usagePercent.toFixed(0)}% used</span>
                  <span>
                    {usage.totalUsage} / {usage.limit}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usagePercent > 80 ? "bg-destructive" : "bg-primary"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
