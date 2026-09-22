import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin.replace(/\/$/, "");
        const lastmod = "2026-09-21";
        const urls: { path: string; changefreq: string; priority: string }[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/changelog", changefreq: "monthly", priority: "0.6" },
          { path: "/policies/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/policies/refund", changefreq: "yearly", priority: "0.3" },
          { path: "/policies/shipping", changefreq: "yearly", priority: "0.3" },
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${origin}${u.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
