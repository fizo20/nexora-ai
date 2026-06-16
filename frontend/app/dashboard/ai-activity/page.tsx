// frontend/app/dashboard/ai-activity/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useAIAnalytics } from "@/hooks/useAIAnalytics";
import { AIActivityFeedItem } from "@/types/ai-analytics";
import {
  Bot,
  CheckCircle2,
  SkipForward,
  RefreshCw,
  Search,
  Filter,
  Clock,
} from "lucide-react";

/* ─── Type badge config ──────────────────────────────────────────── */

type BadgeConfig = {
  label: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
  dot: string;
};

function getBadge(type: string): BadgeConfig {
  switch (type) {
    case "create_task":
      return {
        label: "Task Created",
        icon: <CheckCircle2 size={12} />,
        bg: "bg-emerald-500/10",
        text: "text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
      };
    case "create_task_skipped":
      return {
        label: "Skipped",
        icon: <SkipForward size={12} />,
        bg: "bg-amber-500/10",
        text: "text-amber-600 dark:text-amber-400",
        dot: "bg-amber-500",
      };
    case "autonomous_cycle":
      return {
        label: "Autonomous Cycle",
        icon: <RefreshCw size={12} />,
        bg: "bg-violet-500/10",
        text: "text-violet-600 dark:text-violet-400",
        dot: "bg-violet-500",
      };
    default:
      return {
        label: type.replace(/_/g, " "),
        icon: <Bot size={12} />,
        bg: "bg-blue-500/10",
        text: "text-blue-600 dark:text-blue-400",
        dot: "bg-blue-500",
      };
  }
}

/* ─── Stat card ──────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-3xl font-bold tabular-nums ${color}`}>
        {value}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  );
}

/* ─── Activity row ───────────────────────────────────────────────── */

function ActivityRow({
  item,
  isLast,
}: {
  item: AIActivityFeedItem;
  isLast: boolean;
}) {
  const badge = getBadge(item.type);
  const date = new Date(item.createdAt);

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <div
          className={`mt-1 h-2.5 w-2.5 rounded-full ring-2 ring-background ${badge.dot}`}
        />
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
          <div className="space-y-1">
            {/* Badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badge.bg} ${badge.text}`}
            >
              {badge.icon}
              {badge.label}
            </span>
            {/* Message */}
            <p className="text-sm text-foreground leading-snug">
              {item.message}
            </p>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
            <Clock size={11} />
            <span>
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              {", "}
              {date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton loader ────────────────────────────────────────────── */

function SkeletonRows() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-muted" />
            {i < 5 && (
              <div className="mt-1 w-px flex-1 bg-border min-h-[40px]" />
            )}
          </div>
          <div className="flex-1 pb-6 space-y-2">
            <div className="h-5 w-32 rounded-full bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── All event types for filter dropdown ────────────────────────── */

const ALL_TYPES = [
  { value: "all", label: "All types" },
  { value: "create_task", label: "Task Created" },
  { value: "create_task_skipped", label: "Skipped" },
  { value: "autonomous_cycle", label: "Autonomous Cycle" },
];

/* ─── Page ───────────────────────────────────────────────────────── */

export default function AIActivityPage() {
  const { data, loading } = useAIAnalytics();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const feed = data?.activityFeed ?? [];

  /* Stats derived from the full feed (before filters) */
  const stats = useMemo(
    () => ({
      total: feed.length,
      created: feed.filter((e) => e.type === "create_task").length,
      skipped: feed.filter((e) => e.type === "create_task_skipped").length,
      cycles: feed.filter((e) => e.type === "autonomous_cycle").length,
    }),
    [feed],
  );

  /* Filtered feed */
  const filtered = useMemo(() => {
    return feed.filter((item) => {
      const matchType = typeFilter === "all" || item.type === typeFilter;
      const matchSearch =
        search.trim() === "" ||
        item.message.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [feed, typeFilter, search]);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Bot size={20} className="text-violet-500" />
          <h1 className="text-2xl font-bold tracking-tight">AI Activity</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Every action your autonomous AI agent has taken — tasks created,
          cycles run, and duplicates skipped.
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Events"
          value={stats.total}
          color="text-foreground"
        />
        <StatCard
          label="Tasks Created"
          value={stats.created}
          color="text-emerald-600 dark:text-emerald-400"
          sub="by the AI agent"
        />
        <StatCard
          label="Skipped"
          value={stats.skipped}
          color="text-amber-600 dark:text-amber-400"
          sub="duplicate prevention"
        />
        <StatCard
          label="Autonomous Cycles"
          value={stats.cycles}
          color="text-violet-600 dark:text-violet-400"
          sub="scheduled checks"
        />
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search messages or types…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background pl-8 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Type filter */}
        <div className="relative">
          <Filter
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by event type"
            className="appearance-none rounded-lg border bg-background pl-8 pr-8 py-2 text-sm outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            {ALL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Timeline ── */}
      <div className="rounded-xl border bg-card p-6">
        {loading ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bot size={36} className="text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {feed.length === 0
                ? "No AI activity recorded yet."
                : "No events match your filters."}
            </p>
            {feed.length > 0 && (
              <button
                className="mt-3 text-xs text-violet-500 hover:underline"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div>
            <p className="text-xs text-muted-foreground mb-6">
              Showing {filtered.length} of {feed.length} events
            </p>
            {filtered.map((item, i) => (
              <ActivityRow
                key={item._id}
                item={item}
                isLast={i === filtered.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
