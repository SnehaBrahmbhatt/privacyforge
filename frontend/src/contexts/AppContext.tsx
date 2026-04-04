import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { api, ScanResult, GenerateResult } from "@/lib/api";
import { sampleData, anonymizeData } from "@/lib/mockData";

// ── DataRow: dynamic now, not fixed 6 columns ─────────────────────────────────
export type DataRow = Record<string, unknown> & { id?: number };

interface HistoryEntry {
  id: string;
  fileName: string;
  date: Date;
  data: DataRow[];
}

interface AnonymizationOptions {
  maskNames: boolean;
  removeEmails: boolean;
  generalizeAges: boolean;
  hidePhones: boolean;
}

interface AppState {
  // UI
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Data
  originalData: DataRow[];
  anonymizedData: DataRow[] | null;
  fileName: string | null;
  isProcessing: boolean;
  processingMessage: string;
  error: string | null;

  // Scan
  lastScanResult: ScanResult | null;
  generateResult: GenerateResult | null;

  // Options & history
  options: AnonymizationOptions;
  setOptions: React.Dispatch<React.SetStateAction<AnonymizationOptions>>;
  history: HistoryEntry[];

  // Actions
  uploadData: (data: DataRow[], name: string) => void;
  uploadFile: (file: File) => Promise<void>;   // ← calls real backend
  loadDemo: () => void;
  runAnonymization: () => Promise<void>;
  runScan: (text: string) => Promise<void>;    // ← calls real backend
  resetData: () => void;
  reprocess: (entry: HistoryEntry) => void;
  clearError: () => void;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [originalData, setOriginalData] = useState<DataRow[]>([]);
  const [anonymizedData, setAnonymizedData] = useState<DataRow[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [options, setOptions] = useState<AnonymizationOptions>({
    maskNames: true,
    removeEmails: true,
    generalizeAges: true,
    hidePhones: true,
  });

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Set data from a local parse (used by demo + manual parse fallback)
  const uploadData = useCallback((data: DataRow[], name: string) => {
    setOriginalData(data);
    setAnonymizedData(null);
    setFileName(name);
    setError(null);
    setGenerateResult(null);
  }, []);

  // Upload a file to the real backend → get synthetic data back
  const uploadFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProcessingMessage("Uploading file to PrivacyForge...");
    try {
      const result = await api.generateFromFile(file);
      setGenerateResult(result);
      setOriginalData(result.preview as DataRow[]);
      setAnonymizedData(null);
      setFileName(file.name);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setIsProcessing(false);
      setProcessingMessage("");
    }
  }, []);

  const loadDemo = useCallback(() => {
    setOriginalData(sampleData as DataRow[]);
    setAnonymizedData(null);
    setFileName("demo_dataset.csv");
    setError(null);
    setGenerateResult(null);
  }, []);

  // Local anonymization (client-side, for the demo/Anonymize page)
  const runAnonymization = useCallback(async () => {
    setIsProcessing(true);
    const messages = [
      "Scanning sensitive fields...",
      "Applying anonymization...",
      "Finalising secure dataset...",
    ];
    for (const msg of messages) {
      setProcessingMessage(msg);
      await new Promise((r) => setTimeout(r, 800));
    }
    // anonymizeData still works on the fixed DataRow shape for the demo
    const result = anonymizeData(originalData as Parameters<typeof anonymizeData>[0], options);
    setAnonymizedData(result as DataRow[]);
    setIsProcessing(false);
    setProcessingMessage("");
    setHistory((prev) => [
      {
        id: crypto.randomUUID(),
        fileName: fileName || "unknown",
        date: new Date(),
        data: originalData,
      },
      ...prev,
    ]);
  }, [originalData, options, fileName]);

  // Real backend PII scan
  const runScan = useCallback(async (text: string) => {
    setIsProcessing(true);
    setError(null);
    setProcessingMessage("Scanning for PII...");
    try {
      const result = await api.scan(text);
      setLastScanResult(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Scan failed.");
    } finally {
      setIsProcessing(false);
      setProcessingMessage("");
    }
  }, []);

  const resetData = useCallback(() => {
    setAnonymizedData(null);
    setError(null);
  }, []);

  const reprocess = useCallback((entry: HistoryEntry) => {
    setOriginalData(entry.data);
    setFileName(entry.fileName);
    setAnonymizedData(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        darkMode, toggleDarkMode,
        originalData, anonymizedData, fileName,
        isProcessing, processingMessage, error, clearError,
        lastScanResult, generateResult,
        options, setOptions, history,
        uploadData, uploadFile, loadDemo,
        runAnonymization, runScan, resetData, reprocess,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};