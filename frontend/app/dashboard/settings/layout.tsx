// frontend/app/dashboard/settings/layout.tsx
/* import SettingsSidebar from "@/components/settings/settings-sidebar"; */

/* export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <SettingsSidebar />

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
} */

// frontend/app/dashboard/settings/layout.tsx

import Link from "next/link";

const links = [
  {
    name: "Profile",
    href: "/dashboard/settings/profile",
  },
  {
    name: "Workspace",
    href: "/dashboard/settings/workspace",
  },
  {
    name: "AI",
    href: "/dashboard/settings/ai",
  },
  {
    name: "Notifications",
    href: "/dashboard/settings/notifications",
  },
  {
    name: "Billing",
    href: "/dashboard/settings/billing",
  },
  {
    name: "Team",
    href: "/dashboard/settings/team",
  },
  {
    name: "Security",
    href: "/dashboard/settings/security",
  },
  {
    name: "API Keys",
    href: "/dashboard/settings/api-keys",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <aside className="w-64 border-r bg-background p-6">
        <h2 className="mb-6 text-xl font-bold">Settings</h2>

        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
