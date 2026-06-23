import { Router } from "express";
import { db } from "@workspace/db";
import { subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/subjects", async (req, res) => {
  try {
    const results = await db.select().from(subjectsTable);
    const { semester } = req.query;
    let filtered = results;
    if (semester) filtered = filtered.filter(s => s.semester === Number(semester));
    res.json(filtered);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/subjects", async (req, res) => {
  try {
    const { name, code, semester, credits, gradePoint, grade } = req.body;
    const [subject] = await db.insert(subjectsTable).values({ name, code, semester, credits, gradePoint, grade }).returning();
    res.status(201).json(subject);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/subjects/:id", async (req, res) => {
  try {
    const { name, code, semester, credits, gradePoint, grade } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (code !== undefined) updates.code = code;
    if (semester !== undefined) updates.semester = semester;
    if (credits !== undefined) updates.credits = credits;
    if (gradePoint !== undefined) updates.gradePoint = gradePoint;
    if (grade !== undefined) updates.grade = grade;
    const [subject] = await db.update(subjectsTable).set(updates).where(eq(subjectsTable.id, Number(req.params.id))).returning();
    if (!subject) return res.status(404).json({ error: "Not found" });
    res.json(subject);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/subjects/:id", async (req, res) => {
  try {
    await db.delete(subjectsTable).where(eq(subjectsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
