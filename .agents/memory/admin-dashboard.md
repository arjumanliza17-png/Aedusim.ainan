---
name: Admin Dashboard Setup
description: Notes on the Aedusim admin dashboard — seeding, routes, architecture, and pages built
---

## Admin Account
- Owner account: ahmedmuksit2011@gmail.com
- Hash = SHA-256(SESSION_SECRET + password) — must recompute if SESSION_SECRET changes
- Bootstrap endpoint POST /api/admin/setup self-disables once any admin exists (403 after first use)

## Architecture
- Admin frontend: artifacts/admin (port 5001), Vite proxy → localhost:3001
- Backend routes: artifacts/api-server/src/routes/admin.ts (all admin logic in one file)
- DB tables added: system_settings (key/value feature flags), announcements

**Why separate port:** Admin is a fully separate React SPA with its own vite config; keeps student app isolated.

## Backend Routes (all under /api/admin)
- POST /setup — bootstrap first owner (self-disables)
- POST /auth/login, GET /auth/me
- GET /stats — full platform KPIs
- GET /analytics/daily — 14-day breakdown for charts
- GET /activity — aggregated feed (messages + exams + registrations, up to 50 events)
- GET/PATCH /settings/:key — system feature flags stored in system_settings table
- GET/POST/PATCH/DELETE /challenges — challenge CRUD
- GET/POST/PATCH/DELETE /announcements — announcement CRUD
- GET/POST/PATCH/DELETE /users, /coupons, /admins (admins: owner only)

## Pages Built (artifacts/admin/src/pages/)
dashboard.tsx, analytics.tsx, activity.tsx, users.tsx, subscriptions.tsx,
challenges.tsx, coupons.tsx, announcements.tsx, settings.tsx, admins.tsx, login.tsx

## DB Schema
lib/db/src/schema.ts: added systemSettingsTable (key PK, value, updatedAt) + announcementsTable
Both exported from lib/db/src/index.ts

## Feature Flags (stored in system_settings)
maintenance_mode, registration_enabled, ai_enabled, show_pricing_banner,
feature_simulations, feature_exam_builder, feature_challenges, feature_documents,
max_messages_free, max_messages_pro

## Notes
- recharts in devDependencies of @workspace/admin — fine for dev
- No python3 on this Replit — use node -e for JSON parsing in shell commands
- The replacement dashboard is served as `public/dashboard.html` inside the protected React shell; it reads the admin token from localStorage and refreshes stats, users, and activity from the backend.
- Admin date-bound SQL parameters must be passed as ISO strings to the postgres driver rather than JavaScript Date objects.
- The workspace artifact registry uses `Aedusim Admin` at `/admin/`; its Vite base path and static asset URLs must retain the `/admin/` prefix.
