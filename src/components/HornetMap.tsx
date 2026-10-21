// Browser-only: imports Leaflet. Load via React.lazy behind <ClientOnly>.
import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMapEvents, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { Report } from "@/lib/reports";
import { TYPE_LABEL, INTERVENTION_LABEL, BEHAVIOUR_LABEL, MALTA_CENTER, openPhoto } from "@/lib/reports";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const COLOR_VAR: Record<string, string> = {
  sighting: "var(--sighting)",
  nest: "var(--nest)",
  hive_damage: "var(--damage)",
  intervention: "var(--intervention)",
};

const pinIcon = L.divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:var(--ink);border:3px solid var(--primary)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function ClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function radiusFor(r: Report, heat: boolean) {
  if (heat) {
    const v = r.type === "sighting" ? (r.hornet_count ?? 1) : r.type === "hive_damage" ? (r.hives_lost ?? 0) * 3 : 4;
    return 10 + Math.min(v, 20) * 2;
  }
  return r.type === "intervention" ? 9 : 7;
}

export default function HornetMap({
  reports = [],
  heat = false,
  picked,
  onPick,
  height = "100%",
}: {
  reports?: Report[];
  heat?: boolean;
  picked?: { lat: number; lng: number } | null;
  onPick?: (lat: number, lng: number) => void;
  height?: string;
}) {
  return (
    <MapContainer center={picked ? [picked.lat, picked.lng] : MALTA_CENTER} zoom={picked ? 14 : 11} style={{ height, width: "100%" }} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onPick && <ClickCatcher onPick={onPick} />}
      {picked && <Marker position={[picked.lat, picked.lng]} icon={pinIcon} />}
      {reports.map((r) =>
        r.type === "intervention" && !heat ? (
          <Circle key={r.id + "-zone"} center={[r.lat, r.lng]} radius={1500}
            pathOptions={{ color: COLOR_VAR["intervention"], weight: 1, fillOpacity: 0.04, dashArray: "4 6" }} />
        ) : null,
      )}
      {reports.map((r) => <ReportMarker key={r.id} r={r} heat={heat} />)}
    </MapContainer>
  );
}

const urlCache = new Map<string, Promise<string | null>>();
function signedUrl(path: string) {
  let p = urlCache.get(path);
  if (!p) {
    p = supabase.storage.from("report-photos").createSignedUrl(path, 3600)
      .then(({ data }) => data?.signedUrl ?? null, () => null);
    urlCache.set(path, p);
  }
  return p;
}

function PhotoThumb({ path, size }: { path: string; size: number }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { let on = true; signedUrl(path).then((u) => on && setUrl(u)); return () => { on = false; }; }, [path]);
  if (!url) return <div style={{ width: size, height: size * 0.75 }} className="flex items-center justify-center text-xs text-muted-foreground">Loading photo…</div>;
  return <img src={url} alt="Reported photo" style={{ width: size, height: size * 0.75, objectFit: "cover", borderRadius: 6, display: "block" }} />;
}

function ReportPopup({ r }: { r: Report }) {
  return (
    <div className="space-y-1 text-sm">
      {r.photo_url && (
        <button onClick={() => openPhoto(r.photo_url!).catch(() => toast.error("Photo unavailable"))} aria-label="Open full photo">
          <PhotoThumb path={r.photo_url} size={200} />
        </button>
      )}
      <div className="font-semibold">{TYPE_LABEL[r.type as keyof typeof TYPE_LABEL]}</div>
      <div className="text-muted-foreground">{r.locality ?? "Malta"} · {r.observed_on}</div>
      {r.hornet_count != null && <div>Hornets seen: {r.hornet_count}</div>}
      {r.behaviour && <div>{BEHAVIOUR_LABEL[r.behaviour] ?? r.behaviour}</div>}
      {r.nest_status && <div>Nest: {r.nest_status}</div>}
      {r.hives_lost != null && <div>Hives lost/weakened: {r.hives_lost}{r.hives_total ? ` of ${r.hives_total}` : ""}</div>}
      {r.intervention_type && <div>{INTERVENTION_LABEL[r.intervention_type] ?? r.intervention_type} (from {r.observed_on})</div>}
      {r.notes && <div className="italic">“{r.notes}”</div>}
      {r.is_demo && <div className="text-xs text-muted-foreground">Demo data</div>}
      <ConfirmButton r={r} />
      <div className="flex gap-3 pt-1">
        {r.photo_url && (
          <button className="underline" onClick={() => openPhoto(r.photo_url!).catch(() => toast.error("Photo unavailable"))}>
            View photo
          </button>
        )}
        <button
          className="text-destructive underline"
          onClick={async () => {
            const { error } = await supabase.rpc("flag_report", { _id: r.id });
            if (error) toast.error("Couldn't flag"); else toast.success("Thanks — a moderator will review it");
          }}
        >
          Flag as wrong
        </button>
      </div>
    </div>
  );
}

function ConfirmButton({ r }: { r: Report }) {
  const key = `confirmed:${r.id}`;
  const [count, setCount] = useState(r.confirm_count ?? 0);
  const [done, setDone] = useState(false);
  useEffect(() => { setDone(localStorage.getItem(key) === "1"); }, [key]);
  return (
    <div className="flex items-center gap-2 pt-1">
      <button
        disabled={done}
        className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        onClick={async () => {
          const { data, error } = await supabase.rpc("confirm_report", { _id: r.id });
          if (error) { toast.error("Couldn't confirm"); return; }
          localStorage.setItem(key, "1");
          setDone(true);
          setCount(typeof data === "number" ? data : count + 1);
          toast.success("Thanks for confirming");
        }}
      >
        {done ? "✓ You confirmed" : "I saw this too"}
      </button>
      {count > 0 && <span className="text-xs text-muted-foreground">Confirmed by {count}</span>}
    </div>
  );
}
