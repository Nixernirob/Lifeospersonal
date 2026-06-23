import { useState } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useListProjects, useCreateProject, useDeleteProject } from "@workspace/api-client-react";
import { getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Github, ExternalLink, Code } from "lucide-react";

function AddModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createProject = useCreateProject();
  const [form, setForm] = useState({ title: "", description: "", githubUrl: "", liveUrl: "", tags: "", semester: "", status: "active" });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({ data: { title: form.title, description: form.description, githubUrl: form.githubUrl, liveUrl: form.liveUrl, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean), semester: form.semester ? Number(form.semester) : undefined, status: form.status } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() }); onClose(); }
    });
  };
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative z-10 w-full max-w-lg" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
          <GlassCard className="p-8">
            <button onClick={onClose} className="absolute top-4 right-4 text-[#5E6386] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-display font-bold text-white mb-6">Add Project</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Project title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50 resize-none h-20" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="GitHub URL" value={form.githubUrl} onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))} />
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Live URL (optional)" value={form.liveUrl} onChange={e => setForm(f => ({ ...f, liveUrl: e.target.value }))} />
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Semester" value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} />
                <select className="bg-[#12152C] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option>
                </select>
              </div>
              <button type="submit" disabled={createProject.isPending} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm">
                {createProject.isPending ? "Saving..." : "Add Project"}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Projects() {
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useListProjects();
  const deleteProject = useDeleteProject();
  const statusColors: Record<string, string> = { active: "#6CE5D8", completed: "#9B86F2", archived: "#5E6386" };

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Project Archive</h1>
          <p className="text-[#A7ACC8] text-sm mt-1">{projects.length} projects built</p>
        </div>
        <button onClick={() => setShowAdd(true)} data-testid="button-add-project" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {projects.map((p: any, i: number) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <GlassCard className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6CE5D8]/20 to-[#9B86F2]/20 flex items-center justify-center">
                    <Code className="w-5 h-5 text-[#6CE5D8]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${statusColors[p.status] || "#5E6386"}20`, color: statusColors[p.status] || "#5E6386" }}>{p.status}</span>
                    <button onClick={() => deleteProject.mutate({ id: p.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() }) })} className="text-[#5E6386] hover:text-[#F2879B] transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-white mb-1">{p.title}</h3>
                {p.description && <p className="text-sm text-[#A7ACC8] mb-3 flex-1 line-clamp-2">{p.description}</p>}
                {p.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {p.tags.map((t: string) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-[#6CE5D8]/10 text-[#6CE5D8]">{t}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/5">
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#A7ACC8] hover:text-white transition-colors"><Github className="w-3.5 h-3.5" />GitHub</a>}
                  {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#6CE5D8] hover:underline"><ExternalLink className="w-3.5 h-3.5" />Live</a>}
                  {p.semester && <span className="text-xs font-mono text-[#5E6386] ml-auto">Sem {p.semester}</span>}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
    </PageTransition>
  );
}
