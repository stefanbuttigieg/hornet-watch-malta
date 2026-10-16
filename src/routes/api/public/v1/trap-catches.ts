import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/v1/trap-catches")({
  server: {
    handlers: {
      OPTIONS: async () => {
        const { CORS } = await import("@/lib/public-api.server");
        return new Response(null, { status: 204, headers: CORS });
      },
      GET: async ({ request }) => {
        const { json, parseQuery, publicClient } = await import("@/lib/public-api.server");
        const p = parseQuery(new URL(request.url));
        if ("error" in p) return json({ error: p.error }, 400);
        let q = publicClient()
          .from("trap_catches")
          .select("id,report_id,caught_on,count")
          .order("caught_on", { ascending: true })
          .limit(p.limit);
        if (p.since) q = q.gte("caught_on", p.since);
        if (p.until) q = q.lte("caught_on", p.until);
        const { data, error } = await q;
        if (error) {
          console.error("api catches", error);
          return json({ error: "Service unavailable" }, 503);
        }
        return json({ count: data.length, data });
      },
    },
  },
});
