import { useState, useCallback, useRef } from 'react'

export interface Toast { id: string; title: string; description?: string; variant?: 'default'|'success'|'warning'|'destructive' }

let globalSetToasts: React.Dispatch<React.SetStateAction<Toast[]>> | null = null

export function toast(t: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  globalSetToasts?.((prev) => [...prev, { ...t, id }])
  setTimeout(() => globalSetToasts?.((prev) => prev.filter((x) => x.id !== id)), 4000)
}

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([])
  // FIX: register global setter (stable ref)
  const ref = useRef(setToasts)
  ref.current = setToasts
  globalSetToasts = ref.current
  const dismiss = useCallback((id: string) => setToasts((p) => p.filter((t) => t.id !== id)), [])
  return { toasts, dismiss }
}
export function useToast() {
  return {
    toast,
    ...useToastState(),
  };
}