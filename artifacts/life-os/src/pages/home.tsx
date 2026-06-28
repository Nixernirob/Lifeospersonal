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
      <header className="space-y-2">
        <h1 className="text-4xl font-display font-bold tracking-tight" style={{ color: "var(--los-text-primary)" }}>
          {getGreeting()}, Student.
        </h1>
        <p className="font-mono text-sm" style={{ color: "var(--los-text-secondary)" }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      <GlassCard className="p-6 space-y-4">
        <h2 className="text-xl font-display font-semibold" style={{ color: "var(--los-text-primary)" }}>Semester Progress</h2>
        <div className="h-3 w-full rounded-full overflow-hidden" style={{ background: "var(--los-progress-track)" }}>
          <div
            className="h-full bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] rounded-full transition-all duration-700"
            style={{ width: "65%" }}
          />
        </div>
        <div className="flex justify-between text-xs font-mono" style={{ color: "var(--los-text-secondary)" }}>
          <span>Week 9 / 14</span>
          <span>65% Completed</span>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold flex items-center gap-2" style={{ color: "var(--los-text-primary)" }}>
            <span className="w-2 h-2 rounded-full bg-[#F2879B]" />
            Upcoming
          </h2>
          {isLoadingAssignments ? (
            <div className="h-32 rounded-2xl animate-pulse" style={{ background: "var(--los-surface-1)" }} />
          ) : (
            <div className="space-y-3">
              {assignments?.map(assignment => (
                <GlassCard key={assignment.id} className="p-4" interactive>
                  <div className="text-xs font-mono mb-1" style={{ color: "var(--los-coral)" }}>
                    {new Date(assignment.dueDate).toLocaleDateString()}
                  </div>
                  <div className="font-medium" style={{ color: "var(--los-text-primary)" }}>{assignment.title}</div>
                  <div className="text-xs mt-1" style={{ color: "var(--los-text-secondary)" }}>{assignment.subjectName}</div>
                </GlassCard>
              ))}
              {assignments?.length === 0 && (
                <p className="text-sm px-1" style={{ color: "var(--los-text-muted)" }}>No upcoming assignments.</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold flex items-center gap-2" style={{ color: "var(--los-text-primary)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--los-cyan)" }} />
            Recent Notes
          </h2>
          {isLoadingNotes ? (
            <div className="h-32 rounded-2xl animate-pulse" style={{ background: "var(--los-surface-1)" }} />
          ) : (
            <div className="space-y-3">
              {notes?.map(note => (
                <GlassCard key={note.id} className="p-4" interactive>
                  <div className="text-xs mb-1" style={{ color: "var(--los-cyan)" }}>{note.group}</div>
                  <div className="font-medium line-clamp-1" style={{ color: "var(--los-text-primary)" }}>{note.title}</div>
                </GlassCard>
              ))}
              {notes?.length === 0 && (
                <p className="text-sm px-1" style={{ color: "var(--los-text-muted)" }}>No notes yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold flex items-center gap-2" style={{ color: "var(--los-text-primary)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--los-gold)" }} />
            Latest Memories
          </h2>
          {isLoadingMemories ? (
            <div className="h-32 rounded-2xl animate-pulse" style={{ background: "var(--los-surface-1)" }} />
          ) : (
            <div className="space-y-3">
              {memories?.map(memory => (
                <GlassCard key={memory.id} className="p-4" interactive>
                  <div className="text-xs font-mono mb-1" style={{ color: "var(--los-gold)" }}>
                    {new Date(memory.date).toLocaleDateString()}
                  </div>
                  <div className="font-medium line-clamp-1" style={{ color: "var(--los-text-primary)" }}>{memory.title}</div>
                  {memory.location && <div className="text-xs mt-1" style={{ color: "var(--los-text-secondary)" }}>{memory.location}</div>}
                </GlassCard>
              ))}
              {memories?.length === 0 && (
                <p className="text-sm px-1" style={{ color: "var(--los-text-muted)" }}>No memories yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
