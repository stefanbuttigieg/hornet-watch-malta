CREATE TABLE public.report_submissions (
  id bigserial PRIMARY KEY,
  submitter_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.report_submissions TO service_role;
ALTER TABLE public.report_submissions ENABLE ROW LEVEL SECURITY;
CREATE INDEX report_submissions_hash_idx ON public.report_submissions (submitter_hash, created_at DESC);

CREATE OR REPLACE FUNCTION public.enforce_report_rate_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  h json;
  ip text;
  hashed text;
  recent int;
BEGIN
  BEGIN
    h := current_setting('request.headers', true)::json;
  EXCEPTION WHEN others THEN h := NULL;
  END;
  IF h IS NULL THEN RETURN NEW; END IF;
  ip := coalesce(h->>'cf-connecting-ip', h->>'x-real-ip', split_part(h->>'x-forwarded-for', ',', 1));
  IF ip IS NULL OR btrim(ip) = '' THEN RETURN NEW; END IF;
  hashed := encode(extensions.digest('hornet-watch:' || btrim(ip), 'sha256'), 'hex');
  SELECT count(*) INTO recent FROM public.report_submissions
    WHERE submitter_hash = hashed AND created_at > now() - interval '1 hour';
  IF recent >= 5 THEN
    RAISE EXCEPTION 'RATE_LIMIT: You can send up to 5 reports an hour. Please try again later.' USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO public.report_submissions (submitter_hash) VALUES (hashed);
  DELETE FROM public.report_submissions WHERE created_at < now() - interval '2 days';
  RETURN NEW;
END $$;

CREATE TRIGGER reports_rate_limit BEFORE INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.enforce_report_rate_limit();