// frontend/components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

// ── Declared OUTSIDE Sidebar so React never recreates it on render ──
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
      <div className="flex items-center justify-between px-5 py-[18px] border-b border-gray-200 dark:border-gray-800 shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity"
        >
          Nexora{" "}
          <span className="text-violet-600 dark:text-violet-400">AI</span>
        </Link>

        {/* Close button — mobile only */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            aria-label="Close menu"
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
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
                active
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              <Icon
                size={15}
                className={
                  active
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-500 dark:text-gray-500"
                }
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom link */}
      <div className="px-2 pb-3 pt-2 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Home size={15} className="text-gray-500 dark:text-gray-500" />
          Homepage
        </Link>
      </div>
    </>
  );
}

// ── Main export ──────────────────────────────────────────────────────
interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar — always visible, sticky */}
      <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#15171e]">
        <SidebarInner pathname={pathname} />
      </aside>

      {/* Mobile sidebar — overlay drawer with solid opaque background */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 h-full md:hidden bg-white dark:bg-[#15171e] border-r border-gray-200 dark:border-gray-800 shadow-2xl">
            <SidebarInner pathname={pathname} onClose={onClose} isMobile />
          </aside>
        </>
      )}
    </>
  );
}
