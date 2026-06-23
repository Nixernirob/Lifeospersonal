import { Router } from "express";
import { db } from "@workspace/db";
import { achievementsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/achievements", async (req, res) => {
  try {
    const results = await db.select().from(achievementsTable).orderBy(desc(achievementsTable.date));
    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/achievements", async (req, res) => {
  try {
    const { title, description, date, icon, category } = req.body;
    const [achievement] = await db.insert(achievementsTable).values({ title, description, date, icon, category }).returning();
    res.status(201).json(achievement);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/achievements/:id", async (req, res) => {
  try {
    const { title, description, date, icon, category } = req.body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
    if (icon !== undefined) updates.icon = icon;
    if (category !== undefined) updates.category = category;
    const [achievement] = await db.update(achievementsTable).set(updates).where(eq(achievementsTable.id, Number(req.params.id))).returning();
    if (!achievement) return res.status(404).json({ error: "Not found" });
    res.json(achievement);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/achievements/:id", async (req, res) => {
  try {
    await db.delete(achievementsTable).where(eq(achievementsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
