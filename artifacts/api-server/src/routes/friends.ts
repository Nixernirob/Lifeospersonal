import { Router } from "express";
import { db } from "@workspace/db";
import { friendsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

router.get("/friends", async (req, res) => {
  try {
    const results = await db.select().from(friendsTable).orderBy(asc(friendsTable.name));
    res.json(results);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/friends", async (req, res) => {
  try {
    const { name, department, birthday, firstMet, notes, photoUrl } = req.body;
    const [friend] = await db.insert(friendsTable).values({ name, department, birthday, firstMet, notes, photoUrl }).returning();
    res.status(201).json(friend);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/friends/:id", async (req, res) => {
  try {
    const { name, department, birthday, firstMet, notes, photoUrl } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (department !== undefined) updates.department = department;
    if (birthday !== undefined) updates.birthday = birthday;
    if (firstMet !== undefined) updates.firstMet = firstMet;
    if (notes !== undefined) updates.notes = notes;
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;
    const [friend] = await db.update(friendsTable).set(updates).where(eq(friendsTable.id, Number(req.params.id))).returning();
    if (!friend) return res.status(404).json({ error: "Not found" });
    res.json(friend);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/friends/:id", async (req, res) => {
  try {
    await db.delete(friendsTable).where(eq(friendsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
