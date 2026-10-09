import { Router } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, topicProgressTable, placementResultsTable, profileTable } from "@workspace/db";
import { getOrCreateProfile, hasPlan, rejectPlan } from "../middleware/auth";

const router = Router();

// ─── GET /api/learning/progress ───────────────────────────────────────────────
// Returns all topic_progress rows for the current user, keyed by topicSlug

router.get("/progress", async (req, res): Promise<void> => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const userId = profile.id;

  const rows = await db
    .select()
    .from(topicProgressTable)
    .where(eq(topicProgressTable.userId, userId));

  // Return as map: topicSlug → progress
  const map: Record<string, unknown> = {};
  for (const row of rows) {
    map[row.topicSlug] = {
      status: row.status,
      mastery: row.mastery,
      quizScore: row.quizScore,
      problemsCorrect: row.problemsCorrect,
      problemsTotal: row.problemsTotal,
      timeSpentSeconds: row.timeSpentSeconds,
      lastSection: row.lastSection,
      bookmarked: row.bookmarked,
      notes: row.notes,
      startedAt: row.startedAt?.toISOString() ?? null,
      completedAt: row.completedAt?.toISOString() ?? null,
      subjectSlug: row.subjectSlug,
      chapterSlug: row.chapterSlug,
    };
  }
  res.json(map);
});

// ─── PATCH /api/learning/progress/:topicSlug ──────────────────────────────────
// Upsert topic progress

router.patch("/progress/:topicSlug", async (req, res): Promise<void> => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const userId = profile.id;

  const { topicSlug } = req.params;
  const {
    subjectSlug, chapterSlug, status, mastery, quizScore,
    problemsCorrect, problemsTotal, timeSpentSeconds, lastSection, bookmarked, notes, xpReward,
  } = req.body ?? {};

  if (!subjectSlug || !chapterSlug) {
    res.status(400).json({ error: "subjectSlug and chapterSlug required" });
    return;
  }
  if (!hasPlan(profile, "pro") && (chapterSlug !== "mechanics" || subjectSlug !== "physics")) {
    rejectPlan(res, "pro");
    return;
  }

  const now = new Date();
  const [previous] = await db
    .select({ status: topicProgressTable.status })
    .from(topicProgressTable)
    .where(and(
      eq(topicProgressTable.userId, userId),
      eq(topicProgressTable.topicSlug, topicSlug),
    ))
    .limit(1);
  const newlyCompleted = status === "completed" && previous?.status !== "completed";
  const updates: Record<string, unknown> = {
    subjectSlug, chapterSlug, updatedAt: now,
  };
  if (status !== undefined) updates.status = status;
  if (mastery !== undefined) updates.mastery = Number(mastery);
  if (quizScore !== undefined) updates.quizScore = Number(quizScore);
  if (problemsCorrect !== undefined) updates.problemsCorrect = Number(problemsCorrect);
  if (problemsTotal !== undefined) updates.problemsTotal = Number(problemsTotal);
  if (timeSpentSeconds !== undefined) updates.timeSpentSeconds = Number(timeSpentSeconds);
  if (lastSection !== undefined) updates.lastSection = lastSection;
  if (bookmarked !== undefined) updates.bookmarked = Boolean(bookmarked);
  if (notes !== undefined) updates.notes = String(notes);
  if (status === "in_progress") updates.startedAt = now;
  if (status === "completed") updates.completedAt = now;

  const [row] = await db
    .insert(topicProgressTable)
    .values({ userId, topicSlug, subjectSlug, chapterSlug, ...updates } as any)
    .onConflictDoUpdate({
      target: [topicProgressTable.userId, topicProgressTable.topicSlug],
      set: updates as any,
    })
    .returning();

  // Award XP only on the transition into completed. Replaying the PATCH for
  // an already completed topic must never create more XP.
  if (newlyCompleted) {
    const reward = Number.isFinite(Number(xpReward))
      ? Math.max(1, Math.min(1000, Math.round(Number(xpReward))))
      : 100;
    await db.execute(sql`
      UPDATE profile SET xp = xp + ${reward}, level = GREATEST(1, (xp + ${reward}) / 500 + 1)
      WHERE id = ${userId}
    `);
  }

  res.json({
    status: row.status,
    mastery: row.mastery,
    quizScore: row.quizScore,
    timeSpentSeconds: row.timeSpentSeconds,
    lastSection: row.lastSection,
    completedAt: row.completedAt?.toISOString() ?? null,
    xpAwarded: newlyCompleted ? (Number.isFinite(Number(xpReward))
      ? Math.max(1, Math.min(1000, Math.round(Number(xpReward))))
      : 100) : 0,
  });
});

// ─── GET /api/learning/placement/:subjectSlug ─────────────────────────────────

router.get("/placement/:subjectSlug", async (req, res): Promise<void> => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const userId = profile.id;

  const [result] = await db
    .select()
    .from(placementResultsTable)
    .where(
      and(
        eq(placementResultsTable.userId, userId),
        eq(placementResultsTable.subjectSlug, req.params.subjectSlug)
      )
    );

  if (!result) { res.status(404).json({ error: "No placement result" }); return; }
  res.json({
    score: result.score,
    total: result.total,
    passed: result.passed,
    recommendedChapterSlug: result.recommendedChapterSlug,
    takenAt: result.takenAt.toISOString(),
  });
});

// ─── POST /api/learning/placement/:subjectSlug ────────────────────────────────

router.post("/placement/:subjectSlug", async (req, res): Promise<void> => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const userId = profile.id;

  const { score, total, passed, recommendedChapterSlug } = req.body ?? {};
  if (score === undefined || total === undefined) {
    res.status(400).json({ error: "score and total required" });
    return;
  }

  const [result] = await db
    .insert(placementResultsTable)
    .values({
      userId,
      subjectSlug: req.params.subjectSlug,
      score: Number(score),
      total: Number(total),
      passed: Boolean(passed),
      recommendedChapterSlug: recommendedChapterSlug ?? null,
    })
    .onConflictDoUpdate({
      target: [placementResultsTable.userId, placementResultsTable.subjectSlug],
      set: {
        score: Number(score),
        total: Number(total),
        passed: Boolean(passed),
        recommendedChapterSlug: recommendedChapterSlug ?? null,
        takenAt: new Date(),
      },
    })
    .returning();

  res.json({
    score: result.score,
    total: result.total,
    passed: result.passed,
    recommendedChapterSlug: result.recommendedChapterSlug,
  });
});

// ─── GET /api/learning/summary ────────────────────────────────────────────────
// Returns aggregate stats for the progress page

router.get("/summary", async (req, res): Promise<void> => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const userId = profile.id;

  const rows = await db
    .select()
    .from(topicProgressTable)
    .where(eq(topicProgressTable.userId, userId));

  const completed = rows.filter((r) => r.status === "completed").length;
  const inProgress = rows.filter((r) => r.status === "in_progress").length;
  const totalTime = rows.reduce((s, r) => s + (r.timeSpentSeconds ?? 0), 0);
  const bookmarked = rows.filter((r) => r.bookmarked).map((r) => r.topicSlug);

  const bySubject: Record<string, { completed: number; total: number }> = {};
  for (const row of rows) {
    if (!bySubject[row.subjectSlug]) bySubject[row.subjectSlug] = { completed: 0, total: 0 };
    bySubject[row.subjectSlug].total++;
    if (row.status === "completed") bySubject[row.subjectSlug].completed++;
  }

  res.json({ completed, inProgress, totalTime, bookmarked, bySubject });
});

export default router;
