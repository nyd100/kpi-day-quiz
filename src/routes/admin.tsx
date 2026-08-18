import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { auth, googleProvider } from "@/integrations/firebase/client";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

import { hostCommand } from "@/lib/game.functions";

import {
  adminCreateGame,
  adminCreateQuestion,
  adminDeleteQuestion,
  adminGetSettings,
  adminListQuestions,
  adminLogin,
  adminRemoveLogo,
  adminRemoveQuestionImage,
  adminReorderQuestions,
  adminRestoreDefaults,
  adminSaveQuestion,
  adminSetDefaultDuration,
  adminSetShowInsights,
  adminSetQuestionEnabled,
  adminUploadLogo,
  adminUploadQuestionImage,
  adminAddAuthorizedAdmin,
  adminRemoveAuthorizedAdmin,
  adminListAuthorizedAdmins,
} from "@/lib/admin.functions";
import {
  hostStorage,
  useCountdown,
  useHydrated,
  useLivePlayers,
  useLiveSession,
  useServerClock,
  useSessionQuestions,
  type HostIdentity,
} from "@/lib/use-game";
import {
  ANSWER_IDS,
  CATEGORY_LABEL,
  TOTAL_QUESTIONS,
  nextAction,
  type AnswerId,
  type GameAction,
} from "@/lib/quiz";

