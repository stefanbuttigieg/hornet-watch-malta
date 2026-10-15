// Pure maths for judging whether an intervention worked. Kept free of
// database/UI code so it can be unit-tested.

export type Point = { lat: number; lng: number };

export function distanceKm(a: Point, b: Point): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const RADIUS_KM = 1.5;
export const WINDOW_DAYS = 28;
/** Change of at least this fraction counts as a real improvement/worsening. */
export const CHANGE_THRESHOLD = 0.25;
/** Fewer nearby reports than this (before + after) => not enough data. */
export const MIN_REPORTS = 4;

export type Verdict = "improving" | "no_change" | "worsening" | "not_enough_data";

export type Observation = Point & { date: string; value: number };

export type Comparison = {
  beforeTotal: number;
  afterTotal: number;
  beforeReports: number;
  afterReports: number;
  /** Per-day rate change, e.g. -0.6 = 60% fewer. null when no baseline. */
  change: number | null;
  verdict: Verdict;
};

const DAY = 86_400_000;
const toDay = (s: string) => Math.floor(Date.parse(s.slice(0, 10) + "T00:00:00Z") / DAY);

export function verdictFor(change: number | null, reports: number): Verdict {
  if (reports < MIN_REPORTS || change === null) return "not_enough_data";
  if (change <= -CHANGE_THRESHOLD) return "improving";
  if (change >= CHANGE_THRESHOLD) return "worsening";
  return "no_change";
}

/**
 * Compare observations within RADIUS_KM of `site` in the WINDOW_DAYS before
 * the start date vs the WINDOW_DAYS from the start date onward. The "after"
 * window is cut at `today` and compared as a per-day rate so recent
 * interventions are not penalised for having fewer days.
 */
export function compareBeforeAfter(
  site: Point,
  startDate: string,
  observations: Observation[],
  today: string,
): Comparison {
  const start = toDay(startDate);
  const end = Math.min(start + WINDOW_DAYS, toDay(today) + 1);
  const afterDays = Math.max(end - start, 0);
  let beforeTotal = 0, afterTotal = 0, beforeReports = 0, afterReports = 0;
  for (const o of observations) {
    if (distanceKm(site, o) > RADIUS_KM) continue;
    const d = toDay(o.date);
    if (d >= start - WINDOW_DAYS && d < start) {
      beforeTotal += o.value;
      beforeReports++;
    } else if (d >= start && d < end) {
      afterTotal += o.value;
      afterReports++;
    }
  }
  let change: number | null = null;
  if (beforeTotal > 0 && afterDays > 0) {
    const beforeRate = beforeTotal / WINDOW_DAYS;
    const afterRate = afterTotal / afterDays;
    change = afterRate / beforeRate - 1;
  }
  return {
    beforeTotal,
    afterTotal,
    beforeReports,
    afterReports,
    change,
    verdict: verdictFor(change, beforeReports + afterReports),
  };
}
