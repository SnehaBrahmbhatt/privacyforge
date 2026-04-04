import { cn } from '@/lib/utils'

interface ProgressProps { value?: number; className?: string; variant?: 'linear'|'ring'; size?: number; strokeWidth?: number; label?: string }

export function Progress({ value = 0, className, variant = 'linear' }: ProgressProps) {
  if (variant === 'linear') {
    return (
      <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-wm-border', className)}>
        <div
          className="h-full bg-wm-green transition-all duration-700 ease-out rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    )
  }
  // Ring variant
  const r = 36, circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className={cn('rotate-[-90deg]', className)}>
      <circle cx="44" cy="44" r={r} stroke="rgba(34,197,94,0.1)" strokeWidth="8" fill="none" />
      <circle cx="44" cy="44" r={r} stroke="#22c55e" strokeWidth="8" fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" className="transition-all duration-700 ease-out" />
    </svg>
  )
}