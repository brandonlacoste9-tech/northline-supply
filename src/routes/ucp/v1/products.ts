import { createFileRoute } from "@tanstack/react-router";
import { formatMoney, searchProducts } from "@/lib/store/catalog";
import { corsPreflight, json } from "@/lib/store/orders";

export const Route = createFileRoute("/ucp/v1/products")({
  server: {
    handlers: {
      OPTIONS: async () => corsPreflight(),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const q = url.searchParams.get("q") || url.searchParams.get("query") || "";
        const origin = url.origin;
        const products = searchProducts(q).map((p) => ({
          ...p,
          display_price: formatMoney(p.price, p.currency),
          url: `${origin}/?sku=${p.id}`,
          checkout: `${origin}/api/checkout?sku=${encodeURIComponent(p.sku)}`,
        }));
        return json({ products });
      },
    },
  },
});
