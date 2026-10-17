import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function checkPasscode(passcode: string) {
  const expected = process.env["MODERATOR_PASSCODE"];
  if (!expected || passcode !== expected) throw new Error("Wrong passcode");
}

export const listForModeration = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ passcode: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    checkPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("reports")
      .select("id,type,observed_on,locality,notes,flag_count,hidden,is_demo,created_at,pending_review,review_reason,hornet_count,hives_lost,hives_total,lat,lng")
      .order("pending_review", { ascending: false })
      .order("flag_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const ids = (rows ?? []).map((r) => r.id);
    const { data: contacts } = ids.length
      ? await supabaseAdmin.from("report_contacts").select("report_id,email").in("report_id", ids)
      : { data: [] as { report_id: string; email: string }[] };
    const byId = new Map((contacts ?? []).map((c) => [c.report_id, c.email]));
    return (rows ?? []).map((r) => ({ ...r, contact_email: byId.get(r.id) ?? null }));
  });

export const setReportHidden = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ passcode: z.string().min(1).max(200), id: z.string().uuid(), hidden: z.boolean() }).parse(d),
  )
  .handler(async ({ data }) => {
    checkPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reports").update({ hidden: data.hidden }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const hideDemoData = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ passcode: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    checkPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reports").update({ hidden: true }).eq("is_demo", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateReport = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      passcode: z.string().min(1).max(200),
      id: z.string().uuid(),
      lat: z.number().min(35.78).max(36.1),
      lng: z.number().min(14.15).max(14.6),
      locality: z.string().max(100).nullable(),
      notes: z.string().max(1000).nullable(),
      hornet_count: z.number().int().min(0).max(100000).nullable(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    checkPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { passcode: _p, id, ...patch } = data;
    const { error } = await supabaseAdmin.from("reports").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const approveReport = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ passcode: z.string().min(1).max(200), id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    checkPasscode(data.passcode);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reports").update({ pending_review: false, review_reason: null }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
