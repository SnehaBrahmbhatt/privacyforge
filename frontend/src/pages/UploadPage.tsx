import { useApp } from "@/contexts/AppContext";
import { FileUpload } from "@/components/FileUpload";
import { DataPreviewTable } from "@/components/DataPreviewTable";
import { AnonymizationControls } from "@/components/AnonymizationControls";
import { RiskChart } from "@/components/RiskChart";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function UploadPage() {
  const { originalData, loadDemo } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-8 stagger-children">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Upload Data</h2>
          <p className="text-sm text-muted-foreground mt-1">Upload a CSV file to scan for sensitive data</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadDemo}
          className="gap-2 rounded-full px-5 hover:border-primary/30 hover:glow-shadow transition-all duration-300"
        >
          <Zap className="h-3.5 w-3.5" /> Try Demo Data
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 card-shadow hover:elevated-shadow transition-shadow duration-300">
        <FileUpload />
      </div>

      {originalData.length > 0 && (
        <div className="grid md:grid-cols-3 gap-5">
          <div className="md:col-span-2 rounded-2xl border border-border bg-card p-6 card-shadow">
            <DataPreviewTable data={originalData} title="📋 Data Preview" highlightSensitive />
          </div>
          <div className="space-y-5">
            <AnonymizationControls />
            <RiskChart />
          </div>
        </div>
      )}
    </div>
  );
}
