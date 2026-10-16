import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { compareBeforeAfter, RADIUS_KM, WINDOW_DAYS, type Comparison, type Verdict } from "@/lib/effectiveness";
import { catchesQuery, reportsQuery, reportsToCsv, INTERVENTION_LABEL, type Report } from "@/lib/reports";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://hornetwatchmalta.live/dashboard" }],
    meta: [
      { property: "og:url", content: "https://hornetwatchmalta.live/dashboard" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Intervention impact — Hornet Watch Malta" },
      { name: "description", content: "See whether hornet traps, nest removals and other interventions in Malta are reducing sightings and hive losses." },
      { property: "og:title", content: "Intervention impact — Hornet Watch Malta" },
      { property: "og:description", content: "Before/after analysis, trap catch trends and locality hotspots for the oriental hornet in Malta." },
    ],
  }),
  component: Dashboard,
});

const VERDICT: Record<Verdict, { label: string; cls: string }> = {
  improving: { label: "Improving", cls: "bg-success text-ink-foreground" },
  no_change: { label: "No clear change", cls: "bg-secondary text-secondary-foreground" },
  worsening: { label: "Worsening", cls: "bg-destructive text-destructive-foreground" },
  not_enough_data: { label: "Not enough data", cls: "border border-dashed text-muted-foreground" },
};
const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function pct(c: Comparison) {
  if (c.change === null) return "—";
  const v = Math.round(c.change * 100);
  return `${v > 0 ? "+" : ""}${v}%`;
}

