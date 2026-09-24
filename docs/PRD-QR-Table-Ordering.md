# Product Requirements Document — QR Table Ordering System

| | |
|---|---|
| **Author** | Debayan Chakraborty |
| **Date** | 24 September 2026 |
| **Status** | Draft v0.1 |
| **Platform** | Mobile-first web app (no install for diners) + browser-based staff dashboards |

---

## 1. Overview

QR Table Ordering is a web-based system for a restaurant where every dining table has its own unique QR code. A diner scans the code, browses the menu on their phone, and places an order. Because the QR encodes the table, the system always knows *which table* is ordering. The order is routed instantly to the right preparation station: food items to the **Kitchen dashboard** and drinks to the **Bar dashboard**.

The product has three surfaces:

1. **Menu Card** — the customer-facing ordering interface
2. **Kitchen** — a live order dashboard for kitchen staff
3. **Bar** — a live order dashboard for bar staff

## 2. Problem Statement

In a traditional restaurant, orders are taken by waiters on paper or memory and carried to the kitchen and bar. This causes:

- **Delays** — diners wait for a waiter just to order or to add one more item.
- **Errors** — misheard, misspelled, or lost orders and wrong table attribution.
- **Split routing pain** — food and drink items on one order must be separated and communicated to two stations.
- **Staff overload** — waiters spend time as messengers instead of serving.
- **Static menus** — printed menus can't reflect sold-out items or price changes without reprinting.

A table-aware QR ordering flow removes the middleman for order capture and gives both stations a clean, real-time queue.

## 3. Goals and Non-Goals

### Goals

- G1: Let a diner order from their phone in under 2 minutes without installing an app or creating an account.
- G2: Identify the ordering table automatically and reliably via a unique per-table QR code.
- G3: Deliver each order to the Kitchen and/or Bar dashboard within 2 seconds of submission.
- G4: Automatically split a mixed order so food goes to the Kitchen and drinks go to the Bar.
- G5: Give staff a clear status workflow (New → Preparing → Ready → Served) visible in real time.
- G6: Let the restaurant manage the menu (items, prices, availability) without developer help.

### Non-Goals (v1)

- Online payment processing or bill splitting (payment happens at the table/counter as usual).
- Delivery, takeaway, or online ordering from outside the restaurant.
- Customer accounts, loyalty points, or promotions.
- Inventory management or stock deduction.
- Multi-restaurant / multi-branch (SaaS) support.
- Table reservations or floor-plan management.
- Native iOS/Android apps.

## 4. Target Users

| User | Context | Primary need |
|---|---|---|
| **Diner** | Seated at a table, on their own phone, often in dim light and with patchy signal | Browse and order quickly, see what they've ordered, call for help |
| **Kitchen staff** | Busy line, looking at a wall-mounted screen or tablet, hands often dirty | See new food orders at a glance, mark progress with big tap targets |
| **Bar staff** | Behind the bar, similar screen setup | See only drink orders, mark them ready |
| **Waiter / Floor staff** | Moving around the floor | Know when an order is ready for a given table |
| **Manager / Admin** | Back office or phone | Maintain the menu, manage tables and QR codes, view basic reports |

## 5. Core Features

### 5.1 Unique Table QR Codes

- Each table gets one permanent QR code encoding a URL such as `https://<domain>/t/<table-token>`.
- The token is opaque and non-guessable (not simply `table=5`), so a diner can't easily order as another table.
- Admin can generate, print (PDF sheet with table label), disable, and regenerate a table's QR.
- The table label ("Table 7") is shown prominently on the Menu Card so diners can confirm they're on the right table.

### 5.2 Menu Card (Customer Side)

- **Browse:** Categories (Starters, Mains, Desserts, Soft Drinks, Cocktails, etc.), search, and item cards with name, description, price, photo, and veg/non-veg and allergen tags.
- **Item options:** Variants (e.g., Half/Full), add-ons, and a free-text note ("no onions").
- **Cart:** Add/remove items, adjust quantity, see running total.
- **Place order:** One-tap submit with a confirmation screen and order reference number.
- **Order tracking:** Live status per item group (Kitchen items / Bar items): Received, Preparing, Ready, Served.
- **Add to existing order:** Diner can place further rounds of orders during the same visit; all are grouped under the table's active session.
- **Call waiter:** A single button to request assistance or the bill.
- **Unavailable items:** Sold-out items appear greyed out and cannot be added.

### 5.3 Order Routing Engine

- Each menu item is assigned a **station**: `KITCHEN` or `BAR`.
- On submit, the order is split into one or two **station tickets** (Kitchen ticket, Bar ticket) tied to the same order ID and table.
- Each ticket appears only on its own station's dashboard.
- Overall order status is derived from its tickets (e.g., "Ready" only when all tickets are Ready).

