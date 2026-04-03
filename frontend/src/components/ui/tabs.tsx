import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;
export const TabsList = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <TabsPrimitive.List className={cn("flex space-x-2 border-b border-white/20", className)} {...props} />
);
export const TabsTrigger = ({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
  <TabsPrimitive.Trigger className={cn("px-4 py-2 text-sm font-medium text-white/80 data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-green-400", className)} {...props} />
);
export const TabsContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <TabsPrimitive.Content className={cn("mt-4", className)} {...props} />
);