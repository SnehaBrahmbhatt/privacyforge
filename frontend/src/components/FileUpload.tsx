import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { DataRow } from "@/lib/mockData";

export function FileUpload() {
  const { uploadData, fileName } = useApp();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);

  const parseCSV = (text: string): DataRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    return lines.slice(1).map((line, i) => {
      const cols = line.split(",").map((c) => c.trim());
      return {
        id: i + 1,
        name: cols[0] || "",
        email: cols[1] || "",
        phone: cols[2] || "",
        age: parseInt(cols[3]) || 0,
        city: cols[4] || "",
      };
    });
  };

  const handleFile = useCallback((file: File) => {
    setLocalFile(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUploadClick = async () => {
    if (!localFile) return;
    setUploading(true);
    const text = await localFile.text();
    const data = parseCSV(text);
    await new Promise((r) => setTimeout(r, 600));
    uploadData(data, localFile.name);
    setUploading(false);
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
          dragging
            ? "border-primary bg-primary/5 scale-[1.01] glow-shadow"
            : "border-border hover:border-primary/40 hover:bg-muted/30"
        }`}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="h-14 w-14 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
          <CloudUpload className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          {localFile ? localFile.name : "Drag & drop a CSV file here, or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-1.5">Supports .csv files up to 10MB</p>
      </div>

      {(localFile || fileName) && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{localFile?.name || fileName}</p>
            <p className="text-xs text-muted-foreground">Ready to analyze</p>
          </div>
          <Button
            onClick={handleUploadClick}
            disabled={!localFile || uploading}
            size="sm"
            className="gap-2 rounded-full px-5"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload & Analyze
          </Button>
        </div>
      )}
    </div>
  );
}
