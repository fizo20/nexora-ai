// frontend/components/activity/ActivityBadge.tsx

import { ActivityType } from "@/types/activity";

interface Props {
  type: ActivityType;
}

export default function ActivityBadge({ type }: Props) {
  const styles: Record<ActivityType, string> = {
    AUDIT: "bg-blue-500/10 text-blue-500",

    AI: "bg-purple-500/10 text-purple-500",

    SECURITY: "bg-red-500/10 text-red-500",

    BILLING: "bg-green-500/10 text-green-500",

    TEAM: "bg-orange-500/10 text-orange-500",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${styles[type]}`}
    >
      {type}
    </span>
  );
}
