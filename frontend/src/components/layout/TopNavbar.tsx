import { Moon, Sun, ShieldCheck } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function TopNavbar() {
  const { darkMode, toggleDarkMode } = useApp();

  return (
    <header className="h-16 border-b border-border bg-card/60 glass flex items-center justify-between px-8 shrink-0">
      <h1 className="text-sm font-semibold text-foreground tracking-tight">PrivacyForge</h1>

      <div className="flex items-center gap-4">
        <Badge variant="outline" className="gap-2 text-xs font-medium border-accent/30 text-accent px-3 py-1.5 rounded-full bg-accent/5">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure Processing Enabled
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="h-9 w-9 rounded-full border border-border hover:border-primary/30 hover:glow-shadow transition-all duration-300"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