### 5.4 Kitchen Dashboard

- Live queue of Kitchen tickets, newest at the end (oldest-first by default), showing table number, items, quantities, notes, and time elapsed.
- New-order alert (sound and visual highlight).
- Status actions: **Accept → Preparing → Ready**. Large tap targets suitable for tablets.
- Color-coded aging (e.g., amber after 10 minutes, red after 20 minutes; thresholds configurable).
- Ability to reject/cancel an item with a reason (e.g., "Out of stock"), which notifies the diner.
- Toggle an item's availability directly from the dashboard.
- Filters: Active / Completed today.

### 5.5 Bar Dashboard

- Same interaction model as the Kitchen dashboard, showing only Bar tickets.
- Shows drink-specific notes (e.g., "no ice", "extra lime").
- Same status workflow, alerts, aging, and availability toggle.

### 5.6 Floor Staff View (lightweight)

- A simple screen listing tickets marked **Ready** and grouped by table, so waiters know what to pick up and can mark them **Served**.
- Shows active "Call waiter" requests.

### 5.7 Admin Panel

- Menu management: categories, items, prices, photos, tags, station assignment, availability.
- Table management: create/rename/disable tables, generate and print QR codes.
- Staff accounts and roles.
- Basic reports: orders per day, top-selling items, average preparation time per station.

## 6. User Stories

**Diner**
- As a diner, I want to scan the QR on my table and see the menu immediately so that I don't have to wait for a waiter or download an app.
- As a diner, I want to add notes to an item so that the kitchen knows my preferences or restrictions.
- As a diner, I want to see the status of my order so that I know when to expect my food and drinks.
- As a diner, I want to order more items later in my visit without re-entering anything so that repeat rounds are effortless.
- As a diner, I want to call a waiter from my phone so that I can ask for the bill or help.

**Kitchen staff**
- As a chef, I want new food orders to appear instantly with the table number so that I can start cooking without delay.
- As a chef, I want to mark items Preparing/Ready so that floor staff and the diner know progress.
- As a chef, I want to mark an item as sold out so that diners stop ordering it.

**Bar staff**
- As a bartender, I want to see only drink orders so that I'm not distracted by food tickets.
- As a bartender, I want to see order age so that I can prioritise drinks that have been waiting longest.

**Waiter**
- As a waiter, I want a list of ready orders by table so that I can serve them quickly.
- As a waiter, I want to see call-waiter requests so that I can respond promptly.

**Manager**
- As a manager, I want to update prices and availability myself so that the menu is always accurate.
- As a manager, I want to generate and print table QR codes so that I can set up or replace tables easily.
- As a manager, I want basic daily reports so that I can understand what sells and how fast we serve.

## 7. Functional Requirements

### Table and QR
- **FR-1:** The system shall generate a unique, non-guessable token per table and encode it in the QR URL.
- **FR-2:** Scanning a valid QR shall open the Menu Card scoped to that table, with the table label displayed.
- **FR-3:** Scanning a disabled or invalid QR shall show a friendly error and no ordering capability.
- **FR-4:** Admin shall be able to regenerate a table's token, immediately invalidating the old QR.

### Menu Card
- **FR-5:** The Menu Card shall display only items marked available; sold-out items are shown disabled or hidden (configurable).
- **FR-6:** Each order line shall support quantity, a selected variant, add-ons, and a free-text note (max 200 characters).
- **FR-7:** The cart shall persist across page refreshes within the same table session.
- **FR-8:** Submitting an order shall create an Order record linked to the table and a Table Session.
- **FR-9:** The diner shall see a confirmation with an order reference number after submit.
- **FR-10:** The diner shall be able to place multiple orders within one table session.
- **FR-11:** The order status view shall update in real time without manual refresh.
- **FR-12:** The Call Waiter button shall create a request visible on the Floor Staff view; repeated presses within 60 seconds shall be de-duplicated.

### Routing
- **FR-13:** Every menu item shall have exactly one station (`KITCHEN` or `BAR`).
- **FR-14:** On order submit, the system shall create one ticket per station that has at least one item.
- **FR-15:** Tickets shall be delivered to the relevant dashboard within 2 seconds of submit under normal network conditions.

### Kitchen and Bar dashboards
- **FR-16:** Dashboards shall require staff login and show only tickets for the user's station.
- **FR-17:** A new ticket shall trigger an audible and visual alert until acknowledged (Accept).
- **FR-18:** Staff shall be able to move a ticket through New → Preparing → Ready.
- **FR-19:** Staff shall be able to cancel an individual item with a mandatory reason; the diner shall see it on their status screen.
- **FR-20:** Staff shall be able to toggle an item's availability; the change shall reflect on the Menu Card within 5 seconds.
- **FR-21:** Each ticket shall display elapsed time since submit, with configurable colour thresholds.
- **FR-22:** Dashboards shall reconnect automatically after a connection drop and resync missed tickets.

