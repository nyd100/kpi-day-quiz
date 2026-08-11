import { ANSWER_META, type AnswerId } from "@/lib/quiz";

export function AnswerShape({ id, className = "" }: { id: AnswerId; className?: string }) {
  const { shape } = ANSWER_META[id];
  const common = { fill: "currentColor" } as const;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {shape === "square" && <rect x="4" y="4" width="16" height="16" rx="2" {...common} />}
      {shape === "circle" && <circle cx="12" cy="12" r="8.5" {...common} />}
      {shape === "triangle" && <polygon points="12,3.5 21,20 3,20" {...common} />}
      {shape === "diamond" && <polygon points="12,2.5 21.5,12 12,21.5 2.5,12" {...common} />}
    </svg>
  );
}
