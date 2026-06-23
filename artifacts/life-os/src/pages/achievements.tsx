import { useState, useRef } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useListAchievements, useCreateAchievement, useUpdateAchievement, useDeleteAchievement } from "@workspace/api-client-react";
import { getListAchievementsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trophy, Star, Code, Briefcase, Award, Pencil, Trash2, ImagePlus } from "lucide-react";
import { fileToBase64 } from "@/lib/useImageUpload";

const ICONS: Record<string, React.ElementType> = { trophy: Trophy, star: Star, code: Code, briefcase: Briefcase, award: Award };

function AchievementFormModal({ achievement, onClose }: { achievement?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const create = useCreateAchievement();
  const update = useUpdateAchievement();
  const imgRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: achievement?.title ?? "",
    description: achievement?.description ?? "",
    date: achievement?.date ?? new Date().toISOString().split("T")[0],
    icon: achievement?.icon ?? "trophy",
    category: achievement?.category ?? "Competition",
  });
  const [imageUrl, setImageUrl] = useState<string | null>(achievement?.imageUrl ?? null);

  const handleImgChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(await fileToBase64(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, imageUrl: imageUrl ?? undefined };
    if (achievement) {
      update.mutate({ id: achievement.id, data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAchievementsQueryKey() }); onClose(); }
      });
    } else {
      create.mutate({ data }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAchievementsQueryKey() }); onClose(); }
      });
    }
  };
  const isPending = create.isPending || update.isPending;

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div className="relative z-10 w-full max-w-lg" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
        <GlassCard className="p-7">
          <button onClick={onClose} className="absolute top-4 right-4 text-[#5E6386] hover:text-white"><X className="w-5 h-5" /></button>
          <h2 className="text-xl font-display font-bold text-white mb-5">{achievement ? "Edit Achievement" : "Log Achievement"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#E8C27A]/50" placeholder="Achievement title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none resize-none h-20" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <select className="bg-[#12152C] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}>
                {Object.keys(ICONS).map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>

            <div className="flex items-center gap-3">
              {imageUrl ? (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageUrl(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><X className="w-4 h-4 text-white" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => imgRef.current?.click()} className="w-16 h-16 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-[#5E6386] hover:border-[#E8C27A]/50 hover:text-[#E8C27A] transition-colors">
                  <ImagePlus className="w-4 h-4" /><span className="text-[10px]">Photo</span>
                </button>
              )}
              <span className="text-xs text-[#5E6386]">Optional photo</span>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImgChange} />
            </div>

            <button type="submit" disabled={isPending} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E8C27A] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90">
              {isPending ? "Saving..." : achievement ? "Save Changes" : "Log Achievement"}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

export default function Achievements() {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const queryClient = useQueryClient();
  const { data: achievements = [], isLoading } = useListAchievements();
  const deleteAchievement = useDeleteAchievement();

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Achievements</h1>
          <p className="text-[#A7ACC8] text-sm mt-1">{(achievements as any[]).length} milestones unlocked</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E8C27A] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90">
          <Plus className="w-4 h-4" /> Log Achievement
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#E8C27A]/0 via-[#E8C27A]/40 to-[#9B86F2]/0" />
          <div className="space-y-5">
            {(achievements as any[]).map((a: any, i: number) => {
              const Icon = ICONS[a.icon] || Trophy;
              return (
                <motion.div key={a.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex items-start gap-5 pl-2">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#E8C27A]/20 to-[#9B86F2]/20 border border-[#E8C27A]/30 flex items-center justify-center relative z-10 overflow-hidden" style={{ boxShadow: "0 0 16px rgba(232,194,122,0.2)" }}>
                    {a.imageUrl ? <img src={a.imageUrl} alt="" className="w-full h-full object-cover" /> : <Icon className="w-5 h-5 text-[#E8C27A]" />}
                  </div>
                  <GlassCard className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {a.category && <span className="text-xs text-[#E8C27A] font-mono mb-1 block">{a.category}</span>}
                        <h3 className="font-display font-semibold text-white">{a.title}</h3>
                        {a.description && <p className="text-sm text-[#A7ACC8] mt-1">{a.description}</p>}
                        <div className="text-xs font-mono text-[#5E6386] mt-2">{new Date(a.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                      </div>
                      <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                        <button onClick={() => setEditing(a)} className="p-1.5 rounded-lg text-[#5E6386] hover:text-[#6CE5D8] hover:bg-white/5 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteAchievement.mutate({ id: a.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAchievementsQueryKey() }) })} className="p-1.5 rounded-lg text-[#5E6386] hover:text-[#F2879B] hover:bg-white/5 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {(showAdd || editing) && <AchievementFormModal achievement={editing} onClose={() => { setShowAdd(false); setEditing(null); }} />}
      </AnimatePresence>
    </PageTransition>
  );
}
