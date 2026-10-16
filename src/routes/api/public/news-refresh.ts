import { createFileRoute } from "@tanstack/react-router";
import { googleNewsUrl, NEWS_QUERIES, parseNewsRss, type NewsItem } from "@/lib/news";

// Called daily by the scheduler. Only fetches public news and stores headlines,
// and refuses to run more than once every 30 minutes, so no secret is needed.
async function refresh() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const cutoff = new Date(Date.now() - 30 * 60000).toISOString();
  const { data: locked } = await supabaseAdmin
    .from("news_refresh_state")
    .update({ last_run_at: new Date().toISOString() })
    .eq("id", 1)
    .lt("last_run_at", cutoff)
    .select("id");
  if (!locked?.length) return Response.json({ skipped: "ran recently" }, { status: 429 });

  const seen = new Map<string, NewsItem>();
  const errors: string[] = [];
  for (const q of NEWS_QUERIES) {
    try {
      const res = await fetch(googleNewsUrl(q), { headers: { "User-Agent": "Mozilla/5.0 HornetWatchMalta" } });
      if (!res.ok) { errors.push(`${q}: ${res.status}`); continue; }
      for (const it of parseNewsRss(await res.text())) {
        const key = it.title.toLowerCase();
        if (!seen.has(key)) seen.set(key, it);
      }
    } catch (e) {
      errors.push(`${q}: ${(e as Error).message}`);
    }
  }
  const rows = [...seen.values()].slice(0, 500);
  // Skip headlines already stored (same title), then upsert by URL.
  const { data: existing } = await supabaseAdmin.from("news_articles").select("title").limit(5000);
  const known = new Set((existing ?? []).map((r) => r.title.toLowerCase()));
  const fresh = rows.filter((r) => !known.has(r.title.toLowerCase()));
  if (fresh.length) {
    const { error } = await supabaseAdmin.from("news_articles").upsert(fresh, { onConflict: "url", ignoreDuplicates: true });
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ found: rows.length, added: fresh.length, errors });
}

export const Route = createFileRoute("/api/public/news-refresh")({
  server: { handlers: { POST: refresh, GET: refresh } },
});
