import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...props }, ref) => (
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn("fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 p-6 rounded-xl border border-green-400", className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  )
);
DialogContent.displayName = "DialogContent";