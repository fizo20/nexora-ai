// frontend/app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { useUpgradeListener } from "@/hooks/useUpgradeListener";
import { ArrowUpRight, X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  type UpgradeData = {
    currentPlan: "FREE" | "PRO" | "ENTERPRISE";
    upgradeTo: "PRO" | "ENTERPRISE";
  };

  const [upgradeData, setUpgradeData] = useState<UpgradeData | null>(null);

  useUpgradeListener((data) => {
    setUpgradeData(data);
  });

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Topbar />
        <main className="p-6 flex-1">{children}</main>
      </div>

      {/* Upgrade modal */}
      {upgradeData && (
        <div className="fixed inset-0 bg-foreground/20 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground border rounded-xl w-full max-w-sm shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">Upgrade your plan</h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  You&apos;ve reached the limit of your <strong className="text-foreground">{upgradeData.currentPlan}</strong> plan
                </p>
              </div>
              <button
                onClick={() => setUpgradeData(null)}
                className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors ml-3"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              <div className="rounded-lg bg-muted p-4 text-[13px]">
                <p className="font-medium text-foreground mb-2">
                  Upgrade to <span className="text-primary">{upgradeData.upgradeTo}</span> to unlock:
                </p>
                <ul className="space-y-1.5 text-muted-foreground">
                  {["More AI requests", "Faster responses", "Advanced AI features"].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-primary">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-[14px] font-semibold hover:opacity-90 transition-opacity"
                onClick={() => { window.location.href = "/dashboard/billing"; }}
              >
                Upgrade Now <ArrowUpRight size={15} />
              </button>

              <button
                className="w-full text-[13px] text-muted-foreground hover:text-foreground transition-colors py-1"
                onClick={() => setUpgradeData(null)}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
