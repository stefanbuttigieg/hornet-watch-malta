import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { listForModeration, setReportHidden, hideDemoData, approveReport, updateReport } from "@/lib/moderation.functions";
import { TYPE_LABEL, LOCALITIES, nearestLocality } from "@/lib/reports";
import { LazyMap } from "@/components/LazyMap";

export const Route = createFileRoute("/moderate")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://hornetwatchmalta.live/moderate" }],
    meta: [
      { property: "og:url", content: "https://hornetwatchmalta.live/moderate" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
      { title: "Moderation — Hornet Watch Malta" },
      { name: "description", content: "Moderator tools for reviewing flagged hornet reports." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Moderation — Hornet Watch Malta" },
      { property: "og:description", content: "Moderator tools for reviewing flagged hornet reports." },
    ],
  }),
  component: Moderate,
});

type Row = Awaited<ReturnType<typeof listForModeration>>[number];

function Moderate() {
  const list = useServerFn(listForModeration);
  const setHidden = useServerFn(setReportHidden);
  const hideDemo = useServerFn(hideDemoData);
  const approve = useServerFn(approveReport);
  const [pass, setPass] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);

  const load = async () => {
    try { setRows(await list({ data: { passcode: pass } })); }
    catch { toast.error("Wrong passcode"); }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-4 px-4 py-8">
        <h1 className="text-3xl font-bold">Moderation</h1>
        {!rows ? (
          <form onSubmit={(e) => { e.preventDefault(); load(); }} className="flex gap-2">
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Moderator passcode" className="flex-1 rounded-lg border bg-card px-3 py-3" />
            <button className="rounded-lg bg-primary px-4 font-semibold text-primary-foreground">Open</button>
          </form>
        ) : (
          <>
            <button
              onClick={async () => { await hideDemo({ data: { passcode: pass } }); toast.success("Demo data hidden"); load(); }}
              className="rounded-lg border px-3 py-2 text-sm">Hide all demo data</button>
            <ul className="divide-y rounded-xl border bg-card">
              {rows.map((r) => (
                <li key={r.id} className="p-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-medium">{TYPE_LABEL[r.type as keyof typeof TYPE_LABEL]} · {r.locality ?? "—"} · {r.observed_on}</div>
                    <div className="text-muted-foreground">{r.notes ?? ""} {r.is_demo ? "(demo)" : ""}</div>
                    {(r.hornet_count != null || r.hives_lost != null) && (
                      <div className="text-muted-foreground">
                        {r.hornet_count != null && `${r.hornet_count} hornets `}
                        {r.hives_lost != null && `${r.hives_lost}/${r.hives_total ?? "?"} hives lost`}
                      </div>
                    )}
                    {r.pending_review && <div className="font-medium text-primary">Held for review: {r.review_reason}</div>}
                  </div>
                  {r.flag_count > 0 && <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">{r.flag_count} flags</span>}
                  {r.pending_review && (
                    <button
                      onClick={async () => { await approve({ data: { passcode: pass, id: r.id } }); toast.success("Report published"); load(); }}
                      className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground">Approve</button>
                  )}
                  <button onClick={() => setEditing(editing === r.id ? null : r.id)} className="rounded-lg border px-3 py-1.5">
                    {editing === r.id ? "Close" : "Edit"}</button>
                  <button
                    onClick={async () => { await setHidden({ data: { passcode: pass, id: r.id, hidden: !r.hidden } }); load(); }}
                    className="rounded-lg border px-3 py-1.5">{r.hidden ? "Restore" : "Hide"}</button>
                </div>
                {editing === r.id && <EditReport row={r} passcode={pass} onDone={() => { setEditing(null); load(); }} />}
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

function EditReport({ row, passcode, onDone }: { row: Row; passcode: string; onDone: () => void }) {
  const save = useServerFn(updateReport);
  const [pos, setPos] = useState({ lat: row.lat, lng: row.lng });
  const [locality, setLocality] = useState(row.locality ?? "");
  const [notes, setNotes] = useState(row.notes ?? "");
  const [count, setCount] = useState(row.hornet_count?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const cls = "w-full rounded-lg border bg-background px-3 py-2";
  const pick = (lat: number, lng: number) => {
    if (lat < 35.78 || lat > 36.1 || lng < 14.15 || lng > 14.6) { toast.error("Pick a spot in Malta or Gozo"); return; }
    setPos({ lat, lng }); setLocality(nearestLocality(lat, lng));
  };
  return (
    <div className="mt-3 space-y-3 rounded-lg border bg-background/50 p-3">
      <p className="text-muted-foreground">Tap the map to move the pin (e.g. if it was dropped in the sea).</p>
      <div className="h-64 overflow-hidden rounded-lg border"><LazyMap picked={pos} onPick={pick} /></div>
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1"><span>Locality</span>
          <select value={locality} onChange={(e) => setLocality(e.target.value)} className={cls}>
            <option value="">—</option>
            {LOCALITIES.map((l) => <option key={l.name}>{l.name}</option>)}
          </select>
        </label>
        {row.type === "sighting" && (
          <label className="space-y-1"><span>Hornets</span>
            <input type="number" min={0} value={count} onChange={(e) => setCount(e.target.value)} className={cls} />
          </label>
        )}
      </div>
      <label className="block space-y-1"><span>Notes</span>
        <textarea rows={2} maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} className={cls} />
      </label>
      <button disabled={busy} className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
        onClick={async () => {
          setBusy(true);
          try {
            await save({ data: { passcode, id: row.id, lat: pos.lat, lng: pos.lng, locality: locality || null,
              notes: notes.trim() || null, hornet_count: count === "" ? null : Math.max(0, Math.round(Number(count))) } });
            toast.success("Report updated"); onDone();
          } catch (e) { toast.error(e instanceof Error ? e.message : "Couldn't save"); }
          finally { setBusy(false); }
        }}>{busy ? "Saving…" : "Save changes"}</button>
    </div>
  );
}
