// frontend/components/analytics/SeatAnalytics.tsx
"use client";

import AnalyticsCard from "./AnalyticsCard";

import { useWorkspaceMetrics } from "@/hooks/useWorkspaceMetrics";

export default function SeatAnalytics() {
  const { data } = useWorkspaceMetrics();

  if (!data) return null;

  return (
    <AnalyticsCard title="Seat Analytics">
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Members</span>

          <span>{data.seats.members}</span>
        </div>

        <div className="flex justify-between">
          <span>Pending Invites</span>

          <span>{data.seats.pendingInvites}</span>
        </div>

        <div className="flex justify-between font-semibold">
          <span>Total Seats</span>

          <span>{data.seats.total}</span>
        </div>
      </div>
    </AnalyticsCard>
  );
}
