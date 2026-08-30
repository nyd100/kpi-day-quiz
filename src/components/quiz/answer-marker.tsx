import type { CSSProperties } from "react";
import { ANSWER_META, type AnswerId, type AnswerMarkerMode, type AnswerPattern } from "@/lib/quiz";
import { cn } from "@/lib/utils";

// White ink for both the letter/number glyphs and the pattern strokes. It reads
// on the translucent-dark chip (player/stage tiles) and on the coloured chip
// (results bars) alike, so a single ink keeps every marker mode consistent.
const INK = "rgba(255,255,255,0.95)";

/** Fill texture per answer, drawn with pure CSS gradients (no assets). */
function patternStyle(pattern: AnswerPattern): CSSProperties {
  switch (pattern) {
    case "solid":
      return { background: INK };
    case "diagonal":
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${INK} 0 3px, transparent 3px 9px)`,
      };
    case "dots":
      return {
        backgroundImage: `radial-gradient(${INK} 1.7px, transparent 2px)`,
        backgroundSize: "9px 9px",
        backgroundPosition: "center",
      };
    case "grid":
      return {
        backgroundImage: `repeating-linear-gradient(0deg, ${INK} 0 2px, transparent 2px 9px), repeating-linear-gradient(90deg, ${INK} 0 2px, transparent 2px 9px)`,
      };
  }
}

/**
 * The non-colour identity marker shown inside an answer's badge. `mode` is chosen
 * by the operator for the whole quiz; `size` only scales the letter/number glyph
 * (the pattern fills whatever badge contains it).
 */
export function AnswerMarker({
  id,
  mode,
  size = "player",
}: {
  id: AnswerId;
  mode: AnswerMarkerMode;
  size?: "player" | "stage" | "results";
}) {
  const meta = ANSWER_META[id];

  if (mode === "pattern") {
    return (
      <span
        aria-hidden="true"
        className="block size-full rounded-[inherit]"
        style={patternStyle(meta.pattern)}
      />
    );
  }

  const glyph = mode === "number" ? meta.numeral : meta.letter;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "font-black text-primary-foreground",
        size === "stage" ? "text-3xl" : size === "results" ? "text-2xl" : "text-xl",
      )}
    >
      {glyph}
    </span>
  );
}

/** Accessible description of an answer's marker, for aria-labels. */
export function markerLabel(id: AnswerId, mode: AnswerMarkerMode): string {
  const meta = ANSWER_META[id];
  if (mode === "number") return meta.numeral;
  if (mode === "pattern") return meta.patternLabel;
  return meta.letter;
}
