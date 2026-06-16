// frontend/app/dashboard/settings/page.tsx
import Link from "next/link";
import {
  User, Building2, CreditCard, Bell, Shield, Key, Users, BrainCircuit
} from "lucide-react";

const settingsItems = [
  { title: "Profile", description: "Your name, avatar, and account details", href: "/dashboard/settings/profile", icon: User },
  { title: "Workspace", description: "Manage workspace preferences and branding", href: "/dashboard/settings/workspace", icon: Building2 },
  { title: "AI Configuration", description: "Configure AI behavior and model selection", href: "/dashboard/settings/ai", icon: BrainCircuit },
  { title: "Notifications", description: "Email, push, and in-app notification rules", href: "/dashboard/settings/notifications", icon: Bell },
  { title: "API Keys", description: "Generate and revoke developer API keys", href: "/dashboard/settings/api-keys", icon: Key },
  { title: "Billing", description: "Subscription, invoices, and payment methods", href: "/dashboard/settings/billing", icon: CreditCard },
  { title: "Team", description: "Invite members and manage permissions", href: "/dashboard/settings/team", icon: Users },
  { title: "Security", description: "Password, sessions, and two-factor auth", href: "/dashboard/settings/security", icon: Shield },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Manage your workspace, account, and AI configuration
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-3 rounded-lg border bg-card p-4 hover:bg-accent/40 transition-colors group"
            >
              <div className="mt-0.5 p-2 rounded-md bg-muted group-hover:bg-background transition-colors">
                <Icon size={14} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-[14px] font-medium text-foreground">{item.title}</h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
