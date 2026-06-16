"use client";

import { useEffect, useState } from "react";

import { settingsSdk } from "@/lib/sdk/settings-sdk";

export default function NotificationSettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await settingsSdk.getNotifications();

        if (data?.data) {
          setEmailNotifications(Boolean(data.data.emailNotifications));
        }
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);

      await settingsSdk.updateNotifications({
        emailNotifications,
      });

      alert("Notification settings updated");
    } catch (error) {
      console.error(error);

      alert("Failed to update notifications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notification Settings</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Manage notifications
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium">Email Notifications</h2>

            <p className="text-sm text-muted-foreground">
              Receive email updates and alerts
            </p>
          </div>

          <input
            title="notifications"
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
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
