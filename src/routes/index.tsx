import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { joinGame } from "@/lib/game.functions";
import { playerStorage, useHydrated } from "@/lib/use-game";
import { validateName, validatePin } from "@/lib/quiz";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ממספרים לאימפקט – כניסה למשחק" },
      {
        name: "description",
        content: "הצטרפו לחידון החי של סיכום חציון א' 2026 באמצעות קוד משחק בן ארבע ספרות.",
      },
      { property: "og:title", content: "ממספרים לאימפקט – כניסה למשחק" },
      {
        property: "og:description",
        content: "הצטרפו לחידון החי של סיכום חציון א' 2026 באמצעות קוד משחק בן ארבע ספרות.",
      },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [existing, setExisting] = useState<{ pin: string; displayName: string } | null>(null);

  useEffect(() => {
    const stored = playerStorage.get();
    if (stored) setExisting({ pin: stored.pin, displayName: stored.displayName });
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("pin");
    if (p && /^\d{4}$/.test(p)) setPin(p);
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validatePin(pin)) {
      toast.error("קוד המשחק חייב להיות בן 4 ספרות.");
      return;
    }
    const nameError = validateName(name);
    if (nameError) {
      toast.error(nameError);
      return;
    }
    setBusy(true);
    try {
      const identity = await joinGame({ data: { pin, displayName: name } });
      playerStorage.set(identity);
      await navigate({ to: "/play" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ההצטרפות נכשלה.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-4">
      <div className="w-full max-w-md">
        <header className="mb-4 text-center">
          <div className="mx-auto mb-3 w-full max-w-[14rem]">
            <img
              src="/strategy-division-logo.png"
              alt="חטיבת אסטרטגיה ותכנון מדיניות"
              className="h-auto w-full object-contain"
            />
          </div>
          <p className="mb-2 text-sm font-semibold tracking-widest text-primary">
            סיכום חציון א' 2026
          </p>
          <h1 className="text-4xl font-black leading-tight">
            <span className="text-gradient-accent">ממספרים לאימפקט</span>
          </h1>
          <p className="mt-3 text-muted-foreground">חידון חי – הצטרפו מהטלפון</p>
        </header>

        {hydrated && existing && (
          <div className="surface-card mb-3 flex items-center justify-between gap-3 p-3 text-sm">
            <span className="text-muted-foreground">
              יש חיבור פעיל בשם <strong className="text-foreground">{existing.displayName}</strong>
            </span>
            <Link
              to="/play"
              className="rounded-xl bg-primary px-3 py-2 font-semibold text-primary-foreground"
            >
              חזרה למשחק
            </Link>
          </div>
        )}

        <form onSubmit={onSubmit} className="surface-card space-y-4 p-5">
          <div>
            <label htmlFor="pin" className="mb-2 block text-sm font-semibold">
              קוד משחק
            </label>
            <input
              id="pin"
              inputMode="numeric"
              autoComplete="off"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="0000"
              dir="ltr"
              className="tabular h-16 w-full rounded-2xl border border-input bg-background/60 text-center text-4xl font-black tracking-[0.4em] text-foreground placeholder:text-muted-foreground/40"
            />
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold">
              שם
            </label>
            <input
              id="name"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="השם שיוצג במשחק"
              className="h-14 w-full rounded-2xl border border-input bg-background/60 px-4 text-lg font-semibold text-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="h-14 w-full rounded-2xl bg-gradient-accent text-lg font-bold text-primary-foreground transition-transform active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? "מצטרפים..." : "כניסה למשחק"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          המתינו להוראות המנחה על המסך הגדול.
        </p>
      </div>
    </main>
  );
}
