import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  ShieldCheck,
  Upload,
  Download,
  Shuffle,
  Settings2,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  FileText,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ErrorState } from "@/components/ErrorState";
import { useToast } from "@/hooks/use-toast";

/* ─── types ─── */
type Strategy = "synthetic" | "mask" | "generalize" | "suppress";
type OutputFormat = "csv" | "json" | "parquet";

interface AnonymizeConfig {
  strategy: Strategy;
  output_format: OutputFormat;
  preserve_distributions: boolean;
  noise_level: number; // 0–1
  include_report: boolean;
}

interface AnonymizeResult {
  job_id: string;
  rows_processed: number;
  fields_anonymised: number;
  download_url: string;
  report_url?: string;
  duration_ms: number;
  quality_score: number;
}

/* ─── strategy card ─── */
const strategies: { id: Strategy; label: string; description: string }[] = [
  {
    id: "synthetic",
    label: "Synthetic Generation",
    description: "Replace with statistically equivalent synthetic values",
  },
  {
    id: "mask",
    label: "Data Masking",
    description: "Partially obscure values (e.g. john@***.com)",
  },
  {
    id: "generalize",
    label: "Generalisation",
    description: "Replace precise values with ranges or categories",
  },
  {
    id: "suppress",
    label: "Suppression",
    description: "Remove sensitive fields entirely from the output",
  },
];

