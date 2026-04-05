import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ShieldCheck, ShieldAlert, ShieldOff,
  CheckCircle2, XCircle, ChevronDown, ChevronRight,
  Loader2, Globe, User, Heart, Upload, FileText, X,
} from "lucide-react";
import { api, type FrameworkResult } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ErrorState } from "@/components/Errorstate";
import { useToast } from "@/hooks/use-toast";

/* ─── supported frameworks ─── */
const FRAMEWORKS = ["GDPR", "CCPA", "HIPAA", "PDPA"] as const;
type Framework = (typeof FRAMEWORKS)[number];
type InputMode  = "paste" | "file";

const regulationMeta: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  GDPR:  { icon: Globe,        color: "text-blue-400",   bg: "bg-blue-400/10"   },
  CCPA:  { icon: User,         color: "text-purple-400", bg: "bg-purple-400/10" },
  HIPAA: { icon: Heart,        color: "text-pink-400",   bg: "bg-pink-400/10"   },
  PDPA:  { icon: Globe,        color: "text-teal-400",   bg: "bg-teal-400/10"   },
};

/* ─── helpers ─── */
function OverallShield({ score }: { score: number }) {
  if (score >= 80) return <ShieldCheck  className="h-8 w-8 text-wm-green"   />;
  if (score >= 50) return <ShieldAlert  className="h-8 w-8 text-amber-400"  />;
  return              <ShieldOff    className="h-8 w-8 text-red-400"    />;
}

