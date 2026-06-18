// frontend/app/dashboard/settings/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const links = [
  { name: "Profile", href: "/dashboard/settings/profile" },
  { name: "Workspace", href: "/dashboard/settings/workspace" },
  { name: "AI", href: "/dashboard/settings/ai" },
  { name: "Notifications", href: "/dashboard/settings/notifications" },
  { name: "Billing", href: "/dashboard/settings/billing" },
  { name: "Team", href: "/dashboard/settings/team" },
  { name: "Security", href: "/dashboard/settings/security" },
  { name: "API Keys", href: "/dashboard/settings/api-keys" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const active = links.find((l) => pathname === l.href);

  return (
    <div className="flex flex-col md:flex-row min-h-screen gap-0">
      {/* Mobile nav — dropdown */}
      <div className="md:hidden border-b border-sidebar bg-sidebar px-4 py-3">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-sidebar text-[14px] font-medium text-foreground bg-sidebar"
        >
          <span>{active?.name || "Settings"}</span>
          <ChevronDown
            size={16}
            className={`text-muted-foreground transition-transform ${
              mobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {mobileOpen && (
          <div className="mt-2 rounded-lg border border-sidebar bg-card shadow-sm overflow-hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 text-[13px] transition-colors border-b border-sidebar last:border-b-0 ${
                  pathname === link.href
                    ? "bg-[hsl(var(--sidebar-active))] text-foreground font-medium"
                    : "text-muted-foreground hover:bg-[hsl(var(--sidebar-hover))] hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Desktop sidebar — matches main Sidebar bg */}
      <aside className="hidden md:block w-52 shrink-0 border-r border-sidebar bg-sidebar">
        <div className="px-4 py-4 border-b border-sidebar">
          <h2 className="text-[13px] font-semibold text-foreground">
            Settings
          </h2>
        </div>
        <nav className="p-2 space-y-px">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={
                pathname === link.href
                  ? {
                      backgroundColor: "hsl(var(--sidebar-active))",
                      color: "hsl(var(--sidebar-text-active))",
                    }
                  : { color: "hsl(var(--sidebar-text))" }
              }
              className={`block rounded-md px-3 py-[7px] text-[13px] transition-colors ${
                pathname === link.href
                  ? "font-medium"
                  : "hover:bg-[hsl(var(--sidebar-hover))] hover:text-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content — sits on main --background, not sidebar bg */}
      <main className="flex-1 p-4 sm:p-6 min-w-0 bg-background">
        {children}
      </main>
    </div>
  );
}
