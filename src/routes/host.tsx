import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AnswerTile } from "@/components/quiz/answer-tile";
import { ConnectionBadge } from "@/components/quiz/connection-badge";
import { Countdown } from "@/components/quiz/countdown";
import { LeaderboardList, Podium } from "@/components/quiz/leaderboard";
import { ResultsBars } from "@/components/quiz/results-bars";
import { createGame, hostCommand, questionTick, verifyHost } from "@/lib/game.functions";
import {
  hostStorage,
  useCountdown,
  useHydrated,
  useLivePlayers,
  useLiveSession,
  useQuestionAnswers,
  useQuestions,
  useServerClock,
  type HostIdentity,
} from "@/lib/use-game";
import {
  CATEGORY_LABEL,
  TOTAL_QUESTIONS,
  computeStatistics,
  type AnswerId,
} from "@/lib/quiz";

export const Route = createFileRoute("/host")({
  head: () => ({
    meta: [
      { title: "ממספרים לאימפקט – מסך הנחיה" },
      { name: "description", content: "מסך המנחה לניהול החידון החי והצגתו על המסך הגדול." },
      { property: "og:title", content: "ממספרים לאימפקט – מסך הנחיה" },
      {
        property: "og:description",
        content: "מסך המנחה לניהול החידון החי והצגתו על המסך הגדול.",
      },
    ],
  }),
  component: HostPage,
});

