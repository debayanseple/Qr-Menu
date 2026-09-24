import { create } from "zustand";
import type { DemoMenuItem, DemoStation } from "../data/demoMenu.js";

/** Ticket lifecycle for the demo portals (PRD FR-18, minus CANCELLED for now). */
export type DemoTicketStatus = "NEW" | "PREPARING" | "READY" | "SERVED";

export interface DemoTicketItem {
  name: string;
  qty: number;
  note: string;
}

export interface DemoTicket {
  id: string;
  orderRef: string;
  table: string;
  station: DemoStation;
  items: DemoTicketItem[];
  status: DemoTicketStatus;
  /** Epoch ms — seeds use offsets so aging colours are visible immediately. */
  createdAt: number;
}

export interface DemoWaiterCall {
  id: string;
  table: string;
  createdAt: number;
  resolved: boolean;
}

export interface DemoOrderLine {
  item: DemoMenuItem;
  qty: number;
  note: string;
}

const MIN = 60_000;
let seq = 0;

function uid(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

function demoRef(): string {
  return `DEMO-${Math.floor(1000 + Math.random() * 9000)}`;
}

function seedTickets(): DemoTicket[] {
  const now = Date.now();
  return [
    {
      id: "seed-k1",
      orderRef: "T-101",
      table: "Table 7",
      station: "KITCHEN",
      status: "NEW",
      createdAt: now - 2 * MIN,
      items: [
        { name: "Paneer Tikka", qty: 2, note: "extra spicy" },
        { name: "Garlic Naan", qty: 1, note: "" },
      ],
    },
    {
      id: "seed-k2",
      orderRef: "T-098",
      table: "Table 3",
      station: "KITCHEN",
      status: "PREPARING",
      createdAt: now - 12 * MIN,
      items: [
        { name: "Butter Chicken", qty: 1, note: "no onions" },
        { name: "Garlic Naan", qty: 2, note: "" },
      ],
    },
    {
      id: "seed-k3",
      orderRef: "T-095",
      table: "Table 5",
      station: "KITCHEN",
      status: "READY",
      createdAt: now - 22 * MIN,
      items: [{ name: "Paneer Butter Masala", qty: 1, note: "" }],
    },
    {
      id: "seed-k4",
      orderRef: "T-090",
      table: "Table 1",
      station: "KITCHEN",
      status: "SERVED",
      createdAt: now - 60 * MIN,
      items: [{ name: "Masala Fries", qty: 2, note: "" }],
    },
    {
      id: "seed-b1",
      orderRef: "T-101",
      table: "Table 7",
      station: "BAR",
      status: "NEW",
      createdAt: now - 2 * MIN,
      items: [{ name: "Mango Lassi", qty: 2, note: "less sugar" }],
    },
    {
      id: "seed-b2",
      orderRef: "T-099",
      table: "Table 2",
      station: "BAR",
      status: "PREPARING",
      createdAt: now - 15 * MIN,
      items: [{ name: "Virgin Mint Mojito", qty: 1, note: "no ice" }],
    },
  ];
}

const SIM_TABLES = ["Table 2", "Table 6", "Table 8", "Table 9"];

const SIM_BUNDLES: Record<DemoStation, DemoTicketItem[][]> = {
  KITCHEN: [
    [{ name: "Masala Fries", qty: 1, note: "" }],
    [
      { name: "Chicken 65", qty: 1, note: "extra lemon" },
      { name: "Garlic Naan", qty: 2, note: "" },
    ],
    [{ name: "Paneer Butter Masala", qty: 2, note: "less spicy" }],
  ],
  BAR: [
    [{ name: "Masala Shikanji", qty: 2, note: "" }],
    [{ name: "Blue Lagoon Cooler", qty: 1, note: "no ice" }],
    [{ name: "Mango Lassi", qty: 1, note: "" }],
  ],
};

interface DemoTicketsState {
  tickets: DemoTicket[];
  calls: DemoWaiterCall[];
  /** Split order lines by station into tickets; returns the order reference. */
  placeOrder: (table: string, lines: DemoOrderLine[]) => string;
  setTicketStatus: (id: string, status: DemoTicketStatus) => void;
  simulateTicket: (station: DemoStation) => void;
  /** Returns false when a call for the table was made within the last 60s. */
  addWaiterCall: (table: string) => boolean;
  resolveCall: (id: string) => void;
}

export const useDemoTickets = create<DemoTicketsState>()((set) => ({
  tickets: seedTickets(),
  calls: [{ id: "seed-c1", table: "Table 4", createdAt: Date.now() - 3 * MIN, resolved: false }],

  placeOrder: (table, lines) => {
    const ref = demoRef();
    const now = Date.now();
    const tickets: DemoTicket[] = (["KITCHEN", "BAR"] as DemoStation[])
      .map((station) => {
        const items = lines
          .filter((l) => l.item.station === station && l.qty > 0)
          .map((l) => ({ name: l.item.name, qty: l.qty, note: l.note }));
        if (items.length === 0) return null;
        return {
          id: uid("t"),
          orderRef: ref,
          table,
          station,
          items,
          status: "NEW" as DemoTicketStatus,
          createdAt: now,
        };
      })
      .filter((t): t is DemoTicket => t !== null);
    set((s) => ({ tickets: [...s.tickets, ...tickets] }));
    return ref;
  },

  setTicketStatus: (id, status) =>
    set((s) => ({
      tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)),
    })),

  simulateTicket: (station) => {
    const bundles = SIM_BUNDLES[station];
    const bundle = bundles[seq % bundles.length] ?? [];
    const table = SIM_TABLES[seq % SIM_TABLES.length] ?? "Table 2";
    const ticket: DemoTicket = {
      id: uid("t"),
      orderRef: demoRef(),
      table,
      station,
      items: bundle.map((b) => ({ ...b })),
      status: "NEW",
      createdAt: Date.now(),
    };
    set((s) => ({ tickets: [...s.tickets, ticket] }));
  },

  addWaiterCall: (table) => {
    let accepted = false;
    set((s) => {
      const recent = s.calls.some(
        (c) => c.table === table && !c.resolved && Date.now() - c.createdAt < 60_000,
      );
      if (recent) return s;
      accepted = true;
      return {
        calls: [...s.calls, { id: uid("c"), table, createdAt: Date.now(), resolved: false }],
      };
    });
    return accepted;
  },

  resolveCall: (id) =>
    set((s) => ({
      calls: s.calls.map((c) => (c.id === id ? { ...c, resolved: true } : c)),
    })),
}));
