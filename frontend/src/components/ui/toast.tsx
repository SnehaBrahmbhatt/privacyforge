import * as React from "react";
import { cn } from "@/lib/utils";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">{children}</div>
);

export const Toast = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("bg-green-500 text-white rounded-lg p-4 shadow-md flex items-start gap-2", className)} {...props}>
      {children}
    </div>
  )
);

export const ToastTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="font-bold text-sm">{children}</div>
);

export const ToastDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-sm text-white/90">{children}</div>
);

export const ToastClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button className="ml-auto text-white/70 hover:text-white" {...props}>✕</button>
);

export const ToastViewport: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">{children}</div>
);