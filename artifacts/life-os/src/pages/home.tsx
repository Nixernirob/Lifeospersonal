import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useGetUpcomingAssignments, useGetRecentMemories, useGetRecentNotes } from "@workspace/api-client-react";

export default function Home() {
  const { data: assignments, isLoading: isLoadingAssignments } = useGetUpcomingAssignments({ limit: 3 });
  const { data: memories, isLoading: isLoadingMemories } = useGetRecentMemories({ limit: 3 });
  const { data: notes, isLoading: isLoadingNotes } = useGetRecentNotes({ limit: 3 });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PageTransition className="space-y-8">
      <header className="space-y-2 relative">
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">
          {getGreeting()}, Student.
        </h1>
        <p className="text-[#A7ACC8] font-mono text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 md:col-span-2 space-y-4">
          <h2 className="text-xl font-display font-semibold text-white">Semester Progress</h2>
          <div className="h-4 w-full bg-black/20 rounded-full overflow-hidden border border-white/5 relative">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] w-[65%]" />
          </div>
          <div className="flex justify-between text-xs font-mono text-[#A7ACC8]">
            <span>Week 9 / 14</span>
            <span>65% Completed</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <h2 className="text-xl font-display font-semibold text-white">Today's Mood</h2>
          <div className="flex gap-2 justify-center py-2">
             {/* Replace with log mood mutation later */}
             {['Great', 'Good', 'Okay', 'Bad'].map(mood => (
               <button key={mood} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors border border-white/10 hover:border-white/20">
                 {mood}
               </button>
             ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F2879B]" />
            Upcoming
          </h2>
          {isLoadingAssignments ? (
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ) : (
            <div className="space-y-3">
              {assignments?.map(assignment => (
                <GlassCard key={assignment.id} className="p-4" interactive>
                  <div className="text-xs font-mono text-[#F2879B] mb-1">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                  <div className="font-medium">{assignment.title}</div>
                  <div className="text-xs text-[#A7ACC8] mt-1">{assignment.subjectName}</div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6CE5D8]" />
            Recent Notes
          </h2>
          {isLoadingNotes ? (
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ) : (
            <div className="space-y-3">
              {notes?.map(note => (
                <GlassCard key={note.id} className="p-4" interactive>
                  <div className="text-xs text-[#6CE5D8] mb-1">{note.group}</div>
                  <div className="font-medium line-clamp-1">{note.title}</div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E8C27A]" />
            Latest Memories
          </h2>
          {isLoadingMemories ? (
            <div className="h-32 bg-white/5 rounded-2xl animate-pulse" />
          ) : (
            <div className="space-y-3">
              {memories?.map(memory => (
                <GlassCard key={memory.id} className="p-4" interactive>
                  <div className="text-xs font-mono text-[#E8C27A] mb-1">{new Date(memory.date).toLocaleDateString()}</div>
                  <div className="font-medium line-clamp-1">{memory.title}</div>
                  {memory.location && <div className="text-xs text-[#A7ACC8] mt-1">{memory.location}</div>}
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
