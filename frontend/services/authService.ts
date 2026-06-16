// frontend/services/authService.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  const tempToken = data?.data?.accessToken;

  if (!tempToken) {
    throw new Error("No temp token returned");
  }

  localStorage.setItem("tempToken", tempToken);

  return data;
};
/* export const login = async (email: string, password: string) => {
  const res = await fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  // ✅ FIX: correct token path
  const tempToken = data?.data?.accessToken;

  if (!tempToken) {
    console.log("LOGIN RESPONSE:", data);
    throw new Error("No temp token returned");
  }

  localStorage.setItem("tempToken", tempToken);

  return data;
}; */