### Floor and Admin
- **FR-23:** The Floor Staff view shall list Ready tickets by table and allow marking them Served.
- **FR-24:** Admin shall be able to create, edit, and deactivate categories, items, tables, and staff users.
- **FR-25:** Admin shall be able to export a printable PDF of table QR codes with table labels.
- **FR-26:** Role-based access: Admin, Kitchen, Bar, Floor. Each role sees only its permitted screens.
- **FR-27:** Table sessions shall be closed by staff (or auto-close after a configurable idle period) so the next diner at that table starts fresh.

## 8. Non-Functional Requirements

| Area | Requirement |
|---|---|
| **Performance** | Menu Card first load under 3 s on a 4G connection; ticket delivery to dashboards within 2 s (p95) |
| **Real-time** | Live updates via WebSockets or equivalent; automatic fallback to polling |
| **Reliability** | 99.5% uptime during restaurant hours; no lost orders — an order is either confirmed to the diner or clearly failed |
| **Resilience** | Diner sees a clear retry message if submit fails; duplicate submissions prevented (idempotency key) |
| **Security** | HTTPS only; opaque table tokens; staff authentication with role-based access; rate limiting on order submit and call-waiter endpoints to prevent spam and abuse |
| **Abuse prevention** | Only one active session per table token; staff can void an order placed in error |
| **Usability** | Mobile-first, usable one-handed, readable in low light; tap targets at least 44 px; staff dashboards optimised for tablets and wall screens |
| **Compatibility** | Latest two versions of Chrome, Safari, Firefox, and Samsung Internet on Android and iOS |
| **Accessibility** | Sufficient colour contrast, scalable text, and screen-reader labels on primary controls |
| **Privacy** | No personal data collected from diners in v1; only table, order, and item data stored |
| **Maintainability** | Menu changes require no deployment; configuration (aging thresholds, session timeout) stored in admin settings |

## 9. Success Metrics

| Metric | Target (first 60 days) |
|---|---|
| Share of orders placed via QR (vs. waiter-taken) | ≥ 70% |
| Median time from QR scan to order submit | ≤ 3 minutes |
| Order-to-ticket delivery latency (p95) | ≤ 2 seconds |
| Order accuracy (orders needing correction due to system/table mix-up) | < 1% |
| Median ticket time: Submitted → Ready (Kitchen / Bar tracked separately) | Establish baseline in month 1; reduce 10% by month 2 |
| Orders per session (repeat rounds) | Increase vs. baseline |
| Staff-reported dashboard usability (short survey) | ≥ 4 / 5 |
| Lost or unseen orders | 0 |

## 10. Open Questions

1. **Payments:** Is the bill settled at the table/counter only (assumed for v1), or should UPI/online payment be added soon after?
2. **Order approval:** Should orders go straight to the stations, or should a waiter/manager confirm first to guard against prank orders?
3. **Session control:** How is a table session closed — by a waiter when the bill is paid, by timeout, or both?
4. **Shared table:** If two groups share one table, should they share one session or be able to order separately?
5. **Sold-out handling:** Should unavailable items be hidden or shown greyed out?
6. **Mixed tickets:** Should the Kitchen see that the same order also has Bar items (for pacing), or strictly only its own?
7. **Hardware:** What devices will Kitchen and Bar use (tablet, monitor, phone), and is a printer for kitchen tickets needed as a fallback?
8. **Connectivity:** How reliable is the restaurant's Wi-Fi/internet, and is a degraded offline mode for dashboards required?
9. **Languages:** Should the Menu Card support multiple languages (e.g., English and Bengali)?
10. **Taxes and pricing:** Are prices shown inclusive of GST/service charge, or added at billing?
11. **Tech stack and hosting:** Which stack and hosting will be used for the web app, real-time layer, and database?
12. **Branding:** Is there existing restaurant branding (logo, colours, fonts) to apply?

## 11. Future Considerations (Post-v1)

- Online payment and bill splitting (UPI, cards).
- Printing kitchen tickets to a thermal printer.
- Inventory tracking with auto sold-out when stock runs out.
- Multi-restaurant / multi-branch SaaS with per-tenant branding.
- Customer feedback and ratings after the meal.
- Upsell suggestions and combo offers.
- Multilingual menu and voice/accessibility enhancements.
- Analytics dashboard: peak hours, item profitability, station load.
- POS and accounting integration.
- Loyalty program and optional customer identity (phone number).
- Estimated preparation times shown to diners.
