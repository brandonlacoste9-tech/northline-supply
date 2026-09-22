import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [
      { title: "Changelog · Northline Supply" },
      {
        name: "description",
        content: "Dated notes on the Northline catalog and the agent contract.",
      },
    ],
  }),
  component: Changelog,
});

const ENTRIES: {
  date: string;
  title: string;
  items: string[];
}[] = [
  {
    date: "2026-09-21",
    title: "Netlify host",
    items: [
      "Production is Netlify. Checkout still writes an order row; the site needs DATABASE_URL set to a Postgres URI (Supabase or any Postgres), not a management token.",
    ],
  },
  {
    date: "2026-09-21",
    title: "Durable orders",
    items: [
      "Checkout writes an order row. The last 20 show on /admin. Channel still lands on the row — human, chatgpt, gemini, or copilot.",
    ],
  },
  {
    date: "2026-09-21",
    title: "Public log",
    items: [
      "This page. Dated entries, listed in the sitemap and the storefront footer. Static — no CMS.",
    ],
  },
  {
    date: "2026-09-21",
    title: "Agent-ready store",
    items: [
      "Four SKUs: field notebook, camp blanket, brass desk lamp, canvas tote. Each has GTIN, inventory, and a checkout URL.",
      "Humans buy on this domain. Agents read /.well-known/ucp over REST and MCP (search, get, checkout, order).",
      "A ChatGPT click-out with ?channel=chatgpt is written onto the order row. Same for gemini, copilot, and human.",
      "Privacy, refunds (unused goods, 30 days), and shipping (2–5 business days). Same rates for agents and humans.",
    ],
  },
];

function Changelog() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="block h-px w-8 bg-primary" />
            <span className="text-sm font-medium tracking-[0.18em] uppercase">
              Northline
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted">
            <a href="/#catalog" className="hover:text-fg">
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

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
          Northline Supply
        </p>
        <h1 className="display mt-4 text-4xl font-medium text-balance md:text-5xl">
          Changelog
        </h1>
        <p className="mt-4 max-w-md text-base text-pretty text-muted">
          What changed on the catalog and the machine contract. One static
          page, newest first.
        </p>

        <ol className="mt-12 space-y-0">
          {ENTRIES.map((entry) => (
            <li
              key={`${entry.date}-${entry.title}`}
              className="grid gap-3 border-t border-line py-8 sm:grid-cols-[7.5rem_1fr] sm:gap-8"
            >
              <time
                dateTime={entry.date}
                className="pt-1 text-xs tabular-nums text-muted"
              >
                {entry.date}
              </time>
              <div>
                <h2 className="text-lg font-medium text-fg">{entry.title}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-pretty text-muted">
                  {entry.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </main>

      <footer className="border-t border-line px-4 py-10 text-xs text-muted">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:justify-between">
          <p>Northline Supply · ejected from Shipboard</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/changelog" className="text-fg">
              Changelog
            </Link>
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