function StrategyCard({
  strategy,
  selected,
  onSelect,
}: {
  strategy: (typeof strategies)[0];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`text-left w-full rounded-xl border p-4 transition-all duration-150 ${
        selected
          ? "border-[#00e5a0]/50 bg-[#00e5a0]/8 shadow-[0_0_20px_rgba(0,229,160,0.08)]"
          : "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
            selected ? "border-[#00e5a0]" : "border-white/20"
          }`}
        >
          {selected && (
            <div className="h-2 w-2 rounded-full bg-[#00e5a0]" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{strategy.label}</p>
          <p className="text-xs text-white/40 mt-0.5">{strategy.description}</p>
        </div>
      </div>
    </button>
  );
}

/* ─── noise slider ─── */
function NoiseSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const label =
    value < 0.33 ? "Low — high fidelity" : value < 0.67 ? "Medium" : "High — max privacy";

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-white/50">
        <span>Noise level</span>
        <span className="text-[#00e5a0]">{label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 
          [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full 
          [&::-webkit-slider-thumb]:bg-[#00e5a0] [&::-webkit-slider-thumb]:shadow-md
          bg-white/10 accent-[#00e5a0]"
      />
      <div className="flex justify-between text-[10px] text-white/20">
        <span>More accurate</span>
        <span>More private</span>
      </div>
    </div>
  );
}

/* ─── result panel ─── */
function ResultPanel({ result }: { result: AnonymizeResult }) {
  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-[#00e5a0]" />
        <h3 className="text-sm font-semibold text-white">Anonymisation complete</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Rows processed", value: result.rows_processed.toLocaleString() },
          { label: "Fields anonymised", value: result.fields_anonymised },
          { label: "Duration", value: `${(result.duration_ms / 1000).toFixed(2)}s` },
          { label: "Quality score", value: `${result.quality_score}%` },
        ].map(({ label, value }) => (
          <Card key={label} glass className="p-4 text-center">
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-[11px] text-white/40 uppercase tracking-wider mt-1">{label}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-white/50">
          <span>Data quality retained</span>
          <span>{result.quality_score}%</span>
        </div>
        <Progress value={result.quality_score} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <a href={result.download_url} download>
          <Button variant="stripe" className="gap-2 w-full">
            <Download className="h-4 w-4" />
            Download Anonymised Dataset
          </Button>
        </a>
        {result.report_url && (
          <a href={result.report_url} target="_blank" rel="noreferrer">
            <Button variant="outline" className="gap-2 w-full">
              <FileText className="h-4 w-4" />
              View Report
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── page ─── */
export default function Anonymize() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [config, setConfig] = useState<AnonymizeConfig>({
    strategy: "synthetic",
    output_format: "csv",
    preserve_distributions: true,
    noise_level: 0.35,
    include_report: true,
  });
  const { toast } = useToast();

  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      const form = new FormData();
      form.append("file", file);
      form.append("config", JSON.stringify(config));
      return api
        .post("/anonymize", form, { headers: { "Content-Type": "multipart/form-data" } })
        .then((r) => r.data as AnonymizeResult);
    },
    onError: () =>
      toast({ title: "Anonymisation failed", description: "Please try again.", variant: "destructive" }),
    onSuccess: () =>
      toast({ title: "Done!", description: "Your anonymised dataset is ready." }),
  });

  const patch = (partial: Partial<AnonymizeConfig>) =>
    setConfig((c) => ({ ...c, ...partial }));

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Shuffle className="h-6 w-6 text-[#00e5a0]" />
          Anonymize Data
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Generate privacy-safe synthetic data that preserves statistical patterns
        </p>
      </div>

      {/* Upload */}
      <Card glass className="p-6 space-y-5">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          1 · Upload Dataset
        </h2>

        {file ? (
          <div className="flex items-center gap-4 rounded-xl border border-[#00e5a0]/30 bg-[#00e5a0]/5 px-5 py-4">
            <FileText className="h-8 w-8 text-[#00e5a0] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-white/40 mt-0.5">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={() => { setFile(null); reset(); }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) setFile(f);
            }}
            onClick={() => document.getElementById("anon-file")?.click()}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed py-12 cursor-pointer transition-all ${
              dragging
                ? "border-[#00e5a0] bg-[#00e5a0]/5"
                : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
            }`}
          >
            <input
              id="anon-file"
              type="file"
              accept=".csv,.json,.xlsx,.parquet"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />
            <Upload className="h-8 w-8 text-white/20" />
            <p className="text-sm text-white/50">
              Drop file or <span className="text-[#00e5a0]">browse</span>
            </p>
            <p className="text-xs text-white/25">CSV · JSON · XLSX · Parquet</p>
          </div>
        )}
      </Card>

      {/* Strategy */}
      <Card glass className="p-6 space-y-4">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          2 · Anonymisation Strategy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {strategies.map((s) => (
            <StrategyCard
              key={s.id}
              strategy={s}
              selected={config.strategy === s.id}
              onSelect={() => patch({ strategy: s.id })}
            />
          ))}
        </div>
      </Card>

      {/* Output format */}
      <Card glass className="p-6 space-y-4">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          3 · Output Format
        </h2>
        <div className="flex gap-2">
          {(["csv", "json", "parquet"] as OutputFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => patch({ output_format: fmt })}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-all ${
                config.output_format === fmt
                  ? "border-[#00e5a0]/50 bg-[#00e5a0]/10 text-[#00e5a0]"
                  : "border-white/10 text-white/40 hover:text-white hover:border-white/20"
              }`}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </Card>

      {/* Advanced settings */}
      <Card glass className="overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
          onClick={() => setAdvancedOpen((o) => !o)}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-white/60">
            <Settings2 className="h-4 w-4" />
            Advanced settings
          </div>
          {advancedOpen ? (
            <ChevronUp className="h-4 w-4 text-white/30" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/30" />
          )}
        </button>

        {advancedOpen && (
          <div className="px-6 pb-6 space-y-5 border-t border-white/5">
            <NoiseSlider
              value={config.noise_level}
              onChange={(v) => patch({ noise_level: v })}
            />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Preserve distributions</p>
                <p className="text-xs text-white/35">Keep statistical patterns intact</p>
              </div>
              <button
                onClick={() => patch({ preserve_distributions: !config.preserve_distributions })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  config.preserve_distributions ? "bg-[#00e5a0]" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    config.preserve_distributions ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Include privacy report</p>
                <p className="text-xs text-white/35">PDF audit trail with this job</p>
              </div>
              <button
                onClick={() => patch({ include_report: !config.include_report })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  config.include_report ? "bg-[#00e5a0]" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    config.include_report ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Run button */}
      <Button
        onClick={() => mutate()}
        disabled={!file || isPending}
        variant="stripe"
        size="lg"
        className="w-full gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Anonymise Dataset
          </>
        )}
      </Button>

      {error && (
        <ErrorState
          kind="server"
          inline
          message="Anonymisation failed. Please check your file format and try again."
          onRetry={() => mutate()}
        />
      )}

      {data && <ResultPanel result={data} />}
    </div>
  );
}