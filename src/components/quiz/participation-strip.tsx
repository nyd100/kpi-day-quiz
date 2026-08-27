import { useMemo } from "react";
import { type AnswerRow, type PlayerRow } from "@/lib/quiz";

export function ParticipationStrip({
  answers,
  players,
}: {
  answers: AnswerRow[];
  players: PlayerRow[];
}) {
  const { count, recentNames, moreCount } = useMemo(() => {
    // Only count valid, non-duplicate answers (useQuestionAnswers handles this or just length).
    // The query returns one row per player per question.
    // Deliberately show only how many have answered — not "X of Y" and not a
    // percentage — so a low turnout never looks embarrassing on the big screen.
    const count = answers.length;

    // Sort answers by response_ms descending (largest = most recent)
    const sorted = [...answers].sort((a, b) => b.response_ms - a.response_ms);

    const names: string[] = [];
    for (const a of sorted) {
      const p = players.find((p) => p.id === a.player_id);
      if (p) {
        names.push(p.display_name);
      }
    }

    const limit = 12;
    const recentNames = names.slice(0, limit);
    const moreCount = Math.max(0, count - limit);

    return { count, recentNames, moreCount };
  }, [answers, players]);

  return (
    <div className="surface-card flex flex-col sm:flex-row items-center gap-4 px-4 py-3 text-sm animate-in fade-in slide-in-from-bottom-2">
      <div className="font-bold text-primary shrink-0 whitespace-nowrap">
        {count} כבר ענו
      </div>

      {recentNames.length > 0 && (
        <div className="flex flex-1 flex-wrap items-center gap-2 overflow-hidden">
          <span className="font-semibold text-foreground shrink-0">המשיבים האחרונים:</span>
          {recentNames.map((name, i) => (
            <span
              key={i}
              className="rounded-full border border-primary/30 bg-primary/15 px-3 py-0.5 font-bold text-foreground animate-in zoom-in duration-300"
            >
              {name}
            </span>
          ))}
          {moreCount > 0 && (
            // Same look as the name pills (color/font/size) but without the border.
            <span className="rounded-full bg-primary/15 px-3 py-0.5 font-bold text-foreground">
              +{moreCount} נוספים
            </span>
          )}
        </div>
      )}
    </div>
  );
}
