import { useState, useRef } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useListNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@workspace/api-client-react";
import { getListNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, ExternalLink, Trash2, Pencil, ImagePlus, Tag } from "lucide-react";
import { fileToBase64 } from "@/lib/useImageUpload";

const DEFAULT_GROUPS = ["Programming", "Movies", "Linux", "Web Design", "University", "Dreams", "Funny", "Ideas", "Projects", "Life"];
const GROUP_COLORS: Record<string, string> = {
  Programming: "#6CE5D8", Movies: "#9B86F2", Linux: "#E8C27A", "Web Design": "#F2879B",
  University: "#6CE5D8", Dreams: "#9B86F2", Funny: "#E8C27A", Ideas: "#F2879B",
  Projects: "#6CE5D8", Life: "#9B86F2",
};

function getGroupColor(g: string) {
  return GROUP_COLORS[g] || "#A7ACC8";
}

// ─── Note Form Modal (add/edit) ───────────────────────────────────────────────
function NoteFormModal({ note, groups, onClose }: { note?: any; groups: string[]; onClose: () => void }) {
  const queryClient = useQueryClient();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const imgRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: note?.title ?? "",
    description: note?.description ?? "",
    url: note?.url ?? "",
    group: note?.group ?? groups[0] ?? "Programming",
    tags: (note?.tags ?? []).join(", "),
  });
  const [imageUrl, setImageUrl] = useState<string | null>(note?.imageUrl ?? null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setImageUrl(b64);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: form.title,
      description: form.description,
      url: form.url,
      group: form.group,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      imageUrl: imageUrl ?? undefined,
    };
    if (note) {
      updateNote.mutate({ id: note.id, data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() }); onClose(); }
      });
    } else {
      createNote.mutate({ data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() }); onClose(); }
      });
    }
  };

  const isPending = createNote.isPending || updateNote.isPending;

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative z-10 w-full max-w-lg" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
        <GlassCard className="p-7">
          <button onClick={onClose} className="absolute top-4 right-4 text-[#5E6386] hover:text-white"><X className="w-5 h-5" /></button>
          <h2 className="text-xl font-display font-bold text-white mb-5">{note ? "Edit Note" : "New Note"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none resize-none h-20" placeholder="Notes / description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="URL (optional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            <select className="w-full bg-[#12152C] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />

            {/* Image */}
            <div className="flex items-center gap-3">
              {imageUrl ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrl(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><X className="w-4 h-4 text-white" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => imgRef.current?.click()} className="w-16 h-16 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-[#5E6386] hover:border-[#6CE5D8]/50 hover:text-[#6CE5D8] transition-colors">
                  <ImagePlus className="w-4 h-4" /><span className="text-[10px]">Photo</span>
                </button>
              )}
              <span className="text-xs text-[#5E6386]">Optional cover image</span>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <button type="submit" disabled={isPending} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90">
              {isPending ? "Saving..." : note ? "Save Changes" : "Save Note"}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

// ─── Note Detail Modal ────────────────────────────────────────────────────────
function NoteDetailModal({ note, onClose, onEdit }: { note: any; onClose: () => void; onEdit: () => void }) {
  const queryClient = useQueryClient();
  const deleteNote = useDeleteNote();
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative z-10 w-full max-w-lg" initial={{ scale: 0.95, x: 40 }} animate={{ scale: 1, x: 0 }}>
        <GlassCard className="overflow-hidden">
          {note.imageUrl && (
            <div className="w-full h-40 overflow-hidden">
              <img src={note.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-7">
            <div className="flex items-start justify-between mb-4">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: `${getGroupColor(note.group)}20`, color: getGroupColor(note.group), border: `1px solid ${getGroupColor(note.group)}40` }}>{note.group}</span>
              <div className="flex items-center gap-2">
                <button onClick={onEdit} className="text-[#5E6386] hover:text-[#6CE5D8] transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => deleteNote.mutate({ id: note.id }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() }); onClose(); } })} className="text-[#5E6386] hover:text-[#F2879B] transition-colors"><Trash2 className="w-4 h-4" /></button>
                <button onClick={onClose} className="text-[#5E6386] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-3">{note.title}</h2>
            {note.url && <a href={note.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#6CE5D8] hover:underline mb-4"><ExternalLink className="w-3.5 h-3.5" />{note.url}</a>}
            {note.description && <p className="text-[#A7ACC8] leading-relaxed mb-4">{note.description}</p>}
            {note.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {note.tags.map((t: string) => <span key={t} className="px-2.5 py-0.5 rounded-full bg-white/5 text-[#A7ACC8] text-xs border border-white/10">#{t}</span>)}
              </div>
            )}
            <div className="mt-4 text-xs font-mono text-[#5E6386]">{new Date(note.createdAt).toLocaleDateString()}</div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

export default function Notes() {
  const queryClient = useQueryClient();
  const { data: rawNotes = [] } = useListNotes();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  // Groups from DB + custom
  const dbGroups = Array.from(new Set((rawNotes as any[]).map((n: any) => n.group))).filter(Boolean) as string[];
  const [customGroups, setCustomGroups] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("lifeos-groups") || "[]"); } catch { return []; }
  });
  const saveCustomGroups = (g: string[]) => { setCustomGroups(g); localStorage.setItem("lifeos-groups", JSON.stringify(g)); };

  const allGroups = Array.from(new Set([...DEFAULT_GROUPS, ...dbGroups, ...customGroups]));

  const [activeGroup, setActiveGroup] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [renamingGroup, setRenamingGroup] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [addingGroup, setAddingGroup] = useState(false);

  const { data: notes = [], isLoading } = useListNotes({
    group: activeGroup !== "All" ? activeGroup : undefined,
    search: search || undefined,
  });

  const handleRenameGroup = async (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) { setRenamingGroup(null); return; }
    const notesInGroup = (rawNotes as any[]).filter((n: any) => n.group === oldName);
    await Promise.all(notesInGroup.map((n: any) => updateNote.mutateAsync({ id: n.id, data: { group: newName } })));
    queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
    saveCustomGroups(customGroups.map(g => g === oldName ? newName : g));
    if (activeGroup === oldName) setActiveGroup(newName);
    setRenamingGroup(null);
  };

  const handleDeleteGroup = async (groupName: string) => {
    if (!confirm(`Delete all notes in "${groupName}"?`)) return;
    const notesInGroup = (rawNotes as any[]).filter((n: any) => n.group === groupName);
    await Promise.all(notesInGroup.map((n: any) => deleteNote.mutateAsync({ id: n.id })));
    queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
    saveCustomGroups(customGroups.filter(g => g !== groupName));
    if (activeGroup === groupName) setActiveGroup("All");
  };

  return (
    <PageTransition className="flex gap-5 h-full min-h-0">
      {/* Left sidebar — groups */}
      <div className="w-52 flex-shrink-0 space-y-1">
        <div className="text-xs font-mono text-[#5E6386] uppercase tracking-wider px-3 mb-2">Groups</div>

        <button onClick={() => setActiveGroup("All")} className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${activeGroup === "All" ? "bg-white/10 text-white" : "text-[#A7ACC8] hover:bg-white/5"}`}>All</button>

        {allGroups.map(g => (
          <div key={g} className="group relative">
            {renamingGroup === g ? (
              <div className="flex items-center gap-1 px-2 py-1">
                <input autoFocus className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none" value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleRenameGroup(g, renameVal); if (e.key === "Escape") setRenamingGroup(null); }} />
                <button onClick={() => handleRenameGroup(g, renameVal)} className="text-[#6CE5D8] text-xs">✓</button>
              </div>
            ) : (
              <button onClick={() => setActiveGroup(g)} className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${activeGroup === g ? "bg-white/10 text-white" : "text-[#A7ACC8] hover:bg-white/5 hover:text-white"}`}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: getGroupColor(g) }} />
                <span className="flex-1 truncate">{g}</span>
              </button>
            )}
            {renamingGroup !== g && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5">
                <button onClick={() => { setRenamingGroup(g); setRenameVal(g); }} className="p-1 rounded text-[#5E6386] hover:text-[#6CE5D8]"><Pencil className="w-3 h-3" /></button>
                <button onClick={() => handleDeleteGroup(g)} className="p-1 rounded text-[#5E6386] hover:text-[#F2879B]"><Trash2 className="w-3 h-3" /></button>
              </div>
            )}
          </div>
        ))}

        {addingGroup ? (
          <div className="flex items-center gap-1 px-2 py-1">
            <input autoFocus className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none" placeholder="Group name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newGroupName.trim()) { saveCustomGroups([...customGroups, newGroupName.trim()]); setNewGroupName(""); setAddingGroup(false); } if (e.key === "Escape") { setAddingGroup(false); setNewGroupName(""); } }} />
            <button onClick={() => { if (newGroupName.trim()) { saveCustomGroups([...customGroups, newGroupName.trim()]); setNewGroupName(""); } setAddingGroup(false); }} className="text-[#6CE5D8] text-xs">✓</button>
          </div>
        ) : (
          <button onClick={() => setAddingGroup(true)} className="w-full text-left px-3 py-2 rounded-xl text-sm text-[#5E6386] hover:text-[#6CE5D8] transition-colors flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> New Group
          </button>
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 space-y-5 min-w-0">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Smart Notes</h1>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5E6386]" />
          <input className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-white/5 rounded-2xl animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {(notes as any[]).map((note: any, i: number) => (
              <motion.div key={note.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard className="overflow-hidden cursor-pointer h-full" onClick={() => setSelected(note)} interactive>
                  {note.imageUrl && (
                    <div className="w-full h-28 overflow-hidden">
                      <img src={note.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${getGroupColor(note.group)}15`, color: getGroupColor(note.group) }}>{note.group}</span>
                      <div className="flex items-center gap-1">
                        {note.url && <ExternalLink className="w-3.5 h-3.5 text-[#5E6386]" />}
                        <button onClick={e => { e.stopPropagation(); setEditing(note); }} className="p-0.5 text-[#5E6386] hover:text-[#6CE5D8] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <h3 className="font-medium text-white mb-1 line-clamp-2">{note.title}</h3>
                    {note.description && <p className="text-xs text-[#A7ACC8] line-clamp-2">{note.description}</p>}
                    {note.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((t: string) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#5E6386]">#{t}</span>)}
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && (notes as any[]).length === 0 && (
          <div className="flex flex-col items-center py-20 text-[#5E6386]">
            <Tag className="w-8 h-8 mb-3 opacity-50" />
            <p>No notes yet. Start capturing knowledge.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && !editing && <NoteDetailModal note={selected} onClose={() => setSelected(null)} onEdit={() => { setEditing(selected); setSelected(null); }} />}
        {(showAdd || editing) && <NoteFormModal note={editing} groups={allGroups} onClose={() => { setShowAdd(false); setEditing(null); }} />}
      </AnimatePresence>
    </PageTransition>
  );
}
