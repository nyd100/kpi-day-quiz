CREATE OR REPLACE FUNCTION public.record_answer(
  p_session UUID,
  p_question INT,
  p_player UUID,
  p_answer TEXT,
  p_response_ms INT,
  p_score INT,
  p_correct BOOLEAN
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted BOOLEAN := false;
BEGIN
  INSERT INTO public.game_answers (session_id, question_id, player_id, answer_id, is_correct, response_ms, awarded_score)
  VALUES (p_session, p_question, p_player, p_answer, p_correct, p_response_ms, p_score)
  ON CONFLICT (session_id, question_id, player_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted THEN
    UPDATE public.game_players
      SET total_score = total_score + p_score,
          correct_count = correct_count + (CASE WHEN p_correct THEN 1 ELSE 0 END),
          cumulative_response_ms = cumulative_response_ms + p_response_ms,
          last_seen_at = now()
      WHERE id = p_player AND session_id = p_session;
  END IF;

  RETURN v_inserted;
END;
$$;

REVOKE ALL ON FUNCTION public.record_answer(UUID, INT, UUID, TEXT, INT, INT, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_answer(UUID, INT, UUID, TEXT, INT, INT, BOOLEAN) TO service_role;