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

/*
 * Dark mode sidebar palette:
 *   bg:           #1c1f2e  — cool navy-dark, clearly distinct from page (#15171e)
 *   border:       #2a2d3e  — subtle separator, just visible
 *   nav hover:    #252840  — slightly lighter navy on hover
 *   nav active:   #2e3252  — richer navy-violet for active item
 *   active icon:  violet-400 — matches primary accent
 *   text active:  #e8eaf6  — near-white with a cool tint
 *   text default: #8b8fa8  — muted blue-grey, readable not harsh
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
      <div
        className="
          flex items-center justify-between px-5 shrink-0
          h-[52px]
          border-b border-gray-200 dark:border-[#2a2d3e]
        "
      >
        <Link
          href="/"
          onClick={onClose}
          className="
            text-[15px] font-semibold tracking-tight
            text-gray-900 dark:text-[#e8eaf6]
            hover:opacity-80 transition-opacity
          "
        >
          Nexora{" "}
          <span className="text-violet-600 dark:text-violet-400">AI</span>
        </Link>

        {isMobile && onClose && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="
              p-1.5 rounded-md transition-colors
              text-gray-500 hover:bg-gray-100 hover:text-gray-900
              dark:text-[#8b8fa8] dark:hover:bg-[#252840] dark:hover:text-[#e8eaf6]
            "
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 px-2 pt-3 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-2.5 px-3 py-2 rounded-md
                text-[13px] font-medium transition-colors
                ${
                  active
                    ? "bg-gray-100 text-gray-900 dark:bg-[#2e3252] dark:text-[#e8eaf6]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-[#8b8fa8] dark:hover:bg-[#252840] dark:hover:text-[#e8eaf6]"
                }
              `}
            >
              <Icon
                size={15}
                className={
                  active
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-400 dark:text-[#6b6f85]"
                }
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — Homepage link */}
      <div className="px-2 pb-3 pt-2 border-t border-gray-200 dark:border-[#2a2d3e] shrink-0">
        <Link
          href="/"
          onClick={onClose}
          className="
            flex items-center gap-2.5 px-3 py-2 rounded-md
            text-[13px] transition-colors
            text-gray-500 hover:bg-gray-100 hover:text-gray-900
            dark:text-[#8b8fa8] dark:hover:bg-[#252840] dark:hover:text-[#e8eaf6]
          "
        >
          <Home size={15} className="text-gray-400 dark:text-[#6b6f85]" />
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
      <aside
        className="
          hidden md:flex flex-col
          w-60 h-screen sticky top-0 shrink-0
          bg-white dark:bg-[#1c1f2e]
          border-r border-gray-200 dark:border-[#2a2d3e]
        "
      >
        <SidebarInner pathname={pathname} />
      </aside>

      {/* ── Mobile drawer ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside
            className="
              fixed inset-y-0 left-0 z-50
              flex flex-col w-72 h-full
              md:hidden shadow-2xl
              bg-white dark:bg-[#1c1f2e]
              border-r border-gray-200 dark:border-[#2a2d3e]
            "
          >
            <SidebarInner pathname={pathname} onClose={onClose} isMobile />
          </aside>
        </>
      )}
    </>
  );
}
