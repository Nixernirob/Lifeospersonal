import { Router } from "express";
import { db } from "@workspace/db";
import { examsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/exams", async (req, res) => {
  try {
    const results = await db.select().from(examsTable).orderBy(asc(examsTable.examDate));
    const { semester } = req.query;
    let filtered = results;
    if (semester) filtered = filtered.filter(e => e.semester === Number(semester));
    res.json(filtered);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/exams", async (req, res) => {
  try {
    const { title, subjectId, examDate, category, semester, grade, gradePoint } = req.body;
    const [exam] = await db.insert(examsTable).values({
      title, subjectId, examDate, category: category ?? "midterm", semester, grade, gradePoint,
    }).returning();
    res.status(201).json(exam);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/exams/:id", async (req, res) => {
  try {
    const { title, subjectId, examDate, category, semester, grade, gradePoint } = req.body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (subjectId !== undefined) updates.subjectId = subjectId;
    if (examDate !== undefined) updates.examDate = examDate;
    if (category !== undefined) updates.category = category;
    if (semester !== undefined) updates.semester = semester;
    if (grade !== undefined) updates.grade = grade;
    if (gradePoint !== undefined) updates.gradePoint = gradePoint;
    const [exam] = await db.update(examsTable).set(updates).where(eq(examsTable.id, Number(req.params.id))).returning();
    if (!exam) return res.status(404).json({ error: "Not found" });
    res.json(exam);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/exams/:id", async (req, res) => {
  try {
    await db.delete(examsTable).where(eq(examsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
