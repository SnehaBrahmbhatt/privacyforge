import { LayoutDashboard, Upload, BarChart3, History, Shield, Sparkles } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Upload Data", url: "/upload", icon: Upload },
  { title: "Results", url: "/results", icon: BarChart3 },
  { title: "History", url: "/history", icon: History },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex w-[272px] flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border min-h-screen relative overflow-hidden">
      {/* Subtle glow orb */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl animate-glow-pulse pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-accent/10 blur-3xl animate-glow-pulse pointer-events-none" style={{ animationDelay: "1s" }} />

      <div className="relative p-7 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center glow-shadow animate-gradient-shift">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <span className="text-base font-bold text-sidebar-primary-foreground tracking-tight">PrivacyForge</span>
          <span className="block text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/50 font-medium">Secure Platform</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2">
        {items.map((item) => {
          const active = location.pathname === item.url;
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end
              className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary-foreground glow-shadow border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-primary-foreground hover:translate-x-0.5"
              }`}
              activeClassName=""
            >
              <item.icon className={`h-[18px] w-[18px] transition-colors ${active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-primary/70"}`} />
              <span>{item.title}</span>
              {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 mx-4 mb-4 rounded-xl border border-sidebar-border bg-sidebar-accent/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/70">Security</span>
        </div>
        <p className="text-[11px] text-sidebar-foreground/50 leading-relaxed">
          All processing happens client-side. Your data never leaves the browser.
        </p>
      </div>
    </aside>
  );
}
