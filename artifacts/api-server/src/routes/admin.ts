import { Router } from "express";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { eq, count, desc, sql, and, gte, asc } from "drizzle-orm";
import {
  db,
  adminUsersTable,
  couponCodesTable,
  profileTable,
  conversationsTable,
  messagesTable,
  examSessionsTable,
  challengesTable,
  systemSettingsTable,
  announcementsTable,
  paymentSubmissionsTable,
  adminAuditLogTable,
} from "@workspace/db";

const router = Router();

// ─── Auth helpers ─────────────────────────────────────────────────────────────

if (!process.env.SESSION_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production.");
  }
  console.warn("[admin] SESSION_SECRET not set — using an insecure dev fallback.");
}
const SECRET = process.env.SESSION_SECRET || "aedusim-admin-dev-secret";
const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

// scrypt with per-password random salt (format: scrypt$salt$hash).
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("scrypt$")) {
    const [, salt, hash] = stored.split("$");
    const candidate = scryptSync(password, salt, 64).toString("hex");
    try {
      return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
    } catch {
      return false;
    }
  }
  // Legacy sha256(salted) hashes are accepted once and transparently upgraded.
  const legacy = createHash("sha256").update(SECRET + password).digest("hex");
  return legacy === stored;
}

function createToken(userId: number, role: string): string {
  const payload = JSON.stringify({ userId, role, exp: Date.now() + TOKEN_TTL });
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(encoded).digest("hex");
  return `${encoded}.${sig}`;
}

function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const encoded = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = createHmac("sha256", SECRET).update(encoded).digest("hex");
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

function adminAuth(req: any, res: any, next: any) {
  const auth = req.headers["authorization"] ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (payload.role !== "owner" && payload.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  req.adminUser = payload;
  next();
}

async function logAdminAction(req: any, action: string, target: string, meta: Record<string, unknown> = {}): Promise<void> {
  try {
    await db.insert(adminAuditLogTable).values({
      adminId: req.adminUser?.userId ?? null,
      adminUsername: String(req.adminUser?.username ?? ""),
      action,
      target,
      meta,
    });
  } catch {
    /* audit logging is best-effort */
  }
}

router.get("/audit-log", adminAuth, async (req: any, res): Promise<void> => {
  if (req.adminUser.role !== "owner") { res.status(403).json({ error: "Owner only" }); return; }
  const rows = await db.select().from(adminAuditLogTable).orderBy(desc(adminAuditLogTable.createdAt)).limit(200);
  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

// ─── Nagad payment verification (admin) ──────────────────────────────────────

router.get("/payments", adminAuth, async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: paymentSubmissionsTable.id,
      userId: paymentSubmissionsTable.userId,
      plan: paymentSubmissionsTable.plan,
      amount: paymentSubmissionsTable.amount,
      transactionId: paymentSubmissionsTable.transactionId,
      senderNumber: paymentSubmissionsTable.senderNumber,
      reference: paymentSubmissionsTable.reference,
      status: paymentSubmissionsTable.status,
      adminNote: paymentSubmissionsTable.adminNote,
      createdAt: paymentSubmissionsTable.createdAt,
      reviewedAt: paymentSubmissionsTable.reviewedAt,
      userName: profileTable.name,
      userEmail: profileTable.email,
      userPlan: profileTable.plan,
    })
    .from(paymentSubmissionsTable)
    .innerJoin(profileTable, eq(profileTable.id, paymentSubmissionsTable.userId))
    .orderBy(desc(paymentSubmissionsTable.createdAt));
  res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), reviewedAt: r.reviewedAt?.toISOString() ?? null })));
});

router.post("/payments/:id/review", adminAuth, async (req: any, res): Promise<void> => {
  const id = Number(req.params.id);
  const { decision, note } = req.body ?? {};
  if (decision !== "approve" && decision !== "reject") {
    res.status(400).json({ error: "decision must be 'approve' or 'reject'" });
    return;
  }
  const [submission] = await db.select().from(paymentSubmissionsTable).where(eq(paymentSubmissionsTable.id, id));
  if (!submission) { res.status(404).json({ error: "Submission not found" }); return; }
  if (submission.status !== "pending") {
    // Prevent duplicate approvals / re-rejection of settled payments.
    res.status(409).json({ error: `This submission was already ${submission.status}.` });
    return;
  }

  const [updated] = await db
    .update(paymentSubmissionsTable)
    .set({
      status: decision === "approve" ? "approved" : "rejected",
      adminNote: String(note ?? "").slice(0, 500),
      reviewedByAdminId: req.adminUser.userId,
      reviewedAt: new Date(),
    })
    .where(and(eq(paymentSubmissionsTable.id, id), eq(paymentSubmissionsTable.status, "pending")))
    .returning();
  if (!updated) { res.status(409).json({ error: "This submission was already reviewed." }); return; }

  if (decision === "approve") {
    // Server-side activation only — atomic conditional update prevents double-apply races.
    await db
      .update(profileTable)
      .set({ plan: submission.plan })
      .where(and(eq(profileTable.id, submission.userId), sql`${profileTable.plan} <> ${submission.plan}`));
  }

  await logAdminAction(req, `payment_${decision}`, `payment:${id}`, {
    userId: submission.userId, plan: submission.plan, amount: submission.amount, transactionId: submission.transactionId,
  });
  res.json({ id: updated.id, status: updated.status, message: decision === "approve" ? "Payment approved and plan activated." : "Payment rejected." });
});

