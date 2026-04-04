import { useApp } from "@/contexts/AppContext";
import { DataPreviewTable } from "@/components/DataPreviewTable";
import { Button } from "@/components/ui/button";
import { Download, ShieldCheck, ExternalLink } from "lucide-react";

export default function ResultsPage() {
  const { generateResult, originalData, fileName } = useApp();

  const data = generateResult?.preview ?? originalData;

  const handleDownloadCSV = () => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((r) => Object.values(r).join(","));
    const blob = new Blob([[headers, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `synthetic_${fileName ?? "data"}.csv`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Results</h2>
          {generateResult && (
            <p className="text-sm text-muted-foreground mt-1">
              {generateResult.row_count} synthetic rows generated
              {fileName ? ` from ${fileName}` : ""}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {generateResult?.download_url && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full"
              onClick={() => window.open(generateResult.download_url, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Full dataset (Supabase)
            </Button>
          )}
          <Button
            onClick={handleDownloadCSV}
            disabled={!data.length}
            size="sm"
            className="gap-2 rounded-full"
          >
            <Download className="h-4 w-4" />
            Download preview CSV
          </Button>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 card-shadow">
          <DataPreviewTable
            data={data}
            title={`Generated preview — top ${Math.min(data.length, 20)} rows`}
          />

          {generateResult?.schema && (
            <div className="mt-6 border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Detected schema
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(generateResult.schema).map(([col, meta]) => (
                  <span
                    key={col}
                    className="text-xs rounded-full bg-muted px-3 py-1 text-foreground"
                  >
                    {col}: <span className="text-primary">{meta.type}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-16 card-shadow text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">No results yet</p>
          <p className="text-xs text-muted-foreground mt-1.5">
            Upload a CSV from the Anonymize page to see results here.
          </p>
        </div>
      )}
    </div>
  );
}