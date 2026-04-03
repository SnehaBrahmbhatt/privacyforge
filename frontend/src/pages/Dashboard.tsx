import { useApp } from "@/contexts/AppContext";
import { Shield, Upload, BarChart3, Zap, FileText, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { originalData, anonymizedData, loadDemo, history } = useApp();
  const navigate = useNavigate();

  const stats = [
    { label: "Records Loaded", value: originalData.length, icon: FileText, color: "text-primary" },
    { label: "Fields Anonymized", value: anonymizedData ? anonymizedData.length * 4 : 0, icon: Lock, color: "text-accent" },
    { label: "Sessions", value: history.length, icon: BarChart3, color: "text-primary" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 stagger-children">
      {/* Hero */}
      <div className="rounded-2xl gradient-primary p-10 text-primary-foreground relative overflow-hidden animate-gradient-shift">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-20 translate-x-16 blur-sm" />
        <div className="absolute bottom-0 left-1/2 w-96 h-32 bg-primary-foreground/5 rounded-full translate-y-16 blur-sm" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5 animate-float" />
            <span className="text-xs font-semibold uppercase tracking-[0.15em] opacity-80">PrivacyForge</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 tracking-tight">Privacy-First Data Anonymization</h2>
          <p className="text-sm opacity-75 max-w-lg leading-relaxed">
            Upload your datasets, detect sensitive fields automatically, and export anonymized data — all in seconds, all in your browser.
          </p>
          <div className="flex gap-3 mt-7">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 rounded-full px-5 font-semibold hover:scale-105 transition-transform duration-200"
              onClick={() => navigate("/upload")}
            >
              <Upload className="h-3.5 w-3.5" /> Upload Data
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground border border-primary-foreground/20 hover:bg-primary-foreground/10 gap-2 rounded-full px-5 font-semibold hover:scale-105 transition-transform duration-200"
              onClick={loadDemo}
            >
              <Zap className="h-3.5 w-3.5" /> Try Demo Data
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group rounded-2xl border border-border bg-card p-6 card-shadow hover:elevated-shadow hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{s.value}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust badge */}
      <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 flex items-center gap-4 glass-subtle">
        <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <Shield className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Your data is processed securely</p>
          <p className="text-xs text-muted-foreground mt-0.5">All anonymization happens client-side. No data leaves your browser.</p>
        </div>
      </div>
    </div>
  );
}
