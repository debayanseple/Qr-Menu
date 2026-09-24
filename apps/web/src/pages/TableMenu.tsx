import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  DEMO_CATEGORIES,
  DEMO_ITEMS,
  demoTableLabel,
  type DemoMenuItem,
} from "../data/demoMenu.js";
import { useDemoTickets } from "../store/demoTickets.js";

function formatPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

/** Deterministic hue per item so placeholders vary without any image assets. */
function hueFor(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) % 360;
  }
  return h;
}

/** Decorative photo placeholder until real item photos land (Phase 2 admin). */
function ItemImage({ item }: { item: DemoMenuItem }): JSX.Element {
  const hue = hueFor(item.id);
  const hue2 = (hue + 40) % 360;
  return (
    <div
      aria-hidden="true"
      className="flex h-32 items-center justify-center rounded-lg"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 60%, 85%), hsl(${hue2}, 60%, 70%))`,
      }}
    >
      <span className="text-4xl font-bold" style={{ color: `hsl(${hue}, 45%, 35%)` }}>
        {item.name.charAt(0)}
      </span>
    </div>
  );
}

function VegMark({ veg }: { veg: boolean }): JSX.Element {
  return (
    <span
      aria-label={veg ? "veg" : "non-veg"}
      title={veg ? "Veg" : "Non-veg"}
      className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border-2 ${
        veg ? "border-green-600" : "border-red-700"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${veg ? "bg-green-600" : "bg-red-700"}`} />
    </span>
  );
}

