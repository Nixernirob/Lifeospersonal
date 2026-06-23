import { useState } from "react";
import { PageTransition } from "@/components/ui/page-transition";
import { GlassCard } from "@/components/ui/glass";
import {
  useListSubjects, useCreateSubject, useUpdateSubject, useDeleteSubject,
  useListAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment,
  useListExams, useCreateExam, useDeleteExam,
  useGetGpaData,
} from "@workspace/api-client-react";
import { getListSubjectsQueryKey, getListAssignmentsQueryKey, getListExamsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Plus, X, GraduationCap, BookOpen, Clock, CheckCircle } from "lucide-react";

const TABS = ["Subjects", "Assignments", "Exams", "GPA Tracker"] as const;

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = { pending: "#E8C27A", in_progress: "#6CE5D8", completed: "#9B86F2" };
  return (
    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${colors[status] || "#5E6386"}20`, color: colors[status] || "#5E6386", border: `1px solid ${colors[status] || "#5E6386"}30` }}>
      {status.replace("_", " ")}
    </span>
  );
}

function Countdown({ examDate }: { examDate: string }) {
  const now = new Date();
  const exam = new Date(examDate);
  const diff = exam.getTime() - now.getTime();
  if (diff < 0) return <span className="text-xs font-mono text-[#5E6386]">Past</span>;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return <span className="text-xs font-mono text-[#F2879B]">{days}d {hours}h</span>;
}

export default function University() {
  const [tab, setTab] = useState<typeof TABS[number]>("Subjects");
  const queryClient = useQueryClient();
  const { data: subjects = [] } = useListSubjects();
  const { data: assignments = [] } = useListAssignments();
  const { data: exams = [] } = useListExams();
  const { data: gpaData = [] } = useGetGpaData();

  // Create forms state
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const createSubject = useCreateSubject();
  const createAssignment = useCreateAssignment();
  const createExam = useCreateExam();
  const updateAssignment = useUpdateAssignment();
  const deleteSubject = useDeleteSubject();
  const deleteAssignment = useDeleteAssignment();
  const deleteExam = useDeleteExam();

  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", semester: "7", credits: "3" });
  const [assignmentForm, setAssignmentForm] = useState({ title: "", subjectName: "", dueDate: "", priority: "medium" });
  const [examForm, setExamForm] = useState({ title: "", subjectName: "", examDate: "", category: "midterm", semester: "7" });

  const latestCgpa = gpaData.length > 0 ? gpaData[gpaData.length - 1].cgpa : 0;
  const pending = assignments.filter((a: any) => a.status === "pending");
  const inProgress = assignments.filter((a: any) => a.status === "in_progress");
  const completed = assignments.filter((a: any) => a.status === "completed");

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">University</h1>
          <p className="text-[#A7ACC8] text-sm mt-1">Academic dashboard — Semester 8</p>
        </div>
        {tab === "GPA Tracker" && (
          <GlassCard className="px-6 py-3 flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-[#E8C27A]" />
            <div>
              <div className="text-xs text-[#5E6386]">Current CGPA</div>
              <div className="text-2xl font-display font-bold text-[#E8C27A]">{latestCgpa.toFixed(2)}</div>
            </div>
          </GlassCard>
        )}
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-white/5 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white/10 text-white" : "text-[#5E6386] hover:text-[#A7ACC8]"}`}>{t}</button>
        ))}
      </div>

      {/* Subjects Tab */}
      {tab === "Subjects" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddSubject(!showAddSubject)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          </div>
          {showAddSubject && (
            <GlassCard className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Subject name" value={subjectForm.name} onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))} />
                <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Code (e.g. CSE401)" value={subjectForm.code} onChange={e => setSubjectForm(f => ({ ...f, code: e.target.value }))} />
                <input type="number" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Semester" value={subjectForm.semester} onChange={e => setSubjectForm(f => ({ ...f, semester: e.target.value }))} />
                <input type="number" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-[#5E6386] focus:outline-none focus:border-[#6CE5D8]/50" placeholder="Credits" value={subjectForm.credits} onChange={e => setSubjectForm(f => ({ ...f, credits: e.target.value }))} />
              </div>
              <button onClick={() => { createSubject.mutate({ data: { name: subjectForm.name, code: subjectForm.code, semester: Number(subjectForm.semester), credits: Number(subjectForm.credits) } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListSubjectsQueryKey() }); setShowAddSubject(false); setSubjectForm({ name: "", code: "", semester: "7", credits: "3" }); } }); }} className="mt-3 px-4 py-2 rounded-xl bg-[#6CE5D8] text-[#07080F] font-semibold text-sm">Add</button>
            </GlassCard>
          )}
          <GlassCard className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-3 text-xs font-mono text-[#5E6386]">Subject</th>
                  <th className="text-left px-6 py-3 text-xs font-mono text-[#5E6386]">Code</th>
                  <th className="text-center px-6 py-3 text-xs font-mono text-[#5E6386]">Semester</th>
                  <th className="text-center px-6 py-3 text-xs font-mono text-[#5E6386]">Credits</th>
                  <th className="text-center px-6 py-3 text-xs font-mono text-[#5E6386]">Grade</th>
                  <th className="text-center px-6 py-3 text-xs font-mono text-[#5E6386]">GPA</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {subjects.map((s: any) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm font-medium text-white">{s.name}</td>
                    <td className="px-6 py-3 text-xs font-mono text-[#5E6386]">{s.code}</td>
                    <td className="px-6 py-3 text-center text-xs font-mono text-[#A7ACC8]">{s.semester}</td>
                    <td className="px-6 py-3 text-center text-xs font-mono text-[#A7ACC8]">{s.credits}</td>
                    <td className="px-6 py-3 text-center text-xs text-[#E8C27A]">{s.grade || "—"}</td>
                    <td className="px-6 py-3 text-center text-xs font-mono text-[#6CE5D8]">{s.gradePoint?.toFixed(1) || "—"}</td>
                    <td className="px-6 py-3 text-center"><button onClick={() => { deleteSubject.mutate({ id: s.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListSubjectsQueryKey() }) }); }} className="text-[#5E6386] hover:text-[#F2879B] transition-colors"><X className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>
      )}

      {/* Assignments Tab */}
      {tab === "Assignments" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddAssignment(!showAddAssignment)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Assignment
            </button>
          </div>
          {showAddAssignment && (
            <GlassCard className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Title" value={assignmentForm.title} onChange={e => setAssignmentForm(f => ({ ...f, title: e.target.value }))} />
                <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Subject name" value={assignmentForm.subjectName} onChange={e => setAssignmentForm(f => ({ ...f, subjectName: e.target.value }))} />
                <input type="date" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" value={assignmentForm.dueDate} onChange={e => setAssignmentForm(f => ({ ...f, dueDate: e.target.value }))} />
                <select className="bg-[#12152C] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" value={assignmentForm.priority} onChange={e => setAssignmentForm(f => ({ ...f, priority: e.target.value }))}>
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <button onClick={() => { createAssignment.mutate({ data: { title: assignmentForm.title, dueDate: assignmentForm.dueDate, priority: assignmentForm.priority, status: "pending" } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListAssignmentsQueryKey() }); setShowAddAssignment(false); } }); }} className="mt-3 px-4 py-2 rounded-xl bg-[#6CE5D8] text-[#07080F] font-semibold text-sm">Add</button>
            </GlassCard>
          )}
          <div className="grid grid-cols-3 gap-4">
            {[{ label: "Pending", items: pending, color: "#E8C27A" }, { label: "In Progress", items: inProgress, color: "#6CE5D8" }, { label: "Completed", items: completed, color: "#9B86F2" }].map(({ label, items, color }) => (
              <div key={label} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-sm font-medium text-[#A7ACC8]">{label}</span>
                  <span className="text-xs font-mono text-[#5E6386]">({items.length})</span>
                </div>
                {items.map((a: any) => {
                  const today = new Date().toISOString().split("T")[0];
                  const isOverdue = a.status !== "completed" && a.dueDate < today;
                  return (
                    <GlassCard key={a.id} className="p-4 space-y-2">
                      <div className="text-sm font-medium text-white">{a.title}</div>
                      {a.subjectName && <div className="text-xs text-[#5E6386]">{a.subjectName}</div>}
                      <div className={`text-xs font-mono ${isOverdue ? "text-[#F2879B]" : "text-[#A7ACC8]"}`}>{new Date(a.dueDate).toLocaleDateString()}{isOverdue ? " · Overdue" : ""}</div>
                      <div className="flex gap-2 mt-2">
                        {a.status === "pending" && <button onClick={() => updateAssignment.mutate({ id: a.id, data: { status: "in_progress" } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAssignmentsQueryKey() }) })} className="text-xs px-2 py-0.5 rounded-lg bg-[#6CE5D8]/10 text-[#6CE5D8] hover:bg-[#6CE5D8]/20 transition-colors">Start</button>}
                        {a.status === "in_progress" && <button onClick={() => updateAssignment.mutate({ id: a.id, data: { status: "completed" } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAssignmentsQueryKey() }) })} className="text-xs px-2 py-0.5 rounded-lg bg-[#9B86F2]/10 text-[#9B86F2] hover:bg-[#9B86F2]/20 transition-colors">Complete</button>}
                        <button onClick={() => deleteAssignment.mutate({ id: a.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListAssignmentsQueryKey() }) })} className="text-xs text-[#5E6386] hover:text-[#F2879B] transition-colors ml-auto"><X className="w-3 h-3" /></button>
                      </div>
                    </GlassCard>
                  );
                })}
                {items.length === 0 && <div className="text-xs text-[#5E6386] px-2 py-4 text-center">Empty</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exams Tab */}
      {tab === "Exams" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowAddExam(!showAddExam)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6CE5D8] to-[#9B86F2] text-[#07080F] font-semibold text-sm hover:opacity-90">
              <Plus className="w-4 h-4" /> Add Exam
            </button>
          </div>
          {showAddExam && (
            <GlassCard className="p-5">
              <div className="grid grid-cols-2 gap-3">
                <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Title" value={examForm.title} onChange={e => setExamForm(f => ({ ...f, title: e.target.value }))} />
                <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-[#5E6386] focus:outline-none" placeholder="Subject" value={examForm.subjectName} onChange={e => setExamForm(f => ({ ...f, subjectName: e.target.value }))} />
                <input type="date" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" value={examForm.examDate} onChange={e => setExamForm(f => ({ ...f, examDate: e.target.value }))} />
                <select className="bg-[#12152C] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" value={examForm.category} onChange={e => setExamForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="quiz">Quiz</option><option value="midterm">Midterm</option><option value="final">Final</option>
                </select>
              </div>
              <button onClick={() => { createExam.mutate({ data: { title: examForm.title, examDate: examForm.examDate, category: examForm.category, semester: Number(examForm.semester) } }, { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListExamsQueryKey() }); setShowAddExam(false); } }); }} className="mt-3 px-4 py-2 rounded-xl bg-[#6CE5D8] text-[#07080F] font-semibold text-sm">Add</button>
            </GlassCard>
          )}
          <div className="grid grid-cols-2 gap-4">
            {exams.map((exam: any, i: number) => {
              const catColors: Record<string, string> = { quiz: "#E8C27A", midterm: "#6CE5D8", final: "#F2879B" };
              const isPast = new Date(exam.examDate) < new Date();
              return (
                <motion.div key={exam.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: `${catColors[exam.category] || "#6CE5D8"}20`, color: catColors[exam.category] || "#6CE5D8" }}>{exam.category}</span>
                      <div className="flex items-center gap-2">
                        {isPast && exam.grade ? <span className="text-sm font-mono text-[#E8C27A]">{exam.grade}</span> : <Countdown examDate={exam.examDate} />}
                        <button onClick={() => deleteExam.mutate({ id: exam.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListExamsQueryKey() }) })} className="text-[#5E6386] hover:text-[#F2879B]"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="font-medium text-white">{exam.title}</div>
                    {exam.subjectName && <div className="text-xs text-[#5E6386] mt-1">{exam.subjectName}</div>}
                    <div className="text-xs font-mono text-[#A7ACC8] mt-2">{new Date(exam.examDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* GPA Tab */}
      {tab === "GPA Tracker" && (
        <div className="space-y-6">
          {gpaData.length > 0 ? (
            <GlassCard className="p-6">
              <h3 className="text-sm font-mono text-[#5E6386] mb-4">GPA / CGPA Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={gpaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="semester" tick={{ fill: "#5E6386", fontSize: 11, fontFamily: "JetBrains Mono" }} label={{ value: "Semester", position: "insideBottom", offset: -5, fill: "#5E6386", fontSize: 11 }} />
                  <YAxis domain={[0, 4]} tick={{ fill: "#5E6386", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                  <Tooltip contentStyle={{ background: "#12152C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#F1F2FA", fontSize: 12 }} />
                  <Line type="monotone" dataKey="gpa" stroke="#6CE5D8" strokeWidth={2} dot={{ fill: "#6CE5D8", r: 4 }} name="Semester GPA" />
                  <Line type="monotone" dataKey="cgpa" stroke="#9B86F2" strokeWidth={2} strokeDasharray="4 2" dot={{ fill: "#9B86F2", r: 4 }} name="CGPA" />
                </LineChart>
              </ResponsiveContainer>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 text-center text-[#5E6386]">Add subjects with grades in the Subjects tab to see GPA trends here.</GlassCard>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gpaData.map((g: any) => (
              <GlassCard key={g.semester} className="p-4 text-center">
                <div className="text-xs font-mono text-[#5E6386] mb-1">Semester {g.semester}</div>
                <div className="text-2xl font-display font-bold text-[#6CE5D8]">{g.gpa.toFixed(2)}</div>
                <div className="text-xs text-[#A7ACC8] mt-1">{g.credits} credits</div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
