import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

import { AnswerTile } from "@/components/quiz/answer-tile";
import { ConnectionBadge } from "@/components/quiz/connection-badge";
import { Countdown } from "@/components/quiz/countdown";
import { LeaderboardList, Podium } from "@/components/quiz/leaderboard";
import { ParticipationStrip } from "@/components/quiz/participation-strip";
import { ResultsBars } from "@/components/quiz/results-bars";
import { InsightStrip } from "@/components/quiz/insight-strip";
import { hostCommand, questionTick, verifyHost } from "@/lib/game.functions";
import { disableSound, enableSound, isSoundEnabled, playCue } from "@/lib/sound";
import {
  hostStorage,
  useAppSetting,
  useCountdown,
  useHydrated,
  useLivePlayers,
  useLiveSession,
  useQuestionAnswers,
  useServerClock,
  useSessionQuestions,
  type HostIdentity,
} from "@/lib/use-game";
import {
  CATEGORY_LABEL,
  computeStatistics,
  
  type AnswerId,
  type GameAction,
} from "@/lib/quiz";

export const Route = createFileRoute("/present")({
  head: () => ({
    meta: [
      { title: "ממספרים לאימפקט – מסך המשחק החי" },
      { name: "description", content: "מסך ההנחיה החי לניהול החידון והצגתו על המסך הגדול." },
      { property: "og:title", content: "ממספרים לאימפקט – מסך המשחק החי" },
      {
        property: "og:description",
        content: "מסך ההנחיה החי לניהול החידון והצגתו על המסך הגדול.",
      },
    ],
  }),
  component: PresentPage,
});

