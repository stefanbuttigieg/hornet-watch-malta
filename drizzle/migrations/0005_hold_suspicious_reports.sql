ALTER TABLE public.reports ADD COLUMN pending_review boolean NOT NULL DEFAULT false;
ALTER TABLE public.reports ADD COLUMN review_reason text;

DROP POLICY "public read visible" ON public.reports;
CREATE POLICY "public read visible" ON public.reports FOR SELECT TO anon, authenticated
  USING (hidden = false AND pending_review = false);

DROP POLICY "public insert" ON public.reports;
CREATE POLICY "public insert" ON public.reports FOR INSERT TO anon, authenticated
  WITH CHECK (hidden = false AND flag_count = 0 AND is_demo = false AND confirm_count = 0);

CREATE OR REPLACE FUNCTION public.hold_suspicious_report()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  nearby int;
  reasons text[] := '{}';
BEGIN
  NEW.pending_review := false;
  NEW.review_reason := NULL;
  IF coalesce(NEW.hornet_count, 0) > 50 THEN reasons := reasons || 'very high hornet count'; END IF;
  IF coalesce(NEW.hives_lost, 0) > 30 OR coalesce(NEW.hives_total, 0) > 200 THEN reasons := reasons || 'very high hive numbers'; END IF;
  IF NEW.hives_lost IS NOT NULL AND NEW.hives_total IS NOT NULL AND NEW.hives_lost > NEW.hives_total THEN
    reasons := reasons || 'more hives lost than owned';
  END IF;
  -- About 500 m box around the pin, last hour
  SELECT count(*) INTO nearby FROM public.reports
   WHERE created_at > now() - interval '1 hour'
     AND abs(lat - NEW.lat) < 0.0045 AND abs(lng - NEW.lng) < 0.0055;
  IF nearby >= 3 THEN reasons := reasons || 'many reports from the same spot within an hour'; END IF;
  IF array_length(reasons, 1) > 0 THEN
    NEW.pending_review := true;
    NEW.review_reason := array_to_string(reasons, ', ');
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER reports_hold_suspicious BEFORE INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.hold_suspicious_report();

CREATE OR REPLACE FUNCTION public.confirm_report(_id uuid)
 RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path TO 'public'
AS $function$ UPDATE public.reports SET confirm_count = confirm_count + 1 WHERE id = _id AND hidden = false AND pending_review = false RETURNING confirm_count; $function$;