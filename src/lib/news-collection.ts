import { googleNewsUrl, NEWS_QUERIES, parseNewsRss, type NewsItem } from "./news";

type CollectionOptions = {
  knownTitles: string[];
  save: (items: NewsItem[]) => Promise<void>;
  signal: AbortSignal;
  fetchFeed?: typeof fetch;
  queries?: readonly string[];
  feedTimeoutMs?: number;
};

/** Save each feed immediately: a slow or failed source cannot discard other feeds. */
export async function collectNews({
  knownTitles, save, signal, fetchFeed = fetch,
  queries = NEWS_QUERIES, feedTimeoutMs = 2200,
}: CollectionOptions) {
  const known = new Set(knownTitles.map((title) => title.toLowerCase()));
  const seen = new Set<string>();
  const errors: string[] = [];
  let added = 0;
  let completed = 0;

  await Promise.all(queries.map(async (query) => {
    const claimed: string[] = [];
    try {
      const response = await fetchFeed(googleNewsUrl(query), {
        headers: { "User-Agent": "Mozilla/5.0 HornetWatchMalta" },
        signal: AbortSignal.any([signal, AbortSignal.timeout(feedTimeoutMs)]),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const items = parseNewsRss(await response.text());
      const fresh = items.filter((item) => {
        const key = item.title.toLowerCase();
        seen.add(key);
        if (known.has(key)) return false;
        known.add(key);
        claimed.push(key);
        return true;
      });
      if (fresh.length) await save(fresh);
      added += fresh.length;
      completed++;
    } catch (error) {
      for (const key of claimed) known.delete(key);
      errors.push(`${query}: ${error instanceof Error ? error.message : "collection failed"}`);
    }
  }));

  return { found: seen.size, added, completed, errors };
}