import { useState } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useListFutureLetters, useCreateFutureLetter, useDeleteFutureLetter } from "@workspace/api-client-react";
import { getListFutureLettersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Lock, Unlock, Mail } from "lucide-react";

const PRESET_DATES = [
  { label: "Graduation (2024)", value: "2024-06-01" },
  { label: "2030", value: "2030-01-01" },
  { label: "2035", value: "2035-01-01" },
  { label: "2040", value: "2040-01-01" },
];

function Countdown({ unlockDate }: { unlockDate: string }) {
  const now = new Date();
  const unlock = new Date(unlockDate);
  const diff = unlock.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  if (years > 0) return <span className="text-xs font-mono text-[#5E6386]">{years}y {months}mo left</span>;
  return <span className="text-xs font-mono text-[#5E6386]">{days}d left</span>;
}

function WriteModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createLetter = useCreateFutureLetter();
  const [form, setForm] = useState({ title: "", content: "", unlockDate: "2030-01-01", customDate: "" });
  const [useCustom, setUseCustom] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = useCustom ? form.customDate : form.unlockDate;
    createLetter.mutate({ data: { title: form.title, content: form.content, unlockDate: date } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListFutureLettersQueryKey() }); onClose(); }
    });
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative z-10 w-full max-w-2xl" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
          <GlassCard className="p-8">
            <button onClick={onClose} className="absolute top-4 right-4 text-[#5E6386] hover:text-white"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-5 h-5 text-[#9B86F2]" />
              <h2 className="text-xl font-display font-bold text-white">Write a Letter to the Future</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#9B86F2]/50" placeholder="Letter title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#9B86F2]/50 resize-none h-48" placeholder="Write to your future self..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
              <div className="space-y-2">
                <div className="text-xs text-[#5E6386]">Unlock date</div>
                {!useCustom ? (
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_DATES.map(p => (
                      <button key={p.value} type="button" onClick={() => setForm(f => ({ ...f, unlockDate: p.value }))} className={`px-3 py-2 rounded-xl text-sm transition-all border ${form.unlockDate === p.value ? "bg-[#9B86F2]/10 border-[#9B86F2]/40 text-[#9B86F2]" : "border-white/10 text-[#A7ACC8] hover:border-white/20"}`}>{p.label}</button>
                    ))}
                  </div>
                ) : (
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" value={form.customDate} onChange={e => setForm(f => ({ ...f, customDate: e.target.value }))} />
                )}
                <button type="button" onClick={() => setUseCustom(!useCustom)} className="text-xs text-[#5E6386] hover:text-[#A7ACC8] transition-colors">{useCustom ? "Use preset dates" : "Use custom date"}</button>
              </div>
              <button type="submit" disabled={createLetter.isPending} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9B86F2] to-[#6CE5D8] text-[#07080F] font-semibold text-sm">
                {createLetter.isPending ? "Sealing..." : "Seal the Letter"}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function FutureLetters() {
  const [showWrite, setShowWrite] = useState(false);
  const [openedId, setOpenedId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { data: letters = [], isLoading } = useListFutureLetters();
  const deleteLetter = useDeleteFutureLetter();

  const locked = letters.filter((l: any) => !l.isUnlocked);
  const unlocked = letters.filter((l: any) => l.isUnlocked);

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Future Letters</h1>
          <p className="text-[#A7ACC8] text-sm mt-1">{locked.length} sealed · {unlocked.length} unlocked</p>
        </div>
        <button onClick={() => setShowWrite(true)} data-testid="button-write-letter" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#9B86F2] to-[#6CE5D8] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Write Letter
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-8">
          {locked.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-[#5E6386] uppercase tracking-wider">Sealed</div>
              <div className="grid grid-cols-2 gap-4">
                {locked.map((letter: any, i: number) => (
                  <motion.div key={letter.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <GlassCard className="p-6 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#9B86F2]/5 to-transparent pointer-events-none" />
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#9B86F2]/10 border border-[#9B86F2]/20 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-[#9B86F2]" />
                        </div>
                        <button onClick={() => deleteLetter.mutate({ id: letter.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFutureLettersQueryKey() }) })} className="text-[#5E6386] hover:text-[#F2879B] transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                      <h3 className="font-display font-semibold text-white mb-2">{letter.title}</h3>
                      <div className="text-xs text-[#9B86F2] mb-1">Opens {new Date(letter.unlockDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                      <Countdown unlockDate={letter.unlockDate} />
                      {/* Blurred content */}
                      <div className="mt-4 h-12 rounded-lg bg-white/5 overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center px-3 filter blur-sm text-xs text-[#5E6386] select-none">The future awaits your words...</div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {unlocked.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-[#6CE5D8] uppercase tracking-wider">Unlocked</div>
              <div className="grid grid-cols-2 gap-4">
                {unlocked.map((letter: any, i: number) => (
                  <motion.div key={letter.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <GlassCard className="p-6 cursor-pointer" onClick={() => setOpenedId(openedId === letter.id ? null : letter.id)} interactive>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#6CE5D8]/10 border border-[#6CE5D8]/20 flex items-center justify-center">
                          <Unlock className="w-4 h-4 text-[#6CE5D8]" />
                        </div>
                        <button onClick={e => { e.stopPropagation(); deleteLetter.mutate({ id: letter.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFutureLettersQueryKey() }) }); }} className="text-[#5E6386] hover:text-[#F2879B] transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                      <h3 className="font-display font-semibold text-white mb-2">{letter.title}</h3>
                      <div className="text-xs font-mono text-[#5E6386] mb-3">{new Date(letter.createdAt).toLocaleDateString()}</div>
                      <AnimatePresence>
                        {openedId === letter.id && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <p className="text-sm text-[#A7ACC8] leading-relaxed border-t border-white/5 pt-3">{letter.content}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {openedId !== letter.id && <p className="text-xs text-[#5E6386]">Click to read...</p>}
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {letters.length === 0 && (
            <div className="flex flex-col items-center py-20 text-[#5E6386]">
              <Mail className="w-8 h-8 mb-3 opacity-50" />
              <p>Write a letter to your future self. It will unlock on the date you choose.</p>
            </div>
          )}
        </div>
      )}

      {showWrite && <WriteModal onClose={() => setShowWrite(false)} />}
    </PageTransition>
  );
}
