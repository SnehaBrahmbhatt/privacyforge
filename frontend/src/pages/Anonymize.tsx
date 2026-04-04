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
import { api, type AnonymizeResult } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// Bug 8 fix: was "@/components/ErrorState" (capital S) but actual file is "Errorstate.tsx"
import { ErrorState } from "@/components/Errorstate";
import { useToast } from "@/hooks/use-toast";

/* ─── types ─── */
// These strategy values match the Literal in backend schemas.py:
// Literal["mask", "redact", "replace", "hash"]
type Strategy = "mask" | "redact" | "replace" | "hash";

/* ─── strategy options ─── */
const strategies: { id: Strategy; label: string; description: string }[] = [
  {
    id: "mask",
    label: "Data Masking",
    description: "Partially obscure values (e.g. j***@***.com)",
  },
  {
    id: "redact",
    label: "Redaction",
    description: "Replace with labelled placeholders like [EMAIL]",
  },
  {
    id: "replace",
    label: "Synthetic Replacement",
    description: "Substitute with realistic fake values via Faker",
  },
  {
    id: "hash",
    label: "Pseudonymisation",
    description: "Deterministic 8-char hex pseudonym (reversible with key)",
  },
];

/* ─── strategy card ─── */
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
          {selected && <div className="h-2 w-2 rounded-full bg-[#00e5a0]" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{strategy.label}</p>
          <p className="text-xs text-white/40 mt-0.5">{strategy.description}</p>
        </div>
      </div>
    </button>
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Entities masked", value: result.entities_masked },
          { label: "Original entities", value: result.original_entity_count ?? "—" },
          { label: "Strategy used", value: result.strategy },
        ].map(({ label, value }) => (
          <Card key={label} glass className="p-4 text-center">
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-[11px] text-white/40 uppercase tracking-wider mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {result.entities_masked > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/50">
            <span>Entities anonymised</span>
            <span>{result.entities_masked} / {result.original_entity_count ?? result.entities_masked}</span>
          </div>
          <Progress
            value={
              result.original_entity_count
                ? Math.round((result.entities_masked / result.original_entity_count) * 100)
                : 100
            }
          />
        </div>
      )}
    </div>
  );
}

/* ─── page ─── */
export default function Anonymize() {
  const [text, setText] = useState("");
  const [strategy, setStrategy] = useState<Strategy>("mask");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [entityFilter, setEntityFilter] = useState<string[]>([]);
  const { toast } = useToast();

  // Bug fix: was using axios-style api.post("/anonymize", form, ...) which doesn't exist.
  // Now uses api.anonymize() from api.ts which sends POST /api/anonymize correctly.
  const { mutate, data, isPending, error, reset } = useMutation({
    mutationFn: () => api.anonymize(text, strategy, entityFilter),
    onError: () =>
      toast({ title: "Anonymisation failed", description: "Please try again.", variant: "destructive" }),
    onSuccess: (result) =>
      toast({
        title: "Done!",
        description: `Masked ${result.entities_masked} entities using ${result.strategy}.`,
      }),
  });

  const canRun = text.trim().length > 10;

  const ENTITY_TYPES = ["email", "phone", "name", "credit_card", "ip_address"];

  const toggleEntity = (e: string) =>
    setEntityFilter((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );

  return (
    <div className="min-h-screen p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Shuffle className="h-6 w-6 text-[#00e5a0]" />
          Anonymize Data
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Remove or replace PII from your text using your chosen strategy
        </p>
      </div>

      {/* Text input */}
      <Card glass className="p-6 space-y-4">
        <h2 className="text-xs font-semibold text-white/50 uppercase tracking-wider">
          1 · Paste Text
        </h2>
        <textarea
          placeholder={`Paste text, CSV, or JSON containing PII...\n\nExample:\nHello, my name is John Doe. My email is john.doe@example.com and my phone is +1-555-0100.`}
          value={text}
          onChange={(e) => { setText(e.target.value); reset(); }}
          className="w-full min-h-[160px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-white/80 placeholder:text-white/25 focus:outline-none focus:border-[#00e5a0]/40 resize-none"
        />
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
              selected={strategy === s.id}
              onSelect={() => { setStrategy(s.id); reset(); }}
            />
          ))}
        </div>
      </Card>

      {/* Advanced: entity type filter */}
      <Card glass className="overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
          onClick={() => setAdvancedOpen((o) => !o)}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-white/60">
            <Settings2 className="h-4 w-4" />
            Advanced — target specific entity types
          </div>
          {advancedOpen ? (
            <ChevronUp className="h-4 w-4 text-white/30" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/30" />
          )}
        </button>

        {advancedOpen && (
          <div className="px-6 pb-6 border-t border-white/5 pt-4 space-y-3">
            <p className="text-xs text-white/40">
              Select specific entity types to anonymise. Leave all unchecked to anonymise everything.
            </p>
            <div className="flex flex-wrap gap-2">
              {ENTITY_TYPES.map((e) => {
                const active = entityFilter.includes(e);
                return (
                  <button
                    key={e}
                    onClick={() => toggleEntity(e)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      active
                        ? "border-[#00e5a0]/50 bg-[#00e5a0]/10 text-[#00e5a0]"
                        : "border-white/10 text-white/40 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {e.replace("_", " ")}
                  </button>
                );
              })}
            </div>
            {entityFilter.length > 0 && (
              <button
                onClick={() => setEntityFilter([])}
                className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Clear filter (anonymise all types)
              </button>
            )}
          </div>
        )}
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
            Anonymising…
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Anonymise Text
          </>
        )}
      </Button>

      {error && (
        <ErrorState
          kind="server"
          inline
          message="Anonymisation failed. Please check your input and try again."
          onRetry={() => mutate()}
        />
      )}

      {/* Anonymised output */}
      {data && (
        <div className="space-y-4">
          <ResultPanel result={data} />
          <Card glass className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Anonymised Output</h3>
              <button
                onClick={() => navigator.clipboard.writeText(data.anonymized_text)}
                className="text-xs text-[#00e5a0] hover:underline"
              >
                Copy
              </button>
            </div>
            <pre className="text-sm font-mono text-white/80 whitespace-pre-wrap break-words rounded-lg bg-white/5 border border-white/8 p-4 max-h-72 overflow-y-auto">
              {data.anonymized_text}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}