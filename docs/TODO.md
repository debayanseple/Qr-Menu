# TODO — QR Table Ordering System

**Current phase:** Phase 0 (done, awaiting approval)
**Legend:** `[ ]` to do · `[x]` done · `[~]` in progress · `[!]` blocked

> Rule: update this file as work happens. Add new tasks under the current phase; never delete finished items.

---

## Phase 0 — Project setup
- [x] Create monorepo (`apps/web`, `apps/api`, `packages/shared`, `docs`)
- [x] Configure TypeScript, ESLint, Prettier, shared tsconfig
- [x] Docker Compose with PostgreSQL
- [x] `.env.example` and env loading for web and api
- [x] API skeleton with `/health` endpoint
- [x] Web skeleton (Vite + React + Tailwind + Router) with placeholder pages
- [x] Root scripts: `dev`, `build`, `lint`, `test`
- [x] README with setup steps
- [x] **Phase 0 Summary written, awaiting approval**

## Phase 1 — Data model and auth
- [ ] Prisma schema: Table, TableSession, Category, MenuItem, Order, OrderItem, Ticket, WaiterCall, User, Setting
- [ ] Migrations run cleanly
- [ ] Seed: sample menu (about 25 items), 10 tables, one user per role
- [ ] Staff login/logout (JWT httpOnly cookie)
- [ ] Role-based middleware (ADMIN, KITCHEN, BAR, FLOOR)
- [ ] Tests: auth and role guards
- [ ] **Phase 1 Summary written, awaiting approval**

## Phase 2 — Admin panel
- [ ] Category CRUD
- [ ] Menu item CRUD (variants, add-ons, photo, station, availability)
- [ ] Table CRUD (create, rename, disable)
- [ ] Unique non-guessable table token generation
- [ ] Regenerate token (invalidates old QR)
- [ ] QR code generation + printable PDF sheet with table labels
- [ ] Staff user management
- [ ] Tests for admin APIs and token regeneration
- [ ] **Phase 2 Summary written, awaiting approval**

## Phase 3 — Menu Card (customer)
- [ ] `/t/:token` route with table label and invalid-token page
- [ ] Category tabs and search
- [ ] Item cards with tags (veg/non-veg, allergens) and sold-out state
- [ ] Item detail: variants, add-ons, note (max 200 chars)
- [ ] Cart (Zustand) persisted across refresh, running total
- [ ] Place order + confirmation with reference number
- [ ] Idempotency key on submit
- [ ] Table session created on first order
- [ ] Tests: order creation API and cart behaviour
- [ ] **Phase 3 Summary written, awaiting approval**

## Phase 4 — Order routing and real-time
- [ ] Split order into Kitchen and/or Bar tickets by item station
- [ ] Socket.IO setup with rooms (`station:KITCHEN`, `station:BAR`, `table:<id>`)
- [ ] Events: ticket-created, ticket-status-changed
- [ ] Derive overall order status from tickets
- [ ] Reconnect handling + resync endpoint
- [ ] Tests: splitting logic, status derivation, room isolation
- [ ] **Phase 4 Summary written, awaiting approval**

## Phase 5 — Kitchen dashboard
- [ ] Staff-only route and role guard
- [ ] Live ticket queue (oldest first)
- [ ] Elapsed time and aging colours (10 / 20 min, configurable)
- [ ] Accept → Preparing → Ready actions
- [ ] New-ticket sound + visual alert
- [ ] Cancel item with mandatory reason
- [ ] Toggle item availability
- [ ] Filters: Active / Completed today
- [ ] Playwright test: submit order → appears on Kitchen → status reaches diner
- [ ] **Phase 5 Summary written, awaiting approval**

## Phase 6 — Bar dashboard
- [ ] Refactor dashboard into a shared station component
- [ ] Bar route showing only BAR tickets
- [ ] Drink note display
- [ ] Tests: Bar sees no Kitchen tickets
- [ ] **Phase 6 Summary written, awaiting approval**

## Phase 7 — Diner tracking, Floor view, Call Waiter
- [ ] Diner live status per station
- [ ] Cancelled-item notice to diner
- [ ] "Add another order" within the same session
- [ ] Call Waiter button (de-duplicated within 60 s)
- [ ] Floor view: Ready tickets by table, "Mark served"
- [ ] Floor view: waiter calls list, "Resolve"
- [ ] Close table session action + idle auto-close (3 h, configurable)
- [ ] End-to-end test of the full loop
- [ ] **Phase 7 Summary written, awaiting approval**

