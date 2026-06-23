import { Router } from "express";
import { db } from "@workspace/db";
import { memoriesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/memories", async (req, res) => {
  try {
    const results = await db.select().from(memoriesTable).orderBy(desc(memoriesTable.date));
    const { semester, tag, year, search } = req.query;
    let filtered = results;
    if (semester) filtered = filtered.filter(m => m.semester === Number(semester));
    if (year) {
      filtered = filtered.filter(m => {
        const y = Number(year);
        if (y === 1) return m.semester !== null && m.semester >= 1 && m.semester <= 2;
        if (y === 2) return m.semester !== null && m.semester >= 3 && m.semester <= 4;
        if (y === 3) return m.semester !== null && m.semester >= 5 && m.semester <= 6;
        if (y === 4) return m.semester !== null && m.semester >= 7 && m.semester <= 8;
        return true;
      });
    }
    if (tag) filtered = filtered.filter(m => (m.tags as string[]).includes(String(tag)));
    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(s) ||
        (m.description?.toLowerCase().includes(s) ?? false)
      );
    }
    res.json(filtered.map(m => ({ ...m, tags: m.tags ?? [], images: m.images ?? [] })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/memories/on-this-day", async (req, res) => {
  try {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const currentYear = today.getFullYear();
    const results = await db.select().from(memoriesTable).orderBy(desc(memoriesTable.date));
    const onThisDay = results.filter(m => {
      if (!m.date) return false;
      const parts = m.date.split("-");
      if (parts.length < 3) return false;
      const mYear = Number(parts[0]);
      const mMonth = parts[1];
      const mDay = parts[2];
      return mMonth === month && mDay === day && mYear < currentYear;
    });
    res.json(onThisDay.map(m => ({ ...m, tags: m.tags ?? [], images: m.images ?? [] })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/memories/recent", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 3;
    const results = await db.select().from(memoriesTable).orderBy(desc(memoriesTable.createdAt)).limit(limit);
    res.json(results.map(m => ({ ...m, tags: m.tags ?? [], images: m.images ?? [] })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/memories", async (req, res) => {
  try {
    const { title, description, date, location, semester, tags, imageUrl, images } = req.body;
    const [memory] = await db.insert(memoriesTable).values({
      title, description, date, location, semester,
      tags: tags ?? [],
      images: images ?? [],
      imageUrl,
    }).returning();
    res.status(201).json({ ...memory, tags: memory.tags ?? [], images: memory.images ?? [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/memories/:id", async (req, res) => {
  try {
    const [memory] = await db.select().from(memoriesTable).where(eq(memoriesTable.id, Number(req.params.id)));
    if (!memory) return res.status(404).json({ error: "Not found" });
    res.json({ ...memory, tags: memory.tags ?? [], images: memory.images ?? [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/memories/:id", async (req, res) => {
  try {
    const { title, description, date, location, semester, tags, imageUrl, images } = req.body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
    if (location !== undefined) updates.location = location;
    if (semester !== undefined) updates.semester = semester;
    if (tags !== undefined) updates.tags = tags;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (images !== undefined) updates.images = images;
    const [memory] = await db.update(memoriesTable).set(updates).where(eq(memoriesTable.id, Number(req.params.id))).returning();
    if (!memory) return res.status(404).json({ error: "Not found" });
    res.json({ ...memory, tags: memory.tags ?? [], images: memory.images ?? [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/memories/:id", async (req, res) => {
  try {
    await db.delete(memoriesTable).where(eq(memoriesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
