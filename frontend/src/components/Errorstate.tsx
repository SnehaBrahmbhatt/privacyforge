import { AlertTriangle, RefreshCw, WifiOff, ServerCrash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ErrorKind = "network" | "server" | "notfound" | "generic";

interface ErrorStateProps {
  /** Type of error — affects icon and default title */
  kind?: ErrorKind;
  /** Override the heading */
  title?: string;
  /** Descriptive message */
  message?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** If true, renders as a compact inline card instead of a centred full-page block */
  inline?: boolean;
  className?: string;
}

const meta: Record<ErrorKind, { icon: React.ReactNode; defaultTitle: string }> = {
  network: {
    icon: <WifiOff className="h-8 w-8 text-amber-400" />,
    defaultTitle: "No connection",
  },
  server: {
    icon: <ServerCrash className="h-8 w-8 text-red-400" />,
    defaultTitle: "Server error",
  },
  notfound: {
    icon: <AlertTriangle className="h-8 w-8 text-white/30" />,
    defaultTitle: "Not found",
  },
  generic: {
    icon: <AlertTriangle className="h-8 w-8 text-amber-400" />,
    defaultTitle: "Something went wrong",
  },
};

export function ErrorState({
  kind = "generic",
  title,
  message,
  onRetry,
  inline = false,
  className,
}: ErrorStateProps) {
  const { icon, defaultTitle } = meta[kind];
  const heading = title ?? defaultTitle;

  if (inline) {
    return (
      <div
        className={cn(
          "flex items-start gap-4 rounded-xl border border-red-500/20",
          "bg-red-500/5 px-5 py-4",
          className
        )}
      >
        <div className="shrink-0 mt-0.5">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{heading}</p>
          {message && (
            <p className="mt-1 text-xs text-white/45 leading-relaxed">{message}</p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-1.5 text-xs text-[#00e5a0] hover:underline"
            >
              <RefreshCw className="h-3 w-3" />
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-5 py-20 px-8",
        className
      )}
    >
      {/* Glow ring behind icon */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-xl opacity-30 bg-amber-400/40 scale-150" />
        <div className="relative rounded-2xl bg-white/5 border border-white/10 p-5">
          {icon}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{heading}</h3>
        {message && (
          <p className="text-sm text-white/45 max-w-sm leading-relaxed">{message}</p>
        )}
      </div>

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}