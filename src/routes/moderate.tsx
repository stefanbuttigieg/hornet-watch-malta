import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { listForModeration, setReportHidden, hideDemoData } from "@/lib/moderation.functions";
import { TYPE_LABEL } from "@/lib/reports";

export const Route = createFileRoute("/moderate")({
  head: () => ({
    meta: [
      { title: "Moderation — Dabbur Watch Malta" },
      { name: "description", content: "Moderator tools for reviewing flagged hornet reports." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Moderation — Dabbur Watch Malta" },
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
  const [pass, setPass] = useState("");
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
                <li key={r.id} className="flex items-center gap-3 p-3 text-sm">
                  <div className="flex-1">
                    <div className="font-medium">{TYPE_LABEL[r.type as keyof typeof TYPE_LABEL]} · {r.locality ?? "—"} · {r.observed_on}</div>
                    <div className="text-muted-foreground">{r.notes ?? ""} {r.is_demo ? "(demo)" : ""}</div>
                  </div>
                  {r.flag_count > 0 && <span className="rounded-full bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">{r.flag_count} flags</span>}
                  <button
                    onClick={async () => { await setHidden({ data: { passcode: pass, id: r.id, hidden: !r.hidden } }); load(); }}
                    className="rounded-lg border px-3 py-1.5">{r.hidden ? "Restore" : "Hide"}</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
