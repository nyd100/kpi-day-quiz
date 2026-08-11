import { cn } from "@/lib/utils";

export function Countdown({
  seconds,
  ratio,
  size = 120,
}: {
  seconds: number;
  ratio: number;
  size?: number;
}) {
  const urgent = seconds <= 5 && seconds > 0;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn("relative shrink-0", urgent && "animate-pulse-urgent")}
      style={{ width: size, height: size }}
      role="timer"
      aria-live="off"
      aria-label={`נותרו ${seconds} שניות`}
    >
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={radius} className="fill-none stroke-border" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={cn("fill-none transition-[stroke-dashoffset] duration-200", urgent ? "stroke-destructive" : "stroke-primary")}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>
      <span
        className={cn(
          "tabular absolute inset-0 grid place-items-center text-3xl font-bold",
          urgent ? "text-destructive" : "text-foreground",
        )}
      >
        {seconds}
      </span>
    </div>
  );
}
