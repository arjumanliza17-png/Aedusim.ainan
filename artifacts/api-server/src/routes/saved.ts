import { Router } from "express";
import { db } from "@workspace/db";
import { savedTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { SaveItemBody, DeleteSavedParams } from "@workspace/api-zod";
import { getOrCreateProfile } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const items = await db.select().from(savedTable)
    .where(eq(savedTable.userId, profile.id))
    .orderBy(desc(savedTable.createdAt));
  res.json(items.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const body = SaveItemBody.parse(req.body);
  const [item] = await db.insert(savedTable).values({
    userId: profile.id,
    content: body.content,
    source: body.source,
  }).returning();
  res.status(201).json({
    ...item,
    createdAt: item.createdAt.toISOString(),
  });
});

router.delete("/:id", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = DeleteSavedParams.parse({ id: Number(req.params.id) });
  await db.delete(savedTable).where(and(eq(savedTable.id, id), eq(savedTable.userId, profile.id)));
  res.status(204).send();
});

export default router;
