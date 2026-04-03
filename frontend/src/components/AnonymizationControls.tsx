import { useApp } from "@/contexts/AppContext";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Play, RotateCcw, Settings2 } from "lucide-react";

const toggleItems: { key: keyof ReturnType<typeof useApp>["options"]; label: string }[] = [
  { key: "maskNames", label: "Mask Names" },
  { key: "removeEmails", label: "Remove Emails" },
  { key: "generalizeAges", label: "Generalize Ages" },
  { key: "hidePhones", label: "Hide Phone Numbers" },
];

export function AnonymizationControls() {
  const { options, setOptions, runAnonymization, resetData, originalData, isProcessing } = useApp();

  const toggle = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 card-shadow space-y-5">
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground tracking-tight">Anonymization Controls</h3>
      </div>
      <div className="space-y-3.5">
        {toggleItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between group">
            <Label className="text-sm text-foreground cursor-pointer">{item.label}</Label>
            <Switch checked={options[item.key]} onCheckedChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        <Button
          onClick={runAnonymization}
          disabled={originalData.length === 0 || isProcessing}
          className="flex-1 gap-2 rounded-full font-semibold hover:scale-[1.02] transition-transform duration-200"
          size="sm"
        >
          <Play className="h-3.5 w-3.5" />
          Run Anonymization
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={resetData}
          className="h-9 w-9 rounded-full hover:border-primary/30 transition-colors duration-200"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
