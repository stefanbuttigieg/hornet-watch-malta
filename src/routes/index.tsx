import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { LazyMap } from "@/components/LazyMap";
import { reportsQuery, TYPE_LABEL, type ReportType } from "@/lib/reports";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dabbur Watch Malta — Oriental hornet live map" },
      { name: "description", content: "Report and track oriental hornet sightings, nests, hive losses and interventions across Malta and Gozo." },
      { property: "og:title", content: "Dabbur Watch Malta — Oriental hornet live map" },
      { property: "og:description", content: "A shared map for beekeepers and policy makers fighting the oriental hornet in Malta." },
    ],
  }),
  component: MapPage,
});

const TYPES: ReportType[] = ["sighting", "nest", "hive_damage", "intervention"];
const DOT: Record<ReportType, string> = {
  sighting: "bg-sighting", nest: "bg-nest", hive_damage: "bg-damage", intervention: "bg-intervention",
};
const RANGES = [{ d: 7, l: "7 days" }, { d: 30, l: "30 days" }, { d: 90, l: "90 days" }, { d: 3650, l: "All" }];

function MapPage() {
  const { data = [], isLoading } = useQuery(reportsQuery);
  const [active, setActive] = useState<Set<ReportType>>(new Set(TYPES));
  const [days, setDays] = useState(90);
  const [heat, setHeat] = useState(false);

  const filtered = useMemo(() => {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    return data.filter((r) => active.has(r.type as ReportType) && r.observed_on >= cutoff);
  }, [data, active, days]);

  const counts = useMemo(() => {
    const c = { sightings: 0, nests: 0, lost: 0 };
    for (const r of filtered) {
      if (r.type === "sighting") c.sightings += r.hornet_count ?? 0;
      if (r.type === "nest" && r.nest_status === "active") c.nests++;
      if (r.type === "hive_damage") c.lost += r.hives_lost ?? 0;
    }
    return c;
  }, [filtered]);

  const toggle = (t: ReportType) => {
    const n = new Set(active);
    n.has(t) ? n.delete(t) : n.add(t);
    setActive(n);
  };

  return (
    <div className="flex h-[100dvh] flex-col">
      <SiteHeader />
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2">
          {TYPES.map((t) => (
            <button key={t} onClick={() => toggle(t)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${active.has(t) ? "bg-secondary" : "opacity-50"}`}>
              <span className={`h-3 w-3 rounded-full ${DOT[t]}`} />{TYPE_LABEL[t]}
            </button>
          ))}
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-full border bg-card px-3 py-1.5 text-sm" aria-label="Date range">
            {RANGES.map((r) => <option key={r.d} value={r.d}>{r.l}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={heat} onChange={(e) => setHeat(e.target.checked)} className="accent-primary" />
            Hotspots
          </label>
        </div>
      </div>
      <div className="relative flex-1">
        <LazyMap reports={filtered} heat={heat} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] p-3">
          <div className="pointer-events-auto mx-auto grid max-w-xl grid-cols-3 gap-2 rounded-xl bg-ink p-3 text-ink-foreground shadow-lg">
            <Stat n={counts.sightings} l="hornets seen" />
            <Stat n={counts.nests} l="active nests" />
            <Stat n={counts.lost} l="hives lost" />
          </div>
          {!isLoading && data.some((r) => r.is_demo) && (
            <p className="mt-2 text-center text-xs text-muted-foreground">Includes demo data for illustration.</p>
          )}
        </div>
        <Link to="/report" className="absolute right-3 top-3 z-[500] rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg">
          + Report
        </Link>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl font-bold text-primary">{n}</div>
      <div className="text-xs opacity-80">{l}</div>
    </div>
  );
}
