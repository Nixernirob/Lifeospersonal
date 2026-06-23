import { Router } from "express";
import { db } from "@workspace/db";
import { journalEntriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/journal", async (req, res) => {
  try {
    const results = await db.select().from(journalEntriesTable).orderBy(desc(journalEntriesTable.date));
    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/journal/today", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const [entry] = await db.select().from(journalEntriesTable).where(eq(journalEntriesTable.date, today));
    if (!entry) return res.status(404).json({ error: "No entry today" });
    res.json(entry);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/journal", async (req, res) => {
  try {
    const { date, mood, bestMoment, learned, watched, randomThought } = req.body;
    const entryDate = date || new Date().toISOString().split("T")[0];
    // Upsert — if entry for today already exists, update it
    const [existing] = await db.select().from(journalEntriesTable).where(eq(journalEntriesTable.date, entryDate));
    if (existing) {
      const updates: Record<string, unknown> = {};
      if (mood !== undefined) updates.mood = mood;
      if (bestMoment !== undefined) updates.bestMoment = bestMoment;
      if (learned !== undefined) updates.learned = learned;
      if (watched !== undefined) updates.watched = watched;
      if (randomThought !== undefined) updates.randomThought = randomThought;
      const [updated] = await db.update(journalEntriesTable).set(updates).where(eq(journalEntriesTable.id, existing.id)).returning();
      return res.status(201).json(updated);
    }
    const [entry] = await db.insert(journalEntriesTable).values({
      date: entryDate, mood, bestMoment, learned, watched, randomThought,
    }).returning();
    res.status(201).json(entry);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/journal/:id", async (req, res) => {
  try {
    const { mood, bestMoment, learned, watched, randomThought } = req.body;
    const updates: Record<string, unknown> = {};
    if (mood !== undefined) updates.mood = mood;
    if (bestMoment !== undefined) updates.bestMoment = bestMoment;
    if (learned !== undefined) updates.learned = learned;
    if (watched !== undefined) updates.watched = watched;
    if (randomThought !== undefined) updates.randomThought = randomThought;
    const [entry] = await db.update(journalEntriesTable).set(updates).where(eq(journalEntriesTable.id, Number(req.params.id))).returning();
    if (!entry) return res.status(404).json({ error: "Not found" });
    res.json(entry);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
