// frontend/components/security/LoginHistoryCard.tsx

import { LoginHistory } from "@/types/security";

interface Props {
  item: LoginHistory;
}

export default function LoginHistoryCard({ item }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium">
            {item.success ? "Successful Login" : "Failed Login"}
          </h3>

          <p className="text-sm text-muted-foreground">{item.userAgent}</p>

          <p className="text-xs text-muted-foreground">IP: {item.ipAddress}</p>
        </div>

        <span className="text-xs text-muted-foreground">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
