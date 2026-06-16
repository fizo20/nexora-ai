// frontend/app/dashboard/realtime/page.tsx
"use client";

import OnlineUsers from "@/components/realtime/OnlineUsers";

import RealtimeFeed from "@/components/realtime/RealtimeFeed";

export default function RealtimePage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Real-Time Workspace</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Monitor live collaboration activity
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <OnlineUsers />

        <RealtimeFeed />
      </div>
    </div>
  );
}
