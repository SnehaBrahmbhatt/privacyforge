const BASE = '/api'   // goes through Vite proxy → localhost:8000

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

export const api = {
  health: () => apiFetch<{ status: string }>('/health'),
  dashboardStats: () => apiFetch<DashboardStats>('/dashboard/stats'),
  scan: (text: string) => apiFetch<ScanResult>('/scan', { method: 'POST', body: JSON.stringify({ text }) }),
  anonymize: (text: string, strategy: string, entities: string[]) =>
    apiFetch<AnonymizeResult>('/anonymize', { method: 'POST', body: JSON.stringify({ text, strategy, entities }) }),
  complianceCheck: (text: string, frameworks: string[]) =>
    apiFetch<ComplianceResult>('/compliance/check', { method: 'POST', body: JSON.stringify({ text, frameworks }) }),
  scanHistory: () => apiFetch<ScanHistory[]>('/scans/history'),
  scanById: (id: string) => apiFetch<ScanHistory>(`/scans/${id}`),
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface DashboardStats {
  total_scans: number; risk_score: number; pii_detected: number; compliance_rate: number;
  recent_scans: RecentScan[];
}
export interface RecentScan { id: string; timestamp: string; risk_level: 'low'|'medium'|'high'; entity_count: number; }
export interface Entity { type: string; value: string; start: number; end: number; confidence: number; }
export interface ScanResult { entities: Entity[]; risk_score: number; risk_level: 'low'|'medium'|'high'; recommendations: string[]; }
export interface AnonymizeResult { anonymized_text: string; entities_masked: number; strategy: string; }
export interface ComplianceResult { overall_compliant: boolean; frameworks: FrameworkResult[]; }
export interface FrameworkResult { name: string; compliant: boolean; violations: string[]; score: number; }
export interface ScanHistory { id: string; timestamp: string; preview: string; risk_level: 'low'|'medium'|'high'; entity_count: number; scan_result?: ScanResult; }