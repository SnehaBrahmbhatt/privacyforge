import { useEffect, useState } from "react";
import { RiskChart } from "@/components/RiskChart";
import { AnonymizationControls } from "@/components/AnonymizationControls";
import { Button } from "@/components/ui/button";
import { Download, ShieldCheck } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function ResultsPage() {
  const { originalData } = useApp();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load result from localStorage
  useEffect(() => {
    setLoading(true);
    const stored = localStorage.getItem("result");
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed.preview || parsed);
    }
    setLoading(false);
  }, []);

  // -----------------------------
  // Download Full Data
  // -----------------------------
  const handleDownloadAll = () => {
    if (!data || data.length === 0) return;

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [Object.keys(data[0]).join(","), ...data.map((row) =>
        Object.values(row).join(",")
      )].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "synthetic_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-10">

      {/* ------------------- Header ------------------- */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          PrivacyForge
          <span className="bg-primary text-white px-2 py-1 rounded text-sm font-semibold">
            Results
          </span>
        </h2>
      </div>

      {/* ------------------- Loading State ------------------- */}
      {loading && (
        <p className="text-sm text-muted-foreground">Processing data...</p>
      )}

      {/* ------------------- Results Table + Controls ------------------- */}
      {data && data.length > 0 ? (
        <div className="space-y-8">

          {/* Table Card */}
          <div className="rounded-2xl border border-border bg-card p-6 card-shadow overflow-auto relative">
            <h3 className="text-xl font-semibold mb-4">📊 Generated Data (Top 20 Rows)</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th
                        key={key}
                        className="border-b text-left px-3 py-2 font-medium text-muted-foreground"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 20).map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      {Object.values(row).map((value: any, j) => (
                        <td key={j} className="px-3 py-2 border-b">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ------------------- Controls ------------------- */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mt-6 gap-4">
              <div className="flex-1">
                <AnonymizationControls />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-64 md:w-80">
                  <RiskChart data={data} />
                </div>
                <Button
                  onClick={handleDownloadAll}
                  className="flex items-center gap-2 rounded-full px-5 py-2 bg-primary text-white hover:bg-primary/90 transition-all"
                >
                  <Download className="h-4 w-4" /> Download Full Data
                </Button>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-16 card-shadow text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            No results yet
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            Generate data from Upload page to see results here
          </p>
        </div>
      )}
    </div>
  );
}