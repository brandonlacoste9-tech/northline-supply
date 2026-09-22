import { buildUcpProfile } from "../../src/lib/store/catalog";

interface UcpEvent {
  url: URL;
  req: { method: string; headers: Headers };
}

export default async function ucpWellKnownMiddleware(
  event: UcpEvent,
  next: () => Promise<unknown>,
) {
  if (event.url.pathname !== "/.well-known/ucp") return next();
  const origin = `${event.url.protocol}//${event.url.host}`;
  return Response.json(buildUcpProfile(origin), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=60",
    },
  });
}