function Dashboard() {
  const { data: reports = [] } = useQuery(reportsQuery);
  const { data: catches = [] } = useQuery(catchesQuery);
  const today = new Date().toISOString().slice(0, 10);

  const interventions = reports.filter((r) => r.type === "intervention");
  const sightings = reports.filter((r) => r.type === "sighting").map((r) => ({ lat: r.lat, lng: r.lng, date: r.observed_on, value: r.hornet_count ?? 1 }));
  const losses = reports.filter((r) => r.type === "hive_damage").map((r) => ({ lat: r.lat, lng: r.lng, date: r.observed_on, value: r.hives_lost ?? 0 }));

  const rows = interventions.map((i) => ({
    i,
    s: compareBeforeAfter(i, i.observed_on, sightings, today),
    l: compareBeforeAfter(i, i.observed_on, losses, today),
  }));

  const traps = interventions.filter((i) => i.intervention_type === "trap");
  const chartData = useMemo(() => {
    const byDate = new Map<string, Record<string, number | string>>();
    for (const c of catches) {
      const row = byDate.get(c.caught_on) ?? { date: c.caught_on };
      const t = traps.find((x) => x.id === c.report_id);
      if (!t) continue;
      row[t.locality ?? t.id.slice(0, 6)] = c.count;
      byDate.set(c.caught_on, row);
    }
    return [...byDate.values()].sort((a, b) => String(a["date"]).localeCompare(String(b["date"])));
  }, [catches, traps]);

  const typeRanking = useMemo(() => {
    const m = new Map<string, { n: number; sum: number }>();
    for (const r of rows) {
      if (r.s.change === null) continue;
      const k = r.i.intervention_type ?? "other";
      const v = m.get(k) ?? { n: 0, sum: 0 };
      v.n++; v.sum += r.s.change;
      m.set(k, v);
    }
    return [...m.entries()].map(([k, v]) => ({ k, avg: v.sum / v.n, n: v.n })).sort((a, b) => a.avg - b.avg);
  }, [rows]);

  const localities = useMemo(() => {
    const m = new Map<string, { sightings: number; lost: number; nests: number; destroyed: number }>();
    for (const r of reports) {
      const k = r.locality ?? "Unknown";
      const v = m.get(k) ?? { sightings: 0, lost: 0, nests: 0, destroyed: 0 };
      if (r.type === "sighting") v.sightings += r.hornet_count ?? 0;
      if (r.type === "hive_damage") v.lost += r.hives_lost ?? 0;
      if (r.type === "nest") { v.nests++; if (r.nest_status === "destroyed") v.destroyed++; }
      m.set(k, v);
    }
    return [...m.entries()].sort((a, b) => b[1].sightings + b[1].lost * 5 - (a[1].sightings + a[1].lost * 5));
  }, [reports]);

  const download = () => {
    const blob = new Blob([reportsToCsv(reports)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hornet-reports-${today}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Is it working?</h1>
            <p className="text-muted-foreground">Hornet activity within {RADIUS_KM} km of each intervention, {WINDOW_DAYS} days before vs after it started.</p>
          </div>
          <button onClick={download} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-ink-foreground">Download all data (CSV)</button>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">Before / after by intervention</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {rows.length === 0 && <p className="text-muted-foreground">No interventions reported yet.</p>}
            {rows.map(({ i, s, l }) => (
              <article key={i.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{INTERVENTION_LABEL[i.intervention_type ?? ""] ?? "Intervention"} · {i.locality ?? "Malta"}</div>
                    <div className="text-sm text-muted-foreground">Started {i.observed_on}{i.is_demo ? " · demo" : ""}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${VERDICT[s.verdict].cls}`}>{VERDICT[s.verdict].label}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <Metric title="Hornets seen" c={s} />
                  <Metric title="Hives lost" c={l} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <h2 className="text-xl font-bold">Trap catches per week</h2>
            <div className="h-72 rounded-xl border bg-card p-3">
              {chartData.length ? (
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    {traps.map((t, idx) => (
                      <Line key={t.id} dataKey={t.locality ?? t.id.slice(0, 6)} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="p-4 text-muted-foreground">No catch counts logged yet.</p>}
            </div>
            <LogCatch traps={traps} />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Which methods work best</h2>
            <ol className="space-y-2">
              {typeRanking.map((t, n) => (
                <li key={t.k} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
                  <span>{n + 1}. {INTERVENTION_LABEL[t.k] ?? t.k} <span className="text-xs text-muted-foreground">({t.n})</span></span>
                  <span className={`font-semibold ${t.avg < 0 ? "text-success" : "text-destructive"}`}>{t.avg > 0 ? "+" : ""}{Math.round(t.avg * 100)}%</span>
                </li>
              ))}
              {!typeRanking.length && <p className="text-muted-foreground">Not enough data yet.</p>}
            </ol>
            <p className="text-xs text-muted-foreground">Average change in hornet sightings nearby. Negative is better.</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold">Hotspots by locality</h2>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr><th className="p-3">Locality</th><th className="p-3 text-right">Hornets seen</th><th className="p-3 text-right">Hives lost</th><th className="p-3 text-right">Nests (destroyed)</th></tr>
              </thead>
              <tbody>
                {localities.map(([k, v]) => (
                  <tr key={k} className="border-t">
                    <td className="p-3 font-medium">{k}</td>
                    <td className="p-3 text-right">{v.sightings}</td>
                    <td className="p-3 text-right">{v.lost}</td>
                    <td className="p-3 text-right">{v.nests} ({v.destroyed})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ title, c }: { title: string; c: Comparison }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="font-display text-xl font-bold">{pct(c)}</div>
      <div className="text-xs text-muted-foreground">{c.beforeTotal} before → {c.afterTotal} after</div>
    </div>
  );
}

function LogCatch({ traps }: { traps: Report[] }) {
  const qc = useQueryClient();
  const [trap, setTrap] = useState("");
  const [count, setCount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  if (!traps.length) return null;
  return (
    <form
      className="flex flex-wrap items-end gap-2 rounded-xl border bg-card p-3"
      onSubmit={async (e): Promise<void> => {
        e.preventDefault();
        const n = Math.round(Number(count));
        if (!trap || !Number.isFinite(n) || n < 0) { toast.error("Choose a trap and enter a count"); return; }
        const { error } = await supabase.from("trap_catches").insert({ report_id: trap, count: n, caught_on: date });
        if (error) { toast.error("Couldn't save"); return; }
        setCount("");
        qc.invalidateQueries({ queryKey: ["trap_catches"] });
        toast.success("Catch logged");
      }}
    >
      <span className="w-full text-sm font-semibold">Log a trap catch</span>
      <select value={trap} onChange={(e) => setTrap(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm">
        <option value="">Trap…</option>
        {traps.map((t) => <option key={t.id} value={t.id}>{t.locality ?? "Trap"} (from {t.observed_on})</option>)}
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border bg-card px-3 py-2 text-sm" />
      <input type="number" min={0} max={10000} placeholder="Hornets caught" value={count} onChange={(e) => setCount(e.target.value)} className="w-36 rounded-lg border bg-card px-3 py-2 text-sm" />
      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Save</button>
    </form>
  );
}
