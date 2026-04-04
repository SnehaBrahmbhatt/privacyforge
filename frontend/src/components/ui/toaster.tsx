import { useToast } from "@/hooks/use-toast";
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  default: <Info className="h-4 w-4 text-[#00e5a0]" />,
  success: <CheckCircle2 className="h-4 w-4 text-[#00e5a0]" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  error: <XCircle className="h-4 w-4 text-red-400" />,
  destructive: <XCircle className="h-4 w-4 text-red-400" />,
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => {
        const variant = (toast.variant as keyof typeof iconMap) ?? "default";
        const icon = iconMap[variant] ?? iconMap.default;

        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3",
              "bg-[#0d1117]/95 backdrop-blur-xl border border-white/10",
              "shadow-2xl shadow-black/50",
              "animate-in slide-in-from-bottom-2 fade-in-0 duration-200",
              variant === "destructive" || variant === "error"
                ? "border-red-500/30"
                : "border-white/10"
            )}
          >
            <div className="mt-0.5 shrink-0">{icon}</div>

            <div className="flex-1 min-w-0">
              {toast.title && (
                <p className="text-sm font-semibold text-white leading-snug">
                  {toast.title}
                </p>
              )}
              {toast.description && (
                <p className="text-xs text-white/50 mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded p-0.5 text-white/30 hover:text-white/70 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}