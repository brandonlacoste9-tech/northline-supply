import { createFileRoute } from "@tanstack/react-router";
import { getProduct } from "@/lib/store/catalog";
import {
  corsPreflight,
  createOrder,
  detectChannel,
  getOrder,
  json,
} from "@/lib/store/orders";

export const Route = createFileRoute("/api/acp/checkout-sessions")({
  server: {
    handlers: {
      OPTIONS: async () => corsPreflight(),
      GET: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("id") || "";
        const order = id ? await getOrder(id) : null;
        if (!order) return json({ error: "Not found" }, 404);
        return json({ checkout_session: order });
      },
      POST: async ({ request }) => {
        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = {};
        }
        const payment = (body.payment || body.payment_method || {}) as Record<
          string,
          unknown
        >;
        const spt = String(
          payment.shared_payment_token || payment.token || body.shared_payment_token || "",
        );
        const items = (Array.isArray(body.line_items) ? body.line_items : [body]) as Record<
          string,
          unknown
        >[];
        const first = items[0] || {};
        const sku = String(first.sku || first.id || body.sku || "");
        const quantity = Math.max(1, Number(first.quantity || body.quantity || 1));
        if (!getProduct(sku)) return json({ error: "Unknown product" }, 400);
        const channel = detectChannel(request, body);
        if (spt) {
          console.info("[ACP] Shared Payment Token received (not captured)", {
            spt: spt.slice(0, 12) + "…",
            sku,
            channel,
          });
        }
        const order = await createOrder({
          sku,
          quantity,
          channel,
          status: "stub",
          agent: channel === "human" ? undefined : channel,
          spt: spt ? spt.slice(0, 24) : undefined,
        });
        return json({
          id: order.id,
          status: "requires_confirmation",
          payment_status: spt ? "token_logged_not_captured" : "unpaid",
          checkout_session: order,
          note: "v0 ACP stub — SPT logged, charge not captured.",
        });
      },
    },
  },
});
