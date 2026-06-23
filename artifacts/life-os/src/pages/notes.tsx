import { useState } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useListNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@workspace/api-client-react";
import { getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, ExternalLink, Trash2, Tag } from "lucide-react";

const GROUPS = ["All", "Programming", "Movies", "Linux", "Web Design", "University", "Dreams", "Funny", "Ideas", "Projects", "Life"];
const GROUP_COLORS: Record<string, string> = {
  Programming: "#6CE5D8", Movies: "#9B86F2", Linux: "#E8C27A", "Web Design": "#F2879B",
  University: "#6CE5D8", Dreams: "#9B86F2", Funny: "#E8C27A", Ideas: "#F2879B",
  Projects: "#6CE5D8", Life: "#9B86F2",
};

function NoteDetailPanel({ note, onClose }: { note: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const deleteNote = useDeleteNote();
  const handleDelete = () => {
    deleteNote.mutate({ id: note.id }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() }); onClose(); }
    });
  };
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative z-10 w-full max-w-lg" initial={{ scale: 0.95, x: 40 }} animate={{ scale: 1, x: 0 }}>
          <GlassCard className="p-8">
            <div className="flex items-start justify-between mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: `${GROUP_COLORS[note.group] || "#6CE5D8"}20`, color: GROUP_COLORS[note.group] || "#6CE5D8", border: `1px solid ${GROUP_COLORS[note.group] || "#6CE5D8"}40` }}>
                {note.group}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={handleDelete} className="text-[#5E6386] hover:text-[#F2879B] transition-colors"><Trash2 className="w-4 h-4" /></button>
                <button onClick={onClose} className="text-[#5E6386] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-3">{note.title}</h2>
            {note.url && (
              <a href={note.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#6CE5D8] hover:underline mb-4">
                <ExternalLink className="w-3.5 h-3.5" />{note.url}
              </a>
            )}
            {note.description && <p className="text-[#A7ACC8] leading-relaxed mb-4">{note.description}</p>}
            {note.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.tags.map((t: string) => (
                  <span key={t} className="px-2.5 py-0.5 rounded-full bg-white/5 text-[#A7ACC8] text-xs border border-white/10">#{t}</span>
                ))}
              </div>
            )}
            <div className="mt-4 text-xs font-mono text-[#5E6386]">{new Date(note.createdAt).toLocaleDateString()}</div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AddNoteModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createNote = useCreateNote();
  const [form, setForm] = useState({ title: "", description: "", url: "", group: "Programming", tags: "" });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNote.mutate({ data: { title: form.title, description: form.description, url: form.url, group: form.group, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() }); onClose(); }
    });
  };
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative z-10 w-full max-w-lg" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
          <GlassCard className="p-8">
            <button onClick={onClose} className="absolute top-4 right-4 text-[#5E6386] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-display font-bold text-white mb-6">New Note</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50 resize-none h-24" placeholder="Description / notes" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="URL (optional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              <select className="w-full bg-[#12152C] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#6CE5D8]/50" value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
                {GROUPS.filter(g => g !== "All").map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              <button type="submit" disabled={createNote.isPending} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm transition-opacity hover:opacity-90">
                {createNote.isPending ? "Saving..." : "Save Note"}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Notes() {
  const [activeGroup, setActiveGroup] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const { data: notes = [], isLoading } = useListNotes({ group: activeGroup !== "All" ? activeGroup : undefined, search: search || undefined });

  return (
    <PageTransition className="flex gap-6 h-full min-h-0">
      {/* Left: group filter */}
      <div className="w-48 flex-shrink-0 space-y-1">
        <div className="text-xs font-mono text-[#5E6386] uppercase tracking-wider px-3 mb-3">Groups</div>
        {GROUPS.map(g => (
          <button key={g} onClick={() => setActiveGroup(g)} className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${activeGroup === g ? "bg-white/10 text-white" : "text-[#A7ACC8] hover:bg-white/5 hover:text-white"}`}>
            <span className="flex items-center gap-2">
              {g !== "All" && <span className="w-2 h-2 rounded-full" style={{ background: GROUP_COLORS[g] || "#6CE5D8" }} />}
              {g}
            </span>
          </button>
        ))}
      </div>

      {/* Right: notes */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Smart Notes</h1>
          <button onClick={() => setShowAdd(true)} data-testid="button-add-note" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E6386]" />
          <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {notes.map((note: any, i: number) => (
              <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard className="p-5 cursor-pointer h-full" onClick={() => setSelected(note)} interactive>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${GROUP_COLORS[note.group] || "#6CE5D8"}15`, color: GROUP_COLORS[note.group] || "#6CE5D8" }}>{note.group}</span>
                    {note.url && <ExternalLink className="w-3.5 h-3.5 text-[#5E6386]" />}
                  </div>
                  <h3 className="font-medium text-white mb-1 line-clamp-2">{note.title}</h3>
                  {note.description && <p className="text-xs text-[#A7ACC8] line-clamp-2">{note.description}</p>}
                  {note.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {note.tags.slice(0, 4).map((t: string) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#5E6386]">#{t}</span>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
        {!isLoading && notes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-[#5E6386]">
            <Tag className="w-8 h-8 mb-3 opacity-50" />
            <p>No notes yet. Start capturing knowledge.</p>
          </div>
        )}
      </div>

      {selected && <NoteDetailPanel note={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddNoteModal onClose={() => setShowAdd(false)} />}
    </PageTransition>
  );
}
