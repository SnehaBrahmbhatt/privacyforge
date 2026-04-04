// Single source of truth for all backend calls.
// Vite proxies /api → http://127.0.0.1:8000  (see vite.config.ts)

const BASE = "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`API ${res.status}: ${detail}`);
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Entity {
  type: string;
  value: string;
  start: number;
  end: number;
  confidence: number;
}

export interface ScanResult {
  entities: Entity[];
  risk_score: number;
  risk_level: "low" | "medium" | "high";
  recommendations: string[];
}

export interface ScanHistory {
  id: string;
  timestamp: string;
  preview: string;
  risk_level: "low" | "medium" | "high";
  entity_count: number;
  scan_result?: ScanResult;
}

export interface AnonymizeResult {
  anonymized_text: string;
  entities_masked: number;
  strategy: string;
}

export interface FrameworkResult {
  name: string;
  compliant: boolean;
  violations: string[];
  score: number;
}

export interface ComplianceResult {
  overall_compliant: boolean;
  frameworks: FrameworkResult[];
}

export interface RecentScan {
  id: string;
  timestamp: string;
  risk_level: "low" | "medium" | "high";
  entity_count: number;
}

export interface DashboardStats {
  total_scans: number;
  risk_score: number;
  pii_detected: number;
  compliance_rate: number;
  recent_scans: RecentScan[];
}

export interface GenerateResult {
  download_url: string;
  schema: Record<string, { type: string }>;
  preview: Record<string, unknown>[];
  row_count: number;
  original_columns?: string[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const api = {
  health: () =>
    apiFetch<{ status: string }>("/health"),

  dashboardStats: () =>
    apiFetch<DashboardStats>("/dashboard/stats"),

  scan: (text: string) =>
    apiFetch<ScanResult>("/scan", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  anonymize: (text: string, strategy: string, entities: string[]) =>
    apiFetch<AnonymizeResult>("/anonymize", {
      method: "POST",
      body: JSON.stringify({ text, strategy, entities }),
    }),

  complianceCheck: (text: string, frameworks: string[]) =>
    apiFetch<ComplianceResult>("/compliance/check", {
      method: "POST",
      body: JSON.stringify({ text, frameworks }),
    }),

  scanHistory: () =>
    apiFetch<ScanHistory[]>("/scans/history"),

  scanById: (id: string) =>
    apiFetch<ScanHistory>(`/scans/${id}`),

  // Upload a CSV file and receive synthetic data back
  generateFromFile: async (file: File): Promise<GenerateResult> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`API ${res.status}: ${detail}`);
    }
    return res.json();
  },

  // Generate from a public CSV URL
  generateFromUrl: (url: string) =>
    apiFetch<GenerateResult>("/generate", {
      method: "POST",
      body: JSON.stringify({ url }),
    }),
};