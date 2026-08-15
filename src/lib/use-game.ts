import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getServerTime } from "@/lib/game.functions";
import type { AnswerRow, PlayerRow, QuizQuestion, SessionRow } from "@/lib/quiz";

export type ConnectionState = "connecting" | "connected" | "reconnecting" | "offline";

const CONNECTION_LABEL: Record<ConnectionState, string> = {
  connecting: "מתחבר...",
  connected: "מחובר",
  reconnecting: "מתחבר מחדש...",
  offline: "החיבור נותק",
};

export function connectionLabel(state: ConnectionState) {
  return CONNECTION_LABEL[state];
}

/** Offset between backend clock and this device clock (ms). */
export function useServerClock() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      const started = Date.now();
      try {
        const { now } = await getServerTime();
        const rtt = Date.now() - started;
        if (!cancelled) setOffset(now + rtt / 2 - Date.now());
      } catch {
        /* keep last offset */
      }
    };
    void sync();
    const id = setInterval(() => void sync(), 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);
  return useCallback(() => Date.now() + offset, [offset]);
}

export function useQuestions() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  useEffect(() => {
    let active = true;
    void supabase
      .from("questions_public")
      .select("*")
      .order("id")
      .then(({ data }) => {
        if (!active || !data) return;
        setQuestions(
          data.map((q) => ({
            id: q.id,
            category: q.category as QuizQuestion["category"],
            pairId: q.pair_id,
            title: q.title,
            subtitle: q.subtitle,
            answers: [
              { id: "A" as const, text: q.answer_a },
              { id: "B" as const, text: q.answer_b },
              { id: "C" as const, text: q.answer_c },
              { id: "D" as const, text: q.answer_d },
            ],
            durationSeconds: q.duration_seconds,
            scoringMode: q.scoring_mode as QuizQuestion["scoringMode"],
            executiveInsight: q.executive_insight,
            isPlaceholder: q.is_placeholder,
            imageUrl: (q as { image_url: string | null }).image_url ?? null,
          })),
        );
      });
    return () => {
      active = false;
    };
  }, []);
  return questions;
}

/** Authoritative session state, kept live over realtime with a safety refetch. */
export function useLiveSession(sessionId: string | null) {
  const [session, setSession] = useState<SessionRow | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");

  const refetch = useCallback(async () => {
    if (!sessionId) return;
    // The PIN column is intentionally not readable by clients (see RLS/column grants).
    const { data } = await supabase
      .from("game_sessions")
      .select(
        "id, title, status, phase, current_question_index, question_started_at, question_ends_at, revealed_answer_id, allow_late_join, created_at, expires_at, updated_at, total_questions",
      )
      .eq("id", sessionId)
      .maybeSingle();
    if (data) setSession(data as unknown as SessionRow);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    let mounted = true;
    setConnection("connecting");
    void refetch();

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_sessions", filter: `id=eq.${sessionId}` },
        (payload) => {
          if (!mounted) return;
          if (payload.eventType === "DELETE") return;
          setSession(payload.new as unknown as SessionRow);
        },
      )
      .subscribe((status) => {
        if (!mounted) return;
        if (status === "SUBSCRIBED") {
          setConnection("connected");
          void refetch();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnection("reconnecting");
        } else if (status === "CLOSED") {
          setConnection("reconnecting");
        }
      });

    const poll = setInterval(() => void refetch(), 6000); // safety net only
    const onOnline = () => setConnection("reconnecting");
    const onOffline = () => setConnection("offline");
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      mounted = false;
      clearInterval(poll);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      void supabase.removeChannel(channel);
    };
  }, [sessionId, refetch]);

  return { session, connection, refetchSession: refetch };
}

export function useLivePlayers(sessionId: string | null) {
  const [players, setPlayers] = useState<PlayerRow[]>([]);

  const refetch = useCallback(async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from("game_players")
      .select("id, session_id, display_name, total_score, correct_count, cumulative_response_ms, is_virtual, joined_at")
      .eq("session_id", sessionId);
    if (data) setPlayers(data as unknown as PlayerRow[]);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    void refetch();
    const channel = supabase
      .channel(`players-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `session_id=eq.${sessionId}`,
        },
        () => void refetch(),
      )
      .subscribe();
    const poll = setInterval(() => void refetch(), 8000);
    return () => {
      clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [sessionId, refetch]);

  return players;
}

/** Answers for a question — readable only once the question is locked/revealed. */
export function useQuestionAnswers(sessionId: string | null, questionId: number, enabled: boolean) {
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  useEffect(() => {
    if (!sessionId || !enabled || questionId < 1) {
      setAnswers([]);
      return;
    }
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("game_answers")
        .select("player_id, question_id, answer_id, is_correct, response_ms, awarded_score")
        .eq("session_id", sessionId)
        .eq("question_id", questionId);
      if (active && data) setAnswers(data as unknown as AnswerRow[]);
    };
    void load();
    const id = setInterval(() => void load(), 3000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [sessionId, questionId, enabled]);
  return answers;
}

/**
 * Countdown derived from the absolute backend deadline.
 * A ticking state value drives the recompute, so the number visibly moves.
 */
export function useCountdown(endsAt: string | null, now: () => number, durationSeconds: number) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!endsAt) return;
    setTick((v) => v + 1);
    const id = window.setInterval(() => setTick((v) => (v + 1) % 100000), 100);
    return () => window.clearInterval(id);
  }, [endsAt]);

  return useMemo(() => {
    if (!endsAt) return { remainingMs: durationSeconds * 1000, seconds: durationSeconds, ratio: 1 };
    const remainingMs = Math.max(0, new Date(endsAt).getTime() - now());
    return {
      remainingMs,
      seconds: Math.ceil(remainingMs / 1000),
      ratio: Math.max(0, Math.min(1, remainingMs / (durationSeconds * 1000))),
    };
    // `tick` intentionally drives the recompute each frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt, now, durationSeconds, tick]);
}

/** Questions frozen into a running session, addressed by position (1-based). */
export function useSessionQuestions(sessionId: string | null) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  useEffect(() => {
    if (!sessionId) {
      setQuestions([]);
      return;
    }
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("game_session_questions")
        .select("*")
        .eq("session_id", sessionId)
        .order("position");
      if (!active || !data) return;
      setQuestions(
        data.map((q) => ({
          id: q.position,
          category: q.category as QuizQuestion["category"],
          pairId: q.pair_id,
          title: q.title,
          subtitle: q.subtitle,
          answers: [
            { id: "A" as const, text: q.answer_a },
            { id: "B" as const, text: q.answer_b },
            { id: "C" as const, text: q.answer_c },
            { id: "D" as const, text: q.answer_d },
          ],
          durationSeconds: q.duration_seconds,
          scoringMode: q.scoring_mode as QuizQuestion["scoringMode"],
          executiveInsight: q.executive_insight,
          isPlaceholder: false,
          imageUrl: q.image_url,
        })),
      );
    };
    void load();
    const id = window.setInterval(() => void load(), 10_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [sessionId]);
  return questions;
}

/** Public app setting (e.g. the division logo). */
export function useAppSetting(key: string) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setValue(data?.value ?? null);
      });
    return () => {
      active = false;
    };
  }, [key]);
  return value;
}


// ------------------------------------------------------------ local identity

export type PlayerIdentity = {
  sessionId: string;
  pin: string;
  playerId: string;
  playerSecret: string;
  displayName: string;
};

export type HostIdentity = { sessionId: string; pin: string; hostSecret: string };

const PLAYER_KEY = "impact2026.player";
const HOST_KEY = "impact2026.host";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const playerStorage = {
  get: () => read<PlayerIdentity>(PLAYER_KEY),
  set: (identity: PlayerIdentity) => write(PLAYER_KEY, identity),
  clear: () => typeof window !== "undefined" && window.localStorage.removeItem(PLAYER_KEY),
};

export const hostStorage = {
  get: () => read<HostIdentity>(HOST_KEY),
  set: (identity: HostIdentity) => write(HOST_KEY, identity),
  clear: () => typeof window !== "undefined" && window.localStorage.removeItem(HOST_KEY),
};

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
