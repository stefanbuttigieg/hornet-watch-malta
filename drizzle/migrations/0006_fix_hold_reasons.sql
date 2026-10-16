CREATE OR REPLACE FUNCTION public.hold_suspicious_report()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  nearby int;
  reasons text[] := ARRAY[]::text[];
BEGIN
  NEW.pending_review := false;
  NEW.review_reason := NULL;
  IF coalesce(NEW.hornet_count, 0) > 50 THEN reasons := array_append(reasons, 'very high hornet count'); END IF;
  IF coalesce(NEW.hives_lost, 0) > 30 OR coalesce(NEW.hives_total, 0) > 200 THEN reasons := array_append(reasons, 'very high hive numbers'); END IF;
  IF NEW.hives_lost IS NOT NULL AND NEW.hives_total IS NOT NULL AND NEW.hives_lost > NEW.hives_total THEN
    reasons := array_append(reasons, 'more hives lost than owned');
  END IF;
  SELECT count(*) INTO nearby FROM public.reports
   WHERE created_at > now() - interval '1 hour'
     AND abs(lat - NEW.lat) < 0.0045 AND abs(lng - NEW.lng) < 0.0055;
  IF nearby >= 3 THEN reasons := array_append(reasons, 'many reports from the same spot within an hour'); END IF;
  IF coalesce(array_length(reasons, 1), 0) > 0 THEN
    NEW.pending_review := true;
    NEW.review_reason := array_to_string(reasons, ', ');
  END IF;
  RETURN NEW;
END $$;