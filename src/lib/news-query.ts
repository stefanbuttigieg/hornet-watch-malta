import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const newsQuery = queryOptions({
  queryKey: ["news"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("news_articles")
      .select("id,url,title,source,published_at")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(300);
    if (error) throw error;
    return data;
  },
  staleTime: 5 * 60000,
});

export const fmtNewsDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-MT", { day: "numeric", month: "short", year: "numeric" }) : "";
