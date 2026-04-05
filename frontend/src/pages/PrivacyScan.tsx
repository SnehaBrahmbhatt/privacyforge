import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ScanSearch, Upload, FileText, X, ChevronRight,
  ShieldCheck, Eye, EyeOff, Copy, CheckCheck,
} from "lucide-react";
import { api, type ScanResult, type Entity } from "@/lib/api";
import { riskBg, riskColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ErrorState } from "@/components/Errorstate";
import { useToast } from "@/hooks/use-toast";

/* ─── drop zone ─── */
function DropZone({ onFile, file, onClear }: { onFile: (f: File) => void; file: File | null; onClear: () => void }) {
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
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById("scan-file-input")?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-14 cursor-pointer transition-all duration-200 ${
        dragging ? "border-wm-green bg-wm-green/5" : "border-wm-border hover:border-wm-green/30 hover:bg-wm-green/[0.02]"
      }`}
    >
      <input id="scan-file-input" type="file" accept=".csv,.json,.txt" className="sr-only"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
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

/* ─── entity row ─── */
function EntityRow({ entity }: { entity: Entity }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-wm-green/[0.02] transition-colors">
      <Badge variant="wm" className={`shrink-0 uppercase text-[10px] ${
        entity.type === "EMAIL" || entity.type === "CREDIT_CARD" ? "bg-red-400/10 text-red-400 border-red-400/20" :
        entity.type === "PHONE" ? "bg-amber-400/10 text-amber-400 border-amber-400/20" :
        "bg-wm-green/10 text-wm-green border-wm-green/20"
      }`}>{entity.type}</Badge>
      <span className="flex-1 text-sm font-mono text-wm-text truncate">
        {visible ? entity.value : "•".repeat(Math.min(entity.value.length, 20))}
      </span>
      <span className="text-xs text-wm-text-muted">{Math.round(entity.confidence * 100)}%</span>
      <button onClick={() => setVisible(v => !v)}
        className="p-1.5 rounded hover:bg-wm-green/10 text-wm-text-muted hover:text-wm-text transition-colors">
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

/* ─── results panel ─── */
function Results({ result }: { result: ScanResult }) {
  const [copied, setCopied] = useState(false);

  // Bug 7 fix: risk_score from backend is already 0–100 integer.
  // Old code did Math.round(result.risk_score * 100) → turned 55 into 5500%.
  const riskPercent = result.risk_score;

  const copyReport = () => {
    const text = [
      `Risk Level: ${result.risk_level.toUpperCase()} (${riskPercent}%)`,
      `Entities Found: ${result.entities.length}`,
      "", "Entities:",
      ...result.entities.map(e => `  ${e.type}: ${e.value}`),
      "", "Recommendations:",
      ...result.recommendations.map(r => `  • ${r}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-wm-text-muted uppercase tracking-wider">Risk Score</h3>
          <div className="flex items-center gap-2">
            <Badge className={`${riskBg(result.risk_level)} ${riskColor(result.risk_level)}`}>
              {result.risk_level}
            </Badge>
            <button onClick={copyReport} className="p-1.5 rounded hover:bg-wm-green/10 text-wm-text-muted hover:text-wm-text transition-colors" title="Copy report">
              {copied ? <CheckCheck className="h-4 w-4 text-wm-green" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-wm-text">{riskPercent}%</span>
          <span className="text-sm text-wm-text-muted mb-1">risk level</span>
        </div>
        <Progress value={riskPercent} />
      </Card>

      {result.entities.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between px-5 py-4 border-b border-wm-border">
            <h3 className="text-sm font-semibold text-wm-text-muted uppercase tracking-wider">Detected Entities</h3>
            <Badge variant="outline">{result.entities.length} found</Badge>
          </div>
          <div className="divide-y divide-wm-border max-h-72 overflow-y-auto">
            {result.entities.map((e, i) => <EntityRow key={i} entity={e} />)}
          </div>
        </Card>
      )}

      {result.recommendations?.length > 0 && (
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-wm-text-muted uppercase tracking-wider">Recommendations</h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-wm-text-muted">
                <ChevronRight className="h-4 w-4 text-wm-green mt-0.5 shrink-0" />{rec}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ─── page ─── */
export default function PrivacyScan() {
  const [file, setFile] = useState<File | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [mode, setMode] = useState<"file" | "paste">("paste");
  const { toast } = useToast();

  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: async (): Promise<ScanResult> => {
      if (mode === "file" && file) {
        return api.scan(await file.text());
      }
      return api.scan(pasteText);
    },
    onError: () => toast({ title: "Scan failed", description: "Check your input and try again.", variant: "destructive" }),
    onSuccess: (r) => toast({ title: "Scan complete", description: `Found ${r.entities.length} entities. Risk: ${r.risk_level}.` }),
  });

  const canScan = mode === "file" ? !!file : pasteText.trim().length > 10;

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="wm-page-title flex items-center gap-2">
          <ScanSearch className="h-6 w-6 text-wm-green" /> Privacy Scan
        </h1>
        <p className="wm-page-subtitle">Detect PII, sensitive fields, and privacy risk in your data</p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="flex rounded-lg bg-wm-bg border border-wm-border p-1 gap-1 w-fit">
          {(["paste", "file"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); reset(); }}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                mode === m ? "bg-wm-green text-black" : "text-wm-text-muted hover:text-wm-text"
              }`}>
              {m === "file" ? "Upload File" : "Paste Text"}
            </button>
          ))}
        </div>

        {mode === "file" ? (
          <DropZone file={file} onFile={setFile} onClear={() => { setFile(null); reset(); }} />
        ) : (
          <textarea
            placeholder={`Paste CSV, JSON, or plain text here...\n\nExample:\nname,email,phone\nJohn Doe,john@example.com,+1-555-0100`}
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            className="wm-input min-h-[160px] px-4 py-3 text-sm font-mono resize-none"
          />
        )}

        <Button onClick={() => mutate()} disabled={!canScan || isPending} className="w-full gap-2">
          {isPending ? (
            <><div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />Scanning…</>
          ) : (
            <><ShieldCheck className="h-4 w-4" />Run Privacy Scan</>
          )}
        </Button>
      </Card>

      {error && <ErrorState kind="server" inline message="The scan could not be completed. Verify your input and try again." onRetry={() => mutate()} />}
      {data && <Results result={data} />}
    </div>
  );
}