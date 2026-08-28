// Browser-safe shared quiz domain model, state machine and pure scoring logic.

export type GamePhase =
  | "LOBBY"
  | "QUESTION_INTRO"
  | "QUESTION_ACTIVE"
  | "QUESTION_LOCKED"
  | "SHOW_RESULTS"
  | "SHOW_FACT"
  | "LEADERBOARD"
  | "GAME_COMPLETE";

export type QuestionCategory = "OUTPUT" | "OUTCOME";
export type ScoringMode = "QUIZ" | "POLL";
export type AnswerId = "A" | "B" | "C" | "D";

export const ANSWER_IDS: AnswerId[] = ["A", "B", "C", "D"];
export const TOTAL_QUESTIONS = 14;

export type QuizQuestion = {
  id: number;
  category: QuestionCategory;
  pairId: number | null;
  title: string;
  subtitle: string | null;
  answers: { id: AnswerId; text: string }[];
  durationSeconds: number;
  scoringMode: ScoringMode;
  executiveInsight: string | null;
  isPlaceholder: boolean;
  imageUrl: string | null;
  // "עובדה מעניינת" shown on the big screen after results, before the ranking.
  funFact: string | null;
  funFactEnabled: boolean;
};

export type SessionRow = {
  id: string;
  pin: string;
  title: string;
  status: string;
  phase: GamePhase;
  current_question_index: number;
  question_started_at: string | null;
  question_ends_at: string | null;
  revealed_answer_id: string | null;
  allow_late_join: boolean;
  expires_at: string;
  total_questions: number;
};

export type PlayerRow = {
  id: string;
  session_id: string;
  display_name: string;
  total_score: number;
  correct_count: number;
  cumulative_response_ms: number;
  is_virtual: boolean;
  joined_at: string;
  streak?: number;
  best_streak?: number;
};

export type AnswerRow = {
  player_id: string;
  question_id: number;
  answer_id: string;
  response_ms: number;
};

/** Identity system: position + colour + shape + text (never colour alone). */
export const ANSWER_META: Record<
  AnswerId,
  { color: string; shape: "square" | "circle" | "triangle" | "diamond"; shapeLabel: string }
> = {
  A: { color: "var(--answer-a)", shape: "square", shapeLabel: "ריבוע" },
  B: { color: "var(--answer-b)", shape: "circle", shapeLabel: "עיגול" },
  C: { color: "var(--answer-c)", shape: "triangle", shapeLabel: "משולש" },
  D: { color: "var(--answer-d)", shape: "diamond", shapeLabel: "מעוין" },
};

export const CATEGORY_LABEL: Record<QuestionCategory, string> = {
  OUTPUT: "תפוקה · OUTPUT",
  OUTCOME: "אימפקט · OUTCOME",
};

export const DURATION_BY_CATEGORY: Record<QuestionCategory, number> = {
  OUTPUT: 20,
  OUTCOME: 30,
};

/** Leaderboard is shown strictly after every second question of the session. */
export function showsLeaderboardAfter(questionIndex: number): boolean {
  return questionIndex > 0 && questionIndex % 2 === 0;
}

export type Transition = { phase: GamePhase; questionIndex: number };

/** Explicit, non-ambiguous operator actions. Each maps to exactly one transition. */
export type GameAction =
  | "START_GAME"
  | "START_QUESTION"
  | "LOCK"
  | "SHOW_RESULTS"
  | "SHOW_FACT"
  | "SHOW_LEADERBOARD"
  | "NEXT_QUESTION"
  | "FINISH";

/**
 * Resolves an explicit action into its target state.
 * Returns null when the action is illegal for the current phase, so a repeated
 * click can never move the game backwards to a question already played.
 */
export function resolveAction(
  action: GameAction,
  phase: GamePhase,
  questionIndex: number,
  totalQuestions: number,
  hasFact: boolean = false,
): Transition | null {
  switch (action) {
    case "START_GAME":
      return phase === "LOBBY" ? { phase: "QUESTION_INTRO", questionIndex: 1 } : null;
    case "START_QUESTION":
      return phase === "QUESTION_INTRO" ? { phase: "QUESTION_ACTIVE", questionIndex } : null;
    case "LOCK":
      return phase === "QUESTION_ACTIVE" ? { phase: "QUESTION_LOCKED", questionIndex } : null;
    case "SHOW_RESULTS":
      return phase === "QUESTION_ACTIVE" || phase === "QUESTION_LOCKED"
        ? { phase: "SHOW_RESULTS", questionIndex }
        : null;
    case "SHOW_FACT":
      // Optional interesting-fact screen, only when this question has one enabled.
      return phase === "SHOW_RESULTS" && hasFact ? { phase: "SHOW_FACT", questionIndex } : null;
    case "SHOW_LEADERBOARD":
      return phase === "SHOW_RESULTS" || phase === "SHOW_FACT"
        ? { phase: "LEADERBOARD", questionIndex }
        : null;
    case "NEXT_QUESTION":
      if (phase !== "SHOW_RESULTS" && phase !== "SHOW_FACT" && phase !== "LEADERBOARD") return null;
      if (questionIndex >= totalQuestions) return null;
      return { phase: "QUESTION_INTRO", questionIndex: questionIndex + 1 };
    case "FINISH":
      return phase === "LEADERBOARD" || phase === "SHOW_RESULTS" || phase === "SHOW_FACT"
        ? { phase: "GAME_COMPLETE", questionIndex }
        : null;
    default:
      return null;
  }
}

