import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Report = Tables<"reports">;
export type TrapCatch = Tables<"trap_catches">;
export type ReportType = "sighting" | "nest" | "hive_damage" | "intervention";

export const TYPE_LABEL: Record<ReportType, string> = {
  sighting: "Hornet sighting",
  nest: "Nest found",
  hive_damage: "Hive damage",
  intervention: "Intervention",
};

export const INTERVENTION_LABEL: Record<string, string> = {
  trap: "Trap",
  nest_removal: "Nest removal",
  bait_station: "Bait station",
  entrance_reducer: "Entrance reducer / muzzle",
};

export const BEHAVIOUR_LABEL: Record<string, string> = {
  hawking: "Hawking at hives",
  foraging: "Foraging / flying",
  flowers: "On flowers / fruit",
};

export const MALTA_CENTER: [number, number] = [35.92, 14.4];

export const LOCALITIES: { name: string; lat: number; lng: number }[] = [
  { name: "Valletta", lat: 35.8989, lng: 14.5146 },
  { name: "Birkirkara", lat: 35.8972, lng: 14.4611 },
  { name: "Mosta", lat: 35.909, lng: 14.426 },
  { name: "Qormi", lat: 35.876, lng: 14.472 },
  { name: "Żabbar", lat: 35.876, lng: 14.538 },
  { name: "Żejtun", lat: 35.856, lng: 14.533 },
  { name: "Rabat", lat: 35.881, lng: 14.398 },
  { name: "Mdina", lat: 35.886, lng: 14.403 },
  { name: "Dingli", lat: 35.861, lng: 14.383 },
  { name: "Siġġiewi", lat: 35.855, lng: 14.437 },
  { name: "Żebbuġ", lat: 35.872, lng: 14.441 },
  { name: "Żurrieq", lat: 35.831, lng: 14.474 },
  { name: "Marsaskala", lat: 35.862, lng: 14.567 },
  { name: "Marsaxlokk", lat: 35.842, lng: 14.543 },
  { name: "Naxxar", lat: 35.913, lng: 14.444 },
  { name: "Għargħur", lat: 35.924, lng: 14.453 },
  { name: "St Paul's Bay", lat: 35.948, lng: 14.401 },
  { name: "Mellieħa", lat: 35.957, lng: 14.362 },
  { name: "Mġarr", lat: 35.919, lng: 14.366 },
  { name: "Attard", lat: 35.889, lng: 14.443 },
  { name: "Sliema", lat: 35.912, lng: 14.502 },
  { name: "Victoria (Gozo)", lat: 36.044, lng: 14.239 },
  { name: "Xagħra (Gozo)", lat: 36.05, lng: 14.265 },
  { name: "Nadur (Gozo)", lat: 36.038, lng: 14.294 },
  { name: "Xewkija (Gozo)", lat: 36.033, lng: 14.258 },
  { name: "Għarb (Gozo)", lat: 36.06, lng: 14.209 },
  { name: "Żebbuġ (Gozo)", lat: 36.072, lng: 14.236 },
];

export function nearestLocality(lat: number, lng: number) {
  let best = LOCALITIES[0]!;
  let bestD = Infinity;
  for (const l of LOCALITIES) {
    const d = (l.lat - lat) ** 2 + (l.lng - lng) ** 2;
    if (d < bestD) { bestD = d; best = l; }
  }
  return best.name;
}

export const reportsQuery = queryOptions({
  queryKey: ["reports"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("observed_on", { ascending: false })
      .limit(5000);
    if (error) throw error;
    return data as Report[];
  },
});

export const catchesQuery = queryOptions({
  queryKey: ["trap_catches"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("trap_catches")
      .select("*")
      .order("caught_on", { ascending: true })
      .limit(5000);
    if (error) throw error;
    return data as TrapCatch[];
  },
});

export async function openPhoto(path: string) {
  const { data, error } = await supabase.storage.from("report-photos").createSignedUrl(path, 600);
  if (error || !data) throw error ?? new Error("Photo unavailable");
  window.open(data.signedUrl, "_blank", "noopener");
}

export function reportsToCsv(rows: Report[]): string {
  const cols: (keyof Report)[] = [
    "id", "type", "observed_on", "locality", "lat", "lng", "hornet_count", "behaviour",
    "nest_status", "hives_total", "hives_lost", "intervention_type", "notes", "is_demo", "flag_count",
  ];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
