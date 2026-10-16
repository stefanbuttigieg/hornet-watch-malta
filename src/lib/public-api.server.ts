import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { ...CORS, "Cache-Control": "public, max-age=60" },
  });
}

export function publicClient() {
  const key = (process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"])!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
export const TYPES = ["sighting", "nest", "hive_damage", "intervention"] as const;

export function parseQuery(url: URL) {
  const q = url.searchParams;
  const type = q.get("type");
  const since = q.get("since");
  const until = q.get("until");
  const locality = q.get("locality");
  const limitRaw = Number(q.get("limit") ?? 1000);
  if (type && !(TYPES as readonly string[]).includes(type)) return { error: `type must be one of ${TYPES.join(", ")}` };
  if (since && !DATE.test(since)) return { error: "since must be YYYY-MM-DD" };
  if (until && !DATE.test(until)) return { error: "until must be YYYY-MM-DD" };
  if (locality && locality.length > 80) return { error: "locality too long" };
  if (!Number.isFinite(limitRaw) || limitRaw < 1) return { error: "limit must be a positive number" };
  return { type, since, until, locality, limit: Math.min(Math.floor(limitRaw), 5000) };
}
