import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, messagesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { CreateConversationBody, GetConversationParams, DeleteConversationParams } from "@workspace/api-zod";
import { getOrCreateProfile } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const conversations = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.userId, profile.id))
    .orderBy(desc(conversationsTable.updatedAt));
  res.json(conversations.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  })));
});

router.post("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const body = CreateConversationBody.parse(req.body);
  const [conversation] = await db
    .insert(conversationsTable)
    .values({ userId: profile.id, title: body.title, model: body.model })
    .returning();
  res.status(201).json({
    ...conversation,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  });
});

router.get("/:id", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = GetConversationParams.parse({ id: Number(req.params.id) });
  const [conversation] = await db
    .select()
    .from(conversationsTable)
    .where(and(eq(conversationsTable.id, id), eq(conversationsTable.userId, profile.id)));
  if (!conversation) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.json({
    ...conversation,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  });
});

router.delete("/:id", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = DeleteConversationParams.parse({ id: Number(req.params.id) });
  await db.delete(conversationsTable).where(and(eq(conversationsTable.id, id), eq(conversationsTable.userId, profile.id)));
  res.status(204).send();
});

export default router;
