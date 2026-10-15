// Browser-only: imports Leaflet. Load via React.lazy behind <ClientOnly>.
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMapEvents, Marker } from "react-leaflet";
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
      {reports.map((r) => (
        <CircleMarker
          key={r.id}
          center={[r.lat, r.lng]}
          radius={radiusFor(r, heat)}
          pathOptions={{
            color: heat ? COLOR_VAR[r.type] : "var(--card)",
            weight: heat ? 0 : 2,
            fillColor: COLOR_VAR[r.type],
            fillOpacity: heat ? 0.18 : 0.9,
          }}
        >
          <Popup>
            <ReportPopup r={r} />
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

function ReportPopup({ r }: { r: Report }) {
  return (
    <div className="space-y-1 text-sm">
      <div className="font-semibold">{TYPE_LABEL[r.type as keyof typeof TYPE_LABEL]}</div>
      <div className="text-muted-foreground">{r.locality ?? "Malta"} · {r.observed_on}</div>
      {r.hornet_count != null && <div>Hornets seen: {r.hornet_count}</div>}
      {r.behaviour && <div>{BEHAVIOUR_LABEL[r.behaviour] ?? r.behaviour}</div>}
      {r.nest_status && <div>Nest: {r.nest_status}</div>}
      {r.hives_lost != null && <div>Hives lost/weakened: {r.hives_lost}{r.hives_total ? ` of ${r.hives_total}` : ""}</div>}
      {r.intervention_type && <div>{INTERVENTION_LABEL[r.intervention_type] ?? r.intervention_type} (from {r.observed_on})</div>}
      {r.notes && <div className="italic">“{r.notes}”</div>}
      {r.is_demo && <div className="text-xs text-muted-foreground">Demo data</div>}
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