function PresentPage() {
  const hydrated = useHydrated();
  const [host, setHost] = useState<HostIdentity | null>(null);
  const [checked, setChecked] = useState(false);
  const [, setBusy] = useState(false);
  const [sound, setSound] = useState(false);

  const now = useServerClock();
  const { session, connection } = useLiveSession(host?.sessionId ?? null);
  const questions = useSessionQuestions(host?.sessionId ?? null);
  const players = useLivePlayers(host?.sessionId ?? null);
  const logoUrl = useAppSetting("org_logo_url");
  const showInsightsSetting = useAppSetting("show_insights");
  const showInsights = showInsightsSetting !== "false";

  useEffect(() => {
    const stored = hostStorage.get();
    if (!stored) {
      setChecked(true);
      return;
    }
    void verifyHost({ data: { sessionId: stored.sessionId, hostSecret: stored.hostSecret } })
      .then((res) => {
        if (res.ok) setHost(stored);
        else hostStorage.clear();
      })
      .catch(() => hostStorage.clear())
      .finally(() => setChecked(true));
  }, []);

  const questionIndex = session?.current_question_index ?? 0;
  const totalQuestions = session?.total_questions ?? questions.length;
  const question = useMemo(
    () => questions.find((q) => q.id === questionIndex) ?? null,
    [questions, questionIndex],
  );

  const answers = useQuestionAnswers(
    host?.sessionId ?? null,
    questionIndex,
    session?.phase === "QUESTION_ACTIVE" || session?.phase === "SHOW_RESULTS" || session?.phase === "QUESTION_LOCKED",
  );

  const { seconds, ratio } = useCountdown(
    session?.phase === "QUESTION_ACTIVE" ? session.question_ends_at : null,
    now,
    question?.durationSeconds ?? 20,
  );

  // ------------------------------------------------------------ sound cues
  const lastPhase = useRef<string | null>(null);
  useEffect(() => {
    const phase = session?.phase ?? null;
    if (!phase || phase === lastPhase.current) return;
    lastPhase.current = phase;
    
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (phase === "QUESTION_INTRO") playCue("gameStart");
    if (phase === "QUESTION_ACTIVE") playCue("questionStart");
    if (phase === "QUESTION_LOCKED") playCue("timeUp");
    if (phase === "SHOW_RESULTS") playCue("reveal");
    if (phase === "LEADERBOARD") {
      playCue("leaderboard");
      if (!prefersReducedMotion) {
        import("canvas-confetti").then(({ default: confetti }) => {
          confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
        });
      }
    }
    if (phase === "GAME_COMPLETE") {
      playCue("finale");
      if (!prefersReducedMotion) {
        import("canvas-confetti").then(({ default: confetti }) => {
          const duration = 3000;
          const end = Date.now() + duration;
          const frame = () => {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#26ccff", "#a25afd", "#ff5e7e", "#88ff5a", "#fcff42", "#ffa62d", "#ff36ff"] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#26ccff", "#a25afd", "#ff5e7e", "#88ff5a", "#fcff42", "#ffa62d", "#ff36ff"] });
            if (Date.now() < end) requestAnimationFrame(frame);
          };
          frame();
        });
      }
    }
  }, [session?.phase]);

  const lastTick = useRef(0);
  useEffect(() => {
    if (session?.phase !== "QUESTION_ACTIVE") return;
    if (seconds > 0 && seconds <= 5 && seconds !== lastTick.current) {
      lastTick.current = seconds;
      playCue("tick");
    }
    if (seconds > 5) lastTick.current = 0;
  }, [seconds, session?.phase]);

  const toggleSound = async () => {
    if (sound) {
      disableSound();
      setSound(false);
      return;
    }
    const ok = await enableSound();
    setSound(ok && isSoundEnabled());
    if (ok) playCue("questionStart");
  };

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

  const run = useCallback(
    async (
      action:
        | GameAction
        | "RESET"
        | "DELETE"
        | "ADD_BOTS"
        | "CLEAR_BOTS"
        | "TOGGLE_LATE_JOIN",
      count?: number,
    ) => {
      if (!host) return;
      setBusy(true);
      try {
        await hostCommand({
          data: { sessionId: host.sessionId, hostSecret: host.hostSecret, action, count },
        });
        if (action === "DELETE") {
          hostStorage.clear();
          setHost(null);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "הפעולה נכשלה.");
      } finally {
        setBusy(false);
      }
    },
    [host],
  );

  // The timer is authoritative: when it hits zero the question locks itself.
  const autoLocked = useRef(0);
  useEffect(() => {
    if (session?.phase !== "QUESTION_ACTIVE" || seconds > 0) return;
    if (autoLocked.current === questionIndex) return;
    autoLocked.current = questionIndex;
    void run("LOCK");
  }, [seconds, session?.phase, questionIndex, run]);

  if (!hydrated || !checked) return null;


  if (!host) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-black">
          <span className="text-gradient-accent">אין משחק פעיל</span>
        </h1>
        <p className="max-w-md text-muted-foreground">
          משחק נפתח מקונסולת הניהול, לאחר שכל השאלות נשמרו.
        </p>
        <Link
          to="/admin"
          className="h-14 rounded-2xl bg-gradient-accent px-10 text-lg font-bold leading-[3.5rem] text-primary-foreground"
        >
          מעבר לקונסולת ניהול
        </Link>
      </main>
    );
  }

  const stats = question
    ? computeStatistics(answers, players.length, (session?.revealed_answer_id as AnswerId | null) ?? null)
    : null;

  const joinUrl =
    typeof window !== "undefined" ? `${window.location.origin}/?pin=${host.pin}` : "";

  return (
    <main className="mx-auto flex min-h-screen w-[96vw] max-w-[1920px] flex-col gap-6 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 rounded-xl bg-white p-2">
            <img
              src="/ministry-logo.png"
              alt="לוגו משרד העלייה והקליטה"
              className="h-12 w-auto object-contain"
            />
            <div className="h-8 w-px bg-border"></div>
            <img
              src="/strategy-division-logo.png"
              alt="חטיבת אסטרטגיה ותכנון מדיניות"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest text-primary">סיכום חציון א' 2026</p>
            <h1 className="text-2xl font-black">ממספרים לאימפקט</h1>
          </div>
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
          <div className="flex flex-wrap items-center justify-center gap-8">
            <p className="tabular text-8xl font-black tracking-[0.2em] text-gradient-accent" dir="ltr">
              {host.pin}
            </p>
            {joinUrl && (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-2xl bg-white p-4">
                  <QRCodeSVG value={joinUrl} size={220} marginSize={2} level="M" />
                </div>
                <p className="text-muted-foreground">סרקו להצטרפות מהירה</p>
              </div>
            )}
          </div>
          <p className="text-muted-foreground">{players.length} משתתפים מחוברים</p>
          <LeaderboardList players={players} limit={5} compact />
        </section>
      )}

      {session && session.phase !== "LOBBY" && question && (
        <section className="surface-card flex flex-1 flex-col gap-6 p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-lg font-bold text-primary">
                שאלה {question.id} מתוך {totalQuestions} · {CATEGORY_LABEL[question.category]}
              </p>
              <h2 className="mt-2 text-4xl font-black leading-snug">{question.title}</h2>
              {question.subtitle && (
                <p className="mt-2 text-xl text-muted-foreground">{question.subtitle}</p>
              )}
            </div>
            {session.phase === "QUESTION_ACTIVE" && <Countdown seconds={seconds} ratio={ratio} />}
          </div>

          {question.imageUrl &&
            (session.phase === "QUESTION_INTRO" ||
              session.phase === "QUESTION_ACTIVE" ||
              session.phase === "QUESTION_LOCKED" ||
              session.phase === "SHOW_RESULTS") && (
              <img
                src={question.imageUrl}
                alt={`תמונה לשאלה ${question.id}`}
                className="mx-auto max-h-64 w-auto rounded-2xl border border-border object-contain"
              />
            )}

          {(session.phase === "QUESTION_ACTIVE" || session.phase === "QUESTION_LOCKED") && (
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              {question.answers.map((a) => (
                <AnswerTile key={a.id} id={a.id} text={a.text} size="stage" />
              ))}
            </div>
          )}

          {session.phase === "QUESTION_INTRO" && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-lg text-muted-foreground">
                התשובות יופיעו כשהמנחה ילחץ להמשך
              </p>
            </div>
          )}

          {session.phase === "QUESTION_ACTIVE" && (
            <div className="mt-auto pt-4">
              <ParticipationStrip answers={answers} players={players} />
            </div>
          )}

          {session.phase === "SHOW_RESULTS" && stats && (
            <div className="flex flex-col gap-4">
              <ResultsBars
                stats={stats}
                answers={question.answers}
                correctAnswerId={(session.revealed_answer_id as AnswerId | null) ?? null}
              />
              {showInsights && (
                <InsightStrip
                  stats={stats}
                  answers={question.answers}
                  category={question.category}
                  correctAnswerId={(session.revealed_answer_id as AnswerId | null) ?? null}
                />
              )}
            </div>
          )}

          {session.phase === "LEADERBOARD" && <LeaderboardList players={players} limit={10} />}

          {session.phase === "GAME_COMPLETE" && (
            <div className="space-y-6">
              <h2 className="text-center text-3xl font-black">התוצאות הסופיות 🎉</h2>
              <Podium players={players} />
            </div>
          )}
        </section>
      )}

      {/* Projected screen: no management controls. Sound stays as a discreet toggle. */}
      <button
        onClick={() => void toggleSound()}
        aria-label={sound ? "כיבוי צלילים" : "הפעלת צלילים"}
        className="fixed bottom-4 start-4 h-10 w-10 rounded-full border border-input bg-background/70 text-sm opacity-40 transition-opacity hover:opacity-100"
      >
        {sound ? "🔊" : "🔇"}
      </button>

      {session && session.phase !== "LOBBY" && session.phase !== "GAME_COMPLETE" && (
        <div className="fixed bottom-4 end-4 rounded-xl border border-input bg-background/80 px-4 py-2 text-sm font-semibold backdrop-blur">
          <span className="text-muted-foreground">הצטרפות: קוד </span>
          <span className="tabular text-lg font-black text-primary" dir="ltr">
            {host.pin}
          </span>
        </div>
      )}
    </main>
  );
}
