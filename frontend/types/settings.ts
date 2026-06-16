// frontend/types/settings.ts

export interface UserProfileSettings {
  name: string;
  email: string;
  avatar?: string;
}

export interface WorkspaceSettings {
  name: string;
  slug: string;
}

export interface AISettings {
  model: string;
  temperature: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  marketingEmails: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
}
