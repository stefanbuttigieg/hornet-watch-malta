ALTER TABLE public.reports ADD COLUMN confirm_count integer NOT NULL DEFAULT 0;
CREATE OR REPLACE FUNCTION public.confirm_report(_id uuid)
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $$ UPDATE public.reports SET confirm_count = confirm_count + 1 WHERE id = _id AND hidden = false RETURNING confirm_count; $$;
GRANT EXECUTE ON FUNCTION public.confirm_report(uuid) TO anon, authenticated;
DROP POLICY IF EXISTS "public insert" ON public.reports;
CREATE POLICY "public insert" ON public.reports FOR INSERT TO anon, authenticated
WITH CHECK (hidden = false AND flag_count = 0 AND is_demo = false AND confirm_count = 0);