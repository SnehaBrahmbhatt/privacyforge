import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { DataRow, sampleData, anonymizeData } from "@/lib/mockData";

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
  darkMode: boolean;
  toggleDarkMode: () => void;
  originalData: DataRow[];
  anonymizedData: DataRow[] | null;
  fileName: string | null;
  isProcessing: boolean;
  processingMessage: string;
  options: AnonymizationOptions;
  setOptions: React.Dispatch<React.SetStateAction<AnonymizationOptions>>;
  history: HistoryEntry[];
  uploadData: (data: DataRow[], name: string) => void;
  loadDemo: () => void;
  runAnonymization: () => Promise<void>;
  resetData: () => void;
  reprocess: (entry: HistoryEntry) => void;
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

  const uploadData = useCallback((data: DataRow[], name: string) => {
    setOriginalData(data);
    setAnonymizedData(null);
    setFileName(name);
  }, []);

  const loadDemo = useCallback(() => {
    setOriginalData(sampleData);
    setAnonymizedData(null);
    setFileName("demo_dataset.csv");
  }, []);

  const runAnonymization = useCallback(async () => {
    setIsProcessing(true);
    const messages = [
      "Scanning sensitive fields...",
      "Applying anonymization...",
      "Finalizing secure dataset...",
    ];
    for (const msg of messages) {
      setProcessingMessage(msg);
      await new Promise((r) => setTimeout(r, 900));
    }
    const result = anonymizeData(originalData, options);
    setAnonymizedData(result);
    setIsProcessing(false);
    setProcessingMessage("");
    setHistory((prev) => [
      { id: crypto.randomUUID(), fileName: fileName || "unknown", date: new Date(), data: originalData },
      ...prev,
    ]);
  }, [originalData, options, fileName]);

  const resetData = useCallback(() => {
    setAnonymizedData(null);
  }, []);

  const reprocess = useCallback((entry: HistoryEntry) => {
    setOriginalData(entry.data);
    setFileName(entry.fileName);
    setAnonymizedData(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        darkMode, toggleDarkMode, originalData, anonymizedData, fileName,
        isProcessing, processingMessage, options, setOptions, history,
        uploadData, loadDemo, runAnonymization, resetData, reprocess,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
