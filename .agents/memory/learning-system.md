---
name: Learning System Architecture
description: How the adaptive learning system (Subjects & Lessons redesign) is structured — content, DB, API, and UI.
---

## Architecture Decision

Content lives in **TypeScript** (`artifacts/aedusim/src/data/subjects.ts`), not in the DB. Progress is DB-backed.

**Why:** Content is code — versioned, typed, easy to diff. DB is for user state only. This eliminates complex content CRUD and keeps lessons fast (no extra API calls).

**How to apply:** To add a new subject, append to the `SUBJECTS` array in `subjects.ts`. To add a topic, append to the relevant chapter's `topics` array. No DB migrations needed for content.

## DB Tables (new)

- `topic_progress` — per-user per-topic: status, mastery, quiz_score, problems_correct/total, time_spent, last_section, bookmarked, notes, started_at, completed_at. UNIQUE(user_id, topic_slug).
- `placement_results` — per-user per-subject: score, total, passed, recommended_chapter_slug. UNIQUE(user_id, subject_slug).

## Routes

- `GET /api/learning/progress` → map of topicSlug → progress
- `PATCH /api/learning/progress/:topicSlug` → upsert progress (completes and awards XP)
- `GET /api/learning/summary` → aggregate stats (completed, inProgress, totalTime, bySubject)
- `GET /api/learning/placement/:subjectSlug` → 404 if not taken (expected, handled by UI)
- `POST /api/learning/placement/:subjectSlug` → submit/retake placement test

## Frontend Routes

- `/knowledge` → `knowledge-hub.tsx` (subject grid + stats)
- `/knowledge/:subject` → `subject-view.tsx` (knowledge tree + placement test)
- `/knowledge/:subject/:topic` → `lesson-view.tsx` (lesson pipeline)

## Content Structure

Each subject has: `chapters[]` → each has `topics[]` → each topic has `theory: Block[]`, `examples[]`, `problems[]`.

Block types: paragraph, heading, formula, callout, list, table, divider.

Placement tests are in `PLACEMENT_TESTS` record in subjects.ts, keyed by subject slug.

## Level Progression

Chapters have a `level` field: foundations → core → applications → advanced → expert → research → olympiad.
Colors defined in `LEVEL_CONFIG` object.

## XP Award

Completing a topic calls `PATCH /api/learning/progress/:topicSlug` with `status: "completed"`. The API runs `UPDATE profile SET xp = xp + 100` automatically. Topic-specific xpReward (150–250) is displayed in UI but the DB currently awards flat 100 XP (can be updated to use topic.xpReward by passing it in the PATCH body).
