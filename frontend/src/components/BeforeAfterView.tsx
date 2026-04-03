import { useApp } from "@/contexts/AppContext";
import { DataPreviewTable } from "./DataPreviewTable";

export function BeforeAfterView() {
  const { originalData, anonymizedData } = useApp();

  if (!anonymizedData) return null;

  return (
    <div className="grid md:grid-cols-2 gap-5 animate-fade-in">
      <div className="rounded-2xl border border-border bg-card p-5 card-shadow">
        <DataPreviewTable data={originalData} title="📄 Original Data" highlightSensitive />
      </div>
      <div className="rounded-2xl border border-accent/30 bg-card p-5 card-shadow animate-border-glow">
        <DataPreviewTable data={anonymizedData} title="🔒 Anonymized Data" />
      </div>
    </div>
  );
}
