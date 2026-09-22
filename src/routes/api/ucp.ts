import { createFileRoute } from "@tanstack/react-router";
import { buildUcpProfile } from "@/lib/store/catalog";
import { corsPreflight, json } from "@/lib/store/orders";

export const Route = createFileRoute("/api/ucp")({
  server: {
    handlers: {
      OPTIONS: async () => corsPreflight(),
      GET: async ({ request }) => json(buildUcpProfile(new URL(request.url).origin)),
    },
  },
});
