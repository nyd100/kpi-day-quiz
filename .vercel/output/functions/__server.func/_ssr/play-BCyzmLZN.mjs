import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as sortLeaderboard, r as CATEGORY_LABEL } from "./quiz-ak5S6P9L.mjs";
import { _ as useSessionQuestions, d as useCountdown, f as useHydrated, g as useServerClock, l as submitAnswer, m as useLiveSession, o as playerState, p as useLivePlayers, s as playerStorage } from "./use-game-Dnag8lgq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as LeaderboardList, i as Countdown, n as AnswerTile, r as ConnectionBadge } from "./leaderboard-CV5l8QJx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/play-BCyzmLZN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlayPage() {
	const navigate = useNavigate();
	const hydrated = useHydrated();
	const [identity, setIdentity] = (0, import_react.useState)(null);
	const [answeredId, setAnsweredId] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	const questions = useSessionQuestions(playerStorage.get()?.sessionId ?? null);
	const now = useServerClock();
	const { session, connection } = useLiveSession(identity?.sessionId ?? null);
	const players = useLivePlayers(identity?.sessionId ?? null);
	(0, import_react.useEffect)(() => {
		const stored = playerStorage.get();
		if (!stored) {
			navigate({ to: "/" });
			return;
		}
		setIdentity(stored);
	}, [navigate]);
	const questionIndex = session?.current_question_index ?? 0;
	const question = (0, import_react.useMemo)(() => questions.find((q) => q.id === questionIndex) ?? null, [questions, questionIndex]);
	const syncState = (0, import_react.useCallback)(async () => {
		const stored = playerStorage.get();
		if (!stored) return;
		try {
			const state = await playerState({ data: {
				playerId: stored.playerId,
				playerSecret: stored.playerSecret
			} });
			setAnsweredId(state.answeredCurrent ?? null);
		} catch {
			playerStorage.clear();
			navigate({ to: "/" });
		}
	}, [navigate]);
	(0, import_react.useEffect)(() => {
		if (!identity) return;
		syncState();
		const id = setInterval(() => void syncState(), 2e4);
		return () => clearInterval(id);
	}, [identity, syncState]);
	(0, import_react.useEffect)(() => {
		setAnsweredId(null);
		setPending(null);
		if (identity) syncState();
	}, [questionIndex]);
	const duration = question?.durationSeconds ?? 20;
	const { seconds, ratio } = useCountdown(session?.phase === "QUESTION_ACTIVE" ? session.question_ends_at : null, now, duration);
	const me = players.find((p) => p.id === identity?.playerId);
	const myRank = sortLeaderboard(players).findIndex((p) => p.id === identity?.playerId) + 1;
	const choose = async (answerId) => {
		if (!identity || !question || answeredId || pending) return;
		setPending(answerId);
		try {
			await submitAnswer({ data: {
				sessionId: identity.sessionId,
				playerId: identity.playerId,
				playerSecret: identity.playerSecret,
				questionId: question.id,
				answerId
			} });
			setAnsweredId(answerId);
		} catch (error) {
			setPending(null);
			toast.error(error instanceof Error ? error.message : "שליחת התשובה נכשלה.");
			syncState();
		}
	};
	if (!hydrated || !identity) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CenteredMessage, { title: "טוענים את המשחק..." });
	if (!session) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CenteredMessage, {
		title: "מתחברים למשחק...",
		connection
	});
	if (session.status !== "ACTIVE") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CenteredMessage, {
		title: "המשחק הסתיים.",
		connection
	});
	const header = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-2 pb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-sm font-bold",
				children: identity.displayName
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "tabular text-xs text-muted-foreground",
				children: [me ? `${me.total_score.toLocaleString("he-IL")} נקודות` : "0 נקודות", myRank > 0 && ` · מיקום ${myRank}`]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/strategy-division-logo.png",
				alt: "לוגו",
				className: "h-6 w-auto object-contain"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionBadge, { state: connection })]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-md flex-col px-3 py-4",
		children: [
			header,
			session.phase === "LOBBY" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-black",
					children: "נכנסת למשחק 🎉"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "ממתינים לתחילת הפעילות"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 text-sm text-muted-foreground",
					children: [players.length, " משתתפים מחוברים כרגע"]
				})
			] }),
			session.phase === "QUESTION_INTRO" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-semibold text-primary",
					children: [
						"שאלה ",
						questionIndex,
						" מתוך ",
						session?.total_questions ?? questions.length
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-3xl font-black",
					children: "מתכוננים..."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "השאלה תופיע כאן ברגע שהמנחה יתחיל"
				})
			] }),
			(session.phase === "QUESTION_ACTIVE" || session.phase === "QUESTION_LOCKED") && question && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-1 flex-col gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "surface-card flex items-center gap-3 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, {
							seconds: session.phase === "QUESTION_LOCKED" ? 0 : seconds,
							ratio: session.phase === "QUESTION_LOCKED" ? 0 : ratio,
							size: 72
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-bold tracking-wide text-primary",
								children: [
									"שאלה ",
									question.id,
									" מתוך ",
									session?.total_questions ?? questions.length,
									" · ",
									CATEGORY_LABEL[question.category]
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-1 text-lg font-bold leading-snug",
								children: question.title
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2",
						children: question.answers.map((answer) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnswerTile, {
							id: answer.id,
							text: answer.text,
							selected: answeredId === answer.id || pending === answer.id,
							dimmed: !!answeredId && answeredId !== answer.id,
							disabled: !!answeredId || !!pending || session.phase !== "QUESTION_ACTIVE" || seconds <= 0,
							onSelect: () => void choose(answer.id)
						}, answer.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "surface-card p-3 text-center text-sm font-semibold",
						role: "status",
						"aria-live": "polite",
						children: answeredId ? "התשובה נקלטה ✓ ממתינים לשאר המשתתפים" : session.phase === "QUESTION_LOCKED" || seconds <= 0 ? "הזמן נגמר" : "בחרו תשובה אחת"
					})
				]
			}),
			session.phase === "SHOW_RESULTS" && question && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm font-semibold text-primary",
					children: ["תוצאות שאלה ", question.id]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 text-2xl font-black",
					children: answeredId ? answeredId === session.revealed_answer_id ? "תשובה נכונה! 🎯" : "הפעם לא הצלחת" : "לא נקלטה תשובה"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted-foreground",
					children: "התשובה הנכונה מוצגת על המסך הגדול"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "tabular mt-6 text-3xl font-black text-primary",
					children: (me?.total_score ?? 0).toLocaleString("he-IL")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "סך הנקודות שלך"
				})
			] }),
			(session.phase === "LEADERBOARD" || session.phase === "GAME_COMPLETE") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-1 flex-col gap-4 pt-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface-card p-5 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: session.phase === "GAME_COMPLETE" ? "תוצאות סופיות" : "טבלת המובילים"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "tabular mt-2 text-4xl font-black text-primary",
							children: [(me?.total_score ?? 0).toLocaleString("he-IL"), " נקודות"]
						}),
						myRank > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-lg font-bold",
							children: ["המיקום שלך: ", myRank]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaderboardList, {
					players,
					limit: 5,
					highlightPlayerId: identity.playerId,
					compact: true
				})]
			})
		]
	});
}
function Panel({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "surface-card animate-pop flex flex-1 flex-col items-center justify-center p-8 text-center",
		children
	});
}
function CenteredMessage({ title, connection }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-bold",
			children: title
		}), connection && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionBadge, { state: connection })]
	});
}
//#endregion
export { PlayPage as component };
