CREATE TABLE public.news_refresh_state (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_run_at timestamptz NOT NULL DEFAULT 'epoch'
);
GRANT ALL ON public.news_refresh_state TO service_role;
ALTER TABLE public.news_refresh_state ENABLE ROW LEVEL SECURITY;
INSERT INTO public.news_refresh_state (id) VALUES (1);