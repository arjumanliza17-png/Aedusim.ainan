import { getAuth } from "@clerk/express";
import { db, profileTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export type LearnerRequest = {
  userId?: string;
  profile?: typeof profileTable.$inferSelect;
};

export function getClerkUserId(req: LearnerRequest): string | null {
  if (!process.env.CLERK_SECRET_KEY) return null;
  try {
    return getAuth(req as never).userId ?? null;
  } catch {
    return null;
  }
}

export function requireLearnerAuth(req: LearnerRequest, res: any, next: any): void {
  if (!process.env.CLERK_SECRET_KEY) {
    res.status(503).json({ error: "Learner authentication is not configured yet." });
    return;
  }
  const userId = getClerkUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }
  req.userId = userId;
  next();
}

export async function getOrCreateProfile(
  req: LearnerRequest,
  res?: any,
): Promise<typeof profileTable.$inferSelect | null> {
  const userId = req.userId ?? getClerkUserId(req);
  if (!userId) {
    if (res) res.status(401).json({ error: "Sign in required." });
    return null;
  }

  const existing = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.clerkUserId, userId))
    .limit(1);
  if (existing[0]) {
    req.profile = existing[0];
    return existing[0];
  }

  const [created] = await db
    .insert(profileTable)
    .values({
      clerkUserId: userId,
      name: "Learner",
      class: "Grade 10",
      interests: ["Physics", "Mathematics"],
      goals: "Master advanced physics and mathematics",
      plan: "free",
      badges: ["First Steps"],
    })
    .returning();
  req.profile = created;
  return created;
}

export const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, elite: 2 };

export function hasPlan(profile: typeof profileTable.$inferSelect, required: "free" | "pro" | "elite"): boolean {
  return (PLAN_RANK[profile.plan] ?? 0) >= PLAN_RANK[required];
}

export function rejectPlan(res: any, required: "pro" | "elite"): void {
  res.status(403).json({
    error: `${required[0].toUpperCase() + required.slice(1)} plan required.`,
    code: "PLAN_REQUIRED",
    requiredPlan: required,
  });
}