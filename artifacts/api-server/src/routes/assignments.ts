import { Router } from "express";
import { db } from "@workspace/db";
import { assignmentsTable } from "@workspace/db";
import { eq, desc, asc, and, ne } from "drizzle-orm";

const router = Router();

router.get("/assignments", async (req, res) => {
  try {
    const results = await db.select().from(assignmentsTable).orderBy(asc(assignmentsTable.dueDate));
    const { status, semester } = req.query;
    let filtered = results;
    if (status) filtered = filtered.filter(a => a.status === String(status));
    if (semester) filtered = filtered.filter(a => a.semester === Number(semester));
    res.json(filtered);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/assignments/upcoming", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 3;
    const today = new Date().toISOString().split("T")[0];
    const results = await db.select().from(assignmentsTable)
      .orderBy(asc(assignmentsTable.dueDate));
    const upcoming = results.filter(a => a.status !== "completed" && a.dueDate >= today).slice(0, limit);
    res.json(upcoming);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/assignments", async (req, res) => {
  try {
    const { title, subjectId, dueDate, priority, status, semester } = req.body;
    const [assignment] = await db.insert(assignmentsTable).values({
      title, subjectId, dueDate, priority: priority ?? "medium", status: status ?? "pending", semester,
    }).returning();
    res.status(201).json(assignment);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/assignments/:id", async (req, res) => {
  try {
    const { title, subjectId, dueDate, priority, status, semester } = req.body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (subjectId !== undefined) updates.subjectId = subjectId;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;
    if (semester !== undefined) updates.semester = semester;
    const [assignment] = await db.update(assignmentsTable).set(updates).where(eq(assignmentsTable.id, Number(req.params.id))).returning();
    if (!assignment) return res.status(404).json({ error: "Not found" });
    res.json(assignment);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/assignments/:id", async (req, res) => {
  try {
    await db.delete(assignmentsTable).where(eq(assignmentsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
