// frontend/app/dashboard/settings/billing/page.tsx
"use client";

import PermissionGuard from "@/components/rbac/PermissionGuard";

import { useWorkspace } from "@/providers/workspace-provider";

export default function BillingSettingsPage() {
  const { workspace } = useWorkspace();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing Settings</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage subscriptions and billing
        </p>
      </div>

      <div className="space-y-5 rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Current Plan</h2>

            <p className="text-sm text-muted-foreground">
              You are currently on the FREE plan
            </p>
          </div>

          <PermissionGuard
            role={workspace?.role || "VIEWER"}
            permission="manageBilling"
          >
            <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
              Upgrade
            </button>
          </PermissionGuard>
        </div>

        <div className="border-t pt-5">
          <h3 className="mb-2 font-medium">Usage</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>AI Requests</span>

              <span>120 / 500</span>
            </div>

            <div className="flex justify-between">
              <span>Storage</span>

              <span>1.2GB / 5GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
