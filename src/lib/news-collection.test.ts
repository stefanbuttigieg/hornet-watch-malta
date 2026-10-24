import { describe, expect, it, vi } from "vitest";
import { collectNews } from "./news-collection";

const rss = (title: string) => `<rss><item><title>${title}</title><link>https://news.test/${encodeURIComponent(title)}</link><pubDate>Wed, 21 Oct 2026 12:00:00 GMT</pubDate><source>Malta news</source></item></rss>`;
const options = () => ({ knownTitles: [], signal: new AbortController().signal });

describe("news collection", () => {
  it("starts searches together and saves the government plan before a slow feed finishes", async () => {
    let finishSlow: ((response: Response) => void) | undefined;
    const slow = new Promise<Response>((resolve) => { finishSlow = resolve; });
    const save = vi.fn(async () => {});
    const fetchFeed = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(rss("Malta announces €1 million Oriental Hornet plan")))
      .mockReturnValueOnce(slow);
    const pending = collectNews({ ...options(), queries: ["fast", "slow"], save, fetchFeed });
    await vi.waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(fetchFeed).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[0]?.[0]?.[0]?.title).toBe("Malta announces €1 million Oriental Hornet plan");
    finishSlow?.(new Response(rss("Other hornet story")));
    expect((await pending).added).toBe(2);
  });

  it("keeps successful results when another source times out", async () => {
    const save = vi.fn(async () => {});
    const fetchFeed: typeof fetch = async (input, init) => {
      if (String(input).includes("good")) return new Response(rss("Government hornet control package"));
      return new Promise((_, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("feed timed out")), { once: true });
      });
    };
    const result = await collectNews({ ...options(), queries: ["good", "slow"], save, fetchFeed, feedTimeoutMs: 25 });
    expect(result.added).toBe(1);
    expect(result.completed).toBe(1);
    expect(result.errors).toEqual(["slow: feed timed out"]);
  });

  it("does not save duplicate titles across concurrent feeds or existing headlines", async () => {
    const save = vi.fn(async () => {});
    const fetchFeed: typeof fetch = async () => new Response(rss("New hornet plan") + rss("Existing hornet story"));
    const result = await collectNews({ ...options(), knownTitles: ["EXISTING HORNET STORY"], queries: ["one", "two"], save, fetchFeed });
    expect(result.added).toBe(1);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("reports storage failures instead of reporting an unsuccessful save as added", async () => {
    const fetchFeed: typeof fetch = async () => new Response(rss("New hornet plan"));
    const result = await collectNews({ ...options(), queries: ["one"], fetchFeed, save: async () => { throw new Error("storage unavailable"); } });
    expect(result.added).toBe(0);
    expect(result.completed).toBe(0);
    expect(result.errors).toEqual(["one: storage unavailable"]);
  });
});