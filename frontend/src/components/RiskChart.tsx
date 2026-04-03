import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useApp } from "@/contexts/AppContext";
import { computeRiskStats } from "@/lib/mockData";
import { AlertTriangle } from "lucide-react";

export function RiskChart() {
  const { originalData } = useApp();
  if (originalData.length === 0) return null;

  const stats = computeRiskStats(originalData);
  const COLORS = ["hsl(0, 75%, 55%)", "hsl(150, 60%, 40%)"];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 card-shadow animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <h3 className="text-sm font-bold text-foreground tracking-tight">Data Risk Overview</h3>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={stats}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {stats.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid hsl(var(--border))",
              boxShadow: "var(--shadow-elevated)",
              fontSize: "12px",
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
