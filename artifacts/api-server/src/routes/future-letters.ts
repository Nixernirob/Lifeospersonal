import { Router } from "express";
import { db } from "@workspace/db";
import { futureLettersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/future-letters", async (req, res) => {
  try {
    const results = await db.select().from(futureLettersTable).orderBy(desc(futureLettersTable.createdAt));
    const today = new Date().toISOString().split("T")[0];
    const mapped = results.map(l => ({
      ...l,
      isUnlocked: l.unlockDate <= today,
      content: l.unlockDate <= today ? l.content : null,
    }));
    res.json(mapped);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/future-letters", async (req, res) => {
  try {
    const { title, content, unlockDate } = req.body;
    const [letter] = await db.insert(futureLettersTable).values({ title, content, unlockDate }).returning();
    const today = new Date().toISOString().split("T")[0];
    res.status(201).json({
      ...letter,
      isUnlocked: letter.unlockDate <= today,
      content: letter.unlockDate <= today ? letter.content : null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/future-letters/:id", async (req, res) => {
  try {
    await db.delete(futureLettersTable).where(eq(futureLettersTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
