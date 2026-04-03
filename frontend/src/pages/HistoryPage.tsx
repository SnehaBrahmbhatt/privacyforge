import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { History, RefreshCw, Clock } from "lucide-react";

export default function HistoryPage() {
  const { history, reprocess } = useApp();

  return (
    <div className="max-w-5xl mx-auto space-y-8 stagger-children">
      <div>
        <h2 className="text-xl font-bold text-foreground tracking-tight">History</h2>
        <p className="text-sm text-muted-foreground mt-1">View previous uploads from this session</p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-16 card-shadow text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
            <History className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground">No history yet</p>
          <p className="text-xs text-muted-foreground mt-1.5">Process some data to see it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry, index) => (
            <div
              key={entry.id}
              className="group rounded-2xl border border-border bg-card p-5 card-shadow flex items-center justify-between hover:border-primary/30 hover:elevated-shadow transition-all duration-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{entry.fileName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {entry.date.toLocaleString()} · {entry.data.length} rows
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => reprocess(entry)}
                className="gap-2 rounded-full px-4 hover:border-primary/30 hover:glow-shadow transition-all duration-300"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reprocess
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
