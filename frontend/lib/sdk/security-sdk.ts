// frontend/lib/sdk/security-sdk.ts
import { apiClient } from "@/lib/api/client";
import { SessionDevice, LoginHistory } from "@/types/security";

// FIX: The original SDK returned the raw API response object { success, data }.
// The security page then did `Array.isArray(sessionsData)` on the whole object,
// which is always false — so sessions and history always rendered as empty arrays
// even if the API responded successfully.
// The SDK is the right place to unwrap .data (consistent with userSdk pattern).

export const securitySdk = {
  async getSessions(): Promise<SessionDevice[]> {
    const res = await apiClient("/api/security/sessions");
    return res?.data ?? [];
  },

  async revokeSession(sessionId: string): Promise<void> {
    await apiClient(`/api/security/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },

  async getLoginHistory(): Promise<LoginHistory[]> {
    const res = await apiClient("/api/security/login-history");
    return res?.data ?? [];
  },
};