/** The action the operator should take next, given the live phase. */
export function nextAction(
  phase: GamePhase,
  questionIndex: number,
  totalQuestions: number,
  hasFact: boolean = false,
): { action: GameAction; label: string } | null {
  const isLast = questionIndex >= totalQuestions;
  // What to do once results (and the optional fact) have been shown.
  const afterResults = (): { action: GameAction; label: string } => {
    if (isLast) return { action: "SHOW_LEADERBOARD", label: "הצג דירוג סופי" };
    if (showsLeaderboardAfter(questionIndex))
      return { action: "SHOW_LEADERBOARD", label: "הצג דירוג" };
    return { action: "NEXT_QUESTION", label: "לשאלה הבאה" };
  };
  switch (phase) {
    case "LOBBY":
      return { action: "START_GAME", label: "התחל משחק" };
    case "QUESTION_INTRO":
      return { action: "START_QUESTION", label: "התחל שאלה" };
    case "QUESTION_ACTIVE":
    case "QUESTION_LOCKED":
      return { action: "SHOW_RESULTS", label: "הצג תשובה ותוצאות" };
    case "SHOW_RESULTS":
      // If this question has an interesting fact, show it before the ranking.
      if (hasFact) return { action: "SHOW_FACT", label: "הצג עובדה מעניינת" };
      return afterResults();
    case "SHOW_FACT":
      return afterResults();
    case "LEADERBOARD":
      if (isLast) return { action: "FINISH", label: "סיום המשחק" };
      return { action: "NEXT_QUESTION", label: "לשאלה הבאה" };
    default:
      return null;
  }
}

/**
 * One logical step BACKWARD, for a host who advanced too fast and wants to
 * return to the previous screen. `hasFact` is whether the CURRENT question has an
 * enabled interesting fact (so LEADERBOARD steps back onto the fact, not the raw
 * results, when there is one). Returns null when there is nowhere to go back to
 * (i.e. LOBBY). Re-advancing forward from the returned state is always valid.
 */
export function resolveBack(
  phase: GamePhase,
  questionIndex: number,
  hasFact: boolean = false,
): Transition | null {
  switch (phase) {
    case "QUESTION_INTRO":
      // Back to the previous question's results (or the lobby before Q1).
      return questionIndex <= 1
        ? { phase: "LOBBY", questionIndex: 0 }
        : { phase: "SHOW_RESULTS", questionIndex: questionIndex - 1 };
    case "QUESTION_ACTIVE":
      return { phase: "QUESTION_INTRO", questionIndex };
    case "QUESTION_LOCKED":
      // Re-open the question (a fresh timer is set server-side).
      return { phase: "QUESTION_ACTIVE", questionIndex };
    case "SHOW_RESULTS":
      // Re-show the question + answers with results hidden again.
      return { phase: "QUESTION_LOCKED", questionIndex };
    case "SHOW_FACT":
      return { phase: "SHOW_RESULTS", questionIndex };
    case "LEADERBOARD":
      return hasFact
        ? { phase: "SHOW_FACT", questionIndex }
        : { phase: "SHOW_RESULTS", questionIndex };
    case "GAME_COMPLETE":
      return { phase: "LEADERBOARD", questionIndex };
    default:
      return null; // LOBBY — nothing before it
  }
}


/** Scoring: fast correct ~1000, last-second correct ~500, wrong/timeout 0. */
export function computeScore(
  isCorrect: boolean,
  remainingMs: number,
  durationSeconds: number,
  scoringMode: ScoringMode = "QUIZ",
): number {
  if (scoringMode === "POLL") return 0;
  if (!isCorrect) return 0;
  const durationMs = Math.max(1, durationSeconds * 1000);
  const remaining = Math.min(Math.max(remainingMs, 0), durationMs);
  return 500 + Math.floor((500 * remaining) / durationMs);
}

export type QuestionStatistics = {
  totalPlayers: number;
  responses: number;
  noResponse: number;
  counts: Record<AnswerId, number>;
  percents: Record<AnswerId, number>;
  correctResponses: number;
  correctPercent: number;
  averageResponseMs: number | null;
};

export function computeStatistics(
  answers: AnswerRow[],
  totalPlayers: number,
  correctAnswerId: AnswerId | null,
): QuestionStatistics {
  const counts: Record<AnswerId, number> = { A: 0, B: 0, C: 0, D: 0 };
  let sumMs = 0;
  for (const a of answers) {
    if (a.answer_id in counts) counts[a.answer_id as AnswerId] += 1;
    sumMs += a.response_ms;
  }
  const responses = answers.length;
  const percents: Record<AnswerId, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const id of ANSWER_IDS) {
    percents[id] = responses === 0 ? 0 : Math.round((counts[id] / responses) * 100);
  }
  const correctResponses = correctAnswerId ? counts[correctAnswerId] : 0;
  return {
    totalPlayers,
    responses,
    noResponse: Math.max(0, totalPlayers - responses),
    counts,
    percents,
    correctResponses,
    correctPercent: responses === 0 ? 0 : Math.round((correctResponses / responses) * 100),
    averageResponseMs: responses === 0 ? null : Math.round(sumMs / responses),
  };
}

/** Deterministic leaderboard ordering. */
export function sortLeaderboard(players: PlayerRow[]): PlayerRow[] {
  return [...players].sort(
    (a, b) =>
      b.total_score - a.total_score ||
      b.correct_count - a.correct_count ||
      a.cumulative_response_ms - b.cumulative_response_ms ||
      a.joined_at.localeCompare(b.joined_at),
  );
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

export function validateName(name: string): string | null {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (trimmed.length < 2) return "השם חייב לכלול לפחות 2 תווים.";
  if (trimmed.length > 24) return "השם ארוך מדי (עד 24 תווים).";
  if (/[<>]/.test(trimmed)) return "השם מכיל תווים לא חוקיים.";
  return null;
}

export function validatePin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
