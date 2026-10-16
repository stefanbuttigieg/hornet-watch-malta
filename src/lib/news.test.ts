import { describe, expect, it } from "vitest";
import { parseNewsRss } from "./news";

const item = (title: string, date: string) =>
  `<item><title>${title} - Times of Malta</title><link>https://x.test/${encodeURIComponent(title)}</link><pubDate>${date}</pubDate><source url="https://timesofmalta.com">Times of Malta</source></item>`;

describe("parseNewsRss", () => {
  it("keeps hornet stories and strips the source suffix", () => {
    const r = parseNewsRss(`<rss>${item("Oriental hornet surge hits beekeepers", "Mon, 05 Oct 2026 10:00:00 GMT")}</rss>`);
    expect(r).toHaveLength(1);
    expect(r[0]!.title).toBe("Oriental hornet surge hits beekeepers");
    expect(r[0]!.source).toBe("Times of Malta");
  });
  it("keeps Maltese keyword żunżan", () => {
    expect(parseNewsRss(item("Il-żunżan jeqred il-ġlieli", "Mon, 05 Oct 2026 10:00:00 GMT"))).toHaveLength(1);
  });
  it("drops unrelated stories", () => {
    expect(parseNewsRss(item("Budget 2027 announced", "Mon, 05 Oct 2026 10:00:00 GMT"))).toHaveLength(0);
  });
  it("drops stories before 2026", () => {
    expect(parseNewsRss(item("Hornet seen in Mosta", "Mon, 05 Oct 2025 10:00:00 GMT"))).toHaveLength(0);
  });
});
