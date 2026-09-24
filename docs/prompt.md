# Build Prompt — QR Table Ordering System

You are a senior full-stack engineer. Build the **QR Table Ordering System** described in `PRD-QR-Table-Ordering.md` (read it fully before writing any code). Work **phase by phase**, and track progress in `TODO.md`.

---

## 0. How to work (read first)

1. **Read** `PRD-QR-Table-Ordering.md` and `TODO.md` at the start of every session.
2. Work on **one phase at a time**, in order. Do not start the next phase until the current one meets its **Definition of Done**.
3. Before coding a phase, break it into concrete tasks in `TODO.md` (if not already broken down).
4. As you work, tick items off in `TODO.md` (`- [x]`). Add any newly discovered tasks under the current phase. Never delete finished items.
5. At the end of each phase:
   - run the tests/build and confirm they pass,
   - update `TODO.md` (status, notes, decisions made),
   - write a short **Phase Summary** (what was built, how to run it, what to verify by hand),
   - **stop and wait for my approval** before starting the next phase.
6. If a requirement is ambiguous, pick the default listed in **Section 2 (Assumptions)**, note it in `TODO.md` under "Decisions", and continue. Only ask me when a decision would be costly to reverse.
7. Keep commits small and meaningful, one logical change per commit, using the message format `phase-N: short description`.
8. Do not add features listed under **Non-Goals** in the PRD.

---

## 1. Tech stack (defaults; edit this section if you prefer something else)

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite, Tailwind CSS, React Router |
| State / data fetching | TanStack Query (server state), Zustand (cart) |
| Backend | Node.js + Express + TypeScript |
| Real-time | Socket.IO (with polling fallback) |
| Database | PostgreSQL with Prisma ORM |
| Auth (staff) | JWT in httpOnly cookie, role-based (`ADMIN`, `KITCHEN`, `BAR`, `FLOOR`) |
| QR generation | `qrcode` npm package, PDF sheet via `pdfkit` |
| Validation | Zod (shared schemas between client and server) |
| Testing | Vitest (unit), Supertest (API), Playwright (a few end-to-end flows) |
| Dev tooling | ESLint, Prettier, Docker Compose for local Postgres |

**Repo layout (monorepo):**

```
/apps/web        # React app: Menu Card, Kitchen, Bar, Floor, Admin
/apps/api        # Express API + Socket.IO
/packages/shared # Zod schemas, types, constants
/docs            # PRD, prompt, TODO, API notes
```

---

## 2. Assumptions (defaults for the PRD's Open Questions)

Use these unless I say otherwise:

- **Payments:** none in v1. Bill is settled at the table or counter.
- **Order approval:** orders go **straight** to the stations (no waiter confirmation), but staff can void an order.
- **Table session:** created on the first order from a table's QR. Closed by Floor/Admin staff, or auto-closed after 3 hours of inactivity (configurable).
- **Shared table:** one session per table, shared by everyone at that table.
- **Sold-out items:** shown greyed out with a "Sold out" label and cannot be added.
- **Mixed orders:** Kitchen sees only Kitchen items, Bar sees only Bar items.
- **Devices:** dashboards designed for tablets and wall-mounted screens (landscape) and also usable on a phone.
- **Languages:** English only in v1, but keep all UI strings in a single constants/i18n file so translation is easy later.
- **Prices:** shown as entered; tax/service charge handled at billing (out of scope).
- **Currency:** INR (₹), stored as integer paise.
- **Aging thresholds:** amber at 10 min, red at 20 min (configurable in admin settings).

---

## 3. Phases

### Phase 0 — Project setup
Scaffold the monorepo, tooling, Docker Compose (Postgres), env handling, linting, a health-check endpoint, and a "hello" page on the web app.
**Done when:** `docker compose up` + `npm run dev` starts web and api, lint/test scripts run, README explains setup.

### Phase 1 — Data model and auth
Prisma schema and migrations for: `Table`, `TableSession`, `Category`, `MenuItem` (with `station`: KITCHEN | BAR, variants, add-ons, availability), `Order`, `OrderItem`, `Ticket` (per station), `WaiterCall`, `User`, `Setting`. Seed script with a sample menu (about 6 categories, 25 items across food and drinks), 10 tables, and one user per role. Staff login/logout, role-based middleware.
**Done when:** migrations and seed run cleanly, login works for each role, unauthorized access returns 401/403, tests cover auth and role guards.