function ItemCard({
  item,
  qty,
  onAdd,
  onRemove,
}: {
  item: DemoMenuItem;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
}): JSX.Element {
  const soldOut = !item.available;
  return (
    <article
      aria-label={item.name}
      className={`flex flex-col rounded-xl border p-4 ${
        soldOut
          ? "border-neutral-200 bg-neutral-50 opacity-60 dark:border-neutral-800 dark:bg-neutral-900"
          : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
      }`}
    >
      <ItemImage item={item} />
      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="font-semibold">{item.name}</h3>
        <VegMark veg={item.veg} />
      </div>
      <p className="mt-1 text-sm opacity-70">{item.description}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800">
          {item.station === "KITCHEN" ? "Kitchen" : "Bar"}
        </span>
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs dark:bg-neutral-800"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-bold">{formatPaise(item.pricePaise)}</span>
        {soldOut ? (
          <span className="rounded-lg bg-neutral-200 px-3 py-2 text-sm font-medium dark:bg-neutral-800">
            Sold out
          </span>
        ) : qty === 0 ? (
          <button
            type="button"
            onClick={onAdd}
            className="min-h-[44px] rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Add
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove one ${item.name}`}
              className="min-h-[44px] min-w-[44px] rounded-lg bg-neutral-200 text-lg font-bold dark:bg-neutral-800"
            >
              −
            </button>
            <span aria-live="polite" className="min-w-6 text-center font-bold">
              {qty}
            </span>
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Add one ${item.name}`}
              className="min-h-[44px] min-w-[44px] rounded-lg bg-green-700 text-lg font-bold text-white"
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

interface CartLine {
  item: DemoMenuItem;
  qty: number;
  /** Free-text instruction for the kitchen/bar, max 200 chars (PRD FR-6). */
  note: string;
}

function CartSheet({
  lines,
  total,
  onClose,
  onSetQty,
  onSetNote,
  onPlaceOrder,
}: {
  lines: CartLine[];
  total: number;
  onClose: () => void;
  onSetQty: (id: string, qty: number) => void;
  onSetNote: (id: string, note: string) => void;
  onPlaceOrder: () => void;
}): JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Review your order"
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/50"
      />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 dark:bg-neutral-950 sm:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Your order</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="min-h-[44px] min-w-[44px] rounded-lg bg-neutral-100 text-lg font-bold dark:bg-neutral-800"
          >
            ×
          </button>
        </div>
        {lines.length === 0 ? (
          <p className="mt-4 text-sm opacity-70">Your cart is empty.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {lines.map(({ item, qty, note }) => (
              <li
                key={item.id}
                className="rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm opacity-70">{formatPaise(item.pricePaise)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSetQty(item.id, qty - 1)}
                      aria-label={`Remove one ${item.name}`}
                      className="min-h-[44px] min-w-[44px] rounded-lg bg-neutral-200 text-lg font-bold dark:bg-neutral-800"
                    >
                      −
                    </button>
                    <span aria-live="polite" className="min-w-6 text-center font-bold">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSetQty(item.id, qty + 1)}
                      aria-label={`Add one ${item.name}`}
                      className="min-h-[44px] min-w-[44px] rounded-lg bg-green-700 text-lg font-bold text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
                <label
                  className="mt-2 block text-xs font-medium opacity-70"
                  htmlFor={`note-${item.id}`}
                >
                  Instruction (optional)
                </label>
                <input
                  id={`note-${item.id}`}
                  type="text"
                  value={note}
                  maxLength={200}
                  onChange={(e) => onSetNote(item.id, e.target.value)}
                  placeholder="e.g. no onions, extra spicy"
                  className="mt-1 min-h-[44px] w-full rounded-lg border border-neutral-300 px-3 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                <p className="mt-1 text-right text-xs opacity-60">{note.length}/200</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <span className="font-bold">Total</span>
          <span className="font-bold">{formatPaise(total)}</span>
        </div>
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={lines.length === 0}
          className="mt-3 min-h-[44px] w-full rounded-lg bg-green-700 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Place demo order
        </button>
      </div>
    </div>
  );
}

export default function TableMenu(): JSX.Element {
  const { token } = useParams();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<Record<string, { qty: number; note: string }>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [waiterMsg, setWaiterMsg] = useState<string | null>(null);
  const placeDemoOrder = useDemoTickets((s) => s.placeOrder);
  const callWaiter = useDemoTickets((s) => s.addWaiterCall);

  useEffect(() => {
    if (!cartOpen) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setCartOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_ITEMS.filter((item) => {
      if (activeCategory !== "all" && item.categoryId !== activeCategory) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, activeCategory]);

  const lines: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, entry]) => {
          const item = DEMO_ITEMS.find((i) => i.id === id);
          return item ? { item, qty: entry.qty, note: entry.note } : null;
        })
        .filter((l): l is CartLine => l !== null),
    [cart],
  );

  const cartCount = lines.reduce((sum, l) => sum + l.qty, 0);
  const cartTotal = lines.reduce((sum, l) => sum + l.item.pricePaise * l.qty, 0);

  function add(id: string): void {
    setCart((prev) => {
      const entry = prev[id] ?? { qty: 0, note: "" };
      return { ...prev, [id]: { ...entry, qty: entry.qty + 1 } };
    });
    setOrderRef(null);
  }

  function setQty(id: string, qty: number): void {
    setCart((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      const entry = prev[id] ?? { qty: 0, note: "" };
      return { ...prev, [id]: { ...entry, qty } };
    });
  }

  function remove(id: string): void {
    setCart((prev) => {
      const entry = prev[id];
      if (!entry) return prev;
      if (entry.qty <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...entry, qty: entry.qty - 1 } };
    });
  }

  function setNote(id: string, note: string): void {
    setCart((prev) => {
      const entry = prev[id];
      if (!entry) return prev;
      return { ...prev, [id]: { ...entry, note } };
    });
  }

  function onCallWaiter(): void {
    const ok = callWaiter(demoTableLabel(token));
    setWaiterMsg(
      ok
        ? "Staff notified — someone is on the way."
        : "Request already sent — please wait a moment.",
    );
  }

  function placeOrder(): void {
    const ref = placeDemoOrder(
      demoTableLabel(token),
      lines.map((l) => ({ item: l.item, qty: l.qty, note: l.note })),
    );
    setOrderRef(ref);
    setCart({});
    setCartOpen(false);
  }

  return (
    <section aria-labelledby="menu-title" className="pb-24">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-green-700">{demoTableLabel(token)}</p>
        <button
          type="button"
          onClick={onCallWaiter}
          className="min-h-[44px] rounded-lg border border-neutral-300 px-4 text-sm font-semibold dark:border-neutral-700"
        >
          Call waiter
        </button>
      </div>
      {waiterMsg && (
        <p
          role="status"
          className="mt-2 rounded-lg bg-sky-100 p-2 text-sm text-sky-900 dark:bg-sky-900 dark:text-sky-100"
        >
          {waiterMsg}
        </p>
      )}
      <div className="mt-1 flex items-center gap-2">
        <h1 id="menu-title" className="text-2xl font-bold">
          Menu
        </h1>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          demo data
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes, drinks, tags…"
          aria-label="Search menu"
          className="min-h-[44px] w-full rounded-lg border border-neutral-300 px-3 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categories">
        {[{ id: "all", name: "All" }, ...DEMO_CATEGORIES].map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`min-h-[44px] shrink-0 rounded-full px-4 text-sm font-medium ${
              activeCategory === cat.id
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 dark:bg-neutral-800"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {orderRef && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-green-100 p-3 text-sm font-medium text-green-900 dark:bg-green-900 dark:text-green-100"
        >
          Demo order placed! Reference <strong>{orderRef}</strong>. Watch it appear on the Kitchen /
          Bar portals.
        </p>
      )}

      {visible.length === 0 ? (
        <p className="mt-6 text-sm opacity-70">No dishes match your search.</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {visible.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              qty={cart[item.id]?.qty ?? 0}
              onAdd={() => add(item.id)}
              onRemove={() => remove(item.id)}
            />
          ))}
        </div>
      )}

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <span aria-live="polite" className="text-sm font-medium">
              {cartCount} item{cartCount === 1 ? "" : "s"} · {formatPaise(cartTotal)}
            </span>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="min-h-[44px] rounded-lg bg-green-700 px-5 py-2 text-sm font-semibold text-white"
            >
              Review cart
            </button>
          </div>
        </div>
      )}

      {cartOpen && (
        <CartSheet
          lines={lines}
          total={cartTotal}
          onClose={() => setCartOpen(false)}
          onSetQty={setQty}
          onSetNote={setNote}
          onPlaceOrder={placeOrder}
        />
      )}
    </section>
  );
}
