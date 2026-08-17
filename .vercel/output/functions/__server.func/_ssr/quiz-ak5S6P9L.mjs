//#region node_modules/.nitro/vite/services/ssr/assets/quiz-ak5S6P9L.js
var ANSWER_IDS = [
	"A",
	"B",
	"C",
	"D"
];
/** Identity system: position + colour + shape + text (never colour alone). */
var ANSWER_META = {
	A: {
		color: "var(--answer-a)",
		shape: "square",
		shapeLabel: "ריבוע"
	},
	B: {
		color: "var(--answer-b)",
		shape: "circle",
		shapeLabel: "עיגול"
	},
	C: {
		color: "var(--answer-c)",
		shape: "triangle",
		shapeLabel: "משולש"
	},
	D: {
		color: "var(--answer-d)",
		shape: "diamond",
		shapeLabel: "מעוין"
	}
};
var CATEGORY_LABEL = {
	OUTPUT: "תפוקה · OUTPUT",
	OUTCOME: "אימפקט · OUTCOME"
};
/** Leaderboard is shown strictly after every second question of the session. */
function showsLeaderboardAfter(questionIndex) {
	return questionIndex > 0 && questionIndex % 2 === 0;
}
/**
* Resolves an explicit action into its target state.
* Returns null when the action is illegal for the current phase, so a repeated
* click can never move the game backwards to a question already played.
*/
function resolveAction(action, phase, questionIndex, totalQuestions) {
	switch (action) {
		case "START_GAME": return phase === "LOBBY" ? {
			phase: "QUESTION_INTRO",
			questionIndex: 1
		} : null;
		case "START_QUESTION": return phase === "QUESTION_INTRO" ? {
			phase: "QUESTION_ACTIVE",
			questionIndex
		} : null;
		case "LOCK": return phase === "QUESTION_ACTIVE" ? {
			phase: "QUESTION_LOCKED",
			questionIndex
		} : null;
		case "SHOW_RESULTS": return phase === "QUESTION_ACTIVE" || phase === "QUESTION_LOCKED" ? {
			phase: "SHOW_RESULTS",
			questionIndex
		} : null;
		case "SHOW_LEADERBOARD": return phase === "SHOW_RESULTS" ? {
			phase: "LEADERBOARD",
			questionIndex
		} : null;
		case "NEXT_QUESTION":
			if (phase !== "SHOW_RESULTS" && phase !== "LEADERBOARD") return null;
			if (questionIndex >= totalQuestions) return null;
			return {
				phase: "QUESTION_INTRO",
				questionIndex: questionIndex + 1
			};
		case "FINISH": return phase === "LEADERBOARD" || phase === "SHOW_RESULTS" ? {
			phase: "GAME_COMPLETE",
			questionIndex
		} : null;
		default: return null;
	}
}
/** The action the operator should take next, given the live phase. */
function nextAction(phase, questionIndex, totalQuestions) {
	const isLast = questionIndex >= totalQuestions;
	switch (phase) {
		case "LOBBY": return {
			action: "START_GAME",
			label: "התחל משחק"
		};
		case "QUESTION_INTRO": return {
			action: "START_QUESTION",
			label: "התחל שאלה"
		};
		case "QUESTION_ACTIVE":
		case "QUESTION_LOCKED": return {
			action: "SHOW_RESULTS",
			label: "הצג תשובה ותוצאות"
		};
		case "SHOW_RESULTS":
			if (isLast) return {
				action: "SHOW_LEADERBOARD",
				label: "הצג דירוג סופי"
			};
			if (showsLeaderboardAfter(questionIndex)) return {
				action: "SHOW_LEADERBOARD",
				label: "הצג דירוג"
			};
			return {
				action: "NEXT_QUESTION",
				label: "לשאלה הבאה"
			};
		case "LEADERBOARD":
			if (isLast) return {
				action: "FINISH",
				label: "סיום המשחק"
			};
			return {
				action: "NEXT_QUESTION",
				label: "לשאלה הבאה"
			};
		default: return null;
	}
}
/** Scoring: fast correct ~1000, last-second correct ~500, wrong/timeout 0. */
function computeScore(isCorrect, remainingMs, durationSeconds, scoringMode = "QUIZ") {
	if (scoringMode === "POLL") return 0;
	if (!isCorrect) return 0;
	const durationMs = Math.max(1, durationSeconds * 1e3);
	return 500 + Math.floor(500 * Math.min(Math.max(remainingMs, 0), durationMs) / durationMs);
}
function computeStatistics(answers, totalPlayers, correctAnswerId) {
	const counts = {
		A: 0,
		B: 0,
		C: 0,
		D: 0
	};
	let sumMs = 0;
	for (const a of answers) {
		if (a.answer_id in counts) counts[a.answer_id] += 1;
		sumMs += a.response_ms;
	}
	const responses = answers.length;
	const percents = {
		A: 0,
		B: 0,
		C: 0,
		D: 0
	};
	for (const id of ANSWER_IDS) percents[id] = responses === 0 ? 0 : Math.round(counts[id] / responses * 100);
	const correctResponses = correctAnswerId ? counts[correctAnswerId] : 0;
	return {
		totalPlayers,
		responses,
		noResponse: Math.max(0, totalPlayers - responses),
		counts,
		percents,
		correctResponses,
		correctPercent: responses === 0 ? 0 : Math.round(correctResponses / responses * 100),
		averageResponseMs: responses === 0 ? null : Math.round(sumMs / responses)
	};
}
/** Deterministic leaderboard ordering. */
function sortLeaderboard(players) {
	return [...players].sort((a, b) => b.total_score - a.total_score || b.correct_count - a.correct_count || a.cumulative_response_ms - b.cumulative_response_ms || a.joined_at.localeCompare(b.joined_at));
}
function normalizeName(name) {
	return name.trim().replace(/\s+/g, " ").toLowerCase();
}
function validateName(name) {
	const trimmed = name.trim().replace(/\s+/g, " ");
	if (trimmed.length < 2) return "השם חייב לכלול לפחות 2 תווים.";
	if (trimmed.length > 24) return "השם ארוך מדי (עד 24 תווים).";
	if (/[<>]/.test(trimmed)) return "השם מכיל תווים לא חוקיים.";
	return null;
}
function validatePin(pin) {
	return /^\d{4}$/.test(pin);
}
//#endregion
export { computeStatistics as a, resolveAction as c, validatePin as d, computeScore as i, sortLeaderboard as l, ANSWER_META as n, nextAction as o, CATEGORY_LABEL as r, normalizeName as s, ANSWER_IDS as t, validateName as u };
