-- =========================
-- Sessions
-- =========================
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'ממספרים לאימפקט: סיכום חציון א'' 2026',
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  phase TEXT NOT NULL DEFAULT 'LOBBY',
  current_question_index INT NOT NULL DEFAULT 0,
  question_started_at TIMESTAMPTZ,
  question_ends_at TIMESTAMPTZ,
  revealed_answer_id TEXT,
  allow_late_join BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '12 hours',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX game_sessions_active_pin_idx ON public.game_sessions (pin) WHERE status = 'ACTIVE';
GRANT SELECT ON public.game_sessions TO anon, authenticated;
GRANT ALL ON public.game_sessions TO service_role;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions are publicly readable" ON public.game_sessions FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.game_host_secrets (
  session_id UUID PRIMARY KEY REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  host_secret_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.game_host_secrets TO service_role;
ALTER TABLE public.game_host_secrets ENABLE ROW LEVEL SECURITY;

-- =========================
-- Players
-- =========================
CREATE TABLE public.game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_score INT NOT NULL DEFAULT 0,
  correct_count INT NOT NULL DEFAULT 0,
  cumulative_response_ms BIGINT NOT NULL DEFAULT 0,
  is_virtual BOOLEAN NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX game_players_unique_name_idx ON public.game_players (session_id, normalized_name);
CREATE INDEX game_players_session_idx ON public.game_players (session_id);
GRANT SELECT ON public.game_players TO anon, authenticated;
GRANT ALL ON public.game_players TO service_role;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players are publicly readable" ON public.game_players FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.game_player_secrets (
  player_id UUID PRIMARY KEY REFERENCES public.game_players(id) ON DELETE CASCADE,
  player_secret_hash TEXT NOT NULL
);
GRANT ALL ON public.game_player_secrets TO service_role;
ALTER TABLE public.game_player_secrets ENABLE ROW LEVEL SECURITY;

-- =========================
-- Answers
-- =========================
CREATE TABLE public.game_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  question_id INT NOT NULL,
  player_id UUID NOT NULL REFERENCES public.game_players(id) ON DELETE CASCADE,
  answer_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  response_ms INT NOT NULL DEFAULT 0,
  awarded_score INT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX game_answers_unique_idx ON public.game_answers (session_id, question_id, player_id);
CREATE INDEX game_answers_session_question_idx ON public.game_answers (session_id, question_id);
GRANT SELECT ON public.game_answers TO anon, authenticated;
GRANT ALL ON public.game_answers TO service_role;
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "answers readable once question is locked" ON public.game_answers
FOR SELECT TO anon, authenticated USING (
  EXISTS (
    SELECT 1 FROM public.game_sessions s
    WHERE s.id = game_answers.session_id
      AND (s.current_question_index <> game_answers.question_id
           OR s.phase IN ('QUESTION_LOCKED','SHOW_RESULTS','LEADERBOARD','GAME_COMPLETE'))
  )
);

-- =========================
-- Questions
-- =========================
CREATE TABLE public.questions_public (
  id INT PRIMARY KEY,
  category TEXT NOT NULL,
  pair_id INT,
  title TEXT NOT NULL,
  subtitle TEXT,
  answer_a TEXT NOT NULL,
  answer_b TEXT NOT NULL,
  answer_c TEXT NOT NULL,
  answer_d TEXT NOT NULL,
  duration_seconds INT NOT NULL,
  scoring_mode TEXT NOT NULL DEFAULT 'QUIZ',
  executive_insight TEXT,
  is_placeholder BOOLEAN NOT NULL DEFAULT true
);
GRANT SELECT ON public.questions_public TO anon, authenticated;
GRANT ALL ON public.questions_public TO service_role;
ALTER TABLE public.questions_public ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions are publicly readable" ON public.questions_public FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.question_keys_private (
  question_id INT PRIMARY KEY REFERENCES public.questions_public(id) ON DELETE CASCADE,
  correct_answer_id TEXT NOT NULL,
  explanation TEXT
);
GRANT ALL ON public.question_keys_private TO service_role;
ALTER TABLE public.question_keys_private ENABLE ROW LEVEL SECURITY;

