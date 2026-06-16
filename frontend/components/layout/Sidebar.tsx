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

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-60 h-screen border-r bg-background flex flex-col sticky top-0 shrink-0">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-[18px] border-b"
      >
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Nexora <span className="text-primary">AI</span>
        </span>
      </Link>

      {/* Nav links */}
      <nav className="flex flex-col gap-px px-2 pt-3 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-[7px] rounded-md text-[13px] font-medium transition-colors ${
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <Icon
                size={15}
                className={active ? "text-primary" : ""}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom pinned link */}
      <div className="px-2 pb-3 pt-2 border-t">
        <Link
          href="/"
          className="flex items-center gap-2.5 px-3 py-[7px] rounded-md text-[13px] text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
        >
          <Home size={15} />
          Homepage
        </Link>
      </div>
    </aside>
  );
}