// ─── Bootstrap (creates first owner — self-disables once an admin exists) ──────

router.post("/setup", async (req, res): Promise<void> => {
  const [{ c }] = await db.select({ count: count() }).from(adminUsersTable);
  if (Number(c) > 0) { res.status(403).json({ error: "Already set up" }); return; }
  const { username, password, role } = req.body ?? {};
  if (!username || !password) { res.status(400).json({ error: "username and password required" }); return; }
  const [admin] = await db.insert(adminUsersTable).values({
    username: String(username),
    passwordHash: hashPassword(String(password)),
    role: role === "owner" ? "owner" : "admin",
  }).returning();
  const token = createToken(admin.id, admin.role);
  res.status(201).json({ token, admin: { id: admin.id, username: admin.username, role: admin.role } });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body ?? {};
  const requestedUsername = String(username ?? "").trim();
  if (!requestedUsername || !password) {
    res.status(400).json({ error: "username and password required" });
    return;
  }
  // The first owner can use the conventional "admin" identifier as well as
  // the account username shown in the user-management table.
  const [admin] = requestedUsername.toLowerCase() === "admin"
    ? await db
        .select()
        .from(adminUsersTable)
        .where(eq(adminUsersTable.role, "owner"))
        .orderBy(asc(adminUsersTable.id))
        .limit(1)
    : await db
        .select()
        .from(adminUsersTable)
        .where(eq(adminUsersTable.username, requestedUsername));
  if (!admin || !verifyPassword(String(password), admin.passwordHash)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  // Transparently upgrade legacy hashes to scrypt on successful login.
  if (!admin.passwordHash.startsWith("scrypt$")) {
    await db
      .update(adminUsersTable)
      .set({ passwordHash: hashPassword(String(password)) })
      .where(eq(adminUsersTable.id, admin.id));
  }
  if (admin.role !== "owner" && admin.role !== "admin") {
    res.status(403).json({ error: "Insufficient role" });
    return;
  }
  await db
    .update(adminUsersTable)
    .set({ lastLoginAt: new Date() })
    .where(eq(adminUsersTable.id, admin.id));
  const token = createToken(admin.id, admin.role);
  res.json({
    token,
    admin: { id: admin.id, username: admin.username, role: admin.role },
  });
});

router.get("/auth/me", adminAuth, async (req: any, res): Promise<void> => {
  const [admin] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, req.adminUser.userId));
  if (!admin) { res.status(404).json({ error: "Admin not found" }); return; }
  res.json({ id: admin.id, username: admin.username, role: admin.role });
});

// ─── Stats ────────────────────────────────────────────────────────────────────

