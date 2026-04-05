import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LayoutDashboard, ScanSearch, ShieldCheck, FileText, History, X, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useState, useEffect } from 'react'

const NAV = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/scan',       icon: ScanSearch,      label: 'Privacy Scan' },
  { to: '/anonymize',  icon: ShieldCheck,     label: 'Anonymize'    },
  { to: '/compliance', icon: FileText,        label: 'Compliance'   },
  { to: '/history',    icon: History,         label: 'History'      },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Fix: initialise from localStorage; if nothing stored, default to dark
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('pf-theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Sync the .dark class on mount so the sidebar state reflects the real DOM
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: api.health,
    refetchInterval: 30_000,
    retry: false,
  })

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('pf-theme', next ? 'dark' : 'light')
  }

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-30 w-64 flex flex-col border-r transition-transform duration-300',
      'bg-wm-bg border-wm-border',
      'lg:relative lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-wm-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-wm-green/20 border border-wm-green/30 flex items-center justify-center shadow-wm-sm">
            <span className="text-wm-green font-display font-bold text-sm">PF</span>
          </div>
          <div>
            <div className="font-display font-bold text-wm-green text-sm leading-none">PrivacyForge</div>
            <div className="text-wm-text-dim text-[10px] mt-0.5">v1.0 · AI Privacy Suite</div>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 hover:text-wm-text text-wm-text-muted">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-wm-green/15 text-wm-green border border-wm-green/25 shadow-wm-sm'
                : 'text-wm-text-muted hover:text-wm-text hover:bg-wm-green/5'
            )}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-4 space-y-2 border-t border-wm-border pt-3">
        {/* Backend status */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-wm-bg-card border border-wm-border">
          <div className={cn('w-2 h-2 rounded-full', health ? 'bg-wm-green animate-pulse' : 'bg-red-500')} />
          <span className="text-xs text-wm-text-muted">{health ? 'Backend online' : 'Backend offline'}</span>
        </div>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-wm-text-muted hover:text-wm-text hover:bg-wm-green/5 transition-all"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
  )
}