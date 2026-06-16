// frontend/app/dashboard/settings/workspace/page.tsx
// This is a placeholder page for the workspace settings. You can replace this with your actual workspace settings component.

"use client";

import { useState } from "react";

import { useWorkspace } from "@/providers/workspace-provider";

import { settingsSdk } from "@/lib/sdk/settings-sdk";

export default function WorkspaceSettingsPage() {
  const { workspace } = useWorkspace();

  const [name, setName] = useState(workspace?.name || "");

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      await settingsSdk.updateWorkspace({
        name,
      });

      alert("Workspace updated");
    } catch (error) {
      console.error(error);

      alert("Failed to update workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Workspace Settings</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Manage workspace configuration
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <label htmlFor="workspace-name" className="text-sm font-medium">
            Workspace Name
          </label>

          <input
            id="workspace-name"
            placeholder="Enter workspace name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2 bg-background"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