router.get("/stats", adminAuth, async (_req, res): Promise<void> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    [{ totalUsers }],
    [{ totalConversations }],
    [{ totalMessages }],
    [{ totalExamSessions }],
    [{ todayMessages }],
    [{ premiumUsers }],
    [{ newUsersWeek }],
    [{ newUsersMonth }],
    profiles,
    recentSessions,
  ] = await Promise.all([
    db.select({ totalUsers: count() }).from(profileTable),
    db.select({ totalConversations: count() }).from(conversationsTable),
    db.select({ totalMessages: count() }).from(messagesTable),
    db.select({ totalExamSessions: count() }).from(examSessionsTable),
    db.select({ todayMessages: count() }).from(messagesTable)
      .where(sql`${messagesTable.createdAt} >= ${today.toISOString()}`),
    db.select({ premiumUsers: count() }).from(profileTable)
      .where(sql`${profileTable.plan} != 'free'`),
    db.select({ newUsersWeek: count() }).from(profileTable)
      .where(sql`${profileTable.createdAt} >= ${sevenDaysAgo.toISOString()}`),
    db.select({ newUsersMonth: count() }).from(profileTable)
      .where(sql`${profileTable.createdAt} >= ${thirtyDaysAgo.toISOString()}`),
    db.select({ plan: profileTable.plan, xp: profileTable.xp }).from(profileTable),
    db.select().from(examSessionsTable)
      .orderBy(desc(examSessionsTable.completedAt)).limit(5),
  ]);

  const [{ totalChars }] = await db
    .select({ totalChars: sql<number>`coalesce(sum(length(${messagesTable.content})), 0)` })
    .from(messagesTable);
  const estimatedTokens = Math.floor(Number(totalChars) / 4);

  const planRevenue: Record<string, number> = { free: 0, pro: 9.99, elite: 19.99 };
  const monthlyRevenue = profiles.reduce(
    (sum, p) => sum + (planRevenue[p.plan] ?? 0), 0
  );

  const planCounts = profiles.reduce((acc: Record<string, number>, p) => {
    acc[p.plan] = (acc[p.plan] ?? 0) + 1;
    return acc;
  }, {});

  res.json({
    totalUsers: Number(totalUsers),
    premiumUsers: Number(premiumUsers),
    totalConversations: Number(totalConversations),
    totalMessages: Number(totalMessages),
    totalExamSessions: Number(totalExamSessions),
    dailyActiveUsers: Number(todayMessages) > 0 ? Math.max(1, Math.floor(Number(todayMessages) / 5)) : 0,
    estimatedTokens,
    monthlyRevenue: monthlyRevenue.toFixed(2),
    newUsersWeek: Number(newUsersWeek),
    newUsersMonth: Number(newUsersMonth),
    planCounts,
    recentSessions: recentSessions.map((s) => ({
      ...s,
      completedAt: s.completedAt.toISOString(),
    })),
  });
});

// ─── Activity Log ─────────────────────────────────────────────────────────────

router.get("/activity", adminAuth, async (_req, res): Promise<void> => {
  const [recentMessages, recentSessions, recentUsers] = await Promise.all([
    db.select({
      id: messagesTable.id,
      content: messagesTable.content,
      role: messagesTable.role,
      createdAt: messagesTable.createdAt,
    }).from(messagesTable)
      .where(eq(messagesTable.role, "user"))
      .orderBy(desc(messagesTable.createdAt))
      .limit(20),
    db.select().from(examSessionsTable)
      .orderBy(desc(examSessionsTable.completedAt))
      .limit(20),
    db.select({
      id: profileTable.id,
      name: profileTable.name,
      plan: profileTable.plan,
      createdAt: profileTable.createdAt,
    }).from(profileTable)
      .orderBy(desc(profileTable.createdAt))
      .limit(10),
  ]);

  type ActivityEntry = {
    id: string;
    type: "message" | "exam" | "registration";
    description: string;
    meta: string;
    time: string;
  };

  const events: ActivityEntry[] = [
    ...recentMessages.map((m) => ({
      id: `msg-${m.id}`,
      type: "message" as const,
      description: "AI chat message sent",
      meta: m.content.slice(0, 80) + (m.content.length > 80 ? "…" : ""),
      time: m.createdAt.toISOString(),
    })),
    ...recentSessions.map((s) => ({
      id: `exam-${s.id}`,
      type: "exam" as const,
      description: `Exam completed: ${s.examTitle}`,
      meta: `${s.subject} · ${s.percentage}% · Grade ${s.grade}`,
      time: s.completedAt.toISOString(),
    })),
    ...recentUsers.map((u) => ({
      id: `user-${u.id}`,
      type: "registration" as const,
      description: `New user registered: ${u.name}`,
      meta: `Plan: ${u.plan}`,
      time: u.createdAt.toISOString(),
    })),
  ];

  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  res.json(events.slice(0, 50));
});

// ─── Analytics ────────────────────────────────────────────────────────────────

router.get("/analytics/daily", adminAuth, async (_req, res): Promise<void> => {
  // Get daily message counts for the past 14 days
  const days: Array<{ date: string; messages: number; exams: number }> = [];
  for (let i = 13; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [[{ msgs }], [{ exams }]] = await Promise.all([
      db.select({ msgs: count() }).from(messagesTable)
        .where(and(
          sql`${messagesTable.createdAt} >= ${start}`,
          sql`${messagesTable.createdAt} < ${end}`
        )),
      db.select({ exams: count() }).from(examSessionsTable)
        .where(and(
          sql`${examSessionsTable.completedAt} >= ${start}`,
          sql`${examSessionsTable.completedAt} < ${end}`
        )),
    ]);

    days.push({
      date: start.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      messages: Number(msgs),
      exams: Number(exams),
    });
  }
  res.json(days);
});