-- =========================
-- Realtime
-- =========================
ALTER TABLE public.game_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.game_players REPLICA IDENTITY FULL;
ALTER TABLE public.game_answers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_answers;

-- =========================
-- Placeholder dataset (16 questions)
-- =========================
INSERT INTO public.questions_public (id, category, pair_id, title, subtitle, answer_a, answer_b, answer_c, answer_d, duration_seconds, scoring_mode, executive_insight, is_placeholder) VALUES
(1,'OUTCOME',NULL,'[מציין מקום] שאלת אימפקט מס׳ 1 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',30,'QUIZ','[מציין מקום] תובנה ניהולית תוכנס כאן מהמאגר המאושר.',true),
(2,'OUTCOME',NULL,'[מציין מקום] שאלת אימפקט מס׳ 2 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',30,'QUIZ','[מציין מקום] תובנה ניהולית תוכנס כאן מהמאגר המאושר.',true),
(3,'OUTCOME',NULL,'[מציין מקום] שאלת אימפקט מס׳ 3 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',30,'QUIZ','[מציין מקום] תובנה ניהולית תוכנס כאן מהמאגר המאושר.',true),
(4,'OUTCOME',NULL,'[מציין מקום] שאלת אימפקט מס׳ 4 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',30,'QUIZ','[מציין מקום] תובנה ניהולית תוכנס כאן מהמאגר המאושר.',true),
(5,'OUTPUT',1,'[מציין מקום] שאלת תפוקה מס׳ 5 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',20,'QUIZ',NULL,true),
(6,'OUTCOME',1,'[מציין מקום] שאלת אימפקט מס׳ 6 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',30,'QUIZ','[מציין מקום] תובנה ניהולית תוכנס כאן מהמאגר המאושר.',true),
(7,'OUTPUT',2,'[מציין מקום] שאלת תפוקה מס׳ 7 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',20,'QUIZ',NULL,true),
(8,'OUTCOME',2,'[מציין מקום] שאלת אימפקט מס׳ 8 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',30,'QUIZ','[מציין מקום] תובנה ניהולית תוכנס כאן מהמאגר המאושר.',true),
(9,'OUTPUT',3,'[מציין מקום] שאלת תפוקה מס׳ 9 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',20,'QUIZ',NULL,true),
(10,'OUTCOME',3,'[מציין מקום] שאלת אימפקט מס׳ 10 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',30,'QUIZ','[מציין מקום] תובנה ניהולית תוכנס כאן מהמאגר המאושר.',true),
(11,'OUTPUT',4,'[מציין מקום] שאלת תפוקה מס׳ 11 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',20,'QUIZ',NULL,true),
(12,'OUTCOME',4,'[מציין מקום] שאלת אימפקט מס׳ 12 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',30,'QUIZ','[מציין מקום] תובנה ניהולית תוכנס כאן מהמאגר המאושר.',true),
(13,'OUTPUT',5,'[מציין מקום] שאלת תפוקה מס׳ 13 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',20,'QUIZ',NULL,true),
(14,'OUTCOME',5,'[מציין מקום] שאלת אימפקט מס׳ 14 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',30,'QUIZ','[מציין מקום] תובנה ניהולית תוכנס כאן מהמאגר המאושר.',true),
(15,'OUTPUT',6,'[מציין מקום] שאלת תפוקה מס׳ 15 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',20,'QUIZ',NULL,true),
(16,'OUTCOME',6,'[מציין מקום] שאלת אימפקט מס׳ 16 - יש להחליף בתוכן המאושר','שאלה זמנית לצורכי בדיקה טכנית בלבד','[מציין מקום] תשובה א','[מציין מקום] תשובה ב','[מציין מקום] תשובה ג','[מציין מקום] תשובה ד',30,'QUIZ','[מציין מקום] תובנה ניהולית תוכנס כאן מהמאגר המאושר.',true);

INSERT INTO public.question_keys_private (question_id, correct_answer_id, explanation)
SELECT id, (ARRAY['A','B','C','D'])[1 + (id % 4)], '[מציין מקום] הסבר יוכנס מהמאגר המאושר.' FROM public.questions_public;