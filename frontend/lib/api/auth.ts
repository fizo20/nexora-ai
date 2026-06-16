// frontend/lib/api/auth.ts
import { apiClient } from "./client";

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  return apiClient("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  return apiClient("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