// ─── System Settings ──────────────────────────────────────────────────────────

router.get("/settings", adminAuth, async (_req, res): Promise<void> => {
  const settings = await db.select().from(systemSettingsTable);
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;
  res.json(map);
});

router.patch("/settings/:key", adminAuth, async (req, res): Promise<void> => {
  const { key } = req.params;
  const { value } = req.body ?? {};
  if (value === undefined) { res.status(400).json({ error: "value required" }); return; }

  const [updated] = await db
    .insert(systemSettingsTable)
    .values({ key, value: String(value), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: systemSettingsTable.key,
      set: { value: String(value), updatedAt: new Date() },
    })
    .returning();
  res.json(updated);
});

// ─── Users ────────────────────────────────────────────────────────────────────

router.get("/users", adminAuth, async (_req, res): Promise<void> => {
  const users = await db.select().from(profileTable).orderBy(desc(profileTable.createdAt));
  res.json(users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })));
});

router.get("/users/:id", adminAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const [user] = await db.select().from(profileTable).where(eq(profileTable.id, id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ ...user, createdAt: user.createdAt.toISOString() });
});

router.patch("/users/:id", adminAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { name, class: cls, plan, banned, email, xp, level, goals, interests } = req.body ?? {};
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (cls !== undefined) updates.class = cls;
  if (plan !== undefined) {
    if (!["free", "pro", "elite"].includes(String(plan))) {
      res.status(400).json({ error: "Plan must be free, pro, or elite." });
      return;
    }
    updates.plan = plan;
  }
  if (banned !== undefined) updates.banned = Boolean(banned);
  if (email !== undefined) updates.email = email;
  if (xp !== undefined) updates.xp = Number(xp);
  if (level !== undefined) updates.level = Number(level);
  if (goals !== undefined) updates.goals = goals;
  if (interests !== undefined) updates.interests = interests;
  const [updated] = await db.update(profileTable).set(updates).where(eq(profileTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  await logAdminAction(req, "user_update", `user:${id}`, updates as Record<string, unknown>);
  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.delete("/users/:id", adminAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(profileTable).where(eq(profileTable.id, id));
  res.status(204).send();
});

// ─── Coupons ──────────────────────────────────────────────────────────────────

router.get("/coupons", adminAuth, async (_req, res): Promise<void> => {
  const coupons = await db.select().from(couponCodesTable).orderBy(desc(couponCodesTable.createdAt));
  res.json(coupons.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    expiresAt: c.expiresAt?.toISOString() ?? null,
  })));
});

router.post("/coupons", adminAuth, async (req, res): Promise<void> => {
  const { code, description, discount, type, plan, maxUses, expiresAt } = req.body ?? {};
  if (!code || !discount) { res.status(400).json({ error: "code and discount required" }); return; }
  await logAdminAction(req, "coupon_create", `coupon:${String(code).toUpperCase().trim()}`, { discount, type, plan });
  const [coupon] = await db.insert(couponCodesTable).values({
    code: String(code).toUpperCase().trim(),
    description: description ?? "",
    discount: Number(discount),
    type: type ?? "percentage",
    plan: plan ?? "pro",
    maxUses: maxUses ? Number(maxUses) : null,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();
  res.status(201).json({
    ...coupon,
    createdAt: coupon.createdAt.toISOString(),
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
  });
});

router.patch("/coupons/:id", adminAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { active, description, maxUses, expiresAt } = req.body ?? {};
  const updates: Record<string, unknown> = {};
  if (active !== undefined) updates.active = Boolean(active);
  if (description !== undefined) updates.description = description;
  if (maxUses !== undefined) updates.maxUses = maxUses ? Number(maxUses) : null;
  if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
  const [updated] = await db.update(couponCodesTable).set(updates).where(eq(couponCodesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Coupon not found" }); return; }
  res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    expiresAt: updated.expiresAt?.toISOString() ?? null,
  });
});

router.delete("/coupons/:id", adminAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(couponCodesTable).where(eq(couponCodesTable.id, id));
  res.status(204).send();
});

// ─── Challenges ───────────────────────────────────────────────────────────────

router.get("/challenges", adminAuth, async (_req, res): Promise<void> => {
  const challenges = await db.select().from(challengesTable).orderBy(desc(challengesTable.id));
  res.json(challenges);
});

