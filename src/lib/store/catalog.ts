export type OrderChannel = "chatgpt" | "gemini" | "copilot" | "human";

export interface Product {
  id: string;
  sku: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  currency: "usd";
  inventory: number;
  gtin: string;
  brand: string;
}

export const MERCHANT = {
  name: "Northline Supply",
  brand: "Northline",
  description:
    "Field goods for people who still write things down. One catalog — human storefront and agent profile.",
  policies: {
    privacy: "/policies/privacy",
    refund: "/policies/refund",
    shipping: "/policies/shipping",
  },
};

export const PRODUCTS: Product[] = [
  {
    id: "field-notebook",
    sku: "NL-NB-01",
    title: "Field notebook",
    description:
      "A5 cloth-bound notebook, 120gsm cream paper, numbered pages. Made to be thrown in a bag.",
    images: ["/products/field-notebook.svg"],
    price: 2800,
    currency: "usd",
    inventory: 48,
    gtin: "0199999000011",
    brand: "Northline",
  },
  {
    id: "camp-blanket",
    sku: "NL-BL-02",
    title: "Camp blanket",
    description:
      "Heavy wool throw, charcoal herringbone. Camp, sofa, or the back of a chair that never stays empty.",
    images: ["/products/camp-blanket.svg"],
    price: 12000,
    currency: "usd",
    inventory: 18,
    gtin: "0199999000028",
    brand: "Northline",
  },
  {
    id: "brass-lamp",
    sku: "NL-LP-03",
    title: "Brass desk lamp",
    description:
      "Weighted brass base, linen shade, dimmable LED. Built to sit on a real desk, not a render.",
    images: ["/products/brass-lamp.svg"],
    price: 8600,
    currency: "usd",
    inventory: 12,
    gtin: "0199999000035",
    brand: "Northline",
  },
  {
    id: "canvas-tote",
    sku: "NL-TT-04",
    title: "Canvas tote",
    description:
      "16oz canvas, bar-tack handles, one interior pocket. Holds a notebook, a laptop, and the day.",
    images: ["/products/canvas-tote.svg"],
    price: 4200,
    currency: "usd",
    inventory: 64,
    gtin: "0199999000042",
    brand: "Northline",
  },
];

export function getProduct(id: string): Product | null {
  const key = String(id || "").toLowerCase();
  return (
    PRODUCTS.find(
      (p) => p.id === id || p.sku.toLowerCase() === key || p.gtin === id,
    ) || null
  );
}

export function searchProducts(query?: string): Product[] {
  const q = String(query || "")
    .trim()
    .toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter((p) =>
    [p.title, p.description, p.brand, p.sku, p.id].join(" ").toLowerCase().includes(q),
  );
}

export function formatMoney(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export const UCP_VERSION = "2026-01-23";

export function buildUcpProfile(origin: string) {
  const base = origin.replace(/\/$/, "");
  return {
    ucp: {
      version: UCP_VERSION,
      services: {
        "dev.ucp.shopping": [
          {
            version: UCP_VERSION,
            spec: "https://ucp.dev/specification/overview",
            transport: "rest",
            endpoint: `${base}/ucp/v1`,
            schema: `https://ucp.dev/${UCP_VERSION}/services/shopping/openapi.json`,
          },
          {
            version: UCP_VERSION,
            spec: "https://ucp.dev/specification/overview",
            transport: "mcp",
            endpoint: `${base}/api/mcp`,
            schema: `https://ucp.dev/${UCP_VERSION}/services/shopping/mcp.json`,
          },
        ],
      },
      capabilities: {
        "dev.ucp.shopping.checkout": [
          {
            version: UCP_VERSION,
            spec: "https://ucp.dev/specification/checkout",
            schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/checkout.json`,
          },
        ],
        "dev.ucp.shopping.order": [
          {
            version: UCP_VERSION,
            spec: "https://ucp.dev/specification/order",
            schema: `https://ucp.dev/${UCP_VERSION}/schemas/shopping/order.json`,
          },
        ],
      },
      payment_handlers: {
        "com.stripe": [
          {
            id: "stripe",
            version: UCP_VERSION,
            spec: "https://docs.stripe.com/agentic-commerce",
            schema: "https://docs.stripe.com/agentic-commerce/schema.json",
            config: {
              environment: "sandbox",
              checkout: `${base}/api/checkout`,
              acp_checkout_sessions: `${base}/api/acp/checkout-sessions`,
            },
          },
        ],
      },
    },
    merchant: MERCHANT,
    products: PRODUCTS.map((p) => ({
      id: p.id,
      sku: p.sku,
      title: p.title,
      description: p.description,
      price: p.price,
      currency: p.currency,
      display_price: formatMoney(p.price, p.currency),
      inventory: p.inventory,
      gtin: p.gtin,
      brand: p.brand,
      images: p.images.map((src) => (src.startsWith("http") ? src : base + src)),
      url: `${base}/?sku=${p.id}`,
      checkout: `${base}/api/checkout?sku=${encodeURIComponent(p.sku)}`,
    })),
    checkout: {
      rest: `${base}/api/checkout`,
      acp: `${base}/api/acp/checkout-sessions`,
      mcp: `${base}/api/mcp`,
    },
  };
}
