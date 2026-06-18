// frontend/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/theme-toggle";

const FEED_ITEMS = [
  {
    type: "create_task",
    msg: 'Created "Q3 Product Roadmap" · MEDIUM priority',
  },
  {
    type: "autonomous_cycle",
    msg: "Autonomous check complete — 0 actions needed",
  },
  {
    type: "create_task",
    msg: 'Created "Follow-up: Customer onboarding" · HIGH priority',
  },
  { type: "skipped", msg: 'Skipped duplicate "Weekly standup notes"' },
  {
    type: "autonomous_cycle",
    msg: "AI scan started — analyzing 14 open tasks",
  },
  {
    type: "create_task",
    msg: 'Created "Fix auth token refresh bug" · HIGH priority',
  },
  {
    type: "autonomous_cycle",
    msg: "Autonomous check complete — 1 task created",
  },
  { type: "skipped", msg: 'Skipped duplicate "Untitled task"' },
];

const TYPE_STYLES: Record<string, { dot: string; label: string }> = {
  create_task: { dot: "bg-emerald-400", label: "TASK" },
  autonomous_cycle: { dot: "bg-violet-400", label: "CYCLE" },
  skipped: { dot: "bg-amber-400", label: "SKIP" },
};

function AgentFeed() {
  const [visible, setVisible] = useState<number[]>([0]);

  useEffect(() => {
    let i = 1;
    const id = setInterval(() => {
      setVisible((prev) => [...prev, i % FEED_ITEMS.length].slice(-5));
      i++;
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative rounded-2xl border border-border bg-card p-4 sm:p-5 font-mono text-xs overflow-hidden min-h-[200px]">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-2 text-muted-foreground text-[10px] tracking-widest uppercase">
          nexora-agent · live
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-emerald-500 text-[10px]">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          running
        </span>
      </div>

      <div className="space-y-2.5">
        {visible.map((idx, pos) => {
          const item = FEED_ITEMS[idx];
          const style = TYPE_STYLES[item.type] ?? TYPE_STYLES.autonomous_cycle;
          const isNew = pos === visible.length - 1;
          return (
            <div
              key={`${idx}-${pos}`}
              className="flex items-start gap-2.5 transition-all duration-500"
              style={{ opacity: isNew ? 1 : 0.45 + pos * 0.12 }}
            >
              <span
                className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`}
              />
              <span className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold tracking-widest bg-muted text-primary">
                {style.label}
              </span>
              <span className="text-muted-foreground leading-relaxed break-words min-w-0">
                {item.msg}
              </span>
            </div>
          );
        })}
        <div className="flex items-center gap-1.5 text-muted-foreground/30 pt-1">
          <span className="animate-pulse">▋</span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-2xl bg-gradient-to-t from-card to-transparent" />
    </div>
  );
}

function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border">
      <span className="text-foreground font-black tracking-tight text-[15px]">
        Nexora <span className="text-primary">AI</span>
      </span>

      <div className="hidden sm:flex items-center gap-6 text-[13px] text-muted-foreground">
        <a href="#features" className="hover:text-foreground transition-colors">
          Features
        </a>
        <a href="#pricing" className="hover:text-foreground transition-colors">
          Pricing
        </a>
        <a href="#about" className="hover:text-foreground transition-colors">
          About
        </a>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          href="/login"
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 hidden sm:block"
        >
          Log in
        </Link>
        <Link
          href="/register"
          className="text-[13px] font-semibold px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
}

const FEATURES = [
  {
    icon: "⚡",
    title: "Autonomous task creation",
    body: "The AI agent scans your workspace on a schedule, creates tasks it detects are missing, and skips duplicates automatically. No prompting required.",
  },
  {
    icon: "📊",
    title: "Enterprise analytics",
    body: "Real-time dashboards across AI execution telemetry, task health, seat usage, and workspace productivity — all in one place.",
  },
  {
    icon: "🔐",
    title: "Security & session control",
    body: "Full session management, login history, and role-based permissions so your team stays in control of who sees what.",
  },
  {
    icon: "🔌",
    title: "API-first architecture",
    body: "Every feature is accessible via a clean REST API. Build internal tools, embed Nexora into your own products, or automate workflows.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "For individuals and small teams exploring AI-assisted work.",
    features: [
      "1 workspace",
      "Up to 3 team members",
      "100 AI executions / month",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get started free",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$5",
    period: "per seat / month",
    description: "For growing teams that want full autonomous AI capability.",
    features: [
      "Unlimited workspaces",
      "Unlimited team members",
      "10,000 AI executions / month",
      "Full analytics & AI telemetry",
      "Session & security controls",
      "Priority support",
      "API access",
    ],
    cta: "Start 14-day trial",
    href: "/register?plan=pro",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description:
      "For large organisations needing SLAs, SSO, and custom limits.",
    features: [
      "Everything in Pro",
      "SSO / SAML",
      "Custom AI execution limits",
      "Dedicated support",
      "On-premise option",
      "SLA guarantee",
    ],
    cta: "Talk to sales",
    href: "mailto:sales@nexora.ai",
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <Nav />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 px-4 sm:px-6">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[400px] sm:w-[700px] h-[400px] sm:h-[500px] rounded-full opacity-10 dark:opacity-20 bg-primary blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              AI agent running autonomously
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight">
              Your workspace,{" "}
              <span className="text-primary">on autopilot.</span>
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-[480px]">
              Nexora AI runs an autonomous agent inside your workspace —
              creating tasks, detecting gaps, and keeping your team organised
              without you lifting a finger.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl px-5 sm:px-6 py-3 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-primary/25"
              >
                Start for free
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 sm:px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
              >
                Log in
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              No credit card required · Free plan available · Setup in 2 minutes
            </p>
          </div>

          <div>
            <AgentFeed />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Live feed — your AI agent, working in real time
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-3">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
              What Nexora does
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Intelligence built into your workflow
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mx-auto max-w-[520px]">
              Not another AI chatbot. Nexora runs background processes that make
              decisions and take actions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-5 sm:p-6 space-y-3 border border-border bg-card hover:border-primary/40 transition-colors"
              >
                <div className="text-2xl sm:text-3xl">{f.icon}</div>
                <h3 className="font-bold text-[15px] text-foreground">
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-10 lg:p-16 text-center space-y-5 sm:space-y-6 border border-primary/20 bg-card">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
            About Nexora
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
            Built for teams that can&apos;t afford to slow down
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mx-auto max-w-[580px]">
            Nexora was built from a simple observation: most productivity tools
            ask you to do more work to manage your work. We flipped that.
            Nexora&apos;s autonomous AI agent handles the administrative layer —
            task creation, duplicate detection, cycle analysis — while your team
            focuses on building and shipping.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl px-5 sm:px-6 py-3 text-sm font-bold mt-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Join the teams using Nexora
          </Link>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-3">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Simple, honest pricing
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Start free. Upgrade when you&apos;re ready. No lock-in.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 sm:p-7 flex flex-col gap-5 sm:gap-6 border transition-all ${
                  plan.highlight
                    ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-primary text-primary-foreground">
                    Most popular
                  </div>
                )}

                <div className="space-y-1">
                  <p
                    className={`text-sm font-bold ${
                      plan.highlight ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm pb-1 text-muted-foreground">
                      / {plan.period}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-foreground"
                    >
                      <span className="text-primary mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block text-center rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90 ${
                    plan.highlight
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border border-border hover:bg-accent"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 sm:py-12 px-4 sm:px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-black text-foreground text-[15px]">
            Nexora <span className="text-primary">AI</span>
          </span>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-[13px]">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="#about"
              className="hover:text-foreground transition-colors"
            >
              About
            </a>
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="hover:text-foreground transition-colors"
            >
              Sign up
            </Link>
          </div>
          <span className="text-[12px]">
            © {new Date().getFullYear()} Nexora AI
          </span>
        </div>
      </footer>
    </div>
  );
}
