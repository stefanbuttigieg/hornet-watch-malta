import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { isLikelyBot } from "@/lib/bot-check";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { LazyMap } from "@/components/LazyMap";
import { supabase } from "@/integrations/supabase/client";
import { distanceKm } from "@/lib/effectiveness";
import {
  TYPE_LABEL, INTERVENTION_LABEL, BEHAVIOUR_LABEL, LOCALITIES, nearestLocality, type ReportType,
} from "@/lib/reports";

export const Route = createFileRoute("/report")({
  head: () => ({
    links: [{ rel: "canonical", href: "https://hornet-watch-malta.lovable.app/report" }],
    meta: [
      { property: "og:url", content: "https://hornet-watch-malta.lovable.app/report" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Report hornet activity — Hornet Watch Malta" },
      { name: "description", content: "Log an oriental hornet sighting, nest, hive loss or intervention in under a minute." },
      { property: "og:title", content: "Report hornet activity — Hornet Watch Malta" },
      { property: "og:description", content: "Help map the oriental hornet in Malta: report sightings, nests, hive losses and interventions." },
    ],
  }),
  component: ReportPage,
});

type Field = "hornet_count" | "behaviour" | "nest_status" | "hives_total" | "hives_lost" | "intervention_type" | "notes";
const inputCls = "w-full rounded-lg border bg-card px-3 py-3 text-base";
const MALTA = { minLat: 35.78, maxLat: 36.1, minLng: 14.15, maxLng: 14.6 };

function ReportPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [type, setType] = useState<ReportType>("sighting");
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locality, setLocality] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [f, setF] = useState<Partial<Record<Field, string>>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const trapRef = useRef<HTMLInputElement>(null);
  const openedAt = useRef(Date.now());
  const set = (k: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const pick = (lat: number, lng: number) => {
    if (lat < MALTA.minLat || lat > MALTA.maxLat || lng < MALTA.minLng || lng > MALTA.maxLng) {
      toast.error("Please pick a location in Malta or Gozo");
      return undefined;
    }
    setPos({ lat, lng });
    setLocality(nearestLocality(lat, lng));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { toast.error("Location not available on this device"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => pick(p.coords.latitude, p.coords.longitude),
      () => toast.error("Couldn't get your location — tap the map instead"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const num = (k: Field) => (f[k] ? Math.max(0, Math.round(Number(f[k]))) : null);

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    // Invisible bot check: hidden field filled, or form sent faster than a person could.
    if (isLikelyBot(trapRef.current?.value ?? "", Date.now() - openedAt.current)) {
      toast.error("Something went wrong. Please wait a moment and try again.");
      return;
    }
    if (!pos) { toast.error("Tap the map or use your location first"); return; }
    if (type === "hive_damage" && num("hives_lost") === null) { toast.error("How many hives were lost or weakened?"); return; }
    if (type === "intervention" && !f.intervention_type) { toast.error("Choose the intervention type"); return; }
    setBusy(true);
    try {
      // Duplicate check: same type, same day, within 200 m
      const { data: same } = await supabase.from("reports").select("lat,lng").eq("type", type).eq("observed_on", date).limit(500);
      if (same?.some((r) => distanceKm(pos, r) < 0.2) &&
          !window.confirm("A similar report was already made nearby today. Submit anyway?")) {
        setBusy(false);
        return;
      }
      let photo_url: string | null = null;
      if (photo) {
        if (photo.size > 5 * 1024 * 1024) throw new Error("Photo must be under 5 MB");
        const ext = photo.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("report-photos").upload(path, photo, { contentType: photo.type });
        if (error) throw error;
        photo_url = path;
      }
      const { error } = await supabase.from("reports").insert({
        type, lat: pos.lat, lng: pos.lng, locality: locality || null, observed_on: date,
        hornet_count: type === "sighting" ? (num("hornet_count") ?? 1) : null,
        behaviour: type === "sighting" ? f.behaviour || null : null,
        nest_status: type === "nest" ? f.nest_status || "active" : null,
        hives_total: type === "hive_damage" ? num("hives_total") : null,
        hives_lost: type === "hive_damage" ? num("hives_lost") : null,
        intervention_type: type === "intervention" ? (f.intervention_type ?? null) : null,
        notes: f.notes?.trim().slice(0, 1000) || null,
        photo_url,
      });
      if (error) throw new Error(error.message.replace(/^RATE_LIMIT:\s*/, ""));
      await qc.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Thank you — report added to the map");
      nav({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the report");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <h1 className="text-3xl font-bold">Report hornet activity</h1>
        {/* Bot trap: hidden from people and screen readers; bots tend to fill every field. */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
          <label>Website<input ref={trapRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
        </div>

        <fieldset className="grid grid-cols-2 gap-2">
          {(Object.keys(TYPE_LABEL) as ReportType[]).map((t) => (
            <button type="button" key={t} onClick={() => setType(t)}
              className={`rounded-xl border-2 px-3 py-4 text-left font-semibold ${type === t ? "border-primary bg-accent" : "bg-card"}`}>
              {TYPE_LABEL[t]}
            </button>
          ))}
        </fieldset>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Where?</span>
            <button type="button" onClick={useMyLocation} className="rounded-lg bg-ink px-3 py-2 text-sm text-ink-foreground">
              📍 Use my location
            </button>
          </div>
          <div className="h-72 overflow-hidden rounded-xl border">
            <LazyMap picked={pos} onPick={pick} />
          </div>
          <p className="text-sm text-muted-foreground">{pos ? `Pinned near ${locality}` : "Tap the map to drop a pin."}</p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1"><span className="text-sm font-medium">Date</span>
            <input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
          </label>
          <label className="space-y-1"><span className="text-sm font-medium">Locality</span>
            <select value={locality} onChange={(e) => setLocality(e.target.value)} className={inputCls}>
              <option value="">—</option>
              {LOCALITIES.map((l) => <option key={l.name}>{l.name}</option>)}
            </select>
          </label>
        </div>

        {type === "sighting" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1"><span className="text-sm font-medium">How many hornets?</span>
              <input type="number" min={1} max={10000} inputMode="numeric" value={f.hornet_count ?? ""} onChange={set("hornet_count")} className={inputCls} placeholder="1" />
            </label>
            <label className="space-y-1"><span className="text-sm font-medium">What were they doing?</span>
              <select value={f.behaviour ?? ""} onChange={set("behaviour")} className={inputCls}>
                <option value="">—</option>
                {Object.entries(BEHAVIOUR_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          </div>
        )}
        {type === "nest" && (
          <label className="block space-y-1"><span className="text-sm font-medium">Nest status</span>
            <select value={f.nest_status ?? "active"} onChange={set("nest_status")} className={inputCls}>
              <option value="active">Active</option><option value="destroyed">Destroyed</option><option value="unknown">Unknown</option>
            </select>
          </label>
        )}
        {type === "hive_damage" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1"><span className="text-sm font-medium">Hives in apiary</span>
              <input type="number" min={0} max={5000} inputMode="numeric" value={f.hives_total ?? ""} onChange={set("hives_total")} className={inputCls} />
            </label>
            <label className="space-y-1"><span className="text-sm font-medium">Lost or weakened</span>
              <input type="number" min={0} max={5000} inputMode="numeric" value={f.hives_lost ?? ""} onChange={set("hives_lost")} className={inputCls} required />
            </label>
          </div>
        )}
        {type === "intervention" && (
          <label className="block space-y-1"><span className="text-sm font-medium">Type (date above = start date)</span>
            <select value={f.intervention_type ?? ""} onChange={set("intervention_type")} className={inputCls} required>
              <option value="">Choose…</option>
              {Object.entries(INTERVENTION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        )}

        <label className="block space-y-1"><span className="text-sm font-medium">Photo (recommended)</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment"
            onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className={inputCls} />
        </label>
        <label className="block space-y-1"><span className="text-sm font-medium">Notes</span>
          <textarea maxLength={1000} rows={3} value={f.notes ?? ""} onChange={set("notes")} className={inputCls} />
        </label>

        <button disabled={busy} className="w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground disabled:opacity-60">
          {busy ? "Saving…" : "Submit report"}
        </button>
      </form>
    </div>
  );
}
