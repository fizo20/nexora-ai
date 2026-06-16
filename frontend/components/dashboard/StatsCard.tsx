// frontend/components/dashboard/StatsCard.tsx
interface Props {
  title: string;
  value: string | number;
  accent?: boolean;
}

export default function StatsCard({ title, value, accent }: Props) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </div>
      <div className={`text-2xl font-semibold tabular-nums ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}
