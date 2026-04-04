import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  Loader2,
  Globe,
  User,
  Heart,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SkeletonCard } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ErrorState";

/* ─── types ─── */
interface ComplianceCheck {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn";
  description: string;
  remediation?: string;
}

interface RegulationReport {
  regulation: string;
  score: number;
  status: "compliant" | "partial" | "non-compliant";
  checks: ComplianceCheck[];
  last_checked: string;
}

interface ComplianceOverview {
  overall_score: number;
  reports: RegulationReport[];
  generated_at: string;
}

/* ─── helpers ─── */
const statusIcon = {
  pass: <CheckCircle2 className="h-4 w-4 text-[#00e5a0]" />,
  warn: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  fail: <XCircle className="h-4 w-4 text-red-400" />,
};

const regulationMeta: Record<string, { icon: React.ElementType; color: string }> = {
  GDPR: { icon: Globe, color: "text-blue-400" },
  CCPA: { icon: User, color: "text-purple-400" },
  HIPAA: { icon: Heart, color: "text-pink-400" },
};

function overallShield(score: number) {
  if (score >= 80) return <ShieldCheck className="h-8 w-8 text-[#00e5a0]" />;
  if (score >= 50) return <ShieldAlert className="h-8 w-8 text-amber-400" />;
  return <ShieldOff className="h-8 w-8 text-red-400" />;
}

/* ─── check row ─── */
function CheckRow({ check }: { check: ComplianceCheck }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors text-left"
      >
        <span className="shrink-0">{statusIcon[check.status]}</span>
        <span className="flex-1 text-sm text-white/80">{check.label}</span>
        <Badge
          variant="wm"
          className={
            check.status === "pass"
              ? "bg-[#00e5a0]/10 text-[#00e5a0]"
              : check.status === "warn"
              ? "bg-amber-400/10 text-amber-400"
              : "bg-red-400/10 text-red-400"
          }
        >
          {check.status}
        </Badge>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-white/20 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-white/20 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-5 pb-4 pl-12 space-y-2 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <p className="text-xs text-white/50 leading-relaxed">{check.description}</p>
          {check.remediation && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-400/5 border border-amber-400/15 px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80">{check.remediation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── regulation panel ─── */
function RegulationPanel({ report }: { report: RegulationReport }) {
  const [expanded, setExpanded] = useState(false);
  const meta = regulationMeta[report.regulation] ?? { icon: ShieldCheck, color: "text-white/50" };
  const Icon = meta.icon;

  const passCount = report.checks.filter((c) => c.status === "pass").length;
  const failCount = report.checks.filter((c) => c.status === "fail").length;
  const warnCount = report.checks.filter((c) => c.status === "warn").length;

  return (
    <Card glass className="overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className={`rounded-lg bg-white/5 p-2.5 ${meta.color}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">{report.regulation}</p>
            <Badge
              variant="wm"
              className={
                report.status === "compliant"
                  ? "bg-[#00e5a0]/10 text-[#00e5a0]"
                  : report.status === "partial"
                  ? "bg-amber-400/10 text-amber-400"
                  : "bg-red-400/10 text-red-400"
              }
            >
              {report.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Progress value={report.score} className="flex-1 h-1.5" />
            <span className="text-xs text-white/50 shrink-0 w-10 text-right">
              {report.score}%
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0 text-[10px] text-white/30">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00e5a0]" /> {passCount} pass
          </span>
          {warnCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> {warnCount} warn
            </span>
          )}
          {failCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> {failCount} fail
            </span>
          )}
        </div>

        {expanded ? (
          <ChevronDown className="h-4 w-4 text-white/20 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/20 shrink-0" />
        )}
      </button>

      {/* Expanded checks */}
      {expanded && (
        <div className="border-t border-white/5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          {report.checks.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
          <div className="px-5 py-2 border-t border-white/5">
            <p className="text-[10px] text-white/20">
              Last checked: {formatDate(report.last_checked)}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ─── page ─── */
export default function Compliance() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<ComplianceOverview>({
    queryKey: ["compliance"],
    queryFn: () => api.get("/compliance").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { mutate: runCheck, isPending: checking } = useMutation({
    mutationFn: () => api.post("/compliance/run").then((r) => r.data),
    onSuccess: () => refetch(),
  });

  const { mutate: exportReport, isPending: exporting } = useMutation({
    mutationFn: () =>
      api
        .get("/compliance/export", { responseType: "blob" })
        .then((r) => {
          const url = URL.createObjectURL(new Blob([r.data]));
          const a = document.createElement("a");
          a.href = url;
          a.download = "compliance-report.pdf";
          a.click();
          URL.revokeObjectURL(url);
        }),
  });

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#00e5a0]" />
            Compliance
          </h1>
          <p className="text-sm text-white/40 mt-1">
            GDPR · CCPA · HIPAA compliance status
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => exportReport()}
            disabled={exporting || !data}
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Export PDF
          </Button>
          <Button
            variant="stripe"
            size="sm"
            className="gap-2"
            onClick={() => runCheck()}
            disabled={checking}
          >
            {checking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Run Check
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <ErrorState
          kind="server"
          message="Could not load compliance data."
          onRetry={() => refetch()}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Data */}
      {data && (
        <>
          {/* Overall score hero */}
          <Card glass glow className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Donut-ish ring */}
              <div className="relative shrink-0">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12"
                  />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke={data.overall_score >= 80 ? "#00e5a0" : data.overall_score >= 50 ? "#fbbf24" : "#f87171"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - data.overall_score / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{data.overall_score}</span>
                  <span className="text-[10px] text-white/40 uppercase">score</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  {overallShield(data.overall_score)}
                  <h2 className="text-xl font-bold text-white">
                    {data.overall_score >= 80
                      ? "Compliant"
                      : data.overall_score >= 50
                      ? "Partially Compliant"
                      : "Non-Compliant"}
                  </h2>
                </div>
                <p className="text-sm text-white/40">
                  Across {data.reports.length} regulations ·{" "}
                  {formatDate(data.generated_at)}
                </p>

                {/* Per-regulation quick pills */}
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  {data.reports.map((r) => (
                    <div
                      key={r.regulation}
                      className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          r.status === "compliant"
                            ? "bg-[#00e5a0]"
                            : r.status === "partial"
                            ? "bg-amber-400"
                            : "bg-red-400"
                        }`}
                      />
                      <span className="text-xs font-medium text-white/60">
                        {r.regulation}
                      </span>
                      <span className="text-xs text-white/30">{r.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Per-regulation panels */}
          <div className="space-y-4">
            {data.reports.map((report) => (
              <RegulationPanel key={report.regulation} report={report} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}