import { Router } from "express";
import { db } from "@workspace/db";
import { semestersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/semesters", async (req, res) => {
  try {
    const results = await db.select().from(semestersTable).orderBy(asc(semestersTable.id));
    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/semesters", async (req, res) => {
  try {
    const { name, startDate, endDate, status } = req.body;
    const [semester] = await db.insert(semestersTable).values({
      name,
      startDate,
      endDate,
      status: status ?? "UPCOMING",
    }).returning();
    res.status(201).json(semester);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/semesters/:id", async (req, res) => {
  try {
    const { name, startDate, endDate, status } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (startDate !== undefined) updates.startDate = startDate;
    if (endDate !== undefined) updates.endDate = endDate;
    if (status !== undefined) {
      updates.status = status;
      // When setting a semester to CURRENT, mark all others as COMPLETED
      if (status === "CURRENT") {
        await db.update(semestersTable)
          .set({ status: "COMPLETED", updatedAt: new Date() })
          .where(eq(semestersTable.status, "CURRENT"));
      }
    }
    const [semester] = await db.update(semestersTable).set(updates).where(eq(semestersTable.id, Number(req.params.id))).returning();
    if (!semester) return res.status(404).json({ error: "Not found" });
    res.json(semester);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/semesters/:id", async (req, res) => {
  try {
    await db.delete(semestersTable).where(eq(semestersTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
