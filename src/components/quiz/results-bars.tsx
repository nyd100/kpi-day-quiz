import { useEffect, useState } from "react";
import { AnswerShape } from "./answer-shape";
import { ANSWER_IDS, ANSWER_META, type AnswerId, type QuestionStatistics } from "@/lib/quiz";
import { cn } from "@/lib/utils";

export function ResultsBars({
  stats,
  answers,
  correctAnswerId,
}: {
  stats: QuestionStatistics;
  answers: { id: AnswerId; text: string }[];
  correctAnswerId: AnswerId | null;
}) {
  const [revealPhase, setRevealPhase] = useState(0);

  useEffect(() => {
    if (!correctAnswerId) {
      setRevealPhase(0);
      return;
    }
    const t1 = setTimeout(() => setRevealPhase(1), 800); // Bars animate for 700ms, then fade incorrect
    const t2 = setTimeout(() => setRevealPhase(2), 1400); // Then emphasize correct
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [correctAnswerId]);

  return (
    <div className="flex flex-col gap-4 mt-auto pt-4">
      <div className="grid gap-4 sm:grid-cols-2 flex-1">
        {ANSWER_IDS.map((id) => {
          const meta = ANSWER_META[id];
          const percent = stats.percents[id];
          const isCorrect = correctAnswerId === id;
          const fadeOut = revealPhase >= 1 && !isCorrect && correctAnswerId;
          const emphasize = revealPhase >= 2 && isCorrect;

          return (
            <div
              key={id}
              className={cn(
                "surface-card flex flex-col justify-center gap-3 p-5 transition-all duration-500",
                fadeOut && "opacity-40 grayscale-[30%] scale-[0.98]",
                emphasize && "ring-4 ring-success ring-offset-4 ring-offset-background scale-[1.08] shadow-2xl z-10 bg-success/5",
                "relative"
              )}
            >
              {emphasize && (
                <div className="absolute -top-4 -end-4 rounded-full bg-success text-success-foreground px-4 py-1 text-sm font-black shadow-lg animate-in zoom-in spin-in-12 duration-500">
                  התשובה הנכונה
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <span
                  className="grid size-12 shrink-0 place-items-center rounded-xl transition-all duration-500"
                  style={{ backgroundColor: emphasize ? "var(--success)" : meta.color }}
                >
                  <AnswerShape id={id} className="size-6 text-primary-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className={cn("text-lg font-bold leading-tight", emphasize && "text-success font-black")}>
                      {answers.find((a) => a.id === id)?.text}
                      {isCorrect && revealPhase >= 1 && !emphasize && (
                        <span className="ms-2 inline-flex items-center rounded-md bg-success px-2 py-0.5 text-xs font-bold text-success-foreground">
                          נכון ✓
                        </span>
                      )}
                    </p>
                    <div className="text-end shrink-0">
                      <p className={cn("tabular text-2xl font-black", emphasize && "text-success")}>
                        {percent}%
                      </p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stats.counts[id]} הצבעות
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-muted/50 mt-2">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-700 ease-out", emphasize && "bg-success")}
                  style={{ width: `${percent}%`, backgroundColor: emphasize ? undefined : meta.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="surface-card p-4 mt-4 text-center">
        <p className="tabular text-base font-medium text-muted-foreground">
          <strong className="text-foreground">{stats.responses}</strong> מתוך <strong className="text-foreground">{stats.totalPlayers}</strong> משתתפים ענו ({stats.percents.A + stats.percents.B + stats.percents.C + stats.percents.D}% השתתפות)
          {stats.averageResponseMs !== null && (
            <> &middot; זמן תגובה ממוצע <strong>{(stats.averageResponseMs / 1000).toFixed(1)} שניות</strong></>
          )}
        </p>
      </div>
    </div>
  );
}
