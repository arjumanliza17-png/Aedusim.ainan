import { Router } from "express";
import { db, couponCodesTable, profileTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getOrCreateProfile } from "../middleware/auth";

const router = Router();

// POST /api/coupons/validate — check a code without applying it
router.post("/validate", async (req, res): Promise<void> => {
  const { code } = req.body ?? {};
  if (!code) { res.status(400).json({ error: "code required" }); return; }

  const [coupon] = await db
    .select()
    .from(couponCodesTable)
    .where(eq(couponCodesTable.code, code.trim().toUpperCase()))
    .limit(1);

  if (!coupon) { res.status(404).json({ error: "Invalid coupon code" }); return; }
  if (!coupon.active) { res.status(400).json({ error: "This coupon is no longer active" }); return; }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    res.status(400).json({ error: "This coupon has expired" }); return;
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    res.status(400).json({ error: "This coupon has reached its usage limit" }); return;
  }

  res.json({
    valid: true,
    code: coupon.code,
    description: coupon.description,
    discount: coupon.discount,
    type: coupon.type,        // "percentage" | "flat"
    plan: coupon.plan,        // "pro" | "elite" | "free"
    isFree: coupon.type === "percentage" && coupon.discount >= 100,
  });
});

// POST /api/coupons/redeem — apply a 100%-off coupon and upgrade the plan immediately
router.post("/redeem", async (req, res): Promise<void> => {
  const profile = await getOrCreateProfile(req, res);
  if (!profile) return;
  const { code } = req.body ?? {};
  if (!code) { res.status(400).json({ error: "code required" }); return; }

  const [coupon] = await db
    .select()
    .from(couponCodesTable)
    .where(eq(couponCodesTable.code, code.trim().toUpperCase()))
    .limit(1);

  if (!coupon) { res.status(404).json({ error: "Invalid coupon code" }); return; }
  if (!coupon.active) { res.status(400).json({ error: "This coupon is no longer active" }); return; }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    res.status(400).json({ error: "This coupon has expired" }); return;
  }
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    res.status(400).json({ error: "This coupon has reached its usage limit" }); return;
  }
  if (!(coupon.type === "percentage" && coupon.discount >= 100)) {
    res.status(400).json({ error: "This coupon provides a discount — apply it during payment, not as a free upgrade" }); return;
  }

  // Upgrade plan
  await db.update(profileTable).set({ plan: coupon.plan }).where(eq(profileTable.id, profile.id));

  // Increment used count
  await db
    .update(couponCodesTable)
    .set({ usedCount: coupon.usedCount + 1 })
    .where(eq(couponCodesTable.id, coupon.id));

  res.json({
    success: true,
    plan: coupon.plan,
    message: `🎉 Coupon applied! Your plan has been upgraded to ${coupon.plan.charAt(0).toUpperCase() + coupon.plan.slice(1)}.`,
  });
});

export default router;
