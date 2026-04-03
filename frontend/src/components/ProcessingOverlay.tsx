import { Loader2, Shield } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function ProcessingOverlay() {
  const { isProcessing, processingMessage } = useApp();
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md">
      <div className="rounded-3xl bg-card border border-border p-10 elevated-shadow text-center animate-scale-in max-w-sm">
        <div className="relative mx-auto mb-6 h-20 w-20">
          <div className="absolute inset-0 rounded-full gradient-primary opacity-20 animate-ping" />
          <div className="absolute inset-1 rounded-full gradient-primary opacity-10 animate-ping" style={{ animationDelay: "0.5s" }} />
          <div className="relative h-20 w-20 rounded-full gradient-primary flex items-center justify-center glow-shadow animate-gradient-shift">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <Loader2 className="h-5 w-5 mx-auto mb-4 animate-spin text-primary" />
        <p className="text-sm font-semibold text-foreground">{processingMessage}</p>
        <div className="mt-4 h-1.5 w-56 mx-auto rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full gradient-primary animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
