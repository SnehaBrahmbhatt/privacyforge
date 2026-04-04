import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}

export function riskColor(level: string) {
  if (level === "high") return "text-red-500"
  if (level === "medium") return "text-yellow-500"
  return "text-green-500"
}

export function riskBg(level: string) {
  if (level === "high") return "bg-red-100"
  if (level === "medium") return "bg-yellow-100"
  return "bg-green-100"
}