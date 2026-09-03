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

  // Answer text is large by default and auto-shrinks to fit its fixed-height box,
  // so a long answer never overflows the tile or crowds the layout.
  const MAX = size === "stage" ? 36 : 22;
  const MIN = size === "stage" ? 18 : 13;
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontPx, setFontPx] = useState(MAX);
  useIsoLayoutEffect(() => {
    const box = boxRef.current;
    const el = textRef.current;
    if (!box || !el) return;
    // Shrink from MAX until the (wrapped) text height fits the box height.
    const fit = () => {
      if (box.clientWidth === 0) return; // hidden/unlaid-out: skip, re-run on resize
      let s = MAX;
      el.style.fontSize = `${s}px`;
      let guard = 0;
      while (el.scrollHeight > box.clientHeight + 1 && s > MIN && guard < 60) {
        s -= 1;
        el.style.fontSize = `${s}px`;
        guard++;
      }
      setFontPx(s);
    };
    fit();
    // Re-fit if the tile is resized (e.g. the operator switches 16:9 ↔ 4:3).
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [text, size, correct, markerMode, MAX, MIN]);

  return (
    <Comp
      {...(isButton ? { type: "button" as const, onClick: onSelect, disabled } : {})}
      aria-label={`תשובה ${markerLabel(id, markerMode)} · ${text}`}
      aria-pressed={isButton ? !!selected : undefined}
      style={{ backgroundColor: meta.color }}
      className={cn(
        "relative flex w-full items-center gap-3 rounded-2xl px-4 text-start transition-all duration-200",
        "text-primary-foreground",
        size === "player" ? "h-[88px] py-3" : "h-[116px] py-4",
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
      <div ref={boxRef} className="flex h-full min-w-0 flex-1 items-center overflow-hidden">
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
