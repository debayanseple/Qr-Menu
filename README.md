# QR Table Ordering System

Mobile-first QR table ordering: diners scan a per-table QR, order from their phone,
orders split to Kitchen / Bar dashboards in real time. See `docs/PRD-QR-Table-Ordering.md`.

## Phase 0 status

Scaffold only: monorepo, health endpoint, placeholder web pages. No ordering yet.

## Prerequisites

- Node.js >= 20, npm >= 10
- (Optional for later phases) Docker + Docker Compose for local Postgres

## Setup

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm install
```

Start Postgres (needed from Phase 1 onward; Phase 0 API runs without a DB):

```bash
docker compose up -d postgres
```

> No Docker on this machine? The Phase 0 `GET /health` endpoint works without a
> database. Database wiring lands in Phase 1.

## Run

```bash
npm run dev          # api (:4000) + web (:5173) together
npm run dev:api      # api only
npm run dev:web      # web only
```

- Web: http://localhost:5173
- API health: http://localhost:4000/health

## Scripts

| Command                | What                          |
| ---------------------- | ----------------------------- |
| `npm run dev`          | api + web in watch mode       |
| `npm run build`        | build all workspaces          |
| `npm run lint`         | eslint, zero warnings allowed |
| `npm run format:check` | prettier check                |
| `npm run test`         | vitest per workspace          |

## Layout

```
/apps/web        # React app: Menu Card, Kitchen, Bar, Floor, Admin
/apps/api        # Express API (+ Socket.IO from Phase 4)
/packages/shared # Zod schemas, types, constants
/docs            # PRD, prompt, TODO, API notes
```

## Decisions (Phase 0)

- npm workspaces (no Turborepo) to keep Phase 0 simple.
- Tailwind CSS v4 via `@tailwindcss/vite`.
- No DB access in Phase 0; Postgres via Compose from Phase 1.
