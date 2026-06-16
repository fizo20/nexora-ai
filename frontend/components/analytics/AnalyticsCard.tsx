// frontend/components/analytics/AnalyticsCard.tsx
interface Props {
  title: string;
  children: React.ReactNode;
}

export default function AnalyticsCard({ title, children }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 mb-4">{title}</h2>

      {children}
    </div>
  );
}
