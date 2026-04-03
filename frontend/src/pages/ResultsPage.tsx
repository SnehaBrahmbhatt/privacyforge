import { useApp } from "@/contexts/AppContext";
import { BeforeAfterView } from "@/components/BeforeAfterView";
import { DownloadPanel } from "@/components/DownloadPanel";
import { RiskChart } from "@/components/RiskChart";
import { ShieldCheck } from "lucide-react";

export default function ResultsPage() {
  const { anonymizedData } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-8 stagger-children">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">Results</h2>
        <p className="text-sm text-muted-foreground mt-1">Compare original and anonymized data side by side</p>
      </div>

      {anonymizedData ? (
        <>
          <DownloadPanel />
          <BeforeAfterView />
          <RiskChart />
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-16 card-shadow text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">No results yet</p>
          <p className="text-xs text-muted-foreground mt-1.5">Upload data and run anonymization to see results here</p>
        </div>
      )}
    </div>
  );
}
