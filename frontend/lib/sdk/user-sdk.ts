// frontend/lib/sdk/user-sdk.ts

import { apiClient } from "@/lib/api/client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string | null;
  createdAt?: string;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
}

export const userSdk = {
  async getProfile(): Promise<UserProfileResponse> {
    return apiClient("/api/users/me");
  },

  async updateProfile(payload: {
    name: string;
    email: string;
  }): Promise<UserProfileResponse> {
    return apiClient("/api/users/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
