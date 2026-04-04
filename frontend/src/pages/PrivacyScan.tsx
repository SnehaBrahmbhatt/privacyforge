import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ScanSearch,
  Upload,
  FileText,
  X,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  CheckCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { riskBg, riskColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/ErrorState";
import { useToast } from "@/hooks/use-toast";

/* ─── types ─── */
interface ScanField {
  field: string;
  type: string;
  risk_level: "low" | "medium" | "high";
  sample?: string;
  confidence: number;
}

interface ScanResult {
  scan_id: string;
  total_fields: number;
  pii_fields: number;
  risk_score: number;
  fields: ScanField[];
  recommendations: string[];
}

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
          <p className="text-xs text-white/40 mt-0.5">
            {(file.size / 1024).toFixed(1)} KB
          </p>
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
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-14 cursor-pointer transition-all duration-200
        ${dragging
          ? "border-[#00e5a0] bg-[#00e5a0]/5"
          : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
        }`}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".csv,.json,.xlsx,.parquet"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <div className="rounded-xl bg-white/5 p-4">
        <Upload className="h-7 w-7 text-white/30" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white/70">
          Drop your dataset here or{" "}
          <span className="text-[#00e5a0]">browse files</span>
        </p>
        <p className="text-xs text-white/30 mt-1">CSV, JSON, XLSX, Parquet · up to 100 MB</p>
      </div>
    </div>
  );
}

/* ─── field risk row ─── */
function FieldRow({ field }: { field: ScanField }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (field.sample) {
      navigator.clipboard.writeText(field.sample);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-white/[0.03] transition-colors group">
      <div
        className={`h-2 w-2 rounded-full shrink-0 ${
          field.risk_level === "high"
            ? "bg-red-400"
            : field.risk_level === "medium"
            ? "bg-amber-400"
            : "bg-[#00e5a0]"
        }`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{field.field}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-white/40 border-white/10">
            {field.type}
          </Badge>
        </div>
        {field.sample && (
          <p className="text-xs text-white/30 mt-0.5 font-mono truncate">
            {revealed ? field.sample : "•".repeat(Math.min(field.sample.length, 20))}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="w-16">
          <Progress value={field.confidence * 100} className="h-1" />
        </div>
        <span className="text-[10px] text-white/30 w-8 text-right">
          {Math.round(field.confidence * 100)}%
        </span>

        {field.sample && (
          <>
            <button
              onClick={() => setRevealed((r) => !r)}
              className="p-1 rounded text-white/20 hover:text-white/60 transition-colors"
            >
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={copy}
              className="p-1 rounded text-white/20 hover:text-white/60 transition-colors"
            >
              {copied ? <CheckCheck className="h-3.5 w-3.5 text-[#00e5a0]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </>
        )}

        <Badge
          variant="wm"
          className={`${riskBg(field.risk_level)} ${riskColor(field.risk_level)} text-[10px]`}
        >
          {field.risk_level}
        </Badge>
      </div>
    </div>
  );
}

/* ─── results panel ─── */
function Results({ result }: { result: ScanResult }) {
  const riskPercent = (result.pii_fields / Math.max(result.total_fields, 1)) * 100;

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {/* Score row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Fields", value: result.total_fields, icon: FileText },
          { label: "PII Detected", value: result.pii_fields, icon: AlertTriangle, accent: true },
          { label: "Risk Score", value: `${result.risk_score}/100`, icon: ShieldCheck },
        ].map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} glass className="p-4 text-center space-y-1">
            <Icon className={`h-5 w-5 mx-auto ${accent ? "text-amber-400" : "text-white/30"}`} />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-[11px] text-white/40 uppercase tracking-wider">{label}</p>
          </Card>
        ))}
      </div>

      {/* PII ratio bar */}
      <Card glass className="p-5 space-y-3">
        <div className="flex justify-between text-xs text-white/50">
          <span>PII field ratio</span>
          <span>{riskPercent.toFixed(0)}%</span>
        </div>
        <Progress value={riskPercent} variant={riskPercent > 50 ? "ring" : "default"} />
      </Card>

      {/* Fields table */}
      <Card glass className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Detected Fields
          </h3>
          <Badge variant="wm" className="bg-white/5 text-white/40">
            {result.fields.length} fields
          </Badge>
        </div>
        <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
          {result.fields.map((f, i) => (
            <FieldRow key={i} field={f} />
          ))}
        </div>
      </Card>

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
  const [mode, setMode] = useState<"file" | "paste">("file");
  const { toast } = useToast();

  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: async () => {
      if (mode === "file" && file) {
        const form = new FormData();
        form.append("file", file);
        return api.post("/scan", form, {
          headers: { "Content-Type": "multipart/form-data" },
        }).then((r) => r.data as ScanResult);
      } else {
        return api.post("/scan/text", { text: pasteText }).then((r) => r.data as ScanResult);
      }
    },
    onError: () => {
      toast({ title: "Scan failed", description: "Check your file and try again.", variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Scan complete", description: "PII analysis ready.", variant: "success" as any });
    },
  });

  const canScan = mode === "file" ? !!file : pasteText.trim().length > 10;

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ScanSearch className="h-6 w-6 text-[#00e5a0]" />
          Privacy Scan
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Detect PII, sensitive fields, and privacy risk in your datasets
        </p>
      </div>

      {/* Input panel */}
      <Card glass className="p-6 space-y-5">
        {/* Mode toggle */}
        <div className="flex rounded-lg bg-white/5 p-1 gap-1 w-fit">
          {(["file", "paste"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); reset(); }}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                mode === m
                  ? "bg-[#00e5a0] text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {m === "file" ? "Upload File" : "Paste Text"}
            </button>
          ))}
        </div>

        {mode === "file" ? (
          <DropZone file={file} onFile={setFile} onClear={() => { setFile(null); reset(); }} />
        ) : (
          <Textarea
            label="Paste your data (CSV, JSON, or plain text)"
            placeholder={`name,email,phone\nJohn Doe,john@example.com,+1-555-0100`}
            maxChars={50000}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="min-h-[180px] font-mono text-xs"
          />
        )}

        <Button
          onClick={() => mutate()}
          disabled={!canScan || isPending}
          variant="stripe"
          className="w-full gap-2"
        >
          {isPending ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
              Scanning…
            </>
          ) : (
            <>
              <ScanSearch className="h-4 w-4" />
              Run Privacy Scan
            </>
          )}
        </Button>
      </Card>

      {/* Results / Error */}
      {error && (
        <ErrorState
          kind="server"
          inline
          message="The scan could not be completed. Please verify your input and try again."
          onRetry={() => mutate()}
        />
      )}

      {data && <Results result={data} />}
    </div>
  );
}