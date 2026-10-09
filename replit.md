# Aedusim — AI Education Universe

An educational webapp featuring an AI tutor (Falcoa), 3D science simulations, an exam builder with handwriting recognition, knowledge hub with document upload, and a gamified progress system.

## Stack

- **Frontend**: React 19 + Vite 6, TypeScript, Tailwind CSS v4, Framer Motion, Three.js/React Three Fiber, shadcn/ui
- **Backend**: Express 5 (Node.js), TypeScript, compiled with esbuild
- **Database**: PostgreSQL via Drizzle ORM (Replit built-in)
- **AI**: Groq SDK (Llama 4 Scout) for Falcoa chat + exam grading

## Project structure

```
artifacts/
  aedusim/          # React frontend (Vite dev server on port 5000)
  api-server/       # Express API server (port 3001, proxied to /api)
lib/
  db/               # Drizzle ORM schema + postgres connection (@workspace/db)
  api-zod/          # Zod request/response schemas (@workspace/api-zod)
  api-client-react/ # React Query hooks for the API (@workspace/api-client-react)
```

## How to run

Replit manages four artifact workflows from each artifact's
`.replit-artifact/artifact.toml`:

- **Aedusim web** — `pnpm --filter @workspace/aedusim run dev` on port 18807,
  served at `/`.
- **API Server** — `pnpm --filter @workspace/api-server run dev` on port 8080,
  served at `/api`. Both Vite apps proxy `/api/*` to this service.
- **Aedusim Admin** — `pnpm --filter @workspace/aedusim-admin run dev` on port
  25270, served at `/admin/`.
- **Component Preview Server** — `pnpm --filter @workspace/mockup-sandbox run dev`
  on port 8081, served at `/__mockup`.

Install the monorepo dependencies with `pnpm install --frozen-lockfile`. Replit
starts and restarts the artifact workflows automatically.

## Environment variables / secrets

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes (auto) | PostgreSQL connection used by the API |
| `GROQ_API_KEY` | Yes for AI chat | Llama 4 Scout via Groq. Without it, Falcoa falls back to rule-based responses |
| `SESSION_SECRET` | Present | Provided in Replit secrets |
| `API_PROXY_TARGET` | No | Overrides the Vite API proxy target; defaults to `http://localhost:8080` |

## Database schema

Tables: `conversations`, `messages`, `profile`, `challenges`, `exams`, `exam_sessions`, `saved`, `documents`

Schema is defined in `lib/db/src/schema.ts`. After structural changes, rebuild and restart the Backend API workflow.

## After code changes

- **Frontend changes**: Vite hot-reloads automatically.
- **Backend changes**: Rebuild with `pnpm --filter @workspace/api-server run build`, then restart the API Server artifact workflow.

## User preferences

- Keep the existing project structure (artifacts/ and lib/ layout) — do not restructure.
