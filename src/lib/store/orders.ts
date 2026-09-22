import { getSql } from "@/lib/db";
import type { OrderChannel } from "./catalog";
import { getProduct } from "./catalog";

// Static env read so Nitro/Netlify keep DATABASE_URL on the server function.
void process.env.DATABASE_URL;

export interface StoreOrder {
  id: string;
  createdAt: string;
  channel: OrderChannel;
  sku: string;
  title: string;
  quantity: number;
  amount: number;
  currency: string;
  status: "open" | "paid" | "stub";
  agent?: string;
  spt?: string;
}

type OrderRow = {
  id: string;
  created_at: string | Date;
  channel: OrderChannel;
  sku: string;
  title: string;
  quantity: number;
  amount: number;
  currency: string;
  status: StoreOrder["status"];
  agent: string | null;
  spt: string | null;
};

function toOrder(row: OrderRow): StoreOrder {
  const createdAt =
    row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at);
  return {
    id: row.id,
    createdAt,
    channel: row.channel,
    sku: row.sku,
    title: row.title,
    quantity: Number(row.quantity),
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status,
    agent: row.agent || undefined,
    spt: row.spt || undefined,
  };
}

export async function listOrders(limit = 20): Promise<StoreOrder[]> {
  const sql = await getSql();
  const cap = Math.max(1, Math.min(100, Number(limit) || 20));
  const rows = await sql<OrderRow>`
    select id, created_at, channel, sku, title, quantity, amount, currency, status, agent, spt
    from store_orders
    order by created_at desc
    limit ${cap}
  `;
  return rows.map(toOrder);
}

export async function getOrder(id: string): Promise<StoreOrder | null> {
  const sql = await getSql();
  const rows = await sql<OrderRow>`
    select id, created_at, channel, sku, title, quantity, amount, currency, status, agent, spt
    from store_orders
    where id = ${id}
    limit 1
  `;
  return rows[0] ? toOrder(rows[0]) : null;
}

export async function createOrder(input: {
  channel: OrderChannel;
  sku: string;
  quantity?: number;
  status?: StoreOrder["status"];
  agent?: string;
  spt?: string;
}): Promise<StoreOrder> {
  const product = getProduct(input.sku);
  if (!product) throw new Error("Unknown product");
  const quantity = Math.max(1, Math.min(99, Number(input.quantity) || 1));
  const order: StoreOrder = {
    id: "ord_" + Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
    channel: input.channel,
    sku: product.sku,
    title: product.title,
    quantity,
    amount: product.price * quantity,
    currency: product.currency,
    status: input.status || "stub",
    agent: input.agent,
    spt: input.spt,
  };
  const sql = await getSql();
  await sql`
    insert into store_orders (
      id, created_at, channel, sku, title, quantity, amount, currency, status, agent, spt
    ) values (
      ${order.id},
      ${order.createdAt},
      ${order.channel},
      ${order.sku},
      ${order.title},
      ${order.quantity},
      ${order.amount},
      ${order.currency},
      ${order.status},
      ${order.agent ?? null},
      ${order.spt ?? null}
    )
  `;
  return order;
}

const CHANNELS: OrderChannel[] = ["chatgpt", "gemini", "copilot", "human"];

function asChannel(raw: string | null | undefined): OrderChannel | null {
  const v = String(raw || "")
    .trim()
    .toLowerCase();
  if (v === "openai" || v === "chat.openai.com" || v === "chatgpt.com") return "chatgpt";
  if (v === "google" || v === "bard") return "gemini";
  if (v === "microsoft" || v === "bing") return "copilot";
  return (CHANNELS as string[]).includes(v) ? (v as OrderChannel) : null;
}

export function detectChannel(
  req: Request,
  body?: Record<string, unknown> | null,
): OrderChannel {
  const url = new URL(req.url);
  const q =
    asChannel(url.searchParams.get("channel")) ||
    asChannel(url.searchParams.get("utm_source"));
  if (q) return q;
  const bodyCh = asChannel(
    body && typeof body.channel === "string" ? body.channel : undefined,
  );
  if (bodyCh) return bodyCh;
  const agent = (req.headers.get("ucp-agent") || req.headers.get("x-ucp-agent") || "").toLowerCase();
  if (agent.includes("chatgpt") || agent.includes("openai")) return "chatgpt";
  if (agent.includes("gemini") || agent.includes("google")) return "gemini";
  if (agent.includes("copilot") || agent.includes("microsoft")) return "copilot";
  const ref = (req.headers.get("referer") || "").toLowerCase();
  if (ref.includes("chatgpt.com") || ref.includes("chat.openai.com")) return "chatgpt";
  if (ref.includes("gemini.google.com")) return "gemini";
  if (ref.includes("copilot.microsoft.com")) return "copilot";
  return "human";
}

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, UCP-Agent, Authorization",
};

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: CORS });
}

export function corsPreflight() {
  return new Response(null, { status: 204, headers: CORS });
}
