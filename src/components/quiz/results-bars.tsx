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
  return (
    <div className="space-y-3">
      {ANSWER_IDS.map((id) => {
        const meta = ANSWER_META[id];
        const percent = stats.percents[id];
        const isCorrect = correctAnswerId === id;
        return (
          <div
            key={id}
            className={cn(
              "surface-card flex items-center gap-4 p-3 transition-opacity",
              !isCorrect && correctAnswerId && "opacity-70",
            )}
          >
            <span
              className="grid size-10 shrink-0 place-items-center rounded-xl"
              style={{ backgroundColor: meta.color }}
            >
              <AnswerShape id={id} className="size-5 text-primary-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-base font-semibold">
                  {answers.find((a) => a.id === id)?.text}
                  {isCorrect && (
                    <span className="mr-2 rounded-md bg-success px-2 py-0.5 text-xs font-bold text-success-foreground">
                      נכון ✓
                    </span>
                  )}
                </p>
                <p className="tabular shrink-0 text-lg font-bold">
                  {percent}%{" "}
                  <span className="text-sm font-medium text-muted-foreground">
                    ({stats.counts[id]})
                  </span>
                </p>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${percent}%`, backgroundColor: meta.color }}
                />
              </div>
            </div>
          </div>
        );
      })}
      <p className="tabular text-center text-sm text-muted-foreground">
        ענו {stats.responses} מתוך {stats.totalPlayers} משתתפים · לא ענו {stats.noResponse}
        {stats.averageResponseMs !== null && (
          <> · זמן תגובה ממוצע {(stats.averageResponseMs / 1000).toFixed(1)} שניות</>
        )}
      </p>
    </div>
  );
}