### Phase 2 — Admin panel
Admin screens for: menu categories and items (CRUD, photo upload or URL, station assignment, availability toggle), tables (create, rename, disable, regenerate token), **QR generation** (unique non-guessable token per table, downloadable printable PDF with table label), and staff users.
**Done when:** admin can build a full menu and print QR codes; scanning a printed QR opens `/t/<token>`; regenerating a token invalidates the old one; tests included.

### Phase 3 — Menu Card (customer side)
Mobile-first page at `/t/<token>`: table label, category tabs, search, item cards (photo, price, veg/non-veg and allergen tags), item detail with variants, add-ons, and note (max 200 chars), cart drawer with running total, place-order with confirmation and reference number. Invalid or disabled tokens show a friendly error page. Cart persists across refresh.
**Done when:** a diner can browse and submit an order on a phone-sized viewport; order and order items are stored against the table session; idempotency key prevents duplicate submits; tests included.

### Phase 4 — Order routing and real-time
On submit, split the order into one Kitchen ticket and/or one Bar ticket by item station. Set up Socket.IO rooms (`station:KITCHEN`, `station:BAR`, `table:<id>`). Emit ticket-created and status-changed events. Derive overall order status from its tickets. Add reconnect handling and a resync endpoint for missed tickets.
**Done when:** submitting a mixed order creates two tickets; each is delivered only to the correct room within 2 seconds locally; reconnect resyncs; tests cover splitting logic and status derivation.

### Phase 5 — Kitchen dashboard
Staff-only page: live queue of Kitchen tickets (oldest first) with table number, items, quantities, notes, elapsed time and aging colours. Actions: Accept → Preparing → Ready. New-ticket sound and visual alert. Cancel an item with a mandatory reason. Toggle item availability. Filters: Active / Completed today. Large touch-friendly controls.
**Done when:** end-to-end flow works: diner submits, ticket appears live, status changes propagate to the diner's status screen; Playwright test covers it.

### Phase 6 — Bar dashboard
Reuse the dashboard components from Phase 5 for the `BAR` station (shared component, station passed as a prop). Add drink-specific note display.
**Done when:** Bar sees only drink tickets, same behaviour as Kitchen, no duplicated code beyond configuration.

### Phase 7 — Diner order tracking, Floor view, and Call Waiter
- Diner side: live per-station status (Received / Preparing / Ready / Served), cancelled-item notices, "add another order" flow, and **Call Waiter** button (de-duplicated within 60 s).
- Floor view: Ready tickets grouped by table with "Mark served", active waiter calls with "Resolve", and a "Close table session" action.
**Done when:** the whole loop works across Menu Card, Kitchen, Bar, and Floor; session close resets the table for the next diner.

### Phase 8 — Reports, hardening, and deployment
Basic admin reports (orders per day, top items, average prep time per station). Rate limiting on order-submit and call-waiter endpoints, input validation review, security headers, CORS config, error logging, accessibility pass (contrast, labels, tap targets), performance check (Menu Card first load under 3 s on throttled 4G). Production Dockerfiles, environment docs, and a deployment guide. Update README with a user guide for each role.
**Done when:** all PRD functional requirements (FR-1 to FR-27) are traceable to a test or a manual check listed in `TODO.md`, and a fresh clone can be deployed following the guide.

---

## 4. Quality bar (applies to every phase)

- TypeScript strict mode, no `any` without a comment explaining why.
- Every API endpoint validates input with Zod and returns consistent error shapes.
- No secrets in the repo; use `.env.example`.
- Money stored as integers (paise), never floats.
- UI must be responsive, keyboard accessible, and usable one-handed on a phone.
- Write tests alongside features, not at the end.

---

## 5. Start now

1. Read `PRD-QR-Table-Ordering.md` and `TODO.md`.
2. Confirm the tech stack and assumptions above in two or three sentences.
3. Begin **Phase 0**: expand its tasks in `TODO.md`, then build it.
4. Finish with the Phase Summary and wait for my approval before Phase 1.
