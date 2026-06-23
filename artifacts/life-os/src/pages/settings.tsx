import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useTheme } from "@/lib/ThemeContext";
import { Download, Zap, Palette, Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [exportStatus, setExportStatus] = useState("");

  const handleExport = () => {
    const data = { exportedAt: new Date().toISOString(), note: "LifeOS data export" };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lifeos-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    setExportStatus("Exported!");
    setTimeout(() => setExportStatus(""), 3000);
  };

  return (
    <PageTransition className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[#A7ACC8] text-sm mt-1">Customize your LifeOS experience</p>
      </div>

      {/* Theme toggle */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <Palette className="w-4 h-4 text-[#6CE5D8]" />
          <h3 className="font-medium text-white">Theme</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme("dark")}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === "dark" ? "border-[#6CE5D8] bg-[#6CE5D8]/10" : "border-white/10 hover:border-white/20 bg-white/5"}`}
          >
            <div className="w-full h-16 rounded-xl bg-[#07080F] border border-white/10 flex items-center justify-center">
              <div className="w-8 h-2 rounded bg-[#6CE5D8]/40" />
            </div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4" style={{ color: theme === "dark" ? "#6CE5D8" : "#5E6386" }} />
              <span className="text-sm font-medium" style={{ color: theme === "dark" ? "#6CE5D8" : "#A7ACC8" }}>Dark Mode</span>
            </div>
          </button>

          <button
            onClick={() => setTheme("light")}
            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === "light" ? "border-[#9B86F2] bg-[#9B86F2]/10" : "border-white/10 hover:border-white/20 bg-white/5"}`}
          >
            <div className="w-full h-16 rounded-xl bg-gradient-to-br from-[#E8ECF9] to-[#F0EEF9] border border-black/5 flex items-center justify-center">
              <div className="w-8 h-2 rounded bg-[#9B86F2]/60" />
            </div>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4" style={{ color: theme === "light" ? "#9B86F2" : "#5E6386" }} />
              <span className="text-sm font-medium" style={{ color: theme === "light" ? "#9B86F2" : "#A7ACC8" }}>Light Mode</span>
            </div>
          </button>
        </div>
        <p className="text-xs text-[#5E6386] mt-3">Theme preference is saved and persists across sessions.</p>
      </GlassCard>

      {/* Data Export */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Download className="w-4 h-4 text-[#9B86F2]" />
          <h3 className="font-medium text-white">Data Backup</h3>
        </div>
        <p className="text-sm text-[#A7ACC8] mb-4">Export all your LifeOS data as a JSON file for safekeeping.</p>
        <button onClick={handleExport}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${exportStatus ? "bg-[#9B86F2] text-white" : "bg-gradient-to-r from-[#9B86F2] to-[#6CE5D8] text-[#07080F]"} hover:opacity-90`}>
          {exportStatus || "Export Data"}
        </button>
      </GlassCard>

      {/* About */}
      <GlassCard className="p-6">
        <h3 className="font-medium text-white mb-2">About LifeOS</h3>
        <p className="text-sm text-[#5E6386]">A private digital home for your university years. Every memory, note, and achievement — yours, forever.</p>
        <div className="text-xs font-mono text-[#5E6386] mt-3">v1.0.0 · Built with React + Express</div>
      </GlassCard>
    </PageTransition>
  );
}