/* ─── file drop zone ─── */
function FileDropZone({ file, onFile, onClear }: {
  file: File | null; onFile: (f: File) => void; onClear: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  if (file) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-wm-green/30 bg-wm-green/5 px-5 py-4">
        <FileText className="h-8 w-8 text-wm-green shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-wm-text truncate">{file.name}</p>
          <p className="text-xs text-wm-text-muted mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        <button onClick={onClear} className="p-1.5 rounded-lg hover:bg-wm-green/10 text-wm-text-muted hover:text-wm-text transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById("compliance-file-input")?.click()}
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 cursor-pointer transition-all duration-200 ${
        dragging ? "border-wm-green bg-wm-green/5" : "border-wm-border hover:border-wm-green/30 hover:bg-wm-green/[0.02]"
      }`}
    >
      <input
        id="compliance-file-input" type="file" accept=".csv,.json,.txt" className="sr-only"
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <div className="rounded-xl bg-wm-bg-card border border-wm-border p-4">
        <Upload className="h-7 w-7 text-wm-text-muted" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-wm-text-muted">
          Drop your file here or <span className="text-wm-green">browse</span>
        </p>
        <p className="text-xs text-wm-text-dim mt-1">CSV, JSON, or plain text</p>
      </div>
    </div>
  );
}

/* ─── framework result panel ─── */
function FrameworkPanel({ result }: { result: FrameworkResult }) {
  const [expanded, setExpanded] = useState(false);
  const meta = regulationMeta[result.name] ?? { icon: ShieldCheck, color: "text-wm-text-muted", bg: "bg-wm-bg-card" };
  const Icon = meta.icon;

  return (
    <Card className="overflow-hidden p-0">
      <button
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-wm-green/[0.02] transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`rounded-lg p-2.5 ${meta.bg} ${meta.color}`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-wm-text">{result.name}</p>
            <Badge className={result.compliant
              ? "bg-wm-green/10 text-wm-green border-wm-green/20"
              : "bg-red-400/10 text-red-400 border-red-400/20"
            }>
              {result.compliant ? "compliant" : "non-compliant"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <Progress value={result.score} className="flex-1 h-1.5" />
            <span className="text-xs text-wm-text-muted shrink-0 w-10 text-right">{result.score}%</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0 text-[10px] text-wm-text-muted">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-wm-green" />
            {result.violations.length === 0
              ? "No violations"
              : `${result.violations.length} violation${result.violations.length > 1 ? "s" : ""}`}
          </span>
        </div>

        {expanded
          ? <ChevronDown className="h-4 w-4 text-wm-text-muted shrink-0" />
          : <ChevronRight className="h-4 w-4 text-wm-text-muted shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-wm-border px-5 py-4 space-y-3 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          {result.violations.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-wm-green">
              <CheckCircle2 className="h-4 w-4" /> All checks passed
            </div>
          ) : (
            <div className="space-y-2">
              <p className="wm-section-label">Violations</p>
              {result.violations.map((v, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-red-400/5 border border-red-400/20 px-3 py-2">
                  <XCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-400">{v}</p>
                </div>
              ))}
            </div>
          )}
          {result.passed_checks.length > 0 && (
            <div className="space-y-1.5">
              <p className="wm-section-label">Passed checks</p>
              {result.passed_checks.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-wm-text-muted">
                  <CheckCircle2 className="h-3 w-3 text-wm-green shrink-0" />{c}
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
  const [inputMode, setInputMode] = useState<InputMode>("paste");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedFrameworks, setSelectedFrameworks] = useState<Framework[]>(["GDPR", "HIPAA"]);
  const { toast } = useToast();

  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: async () => {
      let content = text;
      if (inputMode === "file" && file) {
        content = await file.text();
      }
      return api.complianceCheck(content, selectedFrameworks);
    },
    onError: () =>
      toast({ title: "Compliance check failed", description: "Please try again.", variant: "destructive" }),
    onSuccess: result =>
      toast({
        title: result.overall_compliant ? "All frameworks passed ✓" : "Violations detected",
        description: `${result.frameworks.length} frameworks checked.`,
      }),
  });

  const toggleFramework = (fw: Framework) => {
    setSelectedFrameworks(prev => prev.includes(fw) ? prev.filter(f => f !== fw) : [...prev, fw]);
    reset();
  };

  const canRun = (inputMode === "file" ? !!file : text.trim().length > 10) && selectedFrameworks.length > 0;

  const overallScore = data
    ? Math.round(data.frameworks.reduce((s, f) => s + f.score, 0) / data.frameworks.length)
    : null;

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="wm-page-title flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-wm-green" /> Compliance Check
        </h1>
        <p className="wm-page-subtitle">Validate your data against GDPR · CCPA · HIPAA · PDPA</p>
      </div>

      {/* Step 1: Input */}
      <Card className="p-6 space-y-5">
        <h2 className="wm-section-label">1 · Input</h2>

        {/* Mode toggle */}
        <div className="flex rounded-lg bg-wm-bg border border-wm-border p-1 gap-1 w-fit">
          {(["paste", "file"] as InputMode[]).map(m => (
            <button key={m} onClick={() => { setInputMode(m); reset(); }}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                inputMode === m ? "bg-wm-green text-black" : "text-wm-text-muted hover:text-wm-text"
              }`}>
              {m === "file" ? "Upload File" : "Paste Text"}
            </button>
          ))}
        </div>

        {inputMode === "file" ? (
          <FileDropZone file={file} onFile={f => { setFile(f); reset(); }} onClear={() => { setFile(null); reset(); }} />
        ) : (
          <textarea
            placeholder={`Paste CSV headers, JSON, or free text...\n\nExample:\nname,email,phone,ssn\nJohn Doe,john@example.com,+1-555-0100,123-45-6789`}
            value={text}
            onChange={e => { setText(e.target.value); reset(); }}
            className="wm-input min-h-[160px] px-4 py-3 text-sm font-mono resize-none"
          />
        )}
      </Card>

      {/* Step 2: Framework selection */}
      <Card className="p-6 space-y-4">
        <h2 className="wm-section-label">2 · Select Frameworks</h2>
        <div className="flex flex-wrap gap-2">
          {FRAMEWORKS.map(fw => {
            const selected = selectedFrameworks.includes(fw);
            const meta = regulationMeta[fw];
            return (
              <button key={fw} onClick={() => toggleFramework(fw)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
                  selected
                    ? "border-wm-green/50 bg-wm-green/10 text-wm-green"
                    : "border-wm-border text-wm-text-muted hover:text-wm-text hover:border-wm-green/20"
                }`}>
                <meta.icon className={`h-3.5 w-3.5 ${selected ? "text-wm-green" : meta.color}`} />
                {fw}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Run button */}
      <Button onClick={() => mutate()} disabled={!canRun || isPending} className="w-full gap-2">
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Checking…</>
        ) : (
          <><ShieldCheck className="h-4 w-4" />Run Compliance Check</>
        )}
      </Button>

      {error && (
        <ErrorState kind="server" inline
          message="The compliance check could not be completed. Please try again."
          onRetry={() => mutate()} />
      )}

      {/* Results */}
      {data && overallScore !== null && (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">

          {/* Overall score hero */}
          <Card glow className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Ring */}
              <div className="relative shrink-0">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="12" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={overallScore >= 80 ? "var(--wm-green)" : overallScore >= 50 ? "#fbbf24" : "#f87171"}
                    strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallScore / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-wm-text">{overallScore}</span>
                  <span className="text-[10px] text-wm-text-muted uppercase">score</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <OverallShield score={overallScore} />
                  <h2 className="text-xl font-bold text-wm-text">
                    {data.overall_compliant ? "Fully Compliant" : overallScore >= 50 ? "Partially Compliant" : "Non-Compliant"}
                  </h2>
                </div>
                <p className="text-sm text-wm-text-muted">
                  Across {data.frameworks.length} framework{data.frameworks.length > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  {data.frameworks.map(f => (
                    <div key={f.name} className="flex items-center gap-1.5 rounded-full bg-wm-bg-card border border-wm-border px-3 py-1">
                      <span className={`h-2 w-2 rounded-full ${f.compliant ? "bg-wm-green" : "bg-red-400"}`} />
                      <span className="text-xs font-medium text-wm-text-muted">{f.name}</span>
                      <span className="text-xs text-wm-text-dim">{f.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Per-framework panels */}
          <div className="space-y-4">
            {data.frameworks.map(result => <FrameworkPanel key={result.name} result={result} />)}
          </div>
        </div>
      )}
    </div>
  );
}