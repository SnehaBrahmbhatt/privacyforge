import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type ScanHistory } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SkeletonCard } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/ErrorState'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDate, riskBg } from '@/lib/utils'
import { History as HistoryIcon, Search, RefreshCw } from 'lucide-react'

export default function History() {
  const [filter, setFilter] = useState<'all'|'low'|'medium'|'high'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ScanHistory | null>(null)

  // FIX: v5 object syntax + isPending
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['scan-history'],
    queryFn: api.scanHistory,
  })

  const filtered = (data ?? []).filter((s) => {
    if (filter !== 'all' && s.risk_level !== filter) return false
    if (search && !s.preview.toLowerCase().includes(search.toLowerCase()) && !s.id.includes(search)) return false
    return true
  })

  if (isPending) return (
    <div className="space-y-4 animate-fade-in">
      <div className="wm-page-header"><h1 className="wm-page-title">History</h1></div>
      {Array.from({length: 5}).map((_,i) => <SkeletonCard key={i}/>)}
    </div>
  )

  if (isError) return (
    <div className="animate-fade-in">
      <div className="wm-page-header"><h1 className="wm-page-title">History</h1></div>
      <Card><ErrorState onRetry={() => refetch()}/></Card>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="wm-page-header flex items-end justify-between">
        <div>
          <h1 className="wm-page-title">Scan History</h1>
          <p className="wm-page-subtitle">{data?.length ?? 0} scans recorded</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw size={13}/> Refresh
        </Button>
      </div>

      {/* Filters — Watermelon UI tab strip */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-wm-text-muted"/>
          <input className="wm-input pl-8 h-9 text-xs" placeholder="Search scans…" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl border border-wm-border bg-wm-bg-card">
          {(['all','low','medium','high'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f ? 'bg-wm-green/15 text-wm-green border border-wm-green/25' : 'text-wm-text-muted hover:text-wm-text'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <HistoryIcon size={32} className="text-wm-text-dim mb-3"/>
          <p className="text-wm-text-muted text-sm">No scans match your filters</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(scan => (
            <button key={scan.id} onClick={() => setSelected(scan)}
              className="w-full text-left group">
              <Card hover className="flex items-center gap-4 group-hover:border-wm-green/25">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  scan.risk_level==='low' ? 'bg-wm-green' : scan.risk_level==='medium' ? 'bg-amber-400' : 'bg-red-400'
                }`}/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-wm-text truncate">{scan.preview}</p>
                  <p className="text-xs text-wm-text-muted mt-0.5">{formatDate(scan.timestamp)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-wm-text-dim font-mono">{scan.entity_count} entities</span>
                  <Badge variant={scan.risk_level==='low'?'success':scan.risk_level==='medium'?'warning':'danger'} className="capitalize">
                    {scan.risk_level}
                  </Badge>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}

      {/* Detail modal — Watermelon UI dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={selected.risk_level==='low'?'success':selected.risk_level==='medium'?'warning':'danger'} className="capitalize">{selected.risk_level} risk</Badge>
                <span className="text-xs text-wm-text-muted">{formatDate(selected.timestamp)}</span>
              </div>
              <div className="bg-wm-bg rounded-lg border border-wm-border p-3">
                <p className="text-sm text-wm-text font-mono">{selected.preview}</p>
              </div>
              {selected.scan_result && (
                <div className="space-y-2">
                  <p className="wm-section-label">Entities Found</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.scan_result.entities.map((e,i) => (
                      <Badge key={i} variant="outline" className="font-mono text-[10px]">
                        {e.type}: {e.value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}