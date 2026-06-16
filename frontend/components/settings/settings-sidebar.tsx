// frontend/components/settings/settings-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Key,
  Users,
  BrainCircuit,
} from "lucide-react";

const items = [
  { title: "Profile", href: "/settings/profile", icon: User },
  { title: "Workspace", href: "/settings/workspace", icon: Building2 },
  { title: "Billing", href: "/settings/billing", icon: CreditCard },
  { title: "AI Settings", href: "/settings/ai", icon: BrainCircuit },
  { title: "Notifications", href: "/settings/notifications", icon: Bell },
  { title: "Security", href: "/settings/security", icon: Shield },
  { title: "API Keys", href: "/settings/api-keys", icon: Key },
  { title: "Team", href: "/settings/team", icon: Users },
];

export default function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-52 border-r bg-background shrink-0">
      <div className="px-4 py-3 border-b">
        <h2 className="text-[13px] font-semibold text-foreground">Settings</h2>
      </div>

      <nav className="p-2 space-y-px">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-[7px] text-[13px] transition-colors ${
                active
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              }`}
            >
              <Icon className="h-[14px] w-[14px] shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
