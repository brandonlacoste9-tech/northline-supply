import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policies/shipping")({
  component: () => (
    <main className="mx-auto max-w-lg px-4 py-16">
      <Link to="/" className="text-xs uppercase tracking-[0.18em] text-muted">
        Northline
      </Link>
      <h1 className="mt-4 text-3xl font-medium">Shipping</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Ships from the workshop in 2–5 business days. Agents and humans get the
        same rates.
      </p>
    </main>
  ),
});
