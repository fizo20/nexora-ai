// frontend/components/ui/dashboard-card.tsx
export default function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </div>
      <div className="text-xl font-semibold text-foreground">{children}</div>
    </div>
  );
}
