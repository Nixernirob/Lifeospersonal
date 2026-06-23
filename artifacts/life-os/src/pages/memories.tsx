import { useState } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useListMemories, useCreateMemory, useDeleteMemory, useGetOnThisDay } from "@workspace/api-client-react";
import { getListMemoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, MapPin, Tag, Calendar, Clock } from "lucide-react";

const TABS = ["Timeline", "Gallery", "Calendar", "Year View"] as const;
type Tab = typeof TABS[number];

const YEAR_SEMESTERS: Record<number, number[]> = {
  1: [1, 2], 2: [3, 4], 3: [5, 6], 4: [7, 8],
};

function MemoryModal({ memory, onClose }: { memory: any; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative z-10 w-full max-w-lg"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
        >
          <GlassCard className="p-8">
            <button onClick={onClose} className="absolute top-4 right-4 text-[#5E6386] hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="text-xs font-mono text-[#6CE5D8] mb-2">{new Date(memory.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            <h2 className="text-2xl font-display font-bold text-white mb-3">{memory.title}</h2>
            {memory.location && (
              <div className="flex items-center gap-1 text-sm text-[#A7ACC8] mb-4">
                <MapPin className="w-3.5 h-3.5" />
                {memory.location}
              </div>
            )}
            {memory.description && <p className="text-[#A7ACC8] leading-relaxed mb-4">{memory.description}</p>}
            {memory.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {memory.tags.map((t: string) => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#6CE5D8]/10 text-[#6CE5D8] text-xs border border-[#6CE5D8]/20">{t}</span>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AddMemoryModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createMemory = useCreateMemory();
  const [form, setForm] = useState({ title: "", description: "", date: new Date().toISOString().split("T")[0], location: "", tags: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMemory.mutate({ data: { title: form.title, description: form.description, date: form.date, location: form.location, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() }); onClose(); }
    });
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative z-10 w-full max-w-lg" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
          <GlassCard className="p-8">
            <button onClick={onClose} className="absolute top-4 right-4 text-[#5E6386] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-display font-bold text-white mb-6">Add Memory</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50 resize-none h-24" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6CE5D8]/50" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Location (optional)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              <button type="submit" disabled={createMemory.isPending} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm transition-opacity hover:opacity-90">
                {createMemory.isPending ? "Saving..." : "Save Memory"}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function TimelineView({ memories }: { memories: any[] }) {
  const [selected, setSelected] = useState<any>(null);
  return (
    <div className="relative">
      {/* Glowing spine */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#6CE5D8]/0 via-[#6CE5D8]/50 to-[#9B86F2]/0 -translate-x-1/2" style={{ boxShadow: "0 0 12px #6CE5D8" }} />
      <div className="space-y-8">
        {memories.map((memory, i) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`flex items-start gap-8 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
          >
            <div className="flex-1">
              <GlassCard className="p-5 cursor-pointer hover:border-white/20" onClick={() => setSelected(memory)} interactive>
                <div className="text-xs font-mono text-[#6CE5D8] mb-1">{new Date(memory.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                <h3 className="font-display font-semibold text-white mb-1">{memory.title}</h3>
                {memory.location && <p className="text-xs text-[#5E6386] flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" />{memory.location}</p>}
                {memory.description && <p className="text-sm text-[#A7ACC8] line-clamp-2">{memory.description}</p>}
                {memory.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {memory.tags.slice(0, 3).map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-[#6CE5D8]/10 text-[#6CE5D8] text-xs">{t}</span>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
            {/* Center dot */}
            <div className="flex-shrink-0 w-3 h-3 rounded-full bg-[#6CE5D8] mt-6 relative z-10" style={{ boxShadow: "0 0 8px #6CE5D8" }} />
            <div className="flex-1" />
          </motion.div>
        ))}
      </div>
      {selected && <MemoryModal memory={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function GalleryView({ memories }: { memories: any[] }) {
  const [selected, setSelected] = useState<any>(null);
  return (
    <div className="columns-2 md:columns-3 gap-4 space-y-4">
      {memories.map((memory, i) => (
        <motion.div key={memory.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="break-inside-avoid mb-4">
          <GlassCard className="p-4 cursor-pointer" onClick={() => setSelected(memory)} interactive>
            <div className="w-full h-24 bg-gradient-to-br from-[#6CE5D8]/20 to-[#9B86F2]/20 rounded-xl mb-3 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#6CE5D8]/50" />
            </div>
            <div className="text-xs font-mono text-[#5E6386] mb-1">{new Date(memory.date).toLocaleDateString()}</div>
            <div className="text-sm font-medium text-white">{memory.title}</div>
          </GlassCard>
        </motion.div>
      ))}
      {selected && <MemoryModal memory={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function YearView({ memories }: { memories: any[] }) {
  return (
    <div className="space-y-8">
      {[1, 2, 3, 4].map(year => {
        const sems = YEAR_SEMESTERS[year];
        const yearMemories = memories.filter(m => m.semester && sems.includes(m.semester));
        return (
          <GlassCard key={year} className="p-6">
            <h3 className="text-lg font-display font-semibold text-white mb-4">Year {year}</h3>
            {sems.map(sem => {
              const semMemories = yearMemories.filter(m => m.semester === sem);
              return (
                <div key={sem} className="mb-4">
                  <div className="text-xs font-mono text-[#6CE5D8] mb-2">Semester {sem} — {semMemories.length} {semMemories.length === 1 ? "memory" : "memories"}</div>
                  <div className="flex flex-wrap gap-2">
                    {semMemories.map(m => (
                      <span key={m.id} className="px-3 py-1 rounded-full bg-[#6CE5D8]/10 text-[#F1F2FA] text-xs border border-white/10">{m.title}</span>
                    ))}
                    {semMemories.length === 0 && <span className="text-xs text-[#5E6386]">No memories logged yet</span>}
                  </div>
                </div>
              );
            })}
          </GlassCard>
        );
      })}
    </div>
  );
}

function CalendarView({ memories }: { memories: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const countByDay: Record<string, number> = {};
  memories.forEach(m => {
    if (m.date?.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)) {
      const day = m.date.split("-")[2];
      countByDay[day] = (countByDay[day] || 0) + 1;
    }
  });
  const maxCount = Math.max(...Object.values(countByDay), 1);
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors">&lt;</button>
        <span className="font-display font-semibold text-white">{MONTHS[month]} {year}</span>
        <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-xs font-mono text-[#5E6386] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = String(i + 1).padStart(2, "0");
          const count = countByDay[day] || 0;
          const intensity = count > 0 ? count / maxCount : 0;
          return (
            <div key={i} className="aspect-square flex items-center justify-center rounded-lg text-xs font-mono transition-colors relative"
              style={{ background: count > 0 ? `rgba(108,229,216,${0.1 + intensity * 0.4})` : "transparent", boxShadow: count > 0 ? `0 0 ${intensity * 12}px rgba(108,229,216,0.4)` : "none" }}>
              <span className={count > 0 ? "text-[#6CE5D8]" : "text-[#5E6386]"}>{i + 1}</span>
              {count > 0 && <span className="absolute bottom-0.5 text-[8px] text-[#6CE5D8]">{count}</span>}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export default function Memories() {
  const [tab, setTab] = useState<Tab>("Timeline");
  const [showAdd, setShowAdd] = useState(false);
  const { data: memories = [], isLoading } = useListMemories();
  const { data: onThisDay = [] } = useGetOnThisDay();

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Memories</h1>
          <p className="text-[#A7ACC8] text-sm mt-1">{memories.length} memories captured</p>
        </div>
        <button onClick={() => setShowAdd(true)} data-testid="button-add-memory" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Memory
        </button>
      </div>

      {onThisDay.length > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#E8C27A]" />
            <span className="text-sm font-semibold text-[#E8C27A]">On This Day</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {onThisDay.map((m: any) => (
              <div key={m.id} className="flex-shrink-0 p-3 rounded-xl bg-[#E8C27A]/10 border border-[#E8C27A]/20 min-w-[160px]">
                <div className="text-xs font-mono text-[#E8C27A] mb-1">{new Date(m.date).getFullYear()}</div>
                <div className="text-sm font-medium text-white">{m.title}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="flex gap-1 p-1 rounded-xl bg-white/5 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white/10 text-white" : "text-[#5E6386] hover:text-[#A7ACC8]"}`}>
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <>
          {tab === "Timeline" && <TimelineView memories={memories} />}
          {tab === "Gallery" && <GalleryView memories={memories} />}
          {tab === "Calendar" && <CalendarView memories={memories} />}
          {tab === "Year View" && <YearView memories={memories} />}
        </>
      )}

      {showAdd && <AddMemoryModal onClose={() => setShowAdd(false)} />}
    </PageTransition>
  );
}
