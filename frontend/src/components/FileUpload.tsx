import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, CloudUpload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";

export function FileUpload() {
  const { uploadFile, uploadData, fileName, error, clearError } = useApp();
  const [dragging, setDragging] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith(".csv")) {
        return;
      }
      setLocalFile(file);
      clearError();
    },
    [clearError]
  );

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
    try {
      // Try the real backend first
      await uploadFile(localFile);
    } catch {
      // If backend is unavailable, fall back to local CSV parse
      const text = await localFile.text();
      const lines = text.trim().split("\n");
      if (lines.length >= 2) {
        const headers = lines[0].split(",").map((h) => h.trim());
        const rows = lines.slice(1).map((line, i) => {
          const cols = line.split(",").map((c) => c.trim());
          const row: Record<string, unknown> = { id: i + 1 };
          headers.forEach((h, idx) => {
            row[h] = isNaN(Number(cols[idx])) ? cols[idx] : Number(cols[idx]);
          });
          return row;
        });
        uploadData(rows, localFile.name);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer group ${
          dragging
            ? "border-primary bg-primary/5 scale-[1.01]"
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
        <p className="text-xs text-muted-foreground mt-1.5">Supports .csv files up to 10 MB</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {(localFile || fileName) && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {localFile?.name || fileName}
            </p>
            <p className="text-xs text-muted-foreground">Ready to analyse</p>
          </div>
          <Button
            onClick={handleUploadClick}
            disabled={!localFile || uploading}
            size="sm"
            className="gap-2 rounded-full px-5"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload & Analyse
          </Button>
        </div>
      )}
    </div>
  );
}