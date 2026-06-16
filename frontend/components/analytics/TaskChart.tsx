// frontend/components/analytics/TaskChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// WHY NO ready-STATE:
// The previous approach used useLayoutEffect/useEffect to gate rendering until
// the container had a positive offsetWidth. The linter rejects setState() in
// either hook body ("Avoid calling setState() directly within an effect").
//
// The root cause of the Recharts warning is that ResponsiveContainer reads
// its parent's dimensions via ResizeObserver on mount. If the parent has
// height: auto and no explicit minHeight, the first observation can return 0.
//
// The correct fix has nothing to do with React state — it is purely CSS:
// give the wrapper a concrete minHeight so Recharts always reads a positive
// number on its first measurement. No effect, no extra state, no extra render.

interface Props {
  data: {
    total: number;
    completed: number;
    overdue: number;
  };
}

export default function TaskChart({ data }: Props) {
  const chartData = [
    { name: "Total", value: data.total },
    { name: "Completed", value: data.completed },
    { name: "Overdue", value: data.overdue },
  ];

  return (
    // minHeight (not just height) is what matters: it guarantees the DOM node
    // has a non-zero height even before the parent's layout resolves, so
    // ResponsiveContainer never measures a zero or negative dimension.
    <div style={{ width: "100%", minHeight: 256, height: 256 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
