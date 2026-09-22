import { Link, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { formatMoney } from "@/lib/store/catalog";
import { listOrders } from "@/lib/store/orders";

const getOrders = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return { ok: true as const, orders: await listOrders(20), error: null as string | null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load orders";
    console.error("[admin]", message);
    return { ok: false as const, orders: [] as Awaited<ReturnType<typeof listOrders>>, error: message };
  }
});

export const Route = createFileRoute("/admin")({
  loader: () => getOrders(),
  component: AdminOrders,
});

function AdminOrders() {
  const data = Route.useLoaderData();
  const orders = data.orders;
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-12">
      <Link to="/" className="text-xs uppercase tracking-[0.18em] text-muted">
        Northline
      </Link>
      <h1 className="mt-4 text-3xl font-medium">Last 20 orders</h1>
      <p className="mt-2 text-sm text-muted">
        Each checkout writes a row. Channel is set at checkout — a ChatGPT
        click-out with ?channel=chatgpt lands as chatgpt.
      </p>
      {data.error ? (
        <p className="mt-4 rounded-lg border border-line bg-surface px-3 py-2 text-sm">
          Could not load orders. {data.error}
        </p>
      ) : null}
      <div className="mt-8 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-line bg-surface text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">When</th>
              <th className="px-3 py-2 font-medium">Agent</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-muted" colSpan={5}>
                  No orders yet. Buy a notebook or open checkout from the UCP
                  profile.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-line">
                  <td className="px-3 py-2 tabular-nums text-muted">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-medium">{o.channel}</td>
                  <td className="px-3 py-2">
                    {o.sku}
                    <span className="mt-0.5 block text-[11px] text-muted">
                      {o.title}
                    </span>
                  </td>
                  <td className="px-3 py-2 tabular-nums">{o.quantity}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {formatMoney(o.amount, o.currency)}
                    <span className="mt-0.5 block text-[11px] text-muted">
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
