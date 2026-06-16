/* // frontend/lib/api/client.ts 
const API_BASE = "http://localhost:4000";

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const token = localStorage.getItem("accessToken");

  try {
    const isJSONRequest = options.body && typeof options.body === "string";

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...(isJSONRequest ? { "Content-Type": "application/json" } : {}),

        ...(token ? { Authorization: `Bearer ${token}` } : {}),

        ...(options.headers || {}),
      },
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      console.warn("⚠️ No JSON response");
    }

    // =========================
      // AUTH FAILURE
    //========================= 
    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tempToken");

      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      const errorCode = data?.code;

      // =========================
        // UPGRADE TRIGGER
         //========================= 
      if (
        errorCode === "UPGRADE_REQUIRED" ||
        errorCode === "AI_LIMIT_EXCEEDED" ||
        errorCode === "TRIAL_EXPIRED"
      ) {
        window.dispatchEvent(
          new CustomEvent("upgrade_required", {
            detail: data,
          }),
        );
      }

      throw new Error(data?.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("🚨 API ERROR:", error);
    throw error;
  }
};
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  if (typeof window === "undefined") {
    throw new Error("apiClient can only run in browser");
  }

  const token = localStorage.getItem("accessToken");

  try {
    const isJSONRequest = options.body && typeof options.body === "string";

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...(isJSONRequest ? { "Content-Type": "application/json" } : {}),

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options.headers || {}),
      },
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tempToken");

      window.location.href = "/login";

      return Promise.reject(new Error("Unauthorized"));
    }
    if (!response.ok) {
      const errorCode = data?.code;

      if (
        errorCode === "UPGRADE_REQUIRED" ||
        errorCode === "AI_LIMIT_EXCEEDED" ||
        errorCode === "TRIAL_EXPIRED"
      ) {
        window.dispatchEvent(
          new CustomEvent("upgrade_required", {
            detail: data,
          }),
        );
      }

      throw new Error(data?.message || "API request failed");
    }
    return data;
  } catch (error) {
    console.error("API CLIENT ERROR:", error);
    throw error;
  }
};
