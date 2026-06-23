import { useState, useEffect } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useGetTodayJournal, useCreateJournalEntry, useUpdateJournalEntry, useListJournalEntries, useLogMood } from "@workspace/api-client-react";
import { getGetTodayJournalQueryKey, getListJournalEntriesQueryKey, getListMoodLogsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Smile, Sun, Moon, Zap, Coffee, BookOpen } from "lucide-react";

const MOODS = [
  { value: "happy", label: "Happy", icon: Smile, color: "#6CE5D8" },
  { value: "excited", label: "Excited", icon: Zap, color: "#E8C27A" },
  { value: "normal", label: "Normal", icon: Sun, color: "#9B86F2" },
  { value: "tired", label: "Tired", icon: Coffee, color: "#A7ACC8" },
  { value: "sad", label: "Sad", icon: Moon, color: "#F2879B" },
];

export default function Journal() {
  const queryClient = useQueryClient();
  const { data: todayEntry, isLoading: loadingToday } = useGetTodayJournal();
  const { data: entries = [] } = useListJournalEntries();
  const createEntry = useCreateJournalEntry();
  const updateEntry = useUpdateJournalEntry();
  const logMood = useLogMood();

  const [form, setForm] = useState({ mood: "", bestMoment: "", learned: "", watched: "", randomThought: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (todayEntry) {
      setForm({
        mood: todayEntry.mood || "",
        bestMoment: todayEntry.bestMoment || "",
        learned: todayEntry.learned || "",
        watched: todayEntry.watched || "",
        randomThought: todayEntry.randomThought || "",
      });
    }
  }, [todayEntry]);

  const handleSave = () => {
    const today = new Date().toISOString().split("T")[0];
    if (todayEntry) {
      updateEntry.mutate({ id: todayEntry.id, data: form }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetTodayJournalQueryKey() }); setSaved(true); setTimeout(() => setSaved(false), 2000); }
      });
    } else {
      createEntry.mutate({ data: { date: today, ...form } }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getGetTodayJournalQueryKey() }); queryClient.invalidateQueries({ queryKey: getListJournalEntriesQueryKey() }); setSaved(true); setTimeout(() => setSaved(false), 2000); }
      });
    }
    if (form.mood) {
      logMood.mutate({ data: { mood: form.mood } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMoodLogsQueryKey() }) });
    }
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <PageTransition className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">Daily Journal</h1>
        <p className="text-[#A7ACC8] text-sm mt-1 font-mono">{today}</p>
      </div>

      <div className="space-y-6">
        {/* Mood Picker */}
        <GlassCard className="p-6">
          <div className="text-xs font-mono text-[#5E6386] mb-4">How are you feeling today?</div>
          <div className="flex gap-3">
            {MOODS.map(mood => {
              const Icon = mood.icon;
              return (
                <button key={mood.value} onClick={() => setForm(f => ({ ...f, mood: mood.value }))} data-testid={`mood-${mood.value}`}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all ${form.mood === mood.value ? "bg-white/10 border-white/20" : "border-white/5 hover:border-white/10 hover:bg-white/5"}`}>
                  <Icon className="w-5 h-5" style={{ color: form.mood === mood.value ? mood.color : "#5E6386" }} />
                  <span className="text-xs" style={{ color: form.mood === mood.value ? mood.color : "#5E6386" }}>{mood.label}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Journal Fields */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { field: "bestMoment", label: "Best moment today", placeholder: "What made today worth it?" },
            { field: "learned", label: "What I learned", placeholder: "Any insight, lesson, or skill..." },
            { field: "watched", label: "What I watched / read", placeholder: "Movie, book, YouTube, anything..." },
            { field: "randomThought", label: "Random thought", placeholder: "That thing that's been on your mind..." },
          ].map(({ field, label, placeholder }) => (
            <GlassCard key={field} className="p-5">
              <div className="text-xs font-mono text-[#5E6386] mb-2">{label}</div>
              <textarea
                className="w-full bg-transparent text-sm text-white placeholder-[#5E6386] focus:outline-none resize-none h-24"
                placeholder={placeholder}
                value={(form as any)[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              />
            </GlassCard>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} disabled={createEntry.isPending || updateEntry.isPending} data-testid="button-save-journal"
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${saved ? "bg-[#9B86F2] text-white" : "bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F]"} hover:opacity-90`}>
            {saved ? "Saved!" : createEntry.isPending || updateEntry.isPending ? "Saving..." : "Save Entry"}
          </button>
        </div>
      </div>

      {/* Past Entries */}
      {entries.length > 1 && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-[#5E6386] uppercase tracking-wider">Past Entries</div>
          {entries.filter((e: any) => e.date !== new Date().toISOString().split("T")[0]).slice(0, 5).map((entry: any) => {
            const mood = MOODS.find(m => m.value === entry.mood);
            return (
              <GlassCard key={entry.id} className="p-4 flex items-center gap-4">
                <div className="text-xs font-mono text-[#5E6386] w-24 flex-shrink-0">{new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                {mood && <span style={{ color: mood.color }} className="text-xs">{mood.label}</span>}
                {entry.bestMoment && <p className="text-sm text-[#A7ACC8] line-clamp-1 flex-1">{entry.bestMoment}</p>}
              </GlassCard>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
