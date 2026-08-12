// Browser-safe shared quiz domain model, state machine and pure scoring logic.

export type GamePhase =
  | "LOBBY"
  | "QUESTION_INTRO"
  | "QUESTION_ACTIVE"
  | "QUESTION_LOCKED"
  | "SHOW_RESULTS"
  | "LEADERBOARD"
  | "GAME_COMPLETE";

export type QuestionCategory = "OUTPUT" | "OUTCOME";
export type ScoringMode = "QUIZ" | "POLL";
export type AnswerId = "A" | "B" | "C" | "D";

export const ANSWER_IDS: AnswerId[] = ["A", "B", "C", "D"];
export const TOTAL_QUESTIONS = 16;

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
};

export type AnswerRow = {
  player_id: string;
  question_id: number;
  answer_id: string;
  is_correct: boolean;
  response_ms: number;
  awarded_score: number;
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

/** Leaderboard is shown strictly after every second question. */
export function showsLeaderboardAfter(questionIndex: number): boolean {
  return questionIndex > 0 && questionIndex % 2 === 0;
}

export type Transition = { phase: GamePhase; questionIndex: number };

/** Authoritative state machine: the single legal "advance" step. */
export function nextTransition(phase: GamePhase, questionIndex: number): Transition | null {
  switch (phase) {
    case "LOBBY":
      return { phase: "QUESTION_INTRO", questionIndex: 1 };
    case "QUESTION_INTRO":
      return { phase: "QUESTION_ACTIVE", questionIndex };
    case "QUESTION_ACTIVE":
      return { phase: "QUESTION_LOCKED", questionIndex };
    case "QUESTION_LOCKED":
      return { phase: "SHOW_RESULTS", questionIndex };
    case "SHOW_RESULTS":
      if (showsLeaderboardAfter(questionIndex)) return { phase: "LEADERBOARD", questionIndex };
      return { phase: "QUESTION_INTRO", questionIndex: questionIndex + 1 };
    case "LEADERBOARD":
      if (questionIndex >= TOTAL_QUESTIONS) return { phase: "GAME_COMPLETE", questionIndex };
      return { phase: "QUESTION_INTRO", questionIndex: questionIndex + 1 };
    case "GAME_COMPLETE":
      return null;
    default:
      return null;
  }
}

export function isLegalTransition(
  from: GamePhase,
  fromIndex: number,
  to: GamePhase,
  toIndex: number,
): boolean {
  const next = nextTransition(from, fromIndex);
  return !!next && next.phase === to && next.questionIndex === toIndex;
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
