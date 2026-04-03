import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  glass?: boolean;
}

export const Card = ({ className, glow, glass, ...props }: CardProps) => {
  const base = "p-4 rounded-xl shadow-md bg-white/10";
  return (
    <div
      className={cn(
        base,
        glow && "shadow-green-400/50",
        glass && "backdrop-blur-md border border-white/20",
        className
      )}
      {...props}
    />
  );
};