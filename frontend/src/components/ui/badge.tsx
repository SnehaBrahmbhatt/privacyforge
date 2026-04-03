import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "wm";
}

export const Badge = ({ className, variant = "wm", ...props }: BadgeProps) => {
  const variants = {
    success: "bg-green-500 text-white",
    warning: "bg-yellow-400 text-black",
    danger: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    wm: "bg-gradient-to-r from-green-400 to-green-600 text-white",
  };
  return <span className={cn("px-2 py-1 rounded-full text-sm font-medium", variants[variant], className)} {...props} />;
};