import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ScanSearch,
  Upload,
  FileText,
  X,
  ChevronRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  CheckCheck,
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
function DropZone({
  onFile,
  file,
  onClear,
}: {
  onFile: (f: File) => void;
  file: File | null;
  onClear: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFile(dropped);
    },
    [onFile]
  );

  if (file) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-[#00e5a0]/30 bg-[#00e5a0]/5 px-5 py-4">
        <FileText className="h-8 w-8 text-[#00e5a0] shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          <p className="text-xs text-white/40 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
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
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-14 cursor-pointer transition-all duration-200 ${
        dragging
          ? "border-[#00e5a0] bg-[#00e5a0]/5"
          : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
      }`}
      onClick={() => document.getElementById("scan-file-input")?.click()}
    >
      <input
        id="scan-file-input"
        type="file"
        accept=".csv,.json,.txt"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <div className="rounded-xl bg-white/5 p-4">
        <Upload className="h-7 w-7 text-white/30" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white/70">
          Drop your file here or{" "}
          <span className="text-[#00e5a0]">browse</span>
        </p>
        <p className="text-xs text-white/30 mt-1">CSV, JSON, or plain text</p>
      </div>
    </div>
  );
}

/* ─── entity risk row ─── */
function EntityRow({ entity }: { entity: Entity }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
      <Badge
        variant="wm"
        className={`shrink-0 uppercase text-[10px] ${
          entity.type === "email" || entity.type === "credit_card"
            ? "bg-red-400/10 text-red-400"
            : entity.type === "phone"
            ? "bg-amber-400/10 text-amber-400"
            : "bg-[#00e5a0]/10 text-[#00e5a0]"
        }`}
      >
        {entity.type}
      </Badge>
      <span className="flex-1 text-sm font-mono text-white/70 truncate">
        {visible ? entity.value : "•".repeat(Math.min(entity.value.length, 20))}
      </span>
      <span className="text-xs text-white/30">{Math.round(entity.confidence * 100)}%</span>
      <button
        onClick={() => setVisible((v) => !v)}
        className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-white transition-colors"
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}

/* ─── results panel ─── */
function Results({ result }: { result: ScanResult }) {
  const [copied, setCopied] = useState(false);
  const riskPercent = Math.round(result.risk_score * 100);

  const copyReport = () => {
    const text = [
      `Risk Level: ${result.risk_level.toUpperCase()} (${riskPercent}%)`,
      `Entities Found: ${result.entities.length}`,
      "",
      "Entities:",
      ...result.entities.map((e) => `  ${e.type}: ${e.value}`),
      "",
      "Recommendations:",
      ...result.recommendations.map((r) => `  • ${r}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Risk score */}
      <Card glass className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Risk Score</h3>
          <div className="flex items-center gap-2">
            <Badge
              variant="wm"
              className={`${riskBg(result.risk_level)} ${riskColor(result.risk_level)}`}
            >
              {result.risk_level}
            </Badge>
            <button
              onClick={copyReport}
              className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-white transition-colors"
              title="Copy report"
            >
              {copied ? <CheckCheck className="h-4 w-4 text-[#00e5a0]" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-white">{riskPercent}%</span>
          <span className="text-sm text-white/40 mb-1">risk level</span>
        </div>
        <Progress value={riskPercent} variant={riskPercent > 50 ? "ring" : "default"} />
      </Card>

      {/* Detected entities table */}
      {result.entities.length > 0 && (
        <Card glass className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
              Detected Entities
            </h3>
            <Badge variant="wm" className="bg-white/5 text-white/40">
              {result.entities.length} found
            </Badge>
          </div>
          <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
            {result.entities.map((e, i) => (
              <EntityRow key={i} entity={e} />
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {result.recommendations?.length > 0 && (
        <Card glass className="p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                <ChevronRight className="h-4 w-4 text-[#00e5a0] mt-0.5 shrink-0" />
                {rec}
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

  // ✅ Uses api.scan(text) — correct fetch-based call
  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: async (): Promise<ScanResult> => {
      if (mode === "file" && file) {
        // Read the file as text, then scan it
        const text = await file.text();
        return api.scan(text);
      } else {
        return api.scan(pasteText);
      }
    },
    onError: () => {
      toast({
        title: "Scan failed",
        description: "Check your input and try again.",
        variant: "destructive",
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Scan complete",
        description: `Found ${result.entities.length} entities. Risk: ${result.risk_level}.`,
      });
    },
  });

  const canScan = mode === "file" ? !!file : pasteText.trim().length > 10;

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ScanSearch className="h-6 w-6 text-[#00e5a0]" />
          Privacy Scan
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Detect PII, sensitive fields, and privacy risk in your data
        </p>
      </div>

      <Card glass className="p-6 space-y-5">
        {/* Mode toggle */}
        <div className="flex rounded-lg bg-white/5 p-1 gap-1 w-fit">
          {(["paste", "file"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); reset(); }}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                mode === m ? "bg-[#00e5a0] text-black" : "text-white/50 hover:text-white"
              }`}
            >
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
            onChange={(e) => setPasteText(e.target.value)}
            className="w-full min-h-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/25 focus:outline-none focus:border-[#00e5a0]/40 resize-none"
          />
        )}

        <Button
          onClick={() => mutate()}
          disabled={!canScan || isPending}
          className="w-full gap-2 bg-[#00e5a0] text-black hover:bg-[#00e5a0]/90 font-semibold"
        >
          {isPending ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Run Privacy Scan
            </>
          )}
        </Button>
      </Card>

      {error && (
        <ErrorState
          kind="server"
          inline
          message="The scan could not be completed. Verify your input and try again."
          onRetry={() => mutate()}
        />
      )}

      {data && <Results result={data} />}
    </div>
  );
}