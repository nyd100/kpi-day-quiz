import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as computeStatistics, n as ANSWER_META, r as CATEGORY_LABEL, t as ANSWER_IDS } from "./quiz-ak5S6P9L.mjs";
import { _ as useSessionQuestions, c as questionTick, d as useCountdown, f as useHydrated, g as useServerClock, h as useQuestionAnswers, i as hostStorage, m as useLiveSession, p as useLivePlayers, r as hostCommand, u as useAppSetting, v as verifyHost } from "./use-game-Dnag8lgq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as LeaderboardList, i as Countdown, n as AnswerTile, o as Podium, r as ConnectionBadge, s as cn, t as AnswerShape } from "./leaderboard-CV5l8QJx.mjs";
import { t as Sparkles } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/present-mt1g0mbi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ParticipationStrip({ answers, players }) {
	const { count, total, percentage, recentNames, moreCount } = (0, import_react.useMemo)(() => {
		const count = answers.length;
		const total = players.length;
		const percentage = total === 0 ? 0 : Math.round(count / total * 100);
		const sorted = [...answers].sort((a, b) => b.response_ms - a.response_ms);
		const names = [];
		for (const a of sorted) {
			const p = players.find((p) => p.id === a.player_id);
			if (p) names.push(p.display_name);
		}
		const limit = 12;
		return {
			count,
			total,
			percentage,
			recentNames: names.slice(0, limit),
			moreCount: Math.max(0, count - limit)
		};
	}, [answers, players]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card flex flex-col sm:flex-row items-center gap-4 px-4 py-3 text-sm animate-in fade-in slide-in-from-bottom-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "font-bold text-primary shrink-0 whitespace-nowrap",
			children: [
				count,
				" מתוך ",
				total,
				" הצביעו · ",
				percentage,
				"%"
			]
		}), recentNames.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-wrap items-center gap-2 overflow-hidden text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-foreground shrink-0",
					children: "המשיבים האחרונים:"
				}),
				recentNames.map((name, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-accent/10 px-2.5 py-0.5 text-accent-foreground font-medium animate-in zoom-in duration-300",
					children: name
				}, i)),
				moreCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs font-semibold",
					children: [
						"+",
						moreCount,
						" נוספים"
					]
				})
			]
		})]
	});
}
function ResultsBars({ stats, answers, correctAnswerId }) {
	const [revealPhase, setRevealPhase] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!correctAnswerId) {
			setRevealPhase(0);
			return;
		}
		const t1 = setTimeout(() => setRevealPhase(1), 800);
		const t2 = setTimeout(() => setRevealPhase(2), 1400);
		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
		};
	}, [correctAnswerId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 mt-auto pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 flex-1",
			children: ANSWER_IDS.map((id) => {
				const meta = ANSWER_META[id];
				const percent = stats.percents[id];
				const isCorrect = correctAnswerId === id;
				const fadeOut = revealPhase >= 1 && !isCorrect && correctAnswerId;
				const emphasize = revealPhase >= 2 && isCorrect;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("surface-card flex flex-col justify-center gap-3 p-5 transition-all duration-500", fadeOut && "opacity-40 grayscale-[30%] scale-[0.98]", emphasize && "ring-4 ring-success ring-offset-4 ring-offset-background scale-[1.08] shadow-2xl z-10 bg-success/5", "relative"),
					children: [
						emphasize && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute -top-4 -end-4 rounded-full bg-success text-success-foreground px-4 py-1 text-sm font-black shadow-lg animate-in zoom-in spin-in-12 duration-500",
							children: "התשובה הנכונה"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-12 shrink-0 place-items-center rounded-xl transition-all duration-500",
								style: { backgroundColor: emphasize ? "var(--success)" : meta.color },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnswerShape, {
									id,
									className: "size-6 text-primary-foreground"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-0 flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: cn("text-lg font-bold leading-tight", emphasize && "text-success font-black"),
										children: [answers.find((a) => a.id === id)?.text, isCorrect && revealPhase >= 1 && !emphasize && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ms-2 inline-flex items-center rounded-md bg-success px-2 py-0.5 text-xs font-bold text-success-foreground",
											children: "נכון ✓"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-end shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: cn("tabular text-2xl font-black", emphasize && "text-success"),
											children: [percent, "%"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm font-medium text-muted-foreground",
											children: [stats.counts[id], " הצבעות"]
										})]
									})]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-4 overflow-hidden rounded-full bg-muted/50 mt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: cn("h-full rounded-full transition-[width] duration-700 ease-out", emphasize && "bg-success"),
								style: {
									width: `${percent}%`,
									backgroundColor: emphasize ? void 0 : meta.color
								}
							})
						})
					]
				}, id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "surface-card p-4 mt-4 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "tabular text-base font-medium text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-foreground",
						children: stats.responses
					}),
					" מתוך ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-foreground",
						children: stats.totalPlayers
					}),
					" משתתפים ענו (",
					stats.percents.A + stats.percents.B + stats.percents.C + stats.percents.D,
					"% השתתפות)",
					stats.averageResponseMs !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [" · זמן תגובה ממוצע ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [(stats.averageResponseMs / 1e3).toFixed(1), " שניות"] })] })
				]
			})
		})]
	});
}
function generateVotingInsight(stats, answers, category, correctAnswerId) {
	if (stats.responses === 0) return "לא התקבלו תשובות לשאלה זו.";
	if (stats.responses < 5) return "מספר המשיבים קטן מאוד ולכן לא מוצגת פרשנות להתפלגות.";
	const responseRate = stats.totalPlayers === 0 ? 0 : Math.round(stats.responses / stats.totalPlayers * 100);
	const correctRate = stats.correctPercent;
	let insight = "";
	if (responseRate < 60) return `שיעור ההשתתפות בשאלה היה נמוך יחסית: ${responseRate}% מהמשתתפים הצביעו. כדאי לפרש את התפלגות התשובות בזהירות.`;
	const sortedAnswers = [...answers].sort((a, b) => stats.percents[b.id] - stats.percents[a.id]);
	const topAnswer = sortedAnswers[0];
	const secondTopAnswer = sortedAnswers.length > 1 ? sortedAnswers[1] : null;
	const topAnswerRate = stats.percents[topAnswer.id];
	const secondHighestRate = secondTopAnswer ? stats.percents[secondTopAnswer.id] : 0;
	const distractors = sortedAnswers.filter((a) => a.id !== correctAnswerId);
	const highestDistractor = distractors.length > 0 ? distractors[0] : null;
	const highestDistractorRate = highestDistractor ? stats.percents[highestDistractor.id] : 0;
	const marginBetweenTopTwo = topAnswerRate - secondHighestRate;
	let includedPopularIncorrect = false;
	if (correctRate >= 85) {
		insight = `נרשמה הסכמה רחבה: ${correctRate}% מהמשתתפים בחרו בתשובה הנכונה.`;
		if (category === "OUTCOME") insight += " נראה שההבחנה בין תפוקה לתוצאה הייתה ברורה לרוב המשתתפים.";
	} else if (correctRate >= 70) insight = `רוב ברור של ${correctRate}% בחר בתשובה הנכונה, אך עדיין קיים מיעוט משמעותי שבחר באפשרויות אחרות.`;
	else if (correctRate >= 50) {
		insight = `התוצאות מפוצלות יחסית: ${correctRate}% בחרו בתשובה הנכונה. חלק משמעותי מהמשתתפים בחר באפשרויות אחרות.`;
		if (category === "OUTCOME") insight += " ייתכן שכדאי לחדד את ההבחנה בין תפוקה לתוצאה.";
	} else {
		insight = `פחות ממחצית המשתתפים בחרו בתשובה הנכונה: ${correctRate}%. זהו נושא שכדאי להתעכב עליו בדיון.`;
		if (topAnswer.id !== correctAnswerId) {
			insight += ` האפשרות הפופולרית ביותר הייתה "${topAnswer.text}" עם ${topAnswerRate}%, למרות שאינה התשובה הנכונה.`;
			includedPopularIncorrect = true;
		}
	}
	if (highestDistractorRate >= 25 && !includedPopularIncorrect && highestDistractor) insight += ` המסיח הבולט היה "${highestDistractor.text}", שנבחר על ידי ${highestDistractorRate}% מהמשתתפים.`;
	if (marginBetweenTopTwo <= 10 && marginBetweenTopTwo >= 0 && secondTopAnswer) {
		if (topAnswerRate > 0) insight += ` ההצבעה הייתה צמודה: הפער בין שתי האפשרויות המובילות היה ${marginBetweenTopTwo} נקודות אחוז בלבד.`;
	}
	return insight.trim();
}
function InsightStrip({ stats, answers, category, correctAnswerId }) {
	const insight = generateVotingInsight(stats, answers, category, correctAnswerId);
	if (!insight) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface-card mt-4 flex items-start gap-4 p-5 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-1000 fill-mode-both border-s-4 border-s-accent bg-accent/5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-full bg-accent/20 p-2 text-accent",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-6" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-bold text-accent mb-1",
				children: "תובנה מההצבעה"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-lg leading-relaxed text-foreground font-medium",
				children: insight
			})]
		})]
	});
}
var ctx = null;
var master = null;
var enabled = false;
function isSoundEnabled() {
	return enabled;
}
/** Must be called from a user gesture (browser autoplay policy). */
async function enableSound() {
	if (typeof window === "undefined") return false;
	const Ctor = window.AudioContext ?? window.webkitAudioContext;
	if (!Ctor) return false;
	if (!ctx) {
		ctx = new Ctor();
		master = ctx.createGain();
		master.gain.value = .28;
		master.connect(ctx.destination);
	}
	await ctx.resume();
	enabled = true;
	return true;
}
function disableSound() {
	enabled = false;
}
function tone(startOffset, freq, duration, type = "sine", peak = 1) {
	if (!ctx || !master) return;
	const t0 = ctx.currentTime + startOffset;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t0);
	gain.gain.setValueAtTime(1e-4, t0);
	gain.gain.exponentialRampToValueAtTime(peak, t0 + .02);
	gain.gain.exponentialRampToValueAtTime(1e-4, t0 + duration);
	osc.connect(gain);
	gain.connect(master);
	osc.start(t0);
	osc.stop(t0 + duration + .05);
}
function sweep(startOffset, from, to, duration) {
	if (!ctx || !master) return;
	const t0 = ctx.currentTime + startOffset;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();
	osc.type = "triangle";
	osc.frequency.setValueAtTime(from, t0);
	osc.frequency.exponentialRampToValueAtTime(to, t0 + duration);
	gain.gain.setValueAtTime(1e-4, t0);
	gain.gain.exponentialRampToValueAtTime(.8, t0 + .05);
	gain.gain.exponentialRampToValueAtTime(1e-4, t0 + duration);
	osc.connect(gain);
	gain.connect(master);
	osc.start(t0);
	osc.stop(t0 + duration + .05);
}
function playCue(cue) {
	if (!enabled || !ctx) return;
	switch (cue) {
		case "gameStart":
			sweep(0, 220, 660, .5);
			tone(.45, 880, .35, "triangle", .8);
			break;
		case "questionStart":
			tone(0, 523.25, .14, "triangle", .7);
			tone(.13, 783.99, .2, "triangle", .7);
			break;
		case "tick":
			tone(0, 1200, .07, "square", .35);
			break;
		case "timeUp":
			tone(0, 320, .18, "sawtooth", .6);
			tone(.18, 240, .32, "sawtooth", .6);
			break;
		case "reveal":
			tone(0, 659.25, .14, "sine", .8);
			tone(.14, 830.61, .14, "sine", .8);
			tone(.28, 987.77, .3, "sine", .8);
			break;
		case "leaderboard":
			tone(0, 587.33, .12, "triangle", .7);
			tone(.12, 739.99, .12, "triangle", .7);
			tone(.24, 880, .25, "triangle", .7);
			break;
		case "finale":
			[
				523.25,
				659.25,
				783.99,
				1046.5
			].forEach((f, i) => tone(i * .16, f, .4, "triangle", .9));
			sweep(.7, 440, 1320, .8);
	}
}
function PresentPage() {
	const hydrated = useHydrated();
	const [host, setHost] = (0, import_react.useState)(null);
	const [checked, setChecked] = (0, import_react.useState)(false);
	const [, setBusy] = (0, import_react.useState)(false);
	const [sound, setSound] = (0, import_react.useState)(false);
	const now = useServerClock();
	const { session, connection } = useLiveSession(host?.sessionId ?? null);
	const questions = useSessionQuestions(host?.sessionId ?? null);
	const players = useLivePlayers(host?.sessionId ?? null);
	useAppSetting("org_logo_url");
	const showInsights = useAppSetting("show_insights") !== "false";
	(0, import_react.useEffect)(() => {
		const stored = hostStorage.get();
		if (!stored) {
			setChecked(true);
			return;
		}
		verifyHost({ data: {
			sessionId: stored.sessionId,
			hostSecret: stored.hostSecret
		} }).then((res) => {
			if (res.ok) setHost(stored);
			else hostStorage.clear();
		}).catch(() => hostStorage.clear()).finally(() => setChecked(true));
	}, []);
	const questionIndex = session?.current_question_index ?? 0;
	const totalQuestions = session?.total_questions ?? questions.length;
	const question = (0, import_react.useMemo)(() => questions.find((q) => q.id === questionIndex) ?? null, [questions, questionIndex]);
	const answers = useQuestionAnswers(host?.sessionId ?? null, questionIndex, session?.phase === "QUESTION_ACTIVE" || session?.phase === "SHOW_RESULTS" || session?.phase === "QUESTION_LOCKED");
	const { seconds, ratio } = useCountdown(session?.phase === "QUESTION_ACTIVE" ? session.question_ends_at : null, now, question?.durationSeconds ?? 20);
	const lastPhase = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const phase = session?.phase ?? null;
		if (!phase || phase === lastPhase.current) return;
		lastPhase.current = phase;
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (phase === "QUESTION_INTRO") playCue("gameStart");
		if (phase === "QUESTION_ACTIVE") playCue("questionStart");
		if (phase === "QUESTION_LOCKED") playCue("timeUp");
		if (phase === "SHOW_RESULTS") playCue("reveal");
		if (phase === "LEADERBOARD") {
			playCue("leaderboard");
			if (!prefersReducedMotion) import("../_libs/canvas-confetti.mjs").then((n) => n.t).then(({ default: confetti }) => {
				confetti({
					particleCount: 120,
					spread: 100,
					origin: { y: .6 }
				});
			});
		}
		if (phase === "GAME_COMPLETE") {
			playCue("finale");
			if (!prefersReducedMotion) import("../_libs/canvas-confetti.mjs").then((n) => n.t).then(({ default: confetti }) => {
				const end = Date.now() + 3e3;
				const frame = () => {
					confetti({
						particleCount: 5,
						angle: 60,
						spread: 55,
						origin: { x: 0 },
						colors: [
							"#26ccff",
							"#a25afd",
							"#ff5e7e",
							"#88ff5a",
							"#fcff42",
							"#ffa62d",
							"#ff36ff"
						]
					});
					confetti({
						particleCount: 5,
						angle: 120,
						spread: 55,
						origin: { x: 1 },
						colors: [
							"#26ccff",
							"#a25afd",
							"#ff5e7e",
							"#88ff5a",
							"#fcff42",
							"#ffa62d",
							"#ff36ff"
						]
					});
					if (Date.now() < end) requestAnimationFrame(frame);
				};
				frame();
			});
		}
	}, [session?.phase]);
	const lastTick = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (session?.phase !== "QUESTION_ACTIVE") return;
		if (seconds > 0 && seconds <= 5 && seconds !== lastTick.current) {
			lastTick.current = seconds;
			playCue("tick");
		}
		if (seconds > 5) lastTick.current = 0;
	}, [seconds, session?.phase]);
	const toggleSound = async () => {
		if (sound) {
			disableSound();
			setSound(false);
			return;
		}
		const ok = await enableSound();
		setSound(ok && isSoundEnabled());
		if (ok) playCue("questionStart");
	};
	const tick = (0, import_react.useCallback)(async () => {
		if (!host) return;
		try {
			await questionTick({ data: {
				sessionId: host.sessionId,
				hostSecret: host.hostSecret
			} });
		} catch {}
	}, [host]);
	(0, import_react.useEffect)(() => {
		if (!host || session?.phase !== "QUESTION_ACTIVE") return;
		const id = setInterval(() => void tick(), 1e3);
		return () => clearInterval(id);
	}, [
		host,
		session?.phase,
		tick
	]);
	const run = (0, import_react.useCallback)(async (action, count) => {
		if (!host) return;
		setBusy(true);
		try {
			await hostCommand({ data: {
				sessionId: host.sessionId,
				hostSecret: host.hostSecret,
				action,
				count
			} });
			if (action === "DELETE") {
				hostStorage.clear();
				setHost(null);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "הפעולה נכשלה.");
		} finally {
			setBusy(false);
		}
	}, [host]);
	const autoLocked = (0, import_react.useRef)(0);
	(0, import_react.useEffect)(() => {
		if (session?.phase !== "QUESTION_ACTIVE" || seconds > 0) return;
		if (autoLocked.current === questionIndex) return;
		autoLocked.current = questionIndex;
		run("LOCK");
	}, [
		seconds,
		session?.phase,
		questionIndex,
		run
	]);
	if (!hydrated || !checked) return null;
	if (!host) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-4xl font-black",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-gradient-accent",
					children: "אין משחק פעיל"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-muted-foreground",
				children: "משחק נפתח מקונסולת הניהול, לאחר שכל השאלות נשמרו."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/admin",
				className: "h-14 rounded-2xl bg-gradient-accent px-10 text-lg font-bold leading-[3.5rem] text-primary-foreground",
				children: "מעבר לקונסולת ניהול"
			})
		]
	});
	const stats = question ? computeStatistics(answers, players.length, session?.revealed_answer_id ?? null) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-[96vw] max-w-[1920px] flex-col gap-6 py-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4 rounded-xl bg-white p-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/ministry-logo.png",
								alt: "לוגו משרד העלייה והקליטה",
								className: "h-12 w-auto object-contain"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-px bg-border" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/strategy-division-logo.png",
								alt: "חטיבת אסטרטגיה ותכנון מדיניות",
								className: "h-12 w-auto object-contain"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-widest text-primary",
						children: "סיכום חציון א' 2026"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-2xl font-black",
						children: "ממספרים לאימפקט"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectionBadge, { state: connection }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular rounded-xl bg-muted px-3 py-2 text-sm font-bold",
							children: [players.length, " משתתפים"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular rounded-xl bg-primary px-4 py-2 text-xl font-black text-primary-foreground",
							dir: "ltr",
							children: host.pin
						})
					]
				})]
			}),
			session?.phase === "LOBBY" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-lg text-muted-foreground",
						children: "הצטרפו מהטלפון עם הקוד"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "tabular text-8xl font-black tracking-[0.2em] text-gradient-accent",
						dir: "ltr",
						children: host.pin
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted-foreground",
						children: [players.length, " משתתפים מחוברים"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaderboardList, {
						players,
						limit: 5,
						compact: true
					})
				]
			}),
			session && session.phase !== "LOBBY" && question && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card flex flex-1 flex-col gap-6 p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-lg font-bold text-primary",
								children: [
									"שאלה ",
									question.id,
									" מתוך ",
									totalQuestions,
									" · ",
									CATEGORY_LABEL[question.category]
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-4xl font-black leading-snug",
								children: question.title
							}),
							question.subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xl text-muted-foreground",
								children: question.subtitle
							})
						] }), session.phase === "QUESTION_ACTIVE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, {
							seconds,
							ratio
						})]
					}),
					question.imageUrl && (session.phase === "QUESTION_INTRO" || session.phase === "QUESTION_ACTIVE" || session.phase === "QUESTION_LOCKED" || session.phase === "SHOW_RESULTS") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: question.imageUrl,
						alt: `תמונה לשאלה ${question.id}`,
						className: "mx-auto max-h-64 w-auto rounded-2xl border border-border object-contain"
					}),
					(session.phase === "QUESTION_INTRO" || session.phase === "QUESTION_ACTIVE" || session.phase === "QUESTION_LOCKED") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid flex-1 gap-4 sm:grid-cols-2",
						children: question.answers.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnswerTile, {
							id: a.id,
							text: a.text,
							size: "stage"
						}, a.id))
					}),
					session.phase === "QUESTION_ACTIVE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-auto pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParticipationStrip, {
							answers,
							players
						})
					}),
					session.phase === "SHOW_RESULTS" && stats && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsBars, {
							stats,
							answers: question.answers,
							correctAnswerId: session.revealed_answer_id ?? null
						}), showInsights && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightStrip, {
							stats,
							answers: question.answers,
							category: question.category,
							correctAnswerId: session.revealed_answer_id ?? null
						})]
					}),
					session.phase === "LEADERBOARD" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaderboardList, {
						players,
						limit: 10
					}),
					session.phase === "GAME_COMPLETE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-center text-3xl font-black",
							children: "התוצאות הסופיות 🎉"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Podium, { players })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => void toggleSound(),
				"aria-label": sound ? "כיבוי צלילים" : "הפעלת צלילים",
				className: "fixed bottom-4 start-4 h-10 w-10 rounded-full border border-input bg-background/70 text-sm opacity-40 transition-opacity hover:opacity-100",
				children: sound ? "🔊" : "🔇"
			})
		]
	});
}
//#endregion
export { PresentPage as component };
