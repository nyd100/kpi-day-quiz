import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { AnswerTile } from "@/components/quiz/answer-tile";
import { ConnectionBadge } from "@/components/quiz/connection-badge";
import { Countdown } from "@/components/quiz/countdown";
import { LeaderboardList, Podium } from "@/components/quiz/leaderboard";
import { ParticipationStrip } from "@/components/quiz/participation-strip";
import { ResultsBars } from "@/components/quiz/results-bars";
import { enableSound, playCue, setMuted, setSoundPack } from "@/lib/sound";
import { autoAdvance } from "@/lib/game.functions";
import {
  useActiveGame,
  useAnswerMarker,
  useSoundPack,
  useSoundEnabled,
  useAppSetting,
  useCountdown,
  useHydrated,
  useLivePlayers,
  useLiveSession,
  useQuestionAnswers,
  useServerClock,
  useSessionQuestions,
} from "@/lib/use-game";
import { CATEGORY_LABEL, computeStatistics, type AnswerId } from "@/lib/quiz";

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
  const active = useActiveGame();
  // Audio is ON by default; the operator mutes/unmutes from the admin console
  // (sound_enabled setting). The browser still requires one user gesture on THIS
  // page before any audio can start, so we unlock the context on first interaction.
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const soundEnabled = useSoundEnabled();
  const unlockAudio = useCallback(async () => {
    const ok = await enableSound();
    if (ok) setAudioUnlocked(true);
  }, []);

  const now = useServerClock();
  const { session, connection } = useLiveSession(active?.sessionId ?? null);
  const questions = useSessionQuestions(active?.sessionId ?? null);
  const players = useLivePlayers(active?.sessionId ?? null);
  const logoUrl = useAppSetting("org_logo_url");
  const aspectSetting = useAppSetting("present_aspect");
  const markerMode = useAnswerMarker();
  const soundPack = useSoundPack();

  // Keep the synth engine in sync with the operator-selected pack.
  useEffect(() => {
    setSoundPack(soundPack);
  }, [soundPack]);

  const questionIndex = session?.current_question_index ?? 0;
  const totalQuestions = session?.total_questions ?? questions.length;
  const question = useMemo(
    () => questions.find((q) => q.id === questionIndex) ?? null,
    [questions, questionIndex],
  );
  // Auto-fit the fun-fact text: shrink the font until the framed card fits the
  // available section height, so any length shows in full with no clipping.
  const factSectionRef = useRef<HTMLElement | null>(null);
  const factCardRef = useRef<HTMLDivElement | null>(null);
  const [factFontPx, setFactFontPx] = useState(48);
  useLayoutEffect(() => {
    if (session?.phase !== "SHOW_FACT") return;
    const section = factSectionRef.current;
    const card = factCardRef.current;
    const p = card?.querySelector<HTMLElement>("[data-fact-text]");
    if (!section || !card || !p) return;
    const MAX = 52;
    const MIN = 16;
    const avail = section.clientHeight - 16; // small breathing margin
    let size = MAX;
    p.style.fontSize = `${size}px`;
    // Linearly shrink until the card fits the section (bounded iterations).
    let guard = 0;
    while (card.scrollHeight > avail && size > MIN && guard < 40) {
      size -= 2;
      p.style.fontSize = `${size}px`;
      guard++;
    }
    setFactFontPx(size);
  }, [session?.phase, question?.funFact]);

  const answers = useQuestionAnswers(
    active?.sessionId ?? null,
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
    if (phase === "SHOW_FACT") playCue("fact");
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
      playCue("tick", { remaining: seconds });
    }
    if (seconds > 5) lastTick.current = 0;
  }, [seconds, session?.phase]);

  // Mirror the operator's mute switch into the sound engine.
  useEffect(() => {
    setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Unlock the audio context on the first interaction with the projected screen
  // (browser autoplay policy). Any click/key anywhere counts; after that, sound
  // plays automatically on every cue unless muted from the admin console.
  useEffect(() => {
    if (audioUnlocked) return;
    const handler = () => void unlockAudio();
    window.addEventListener("pointerdown", handler, { once: true });
    window.addEventListener("keydown", handler, { once: true });
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [audioUnlocked, unlockAudio]);

  // Fixed-height design canvas (1080 = real projector height) scaled to fit the
  // screen. Height is constant across ratios so the tallest phase (SHOW_RESULTS)
  // has room and never clips; only the width changes with the chosen aspect.
  const canvas = aspectSetting === "4:3" ? { w: 1440, h: 1080 } : { w: 1920, h: 1080 };
  const [stageScale, setStageScale] = useState(1);
  useEffect(() => {
    const fit = () => {
      const s = Math.min(window.innerWidth / canvas.w, window.innerHeight / canvas.h);
      setStageScale(s > 0 ? s : 1);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [canvas.w, canvas.h]);

  // Drive the time-based auto-advance from the projected screen. /present is
  // always the foreground display, so its 1s interval is never throttled the way
  // a backgrounded admin console tab would be — the question locks and the answer
  // is revealed on time even if no operator console is focused. The endpoint is
  // public + idempotent + time-gated (see autoAdvance in game.functions).
  const advanceInFlight = useRef(false);
  useEffect(() => {
    const p = session?.phase;
    if (p !== "QUESTION_ACTIVE" && p !== "QUESTION_LOCKED") return;
    const runAdvance = async () => {
      if (advanceInFlight.current) return;
      advanceInFlight.current = true;
      try {
        await autoAdvance();
      } catch {
        /* transient */
      } finally {
        advanceInFlight.current = false;
      }
    };
    const id = setInterval(() => void runAdvance(), 1000);
    return () => clearInterval(id);
  }, [session?.phase]);

  if (!hydrated) return null;

  if (!active) {
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
    typeof window !== "undefined" ? `${window.location.origin}/?pin=${active.pin}` : "";

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
      <div
        style={{
          width: canvas.w,
          height: canvas.h,
          transform: `scale(${stageScale})`,
          transformOrigin: "center center",
        }}
        className="shrink-0"
      >
      <main className="flex h-full w-full flex-col gap-6 p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-2xl bg-white px-5 py-3 shadow-lg">
            <img
              src="/ministry-logo.png"
              alt="לוגו משרד העלייה והקליטה"
              className="h-16 w-auto object-contain"
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
          <span className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            קוד הצטרפות:{" "}
            <span className="tabular text-xl font-black" dir="ltr">
              {active.pin}
            </span>
          </span>
        </div>
      </header>

      {session?.phase === "LOBBY" && (
        <section className="surface-card flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center min-h-0 overflow-hidden">
          <p className="text-lg text-muted-foreground">הצטרפו מהטלפון עם הקוד</p>
          <div className="flex flex-col items-center gap-6">
            {joinUrl && (
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-2xl bg-white p-4">
                  <QRCodeSVG value={joinUrl} size={220} marginSize={2} level="M" />
                </div>
                <p className="text-muted-foreground">סרקו להצטרפות מהירה</p>
              </div>
            )}
            <p className="tabular text-8xl font-black tracking-[0.2em] text-gradient-accent" dir="ltr">
              {active.pin}
            </p>
          </div>
          <p className="text-muted-foreground">{players.length} משתתפים מחוברים</p>
          <LeaderboardList players={players} limit={5} compact />
        </section>
      )}

      {session && session.phase !== "LOBBY" && session.phase !== "GAME_COMPLETE" && session.phase !== "SHOW_FACT" && question && (
        // No overflow-hidden here: the correct-answer tile emphasis (ring +
        // slight scale + badge) renders OUTSIDE its box, and clipping it cut the
        // green ring at the screen edge. The 1080-tall canvas already gives the
        // content vertical room, so nothing needs clipping at the section level.
        <section className="surface-card flex flex-1 flex-col gap-6 p-8 min-h-0">
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
                <AnswerTile key={a.id} id={a.id} text={a.text} size="stage" markerMode={markerMode} />
              ))}
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
                markerMode={markerMode}
              />
            </div>
          )}

          {session.phase === "LEADERBOARD" && <LeaderboardList players={players} limit={10} />}
        </section>
      )}

      {/* Interesting fact: its own full-screen, animated focus moment (no lingering
          question), sized big so the audience's attention snaps to it. */}
      {session?.phase === "SHOW_FACT" && (
        // Focus comes purely from how the content ENTERS (one-shot zoom/slide/fade),
        // not from any looping/flickering element on screen.
        <section
          ref={factSectionRef}
          key={question?.id ?? "fact"}
          className="flex flex-1 flex-col items-center justify-center overflow-hidden p-10"
        >
          {/* A distinctly framed card that grows small -> large as it enters, so it
              pops and grabs the room's focus (one-shot, nothing looping). The text
              auto-shrinks (see the layout effect) so any length fits with no clip. */}
          <div
            ref={factCardRef}
            className="flex max-h-full max-w-5xl flex-col items-center gap-5 rounded-[2.5rem] border-4 border-primary bg-primary/5 px-16 py-10 text-center shadow-2xl shadow-primary/25 animate-in fade-in zoom-in-50 duration-700"
          >
            <span className="text-7xl">💡</span>
            <span className="rounded-full bg-gradient-accent px-8 py-2 text-2xl font-black text-primary-foreground shadow-lg">
              עובדה מעניינת
            </span>
            <p
              data-fact-text
              style={{ fontSize: `${factFontPx}px` }}
              className="font-black leading-tight text-foreground"
            >
              {question?.funFact}
            </p>
          </div>
        </section>
      )}

      {/* Final winners: a clean end screen — only the podium, no lingering question. */}
      {session?.phase === "GAME_COMPLETE" && (
        <section className="surface-card flex flex-1 flex-col items-center justify-center gap-10 p-10 text-center min-h-0">
          <h2 className="text-5xl font-black text-gradient-accent">התוצאות הסופיות 🎉</h2>
          <Podium players={players} />
        </section>
      )}

      </main>
      </div>
      {/* Projected screen: no sound controls (mute/unmute lives in the admin
          console). A one-time prompt appears only while sound is wanted but the
          browser hasn't been unlocked yet — clicking it (or anything) unlocks. */}
      {active && soundEnabled && !audioUnlocked && (
        <button
          onClick={() => void unlockAudio()}
          className="fixed bottom-4 start-4 z-20 h-10 rounded-full border border-input bg-background/90 px-4 text-sm font-bold shadow-lg transition-opacity hover:opacity-100"
        >
          🔊 הפעלת קול
        </button>
      )}
      {/* Discreet, centered credit — low opacity + pointer-events-none so it never
          competes with or blocks the game graphics. */}
      <p className="pointer-events-none fixed inset-x-0 bottom-2 z-10 text-center text-xs text-muted-foreground">
        פותח בשיתוף אגף אסטרטגיה ואגף נתונים ובינה מלאכותית
      </p>
    </div>
  );
}
