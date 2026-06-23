import { Router } from "express";
import { db } from "@workspace/db";
import {
  memoriesTable, notesTable, projectsTable, achievementsTable,
  friendsTable, journalEntriesTable, assignmentsTable, bucketListTable, subjectsTable
} from "@workspace/db";
import { count, eq, sql } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const [memories] = await db.select({ count: count() }).from(memoriesTable);
    const [notes] = await db.select({ count: count() }).from(notesTable);
    const [projects] = await db.select({ count: count() }).from(projectsTable);
    const [achievements] = await db.select({ count: count() }).from(achievementsTable);
    const [friends] = await db.select({ count: count() }).from(friendsTable);
    const [days] = await db.select({ count: count() }).from(journalEntriesTable);
    const [assignmentsCompleted] = await db.select({ count: count() }).from(assignmentsTable).where(eq(assignmentsTable.status, "completed"));
    const [assignmentsPending] = await db.select({ count: count() }).from(assignmentsTable).where(sql`status != 'completed'`);
    const [bucketTotal] = await db.select({ count: count() }).from(bucketListTable);
    const [bucketCompleted] = await db.select({ count: count() }).from(bucketListTable).where(eq(bucketListTable.checked, true));

    res.json({
      totalMemories: memories.count,
      totalNotes: notes.count,
      totalProjects: projects.count,
      totalAchievements: achievements.count,
      totalFriends: friends.count,
      totalDaysRecorded: days.count,
      assignmentsCompleted: assignmentsCompleted.count,
      assignmentsPending: assignmentsPending.count,
      bucketListTotal: bucketTotal.count,
      bucketListCompleted: bucketCompleted.count,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/gpa", async (req, res) => {
  try {
    const subjects = await db.select().from(subjectsTable);
    // Group by semester, compute GPA and running CGPA
    const semesterMap: Record<number, { totalPoints: number; totalCredits: number }> = {};
    for (const s of subjects) {
      if (s.gradePoint !== null && s.gradePoint !== undefined) {
        if (!semesterMap[s.semester]) semesterMap[s.semester] = { totalPoints: 0, totalCredits: 0 };
        semesterMap[s.semester].totalPoints += (s.gradePoint ?? 0) * s.credits;
        semesterMap[s.semester].totalCredits += s.credits;
      }
    }
    const semesters = Object.keys(semesterMap).map(Number).sort((a, b) => a - b);
    let runningPoints = 0;
    let runningCredits = 0;
    const result = semesters.map(sem => {
      const { totalPoints, totalCredits } = semesterMap[sem];
      const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
      runningPoints += totalPoints;
      runningCredits += totalCredits;
      const cgpa = runningCredits > 0 ? runningPoints / runningCredits : 0;
      return { semester: sem, gpa: Math.round(gpa * 100) / 100, cgpa: Math.round(cgpa * 100) / 100, credits: totalCredits };
    });
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
