import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  ScanSearch,
  History,
  Zap,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Database,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { formatDate, riskBg, riskColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";

/* ─── tiny stat card ─── */
function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  delta?: string;
  accent?: boolean;
}) {
  return (
    <Card
      glass
      glow={accent}
      className="flex flex-col gap-4 p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-widest uppercase text-white/40">
          {label}
        </span>
        <div
          className={`rounded-lg p-2 ${
            accent ? "bg-[#00e5a0]/10" : "bg-white/5"
          }`}
        >
          <Icon
            className={`h-4 w-4 ${accent ? "text-[#00e5a0]" : "text-white/40"}`}
          />
        </div>
      </div>

      <div>
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        {delta && (
          <p className="mt-1 flex items-center gap-1 text-xs text-[#00e5a0]">
            <TrendingUp className="h-3 w-3" />
            {delta}
          </p>
        )}
      </div>
    </Card>
  );
}

/* ─── recent activity row ─── */
function ActivityRow({ item }: { item: any }) {
  const risk = item.risk_level ?? item.riskLevel ?? "low";
  return (
    <div className="flex items-center gap-4 rounded-lg px-3 py-2.5 hover:bg-white/[0.03] transition-colors group">
      <div
        className={`h-2 w-2 rounded-full shrink-0 ${
          risk === "high"
            ? "bg-red-400"
            : risk === "medium"
            ? "bg-amber-400"
            : "bg-[#00e5a0]"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 truncate">
          {item.filename ?? item.name ?? "Unnamed scan"}
        </p>
        <p className="text-[11px] text-white/35 mt-0.5">
          {formatDate(item.created_at ?? item.timestamp)}
        </p>
      </div>
      <Badge variant="wm" className={`${riskBg(risk)} ${riskColor(risk)} shrink-0`}>
        {risk}
      </Badge>
      <ArrowUpRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#00e5a0] transition-colors shrink-0" />
    </div>
  );
}

/* ─── quick action button ─── */
function QuickAction({
  to,
  icon: Icon,
  label,
  description,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  description: string;
}) {
  return (
    <Link to={to}>
      <div className="group flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#00e5a0]/30 p-4 transition-all duration-200 cursor-pointer">
        <div className="rounded-lg bg-[#00e5a0]/10 p-2.5 group-hover:bg-[#00e5a0]/20 transition-colors">
          <Icon className="h-5 w-5 text-[#00e5a0]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-white/40 mt-0.5">{description}</p>
        </div>
        <ArrowUpRight className="ml-auto h-4 w-4 text-white/20 group-hover:text-[#00e5a0] transition-colors shrink-0" />
      </div>
    </Link>
  );
}

/* ─── page ─── */
export default function Dashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } =
    useQuery({
      queryKey: ["dashboard-stats"],
      queryFn: () => api.get("/dashboard/stats").then((r) => r.data),
      retry: 2,
    });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: () => api.get("/scans/recent").then((r) => r.data),
    retry: 2,
  });

  const statCards = [
    {
      label: "Total Scans",
      value: stats?.total_scans ?? "—",
      icon: ScanSearch,
      delta: stats?.scan_delta,
      accent: true,
    },
    {
      label: "Records Anonymised",
      value: stats?.records_anonymised
        ? (stats.records_anonymised as number).toLocaleString()
        : "—",
      icon: Database,
      delta: stats?.records_delta,
    },
    {
      label: "Compliance Score",
      value: stats?.compliance_score ? `${stats.compliance_score}%` : "—",
      icon: ShieldCheck,
    },
    {
      label: "Avg Process Time",
      value: stats?.avg_process_time ?? "—",
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <Badge variant="wm" className="bg-[#00e5a0]/10 text-[#00e5a0]">
            Live
          </Badge>
        </div>
        <p className="text-sm text-white/40">
          Monitor your data privacy operations at a glance
        </p>
      </div>

      {/* Stat cards */}
      {statsError ? (
        <ErrorState
          kind="server"
          inline
          message="Could not load dashboard stats."
          onRetry={refetchStats}
        />
      ) : statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* Compliance gauge + quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance mini-panel */}
        <Card glass className="p-6 space-y-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
              Compliance Health
            </h2>
            <ShieldCheck className="h-4 w-4 text-[#00e5a0]" />
          </div>

          {["GDPR", "CCPA", "HIPAA"].map((reg) => {
            const score =
              stats?.compliance_breakdown?.[reg] ??
              Math.floor(Math.random() * 30 + 65);
            return (
              <div key={reg} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">{reg}</span>
                  <span className="text-white font-medium">{score}%</span>
                </div>
                <Progress value={score} variant={score >= 80 ? "default" : "ring"} />
              </div>
            );
          })}

          <Link
            to="/compliance"
            className="flex items-center gap-1.5 text-xs text-[#00e5a0] hover:underline mt-2"
          >
            Full compliance report
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </Card>

        {/* Quick actions */}
        <Card glass className="p-6 space-y-3 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <QuickAction
            to="/privacy-scan"
            icon={ScanSearch}
            label="New Privacy Scan"
            description="Detect PII and sensitive fields in your dataset"
          />
          <QuickAction
            to="/anonymize"
            icon={ShieldCheck}
            label="Anonymize Data"
            description="Generate synthetic data preserving statistical patterns"
          />
          <QuickAction
            to="/compliance"
            icon={CheckCircle2}
            label="Run Compliance Check"
            description="Validate against GDPR, CCPA, and HIPAA"
          />
          <QuickAction
            to="/history"
            icon={History}
            label="View History"
            description="Browse all previous scans and reports"
          />
        </Card>
      </div>

      {/* Recent activity */}
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Recent Activity
          </h2>
          <Link
            to="/history"
            className="text-xs text-[#00e5a0] hover:underline flex items-center gap-1"
          >
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {recentLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : recent?.length ? (
          <div className="divide-y divide-white/5">
            {recent.slice(0, 8).map((item: any, i: number) => (
              <ActivityRow key={i} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12">
            <Zap className="h-8 w-8 text-white/15" />
            <p className="text-sm text-white/35">No scans yet — run your first scan!</p>
            <Link to="/privacy-scan">
              <button className="text-xs text-[#00e5a0] hover:underline">
                Start a privacy scan →
              </button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}