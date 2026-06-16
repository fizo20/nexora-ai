// frontend/components/realtime/OnlineUsers.tsx

"use client";

import { useRealtime } from "@/providers/realtime-provider";

export default function OnlineUsers() {
  const { presence, connected } = useRealtime();

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Workspace Presence</h3>

          <p className="text-sm text-muted-foreground">
            Real-time workspace activity
          </p>
        </div>

        <div
          className={`h-2.5 w-2.5 rounded-full ${
            connected ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </div>

      <div className="mt-4 space-y-3">
        {presence.length === 0 && (
          <div className="text-sm text-muted-foreground">No active users</div>
        )}

        {presence.map((user) => (
          <div key={user.userId} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user.name}</p>

              <p className="text-xs text-muted-foreground">{user.status}</p>

              {user.lastSeen && (
                <p className="text-xs text-muted-foreground">
                  {new Date(user.lastSeen).toLocaleTimeString()}
                </p>
              )}
            </div>

            <div
              className={`h-2 w-2 rounded-full ${
                user.status === "online"
                  ? "bg-green-500"
                  : user.status === "away"
                  ? "bg-yellow-500"
                  : "bg-gray-400"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
