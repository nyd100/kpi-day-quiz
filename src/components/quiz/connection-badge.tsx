import { connectionLabel, type ConnectionState } from "@/lib/use-game";
import { cn } from "@/lib/utils";

export function ConnectionBadge({ state }: { state: ConnectionState }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground"
      role="status"
    >
      <span
        className={cn(
          "size-2 rounded-full",
          state === "connected" && "bg-success",
          state === "connecting" && "bg-accent",
          state === "reconnecting" && "bg-accent",
          state === "offline" && "bg-destructive",
        )}
      />
      {connectionLabel(state)}
    </span>
  );
}
