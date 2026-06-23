import { Router } from "express";
import { db } from "@workspace/db";
import { bucketListTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/bucketlist", async (req, res) => {
  try {
    const results = await db.select().from(bucketListTable).orderBy(asc(bucketListTable.createdAt));
    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bucketlist", async (req, res) => {
  try {
    const { text, targetDate } = req.body;
    const [item] = await db.insert(bucketListTable).values({ text, targetDate, checked: false }).returning();
    res.status(201).json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bucketlist/:id", async (req, res) => {
  try {
    const { text, checked, targetDate } = req.body;
    const updates: Record<string, unknown> = {};
    if (text !== undefined) updates.text = text;
    if (checked !== undefined) updates.checked = checked;
    if (targetDate !== undefined) updates.targetDate = targetDate;
    const [item] = await db.update(bucketListTable).set(updates).where(eq(bucketListTable.id, Number(req.params.id))).returning();
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bucketlist/:id", async (req, res) => {
  try {
    await db.delete(bucketListTable).where(eq(bucketListTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
