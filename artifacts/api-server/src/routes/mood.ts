import { Router } from "express";
import { db } from "@workspace/db";
import { moodLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/mood", async (req, res) => {
  try {
    const results = await db.select().from(moodLogsTable).orderBy(desc(moodLogsTable.date));
    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/mood", async (req, res) => {
  try {
    const { mood, date } = req.body;
    const logDate = date || new Date().toISOString().split("T")[0];
    const [existing] = await db.select().from(moodLogsTable).where(eq(moodLogsTable.date, logDate));
    if (existing) {
      const [updated] = await db.update(moodLogsTable).set({ mood }).where(eq(moodLogsTable.id, existing.id)).returning();
      return res.json(updated);
    }
    const [log] = await db.insert(moodLogsTable).values({ date: logDate, mood }).returning();
    res.json(log);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
