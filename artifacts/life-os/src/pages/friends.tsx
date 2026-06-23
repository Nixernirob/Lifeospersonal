import { useState } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useListFriends, useCreateFriend, useDeleteFriend } from "@workspace/api-client-react";
import { getListFriendsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users, Calendar, MapPin } from "lucide-react";

function AddModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const createFriend = useCreateFriend();
  const [form, setForm] = useState({ name: "", department: "", birthday: "", firstMet: "", notes: "" });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFriend.mutate({ data: form }, {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListFriendsQueryKey() }); onClose(); }
    });
  };
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div className="relative z-10 w-full max-w-lg" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}>
          <GlassCard className="p-8">
            <button onClick={onClose} className="absolute top-4 right-4 text-[#5E6386] hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            <h2 className="text-xl font-display font-bold text-white mb-6">Add Friend</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#9B86F2]/50" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Department" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#5E6386] mb-1 block">Birthday</label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-[#5E6386] mb-1 block">First Met</label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" value={form.firstMet} onChange={e => setForm(f => ({ ...f, firstMet: e.target.value }))} />
                </div>
              </div>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5E6386] focus:outline-none resize-none h-20" placeholder="Notes about this person..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <button type="submit" disabled={createFriend.isPending} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#9B86F2] to-[#6CE5D8] text-[#07080F] font-semibold text-sm">
                {createFriend.isPending ? "Saving..." : "Add Friend"}
              </button>
            </form>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = ["#6CE5D8", "#9B86F2", "#E8C27A", "#F2879B"];

export default function Friends() {
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();
  const { data: friends = [], isLoading } = useListFriends();
  const deleteFriend = useDeleteFriend();

  return (
    <PageTransition className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Friends Archive</h1>
          <p className="text-[#A7ACC8] text-sm mt-1">{friends.length} people in your journey</p>
        </div>
        <button onClick={() => setShowAdd(true)} data-testid="button-add-friend" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#9B86F2] to-[#6CE5D8] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Friend
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {friends.map((friend: any, i: number) => {
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <motion.div key={friend.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <GlassCard className="p-5 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold font-display" style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}>
                      {getInitials(friend.name)}
                    </div>
                    <button onClick={() => deleteFriend.mutate({ id: friend.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListFriendsQueryKey() }) })} className="text-[#5E6386] hover:text-[#F2879B] transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                  <h3 className="font-display font-semibold text-white mb-1">{friend.name}</h3>
                  {friend.department && (
                    <div className="flex items-center gap-1 text-xs text-[#5E6386] mb-2">
                      <MapPin className="w-3 h-3" />{friend.department}
                    </div>
                  )}
                  {friend.firstMet && (
                    <div className="flex items-center gap-1 text-xs text-[#5E6386] mb-2">
                      <Calendar className="w-3 h-3" />Met {new Date(friend.firstMet).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </div>
                  )}
                  {friend.birthday && (
                    <div className="text-xs text-[#9B86F2]">Birthday: {new Date(friend.birthday).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</div>
                  )}
                  {friend.notes && <p className="text-xs text-[#A7ACC8] mt-2 line-clamp-2">{friend.notes}</p>}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {!isLoading && friends.length === 0 && (
        <div className="flex flex-col items-center py-20 text-[#5E6386]">
          <Users className="w-8 h-8 mb-3 opacity-50" />
          <p>No friends archived yet. Add the people who shaped your university years.</p>
        </div>
      )}

      {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
    </PageTransition>
  );
}