function HostPage() {
  const hydrated = useHydrated();
  const [host, setHost] = useState<HostIdentity | null>(null);
  const [busy, setBusy] = useState(false);

  const questions = useQuestions();
  const now = useServerClock();
  const { session, connection } = useLiveSession(host?.sessionId ?? null);
  const players = useLivePlayers(host?.sessionId ?? null);

  useEffect(() => {
    const stored = hostStorage.get();
    if (!stored) return;
    void verifyHost({ data: { sessionId: stored.sessionId, hostSecret: stored.hostSecret } })
      .then((res) => {
        if (res.ok) setHost(stored);
        else hostStorage.clear();
      })
      .catch(() => hostStorage.clear());
  }, []);

  const questionIndex = session?.current_question_index ?? 0;
  const question = useMemo(
    () => questions.find((q) => q.id === questionIndex) ?? null,
    [questions, questionIndex],
  );

  const answers = useQuestionAnswers(
    host?.sessionId ?? null,
    questionIndex,
    session?.phase === "SHOW_RESULTS" || session?.phase === "QUESTION_LOCKED",
  );

  const { seconds, ratio } = useCountdown(
    session?.phase === "QUESTION_ACTIVE" ? session.question_ends_at : null,
    now,
    question?.durationSeconds ?? 20,
  );

  const tick = useCallback(async () => {
    if (!host) return;
    try {
      await questionTick({ data: { sessionId: host.sessionId, hostSecret: host.hostSecret } });
    } catch {
      /* transient */
    }
  }, [host]);

  useEffect(() => {
    if (!host || session?.phase !== "QUESTION_ACTIVE") return;
    const id = setInterval(() => void tick(), 1000);
    return () => clearInterval(id);
  }, [host, session?.phase, tick]);

  const run = async (
    action: "ADVANCE" | "LOCK" | "RESET" | "DELETE" | "ADD_BOTS" | "CLEAR_BOTS" | "TOGGLE_LATE_JOIN",
    count?: number,
  ) => {
    if (!host || busy) return;
    setBusy(true);
    try {
      await hostCommand({
        data: { sessionId: host.sessionId, hostSecret: host.hostSecret, action, count },
      });
      if (action === "DELETE" || action === "RESET") {
        if (action === "DELETE") {
          hostStorage.clear();
          setHost(null);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "הפעולה נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  const start = async () => {
    setBusy(true);
    try {
      const created = await createGame();
      const identity: HostIdentity = {
        sessionId: created.sessionId,
        pin: created.pin,
        hostSecret: created.hostSecret,
      };
      hostStorage.set(identity);
      setHost(identity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "יצירת המשחק נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  if (!hydrated) return null;

  if (!host) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-black">
          <span className="text-gradient-accent">מסך הנחיה</span>
        </h1>
        <p className="max-w-md text-muted-foreground">
          פתחו משחק חדש, הציגו את הקוד על המסך הגדול ונהלו את החידון מכאן.
        </p>
        <button
          onClick={() => void start()}
          disabled={busy}
          className="h-14 rounded-2xl bg-gradient-accent px-10 text-lg font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "פותחים משחק..." : "פתיחת משחק חדש"}
        </button>
      </main>
    );
  }

  const stats = question
    ? computeStatistics(answers, players.length, (session?.revealed_answer_id as AnswerId | null) ?? null)
    : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest text-primary">סיכום חציון א' 2026</p>
          <h1 className="text-2xl font-black">ממספרים לאימפקט</h1>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionBadge state={connection} />
          <span className="tabular rounded-xl bg-muted px-3 py-2 text-sm font-bold">
            {players.length} משתתפים
          </span>
          <span className="tabular rounded-xl bg-primary px-4 py-2 text-xl font-black text-primary-foreground" dir="ltr">
            {host.pin}
          </span>
        </div>
      </header>

      {session?.phase === "LOBBY" && (
        <section className="surface-card flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
          <p className="text-lg text-muted-foreground">הצטרפו מהטלפון עם הקוד</p>
          <p className="tabular text-8xl font-black tracking-[0.2em] text-gradient-accent" dir="ltr">
            {host.pin}
          </p>
          <p className="text-muted-foreground">{players.length} משתתפים מחוברים</p>
          <LeaderboardList players={players} limit={5} compact />
        </section>
      )}

      {session && session.phase !== "LOBBY" && question && (
        <section className="surface-card flex flex-1 flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-primary">
                שאלה {question.id} מתוך {TOTAL_QUESTIONS} · {CATEGORY_LABEL[question.category]}
              </p>
              <h2 className="mt-1 text-3xl font-black leading-snug">{question.title}</h2>
              {question.subtitle && (
                <p className="mt-1 text-muted-foreground">{question.subtitle}</p>
              )}
            </div>
            {session.phase === "QUESTION_ACTIVE" && <Countdown seconds={seconds} ratio={ratio} />}
          </div>

          {(session.phase === "QUESTION_INTRO" ||
            session.phase === "QUESTION_ACTIVE" ||
            session.phase === "QUESTION_LOCKED") && (
            <div className="grid gap-3 sm:grid-cols-2">
              {question.answers.map((a) => (
                <AnswerTile key={a.id} id={a.id} text={a.text} size="stage" />
              ))}
            </div>
          )}

          {session.phase === "SHOW_RESULTS" && stats && (
            <ResultsBars
              stats={stats}
              answers={question.answers}
              correctAnswerId={(session.revealed_answer_id as AnswerId | null) ?? null}
            />
          )}

          {session.phase === "LEADERBOARD" && <LeaderboardList players={players} limit={5} />}

          {session.phase === "GAME_COMPLETE" && (
            <div className="space-y-6">
              <h2 className="text-center text-3xl font-black">התוצאות הסופיות 🎉</h2>
              <Podium players={players} />
            </div>
          )}
        </section>
      )}

      <footer className="surface-card flex flex-wrap items-center gap-2 p-3">
        <button
          onClick={() => void run("ADVANCE")}
          disabled={busy || session?.phase === "GAME_COMPLETE"}
          className="h-12 flex-1 rounded-xl bg-gradient-accent px-6 font-bold text-primary-foreground disabled:opacity-50"
        >
          המשך ←
        </button>
        <button
          onClick={() => void run("LOCK")}
          disabled={busy || session?.phase !== "QUESTION_ACTIVE"}
          className="h-12 rounded-xl border border-input px-4 font-semibold disabled:opacity-50"
        >
          נעילת שאלה
        </button>
        <button
          onClick={() => void run("ADD_BOTS", 10)}
          disabled={busy}
          className="h-12 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50"
        >
          + 10 בוטים
        </button>
        <button
          onClick={() => void run("CLEAR_BOTS")}
          disabled={busy}
          className="h-12 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50"
        >
          ניקוי בוטים
        </button>
        <button
          onClick={() => void run("RESET")}
          disabled={busy}
          className="h-12 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50"
        >
          איפוס
        </button>
      </footer>
    </main>
  );
}
