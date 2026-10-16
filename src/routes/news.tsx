import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { fmtNewsDate, newsQuery } from "@/lib/news-query";

const URL_ = "https://hornet-watch-malta.lovable.app/news";

export const Route = createFileRoute("/news")({
  head: () => ({
    links: [{ rel: "canonical", href: URL_ }],
    meta: [
      { title: "Hornet news from Malta — Hornet Watch Malta" },
      { name: "description", content: "Daily round-up of oriental hornet news from Maltese news sites, including Fil-Qosor, Times of Malta, Malta Independent, Newsbook and TVM." },
      { property: "og:title", content: "Hornet news from Malta" },
      { property: "og:description", content: "Every oriental hornet story from Maltese news sites in 2026, checked daily." },
      { property: "og:url", content: URL_ },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  const { data = [], isLoading, error } = useQuery(newsQuery);
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="font-display text-3xl font-bold">Hornet news</h1>
        <p className="mt-2 text-muted-foreground">
          Oriental hornet stories from Maltese news sites since January 2026, checked automatically every day.
          Headlines link to the original article. Picked by keyword, so the odd unrelated story may slip in.
        </p>
        {isLoading && <p className="mt-6">Loading…</p>}
        {error && <p className="mt-6 text-destructive">Could not load news right now.</p>}
        {!isLoading && !data.length && <p className="mt-6">No stories found yet.</p>}
        <ul className="mt-6 divide-y rounded-xl border bg-card">
          {data.map((a) => (
            <li key={a.id}>
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-secondary">
                <div className="font-semibold leading-snug">{a.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {a.source ?? "News"} · {fmtNewsDate(a.published_at)}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