type HostControlAction =
  | GameAction
  | "RESET"
  | "DELETE"
  | "ADD_BOTS"
  | "CLEAR_BOTS"
  | "TOGGLE_LATE_JOIN";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "קונסולת ניהול – ממספרים לאימפקט" },
      { name: "description", content: "עריכת שאלות החידון, תמונות למסך הגדול ופתיחת משחק חדש." },
      { property: "og:title", content: "קונסולת ניהול – ממספרים לאימפקט" },
      {
        property: "og:description",
        content: "עריכת שאלות החידון, תמונות למסך הגדול ופתיחת משחק חדש.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type AdminQuestion = Awaited<ReturnType<typeof adminListQuestions>>[number];

function AdminPage() {
  const hydrated = useHydrated();
  const [token, setToken] = useState("");
  const [authed, setAuthed] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminsList, setAdminsList] = useState<string[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [game, setGame] = useState<HostIdentity | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [defaultDuration, setDefaultDuration] = useState(30);
  const [showInsights, setShowInsights] = useState(true);

  // ------------------------------------------------ live control of the game
  const now = useServerClock();
  const { session } = useLiveSession(game?.sessionId ?? null);
  const players = useLivePlayers(game?.sessionId ?? null);
  const sessionQuestions = useSessionQuestions(game?.sessionId ?? null);
  const questionIndex = session?.current_question_index ?? 0;
  const totalLive = session?.total_questions ?? sessionQuestions.length;
  const liveQuestion = sessionQuestions.find((q) => q.id === questionIndex) ?? null;
  const { seconds } = useCountdown(
    session?.phase === "QUESTION_ACTIVE" ? session.question_ends_at : null,
    now,
    liveQuestion?.durationSeconds ?? 20,
  );

  // Listen for Firebase Auth state changes
  useEffect(() => {
    setGame(hostStorage.get());
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // The live-game hooks sign the operator in anonymously so client-side
      // Firestore reads work; that is NOT an admin login. Only verify real
      // (Google) accounts here — otherwise the anonymous session triggers a
      // spurious "אין הרשאות ניהול" error before the login screen even shows.
      if (user && !user.isAnonymous) {
        try {
          const idToken = await user.getIdToken();
          setToken(idToken);
          // Verify admin access on the server
          const result = await adminLogin({ data: { token: idToken } });
          if (result.ok) {
            setAuthed(true);
            setUserEmail(user.email || "");
            // Load data
            await load(idToken);
            // Check if super admin and load admin list
            try {
              const admins = await adminListAuthorizedAdmins({ data: { token: idToken } });
              setAdminsList(admins);
              setIsSuperAdmin(admins.length > 0); // only super admins get the list
            } catch {
              setIsSuperAdmin(false);
            }
          } else {
            toast.error(result.message || "אין לך הרשאות ניהול.");
            await signOut(auth);
          }
        } catch (error) {
          console.error("Auth verification failed:", error);
          await signOut(auth);
        }
      } else {
        setToken("");
        setAuthed(false);
        setUserEmail("");
        setIsSuperAdmin(false);
        setAdminsList([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGoogleSignIn = async () => {
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error("ההתחברות נכשלה. נסו שוב.");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setAuthed(false);
    setToken("");
    setUserEmail("");
    setQuestions([]);
    toast.success("התנתקת בהצלחה.");
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    setBusy(true);
    try {
      await adminAddAuthorizedAdmin({ data: { token, email: newAdminEmail.trim() } });
      setAdminsList((prev) => [...prev, newAdminEmail.trim().toLowerCase()]);
      setNewAdminEmail("");
      toast.success("המנהל נוסף בהצלחה.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "הוספת המנהל נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`להסיר את ${email} מרשימת המנהלים?`)) return;
    setBusy(true);
    try {
      await adminRemoveAuthorizedAdmin({ data: { token, email } });
      setAdminsList((prev) => prev.filter((e) => e !== email));
      toast.success("המנהל הוסר.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "הסרת המנהל נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  const run = useCallback(
    async (action: HostControlAction, count?: number) => {
      const host = game;
      if (!host) return;
      setBusy(true);
      try {
        await hostCommand({
          data: { sessionId: host.sessionId, hostSecret: host.hostSecret, action, count },
        });
        if (action === "DELETE") {
          hostStorage.clear();
          setGame(null);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "הפעולה נכשלה.");
      } finally {
        setBusy(false);
      }
    },
    [game],
  );

  const load = async (code: string) => {
    const [list, settings] = await Promise.all([
      adminListQuestions({ data: { token: code } }),
      adminGetSettings({ data: { token: code } }),
    ]);
    setQuestions(list);
    setLogoUrl(settings.logoUrl);
    setDefaultDuration(settings.defaultDurationSeconds);
    setShowInsights(settings.showInsights);
  };

  const changeDefaultDuration = async (seconds: number) => {
    const next = Math.min(120, Math.max(5, seconds));
    const previous = defaultDuration;
    setDefaultDuration(next);
    try {
      await adminSetDefaultDuration({ data: { token, seconds: next } });
    } catch (error) {
      setDefaultDuration(previous);
      toast.error(error instanceof Error ? error.message : "שמירת ההגדרה נכשלה.");
    }
  };

  const toggleShowInsights = async (show: boolean) => {
    const previous = showInsights;
    setShowInsights(show);
    try {
      await adminSetShowInsights({ data: { token, show } });
    } catch (error) {
      setShowInsights(previous);
      toast.error(error instanceof Error ? error.message : "שמירת ההגדרה נכשלה.");
    }
  };

  const fileToBase64 = async (file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
    return btoa(binary);
  };



  const patch = (id: number, changes: Partial<AdminQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...changes } : q)));
  };

  const setAnswer = (id: number, answerId: AnswerId, text: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, answers: q.answers.map((a) => (a.id === answerId ? { ...a, text } : a)) }
          : q,
      ),
    );
  };

  const save = async (q: AdminQuestion) => {
    setBusy(true);
    try {
      await adminSaveQuestion({
        data: {
          token,
          question: {
            id: q.id,
            category: q.category,
            pairId: q.pairId,
            title: q.title,
            subtitle: q.subtitle,
            answerA: q.answers.find((a) => a.id === "A")?.text ?? "",
            answerB: q.answers.find((a) => a.id === "B")?.text ?? "",
            answerC: q.answers.find((a) => a.id === "C")?.text ?? "",
            answerD: q.answers.find((a) => a.id === "D")?.text ?? "",
            durationSeconds: q.durationSeconds,
            scoringMode: q.scoringMode,
            executiveInsight: q.executiveInsight,
            correctAnswerId: q.correctAnswerId,
            explanation: q.explanation,
            isPlaceholder: false,
          },
        },
      });
      patch(q.id, { isPlaceholder: false });
      toast.success(`שאלה ${q.id} נשמרה.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "השמירה נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  const upload = async (id: number, file: File) => {
    setBusy(true);
    try {
      const buffer = await file.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
      const res = await adminUploadQuestionImage({
        data: {
          token,
          questionId: id,
          fileName: file.name,
          contentType: file.type || "image/png",
          base64: btoa(binary),
        },
      });
      patch(id, { imageUrl: res.imageUrl });
      toast.success("התמונה הועלתה.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "העלאת התמונה נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  const removeImage = async (id: number) => {
    setBusy(true);
    try {
      await adminRemoveQuestionImage({ data: { token, questionId: id } });
      patch(id, { imageUrl: null });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "הסרת התמונה נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  const addQuestion = async () => {
    setBusy(true);
    try {
      const res = await adminCreateQuestion({ data: { token } });
      await load(token);
      setOpenId(res.id);
      toast.success("נוספה שאלה חדשה.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ההוספה נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  const removeQuestion = async (id: number) => {
    if (!confirm(`למחוק את שאלה ${id}?`)) return;
    setBusy(true);
    try {
      await adminDeleteQuestion({ data: { token, questionId: id } });
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      if (openId === id) setOpenId(null);
      toast.success("השאלה נמחקה.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "המחיקה נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  const toggleEnabled = async (id: number, isEnabled: boolean) => {
    patch(id, { isEnabled });
    try {
      await adminSetQuestionEnabled({ data: { token, questionId: id, isEnabled } });
    } catch (error) {
      patch(id, { isEnabled: !isEnabled });
      toast.error(error instanceof Error ? error.message : "העדכון נכשל.");
    }
  };

  const move = async (id: number, direction: -1 | 1) => {
    const index = questions.findIndex((q) => q.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= questions.length) return;
    const next = [...questions];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    setQuestions(next);
    try {
      await adminReorderQuestions({ data: { token, orderedIds: next.map((q) => q.id) } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "שינוי הסדר נכשל.");
      await load(token);
    }
  };

  const restoreDefaults = async () => {
    if (!confirm("לשחזר את 16 שאלות ברירת המחדל? כל השינויים יימחקו.")) return;
    setBusy(true);
    try {
      await adminRestoreDefaults({ data: { token } });
      await load(token);
      toast.success("השאלות שוחזרו.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "השחזור נכשל.");
    } finally {
      setBusy(false);
    }
  };

  const uploadLogo = async (file: File) => {
    setBusy(true);
    try {
      const res = await adminUploadLogo({
        data: {
          token,
          fileName: file.name,
          contentType: file.type || "image/png",
          base64: await fileToBase64(file),
        },
      });
      setLogoUrl(res.logoUrl);
      toast.success("הלוגו הועלה.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "העלאת הלוגו נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  const removeLogo = async () => {
    setBusy(true);
    try {
      await adminRemoveLogo({ data: { token } });
      setLogoUrl(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "הסרת הלוגו נכשלה.");
    } finally {
      setBusy(false);
    }
  };


  const startQuiz = async () => {
    setBusy(true);
    try {
      const created = await adminCreateGame({ data: { token } });
      const identity: HostIdentity = {
        sessionId: created.sessionId,
        pin: created.pin,
        hostSecret: created.hostSecret,
      };
      hostStorage.set(identity);
      setGame(identity);
      toast.success(`נפתח משחק עם קוד ${created.pin}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "פתיחת המשחק נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  if (!hydrated || authLoading) return null;

  if (!authed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
        <h1 className="text-3xl font-black">
          <span className="text-gradient-accent">קונסולת ניהול</span>
        </h1>
        <div className="surface-card w-full max-w-sm space-y-4 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            התחברו עם חשבון Google מורשה כדי לגשת לממשק הניהול.
          </p>
          <button
            onClick={() => void handleGoogleSignIn()}
            disabled={busy}
            className="h-14 w-full rounded-2xl bg-gradient-accent text-lg font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "מתחבר..." : "התחברות עם Google"}
          </button>
        </div>
      </main>
    );
  }

  const remaining = questions.filter((q) => q.isPlaceholder).length;
  const ready = questions.length === TOTAL_QUESTIONS && remaining === 0;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">
            <span className="text-gradient-accent">קונסולת ניהול</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {questions.length} שאלות · {remaining} עדיין בטיוטה
          </p>
          <p className="text-xs text-muted-foreground">
            מחובר כ-{userEmail}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/present"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-input px-4 py-2 text-sm font-semibold"
          >
            מסך המשחק החי
          </a>
          <button
            onClick={() => void handleSignOut()}
            className="rounded-xl border border-input px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            התנתקות
          </button>
        </div>
      </header>

      <section className="surface-card mb-6 space-y-3 p-5">
        <h2 className="text-lg font-bold">פתיחת חידון</h2>
        {ready ? (
          <p className="text-sm text-muted-foreground">כל השאלות נשמרו – אפשר לפתוח משחק.</p>
        ) : (
          <p className="text-sm text-amber-400">
            יש עדיין {remaining} שאלות שלא נשמרו. אפשר לפתוח משחק לצורכי בדיקה בלבד.
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => void startQuiz()}
            disabled={busy}
            className="h-12 rounded-xl bg-gradient-accent px-6 font-bold text-primary-foreground disabled:opacity-60"
          >
            פתיחת משחק חדש
          </button>
          {game && (
            <>
              <span className="tabular rounded-xl bg-primary px-4 py-2 text-lg font-black text-primary-foreground" dir="ltr">
                {game.pin}
              </span>
              <a
                href="/present"
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 rounded-xl border border-input px-6 font-semibold leading-[3rem]"
              >
                התחלת החידון ←
              </a>
            </>
          )}
        </div>
      </section>

      {game && (
        <section className="surface-card mb-6 space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">שליטה במשחק החי</h2>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-lg bg-muted px-3 py-1 font-semibold">
                {players.length} משתתפים
              </span>
              <span className="rounded-lg bg-muted px-3 py-1 font-semibold">
                {session?.phase ?? "—"}
              </span>
            </div>
          </div>

          {/* Current question — kept prominent so the operator always knows what's live */}
          <div className="rounded-xl border border-input bg-background/40 p-4">
            <p className="text-xs font-bold tracking-widest text-primary">
              {questionIndex >= 1 ? `שאלה ${questionIndex}/${totalLive}` : "בהמתנה לתחילת המשחק"}
            </p>
            {liveQuestion ? (
              <p className="mt-1 text-xl font-black leading-snug">{liveQuestion.title}</p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">אין שאלה פעילה כרגע.</p>
            )}
            {session?.phase === "QUESTION_ACTIVE" && (
              <p className="mt-2 text-sm text-muted-foreground">
                {players.length} משתתפים במשחק · נותרו {seconds} שניות
              </p>
            )}
          </div>

          {/* Flow controls — the main actions the operator clicks during the game */}
          <div className="flex flex-wrap items-center gap-2">
            {(() => {
              const step = session
                ? nextAction(session.phase, session.current_question_index, totalLive)
                : null;
              return (
                <button
                  onClick={() => step && void run(step.action)}
                  disabled={busy || !step}
                  className="h-14 flex-1 rounded-xl bg-gradient-accent px-6 text-lg font-bold text-primary-foreground disabled:opacity-50"
                >
                  {step ? `${step.label} ←` : "המשחק הסתיים"}
                </button>
              );
            })()}
            <button
              onClick={() => void run("LOCK")}
              disabled={busy || session?.phase !== "QUESTION_ACTIVE"}
              className="h-14 rounded-xl border border-input px-4 font-semibold disabled:opacity-50"
            >
              נעילת שאלה
            </button>
          </div>

          {/* Utility controls — separated so they don't get mistaken for the flow buttons */}
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              כלים
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => void run("ADD_BOTS", 10)}
                disabled={busy}
                className="h-11 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50"
              >
                + 10 בוטים
              </button>
              <button
                onClick={() => void run("ADD_BOTS", 100)}
                disabled={busy}
                className="h-11 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50"
              >
                + 100 בוטים
              </button>
              <button
                onClick={() => void run("CLEAR_BOTS")}
                disabled={busy}
                className="h-11 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50"
              >
                ניקוי בוטים
              </button>
              <button
                onClick={() => void run("TOGGLE_LATE_JOIN")}
                disabled={busy}
                className="h-11 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50"
              >
                {session?.allow_late_join ? "חסימת הצטרפות מאוחרת" : "אפשור הצטרפות מאוחרת"}
              </button>
              <button
                onClick={() => void run("RESET")}
                disabled={busy}
                className="h-11 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50"
              >
                איפוס
              </button>
              <button
                onClick={() => {
                  if (confirm("לסגור את המשחק הנוכחי?")) void run("DELETE");
                }}
                disabled={busy}
                className="h-11 rounded-xl border border-destructive/40 px-4 text-sm font-semibold text-destructive disabled:opacity-50"
              >
                סגירת משחק
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="surface-card mb-6 space-y-3 p-5">
        <h2 className="text-lg font-bold">זמן ברירת מחדל למענה</h2>
        <p className="text-sm text-muted-foreground">
          זמן המענה שיוגדר לשאלות חדשות. אפשר לשנות בקפיצות של 5 שניות.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => void changeDefaultDuration(defaultDuration - 5)}
            disabled={busy || defaultDuration <= 5}
            aria-label="הפחתת 5 שניות"
            className="h-11 w-11 rounded-xl border border-input text-lg font-bold disabled:opacity-40"
          >
            −
          </button>
          <span className="tabular w-24 rounded-xl bg-muted px-4 py-2 text-center text-lg font-black">
            {defaultDuration}s
          </span>
          <button
            onClick={() => void changeDefaultDuration(defaultDuration + 5)}
            disabled={busy || defaultDuration >= 120}
            aria-label="הוספת 5 שניות"
            className="h-11 w-11 rounded-xl border border-input text-lg font-bold disabled:opacity-40"
          >
            +
          </button>
        </div>
      </section>

      <section className="surface-card mb-6 space-y-3 p-5">
        <h2 className="text-lg font-bold">הצגת תובנות במסך המנחה</h2>
        <p className="text-sm text-muted-foreground">
          מאפשר הצגת תובנה מחושבת על אופן הצבעת המשתתפים.
        </p>
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={showInsights}
            onChange={(e) => void toggleShowInsights(e.target.checked)}
            disabled={busy}
            className="h-5 w-5 rounded border-input text-primary focus:ring-primary"
          />
          הצג תובנות מההצבעה (Insights)
        </label>
      </section>

      <section className="surface-card mb-6 space-y-3 p-5">
        <h2 className="text-lg font-bold">לוגו היחידה</h2>
        <div className="flex flex-wrap items-center gap-3">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="לוגו היחידה"
              className="h-16 w-16 rounded-xl border border-border object-contain"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadLogo(file);
              e.target.value = "";
            }}
            className="text-sm"
          />
          {logoUrl && (
            <button
              onClick={() => void removeLogo()}
              disabled={busy}
              className="rounded-xl border border-input px-3 py-2 text-sm font-semibold"
            >
              הסרת לוגו
            </button>
          )}
        </div>
      </section>

      <div className="mb-4 flex flex-wrap gap-3">
        <button
          onClick={() => void addQuestion()}
          disabled={busy}
          className="h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground disabled:opacity-60"
        >
          + הוספת שאלה
        </button>
        <button
          onClick={() => void restoreDefaults()}
          disabled={busy}
          className="h-11 rounded-xl border border-input px-5 font-semibold disabled:opacity-60"
        >
          שחזור שאלות ברירת המחדל
        </button>
      </div>

      {isSuperAdmin && (
        <section className="surface-card mb-6 space-y-3 p-5">
          <h2 className="text-lg font-bold">ניהול הרשאות</h2>
          <p className="text-sm text-muted-foreground">
            הוספה והסרה של חשבונות Google מורשים לניהול.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="email@example.com"
              dir="ltr"
              className="h-11 flex-1 rounded-xl border border-input bg-background/60 px-3 text-sm"
            />
            <button
              onClick={() => void handleAddAdmin()}
              disabled={busy || !newAdminEmail.trim()}
              className="h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground disabled:opacity-60"
            >
              הוספת מנהל
            </button>
          </div>
          <ul className="space-y-1 text-sm">
            {adminsList.map((email) => (
              <li key={email} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                <span dir="ltr">{email}</span>
                <button
                  onClick={() => void handleRemoveAdmin(email)}
                  disabled={busy}
                  className="text-xs font-semibold text-destructive hover:underline disabled:opacity-40"
                >
                  הסרה
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-3">
        {questions.map((q, index) => (
          <article key={q.id} className="surface-card overflow-hidden">
            <div className="flex items-center gap-2 p-2">
              <div className="flex flex-col">
                <button
                  onClick={() => void move(q.id, -1)}
                  disabled={busy || index === 0}
                  aria-label="העלאה למעלה"
                  className="rounded-md px-2 text-xs disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  onClick={() => void move(q.id, 1)}
                  disabled={busy || index === questions.length - 1}
                  aria-label="הורדה למטה"
                  className="rounded-md px-2 text-xs disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
              <button
                onClick={() => setOpenId(openId === q.id ? null : q.id)}
                className="flex flex-1 items-center justify-between gap-3 p-2 text-start"
              >
                <span className="flex-1">
                  <span className="text-xs font-bold text-primary">
                    {index + 1}. שאלה {q.id} · {CATEGORY_LABEL[q.category]}
                  </span>
                  <span className={`mt-1 block font-bold ${q.isEnabled ? "" : "opacity-40"}`}>
                    {q.title}
                  </span>
                </span>
                {q.isPlaceholder && (
                  <span className="rounded-lg bg-amber-500/15 px-2 py-1 text-xs font-bold text-amber-400">
                    טיוטה
                  </span>
                )}
              </button>
              <label className="flex shrink-0 items-center gap-1 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={q.isEnabled}
                  onChange={(e) => void toggleEnabled(q.id, e.target.checked)}
                />
                פעילה
              </label>
              <button
                onClick={() => void removeQuestion(q.id)}
                disabled={busy}
                className="shrink-0 rounded-lg border border-destructive/40 px-2 py-1 text-xs font-semibold text-destructive disabled:opacity-40"
              >
                מחיקה
              </button>
            </div>


            {openId === q.id && (
              <div className="space-y-4 border-t border-border p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="סוג">
                    <select
                      value={q.category}
                      onChange={(e) =>
                        patch(q.id, { category: e.target.value as AdminQuestion["category"] })
                      }
                      className="h-11 w-full rounded-xl border border-input bg-background/60 px-3"
                    >
                      <option value="OUTPUT">תפוקה · OUTPUT</option>
                      <option value="OUTCOME">אימפקט · OUTCOME</option>
                    </select>
                  </Field>
                  <Field label="זמן (שניות)">
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={q.durationSeconds}
                      onChange={(e) => patch(q.id, { durationSeconds: Number(e.target.value) })}
                      className="h-11 w-full rounded-xl border border-input bg-background/60 px-3"
                    />
                  </Field>
                </div>

                <Field label="שאלה">
                  <textarea
                    value={q.title}
                    onChange={(e) => patch(q.id, { title: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-input bg-background/60 p-3"
                  />
                </Field>

                <Field label="כותרת משנה">
                  <input
                    value={q.subtitle ?? ""}
                    onChange={(e) => patch(q.id, { subtitle: e.target.value || null })}
                    className="h-11 w-full rounded-xl border border-input bg-background/60 px-3"
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  {ANSWER_IDS.map((id) => (
                    <Field key={id} label={`תשובה ${id}`}>
                      <div className="flex items-center gap-2">
                        <input
                          value={q.answers.find((a) => a.id === id)?.text ?? ""}
                          onChange={(e) => setAnswer(q.id, id, e.target.value)}
                          className="h-11 w-full rounded-xl border border-input bg-background/60 px-3"
                        />
                        <label className="flex shrink-0 items-center gap-1 text-xs font-semibold">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswerId === id}
                            onChange={() => patch(q.id, { correctAnswerId: id })}
                          />
                          נכונה
                        </label>
                      </div>
                    </Field>
                  ))}
                </div>

                <Field label="תובנה ניהולית (מוצגת אחרי שאלת אימפקט)">
                  <textarea
                    value={q.executiveInsight ?? ""}
                    onChange={(e) => patch(q.id, { executiveInsight: e.target.value || null })}
                    rows={2}
                    className="w-full rounded-xl border border-input bg-background/60 p-3"
                  />
                </Field>

                <Field label="תמונה למסך הגדול">
                  <div className="flex flex-wrap items-center gap-3">
                    {q.imageUrl && (
                      <img
                        src={q.imageUrl}
                        alt={`תמונה לשאלה ${q.id}`}
                        className="h-20 w-32 rounded-lg border border-border object-cover"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void upload(q.id, file);
                        e.target.value = "";
                      }}
                      className="text-sm"
                    />
                    {q.imageUrl && (
                      <button
                        onClick={() => void removeImage(q.id)}
                        className="rounded-xl border border-input px-3 py-2 text-sm font-semibold"
                      >
                        הסרה
                      </button>
                    )}
                  </div>
                </Field>

                <button
                  onClick={() => void save(q)}
                  disabled={busy}
                  className="h-12 w-full rounded-xl bg-gradient-accent font-bold text-primary-foreground disabled:opacity-60"
                >
                  שמירת שאלה {q.id}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}


