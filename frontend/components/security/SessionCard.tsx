// frontend/components/security/SessionCard.tsx

import { SessionDevice } from "@/types/security";

interface Props {
  session: SessionDevice;

  onRevoke: (id: string) => void;
}

export default function SessionCard({ session, onRevoke }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-medium">
            {session.current ? "Current Session" : "Active Session"}
          </h3>

          <p className="text-sm text-muted-foreground">{session.userAgent}</p>

          <p className="text-xs text-muted-foreground">
            IP: {session.ipAddress}
          </p>

          <p className="text-xs text-muted-foreground">
            Last Active: {new Date(session.lastActiveAt).toLocaleString()}
          </p>
        </div>

        {!session.current && (
          <button
            onClick={() => onRevoke(session.id)}
            className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
          >
            Revoke
          </button>
        )}
      </div>
    </div>
  );
}
