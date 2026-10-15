import { describe, it, expect } from "vitest";
import { compareBeforeAfter, distanceKm, verdictFor } from "./effectiveness";

const site = { lat: 35.881, lng: 14.398 };
const near = (date: string, value: number) => ({ lat: 35.882, lng: 14.399, date, value });

describe("effectiveness rules", () => {
  it("a 25% drop counts as improving", () => {
    expect(verdictFor(-0.25, 10)).toBe("improving");
  });
  it("a 25% rise counts as worsening", () => {
    expect(verdictFor(0.25, 10)).toBe("worsening");
  });
  it("a 10% change is no change", () => {
    expect(verdictFor(-0.1, 10)).toBe("no_change");
  });
  it("fewer than 4 nearby reports is not enough data", () => {
    expect(verdictFor(-0.9, 3)).toBe("not_enough_data");
  });
  it("ignores reports further than 1.5 km away", () => {
    const far = { lat: 35.95, lng: 14.36, date: "2026-09-10", value: 100 };
    expect(distanceKm(site, far)).toBeGreaterThan(1.5);
    const r = compareBeforeAfter(site, "2026-09-15", [far], "2026-10-15");
    expect(r.beforeTotal).toBe(0);
  });
  it("compares 28 days before vs after as daily rates", () => {
    const obs = [
      near("2026-08-20", 10), near("2026-09-01", 10), // before: 20
      near("2026-09-20", 5), near("2026-10-01", 5), // after: 10
    ];
    const r = compareBeforeAfter(site, "2026-09-15", obs, "2026-12-01");
    expect(r.beforeTotal).toBe(20);
    expect(r.afterTotal).toBe(10);
    expect(r.change).toBeCloseTo(-0.5);
    expect(r.verdict).toBe("improving");
  });
});
