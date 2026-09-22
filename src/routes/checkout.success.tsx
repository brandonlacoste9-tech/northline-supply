import { Link, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { formatMoney } from "@/lib/store/catalog";
import { getOrder } from "@/lib/store/orders";

const loadOrder = createServerFn({ method: "GET" })
  .validator((id: unknown) => String(id || ""))
  .handler(async ({ data }) => (data ? await getOrder(data) : null));

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (s: Record<string, unknown>) => ({
    order: typeof s.order === "string" ? s.order : "",
    channel: typeof s.channel === "string" ? s.channel : "",
  }),
  loaderDeps: ({ search }) => ({ order: search.order }),
  loader: async ({ deps }) =>
    deps.order ? loadOrder({ data: deps.order }) : null,
  component: Success,
});

function Success() {
  const search = Route.useSearch();
  const order = Route.useLoaderData();
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted">
        Northline
      </p>
      <h1 className="mt-3 text-4xl font-medium">Order received</h1>
      {order ? (
        <p className="mt-4 text-sm text-muted">
          {order.title} × {order.quantity} · {formatMoney(order.amount, order.currency)} ·
          channel={order.channel}
        </p>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Channel {search.channel || "human"}. Stripe captures only when a secret
          key is set; this stub never charges.
        </p>
      )}
      <div className="mt-8 flex gap-4 text-sm">
        <Link to="/" className="text-fg underline-offset-4 hover:underline">
          Back to shop
        </Link>
        <Link to="/admin" className="text-fg underline-offset-4 hover:underline">
          View orders
        </Link>
      </div>
    </main>
  );
}
