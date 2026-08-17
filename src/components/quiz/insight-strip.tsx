import { type AnswerId, type QuestionCategory, type QuestionStatistics } from "@/lib/quiz";
import { generateVotingInsight } from "@/lib/insight";
import { Sparkles } from "lucide-react";

export function InsightStrip({
  stats,
  answers,
  category,
  correctAnswerId,
}: {
  stats: QuestionStatistics;
  answers: { id: AnswerId; text: string }[];
  category: QuestionCategory;
  correctAnswerId: AnswerId | null;
}) {
  const insight = generateVotingInsight(stats, answers, category, correctAnswerId);

  if (!insight) return null;

  return (
    <div className="surface-card mt-4 flex items-start gap-4 p-5 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-1000 fill-mode-both border-l-4 border-l-accent bg-accent/5">
      <div className="rounded-full bg-accent/20 p-2 text-accent">
        <Sparkles className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-accent mb-1">תובנה מההצבעה</h3>
        <p className="text-lg leading-relaxed text-foreground font-medium">
          {insight}
        </p>
      </div>
    </div>
  );
}
