import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AnswerTile } from "@/components/quiz/answer-tile";
import { ConnectionBadge } from "@/components/quiz/connection-badge";
import { Countdown } from "@/components/quiz/countdown";
import { LeaderboardList } from "@/components/quiz/leaderboard";
import { playerState, submitAnswer } from "@/lib/game.functions";
import {
  playerStorage,
  useCountdown,
  useHydrated,
  useLivePlayers,
  useLiveSession,
  useSessionQuestions,
  useServerClock,
  type PlayerIdentity,
} from "@/lib/use-game";
import { CATEGORY_LABEL, sortLeaderboard, type AnswerId } from "@/lib/quiz";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "ממספרים לאימפקט – מסך המשתתף" },
      { name: "description", content: "מסך המשתתף בחידון החי: שאלות, טיימר ותשובות בזמן אמת." },
      { property: "og:title", content: "ממספרים לאימפקט – מסך המשתתף" },
      {
        property: "og:description",
        content: "מסך המשתתף בחידון החי: שאלות, טיימר ותשובות בזמן אמת.",
      },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const [identity, setIdentity] = useState<PlayerIdentity | null>(null);
  const [answeredId, setAnsweredId] = useState<AnswerId | null>(null);
  const [pending, setPending] = useState<AnswerId | null>(null);

  const questions = useSessionQuestions(playerStorage.get()?.sessionId ?? null);
  const now = useServerClock();
  const { session, connection } = useLiveSession(identity?.sessionId ?? null);
  const players = useLivePlayers(identity?.sessionId ?? null);

  useEffect(() => {
    const stored = playerStorage.get();
    if (!stored) {
      void navigate({ to: "/" });
      return;
    }
    setIdentity(stored);
  }, [navigate]);

  const questionIndex = session?.current_question_index ?? 0;
  const question = useMemo(
    () => questions.find((q) => q.id === questionIndex) ?? null,
    [questions, questionIndex],
  );

  // Reconnect / refresh: restore whether this player already answered.
  const syncState = useCallback(async () => {
    const stored = playerStorage.get();
    if (!stored) return;
    try {
      const state = await playerState({
        data: {
          sessionId: stored.sessionId,
          playerId: stored.playerId,
          playerSecret: stored.playerSecret,
        },
      });
      setAnsweredId((state.answeredCurrent as AnswerId | null) ?? null);
    } catch {
      playerStorage.clear();
      void navigate({ to: "/" });
    }
  }, [navigate]);

  useEffect(() => {
    if (!identity) return;
    void syncState();
    const id = setInterval(() => void syncState(), 20_000);
    return () => clearInterval(id);
  }, [identity, syncState]);

  useEffect(() => {
    setAnsweredId(null);
    setPending(null);
    if (identity) void syncState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionIndex]);

  const duration = question?.durationSeconds ?? 20;
  const { seconds, ratio } = useCountdown(
    session?.phase === "QUESTION_ACTIVE" ? session.question_ends_at : null,
    now,
    duration,
  );

  const me = players.find((p) => p.id === identity?.playerId);
  const ranked = sortLeaderboard(players);
  const myRank = ranked.findIndex((p) => p.id === identity?.playerId) + 1;

  const choose = async (answerId: AnswerId) => {
    if (!identity || !question || answeredId || pending) return;
    setPending(answerId);
    try {
      await submitAnswer({
        data: {
          sessionId: identity.sessionId,
          playerId: identity.playerId,
          playerSecret: identity.playerSecret,
          questionId: question.id,
          answerId,
        },
      });
      setAnsweredId(answerId);
    } catch (error) {
      setPending(null);
      toast.error(error instanceof Error ? error.message : "שליחת התשובה נכשלה.");
      void syncState();
    }
  };

  if (!hydrated || !identity) {
    return <CenteredMessage title="טוענים את המשחק..." />;
  }

  if (!session) {
    return <CenteredMessage title="מתחברים למשחק..." connection={connection} />;
  }

  if (session.status !== "ACTIVE") {
    return <CenteredMessage title="המשחק הסתיים." connection={connection} />;
  }

  const header = (
    <div className="flex items-center justify-between gap-2 pb-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold">{identity.displayName}</p>
        <p className="tabular text-xs text-muted-foreground">
          {me ? `${me.total_score.toLocaleString("he-IL")} נקודות` : "0 נקודות"}
          {myRank > 0 && ` · מיקום ${myRank}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <img src="/ministry-logo.png" alt="משרד העלייה והקליטה" className="h-6 w-auto object-contain" />
        <div className="h-4 w-px bg-border"></div>
        <img src="/strategy-division-logo.png" alt="חטיבת אסטרטגיה" className="h-6 w-auto object-contain" />
        <ConnectionBadge state={connection} />
      </div>
    </div>
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-3 py-4">
      {header}

      {session.phase === "LOBBY" && (
        <Panel>
          <h1 className="text-3xl font-black">נכנסת למשחק 🎉</h1>
          <p className="mt-2 text-muted-foreground">ממתינים לתחילת הפעילות</p>
          <p className="mt-6 text-sm text-muted-foreground">
            {players.length} משתתפים מחוברים כרגע
          </p>
        </Panel>
      )}

      {session.phase === "QUESTION_INTRO" && (
        <Panel>
          <p className="text-sm font-semibold text-primary">
            שאלה {questionIndex} מתוך {session?.total_questions ?? questions.length}
          </p>
          <h1 className="mt-2 text-3xl font-black">מתכוננים...</h1>
          <p className="mt-2 text-muted-foreground">השאלה תופיע כאן ברגע שהמנחה יתחיל</p>
        </Panel>
      )}

      {(session.phase === "QUESTION_ACTIVE" || session.phase === "QUESTION_LOCKED") && question && (
        <section className="flex flex-1 flex-col gap-3">
          <div className="surface-card flex items-center gap-3 p-3">
            <Countdown
              seconds={session.phase === "QUESTION_LOCKED" ? 0 : seconds}
              ratio={session.phase === "QUESTION_LOCKED" ? 0 : ratio}
              size={72}
            />
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-wide text-primary">
                שאלה {question.id} מתוך {session?.total_questions ?? questions.length} · {CATEGORY_LABEL[question.category]}
              </p>
              <h1 className="mt-1 text-lg font-bold leading-snug">{question.title}</h1>
            </div>
          </div>

          <div className="grid gap-2">
            {question.answers.map((answer) => (
              <AnswerTile
                key={answer.id}
                id={answer.id}
                text={answer.text}
                selected={answeredId === answer.id || pending === answer.id}
                dimmed={!!answeredId && answeredId !== answer.id}
                disabled={
                  !!answeredId || !!pending || session.phase !== "QUESTION_ACTIVE" || seconds <= 0
                }
                onSelect={() => void choose(answer.id)}
              />
            ))}
          </div>

          <div
            className="surface-card p-3 text-center text-sm font-semibold"
            role="status"
            aria-live="polite"
          >
            {answeredId
              ? "התשובה נקלטה ✓ ממתינים לשאר המשתתפים"
              : session.phase === "QUESTION_LOCKED" || seconds <= 0
                ? "הזמן נגמר"
                : "בחרו תשובה אחת"}
          </div>
        </section>
      )}

      {session.phase === "SHOW_RESULTS" && question && (
        <Panel>
          <p className="text-sm font-semibold text-primary">תוצאות שאלה {question.id}</p>
          <h1 className="mt-2 text-2xl font-black">
            {answeredId
              ? answeredId === session.revealed_answer_id
                ? "תשובה נכונה! 🎯"
                : "הפעם לא הצלחת"
              : "לא נקלטה תשובה"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            התשובה הנכונה מוצגת על המסך הגדול
          </p>
          <p className="tabular mt-6 text-3xl font-black text-primary">
            {(me?.total_score ?? 0).toLocaleString("he-IL")}
          </p>
          <p className="text-sm text-muted-foreground">סך הנקודות שלך</p>
        </Panel>
      )}

      {(session.phase === "LEADERBOARD" || session.phase === "GAME_COMPLETE") && (
        <section className="flex flex-1 flex-col gap-4 pt-2">
          <div className="surface-card p-5 text-center">
            <p className="text-sm text-muted-foreground">
              {session.phase === "GAME_COMPLETE" ? "תוצאות סופיות" : "טבלת המובילים"}
            </p>
            <p className="tabular mt-2 text-4xl font-black text-primary">
              {(me?.total_score ?? 0).toLocaleString("he-IL")} נקודות
            </p>
            {myRank > 0 && <p className="mt-1 text-lg font-bold">המיקום שלך: {myRank}</p>}
          </div>
          <LeaderboardList players={players} limit={5} highlightPlayerId={identity.playerId} compact />
        </section>
      )}
    </main>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="surface-card animate-pop flex flex-1 flex-col items-center justify-center p-8 text-center">
      {children}
    </section>
  );
}

function CenteredMessage({
  title,
  connection,
}: {
  title: string;
  connection?: "connecting" | "connected" | "reconnecting" | "offline";
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      {connection && <ConnectionBadge state={connection} />}
    </main>
  );
}