router.post("/challenges", adminAuth, async (req, res): Promise<void> => {
  const { title, description, subject, difficulty, xpReward, question, options, correctAnswer, avatar } = req.body ?? {};
  if (!title || !question || !correctAnswer) {
    res.status(400).json({ error: "title, question, and correctAnswer required" });
    return;
  }
  const [ch] = await db.insert(challengesTable).values({
    title: String(title),
    description: description ?? "",
    subject: String(subject ?? "General"),
    difficulty: String(difficulty ?? "medium"),
    xpReward: Number(xpReward ?? 50),
    question: String(question),
    options: Array.isArray(options) ? options : [],
    correctAnswer: String(correctAnswer),
    avatar: String(avatar ?? "falcoa"),
  }).returning();
  res.status(201).json(ch);
});

router.patch("/challenges/:id", adminAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { title, description, subject, difficulty, xpReward, question, options, correctAnswer, completed } = req.body ?? {};
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (subject !== undefined) updates.subject = subject;
  if (difficulty !== undefined) updates.difficulty = difficulty;
  if (xpReward !== undefined) updates.xpReward = Number(xpReward);
  if (question !== undefined) updates.question = question;
  if (options !== undefined) updates.options = options;
  if (correctAnswer !== undefined) updates.correctAnswer = correctAnswer;
  if (completed !== undefined) updates.completed = Boolean(completed);
  const [updated] = await db.update(challengesTable).set(updates).where(eq(challengesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Challenge not found" }); return; }
  res.json(updated);
});

router.delete("/challenges/:id", adminAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(challengesTable).where(eq(challengesTable.id, id));
  res.status(204).send();
});

// ─── Announcements ────────────────────────────────────────────────────────────

router.get("/announcements", adminAuth, async (_req, res): Promise<void> => {
  const items = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
  res.json(items.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })));
});

router.post("/announcements", adminAuth, async (req, res): Promise<void> => {
  const { title, content, type } = req.body ?? {};
  if (!title || !content) { res.status(400).json({ error: "title and content required" }); return; }
  const [ann] = await db.insert(announcementsTable).values({
    title: String(title),
    content: String(content),
    type: String(type ?? "info"),
  }).returning();
  res.status(201).json({ ...ann, createdAt: ann.createdAt.toISOString() });
});

router.patch("/announcements/:id", adminAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { title, content, type, active } = req.body ?? {};
  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (type !== undefined) updates.type = type;
  if (active !== undefined) updates.active = Boolean(active);
  const [updated] = await db.update(announcementsTable).set(updates).where(eq(announcementsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.delete("/announcements/:id", adminAuth, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
  res.status(204).send();
});

// ─── Admin user management (owner only) ──────────────────────────────────────

router.get("/admins", adminAuth, async (req: any, res): Promise<void> => {
  if (req.adminUser.role !== "owner") { res.status(403).json({ error: "Owner only" }); return; }
  const admins = await db.select({
    id: adminUsersTable.id,
    username: adminUsersTable.username,
    role: adminUsersTable.role,
    createdAt: adminUsersTable.createdAt,
    lastLoginAt: adminUsersTable.lastLoginAt,
  }).from(adminUsersTable).orderBy(desc(adminUsersTable.createdAt));
  res.json(admins.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    lastLoginAt: a.lastLoginAt?.toISOString() ?? null,
  })));
});

router.post("/admins", adminAuth, async (req: any, res): Promise<void> => {
  if (req.adminUser.role !== "owner") { res.status(403).json({ error: "Owner only" }); return; }
  const { username, password, role } = req.body ?? {};
  if (!username || !password) { res.status(400).json({ error: "username and password required" }); return; }
  const [admin] = await db.insert(adminUsersTable).values({
    username: String(username),
    passwordHash: hashPassword(String(password)),
    role: role === "owner" ? "owner" : "admin",
  }).returning();
  res.status(201).json({
    id: admin.id,
    username: admin.username,
    role: admin.role,
    createdAt: admin.createdAt.toISOString(),
  });
});

router.patch("/admins/:id/password", adminAuth, async (req: any, res): Promise<void> => {
  if (req.adminUser.role !== "owner") { res.status(403).json({ error: "Owner only" }); return; }
  const id = Number(req.params.id);
  const { password } = req.body ?? {};
  if (!password) { res.status(400).json({ error: "password required" }); return; }
  await db.update(adminUsersTable).set({ passwordHash: hashPassword(String(password)) }).where(eq(adminUsersTable.id, id));
  res.json({ success: true });
});

router.delete("/admins/:id", adminAuth, async (req: any, res): Promise<void> => {
  if (req.adminUser.role !== "owner") { res.status(403).json({ error: "Owner only" }); return; }
  const id = Number(req.params.id);
  if (id === req.adminUser.userId) { res.status(400).json({ error: "Cannot delete yourself" }); return; }
  await db.delete(adminUsersTable).where(eq(adminUsersTable.id, id));
  res.status(204).send();
});

export default router;
