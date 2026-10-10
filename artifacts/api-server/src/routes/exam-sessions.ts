import { Router } from "express";
import { db } from "@workspace/db";
import { examSessionsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { getOrCreateProfile } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const sessions = await db.select().from(examSessionsTable)
    .where(eq(examSessionsTable.userId, profile.id))
    .orderBy(desc(examSessionsTable.completedAt));
  res.json(sessions.map(s => ({
    ...s,
    completedAt: s.completedAt.toISOString(),
  })));
});

export default router;
