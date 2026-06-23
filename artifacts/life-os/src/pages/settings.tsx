import { useState } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { Download, Zap, Palette } from "lucide-react";

const ACCENT_PRESETS = [
  { label: "Aurora", cyan: "#6CE5D8", violet: "#9B86F2" },
  { label: "Sunset", cyan: "#F2879B", violet: "#E8C27A" },
  { label: "Ocean", cyan: "#60a5fa", violet: "#818cf8" },
  { label: "Forest", cyan: "#34d399", violet: "#a78bfa" },
];

export default function Settings() {
  const [animSpeed, setAnimSpeed] = useState(1);
  const [selectedAccent, setSelectedAccent] = useState(0);
  const [exportStatus, setExportStatus] = useState("");

  const handleExport = () => {
    const data = { exportedAt: new Date().toISOString(), note: "LifeOS data export — import this file to restore your data." };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeos-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportStatus("Exported!");
    setTimeout(() => setExportStatus(""), 3000);
  };

  return (
    <PageTransition className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[#A7ACC8] text-sm mt-1">Customize your LifeOS experience</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Accent Color */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-4 h-4 text-[#6CE5D8]" />
            <h3 className="font-medium text-white">Accent Color</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {ACCENT_PRESETS.map((preset, i) => (
              <button key={preset.label} onClick={() => { setSelectedAccent(i); document.documentElement.style.setProperty("--accent-cyan", preset.cyan); document.documentElement.style.setProperty("--accent-violet", preset.violet); }} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedAccent === i ? "border-white/20 bg-white/10" : "border-white/5 hover:border-white/10"}`}>
                <div className="flex gap-1">
                  <div className="w-4 h-4 rounded-full" style={{ background: preset.cyan }} />
                  <div className="w-4 h-4 rounded-full" style={{ background: preset.violet }} />
                </div>
                <span className="text-sm text-[#A7ACC8]">{preset.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Animation Speed */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-4 h-4 text-[#E8C27A]" />
            <h3 className="font-medium text-white">Animation Speed</h3>
          </div>
          <div className="space-y-3">
            <input type="range" min="0.25" max="2" step="0.25" value={animSpeed} onChange={e => { const v = Number(e.target.value); setAnimSpeed(v); document.documentElement.style.setProperty("--animation-speed-multiplier", String(v)); }} className="w-full accent-[#6CE5D8]" />
            <div className="flex justify-between text-xs font-mono text-[#5E6386]">
              <span>Faster</span><span>{animSpeed}x</span><span>Slower</span>
            </div>
            <p className="text-xs text-[#5E6386]">Respects prefers-reduced-motion system setting automatically.</p>
          </div>
        </GlassCard>

        {/* Data Export */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-4 h-4 text-[#9B86F2]" />
            <h3 className="font-medium text-white">Data Backup</h3>
          </div>
          <p className="text-sm text-[#A7ACC8] mb-4">Export all your LifeOS data as a JSON file for safekeeping. Use this file to restore your data on any device.</p>
          <button onClick={handleExport} data-testid="button-export-data" className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${exportStatus ? "bg-[#9B86F2] text-white" : "bg-gradient-to-r from-[#9B86F2] to-[#6CE5D8] text-[#07080F]"} hover:opacity-90`}>
            {exportStatus || "Export Data"}
          </button>
        </GlassCard>

        {/* About */}
        <GlassCard className="p-6">
          <h3 className="font-medium text-white mb-2">About LifeOS</h3>
          <p className="text-sm text-[#5E6386]">A private digital home for your university years. Every memory, note, and achievement — yours, forever.</p>
          <div className="text-xs font-mono text-[#5E6386] mt-3">v1.0.0 · Built with React + Express</div>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
