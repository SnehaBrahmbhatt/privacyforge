import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

export const Progress = ({ value, max = 100, className }: ProgressProps) => {
  const percent = Math.min(Math.max(value / max, 0), 1) * 100;
  return (
    <div className={cn("w-full h-3 bg-white/20 rounded-full overflow-hidden", className)}>
      <div className="h-full bg-green-500 transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
};