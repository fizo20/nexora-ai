// frontend/app/dashboard/billing/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

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

  /* =========================
FETCH BILLING DATA
========================= */
  const fetchBilling = async () => {
    try {
      const res = await apiClient("/api/billing/usage");

      const usageArray = res?.usage || [];

      const totalUsage = usageArray.reduce(
        (sum: number, item: { total: number }) => sum + item.total,
        0,
      );

      // 🔥 GET PLAN FROM BACKEND TOKEN OR WORKSPACE

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

  /* =========================
UPGRADE PLAN
========================= */
  const handleUpgrade = async () => {
    try {
      setActionLoading(true);

      const res = await apiClient("/api/billing/upgrade", {
        method: "POST",
        body: JSON.stringify({ targetPlan: "PRO" }),
      });

      // ✅ FIX: correct response shape
      window.location.href = res.checkoutUrl;
    } catch (err) {
      console.error("Upgrade failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================
STRIPE PORTAL
========================= */
  const handleManageBilling = async () => {
    try {
      setActionLoading(true);

      const res = await apiClient("/api/billing/portal", {
        method: "POST",
      });

      // ✅ FIX: correct response shape
      window.location.href = res.url;
    } catch (err) {
      console.error("Portal failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================
UI
========================= */

  return (
    <div className="p-6 space-y-6">
      {" "}
      <h1 className="text-xl font-semibold">💰 Billing Dashboard</h1>
      {/* PLAN CARD */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p className="text-sm text-zinc-400">Current Plan</p>

        <h2 className="text-lg font-semibold">{usage?.plan || "FREE"}</h2>

        <div className="flex gap-3 mt-3">
          {usage?.plan === "FREE" && (
            <button
              onClick={handleUpgrade}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
            >
              Upgrade to PRO 🚀
            </button>
          )}

          <button
            onClick={handleManageBilling}
            disabled={actionLoading}
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm"
          >
            Manage Billing
          </button>
        </div>
      </div>
      {/* USAGE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-3">📊 Usage</h2>

        {loading || !usage ? (
          <p className="text-zinc-400 text-sm">Loading...</p>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Total Usage</span>
              <span>{usage.totalUsage}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Limit</span>
              <span>
                {usage.limit === Infinity ? "Unlimited" : usage.limit}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span>Remaining</span>
              <span>
                {usage.remaining === Infinity ? "∞" : usage.remaining}
              </span>
            </div>

            {/* 🔥 PROGRESS BAR */}
            {usage.limit !== Infinity && (
              <div className="w-full bg-zinc-800 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (usage.totalUsage / usage.limit) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
