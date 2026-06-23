import { useState, useRef } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useListMemories, useCreateMemory, useUpdateMemory, useDeleteMemory, useGetOnThisDay } from "@workspace/api-client-react";
import { getListMemoriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, MapPin, Calendar, Clock, Pencil, Trash2, ChevronLeft, ChevronRight, ImagePlus } from "lucide-react";
import { filesToBase64, fileToBase64 } from "@/lib/useImageUpload";

const TABS = ["Timeline", "Gallery", "Calendar", "Year View"] as const;
type Tab = typeof TABS[number];
const YEAR_SEMESTERS: Record<number, number[]> = { 1: [1, 2], 2: [3, 4], 3: [5, 6], 4: [7, 8] };

// ─── Photo card (the main memory card) ──────────────────────────────────────
function MemoryPhotoCard({ memory, onClick }: { memory: any; onClick: () => void }) {
  const images: string[] = memory.images ?? [];
  const hasImages = images.length > 0;

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      whileHover={{ y: -4 }}
      onClick={onClick}
      style={{ aspectRatio: "3/4", minWidth: "220px", maxWidth: "280px" }}
    >
      {/* Tilted background images */}
      {hasImages && images.length >= 3 && (
        <>
          <div className="absolute inset-2 rounded-2xl overflow-hidden" style={{ transform: "rotate(-6deg) scale(0.92)", transformOrigin: "bottom center", zIndex: 1 }}>
            <img src={images[2]} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className="absolute inset-2 rounded-2xl overflow-hidden" style={{ transform: "rotate(4deg) scale(0.95)", transformOrigin: "bottom center", zIndex: 2 }}>
            <img src={images[1]} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/15" />
          </div>
        </>
      )}
      {hasImages && images.length === 2 && (
        <div className="absolute inset-2 rounded-2xl overflow-hidden" style={{ transform: "rotate(5deg) scale(0.94)", transformOrigin: "bottom center", zIndex: 1 }}>
          <img src={images[1]} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* Center / main image */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/15" style={{ zIndex: 3, boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
        {hasImages ? (
          <img src={images[0]} alt={memory.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#6CE5D8]/20 to-[#9B86F2]/20 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-[#6CE5D8]/40" />
          </div>
        )}
        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        {/* Title + date */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <p className="text-white font-display font-semibold text-sm leading-snug line-clamp-2 drop-shadow">{memory.title}</p>
          <p className="text-white/60 text-xs font-mono mt-0.5">{new Date(memory.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Add / Edit Memory Modal ─────────────────────────────────────────────────
function MemoryFormModal({ memory, onClose }: { memory?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const createMemory = useCreateMemory();
  const updateMemory = useUpdateMemory();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: memory?.title ?? "",
    description: memory?.description ?? "",
    date: memory?.date ?? new Date().toISOString().split("T")[0],
    location: memory?.location ?? "",
    tags: (memory?.tags ?? []).join(", "),
    semester: memory?.semester ?? "",
  });
  const [images, setImages] = useState<string[]>(memory?.images ?? []);

  const handleImagesAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const b64s = await filesToBase64(e.target.files);
    setImages(prev => [...prev, ...b64s]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: form.title,
      description: form.description,
      date: form.date,
      location: form.location,
      semester: form.semester ? Number(form.semester) : undefined,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      images,
    };
    if (memory) {
      updateMemory.mutate({ id: memory.id, data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() }); onClose(); }
      });
    } else {
      createMemory.mutate({ data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() }); onClose(); }
      });
    }
  };

  const isPending = createMemory.isPending || updateMemory.isPending;

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
        <GlassCard className="p-7">
          <button onClick={onClose} className="absolute top-4 right-4 text-[#5E6386] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          <h2 className="text-xl font-display font-bold text-white mb-5">{memory ? "Edit Memory" : "Add Memory"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50 resize-none h-20" placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6CE5D8]/50" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              <input type="number" min="1" max="8" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Semester (1-8)" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} />
            </div>

            {/* Photo upload */}
            <div className="space-y-2">
              <div className="text-xs text-[#5E6386]">Photos (up to 3 shown on card)</div>
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-[#F2879B]/80"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-[#5E6386] hover:border-[#6CE5D8]/50 hover:text-[#6CE5D8] transition-colors">
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-[10px]">Add</span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImagesAdd} />
              </div>
            </div>

            <button type="submit" disabled={isPending} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
              {isPending ? "Saving..." : memory ? "Save Changes" : "Save Memory"}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

// ─── Full Memory Detail Modal ────────────────────────────────────────────────
function MemoryDetailModal({ memory, onClose, onEdit, onDelete }: { memory: any; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const images: string[] = memory.images ?? [];
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
        <GlassCard className="overflow-hidden">
          {/* Image area */}
          {images.length > 0 && (
            <div className="relative w-full h-72 bg-black overflow-hidden">
              <img src={images[imgIdx]} alt="" className="w-full h-full object-contain" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"><ChevronRight className="w-4 h-4" /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? "bg-white" : "bg-white/40"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-7">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-xs font-mono text-[#6CE5D8] mb-1">{new Date(memory.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                <h2 className="text-2xl font-display font-bold text-white">{memory.title}</h2>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[#6CE5D8] hover:bg-[#6CE5D8]/10 text-xs transition-colors"><Pencil className="w-3.5 h-3.5" />Edit</button>
                <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-[#F2879B] hover:bg-[#F2879B]/10 text-xs transition-colors"><Trash2 className="w-3.5 h-3.5" />Delete</button>
                <button onClick={onClose} className="text-[#5E6386] hover:text-white ml-1"><X className="w-5 h-5" /></button>
              </div>
            </div>

            {memory.location && (
              <div className="flex items-center gap-1.5 text-sm text-[#A7ACC8] mb-3">
                <MapPin className="w-3.5 h-3.5 text-[#9B86F2]" />{memory.location}
              </div>
            )}

            {memory.description && <p className="text-[#A7ACC8] leading-relaxed mb-4">{memory.description}</p>}

            {memory.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {memory.tags.map((t: string) => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full bg-[#6CE5D8]/10 text-[#6CE5D8] text-xs border border-[#6CE5D8]/20">{t}</span>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

// ─── Timeline view ───────────────────────────────────────────────────────────
function TimelineView({ memories, onSelect }: { memories: any[]; onSelect: (m: any) => void }) {
  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#6CE5D8]/0 via-[#6CE5D8]/40 to-[#9B86F2]/0 -translate-x-1/2" />
      <div className="space-y-10">
        {memories.map((memory, i) => (
          <motion.div key={memory.id} initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className={`flex items-center gap-8 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
            <div className="flex-1 flex justify-end">
              <MemoryPhotoCard memory={memory} onClick={() => onSelect(memory)} />
            </div>
            <div className="flex-shrink-0 w-3 h-3 rounded-full bg-[#6CE5D8] relative z-10" style={{ boxShadow: "0 0 8px #6CE5D8" }} />
            <div className="flex-1" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Gallery view ─────────────────────────────────────────────────────────────
function GalleryView({ memories, onSelect }: { memories: any[]; onSelect: (m: any) => void }) {
  return (
    <div className="flex flex-wrap gap-6 justify-start">
      {memories.map((memory, i) => (
        <motion.div key={memory.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <MemoryPhotoCard memory={memory} onClick={() => onSelect(memory)} />
        </motion.div>
      ))}
    </div>
  );
}

// ─── Calendar view ────────────────────────────────────────────────────────────
function CalendarView({ memories, onSelect }: { memories: any[]; onSelect: (m: any) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const byDay: Record<string, any[]> = {};
  memories.forEach(m => {
    if (m.date?.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)) {
      const day = m.date.split("-")[2].replace(/^0/, "");
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(m);
    }
  });

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
          const day = String(i + 1);
          const mems = byDay[day] || [];
          return (
            <div key={i} className={`min-h-[56px] p-1 rounded-xl transition-colors ${mems.length > 0 ? "bg-[#6CE5D8]/8 border border-[#6CE5D8]/20" : ""}`}>
              <div className={`text-xs font-mono mb-1 ${mems.length > 0 ? "text-[#6CE5D8]" : "text-[#5E6386]"}`}>{i + 1}</div>
              {mems.slice(0, 2).map((m: any) => (
                <button key={m.id} onClick={() => onSelect(m)}
                  className="w-full text-left text-[9px] leading-tight px-1 py-0.5 rounded bg-[#6CE5D8]/15 text-[#6CE5D8] hover:bg-[#6CE5D8]/25 transition-colors mb-0.5 truncate block">
                  {m.title}
                </button>
              ))}
              {mems.length > 2 && <div className="text-[8px] text-[#5E6386] px-1">+{mems.length - 2} more</div>}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

// ─── Year view ────────────────────────────────────────────────────────────────
function YearView({ memories, onSelect }: { memories: any[]; onSelect: (m: any) => void }) {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map(year => {
        const sems = YEAR_SEMESTERS[year];
        return (
          <GlassCard key={year} className="p-5">
            <h3 className="text-base font-display font-semibold text-white mb-3">Year {year}</h3>
            {sems.map(sem => {
              const semMemories = memories.filter(m => m.semester === sem);
              return (
                <div key={sem} className="mb-3">
                  <div className="text-xs font-mono text-[#6CE5D8] mb-2">Semester {sem}</div>
                  <div className="flex flex-wrap gap-2">
                    {semMemories.map(m => (
                      <button key={m.id} onClick={() => onSelect(m)} className="px-3 py-1 rounded-full bg-[#6CE5D8]/10 text-[#F1F2FA] text-xs border border-white/10 hover:border-[#6CE5D8]/30 transition-colors">{m.title}</button>
                    ))}
                    {semMemories.length === 0 && <span className="text-xs text-[#5E6386]">No memories yet</span>}
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

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Memories() {
  const [tab, setTab] = useState<Tab>("Gallery");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);

  const queryClient = useQueryClient();
  const { data: memories = [], isLoading } = useListMemories();
  const { data: onThisDay = [] } = useGetOnThisDay();
  const deleteMemory = useDeleteMemory();

  const handleDelete = (memory: any) => {
    if (!confirm(`Delete "${memory.title}"? This cannot be undone.`)) return;
    deleteMemory.mutate({ id: memory.id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListMemoriesQueryKey() }); setSelected(null); }
    });
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Memories</h1>
          <p className="text-[#A7ACC8] text-sm mt-1">{memories.length} memories captured</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Memory
        </button>
      </div>

      {/* On This Day */}
      {onThisDay.length > 0 && (
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#E8C27A]" />
            <span className="text-sm font-semibold text-[#E8C27A]">On This Day</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {(onThisDay as any[]).map((m: any) => (
              <button key={m.id} onClick={() => setSelected(m)} className="flex-shrink-0 p-3 rounded-xl bg-[#E8C27A]/10 border border-[#E8C27A]/20 min-w-[160px] text-left hover:bg-[#E8C27A]/15 transition-colors">
                <div className="text-xs font-mono text-[#E8C27A] mb-1">{new Date(m.date).getFullYear()}</div>
                <div className="text-sm font-medium text-white">{m.title}</div>
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white/10 text-white" : "text-[#5E6386] hover:text-[#A7ACC8]"}`}>{t}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex gap-6 flex-wrap">{[1, 2, 3].map(i => <div key={i} className="w-56 h-72 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <>
          {tab === "Gallery" && <GalleryView memories={memories} onSelect={setSelected} />}
          {tab === "Timeline" && <TimelineView memories={memories} onSelect={setSelected} />}
          {tab === "Calendar" && <CalendarView memories={memories} onSelect={setSelected} />}
          {tab === "Year View" && <YearView memories={memories} onSelect={setSelected} />}
        </>
      )}

      {/* Modals */}
      <AnimatePresence>
        {(showAdd || editing) && (
          <MemoryFormModal
            memory={editing}
            onClose={() => { setShowAdd(false); setEditing(null); }}
          />
        )}
        {selected && !editing && (
          <MemoryDetailModal
            memory={selected}
            onClose={() => setSelected(null)}
            onEdit={() => { setEditing(selected); setSelected(null); }}
            onDelete={() => handleDelete(selected)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
