import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  json,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversationsTable = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  title: text("title").notNull(),
  model: text("model").notNull().default("falcoa"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversationsTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  model: text("model").notNull().default("falcoa"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Profile ──────────────────────────────────────────────────────────────────

export const profileTable = pgTable("profile", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id"),
  name: text("name").notNull().default("Learner"),
  class: text("class").notNull().default("Grade 10"),
  interests: json("interests").$type<string[]>().notNull().default([]),
  goals: text("goals").notNull().default(""),
  plan: text("plan").notNull().default("free"),
  filesCount: integer("files_count").notNull().default(0),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  totalMessages: integer("total_messages").notNull().default(0),
  completedChallenges: integer("completed_challenges").notNull().default(0),
  badges: json("badges").$type<string[]>().notNull().default(["First Steps"]),
  banned: boolean("banned").notNull().default(false),
  email: text("email").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  clerkUserUnique: uniqueIndex("profile_clerk_user_unique").on(table.clerkUserId),
}));

// ─── Challenges ───────────────────────────────────────────────────────────────

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  subject: text("subject").notNull(),
  difficulty: text("difficulty").notNull(),
  xpReward: integer("xp_reward").notNull().default(50),
  avatar: text("avatar").notNull().default("falcoa"),
  question: text("question").notNull(),
  options: json("options").$type<string[]>().notNull().default([]),
  correctAnswer: text("correct_answer").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const challengeCompletionsTable = pgTable("challenge_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => profileTable.id, { onDelete: "cascade" }).notNull(),
  challengeId: integer("challenge_id").references(() => challengesTable.id, { onDelete: "cascade" }).notNull(),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
}, (table) => ({
  userChallengeUnique: uniqueIndex("challenge_completion_user_unique").on(table.userId, table.challengeId),
}));

// ─── Exams ────────────────────────────────────────────────────────────────────

export const examsTable = pgTable("exams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => profileTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  difficulty: text("difficulty").notNull().default("medium"),
  questions: json("questions").notNull().default([]),
  totalMarks: integer("total_marks").notNull().default(0),
  duration: integer("duration").notNull().default(30),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Exam Sessions ────────────────────────────────────────────────────────────

export const examSessionsTable = pgTable("exam_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => profileTable.id, { onDelete: "cascade" }),
  examId: integer("exam_id").notNull(),
  examTitle: text("exam_title").notNull(),
  subject: text("subject").notNull(),
  score: integer("score").notNull().default(0),
  totalMarks: integer("total_marks").notNull().default(0),
  percentage: integer("percentage").notNull().default(0),
  grade: text("grade").notNull().default("U"),
  timeTaken: integer("time_taken").notNull().default(0),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

// ─── Saved Items ──────────────────────────────────────────────────────────────

export const savedTable = pgTable("saved", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => profileTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  source: text("source").notNull().default("falcoa"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Documents ────────────────────────────────────────────────────────────────

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => profileTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("TXT"),
  subject: text("subject").notNull().default("general"),
  summary: text("summary").notNull().default(""),
  flashcards: json("flashcards").$type<Array<{ question: string; answer: string }>>().notNull().default([]),
  keyPoints: json("key_points").$type<string[]>().notNull().default([]),
  formulas: json("formulas").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Admin Users ──────────────────────────────────────────────────────────────

export const adminUsersTable = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"), // 'owner' | 'admin'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// ─── Learning: Topic Progress ─────────────────────────────────────────────────

export const topicProgressTable = pgTable("topic_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => profileTable.id, { onDelete: "cascade" }),
  subjectSlug: text("subject_slug").notNull(),
  chapterSlug: text("chapter_slug").notNull(),
  topicSlug: text("topic_slug").notNull(),
  status: text("status").notNull().default("not_started"), // not_started | in_progress | completed
  mastery: integer("mastery").notNull().default(0), // 0-100
  quizScore: integer("quiz_score"),
  problemsCorrect: integer("problems_correct").default(0),
  problemsTotal: integer("problems_total").default(0),
  timeSpentSeconds: integer("time_spent_seconds").notNull().default(0),
  lastSection: text("last_section"), // theory | examples | problems
  bookmarked: boolean("bookmarked").notNull().default(false),
  notes: text("notes").default(""),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userTopicUnique: uniqueIndex("topic_progress_user_topic_unique").on(table.userId, table.topicSlug),
}));

// ─── Learning: Placement Test Results ─────────────────────────────────────────

export const placementResultsTable = pgTable("placement_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => profileTable.id, { onDelete: "cascade" }),
  subjectSlug: text("subject_slug").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  passed: boolean("passed").notNull(),
  recommendedChapterSlug: text("recommended_chapter_slug"),
  takenAt: timestamp("taken_at").notNull().defaultNow(),
}, (table) => ({
  userSubjectUnique: uniqueIndex("placement_results_user_subject_unique").on(table.userId, table.subjectSlug),
}));

// ─── System Settings ──────────────────────────────────────────────────────────

export const systemSettingsTable = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Announcements ────────────────────────────────────────────────────────────

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("info"), // info | warning | success | danger
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Payment Submissions (Nagad manual payments) ─────────────────────────────

export const paymentSubmissionsTable = pgTable("payment_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => profileTable.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(),                 // 'pro' | 'elite'
  amount: integer("amount").notNull(),          // BDT, in whole taka
  transactionId: text("transaction_id").notNull(), // Nagad TrxID supplied by payer
  senderNumber: text("sender_number").notNull().default(""),
  reference: text("reference").notNull().default(""),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  adminNote: text("admin_note").notNull().default(""),
  reviewedByAdminId: integer("reviewed_by_admin_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
}, (table) => ({
  // Prevent the same Nagad transaction ID being submitted twice (fraud control).
  trxUnique: uniqueIndex("payment_trx_unique").on(table.transactionId),
}));

// ─── Admin Action Audit Log ──────────────────────────────────────────────────

export const adminAuditLogTable = pgTable("admin_audit_log", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id"),
  adminUsername: text("admin_username").notNull().default(""),
  action: text("action").notNull(),
  target: text("target").notNull().default(""),
  meta: json("meta").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Coupon Codes ─────────────────────────────────────────────────────────────

export const couponCodesTable = pgTable("coupon_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description").notNull().default(""),
  discount: integer("discount").notNull().default(10), // percentage 1-100
  type: text("type").notNull().default("percentage"),  // 'percentage' | 'fixed'
  plan: text("plan").notNull().default("pro"),         // which plan it unlocks/discounts
  maxUses: integer("max_uses"),                        // null = unlimited
  usedCount: integer("used_count").notNull().default(0),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
