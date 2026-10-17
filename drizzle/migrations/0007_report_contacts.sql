CREATE TABLE public.report_contacts (
  report_id uuid PRIMARY KEY REFERENCES public.reports(id) ON DELETE CASCADE,
  email text NOT NULL CHECK (char_length(email) <= 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.report_contacts TO anon, authenticated;
GRANT ALL ON public.report_contacts TO service_role;
ALTER TABLE public.report_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public insert contact" ON public.report_contacts FOR INSERT TO anon, authenticated
  WITH CHECK (created_at > now() - interval '1 minute');