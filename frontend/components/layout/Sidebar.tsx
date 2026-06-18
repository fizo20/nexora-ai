// frontend/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  Activity,
  BarChart3,
  Settings,
  CreditCard,
  Zap,
  Home,
  MessageSquare,
  X,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Command", href: "/dashboard/ai", icon: Bot },
  { name: "Strategy", href: "/dashboard/strategy", icon: BarChart3 },
  { name: "AI Executions", href: "/dashboard/executions", icon: Activity },
  { name: "AI Assistant", href: "/dashboard/assistant", icon: MessageSquare },
  { name: "AI Activity", href: "/dashboard/ai-activity", icon: Zap },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

/*
 * Sidebar uses --sidebar-bg / --sidebar-border / --sidebar-hover /
 * --sidebar-active tokens defined in globals.css so it is always
 * visually distinct from the content area (--background) in both
 * light and dark mode, matching ChatGPT's sidebar treatment:
 *
 *   light: sidebar #f7f7f7  vs  content #ffffff
 *   dark:  sidebar #171717  vs  content #212121
 */

interface SidebarInnerProps {
  pathname: string;
  onClose?: () => void;
  isMobile?: boolean;
}

function SidebarInner({ pathname, onClose, isMobile }: SidebarInnerProps) {
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Logo row */}
      <div className="flex items-center justify-between px-4 shrink-0 h-[52px] border-b border-sidebar">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-foreground hover:opacity-75 transition-opacity"
        >
          <div className="h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-black text-white bg-violet-600 dark:bg-violet-500 shrink-0">
            N
          </div>
          Nexora{" "}
          <span className="text-violet-600 dark:text-violet-400">AI</span>
        </Link>

        {isMobile && onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-md transition-colors text-[hsl(var(--sidebar-icon))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-px px-2 pt-3 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              style={
                active
                  ? {
                      backgroundColor: "hsl(var(--sidebar-active))",
                      color: "hsl(var(--sidebar-text-active))",
                    }
                  : undefined
              }
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-normal transition-colors",
                !active &&
                  "hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-text-active))]",
              )}
              {...(!active && {
                style: { color: "hsl(var(--sidebar-text))" },
              })}
            >
              <Icon
                size={16}
                strokeWidth={1.75}
                style={{
                  color: active ? undefined : "hsl(var(--sidebar-icon))",
                }}
                className={active ? "text-violet-600 dark:text-violet-400" : ""}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — Homepage link */}
      <div className="px-2 pb-3 pt-2 border-t border-sidebar shrink-0">
        <Link
          href="/"
          onClick={onClose}
          style={{ color: "hsl(var(--sidebar-text))" }}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] transition-colors hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-text-active))]"
        >
          <Home
            size={16}
            strokeWidth={1.75}
            style={{ color: "hsl(var(--sidebar-icon))" }}
          />
          Homepage
        </Link>
      </div>
    </>
  );
}

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 shrink-0 bg-sidebar border-sidebar border-r">
        <SidebarInner pathname={pathname} />
      </aside>

      {/* ── Mobile drawer ── */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 h-full md:hidden shadow-2xl bg-sidebar border-sidebar border-r">
            <SidebarInner pathname={pathname} onClose={onClose} isMobile />
          </aside>
        </>
      )}
    </>
  );
}
