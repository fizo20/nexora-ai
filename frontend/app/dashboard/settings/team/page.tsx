// frontend/app/dashboard/settings/team/page.tsx
"use client";

import { useState } from "react";

export default function TeamSettingsPage() {
  const [email, setEmail] = useState("");

  const inviteMember = async () => {
    alert(`Invite sent to ${email}`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Team Settings</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Invite and manage team members
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <label htmlFor="invite-email" className="text-sm font-medium">
            Invite Team Member
          </label>

          <div className="flex gap-2 mt-2">
            <input
              id="invite-email"
              type="email"
              placeholder="member@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border px-3 py-2 bg-background"
            />

            <button
              onClick={inviteMember}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Invite
            </button>
          </div>
        </div>

        <div className="border-t pt-5">
          <h2 className="font-medium mb-3">Team Members</h2>

          <div className="space-y-3">
            <div className="rounded-lg border p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">Admin User</div>

                <div className="text-sm text-muted-foreground">
                  admin@nexora.ai
                </div>
              </div>

              <span className="text-xs rounded bg-accent px-2 py-1">OWNER</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
