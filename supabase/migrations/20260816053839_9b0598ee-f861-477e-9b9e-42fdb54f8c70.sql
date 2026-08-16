REVOKE SELECT ON public.game_sessions FROM anon, authenticated;

GRANT SELECT (
  id, title, status, phase, current_question_index,
  question_started_at, question_ends_at, revealed_answer_id,
  allow_late_join, created_at, expires_at, updated_at, total_questions
) ON public.game_sessions TO anon, authenticated;

GRANT ALL ON public.game_sessions TO service_role;