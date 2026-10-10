import { Router } from "express";
import { db } from "@workspace/db";
import { profileTable, messagesTable, challengesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getOrCreateProfile } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;

  const getRank = (level: number) => {
    if (level >= 20) return "Grand Master";
    if (level >= 15) return "Expert";
    if (level >= 10) return "Advanced";
    if (level >= 5) return "Intermediate";
    return "Beginner";
  };

  res.json({
    xp: profile.xp,
    level: profile.level,
    rank: getRank(profile.level),
    streak: profile.streak,
    totalMessages: profile.totalMessages,
    completedChallenges: profile.completedChallenges,
    badges: profile.badges,
    weeklyXp: [20, 45, 30, 70, 55, 90, profile.xp > 0 ? Math.min(profile.xp, 120) : 60],
  });
});

export default router;
