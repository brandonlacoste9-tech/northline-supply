import { createFileRoute } from "@tanstack/react-router";
import { corsPreflight, getOrder, json, listOrders } from "@/lib/store/orders";

export const Route = createFileRoute("/api/orders")({
  server: {
    handlers: {
      OPTIONS: async () => corsPreflight(),
      GET: async ({ request }) => {
        const id = new URL(request.url).searchParams.get("id");
        if (id) {
          const order = await getOrder(id);
          if (!order) return json({ error: "Not found" }, 404);
          return json({ order });
        }
        return json({ orders: await listOrders(20) });
      },
    },
  },
});
