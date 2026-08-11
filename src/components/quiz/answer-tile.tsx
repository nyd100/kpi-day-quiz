import { AnswerShape } from "./answer-shape";
import { ANSWER_META, type AnswerId } from "@/lib/quiz";
import { cn } from "@/lib/utils";

type Props = {
  id: AnswerId;
  text: string;
  onSelect?: () => void;
  disabled?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  correct?: boolean;
  size?: "player" | "stage";
};

export function AnswerTile({
  id,
  text,
  onSelect,
  disabled,
  selected,
  dimmed,
  correct,
  size = "player",
}: Props) {
  const meta = ANSWER_META[id];
  const isButton = typeof onSelect === "function";
  const Comp = isButton ? "button" : "div";

  return (
    <Comp
      {...(isButton ? { type: "button" as const, onClick: onSelect, disabled } : {})}
      aria-label={`תשובה ${id} · ${meta.shapeLabel} · ${text}`}
      aria-pressed={isButton ? !!selected : undefined}
      style={{ backgroundColor: meta.color }}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-2xl px-4 text-right transition-all duration-200",
        "text-primary-foreground",
        size === "player" ? "min-h-[86px] py-3" : "min-h-[104px] py-4",
        isButton && !disabled && "hover:brightness-110 active:scale-[0.98]",
        selected && "ring-4 ring-accent",
        correct && "ring-4 ring-success",
        dimmed && "opacity-40 saturate-50",
      )}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-foreground/15">
        <AnswerShape id={id} className="size-6 text-primary-foreground" />
      </span>
      <span
        className={cn(
          "flex-1 font-semibold leading-snug text-primary-foreground",
          size === "player" ? "text-[17px]" : "text-2xl",
        )}
        style={{ color: "oklch(0.99 0 0)" }}
      >
        {text}
      </span>
      {correct && (
        <span className="rounded-lg bg-success px-2 py-1 text-xs font-bold text-success-foreground">
          התשובה הנכונה
        </span>
      )}
    </Comp>
  );
}
