import { sortLeaderboard, type PlayerRow } from "@/lib/quiz";
import { cn } from "@/lib/utils";

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardList({
  players,
  limit = 5,
  highlightPlayerId,
  compact = false,
}: {
  players: PlayerRow[];
  limit?: number;
  highlightPlayerId?: string | null;
  compact?: boolean;
}) {
  const ranked = sortLeaderboard(players).slice(0, limit);

  if (ranked.length === 0) {
    return <p className="text-center text-muted-foreground">עדיין אין נקודות להצגה.</p>;
  }

  return (
    <ol className="space-y-2">
      {ranked.map((player, index) => (
        <li
          key={player.id}
          className={cn(
            "surface-card animate-rise flex items-center gap-3 px-4",
            compact ? "py-2" : "py-3",
            highlightPlayerId === player.id && "ring-2 ring-accent",
            index === 0 && !compact && "bg-gradient-accent text-accent-foreground",
          )}
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <span
            className={cn(
              "tabular grid size-9 shrink-0 place-items-center rounded-xl bg-foreground/10 font-bold",
              compact ? "text-sm" : "text-lg",
            )}
          >
            {index < 3 ? MEDALS[index] : index + 1}
          </span>
          <span
            className={cn("min-w-0 flex-1 truncate font-semibold", compact ? "text-sm" : "text-xl")}
          >
            {player.display_name}
          </span>
          <span className={cn("tabular font-bold", compact ? "text-sm" : "text-xl")}>
            {player.total_score.toLocaleString("he-IL")}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Podium({ players }: { players: PlayerRow[] }) {
  const top = sortLeaderboard(players).slice(0, 3);
  const order = [1, 0, 2];
  const heights = ["h-28", "h-40", "h-20"];
  return (
    <div className="flex items-end justify-center gap-4">
      {order.map((position, slot) => {
        const player = top[position];
        if (!player) return <div key={slot} className="w-32" />;
        return (
          <div key={player.id} className="flex w-40 flex-col items-center gap-2">
            <span className="text-4xl">{MEDALS[position]}</span>
            <p className="line-clamp-2 text-center text-lg font-bold">{player.display_name}</p>
            <p className="tabular text-2xl font-black text-primary">
              {player.total_score.toLocaleString("he-IL")}
            </p>
            <div
              className={cn(
                "w-full rounded-t-2xl bg-gradient-accent",
                heights[position === 0 ? 1 : position === 1 ? 0 : 2],
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
