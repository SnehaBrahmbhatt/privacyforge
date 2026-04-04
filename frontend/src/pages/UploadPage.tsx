import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { DataPreviewTable } from "@/components/DataPreviewTable";
import { AnonymizationControls } from "@/components/AnonymizationControls";
import { DataRow } from "@/lib/mockData"; // same type as DataPreviewTable

export default function UploadPage() {
  const { setUploadedData, uploadedData } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [error, setError] = useState("");

  // File select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const validTypes = ["text/csv", "application/json"];
    if (!validTypes.includes(f.type)) {
      setError("Only CSV or JSON allowed");
      return;
    }
    setFile(f);
    setFileName(f.name);
    setError("");
  };

  // Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    const validTypes = ["text/csv", "application/json"];
    if (!validTypes.includes(f.type)) {
      setError("Only CSV or JSON allowed");
      return;
    }
    setFile(f);
    setFileName(f.name);
    setError("");
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  // Delete
  const handleDelete = () => {
    setFile(null);
    setFileName("");
    setUrlInput("");
    setUploadedData([]);
    setError("");
  };

  // Analyze
  const handleAnalyze = () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseDataToRows(text);
      setUploadedData(rows);
    };
    reader.readAsText(file);
  };

  // Parse CSV or JSON into DataRow[]
  const parseDataToRows = (text: string): DataRow[] => {
    try {
      const trimmed = text.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        const json = JSON.parse(trimmed);
        return Array.isArray(json) ? json : [json];
      } else {
        const lines = trimmed.split("\n").filter(Boolean);
        const header = lines[0].split(",");
        return lines.slice(1).map((line, idx) => {
          const values = line.split(",");
          const row: any = {};
          header.forEach((h, i) => (row[h.trim()] = values[i]?.trim() || ""));
          row.id = row.id ? Number(row.id) : idx + 1;
          row.age = row.age ? Number(row.age) : 0;
          return row as DataRow;
        });
      }
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col gap-6 overflow-y-auto">
      <h1 className="text-3xl font-bold text-foreground">Upload & Analyze</h1>

      {/* Drag/Drop / Buttons */}
      <div
        className="border-2 border-dashed p-6 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 hover:border-primary transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <span className="text-center md:text-left flex-1">{fileName || "Drag & drop CSV/JSON here"}</span>
        <div className="flex gap-2">
          <input type="file" accept=".csv,.json" onChange={handleFileChange} id="fileInput" className="hidden" />
          <label
            htmlFor="fileInput"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 cursor-pointer"
          >
            Choose File
          </label>
          <button
            onClick={handleAnalyze}
            className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700"
          >
            Analyze
          </button>
          {file && (
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Or enter CSV/JSON URL"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          className="border rounded-xl p-2 flex-1"
        />
        <button
          onClick={async () => {
            if (!urlInput) return;
            try {
              const res = await fetch(urlInput);
              const text = await res.text();
              const rows = parseDataToRows(text);
              setUploadedData(rows);
              setFileName(urlInput.split("/").pop() || "file");
              setError("");
            } catch {
              setError("Failed to fetch file from URL");
            }
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700"
        >
          Load URL
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Data Preview */}
      <DataPreviewTable data={uploadedData || []} highlightSensitive={true} />

      {/* Anonymization controls */}
      <AnonymizationControls />
    </div>
  );
}