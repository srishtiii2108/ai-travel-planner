# WanderAI — India Edition

## Overview

Full-stack AI Travel Planner for India. Built as a pnpm monorepo with React+Vite frontend, Express API server, PostgreSQL + Drizzle ORM backend, and a 5-agent OpenAI multi-agent system.

## Product

- **Name**: WanderAI — India Edition 🇮🇳
- **Theme**: India-only travel planning. All costs in INR (₹). Indian cities only.
- **AI Agents**: Coordinator, Planner, Transport (Indian Railways priority), Accommodation, Optimization
- **Auth**: Replit Auth (OpenID Connect / PKCE) — login/logout via `@workspace/replit-auth-web`
- **Currency**: All prices in Indian Rupees (INR) using `toLocaleString('en-IN')`

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle for API, Vite for frontend)
- **Frontend**: React 18, Vite, TailwindCSS, framer-motion, react-hook-form

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port from env PORT)
│   └── travel-planner/     # React+Vite frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks + custom-fetch
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── replit-auth-web/    # useAuth() hook for browser OIDC auth
│   └── integrations-openai-ai-server/  # OpenAI client wrapper
├── pnpm-workspace.yaml
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json
```

## Key Files

- `artifacts/api-server/src/app.ts` — Express setup with cookieParser + authMiddleware
- `artifacts/api-server/src/routes/index.ts` — mounts health, auth, travel routers
- `artifacts/api-server/src/routes/auth.ts` — OIDC login/callback/logout/mobile endpoints
- `artifacts/api-server/src/routes/travel/` — travel plan generation + saved trips CRUD
- `artifacts/api-server/src/agents/coordinatorAgent.ts` — orchestrates all 5 AI agents
- `artifacts/api-server/src/lib/auth.ts` — session management (PostgreSQL-backed)
- `artifacts/api-server/src/middlewares/authMiddleware.ts` — populates req.user from session
- `lib/db/src/schema/auth.ts` — users + sessions tables
- `lib/db/src/schema/trips.ts` — saved trips table
- `artifacts/travel-planner/src/pages/home.tsx` — main page with auth UI
- `artifacts/travel-planner/src/components/travel-form.tsx` — India cities autocomplete + ₹ budget
- `artifacts/travel-planner/src/components/dashboard/` — results dashboard components

## AI Agents

1. **plannerAgent** — Day-by-day itinerary with Indian landmarks, local food, culture
2. **transportAgent** — Indian Railways trains (with real train numbers/names), domestic flights (IndiGo/Air India/SpiceJet), buses. Filter tags: cheapest/fastest/recommended
3. **accommodationAgent** — Hotels in budget/mid-range/luxury tiers (guesthouses, OYO, 3-5 star). INR thresholds: <₹2000 budget, <₹5000 mid-range, else luxury
4. **optimizationAgent** — Budget optimization: switches flights→trains, luxury→mid-range hotels to stay within budget. INR savings reported.
5. **coordinatorAgent** — Parallel orchestration, city image selection (20+ Indian cities), returns `currency: "INR"`

## Authentication (Replit Auth)

- OIDC/PKCE flow via Replit's identity provider
- Sessions stored in PostgreSQL `sessions` table (TTL: 7 days)
- Users stored in `users` table (upserted on each login)
- Frontend: `useAuth()` from `@workspace/replit-auth-web` — provides `user`, `isAuthenticated`, `login()`, `logout()`
- Login redirects to `/api/login`, logout to `/api/logout`
- "My Trips" button requires login; prompts sign-in if not authenticated

## India-Specific Design Choices

- **Budget slider**: ₹5,000 – ₹5,00,000 range
- **Budget labels**: Budget (<₹10k), Mid-Range (₹10k-30k), Premium (₹30k+)
- **Budget bar**: Green = within budget, Amber = optimized, Red = exceeded
- **Transport**: Trains prioritized for budgets under ₹15,000
- **Cities**: 55 Indian cities in autocomplete dropdown
- **Hero image**: Taj Mahal (Agra) as default background
- **City images**: 20+ Indian cities mapped to Unsplash images

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` (composite: true). Root `tsconfig.json` lists all packages as project references.

- **Always typecheck from root**: `pnpm run typecheck`
- **Codegen**: `pnpm --filter @workspace/api-spec run codegen`
- **DB push**: `pnpm --filter @workspace/db run push`

## Common Commands

- `pnpm --filter @workspace/api-server run dev` — API dev server
- `pnpm --filter @workspace/travel-planner run dev` — Frontend dev server
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API client + Zod schemas
- `pnpm --filter @workspace/db run push` — Push schema changes to DB
