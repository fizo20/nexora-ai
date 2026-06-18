// frontend/components/layout/Topbar.tsx
"use client";

import Link from "next/link";
import { Home, Menu } from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="h-[52px] border-b bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <span className="text-[13px] text-muted-foreground font-medium hidden sm:block">
          AI Workspace Intelligence
        </span>

        {/* Brand name on mobile when there's no sidebar visible */}
        <span className="text-[14px] font-semibold text-foreground md:hidden">
          Nexora <span className="text-primary">AI</span>
        </span>
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
