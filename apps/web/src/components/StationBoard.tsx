import { useEffect, useMemo, useRef, useState } from "react";
import type { DemoStation } from "../data/demoMenu.js";
import { useDemoTickets, type DemoTicket, type DemoTicketStatus } from "../store/demoTickets.js";

export function formatElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/** Aging colour thresholds in ms (amber 10 min, red 20 min — PRD configurable). */
function agingClass(ms: number): string {
  if (ms >= 20 * 60_000) return "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100";
  if (ms >= 10 * 60_000) return "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100";
  return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200";
}

/** Short WebAudio beep for new-ticket alerts (no audio asset needed). */
function beep(): void {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    // Demo only — stay silent when audio is unavailable.
  }
}

const NEXT_ACTION: Record<DemoTicketStatus, { label: string; next: DemoTicketStatus } | null> = {
  NEW: { label: "Accept", next: "PREPARING" },
  PREPARING: { label: "Mark ready", next: "READY" },
  READY: null,
  SERVED: null,
};

function TicketCard({
  ticket,
  now,
  onAdvance,
}: {
  ticket: DemoTicket;
  now: number;
  onAdvance: (t: DemoTicket) => void;
}): JSX.Element {
  const elapsed = now - ticket.createdAt;
  const action = NEXT_ACTION[ticket.status];
  return (
    <article
      aria-label={`${ticket.table} ${ticket.orderRef}`}
      className={`rounded-xl border bg-white p-4 dark:bg-neutral-950 ${
        ticket.status === "NEW"
          ? "border-green-600 ring-2 ring-green-600/40"
          : "border-neutral-200 dark:border-neutral-800"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-bold">{ticket.table}</h3>
        <span className="text-sm opacity-60">{ticket.orderRef}</span>
        {ticket.status === "NEW" && (
          <span className="animate-pulse rounded-full bg-green-700 px-2 py-0.5 text-xs font-bold text-white">
            NEW
          </span>
        )}
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${agingClass(elapsed)}`}
          title="Time since order submitted"
        >
          {formatElapsed(elapsed)}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {ticket.items.map((line, i) => (
          <li key={`${line.name}-${i}`} className="text-sm">
            <span className="font-semibold">
              {line.qty}× {line.name}
            </span>
            {line.note.trim() !== "" && (
              <p className="mt-0.5 rounded bg-amber-50 px-2 py-1 italic text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                “{line.note}”
              </p>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-3">
        {action ? (
          <button
            type="button"
            onClick={() => onAdvance(ticket)}
            className="min-h-[48px] w-full rounded-lg bg-green-700 text-base font-semibold text-white"
          >
            {action.label}
          </button>
        ) : (
          <p className="rounded-lg bg-neutral-100 py-2 text-center text-sm font-medium dark:bg-neutral-800">
            Ready — waiting for floor pickup
          </p>
        )}
      </div>
    </article>
  );
}

/**
 * Shared live queue for a station. Kitchen and Bar render this with their own
 * station prop, so behaviour never drifts between the two portals.
 */
export default function StationBoard({ station }: { station: DemoStation }): JSX.Element {
  const tickets = useDemoTickets((s) => s.tickets);
  const setTicketStatus = useDemoTickets((s) => s.setTicketStatus);
  const simulateTicket = useDemoTickets((s) => s.simulateTicket);
  const [filter, setFilter] = useState<"active" | "done">("active");
  const [muted, setMuted] = useState(false);
  const [, setTick] = useState(0);
  const prevNew = useRef<number | null>(null);

  const stationTickets = useMemo(
    () => tickets.filter((t) => t.station === station),
    [tickets, station],
  );
  const newCount = stationTickets.filter((t) => t.status === "NEW").length;

  // Re-render for elapsed-time aging.
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  // Audible + visual alert on newly arrived tickets.
  useEffect(() => {
    if (prevNew.current === null) {
      prevNew.current = newCount;
      return;
    }
    if (newCount > prevNew.current && !muted) beep();
    prevNew.current = newCount;
  }, [newCount, muted]);

  const visible = useMemo(() => {
    const list =
      filter === "active"
        ? stationTickets.filter((t) => t.status !== "SERVED")
        : stationTickets.filter((t) => t.status === "SERVED");
    return [...list].sort((a, b) =>
      filter === "active" ? a.createdAt - b.createdAt : b.createdAt - a.createdAt,
    );
  }, [stationTickets, filter]);

  const activeCount = stationTickets.filter((t) => t.status !== "SERVED").length;

  function advance(ticket: DemoTicket): void {
    const action = NEXT_ACTION[ticket.status];
    if (action) setTicketStatus(ticket.id, action.next);
  }

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Ticket filter" className="flex gap-2">
          {(["active", "done"] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`min-h-[44px] rounded-full px-4 text-sm font-medium ${
                filter === f
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 dark:bg-neutral-800"
              }`}
            >
              {f === "active" ? `Active (${activeCount})` : "Completed today"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-pressed={muted}
            title={muted ? "Unmute new-order sound" : "Mute new-order sound"}
            className="min-h-[44px] min-w-[44px] rounded-lg bg-neutral-100 text-lg dark:bg-neutral-800"
          >
            {muted ? "🔇" : "🔔"}
          </button>
          <button
            type="button"
            onClick={() => simulateTicket(station)}
            className="min-h-[44px] rounded-lg border border-dashed border-neutral-400 px-3 text-sm font-medium"
          >
            + Simulate order
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-6 text-sm opacity-70">
          {filter === "active"
            ? "No active tickets — queue is clear."
            : "Nothing completed yet today."}
        </p>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {visible.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} now={Date.now()} onAdvance={advance} />
          ))}
        </div>
      )}
    </div>
  );
}
