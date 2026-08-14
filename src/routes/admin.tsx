import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
  adminSetQuestionEnabled,
  adminUploadLogo,
  adminUploadQuestionImage,
} from "@/lib/admin.functions";
import { hostStorage, useHydrated, type HostIdentity } from "@/lib/use-game";
import { ANSWER_IDS, CATEGORY_LABEL, TOTAL_QUESTIONS, type AnswerId } from "@/lib/quiz";

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

const PASS_KEY = "impact2026.admin";

function AdminPage() {
  const hydrated = useHydrated();
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [game, setGame] = useState<HostIdentity | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? sessionStorage.getItem(PASS_KEY) : null;
    if (stored) void unlock(stored, true);
    setGame(hostStorage.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async (code: string) => {
    const [list, settings] = await Promise.all([
      adminListQuestions({ data: { passcode: code } }),
      adminGetSettings({ data: { passcode: code } }),
    ]);
    setQuestions(list);
    setLogoUrl(settings.logoUrl);
  };

  const fileToBase64 = async (file: File) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
    return btoa(binary);
  };

  const unlock = async (code: string, silent = false) => {
    setBusy(true);
    try {
      const res = await adminLogin({ data: { passcode: code } });
      if (!res.ok) {
        sessionStorage.removeItem(PASS_KEY);
        if (!silent) toast.error("קוד ניהול שגוי.");
        return;
      }
      sessionStorage.setItem(PASS_KEY, code);
      setPasscode(code);
      setAuthed(true);
      await load(code);
    } catch (error) {
      if (!silent) toast.error(error instanceof Error ? error.message : "הכניסה נכשלה.");
    } finally {
      setBusy(false);
    }
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
          passcode,
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
          passcode,
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
      await adminRemoveQuestionImage({ data: { passcode, questionId: id } });
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
      const res = await adminCreateQuestion({ data: { passcode } });
      await load(passcode);
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
      await adminDeleteQuestion({ data: { passcode, questionId: id } });
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
      await adminSetQuestionEnabled({ data: { passcode, questionId: id, isEnabled } });
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
      await adminReorderQuestions({ data: { passcode, orderedIds: next.map((q) => q.id) } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "שינוי הסדר נכשל.");
      await load(passcode);
    }
  };

  const restoreDefaults = async () => {
    if (!confirm("לשחזר את 16 שאלות ברירת המחדל? כל השינויים יימחקו.")) return;
    setBusy(true);
    try {
      await adminRestoreDefaults({ data: { passcode } });
      await load(passcode);
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
          passcode,
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
      await adminRemoveLogo({ data: { passcode } });
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
      const created = await adminCreateGame({ data: { passcode } });
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

  if (!hydrated) return null;

  if (!authed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
        <h1 className="text-3xl font-black">
          <span className="text-gradient-accent">קונסולת ניהול</span>
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void unlock(input);
          }}
          className="surface-card w-full max-w-sm space-y-4 p-6"
        >
          <label htmlFor="pass" className="block text-sm font-semibold">
            קוד ניהול
          </label>
          <input
            id="pass"
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-14 w-full rounded-2xl border border-input bg-background/60 px-4 text-lg font-semibold"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-14 w-full rounded-2xl bg-gradient-accent text-lg font-bold text-primary-foreground disabled:opacity-60"
          >
            כניסה
          </button>
        </form>
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
        </div>
        <Link to="/present" className="rounded-xl border border-input px-4 py-2 text-sm font-semibold">
          מסך המשחק החי
        </Link>
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
              <Link
                to="/present"
                className="h-12 rounded-xl border border-input px-6 font-semibold leading-[3rem]"
              >
                התחלת החידון ←
              </Link>
            </>
          )}
        </div>
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
                className="flex flex-1 items-center justify-between gap-3 p-2 text-right"
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
