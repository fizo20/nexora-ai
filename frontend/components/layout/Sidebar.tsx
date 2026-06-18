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

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <aside className="w-60 h-full border-r bg-background flex flex-col">
      {/* Logo + close button (mobile only) */}
      <div className="flex items-center justify-between px-5 py-[18px] border-b">
        <Link
          href="/"
          onClick={onClose}
          className="text-[15px] font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity"
        >
          Nexora <span className="text-primary">AI</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
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
              className={`flex items-center gap-2.5 px-3 py-[7px] rounded-md text-[13px] font-medium transition-colors ${
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <Icon size={15} className={active ? "text-primary" : ""} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-3 pt-2 border-t">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-[7px] rounded-md text-[13px] text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
        >
          <Home size={15} />
          Homepage
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar — overlay drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 h-full md:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
