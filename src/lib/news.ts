// Pure helpers for the hornet news feed (no I/O), so they can be unit tested.

export type NewsItem = { url: string; title: string; source: string | null; published_at: string | null };

/** Words that mark a story as being about hornets (English + Maltese). */
export const NEWS_KEYWORDS = /hornet|wasp|vespa|żunżan|zunzan|żunżana|dbabar|dabbur/i;

/** Google News searches run on every refresh. Restricted to 2026 onwards. */
export const NEWS_QUERIES = [
  "hornet Malta",
  "oriental hornet Malta beekeepers",
  "żunżan",
  "dbabar Malta",
  "site:filqosor.com hornet",
  "site:timesofmalta.com hornet",
  "site:independent.com.mt hornet",
  "site:newsbook.com.mt hornet OR żunżan",
  "site:tvmnews.mt hornet OR żunżan",
];
export const NEWS_SINCE = "2026-01-01";

export function googleNewsUrl(q: string) {
  const query = encodeURIComponent(`${q} after:${NEWS_SINCE}`);
  return `https://news.google.com/rss/search?q=${query}&hl=en-MT&gl=MT&ceid=MT:en`;
}

const decode = (s: string) =>
  s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").trim();

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : null;
};

/** Parse an RSS feed and keep only hornet-related items from 2026 on. */
export function parseNewsRss(xml: string): NewsItem[] {
  const out: NewsItem[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const it = m[1];
    const url = tag(it, "link");
    let title = tag(it, "title");
    if (!url || !title) continue;
    const source = tag(it, "source");
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    if (!NEWS_KEYWORDS.test(title)) continue;
    const d = tag(it, "pubDate");
    const date = d ? new Date(d) : null;
    const published_at = date && !isNaN(+date) ? date.toISOString() : null;
    if (published_at && published_at < NEWS_SINCE) continue;
    out.push({ url, title, source, published_at });
  }
  return out;
}
