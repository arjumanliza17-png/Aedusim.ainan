import { Router } from "express";
import { db } from "@workspace/db";
import { profileTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateProfileBody } from "@workspace/api-zod";
import { getOrCreateProfile } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  res.json({
    name: profile.name,
    class: profile.class,
    interests: profile.interests,
    goals: profile.goals,
    plan: profile.plan,
    filesCount: profile.filesCount,
    xp: profile.xp,
    level: profile.level,
    streak: profile.streak,
    totalMessages: profile.totalMessages,
    completedChallenges: profile.completedChallenges,
  });
});

router.patch("/", async (req, res) => {
  const body = UpdateProfileBody.parse(req.body);
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const [updated] = await db
    .update(profileTable)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.class !== undefined && { class: body.class }),
      ...(body.interests !== undefined && { interests: body.interests }),
      ...(body.goals !== undefined && { goals: body.goals }),
    })
    .where(eq(profileTable.id, profile.id))
    .returning();
  res.json({
    name: updated.name,
    class: updated.class,
    interests: updated.interests,
    goals: updated.goals,
    plan: updated.plan,
    filesCount: updated.filesCount,
    xp: updated.xp,
    level: updated.level,
    streak: updated.streak,
    totalMessages: updated.totalMessages,
    completedChallenges: updated.completedChallenges,
  });
});

export default router;
