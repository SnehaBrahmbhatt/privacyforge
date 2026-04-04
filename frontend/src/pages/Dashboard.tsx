import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  ScanSearch,
  History,
  Zap,
  TrendingUp,
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
import { ErrorState } from "@/components/Errorstate";

/* ─── stat card ─── */
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
        <div className={`rounded-lg p-2 ${accent ? "bg-[#00e5a0]/10" : "bg-white/5"}`}>
          <Icon className={`h-4 w-4 ${accent ? "text-[#00e5a0]" : "text-white/40"}`} />
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

/* ─── activity row ─── */
function ActivityRow({ item }: { item: { risk_level: string; id: string; timestamp: string; entity_count: number } }) {
  const risk = item.risk_level ?? "low";
  return (
    <div className="flex items-center gap-4 rounded-lg px-3 py-2.5 hover:bg-white/[0.03] transition-colors group">
      <div
        className={`h-2 w-2 rounded-full shrink-0 ${
          risk === "high" ? "bg-red-400" : risk === "medium" ? "bg-amber-400" : "bg-[#00e5a0]"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 truncate">Scan {item.id.slice(0, 8)}</p>
        <p className="text-[11px] text-white/35 mt-0.5">{formatDate(item.timestamp)}</p>
      </div>
      <Badge variant="wm" className={`${riskBg(risk)} ${riskColor(risk)} shrink-0`}>
        {risk}
      </Badge>
      <span className="text-xs text-white/30">{item.entity_count} entities</span>
      <ArrowUpRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#00e5a0] transition-colors shrink-0" />
    </div>
  );
}

/* ─── quick action ─── */
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
  // ✅ Uses api.dashboardStats() — correct fetch-based call
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.dashboardStats,
    retry: 2,
  });

  // ✅ Uses api.scanHistory() — reuses the same history endpoint
  const { data: recentScans, isLoading: recentLoading } = useQuery({
    queryKey: ["scan-history"],
    queryFn: api.scanHistory,
    retry: 2,
  });

  const statCards = [
    {
      label: "Total Scans",
      value: stats?.total_scans ?? "—",
      icon: ScanSearch,
      accent: true,
    },
    {
      label: "PII Detected",
      value: stats?.pii_detected ?? "—",
      icon: Database,
    },
    {
      label: "Compliance Rate",
      value: stats?.compliance_rate ? `${stats.compliance_rate}%` : "—",
      icon: ShieldCheck,
    },
    {
      label: "Avg Risk Score",
      value: stats?.risk_score ? `${Math.round(stats.risk_score * 100)}%` : "—",
      icon: Clock,
    },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <Badge variant="wm" className="bg-[#00e5a0]/10 text-[#00e5a0]">Live</Badge>
        </div>
        <p className="text-sm text-white/40">Monitor your data privacy operations at a glance</p>
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
          {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      {/* Compliance mini-panel + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card glass className="p-6 space-y-5 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
              Compliance Health
            </h2>
            <ShieldCheck className="h-4 w-4 text-[#00e5a0]" />
          </div>
          {["GDPR", "HIPAA", "PCI-DSS"].map((reg) => {
            const score = stats?.compliance_rate ?? 80;
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
          <Link to="/compliance" className="flex items-center gap-1.5 text-xs text-[#00e5a0] hover:underline mt-2">
            Full compliance report <ArrowUpRight className="h-3 w-3" />
          </Link>
        </Card>

        <Card glass className="p-6 space-y-3 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <QuickAction to="/scan" icon={ScanSearch} label="New Privacy Scan" description="Detect PII and sensitive fields in your dataset" />
          <QuickAction to="/anonymize" icon={ShieldCheck} label="Anonymize Data" description="Generate synthetic data preserving statistical patterns" />
          <QuickAction to="/compliance" icon={CheckCircle2} label="Run Compliance Check" description="Validate against GDPR, HIPAA, and PCI-DSS" />
          <QuickAction to="/history" icon={History} label="View History" description="Browse all previous scans and reports" />
        </Card>
      </div>

      {/* Recent activity */}
      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Recent Activity
          </h2>
          <Link to="/history" className="text-xs text-[#00e5a0] hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {recentLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : recentScans?.length ? (
          <div className="divide-y divide-white/5">
            {recentScans.slice(0, 8).map((item, i) => (
              <ActivityRow key={i} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-12">
            <Zap className="h-8 w-8 text-white/15" />
            <p className="text-sm text-white/35">No scans yet — run your first scan!</p>
            <Link to="/scan">
              <button className="text-xs text-[#00e5a0] hover:underline">Start a privacy scan →</button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}