import { useEffect, useMemo, useState } from "react";
import { formatElapsed } from "../../components/StationBoard.js";
import { useDemoTickets, type DemoTicket } from "../../store/demoTickets.js";

export default function Floor(): JSX.Element {
  const tickets = useDemoTickets((s) => s.tickets);
  const calls = useDemoTickets((s) => s.calls);
  const setTicketStatus = useDemoTickets((s) => s.setTicketStatus);
  const resolveCall = useDemoTickets((s) => s.resolveCall);
  const [, setTick] = useState(0);

  // Re-render for elapsed-time aging.
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const readyByTable = useMemo(() => {
    const map = new Map<string, DemoTicket[]>();
    for (const t of tickets.filter((t) => t.status === "READY")) {
      const list = map.get(t.table) ?? [];
      list.push(t);
      map.set(t.table, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [tickets]);

  const pendingCalls = useMemo(
    () => calls.filter((c) => !c.resolved).sort((a, b) => a.createdAt - b.createdAt),
    [calls],
  );

  const now = Date.now();

  return (
    <section aria-labelledby="floor-title">
      <p className="text-sm font-medium text-sky-700">Staff portal · pickup and calls</p>
      <h1 id="floor-title" className="mt-1 text-2xl font-bold">
        Floor
      </h1>

      <h2 className="mt-6 text-lg font-bold">Ready for pickup</h2>
      {readyByTable.length === 0 ? (
        <p className="mt-2 text-sm opacity-70">Nothing waiting — all caught up.</p>
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {readyByTable.map(([table, tableTickets]) => (
            <article
              key={table}
              aria-label={table}
              className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <h3 className="text-lg font-bold">{table}</h3>
              <ul className="mt-2 space-y-3">
                {tableTickets.map((t) => (
                  <li key={t.id} className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800">
                        {t.station === "KITCHEN" ? "Kitchen" : "Bar"}
                      </span>
                      <span className="opacity-60">{t.orderRef}</span>
                      <span className="ml-auto opacity-60">{formatElapsed(now - t.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm">
                      {t.items.map((l) => `${l.qty}× ${l.name}`).join(", ")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setTicketStatus(t.id, "SERVED")}
                      className="mt-2 min-h-[44px] w-full rounded-lg bg-sky-700 text-sm font-semibold text-white"
                    >
                      Mark served
                    </button>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

      <h2 className="mt-8 text-lg font-bold">
        Waiter calls {pendingCalls.length > 0 && `(${pendingCalls.length})`}
      </h2>
      {pendingCalls.length === 0 ? (
        <p className="mt-2 text-sm opacity-70">No pending calls.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {pendingCalls.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950"
            >
              <div>
                <p className="font-bold">{c.table}</p>
                <p className="text-xs opacity-70">waiting {formatElapsed(now - c.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => resolveCall(c.id)}
                className="ml-auto min-h-[44px] rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white"
              >
                Resolve
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
