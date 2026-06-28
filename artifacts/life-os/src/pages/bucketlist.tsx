import { useState } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useListBucketListItems, useCreateBucketListItem, useUpdateBucketListItem, useDeleteBucketListItem } from "@workspace/api-client-react";
import { getListBucketListItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CheckCircle, Circle, ListTodo, Trophy, CalendarCheck } from "lucide-react";

export default function BucketList() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useListBucketListItems();
  const createItem = useCreateBucketListItem();
  const updateItem = useUpdateBucketListItem();
  const deleteItem = useDeleteBucketListItem();
  const [newText, setNewText] = useState("");
  const [newDate, setNewDate] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmUncheck, setConfirmUncheck] = useState<any>(null);

  const pending = (items as any[]).filter((i: any) => !i.checked);
  const done = (items as any[]).filter((i: any) => i.checked);

  const handleToggle = (item: any) => {
    if (item.checked) {
      setConfirmUncheck(item);
    } else {
      updateItem.mutate({ id: item.id, data: { checked: true } }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBucketListItemsQueryKey() })
      });
    }
  };

  const handleConfirmUncheck = (clearDate: boolean) => {
    if (!confirmUncheck) return;
    updateItem.mutate({
      id: confirmUncheck.id,
      data: { checked: false, completedAt: clearDate ? null! : undefined }
    }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBucketListItemsQueryKey() })
    });
    setConfirmUncheck(null);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    createItem.mutate({ data: { text: newText, targetDate: newDate || undefined } }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListBucketListItemsQueryKey() }); setNewText(""); setNewDate(""); setAdding(false); }
    });
  };

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Bucket List</h1>
          <p className="text-[#A7ACC8] text-sm mt-1">{done.length} / {(items as any[]).length} completed</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Confirm uncheck modal */}
      <AnimatePresence>
        {confirmUncheck && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmUncheck(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <GlassCard className="p-6 max-w-sm w-full mx-4">
                <div className="text-center mb-4">
                  <Trophy className="w-8 h-8 text-[#E8C27A] mx-auto mb-2" />
                  <h3 className="font-semibold text-white mb-1">Unmark as completed?</h3>
                  <p className="text-sm text-[#A7ACC8]">"{confirmUncheck.text}"</p>
                  {confirmUncheck.completedAt && (
                    <p className="text-xs text-[#5E6386] mt-1">Completed {new Date(confirmUncheck.completedAt).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleConfirmUncheck(false)} className="w-full py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/15 transition-colors">
                    Keep completion record
                  </button>
                  <button onClick={() => handleConfirmUncheck(true)} className="w-full py-2 rounded-xl bg-white/5 text-[#A7ACC8] text-sm hover:bg-white/10 transition-colors">
                    Clear completion date
                  </button>
                  <button onClick={() => setConfirmUncheck(null)} className="w-full py-2 rounded-xl text-[#5E6386] text-sm hover:text-[#A7ACC8] transition-colors">
                    Cancel
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#A7ACC8]">Progress</span>
          <span className="text-sm font-mono text-[#6CE5D8]">{(items as any[]).length > 0 ? Math.round((done.length / (items as any[]).length) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-black/20 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] rounded-full" initial={{ width: 0 }} animate={{ width: `${(items as any[]).length > 0 ? (done.length / (items as any[]).length) * 100 : 0}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
        </div>
      </GlassCard>

      {adding && (
        <GlassCard className="p-5">
          <form onSubmit={handleAdd} className="flex gap-3">
            <input required className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Something before graduation..." value={newText} onChange={e => setNewText(e.target.value)} />
            <input type="date" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none" value={newDate} onChange={e => setNewDate(e.target.value)} />
            <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#6CE5D8] text-[#07080F] font-semibold text-sm">Add</button>
          </form>
        </GlassCard>
      )}

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="text-xs font-mono text-[#5E6386] uppercase tracking-wider">Pending ({pending.length})</div>
            {pending.map((item: any, i: number) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <GlassCard className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => handleToggle(item)} interactive>
                  <Circle className="w-5 h-5 text-[#5E6386] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-white">{item.text}</span>
                    {item.targetDate && (
                      <div className="text-xs font-mono text-[#5E6386] mt-0.5">
                        by {new Date(item.targetDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteItem.mutate({ id: item.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBucketListItemsQueryKey() }) }); }} className="text-[#5E6386] hover:text-[#F2879B] transition-colors"><X className="w-4 h-4" /></button>
                </GlassCard>
              </motion.div>
            ))}
            {pending.length === 0 && done.length > 0 && (
              <div className="text-center py-8">
                <Trophy className="w-8 h-8 text-[#E8C27A] mx-auto mb-2" />
                <p className="text-sm text-[#A7ACC8]">All done! Incredible work.</p>
              </div>
            )}
          </div>

          {done.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-[#5E6386] uppercase tracking-wider">Completed ({done.length})</div>
              {done.map((item: any, i: number) => (
                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <GlassCard className="flex items-center gap-4 p-4 cursor-pointer opacity-70 hover:opacity-90 transition-opacity" onClick={() => handleToggle(item)}>
                    <CheckCircle className="w-5 h-5 text-[#6CE5D8] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[#A7ACC8] line-through">{item.text}</span>
                      <div className="flex items-center gap-3 mt-0.5">
                        {item.completedAt && (
                          <div className="flex items-center gap-1 text-xs font-mono text-[#6CE5D8]/70">
                            <CalendarCheck className="w-3 h-3" />
                            {new Date(item.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        )}
                        {item.targetDate && (
                          <div className="text-xs font-mono text-[#5E6386]">
                            target: {new Date(item.targetDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteItem.mutate({ id: item.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBucketListItemsQueryKey() }) }); }} className="text-[#5E6386] hover:text-[#F2879B] transition-colors"><X className="w-4 h-4" /></button>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}

          {(items as any[]).length === 0 && (
            <div className="flex flex-col items-center py-20 text-[#5E6386]">
              <ListTodo className="w-8 h-8 mb-3 opacity-50" />
              <p>Add things you want to do before graduation.</p>
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
}
