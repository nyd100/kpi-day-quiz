import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnswerMarker, markerLabel } from "./answer-marker";
import { ANSWER_META, type AnswerId, type AnswerMarkerMode } from "@/lib/quiz";
import { cn } from "@/lib/utils";

// useLayoutEffect on the client (no flash), useEffect on the server (no SSR warning).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Props = {
  id: AnswerId;
  text: string;
  onSelect?: () => void;
  disabled?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  correct?: boolean;
  size?: "player" | "stage";
  markerMode?: AnswerMarkerMode;
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
  markerMode = "letter",
}: Props) {
  const meta = ANSWER_META[id];
  const isButton = typeof onSelect === "function";
  const Comp = isButton ? "button" : "div";

  // Answer text is large by default and auto-shrinks only when a long answer
  // wouldn't otherwise fit the tile — measured against the tile's ACTUAL height
  // (which grows to fill the grid on the big screen), so tiles keep their normal
  // size and the text is as large as fits.
  const MAX = size === "stage" ? 36 : 22;
  const MIN = size === "stage" ? 18 : 13;
  const PAD = size === "stage" ? 32 : 24; // vertical padding (py-4 / py-3), both sides
  const tileRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontPx, setFontPx] = useState(MAX);
  useIsoLayoutEffect(() => {
    const tile = tileRef.current;
    const el = textRef.current;
    if (!tile || !el) return;
    const fit = () => {
      const avail = tile.clientHeight - PAD;
      if (tile.clientWidth === 0 || avail <= 0) return; // not laid out yet
      let s = MAX;
      el.style.fontSize = `${s}px`;
      let guard = 0;
      while (el.scrollHeight > avail && s > MIN && guard < 60) {
        s -= 1;
        el.style.fontSize = `${s}px`;
        guard++;
      }
      setFontPx(s);
    };
    fit();
    // Re-fit when the tile is resized (grid stretch, 16:9 ↔ 4:3, window resize).
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(fit);
    ro.observe(tile);
    return () => ro.disconnect();
  }, [text, size, correct, markerMode, MAX, MIN, PAD]);

  return (
    <Comp
      ref={tileRef as never}
      {...(isButton ? { type: "button" as const, onClick: onSelect, disabled } : {})}
      aria-label={`תשובה ${markerLabel(id, markerMode)} · ${text}`}
      aria-pressed={isButton ? !!selected : undefined}
      style={{ backgroundColor: meta.color }}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-2xl px-4 text-start transition-all duration-200",
        "text-primary-foreground",
        // Original sizing: a minimum height that stretches to fill the grid row.
        size === "player" ? "min-h-[86px] py-3" : "min-h-[104px] py-4",
        isButton && !disabled && "hover:brightness-110 active:scale-[0.98]",
        selected && "ring-4 ring-accent",
        correct && "ring-4 ring-success",
        dimmed && "opacity-40 saturate-50",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center overflow-hidden rounded-xl bg-foreground/15",
          size === "player" ? "size-11" : "size-14",
        )}
      >
        <AnswerMarker id={id} mode={markerMode} size={size} />
      </span>
      <div className="flex min-w-0 flex-1 items-center overflow-hidden">
        <span
          ref={textRef}
          className="font-bold leading-snug text-primary-foreground"
          style={{ color: "oklch(0.99 0 0)", fontSize: `${fontPx}px` }}
        >
          {text}
        </span>
      </div>
      {correct && (
        <span className="shrink-0 rounded-lg bg-success px-2 py-1 text-xs font-bold text-success-foreground">
          התשובה הנכונה
        </span>
      )}
    </Comp>
  );
}
