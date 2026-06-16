// frontend/lib/sdk/ai-activity-sdk.ts

import { apiClient } from "@/lib/api/client";

export interface AIActivity {
  _id: string;

  type: string;

  message: string;

  metadata?: Record<string, unknown>;

  createdAt: string;
}

export const aiActivitySdk = {
  async getProjectActivity(projectId: string): Promise<AIActivity[]> {
    const res = await apiClient(`/api/ai/activity?projectId=${projectId}`);

    return res.data || [];
  },
};
