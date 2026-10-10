import { Router } from "express";
import { db, paymentSubmissionsTable, profileTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { getOrCreateProfile } from "../middleware/auth";

const router = Router();

// Server-side source of truth for plan pricing (BDT). Mirrors the pricing page.
export const PLAN_PRICES: Record<string, number> = { pro: 99, elite: 1100 };

const SubmitPaymentSchema = z.object({
  plan: z.enum(["pro", "elite"]),
  amount: z.number().int().positive(),
  transactionId: z.string().trim().min(6).max(64),
  senderNumber: z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid 11-digit Bangladeshi mobile number"),
  reference: z.string().trim().max(120).optional(),
});

// Naive per-process rate limit: max 3 submissions / user / 10 minutes.
const submitRate = new Map<number, number[]>();
function rateLimited(userId: number): boolean {
  const now = Date.now();
  const windowStart = now - 10 * 60 * 1000;
  const hits = (submitRate.get(userId) ?? []).filter((t) => t > windowStart);
  if (hits.length >= 3) return true;
  hits.push(now);
  submitRate.set(userId, hits);
  return false;
}

// ─── GET /api/payments/config — public-ish payment instructions ──────────────
router.get("/config", (_req, res) => {
  res.json({
    method: "nagad",
    nagadNumber: process.env.NAGAD_NUMBER || "01883248219",
    plans: Object.entries(PLAN_PRICES).map(([key, price]) => ({ key, priceBdt: price })),
    note: "Send money via Nagad to the number above, then submit your transaction ID for verification. Your plan activates only after admin approval.",
  });
});

// ─── POST /api/payments/submit — learner submits a manual Nagad payment ──────
router.post("/submit", async (req, res): Promise<void> => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;

  if (rateLimited(profile.id)) {
    res.status(429).json({ error: "Too many payment submissions. Please try again later." });
    return;
  }

  const parsed = SubmitPaymentSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid payment details" });
    return;
  }
  const { plan, amount, transactionId, senderNumber, reference } = parsed.data;

  // Enforce the exact server-side price — never trust the client's amount.
  if (amount !== PLAN_PRICES[plan]) {
    res.status(400).json({ error: `Amount must be exactly ${PLAN_PRICES[plan]} BDT for the ${plan} plan.` });
    return;
  }

  // Don't allow re-submission while a pending review already exists for this plan.
  const [pending] = await db
    .select({ id: paymentSubmissionsTable.id })
    .from(paymentSubmissionsTable)
    .where(and(
      eq(paymentSubmissionsTable.userId, profile.id),
      eq(paymentSubmissionsTable.plan, plan),
      eq(paymentSubmissionsTable.status, "pending"),
    ))
    .limit(1);
  if (pending) {
    res.status(409).json({ error: "You already have a pending submission for this plan. Please wait for verification.", code: "PAYMENT_PENDING" });
    return;
  }

  try {
    const [submission] = await db
      .insert(paymentSubmissionsTable)
      .values({
        userId: profile.id,
        plan,
        amount,
        transactionId,
        senderNumber,
        reference: reference ?? "",
        status: "pending",
      })
      .returning();
    res.status(201).json({
      id: submission.id,
      status: submission.status,
      message: "Payment submitted. Our team will verify the transaction and activate your plan (usually within 24 hours).",
    });
  } catch (e: unknown) {
    // Unique violation on transactionId → duplicate/fraudulent TrxID reuse.
    const code = (e as { code?: string }).code;
    if (code === "23505") {
      res.status(409).json({ error: "This transaction ID has already been used. Double-check the TrxID from your Nagad receipt.", code: "DUPLICATE_TRX" });
      return;
    }
    throw e;
  }
});

// ─── GET /api/payments/mine — learner sees own submissions & statuses ─────────
router.get("/mine", async (req, res): Promise<void> => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const rows = await db
    .select({
      id: paymentSubmissionsTable.id,
      plan: paymentSubmissionsTable.plan,
      amount: paymentSubmissionsTable.amount,
      status: paymentSubmissionsTable.status,
      createdAt: paymentSubmissionsTable.createdAt,
      reviewedAt: paymentSubmissionsTable.reviewedAt,
      adminNote: paymentSubmissionsTable.adminNote,
    })
    .from(paymentSubmissionsTable)
    .where(eq(paymentSubmissionsTable.userId, profile.id))
    .orderBy(desc(paymentSubmissionsTable.createdAt));
  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), reviewedAt: r.reviewedAt?.toISOString() ?? null })));
});

export default router;
