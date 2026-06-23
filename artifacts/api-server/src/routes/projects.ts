import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/projects", async (req, res) => {
  try {
    const results = await db.select().from(projectsTable).orderBy(desc(projectsTable.createdAt));
    res.json(results.map(p => ({ ...p, tags: p.tags ?? [] })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const { title, description, githubUrl, liveUrl, tags, semester, status, imageUrl } = req.body;
    const [project] = await db.insert(projectsTable).values({
      title, description, githubUrl, liveUrl, tags: tags ?? [], semester, status, imageUrl,
    }).returning();
    res.status(201).json({ ...project, tags: project.tags ?? [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/projects/:id", async (req, res) => {
  try {
    const { title, description, githubUrl, liveUrl, tags, semester, status, imageUrl } = req.body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (githubUrl !== undefined) updates.githubUrl = githubUrl;
    if (liveUrl !== undefined) updates.liveUrl = liveUrl;
    if (tags !== undefined) updates.tags = tags;
    if (semester !== undefined) updates.semester = semester;
    if (status !== undefined) updates.status = status;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    const [project] = await db.update(projectsTable).set(updates).where(eq(projectsTable.id, Number(req.params.id))).returning();
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json({ ...project, tags: project.tags ?? [] });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    await db.delete(projectsTable).where(eq(projectsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
