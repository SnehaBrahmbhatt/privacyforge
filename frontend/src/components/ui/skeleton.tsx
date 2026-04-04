import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use "card" for a full card-shaped block, "line" for text rows */
  variant?: "default" | "card" | "line" | "circle";
}

export function Skeleton({ className, variant = "default", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        // Base shimmer
        "relative overflow-hidden rounded-md bg-white/5",
        "before:absolute before:inset-0",
        "before:-translate-x-full before:animate-[shimmer_1.6s_infinite]",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-white/8 before:to-transparent",
        // Variants
        variant === "card" && "rounded-xl h-40 w-full",
        variant === "line" && "h-3 w-full rounded-full",
        variant === "circle" && "rounded-full",
        className
      )}
      {...props}
    />
  );
}

/** Convenience: stack of skeleton lines mimicking a paragraph */
export function SkeletonParagraph({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="line"
          className={i === lines - 1 ? "w-2/3" : "w-full"}
        />
      ))}
    </div>
  );
}

/** Convenience: card-shaped skeleton with a header row */
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="h-9 w-9" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="line" className="w-1/3" />
          <Skeleton variant="line" className="w-1/4 h-2" />
        </div>
      </div>
      <SkeletonParagraph lines={3} />
    </div>
  );
}