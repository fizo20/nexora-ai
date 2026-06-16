// frontend/lib/sdk/auth.sdk.ts
import { sdkClient } from "./client";
import { ApiResponse, User } from "./types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const authSDK = {
  login: (payload: LoginPayload) =>
    sdkClient<ApiResponse<LoginResponse>>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => sdkClient<ApiResponse<User>>("/api/auth/me"),
};
