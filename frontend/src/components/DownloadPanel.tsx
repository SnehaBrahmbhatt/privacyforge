import { Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";

export function DownloadPanel() {
  const { anonymizedData } = useApp();
  if (!anonymizedData) return null;

  const downloadCSV = () => {
    const headers = "name,email,phone,age,city";
    const rows = anonymizedData.map((r) => `${r.name},${r.email},${r.phone},${r.age},${r.city}`);
    const blob = new Blob([headers + "\n" + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "anonymized_data.csv";
    a.click();
  };

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(anonymizedData, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "anonymized_data.json";
    a.click();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 card-shadow flex items-center justify-between animate-fade-in glass-subtle">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-accent/10 flex items-center justify-center">
          <FileDown className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight">Download Anonymized Data</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{anonymizedData.length} rows processed successfully</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={downloadCSV} className="gap-2 rounded-full px-4 hover:border-primary/30 transition-all duration-200">
          <Download className="h-3.5 w-3.5" /> CSV
        </Button>
        <Button variant="outline" size="sm" onClick={downloadJSON} className="gap-2 rounded-full px-4 hover:border-primary/30 transition-all duration-200">
          <Download className="h-3.5 w-3.5" /> JSON
        </Button>
      </div>
    </div>
  );
}
