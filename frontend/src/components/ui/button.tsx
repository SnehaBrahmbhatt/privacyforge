import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "glass" | "stripe";
}

export const Button = ({ className, variant = "default", ...props }: ButtonProps) => {
  const base = "px-4 py-2 rounded-md font-medium transition-all";
  const variants = {
    default: "bg-green-500 text-white hover:bg-green-600",
    outline: "border border-green-500 text-green-500 hover:bg-green-50",
    ghost: "bg-transparent text-green-500 hover:bg-green-100",
    glass: "bg-white/20 backdrop-blur-md text-green-500",
    stripe: "bg-gradient-to-r from-green-400 to-green-600 text-white",
  };
  return <button className={cn(base, variants[variant], className)} {...props} />;
};