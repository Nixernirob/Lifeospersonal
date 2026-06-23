import { useState } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useListAchievements, useCreateAchievement, useDeleteAchievement } from "@workspace/api-client-react";
import { getListAchievementsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trophy, Star, Code, Briefcase, Award } from "lucide-react";

const ICONS: Record<string, React.ElementType> = { trophy: Trophy, star: Star, code: Code, briefcase: Briefcase, award: Award };

function AddModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createAchievement = useCreateAchievement();
  const [form, setForm] = useState({ title: "", description: "", date: new Date().toISOString().split("T")[0], icon: "trophy", category: "Competition" });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAchievement.mutate({ data: form }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAchievementsQueryKey() }); onClose(); }
    });
  };
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative z-10 w-full max-w-lg" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
          <GlassCard className="p-8">
            <button onClick={onClose} className="absolute top-4 right-4 text-[#5E6386] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-display font-bold text-white mb-6">Log Achievement</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#E8C27A]/50" placeholder="Achievement title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#E8C27A]/50 resize-none h-20" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <select className="bg-[#12152C] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}>
                  <option value="trophy">Trophy</option><option value="star">Star</option><option value="code">Code</option><option value="briefcase">Briefcase</option><option value="award">Award</option>
                </select>
                <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <button type="submit" disabled={createAchievement.isPending} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E8C27A] to-[#9B86F2] text-[#07080F] font-semibold text-sm">
                {createAchievement.isPending ? "Saving..." : "Log Achievement"}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Achievements() {
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();
  const { data: achievements = [], isLoading } = useListAchievements();
  const deleteAchievement = useDeleteAchievement();

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Achievements</h1>
          <p className="text-[#A7ACC8] text-sm mt-1">{achievements.length} milestones unlocked</p>
        </div>
        <button onClick={() => setShowAdd(true)} data-testid="button-add-achievement" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E8C27A] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Log Achievement
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#E8C27A]/0 via-[#E8C27A]/40 to-[#9B86F2]/0" />
          <div className="space-y-6">
            {achievements.map((a: any, i: number) => {
              const Icon = ICONS[a.icon] || Trophy;
              return (
                <motion.div key={a.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex items-start gap-6 pl-2">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#E8C27A]/20 to-[#9B86F2]/20 border border-[#E8C27A]/30 flex items-center justify-center relative z-10" style={{ boxShadow: "0 0 16px rgba(232,194,122,0.2)" }}>
                    <Icon className="w-5 h-5 text-[#E8C27A]" />
                  </div>
                  <GlassCard className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        {a.category && <span className="text-xs text-[#E8C27A] font-mono mb-1 block">{a.category}</span>}
                        <h3 className="font-display font-semibold text-white">{a.title}</h3>
                        {a.description && <p className="text-sm text-[#A7ACC8] mt-1">{a.description}</p>}
                        <div className="text-xs font-mono text-[#5E6386] mt-2">{new Date(a.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                      </div>
                      <button onClick={() => deleteAchievement.mutate({ id: a.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAchievementsQueryKey() }) })} className="text-[#5E6386] hover:text-[#F2879B] transition-colors ml-4"><X className="w-4 h-4" /></button>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
    </PageTransition>
  );
}
