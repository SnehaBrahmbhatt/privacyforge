import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Globe,
  User,
  Heart,
} from "lucide-react";
import { api, type FrameworkResult } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// Bug 8 fix: was importing from "@/components/ErrorState" (capital S) but the file
// on disk is "Errorstate.tsx" (lowercase s). On Linux/Docker this causes a build error.
// All imports must use the exact filename casing.
import { ErrorState } from "@/components/Errorstate";
import { useToast } from "@/hooks/use-toast";

/* ─── supported frameworks ─── */
const FRAMEWORKS = ["GDPR", "CCPA", "HIPAA", "PDPA"] as const;
type Framework = (typeof FRAMEWORKS)[number];

const regulationMeta: Record<string, { icon: React.ElementType; color: string }> = {
  GDPR:  { icon: Globe, color: "text-blue-400" },
  CCPA:  { icon: User,  color: "text-purple-400" },
  HIPAA: { icon: Heart, color: "text-pink-400" },
  PDPA:  { icon: Globe, color: "text-teal-400" },
};

/* ─── helpers ─── */
function overallShield(score: number) {
  if (score >= 80) return <ShieldCheck className="h-8 w-8 text-[#00e5a0]" />;
  if (score >= 50) return <ShieldAlert className="h-8 w-8 text-amber-400" />;
  return <ShieldOff className="h-8 w-8 text-red-400" />;
}

/* ─── framework result panel ─── */
function FrameworkPanel({ result }: { result: FrameworkResult }) {
  const [expanded, setExpanded] = useState(false);
  const meta = regulationMeta[result.name] ?? { icon: ShieldCheck, color: "text-white/50" };
  const Icon = meta.icon;

  return (
    <Card glass className="overflow-hidden">
      <button
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className={`rounded-lg bg-white/5 p-2.5 ${meta.color}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">{result.name}</p>
            <Badge
              variant="wm"
              className={
                result.compliant
                  ? "bg-[#00e5a0]/10 text-[#00e5a0]"
                  : "bg-red-400/10 text-red-400"
              }
            >
              {result.compliant ? "compliant" : "non-compliant"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Progress value={result.score} className="flex-1 h-1.5" />
            <span className="text-xs text-white/50 shrink-0 w-10 text-right">
              {result.score}%
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0 text-[10px] text-white/30">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-[#00e5a0]" />
            {result.violations.length === 0 ? "No violations" : `${result.violations.length} violation${result.violations.length > 1 ? "s" : ""}`}
          </span>
        </div>

        {expanded ? (
          <ChevronDown className="h-4 w-4 text-white/20 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/20 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-4 space-y-3 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          {result.violations.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-[#00e5a0]">
              <CheckCircle2 className="h-4 w-4" />
              All checks passed
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Violations</p>
              {result.violations.map((v, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-red-400/5 border border-red-400/15 px-3 py-2">
                  <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-300/80">{v}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/* ─── page ─── */
export default function Compliance() {
  const [text, setText] = useState("");
  const [selectedFrameworks, setSelectedFrameworks] = useState<Framework[]>(["GDPR", "HIPAA"]);
  const { toast } = useToast();

  // Bug 4+5 fix: was using api.get("/compliance") (axios-style) which doesn't exist.
  // Now uses api.complianceCheck() from api.ts which calls POST /api/compliance/check
  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: () =>
      api.complianceCheck(text, selectedFrameworks),
    onError: () =>
      toast({ title: "Compliance check failed", description: "Please try again.", variant: "destructive" }),
    onSuccess: (result) =>
      toast({
        title: result.overall_compliant ? "All frameworks passed ✓" : "Violations detected",
        description: `${result.frameworks.length} frameworks checked.`,
      }),
  });

  const toggleFramework = (fw: Framework) => {
    setSelectedFrameworks((prev) =>
      prev.includes(fw) ? prev.filter((f) => f !== fw) : [...prev, fw]
    );
    reset();
  };

  const canRun = text.trim().length > 10 && selectedFrameworks.length > 0;

  const overallScore = data
    ? Math.round(data.frameworks.reduce((sum, f) => sum + f.score, 0) / data.frameworks.length)
    : null;

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-[#00e5a0]" />
          Compliance Check
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Validate your data against GDPR · CCPA · HIPAA · PDPA
        </p>
      </div>

      {/* Input */}
      <Card glass className="p-6 space-y-5">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          1 · Paste Text or Data
        </h2>
        <textarea
          placeholder={`Paste CSV headers, JSON, or free text to check for compliance violations...\n\nExample:\nname,email,phone,ssn\nJohn Doe,john@example.com,+1-555-0100,123-45-6789`}
          value={text}
          onChange={(e) => { setText(e.target.value); reset(); }}
          className="w-full min-h-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/25 focus:outline-none focus:border-[#00e5a0]/40 resize-none"
        />
      </Card>

      {/* Framework selection */}
      <Card glass className="p-6 space-y-4">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          2 · Select Frameworks
        </h2>
        <div className="flex flex-wrap gap-2">
          {FRAMEWORKS.map((fw) => {
            const selected = selectedFrameworks.includes(fw);
            return (
              <button
                key={fw}
                onClick={() => toggleFramework(fw)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
                  selected
                    ? "border-[#00e5a0]/50 bg-[#00e5a0]/10 text-[#00e5a0]"
                    : "border-white/10 text-white/40 hover:text-white hover:border-white/20"
                }`}
              >
                {fw}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Run button */}
      <Button
        onClick={() => mutate()}
        disabled={!canRun || isPending}
        className="w-full gap-2 bg-[#00e5a0] text-black hover:bg-[#00e5a0]/90 font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking…
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Run Compliance Check
          </>
        )}
      </Button>

      {/* Error */}
      {error && (
        <ErrorState
          kind="server"
          inline
          message="The compliance check could not be completed. Please try again."
          onRetry={() => mutate()}
        />
      )}

      {/* Results */}
      {data && overallScore !== null && (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          {/* Overall score hero */}
          <Card glass glow className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={overallScore >= 80 ? "#00e5a0" : overallScore >= 50 ? "#fbbf24" : "#f87171"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallScore / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{overallScore}</span>
                  <span className="text-[10px] text-white/40 uppercase">score</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  {overallShield(overallScore)}
                  <h2 className="text-xl font-bold text-white">
                    {data.overall_compliant ? "Fully Compliant" : overallScore >= 50 ? "Partially Compliant" : "Non-Compliant"}
                  </h2>
                </div>
                <p className="text-sm text-white/40">
                  Across {data.frameworks.length} framework{data.frameworks.length > 1 ? "s" : ""}
                </p>

                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  {data.frameworks.map((f) => (
                    <div key={f.name} className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1">
                      <span className={`h-2 w-2 rounded-full ${f.compliant ? "bg-[#00e5a0]" : "bg-red-400"}`} />
                      <span className="text-xs font-medium text-white/60">{f.name}</span>
                      <span className="text-xs text-white/30">{f.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Per-framework panels */}
          <div className="space-y-4">
            {data.frameworks.map((result) => (
              <FrameworkPanel key={result.name} result={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}