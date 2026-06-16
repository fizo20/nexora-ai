"use client";

import SessionCard from "@/components/security/SessionCard";

import LoginHistoryCard from "@/components/security/LoginHistoryCard";

import { useSessions } from "@/lib/react-query/security/use-sessions";

import { useLoginHistory } from "@/lib/react-query/security/use-login-history";

import { useRevokeSession } from "@/lib/react-query/security/use-revoke-session";

import { SessionDevice, LoginHistory } from "@/types/security";

export default function SecuritySettingsPage() {
  const { data: sessionsData, isLoading: loadingSessions } = useSessions();

  const { data: historyData, isLoading: loadingHistory } = useLoginHistory();

  const revokeMutation = useRevokeSession();

  const sessions: SessionDevice[] = Array.isArray(sessionsData)
    ? sessionsData
    : [];

  const history: LoginHistory[] = Array.isArray(historyData) ? historyData : [];

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Security Settings</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Monitor sessions and account security
        </p>
      </div>

      {/* ACTIVE SESSIONS */}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Active Sessions</h2>

          <p className="text-sm text-muted-foreground">
            Devices currently logged into your account
          </p>
        </div>

        {loadingSessions && (
          <div className="text-sm text-muted-foreground">
            Loading sessions...
          </div>
        )}

        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onRevoke={(id) => revokeMutation.mutate(id)}
          />
        ))}
      </div>

      {/* LOGIN HISTORY */}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Login History</h2>

          <p className="text-sm text-muted-foreground">
            Recent authentication events
          </p>
        </div>

        {loadingHistory && (
          <div className="text-sm text-muted-foreground">
            Loading login history...
          </div>
        )}

        {history.map((item) => (
          <LoginHistoryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
