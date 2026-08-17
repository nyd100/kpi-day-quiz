import { sortLeaderboard, type PlayerRow } from "@/lib/quiz";
import { cn } from "@/lib/utils";

const MEDALS = ["🥇", "🥈", "🥉"];

export function LeaderboardList({
  players,
  limit = 10,
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

  if (compact) {
    return (
      <ol className="space-y-2">
        {ranked.map((player, index) => (
          <li
            key={player.id}
            className={cn(
              "surface-card animate-rise flex items-center gap-3 px-4 py-2",
              highlightPlayerId === player.id && "ring-2 ring-accent",
            )}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span className="tabular grid size-9 shrink-0 place-items-center rounded-xl bg-foreground/10 font-bold text-sm">
              {index < 3 ? MEDALS[index] : index + 1}
            </span>
            <span className="min-w-0 flex-1 truncate font-semibold text-sm">
              {player.display_name}
            </span>
            <span className="tabular font-bold text-sm">
              {player.total_score.toLocaleString("he-IL")}
            </span>
          </li>
        ))}
      </ol>
    );
  }

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="grid gap-4 sm:grid-cols-3">
        {top3.map((player, index) => (
          <div
            key={player.id}
            className={cn(
              "surface-card animate-rise flex flex-col items-center justify-center gap-3 p-6 text-center shadow-lg",
              index === 0 && "bg-gradient-accent text-accent-foreground scale-105 z-10",
              highlightPlayerId === player.id && "ring-4 ring-accent",
            )}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <span className="text-6xl mb-2">{MEDALS[index]}</span>
            <span className="truncate w-full text-2xl font-black">{player.display_name}</span>
            <span className="tabular text-3xl font-bold">{player.total_score.toLocaleString("he-IL")}</span>
          </div>
        ))}
      </div>
      
      {rest.length > 0 && (
        <ol className="grid gap-x-8 gap-y-3 sm:grid-cols-2 mt-4 bg-muted/30 p-6 rounded-3xl">
          {rest.map((player, index) => (
            <li
              key={player.id}
              className={cn(
                "animate-rise flex items-center gap-4 rounded-xl bg-background p-3 shadow-sm",
                highlightPlayerId === player.id && "ring-2 ring-accent"
              )}
              style={{ animationDelay: `${(index + 3) * 60}ms` }}
            >
              <span className="tabular grid size-10 shrink-0 place-items-center rounded-xl bg-muted font-black text-muted-foreground">
                {index + 4}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold text-lg">
                {player.display_name}
              </span>
              <span className="tabular font-bold text-lg text-primary">
                {player.total_score.toLocaleString("he-IL")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
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
