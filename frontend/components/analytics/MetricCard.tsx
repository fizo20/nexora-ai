// frontend/components/analytics/MetricCard.tsx
interface Props {
  title: string;
  value: string | number;
  description?: string;
  trend?: { value: number; label: string };
}

export default function MetricCard({ title, value, description, trend }: Props) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
        {title}
      </p>
      <h3 className="text-3xl font-bold tabular-nums text-foreground tracking-tight">
        {value}
      </h3>
      {description && (
        <p className="text-[12px] text-muted-foreground mt-1.5">{description}</p>
      )}
      {trend && (
        <p className={`text-[12px] mt-2 font-medium ${trend.value >= 0 ? "text-success" : "text-destructive"}`}>
          {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}
