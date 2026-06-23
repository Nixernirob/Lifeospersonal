import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import { useGetStats, useListMoodLogs } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { BookOpen, Image, Code, Trophy, Users, Calendar, CheckCircle, Clock, ListTodo } from "lucide-react";

function StatCard({ icon: Icon, label, value, color, delay }: { icon: React.ElementType; label: string; value: number; color: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <GlassCard className="p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <div className="text-xs text-[#5E6386]">{label}</div>
          <div className="text-3xl font-display font-bold" style={{ color }}>{value}</div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function Statistics() {
  const { data: stats, isLoading } = useGetStats();
  const { data: moodLogs = [] } = useListMoodLogs();

  // Mood frequency chart
  const moodCounts: Record<string, number> = {};
  moodLogs.forEach((m: any) => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
  const moodData = Object.entries(moodCounts).map(([mood, count]) => ({ mood, count }));
  const moodColors: Record<string, string> = { happy: "#6CE5D8", excited: "#E8C27A", normal: "#9B86F2", tired: "#A7ACC8", sad: "#F2879B" };

  if (isLoading) return (
    <PageTransition className="grid grid-cols-3 gap-4">
      {[...Array(9)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)}
    </PageTransition>
  );

  return (
    <PageTransition className="space-y-8">
      <div>
        <h1 className="text-4xl font-display font-bold text-white tracking-tight">Statistics</h1>
        <p className="text-[#A7ACC8] text-sm mt-1">A reflection of everything you've built and experienced</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Image} label="Total Memories" value={stats?.totalMemories || 0} color="#6CE5D8" delay={0} />
        <StatCard icon={BookOpen} label="Smart Notes" value={stats?.totalNotes || 0} color="#9B86F2" delay={0.05} />
        <StatCard icon={Code} label="Projects" value={stats?.totalProjects || 0} color="#6CE5D8" delay={0.1} />
        <StatCard icon={Trophy} label="Achievements" value={stats?.totalAchievements || 0} color="#E8C27A" delay={0.15} />
        <StatCard icon={Users} label="Friends" value={stats?.totalFriends || 0} color="#9B86F2" delay={0.2} />
        <StatCard icon={Calendar} label="Days Journaled" value={stats?.totalDaysRecorded || 0} color="#6CE5D8" delay={0.25} />
        <StatCard icon={CheckCircle} label="Assignments Done" value={stats?.assignmentsCompleted || 0} color="#9B86F2" delay={0.3} />
        <StatCard icon={Clock} label="Assignments Pending" value={stats?.assignmentsPending || 0} color="#F2879B" delay={0.35} />
        <StatCard icon={ListTodo} label="Bucket List Done" value={stats?.bucketListCompleted || 0} color="#E8C27A" delay={0.4} />
      </div>

      {moodData.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-sm font-mono text-[#5E6386] mb-4">Mood Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={moodData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mood" tick={{ fill: "#5E6386", fontSize: 11, fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fill: "#5E6386", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#12152C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#F1F2FA", fontSize: 12 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {moodData.map((entry, index) => (
                  <rect key={`cell-${index}`} fill={moodColors[entry.mood] || "#6CE5D8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Bucket list progress */}
      {(stats?.bucketListTotal || 0) > 0 && (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#A7ACC8]">Bucket List Progress</span>
            <span className="text-sm font-mono text-[#E8C27A]">{stats?.bucketListCompleted || 0} / {stats?.bucketListTotal || 0}</span>
          </div>
          <div className="h-2.5 bg-black/20 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-[#E8C27A] to-[#9B86F2] rounded-full" initial={{ width: 0 }} animate={{ width: `${((stats?.bucketListCompleted || 0) / (stats?.bucketListTotal || 1)) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }} />
          </div>
        </GlassCard>
      )}
    </PageTransition>
  );
}
