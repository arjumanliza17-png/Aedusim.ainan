import { Router } from "express";
import { db } from "@workspace/db";
import { challengesTable, challengeCompletionsTable, profileTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { AttemptChallengeParams, AttemptChallengeBody } from "@workspace/api-zod";
import { getOrCreateProfile } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const challenges = await db.select().from(challengesTable);
  const completions = await db.select({ challengeId: challengeCompletionsTable.challengeId })
    .from(challengeCompletionsTable)
    .where(eq(challengeCompletionsTable.userId, profile.id));
  const completedIds = new Set(completions.map((row) => row.challengeId));
  res.json(challenges.map(c => ({
    id: c.id,
    title: c.title,
    description: c.description,
    subject: c.subject,
    difficulty: c.difficulty,
    xpReward: c.xpReward,
    avatar: c.avatar,
    question: c.question,
    options: c.options,
    completed: completedIds.has(c.id),
  })));
});

router.post("/:id/attempt", async (req, res) => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { id } = AttemptChallengeParams.parse({ id: Number(req.params.id) });
  const body = AttemptChallengeBody.parse(req.body);

  const [challenge] = await db
    .select()
    .from(challengesTable)
    .where(eq(challengesTable.id, id));

  if (!challenge) {
    res.status(404).json({ error: "Challenge not found" });
    return;
  }

  const correct = body.answer.toLowerCase().trim() === challenge.correctAnswer.toLowerCase().trim();
  const xpEarned = correct ? challenge.xpReward : 0;

  if (correct) {
    const [completion] = await db.insert(challengeCompletionsTable)
      .values({ userId: profile.id, challengeId: id })
      .onConflictDoNothing()
      .returning();
    if (completion) {
    await db.update(profileTable).set({
      xp: profile.xp + xpEarned,
      completedChallenges: profile.completedChallenges + 1,
      level: Math.floor((profile.xp + xpEarned) / 200) + 1,
    }).where(eq(profileTable.id, profile.id));
    } else {
      return res.json({
        correct: true,
        xpEarned: 0,
        explanation: `You already mastered ${challenge.title}. Try another challenge to keep building your skills.`,
        correctAnswer: challenge.correctAnswer,
      });
    }
  }

  const explanations: Record<string, string> = {
    "A": "Option A is correct. Great job understanding this fundamental concept!",
    "B": "Option B is the right answer. This demonstrates your knowledge of the subject.",
    "C": "Option C is correct. Excellent understanding of this principle!",
    "D": "Option D is the right choice. Well reasoned!",
  };

  res.json({
    correct,
    xpEarned,
    explanation: correct
      ? `Excellent! ${challenge.title} mastered. ${explanations[challenge.correctAnswer] || "Keep up the great work!"}`
      : `Not quite. The correct answer is "${challenge.correctAnswer}". ${challenge.description} Study this concept and try again!`,
    correctAnswer: challenge.correctAnswer,
  });
});

export default router;