## Phase 8 — Reports, hardening, deployment
- [ ] Reports: orders per day, top items, avg prep time per station
- [ ] Rate limiting (order submit, call waiter)
- [ ] Input validation and security header review
- [ ] Error logging
- [ ] Accessibility pass
- [ ] Performance check (Menu Card < 3 s on throttled 4G)
- [ ] Production Dockerfiles + env docs
- [ ] Deployment guide
- [ ] Role-based user guide in README
- [ ] Requirements traceability: FR-1 to FR-27 mapped to tests/manual checks
- [ ] **Phase 8 Summary written, awaiting approval**

---

## Decisions
_(Record assumptions and choices made during the build here.)_

- Assumptions from `prompt.md` Section 2 apply unless changed below.
- Phase 0: npm workspaces (no Turborepo) to keep the scaffold simple.
- Phase 0: Tailwind CSS v4 via `@tailwindcss/vite` (no postcss.config needed).
- Phase 0: `docker-compose.yml` ships Postgres 16 config, but Docker is not
  installed on this machine, so `docker compose up` was not run. API `/health`
  verified without a DB; Postgres wiring lands in Phase 1.
- Phase 0: vitest `test` scripts use `--passWithNoTests` so web/shared pass
  until they gain tests; shared has one `formatPaise` smoke test.
- Phase 0: `.prettierignore` excludes `PRD-QR-Table-Ordering.md`, `prompt.md`,
  `TODO.md` so formatting never rewrites spec/tracking docs.
- Demo (pre-Phase 1, user-requested): `apps/web` Menu Card renders a static demo
  menu (`src/data/demoMenu.ts`, 5 categories / 13 items, 1 sold-out) with search,
  category tabs, veg/non-veg marks, and an in-memory demo cart + order-ref
  confirmation. No backend: cart resets on refresh. Replaced by real API data in
  Phase 3; demo token `demo-table-7` shows label "Table 7".
- Demo portals (pre-Phase 1, user-requested): three separate staff portals backed
  by a zustand demo store (`src/store/demoTickets.ts`). Kitchen and Bar share one
  `StationBoard` component (`src/components/StationBoard.tsx`, station as prop):
  oldest-first queue, Accept → Preparing → Ready, aging colours (amber 10m / red
  20m), NEW beep + highlight with mute toggle, Active/Completed filter, Simulate
  order button. Floor (`src/pages/Floor.tsx`) groups READY tickets by table with
  Mark served, plus waiter calls with Resolve. Menu "Place demo order" splits lines
  into Kitchen/Bar tickets by item station; "Call waiter" creates a call with 60s
  dedup. Seeded tickets/calls demonstrate aging and filters. All replaced by the
  real API + Socket.IO in Phases 1/4/5/6/7.
- Restructure (user-requested): each staff portal lives in its own folder —
  `src/portals/kitchen/`, `src/portals/bar/`, `src/portals/floor/` — while the
  shared `StationBoard` stays in `src/components/`. Spec docs moved to `docs/`
  (`PRD-QR-Table-Ordering.md`, `prompt.md`, `TODO.md`); README and
  `.prettierignore` updated to the new paths.

## Blockers / Questions
- Docker not installed here — confirm Postgres will run via `docker compose up -d postgres`
  on the dev/deploy machine before Phase 1, or provide a `DATABASE_URL` to an existing instance.

## Phase Summaries
### Phase 0 Summary (24 Sep 2026, awaiting approval)
Built: monorepo (`apps/web`, `apps/api`, `packages/shared`), TS strict + shared
tsconfig, ESLint 9 flat + Prettier, Compose Postgres file, `.env.example` x3,
Express API with `GET /health` + consistent 404 shape, Vite React Tailwind Router
web with placeholder routes (`/`, `/t/:token`, `/kitchen`, `/bar`, `/floor`, `/admin`),
shared Zod schemas (`StaffRole`, `Station`, `TicketStatus`) + `formatPaise` + `STRINGS`.
Run: `cp .env.example .env` (+ api/web), `npm install`, `npm run dev`
(web http://localhost:5173, api http://localhost:4000/health).
Verify: `npm run build` OK, `npm run lint` OK, `npm run format:check` OK,
`npm run test` OK (api 2 tests, shared 1 test), `GET /health` returns
`{"status":"ok"}` (checked against built `dist`).
