-- 1. Master questions: ordering, enable/disable, auto ids
ALTER TABLE public.questions_public
  ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_enabled boolean NOT NULL DEFAULT true;

UPDATE public.questions_public SET order_index = id WHERE order_index = 0;

CREATE SEQUENCE IF NOT EXISTS public.questions_public_id_seq OWNED BY public.questions_public.id;
SELECT setval('public.questions_public_id_seq', COALESCE((SELECT MAX(id) FROM public.questions_public), 0) + 1, false);
ALTER TABLE public.questions_public ALTER COLUMN id SET DEFAULT nextval('public.questions_public_id_seq');

-- allow deleting a master question without orphaning its key
ALTER TABLE public.question_keys_private
  DROP CONSTRAINT IF EXISTS question_keys_private_question_id_fkey;
ALTER TABLE public.question_keys_private
  ADD CONSTRAINT question_keys_private_question_id_fkey
  FOREIGN KEY (question_id) REFERENCES public.questions_public(id) ON DELETE CASCADE;

-- 2. Per-session question snapshot (public part)
CREATE TABLE IF NOT EXISTS public.game_session_questions (
  session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  position integer NOT NULL,
  question_id integer,
  category text NOT NULL,
  pair_id integer,
  title text NOT NULL,
  subtitle text,
  answer_a text NOT NULL,
  answer_b text NOT NULL,
  answer_c text NOT NULL,
  answer_d text NOT NULL,
  duration_seconds integer NOT NULL,
  scoring_mode text NOT NULL DEFAULT 'QUIZ',
  executive_insight text,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, position)
);
GRANT SELECT ON public.game_session_questions TO anon, authenticated;
GRANT ALL ON public.game_session_questions TO service_role;
ALTER TABLE public.game_session_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "session questions are publicly readable" ON public.game_session_questions;
CREATE POLICY "session questions are publicly readable"
  ON public.game_session_questions FOR SELECT TO anon, authenticated USING (true);

-- 3. Per-session answer keys (never client readable)
CREATE TABLE IF NOT EXISTS public.game_session_question_keys (
  session_id uuid NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  position integer NOT NULL,
  correct_answer_id text NOT NULL,
  explanation text,
  PRIMARY KEY (session_id, position)
);
GRANT ALL ON public.game_session_question_keys TO service_role;
ALTER TABLE public.game_session_question_keys ENABLE ROW LEVEL SECURITY;

-- 4. Session knows how many questions it holds
ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS total_questions integer NOT NULL DEFAULT 0;

-- 5. App settings (logo etc.)
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "settings are publicly readable" ON public.app_settings;
CREATE POLICY "settings are publicly readable"
  ON public.app_settings FOR SELECT TO anon, authenticated USING (true);