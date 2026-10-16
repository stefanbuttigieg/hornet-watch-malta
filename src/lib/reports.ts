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

// All 68 Local Councils (54 Malta, 14 Gozo), approximate village centres.
export const LOCALITIES: { name: string; lat: number; lng: number }[] = [
  { name: "Attard", lat: 35.889, lng: 14.443 },
  { name: "Balzan", lat: 35.8975, lng: 14.4533 },
  { name: "Birgu (Vittoriosa)", lat: 35.8878, lng: 14.5225 },
  { name: "Birkirkara", lat: 35.8972, lng: 14.4611 },
  { name: "Birżebbuġa", lat: 35.8258, lng: 14.5269 },
  { name: "Bormla (Cospicua)", lat: 35.8822, lng: 14.5222 },
  { name: "Dingli", lat: 35.861, lng: 14.383 },
  { name: "Fgura", lat: 35.8725, lng: 14.5228 },
  { name: "Floriana", lat: 35.8958, lng: 14.5083 },
  { name: "Għargħur", lat: 35.924, lng: 14.453 },
  { name: "Għaxaq", lat: 35.8483, lng: 14.5172 },
  { name: "Gudja", lat: 35.8492, lng: 14.5031 },
  { name: "Gżira", lat: 35.9058, lng: 14.4881 },
  { name: "Ħamrun", lat: 35.8847, lng: 14.4844 },
  { name: "Iklin", lat: 35.9042, lng: 14.4544 },
  { name: "Isla (Senglea)", lat: 35.8875, lng: 14.5169 },
  { name: "Kalkara", lat: 35.8892, lng: 14.5294 },
  { name: "Kirkop", lat: 35.8419, lng: 14.4853 },
  { name: "Lija", lat: 35.9014, lng: 14.4472 },
  { name: "Luqa", lat: 35.8597, lng: 14.4892 },
  { name: "Marsa", lat: 35.8792, lng: 14.4953 },
  { name: "Marsaskala", lat: 35.862, lng: 14.567 },
  { name: "Marsaxlokk", lat: 35.842, lng: 14.543 },
  { name: "Mdina", lat: 35.886, lng: 14.403 },
  { name: "Mellieħa", lat: 35.957, lng: 14.362 },
  { name: "Mġarr", lat: 35.919, lng: 14.366 },
  { name: "Mosta", lat: 35.909, lng: 14.426 },
  { name: "Mqabba", lat: 35.8447, lng: 14.4683 },
  { name: "Msida", lat: 35.8958, lng: 14.4897 },
  { name: "Mtarfa", lat: 35.8889, lng: 14.3989 },
  { name: "Naxxar", lat: 35.913, lng: 14.444 },
  { name: "Paola", lat: 35.8731, lng: 14.5075 },
  { name: "Pembroke", lat: 35.9306, lng: 14.4764 },
  { name: "Pietà", lat: 35.8931, lng: 14.4939 },
  { name: "Qormi", lat: 35.876, lng: 14.472 },
  { name: "Qrendi", lat: 35.8344, lng: 14.4589 },
  { name: "Rabat", lat: 35.881, lng: 14.398 },
  { name: "Safi", lat: 35.8333, lng: 14.485 },
  { name: "San Ġiljan (St Julian's)", lat: 35.9183, lng: 14.4883 },
  { name: "San Ġwann", lat: 35.9094, lng: 14.4786 },
  { name: "St Paul's Bay", lat: 35.948, lng: 14.401 },
  { name: "Santa Luċija", lat: 35.8619, lng: 14.5072 },
  { name: "Santa Venera", lat: 35.8908, lng: 14.4778 },
  { name: "Siġġiewi", lat: 35.855, lng: 14.437 },
  { name: "Sliema", lat: 35.912, lng: 14.502 },
  { name: "Swieqi", lat: 35.9225, lng: 14.48 },
  { name: "Ta' Xbiex", lat: 35.8992, lng: 14.4944 },
  { name: "Tarxien", lat: 35.8658, lng: 14.5119 },
  { name: "Valletta", lat: 35.8989, lng: 14.5146 },
  { name: "Xgħajra", lat: 35.8864, lng: 14.5475 },
  { name: "Żabbar", lat: 35.876, lng: 14.538 },
  { name: "Żebbuġ", lat: 35.872, lng: 14.441 },
  { name: "Żejtun", lat: 35.856, lng: 14.533 },
  { name: "Żurrieq", lat: 35.831, lng: 14.474 },
  { name: "Fontana (Gozo)", lat: 36.0372, lng: 14.2361 },
  { name: "Għajnsielem (Gozo)", lat: 36.0264, lng: 14.2861 },
  { name: "Għarb (Gozo)", lat: 36.06, lng: 14.209 },
  { name: "Għasri (Gozo)", lat: 36.0583, lng: 14.2278 },
  { name: "Kerċem (Gozo)", lat: 36.0419, lng: 14.2269 },
  { name: "Munxar (Gozo)", lat: 36.0303, lng: 14.2333 },
  { name: "Nadur (Gozo)", lat: 36.038, lng: 14.294 },
  { name: "Qala (Gozo)", lat: 36.0361, lng: 14.3094 },
  { name: "Victoria (Gozo)", lat: 36.044, lng: 14.239 },
  { name: "San Lawrenz (Gozo)", lat: 36.0553, lng: 14.2036 },
  { name: "Sannat (Gozo)", lat: 36.0244, lng: 14.2425 },
  { name: "Xagħra (Gozo)", lat: 36.05, lng: 14.265 },
  { name: "Xewkija (Gozo)", lat: 36.033, lng: 14.258 },
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
    "nest_status", "hives_total", "hives_lost", "intervention_type", "notes", "is_demo", "flag_count", "confirm_count",
  ];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
