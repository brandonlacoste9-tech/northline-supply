import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  PRODUCTS,
  formatMoney,
  getProduct,
  type Product,
  type OrderChannel,
} from "@/lib/store/catalog";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): {
    sku?: string;
    channel?: OrderChannel;
  } => {
    const sku = typeof search.sku === "string" ? search.sku : undefined;
    const v = String(search.channel || "").toLowerCase();
    const channel: OrderChannel | undefined =
      v === "chatgpt" || v === "gemini" || v === "copilot" || v === "human"
        ? v
        : undefined;
    return {
      ...(sku ? { sku } : {}),
      ...(channel ? { channel } : {}),
    };
  },
  component: Storefront,
});

function Storefront() {
  const search = Route.useSearch();
  const channel: OrderChannel = search.channel ?? "human";
  const [selectedId, setSelectedId] = useState<string | null>(search.sku || null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const selected = useMemo(
    () => (selectedId ? getProduct(selectedId) : null),
    [selectedId],
  );

  async function buy(product: Product) {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: product.sku, quantity: qty, channel }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setNotice("Checkout session opened. Check Orders.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="block h-px w-8 bg-primary" />
            <span className="text-sm font-medium tracking-[0.18em] uppercase">
              Northline
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted">
            <a href="#catalog" className="hover:text-fg">
              Catalog
            </a>
            <Link to="/admin" className="hover:text-fg">
              Orders
            </Link>
            <a href="/.well-known/ucp" className="hover:text-fg">
              UCP
            </a>
          </nav>
        </div>
      </header>

      {channel !== "human" ? (
        <div className="border-b border-line bg-surface px-4 py-2 text-center text-xs text-muted">
          Agent click-out · channel={channel}. Buy writes that onto the order row.
        </div>
      ) : null}

      <main className="mx-auto max-w-5xl px-4 pb-24">
        <section className="grid gap-10 py-14 md:grid-cols-[1.2fr_0.8fr] md:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
              Agent-ready store
            </p>
            <h1 className="display mt-4 max-w-[14ch] text-4xl font-medium text-fg md:text-6xl">
              Field goods. Written down.
            </h1>
            <p className="mt-5 max-w-md text-base text-muted">
              One typed catalog. Humans buy here. Agents read{" "}
              <code className="text-fg">/.well-known/ucp</code>. No Shopify
              account.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              Proof
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>Profile lists four SKUs and opens checkout.</li>
              <li>MCP: search, get, checkout, order.</li>
              <li>
                ChatGPT landing with{" "}
                <code className="text-fg">?channel=chatgpt</code> tags the row.
              </li>
            </ul>
            <Link
              to="/"
              search={{ channel: "chatgpt" }}
              className="mt-5 inline-flex h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg"
            >
              Simulate ChatGPT click-out
            </Link>
          </div>
        </section>

        <section id="catalog">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-xl font-medium">Catalog</h2>
            <p className="text-xs text-muted">{PRODUCTS.length} SKUs</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PRODUCTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedId(p.id);
                  setQty(1);
                  setNotice(null);
                }}
                className="group overflow-hidden rounded-xl border border-line bg-surface text-left transition-transform duration-[var(--motion-fast,250ms)] hover:-translate-y-0.5"
              >
                <div className="aspect-[4/5] overflow-hidden bg-bg">
                  <img
                    src={p.images[0]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium text-fg">{p.title}</p>
                    <p className="mt-1 text-xs text-muted">{p.sku}</p>
                  </div>
                  <p className="text-sm tabular-nums">
                    {formatMoney(p.price, p.currency)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {selected ? (
          <section className="mt-10 grid gap-6 rounded-xl border border-line bg-surface p-5 md:grid-cols-[1fr_1fr]">
            <img
              src={selected.images[0]}
              alt=""
              className="aspect-[4/5] w-full rounded-lg object-cover"
            />
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                {selected.brand} · {selected.gtin}
              </p>
              <h2 className="mt-2 text-2xl font-medium">{selected.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {selected.description}
              </p>
              <p className="mt-4 text-lg tabular-nums">
                {formatMoney(selected.price, selected.currency)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {selected.inventory} in stock
              </p>
              <div className="mt-6 flex items-center gap-3">
                <label className="text-xs text-muted">
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value) || 1)}
                    className="ml-2 h-11 w-16 rounded-lg border border-line bg-bg px-2 text-sm text-fg"
                  />
                </label>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void buy(selected)}
                  className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-fg disabled:opacity-60"
                >
                  {busy ? "Opening…" : "Buy"}
                </button>
              </div>
              {notice ? <p className="mt-3 text-sm text-muted">{notice}</p> : null}
            </div>
          </section>
        ) : null}
      </main>

      <footer className="border-t border-line px-4 py-10 text-xs text-muted">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:justify-between">
          <p>Northline Supply · ejected from Shipboard</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/changelog">Changelog</Link>
            <Link to="/policies/privacy">Privacy</Link>
            <Link to="/policies/refund">Refunds</Link>
            <Link to="/policies/shipping">Shipping</Link>
            <Link to="/admin">Orders</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
