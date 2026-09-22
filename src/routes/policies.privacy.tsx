import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policies/privacy")({
  component: () => (
    <Policy title="Privacy">
      We keep orders so we can fulfill them. The catalog is public. Payment
      tokens are logged, not stored as card numbers.
    </Policy>
  ),
});

function Policy({ title, children }: { title: string; children: string }) {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <Link to="/" className="text-xs uppercase tracking-[0.18em] text-muted">
        Northline
      </Link>
      <h1 className="mt-4 text-3xl font-medium">{title}</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">{children}</p>
    </main>
  );
}
