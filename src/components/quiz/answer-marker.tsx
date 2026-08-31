import { ANSWER_META, type AnswerId, type AnswerMarkerMode, type AnswerPattern } from "@/lib/quiz";
import { cn } from "@/lib/utils";

/**
 * A crisp, centred motif per answer, drawn as an SVG so it reads as the same
 * family as the letter/number glyphs (white ink centred in the badge) rather
 * than a full-bleed texture. currentColor inherits the badge's foreground.
 */
function PatternGlyph({ pattern, className }: { pattern: AnswerPattern; className?: string }) {
  const line = {
    stroke: "currentColor",
    strokeWidth: 2.4,
    strokeLinecap: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {pattern === "solid" && <rect x="5" y="5" width="14" height="14" rx="4.5" fill="currentColor" />}
      {pattern === "diagonal" && (
        <g {...line}>
          <line x1="4" y1="10" x2="10" y2="4" />
          <line x1="4" y1="16" x2="16" y2="4" />
          <line x1="10" y1="16" x2="16" y2="10" />
        </g>
      )}
      {pattern === "dots" && (
        <g fill="currentColor">
          <circle cx="8.5" cy="8.5" r="2.4" />
          <circle cx="15.5" cy="8.5" r="2.4" />
          <circle cx="8.5" cy="15.5" r="2.4" />
          <circle cx="15.5" cy="15.5" r="2.4" />
        </g>
      )}
      {pattern === "grid" && (
        <g {...line}>
          <line x1="9.5" y1="5" x2="9.5" y2="19" />
          <line x1="14.5" y1="5" x2="14.5" y2="19" />
          <line x1="5" y1="9.5" x2="19" y2="9.5" />
          <line x1="5" y1="14.5" x2="19" y2="14.5" />
        </g>
      )}
    </svg>
  );
}

/**
 * The non-colour identity marker shown inside an answer's badge. `mode` is chosen
 * by the operator for the whole quiz; `size` scales the glyph/motif to the badge.
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
      <PatternGlyph
        pattern={meta.pattern}
        className={cn(
          "text-primary-foreground",
          size === "stage" ? "size-9" : size === "results" ? "size-7" : "size-6",
        )}
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
