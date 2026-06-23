import { Router } from "express";
import { db } from "@workspace/db";
import { notesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/notes", async (req, res) => {
  try {
    const results = await db.select().from(notesTable).orderBy(desc(notesTable.createdAt));
    const { group, tag, search } = req.query;
    let filtered = results;
    if (group) filtered = filtered.filter(n => n.group === String(group));
    if (tag) filtered = filtered.filter(n => (n.tags as string[]).includes(String(tag)));
    if (search) {
      const s = String(search).toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(s) ||
        (n.description?.toLowerCase().includes(s) ?? false) ||
        n.group.toLowerCase().includes(s)
      );
    }
    res.json(filtered.map(n => ({ ...n, tags: n.tags ?? [] })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notes/recent", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 3;
    const results = await db.select().from(notesTable).orderBy(desc(notesTable.createdAt)).limit(limit);
    res.json(results.map(n => ({ ...n, tags: n.tags ?? [] })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/notes", async (req, res) => {
  try {
    const { title, description, url, group, tags } = req.body;
    const [note] = await db.insert(notesTable).values({
      title, description, url, group, tags: tags ?? [],
    }).returning();
    res.status(201).json({ ...note, tags: note.tags ?? [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notes/:id", async (req, res) => {
  try {
    const [note] = await db.select().from(notesTable).where(eq(notesTable.id, Number(req.params.id)));
    if (!note) return res.status(404).json({ error: "Not found" });
    res.json({ ...note, tags: note.tags ?? [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notes/:id", async (req, res) => {
  try {
    const { title, description, url, group, tags } = req.body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (url !== undefined) updates.url = url;
    if (group !== undefined) updates.group = group;
    if (tags !== undefined) updates.tags = tags;
    const [note] = await db.update(notesTable).set(updates).where(eq(notesTable.id, Number(req.params.id))).returning();
    if (!note) return res.status(404).json({ error: "Not found" });
    res.json({ ...note, tags: note.tags ?? [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/notes/:id", async (req, res) => {
  try {
    await db.delete(notesTable).where(eq(notesTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
