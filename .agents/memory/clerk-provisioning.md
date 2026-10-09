---
name: Clerk provisioning
description: Environment-specific behavior observed while adding Replit-managed Clerk authentication
---

Replit-managed Clerk provisioning can fail before secrets are created when the platform derives an invalid application name from an uploaded archive filename. In that state, `checkClerkManagementStatus` reports `not_configured`, the Clerk browser script may fail to load, and learner APIs must remain explicitly unavailable rather than falling back to anonymous shared data.

**Why:** Retrying setup with a code-level application name did not override the archive-derived invalid name, so the remaining issue is outside the application code.

**How to apply:** Keep the Clerk wiring and protected routes in place, restart after provisioning succeeds, then verify sign-up, profile JIT creation, and cross-user isolation with real Clerk sessions.