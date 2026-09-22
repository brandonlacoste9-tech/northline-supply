import { createFileRoute } from "@tanstack/react-router";
import { corsPreflight, createOrder, detectChannel, json } from "@/lib/store/orders";
import { getProduct } from "@/lib/store/catalog";

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      OPTIONS: async () => corsPreflight(),
      GET: async ({ request }) => handleCheckout(request),
      POST: async ({ request }) => handleCheckout(request),
    },
  },
});

async function handleCheckout(request: Request) {
  let body: Record<string, unknown> = {};
  if (request.method === "POST") {
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }
  const url = new URL(request.url);
  const sku = String(body.sku || body.id || url.searchParams.get("sku") || "");
  const quantity = Number(body.quantity || url.searchParams.get("quantity") || 1);
  if (!getProduct(sku)) return json({ error: "Unknown product" }, 400);
  const channel = detectChannel(request, body);
  try {
    const order = await createOrder({ sku, quantity, channel, status: "stub" });
    const origin = url.origin;
    const checkoutUrl = `${origin}/checkout/success?order=${order.id}&channel=${channel}`;
    if (request.method === "GET" && !url.searchParams.get("json")) {
      return Response.redirect(checkoutUrl, 302);
    }
    return json({
      id: "cs_stub_" + order.id,
      url: checkoutUrl,
      orderId: order.id,
      stub: true,
      channel,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    console.error("[checkout]", message);
    return json({ error: "Checkout failed", detail: message }, 500);
  }
}
