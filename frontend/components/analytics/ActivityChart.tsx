// frontend/components/analytics/ActivityChart.tsx
import AnalyticsCard from "./AnalyticsCard";

export default function ActivityChart() {
  return (
    <AnalyticsCard title="Workspace Activity">
      <p className="text-sm text-gray-500">
        Activity tracking coming next (tasks, users, events)
      </p>
    </AnalyticsCard>
  );
}
