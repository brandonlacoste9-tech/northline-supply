import { createFileRoute } from "@tanstack/react-router";
import {
  formatMoney,
  getProduct,
  searchProducts,
} from "@/lib/store/catalog";
import {
  corsPreflight,
  createOrder,
  detectChannel,
  getOrder,
  json,
} from "@/lib/store/orders";

const TOOLS = [
  {
    name: "search_products",
    description: "Search the merchant catalog by free-text query.",
    inputSchema: { type: "object", properties: { query: { type: "string" } } },
  },
  {
    name: "get_product",
    description: "Get one product by id, sku, or GTIN.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
  {
    name: "create_checkout_session",
    description: "Open a checkout session. Pass channel=chatgpt for ChatGPT click-out.",
    inputSchema: {
      type: "object",
      properties: {
        sku: { type: "string" },
        quantity: { type: "number" },
        channel: { type: "string" },
      },
      required: ["sku"],
    },
  },
  {
    name: "get_order",
    description: "Fetch an order by id, including channel attribution.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
    },
  },
];

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      OPTIONS: async () => corsPreflight(),
      GET: async () => json({ protocol: "mcp", tools: TOOLS.map((t) => t.name) }),
      POST: async ({ request }) => {
        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          body = {};
        }
        const method = String(body.method || "");
        const id = body.id ?? 1;
        if (method === "initialize" || method === "notifications/initialized") {
          return json({
            jsonrpc: "2.0",
            id,
            result: {
              protocolVersion: "2025-03-26",
              serverInfo: { name: "Northline Supply", version: "0.1.0" },
              capabilities: { tools: {} },
            },
          });
        }
        if (method === "tools/list" || method === "list_tools") {
          return json({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
        }
        if (method === "tools/call" || method === "call_tool") {
          const params = (body.params || {}) as Record<string, unknown>;
          const name = String(params.name || "");
          const args = (params.arguments || params.args || {}) as Record<string, unknown>;
          try {
            const result = await callTool(name, args, request);
            return json({
              jsonrpc: "2.0",
              id,
              result: { content: [{ type: "text", text: JSON.stringify(result) }] },
            });
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Tool failed";
            return json({ jsonrpc: "2.0", id, error: { code: -32000, message: msg } });
          }
        }
        return json(
          { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } },
          400,
        );
      },
    },
  },
});

async function callTool(name: string, args: Record<string, unknown>, req: Request) {
  if (name === "search_products") {
    return searchProducts(String(args.query || "")).map((p) => ({
      id: p.id,
      sku: p.sku,
      title: p.title,
      price: formatMoney(p.price, p.currency),
      gtin: p.gtin,
      inventory: p.inventory,
    }));
  }
  if (name === "get_product") {
    const p = getProduct(String(args.id || args.sku || ""));
    if (!p) throw new Error("Product not found");
    return p;
  }
  if (name === "create_checkout_session") {
    const sku = String(args.sku || args.id || "");
    const quantity = Number(args.quantity || 1);
    const channel = detectChannel(req, args);
    const order = await createOrder({ sku, quantity, channel, status: "stub" });
    const origin = new URL(req.url).origin;
    return {
      id: "cs_stub_" + order.id,
      url: `${origin}/checkout/success?order=${order.id}&channel=${channel}`,
      orderId: order.id,
      channel,
      stub: true,
    };
  }
  if (name === "get_order") {
    const order = await getOrder(String(args.id || ""));
    if (!order) throw new Error("Order not found");
    return order;
  }
  throw new Error("Unknown tool: " + name);
}
