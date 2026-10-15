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
      .select("id,type,observed_on,locality,notes,flag_count,hidden,is_demo,created_at")
      .order("flag_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return rows;
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
