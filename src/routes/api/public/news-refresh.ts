import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { collectNews } from "@/lib/news-collection";
import { isNewsRefreshTime } from "@/lib/news-schedule";

// UTC candidates cover both seasonal offsets; refresh only at 08:00/14:00 Malta.
// Only the scheduler may call it, and it refuses to run twice within 30 minutes.
async function refresh({ request }: { request: Request }) {
  const authFailure = await authenticateCronRequest(request);
  if (authFailure) return authFailure;
  if (!isNewsRefreshTime(new Date())) return Response.json({ skipped: "outside Malta news check hours" });
  // Leave time for the response before the scheduler's five-second deadline.
  const signal = AbortSignal.timeout(3500);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const runAt = new Date().toISOString();
  const cutoff = new Date(Date.now() - 30 * 60000).toISOString();
  const { data: locked, error: lockError } = await supabaseAdmin
    .from("news_refresh_state")
    .update({ last_run_at: runAt })
    .eq("id", 1)
    .lt("last_run_at", cutoff)
    .select("id")
    .abortSignal(signal);
  if (lockError) return Response.json({ error: lockError.message }, { status: 500 });
  if (!locked?.length) return Response.json({ skipped: "ran recently" }, { status: 429 });

  const releaseLock = async () => {
    await supabaseAdmin.from("news_refresh_state")
      .update({ last_run_at: new Date(Date.now() - 31 * 60000).toISOString() })
      .eq("id", 1).eq("last_run_at", runAt)
      .abortSignal(AbortSignal.timeout(400));
  };
  const { data: existing, error: readError } = await supabaseAdmin
    .from("news_articles").select("title").limit(5000).abortSignal(signal);
  if (readError) {
    await releaseLock();
    return Response.json({ error: readError.message }, { status: 500 });
  }
  const result = await collectNews({
    signal,
    knownTitles: (existing ?? []).map((item) => item.title),
    save: async (items) => {
      const { error } = await supabaseAdmin.from("news_articles")
        .upsert(items, { onConflict: "url", ignoreDuplicates: true }).abortSignal(signal);
      if (error) throw new Error(error.message);
    },
  });
  if (result.errors.length) console.warn("News refresh partial failures", result);
  if (!result.completed) await releaseLock();
  return Response.json(result, { status: result.completed ? 200 : 502 });
}

export const Route = createFileRoute("/api/public/news-refresh")({
  server: { handlers: { POST: refresh } },
});
