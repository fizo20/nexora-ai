// frontend/components/layout/Topbar.tsx
"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";

export default function Topbar() {
  return (
    <header className="h-[52px] border-b bg-background flex items-center justify-between px-5 shrink-0">
      <div className="text-[13px] text-muted-foreground font-medium">
        AI Workspace Intelligence
      </div>

      <div className="flex items-center gap-1">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Go to homepage"
        >
          <Home size={14} />
          <span className="hidden sm:inline">Home</span>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
