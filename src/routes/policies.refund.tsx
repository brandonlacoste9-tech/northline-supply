import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policies/refund")({
  component: () => (
    <main className="mx-auto max-w-lg px-4 py-16">
      <Link to="/" className="text-xs uppercase tracking-[0.18em] text-muted">
        Northline
      </Link>
      <h1 className="mt-4 text-3xl font-medium">Refunds</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Unused goods in original condition, 30 days. Contact the merchant from
        the order receipt.
      </p>
    </main>
  ),
});
