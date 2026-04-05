import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ShieldCheck, Upload, Shuffle, Settings2,
  ChevronDown, ChevronUp, Loader2, CheckCircle2,
  FileText, X, Copy, Download,
} from "lucide-react";
import { api, type AnonymizeResult } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ErrorState } from "@/components/Errorstate";
import { useToast } from "@/hooks/use-toast";

/* ─── types ─── */
type Strategy = "mask" | "redact" | "replace" | "hash";
type InputMode = "paste" | "file";

/* ─── strategy options ─── */
const strategies: { id: Strategy; label: string; description: string }[] = [
  { id: "mask",   label: "Data Masking",          description: "Partially obscure values (e.g. j***@***.com)" },
  { id: "redact", label: "Redaction",              description: "Replace with labelled placeholders like [EMAIL]" },
  { id: "replace",label: "Synthetic Replacement",  description: "Substitute with realistic fake values via Faker" },
  { id: "hash",   label: "Pseudonymisation",       description: "Deterministic 8-char hex pseudonym (reversible with key)" },
];

/* ─── strategy card ─── */
function StrategyCard({ strategy, selected, onSelect }: {
  strategy: (typeof strategies)[0]; selected: boolean; onSelect: () => void;
}) {
  return (
    <button onClick={onSelect}
      className={`text-left w-full rounded-xl border p-4 transition-all duration-150 ${
        selected
          ? "border-wm-green/50 bg-wm-green/5 shadow-wm-sm"
          : "border-wm-border bg-wm-bg hover:border-wm-green/20 hover:bg-wm-green/[0.02]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
          selected ? "border-wm-green" : "border-wm-border"
        }`}>
          {selected && <div className="h-2 w-2 rounded-full bg-wm-green" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-wm-text">{strategy.label}</p>
          <p className="text-xs text-wm-text-muted mt-0.5">{strategy.description}</p>
        </div>
      </div>
    </button>
  );
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
      onClick={() => document.getElementById("anon-file-input")?.click()}
      className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 cursor-pointer transition-all duration-200 ${
        dragging ? "border-wm-green bg-wm-green/5" : "border-wm-border hover:border-wm-green/30 hover:bg-wm-green/[0.02]"
      }`}
    >
      <input
        id="anon-file-input" type="file" accept=".csv,.json,.txt" className="sr-only"
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      <div className="rounded-xl bg-wm-bg-card border border-wm-border p-4">
        <Upload className="h-7 w-7 text-wm-text-muted" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-wm-text-muted">
          Drop your file here or <span className="text-wm-green">browse</span>
        </p>
        <p className="text-xs text-wm-text-dim mt-1">CSV, JSON, or plain text · max 5 MB</p>
      </div>
    </div>
  );
}

/* ─── result panel ─── */
function ResultPanel({ result, originalText }: { result: AnonymizeResult; originalText: string }) {
  const handleDownload = () => {
    const blob = new Blob([result.anonymized_text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `anonymized_output.txt`;
    a.click();
  };

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-wm-green" />
        <h3 className="text-sm font-semibold text-wm-text">Anonymisation complete</h3>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Entities masked",    value: result.entities_masked },
          { label: "Original entities",  value: result.original_entity_count ?? "—" },
          { label: "Strategy used",      value: result.strategy },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4 text-center">
            <p className="text-xl font-bold text-wm-text">{value}</p>
            <p className="text-[11px] text-wm-text-muted uppercase tracking-wider mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {result.entities_masked > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-wm-text-muted">
            <span>Entities anonymised</span>
            <span>{result.entities_masked} / {result.original_entity_count ?? result.entities_masked}</span>
          </div>
          <Progress value={result.original_entity_count
            ? Math.round((result.entities_masked / result.original_entity_count) * 100)
            : 100} />
        </div>
      )}

      {/* Anonymised output */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="wm-section-label">Anonymised Output</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(result.anonymized_text)}
              className="flex items-center gap-1 text-xs text-wm-green hover:underline"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 text-xs text-wm-green hover:underline"
            >
              <Download className="h-3 w-3" /> Download
            </button>
          </div>
        </div>
        <pre className="text-sm font-mono text-wm-text whitespace-pre-wrap break-words rounded-lg bg-wm-bg border border-wm-border p-4 max-h-72 overflow-y-auto">
          {result.anonymized_text}
        </pre>
      </Card>
    </div>
  );
}

/* ─── page ─── */
export default function Anonymize() {
  const [inputMode, setInputMode] = useState<InputMode>("paste");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<Strategy>("mask");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [entityFilter, setEntityFilter] = useState<string[]>([]);
  const { toast } = useToast();

  const ENTITY_TYPES = ["email", "phone", "name", "credit_card", "ip_address"];

  const toggleEntity = (e: string) =>
    setEntityFilter(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: async () => {
      let content = text;
      if (inputMode === "file" && file) {
        content = await file.text();
      }
      return api.anonymize(content, strategy, entityFilter);
    },
    onError: () =>
      toast({ title: "Anonymisation failed", description: "Please try again.", variant: "destructive" }),
    onSuccess: result =>
      toast({ title: "Done!", description: `Masked ${result.entities_masked} entities using ${result.strategy}.` }),
  });

  const canRun = inputMode === "file"
    ? !!file
    : text.trim().length > 10;

  const activeText = inputMode === "file" ? (file?.name ?? "") : text;

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="wm-page-title flex items-center gap-2">
          <Shuffle className="h-6 w-6 text-wm-green" /> Anonymize Data
        </h1>
        <p className="wm-page-subtitle">Remove or replace PII from your text or file using your chosen strategy</p>
      </div>

      {/* Step 1: Input */}
      <Card className="p-6 space-y-4">
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
            placeholder={`Paste text, CSV, or JSON containing PII...\n\nExample:\nHello, my name is John Doe. My email is john.doe@example.com and my phone is +1-555-0100.`}
            value={text}
            onChange={e => { setText(e.target.value); reset(); }}
            className="wm-input min-h-[160px] px-4 py-3 text-sm font-mono resize-none"
          />
        )}
      </Card>

      {/* Step 2: Strategy */}
      <Card className="p-6 space-y-4">
        <h2 className="wm-section-label">2 · Anonymisation Strategy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {strategies.map(s => (
            <StrategyCard key={s.id} strategy={s} selected={strategy === s.id}
              onSelect={() => { setStrategy(s.id); reset(); }} />
          ))}
        </div>
      </Card>

      {/* Step 3: Advanced entity filter */}
      <Card className="overflow-hidden p-0">
        <button
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-wm-green/[0.02] transition-colors"
          onClick={() => setAdvancedOpen(o => !o)}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-wm-text-muted">
            <Settings2 className="h-4 w-4" />
            Advanced — target specific entity types
          </div>
          {advancedOpen ? <ChevronUp className="h-4 w-4 text-wm-text-muted" /> : <ChevronDown className="h-4 w-4 text-wm-text-muted" />}
        </button>

        {advancedOpen && (
          <div className="px-6 pb-6 border-t border-wm-border pt-4 space-y-3">
            <p className="text-xs text-wm-text-muted">
              Select specific entity types to anonymise. Leave all unchecked to anonymise everything.
            </p>
            <div className="flex flex-wrap gap-2">
              {ENTITY_TYPES.map(e => {
                const active = entityFilter.includes(e);
                return (
                  <button key={e} onClick={() => toggleEntity(e)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      active
                        ? "border-wm-green/50 bg-wm-green/10 text-wm-green"
                        : "border-wm-border text-wm-text-muted hover:text-wm-text hover:border-wm-green/20"
                    }`}>
                    {e.replace("_", " ")}
                  </button>
                );
              })}
            </div>
            {entityFilter.length > 0 && (
              <button onClick={() => setEntityFilter([])}
                className="text-xs text-wm-text-muted hover:text-wm-text flex items-center gap-1">
                <X className="h-3 w-3" /> Clear filter (anonymise all types)
              </button>
            )}
          </div>
        )}
      </Card>

      {/* Run button */}
      <Button onClick={() => mutate()} disabled={!canRun || isPending} className="w-full gap-2">
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Anonymising…</>
        ) : (
          <><ShieldCheck className="h-4 w-4" />Anonymise {inputMode === "file" ? "File" : "Text"}</>
        )}
      </Button>

      {error && (
        <ErrorState kind="server" inline
          message="Anonymisation failed. Please check your input and try again."
          onRetry={() => mutate()} />
      )}

      {data && <ResultPanel result={data} originalText={activeText} />}
    </div>
  );
}