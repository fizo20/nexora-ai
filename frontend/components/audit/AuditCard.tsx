// frontend/components/audit/AuditCard.tsx

interface Props {
  title: string;

  description?: string;

  timestamp: string;

  metadata?: Record<string, unknown>;
}

export default function AuditCard({
  title,
  description,
  timestamp,
  metadata,
}: Props) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-medium">{title}</h3>

          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(timestamp).toLocaleString()}
        </span>
      </div>

      {metadata && (
        <pre className="mt-4 overflow-auto rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      )}
    </div>
  );
}
