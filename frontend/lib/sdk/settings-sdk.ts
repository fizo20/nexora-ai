// frontend/lib/sdk/settings-sdk.ts

import { apiClient } from "@/lib/api/client";

/* =========================
   TYPES
========================= */

export interface UpdateProfilePayload {
  name: string;
  email: string;
}

export interface UpdateWorkspacePayload {
  name: string;
}

export interface UpdateAISettingsPayload {
  temperature: number;
  model?: string;
}

export interface UpdateNotificationPayload {
  emailNotifications: boolean;
}

/* =========================
   SDK
========================= */

export const settingsSdk = {
  /* =========================
     PROFILE
  ========================= */

  async getProfile() {
    return apiClient("/api/settings/profile");
  },

  async updateProfile(payload: UpdateProfilePayload) {
    return apiClient("/api/settings/profile", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /* =========================
     WORKSPACE
  ========================= */

  async updateWorkspace(payload: UpdateWorkspacePayload) {
    return apiClient("/api/settings/workspace", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /* =========================
     AI SETTINGS
  ========================= */

  async getAISettings() {
    return apiClient("/api/settings/ai");
  },

  async updateAISettings(payload: UpdateAISettingsPayload) {
    return apiClient("/api/settings/ai", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /* =========================
     NOTIFICATIONS
  ========================= */

  async getNotifications() {
    return apiClient("/api/settings/notifications");
  },

  async updateNotifications(payload: UpdateNotificationPayload) {
    return apiClient("/api/settings/notifications", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /* =========================
     API KEYS
  ========================= */

  async generateApiKey() {
    return apiClient("/api/settings/api-keys", {
      method: "POST",
    });
  },

  async getApiKeys() {
    return apiClient("/api/settings/api-keys");
  },
};
