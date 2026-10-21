import { describe, expect, it } from "vitest";
import { isNewsRefreshTime } from "./news-schedule";

describe("Malta news schedule", () => {
  it("checks at 08:00 Malta time in summer and winter", () => {
    expect(isNewsRefreshTime(new Date("2026-10-21T06:00:00Z"))).toBe(true);
    expect(isNewsRefreshTime(new Date("2026-10-26T07:00:00Z"))).toBe(true);
    expect(isNewsRefreshTime(new Date("2026-10-21T07:00:00Z"))).toBe(false);
    expect(isNewsRefreshTime(new Date("2026-10-26T06:00:00Z"))).toBe(false);
  });
  it("checks at 14:00 Malta time in summer and winter", () => {
    expect(isNewsRefreshTime(new Date("2026-10-21T12:00:00Z"))).toBe(true);
    expect(isNewsRefreshTime(new Date("2026-10-26T13:00:00Z"))).toBe(true);
    expect(isNewsRefreshTime(new Date("2026-10-21T13:00:00Z"))).toBe(false);
    expect(isNewsRefreshTime(new Date("2026-10-26T12:00:00Z"))).toBe(false);
  });
});