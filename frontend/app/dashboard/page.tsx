// frontend/app/dashboard/page.tsx
import UsageBar from "@/components/dashboard/UsageBar";
import WorkspaceHealth from "@/components/dashboard/WorkspaceHealth";
import RealAnalytics from "@/components/analytics/RealAnalytics";

export default function DashboardPage() {
  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Your AI workspace at a glance
        </p>
      </div>

      <div className="space-y-5">
        <UsageBar />
        <WorkspaceHealth />
        <RealAnalytics />
      </div>
    </div>
  );
}
