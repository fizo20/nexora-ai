// frontend/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/services/authService";
import { switchWorkspace } from "@/services/workspaceService";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      setLoading(true);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("tempToken");

      const loginData = await login(email, password);
      console.log("✅ LOGIN SUCCESS", loginData);

      const token = localStorage.getItem("tempToken");

      const wsRes = await fetch("http://localhost:4000/api/workspaces", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const wsData = await wsRes.json();

      if (!wsRes.ok) throw new Error(wsData.message || "Failed to fetch workspaces");
      if (!Array.isArray(wsData?.data) || wsData.data.length === 0) {
        throw new Error("No workspace found");
      }

      const firstWorkspace = wsData.data[0];
      const workspaceId =
        firstWorkspace?._id ||
        firstWorkspace?.workspace?._id ||
        firstWorkspace?.workspace;

      if (!workspaceId) throw new Error("No workspace ID found");

      await switchWorkspace(workspaceId);
      localStorage.removeItem("tempToken");

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Topbar */}
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

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[360px] space-y-6">
          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-[14px] text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Sign up free
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3 text-[13px] text-destructive">
              {error}
            </div>
          )}

          {/* Fields */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2.5 rounded-lg border bg-background text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-foreground">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2.5 rounded-lg border bg-background text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-[12px] text-center text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="#" className="hover:text-foreground transition-colors underline underline-offset-2">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="hover:text-foreground transition-colors underline underline-offset-2">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
