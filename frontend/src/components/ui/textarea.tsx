import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Show a character counter in the bottom-right corner */
  maxChars?: number;
  /** Label shown above the textarea */
  label?: string;
  /** Helper / error text shown below */
  hint?: string;
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxChars, label, hint, error, value, onChange, ...props }, ref) => {
    const [count, setCount] = React.useState(
      typeof value === "string" ? value.length : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-xs font-medium text-white/60 tracking-wide uppercase">
            {label}
          </label>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            value={value}
            onChange={handleChange}
            className={cn(
              // Layout
              "flex w-full min-h-[120px] resize-y rounded-xl px-4 py-3",
              // WM glass bg
              "bg-white/[0.04] backdrop-blur-sm",
              // Border
              "border transition-colors duration-150",
              error
                ? "border-red-500/50 focus:border-red-500"
                : "border-white/10 focus:border-[#00e5a0]/60",
              // Text
              "text-sm text-white placeholder:text-white/25",
              // Focus ring
              "outline-none focus:ring-2",
              error
                ? "focus:ring-red-500/20"
                : "focus:ring-[#00e5a0]/15",
              // Scrollbar
              "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10",
              // Bottom padding when counter present
              maxChars && "pb-7",
              className
            )}
            {...props}
          />

          {maxChars && (
            <span
              className={cn(
                "absolute bottom-2.5 right-3 text-[10px] tabular-nums",
                count > maxChars * 0.9
                  ? count >= maxChars
                    ? "text-red-400"
                    : "text-amber-400"
                  : "text-white/25"
              )}
            >
              {count}/{maxChars}
            </span>
          )}
        </div>

        {hint && (
          <p className={cn("text-xs", error ? "text-red-400" : "text-white/35")}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };