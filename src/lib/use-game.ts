import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/integrations/firebase/client";
import { collection, doc, onSnapshot, query, orderBy, where, getDocs, getDoc } from "firebase/firestore";
import { getServerTime } from "@/lib/game.functions";
import type { AnswerRow, PlayerRow, QuizQuestion, SessionRow } from "@/lib/quiz";
import { signInAnonymously, getAuth } from "firebase/auth";

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

/** Make sure Anonymous Auth is initialized */
function useEnsureAuth() {
  useEffect(() => {
    const auth = getAuth();
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(console.error);
    }
  }, []);
}

export function useQuestions() {
  useEnsureAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  useEffect(() => {
    const q = query(collection(db, "questions"), orderBy("orderIndex"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setQuestions(
        snap.docs.map((d) => {
          const qData = d.data();
          return {
            id: Number(d.id),
            category: qData.category as QuizQuestion["category"],
            pairId: qData.pairId,
            title: qData.title,
            subtitle: qData.subtitle,
            answers: qData.answers,
            durationSeconds: qData.durationSeconds,
            scoringMode: qData.scoringMode as QuizQuestion["scoringMode"],
            executiveInsight: qData.executiveInsight,
            isPlaceholder: qData.isPlaceholder,
            imageUrl: qData.imageUrl ?? null,
          };
        })
      );
    });
    return () => unsubscribe();
  }, []);
  return questions;
}

export function useLiveSession(sessionId: string | null) {
  useEnsureAuth();
  const [session, setSession] = useState<SessionRow | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");

  const refetch = useCallback(async () => {
    if (!sessionId) return;
    const snap = await getDoc(doc(db, "sessions", sessionId));
    if (snap.exists()) {
      const d = snap.data();
      setSession({
        id: snap.id,
        title: d.title,
        status: d.status,
        phase: d.phase,
        current_question_index: d.currentQuestionIndex,
        question_started_at: d.questionStartedAt,
        question_ends_at: d.questionEndsAt,
        revealed_answer_id: d.revealedAnswerId,
        allow_late_join: d.allowLateJoin,
        created_at: d.createdAt,
        expires_at: d.expiresAt,
        updated_at: d.updatedAt,
        total_questions: d.totalQuestions,
      } as unknown as SessionRow);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    setConnection("connecting");

    const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
      if (!snap.exists()) return;
      const d = snap.data();
      setSession({
        id: snap.id,
        title: d.title,
        status: d.status,
        phase: d.phase,
        current_question_index: d.currentQuestionIndex,
        question_started_at: d.questionStartedAt,
        question_ends_at: d.questionEndsAt,
        revealed_answer_id: d.revealedAnswerId,
        allow_late_join: d.allowLateJoin,
        created_at: d.createdAt,
        expires_at: d.expiresAt,
        updated_at: d.updatedAt,
        total_questions: d.totalQuestions,
      } as unknown as SessionRow);
      setConnection("connected");
    }, (error) => {
      setConnection("reconnecting");
    });

    const onOnline = () => setConnection("reconnecting");
    const onOffline = () => setConnection("offline");
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [sessionId]);

  return { session, connection, refetchSession: refetch };
}

export function useLivePlayers(sessionId: string | null) {
  const [players, setPlayers] = useState<PlayerRow[]>([]);

  useEffect(() => {
    if (!sessionId) return;
    const q = collection(db, `sessions/${sessionId}/players`);
    const unsubscribe = onSnapshot(q, (snap) => {
      setPlayers(snap.docs.map(d => {
        const p = d.data();
        return {
          id: d.id,
          session_id: sessionId,
          display_name: p.displayName,
          total_score: p.totalScore,
          correct_count: p.correctCount,
          cumulative_response_ms: p.cumulativeResponseMs,
          is_virtual: p.isVirtual,
          joined_at: p.joinedAt,
        } as unknown as PlayerRow;
      }));
    });
    return () => unsubscribe();
  }, [sessionId]);

  return players;
}

export function useQuestionAnswers(sessionId: string | null, questionId: number, enabled: boolean) {
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  
  useEffect(() => {
    if (!sessionId || !enabled || questionId < 1) {
      setAnswers([]);
      return;
    }

    const q = query(
      collection(db, `sessions/${sessionId}/answers`),
      where("questionId", "==", questionId)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setAnswers(snap.docs.map(d => {
        const a = d.data();
        return {
          player_id: a.playerId,
          question_id: a.questionId,
          answer_id: a.answerId,
          response_ms: a.responseMs,
        } as unknown as AnswerRow;
      }));
    });
    return () => unsubscribe();
  }, [sessionId, questionId, enabled]);

  return answers;
}

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endsAt, now, durationSeconds, tick]);
}

export function useSessionQuestions(sessionId: string | null) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  
  useEffect(() => {
    if (!sessionId) {
      setQuestions([]);
      return;
    }
    
    // Once frozen for a session, questions don't change, so we can just use onSnapshot
    // or a single fetch with a periodic refresh if we don't want a permanent listener.
    // Since Firebase real-time listeners are cheap for unmodified data, let's use onSnapshot.
    const q = query(collection(db, `sessions/${sessionId}/questions`), orderBy("position"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setQuestions(
        snap.docs.map((d) => {
          const qData = d.data();
          return {
            id: qData.position,
            category: qData.category as QuizQuestion["category"],
            pairId: qData.pairId,
            title: qData.title,
            subtitle: qData.subtitle,
            answers: qData.answers,
            durationSeconds: qData.durationSeconds,
            scoringMode: qData.scoringMode as QuizQuestion["scoringMode"],
            executiveInsight: qData.executiveInsight,
            isPlaceholder: false,
            imageUrl: qData.imageUrl ?? null,
          };
        })
      );
    });
    return () => unsubscribe();
  }, [sessionId]);
  
  return questions;
}

export function useAppSetting(key: string) {
  const [value, setValue] = useState<string | null>(null);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "global"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setValue(data[key] ?? null);
      } else {
        setValue(null);
      }
    });
    return () => unsubscribe();
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
