import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/v1/reports")({
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
          .from("reports")
          .select("id,type,observed_on,locality,lat,lng,hornet_count,behaviour,nest_status,hives_total,hives_lost,intervention_type,notes,photo_url,confirm_count,created_at")
          .order("observed_on", { ascending: false })
          .limit(p.limit);
        if (p.type) q = q.eq("type", p.type);
        if (p.since) q = q.gte("observed_on", p.since);
        if (p.until) q = q.lte("observed_on", p.until);
        if (p.locality) q = q.eq("locality", p.locality);
        const { data, error } = await q;
        if (error) {
          console.error("api reports", error);
          return json({ error: "Service unavailable" }, 503);
        }
        // Photo paths stay private; expose only whether one exists.
        const rows = (data ?? []).map(({ photo_url, ...r }) => ({ ...r, has_photo: !!photo_url }));
        return json({ count: rows.length, data: rows });
      },
    },
  },
});
