// frontend/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { switchWorkspace } from "@/services/workspaceService";
import ThemeToggle from "@/components/ui/theme-toggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    try {
      setLoading(true);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tempToken");

      const registerRes = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const registerData = await registerRes.json();
      if (!registerRes.ok) throw new Error(registerData.message || "Registration failed");

      const tempToken = registerData?.data?.accessToken;
      if (!tempToken) throw new Error("No token returned from registration");
      localStorage.setItem("tempToken", tempToken);

      const workspaceRes = await fetch(`${API_URL}/api/workspaces`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tempToken}` },
        body: JSON.stringify({ name: `${name.trim()}'s Workspace` }),
      });
      const workspaceData = await workspaceRes.json();
      if (!workspaceRes.ok) throw new Error(workspaceData.message || "Failed to create workspace");

      const workspaceId = workspaceData?.data?._id || workspaceData?.data?.workspace?._id || workspaceData?.data?.workspace;
      if (!workspaceId) throw new Error("No workspace ID returned");

      await switchWorkspace(workspaceId);
      localStorage.removeItem("tempToken");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/" className="text-[15px] font-semibold tracking-tight hover:opacity-80 transition-opacity">
          Nexora <span className="text-primary">AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            ← Home
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[360px] space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="text-[14px] text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3 text-[13px] text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {[
              { label: "Full name", type: "text", value: name, set: setName, placeholder: "Jane Smith" },
              { label: "Email", type: "email", value: email, set: setEmail, placeholder: "you@company.com" },
              { label: "Password", type: "password", value: password, set: setPassword, placeholder: "Min 8 characters" },
            ].map(({ label, type, value, set, placeholder }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-[13px] font-medium text-foreground">{label}</label>
                <input
                  type={type}
                  className="w-full px-3 py-2.5 rounded-lg border bg-background text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => type === "password" && e.key === "Enter" && handleRegister()}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p className="text-[12px] text-center text-muted-foreground">
            By signing up you agree to our{" "}
            <a href="#" className="hover:text-foreground underline underline-offset-2">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}
