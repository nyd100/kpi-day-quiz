import { o as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./server-CQ9vf1HB2.mjs";
import { o as nextAction, r as CATEGORY_LABEL, t as ANSWER_IDS } from "./quiz-ak5S6P9L.mjs";
import { a as objectType, i as numberType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { _ as useSessionQuestions, d as useCountdown, f as useHydrated, g as useServerClock, i as hostStorage, m as useLiveSession, n as createSsrRpc, p as useLivePlayers, r as hostCommand } from "./use-game-Dnag8lgq.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BHtx5FhQ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var passcode = stringType().min(1).max(200);
var answerId = enumType([
	"A",
	"B",
	"C",
	"D"
]);
var adminLogin = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(createSsrRpc("89f029f4fc21ed092423cd54f44fb61078423691288a3a89663a6e0973cd86ea"));
var adminListQuestions = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(createSsrRpc("6058cffff129c2aa3798c06a3907a0ad52e987e2a3ba44ca64781279c3baf4a9"));
var adminSaveQuestion = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	question: objectType({
		id: numberType().int().min(1),
		pairId: numberType().int().min(1).max(999).nullable().optional(),
		category: enumType(["OUTPUT", "OUTCOME"]),
		title: stringType().min(1).max(300),
		subtitle: stringType().max(400).nullable(),
		answerA: stringType().min(1).max(200),
		answerB: stringType().min(1).max(200),
		answerC: stringType().min(1).max(200),
		answerD: stringType().min(1).max(200),
		durationSeconds: numberType().int().min(5).max(120),
		scoringMode: enumType(["QUIZ", "POLL"]),
		executiveInsight: stringType().max(1e3).nullable(),
		correctAnswerId: answerId,
		explanation: stringType().max(1e3).nullable(),
		isPlaceholder: booleanType()
	})
}).parse(data)).handler(createSsrRpc("55e659eb1cd8ec8dd528f173d97abeb7029f052244ca8080ffb40227f9c5f304"));
var adminUploadQuestionImage = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	questionId: numberType().int().min(1),
	fileName: stringType().min(1).max(200),
	contentType: stringType().min(1).max(100),
	base64: stringType().min(1)
}).parse(data)).handler(createSsrRpc("4bb443d220451eda36e31aa5ee7abe41024c2c987587d3ce36a5744b37557221"));
var adminRemoveQuestionImage = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	questionId: numberType().int().min(1)
}).parse(data)).handler(createSsrRpc("450be0cd9df55f236c6ba0abce39089d2ea862ac0f9650e9a1f5b63e22cc80b1"));
var adminCreateQuestion = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(createSsrRpc("204d3b89221109fea1e54682ea7b3f14d0866ba1e047ced819ddf2dcbfc93082"));
var adminDeleteQuestion = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	questionId: numberType().int().min(1)
}).parse(data)).handler(createSsrRpc("0afecc08e6eec6ec62105fce6cab0f06a1307bb569da11d290248975cc6bb998"));
var adminSetQuestionEnabled = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	questionId: numberType().int().min(1),
	isEnabled: booleanType()
}).parse(data)).handler(createSsrRpc("dbaa19bd56333fe9a451ad8af40503651f6eac5e24c8371588f5af1a12cb1f9b"));
var adminReorderQuestions = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	orderedIds: arrayType(numberType().int().min(1)).min(1)
}).parse(data)).handler(createSsrRpc("61505594ec787e18c70d58baf00cc4a0f36e1a9f3678332ea1248986c9acf3a7"));
var adminRestoreDefaults = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(createSsrRpc("a3487d5b29d6ab35b19d4ff317bed9d4e393f07779c2c6b1aa317d3fd9d8902a"));
var adminGetSettings = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(createSsrRpc("6b533370e07b251c5a5dd40ac56f2ab94fcc70285fb22480d29bdd6508c382b9"));
var adminSetDefaultDuration = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	seconds: numberType().int().min(5).max(120)
}).parse(data)).handler(createSsrRpc("fe5c2e6369633b83c50bc72b575f4a4f01bc898c8e7bd2c382bc4bc54a7478b6"));
var adminSetShowInsights = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	show: booleanType()
}).parse(data)).handler(createSsrRpc("30f64ef6382d5872c9b6debddb14c7c3c0df8a825462cb7e054d9fcc541acf28"));
var adminUploadLogo = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	fileName: stringType().min(1).max(200),
	contentType: stringType().min(1).max(100),
	base64: stringType().min(1)
}).parse(data)).handler(createSsrRpc("2e8bb4649aab596480b49513c8d600df79a2c683d20404b7ce0da3c90bee35cf"));
var adminRemoveLogo = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(createSsrRpc("8bb1fa3198bfd5ff1a40cb8d43aec90e17eba9abbca0ab0ec19f582c976df48d"));
var adminCreateGame = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(createSsrRpc("df766c6c1cf85b6080d1bf30111b4ab3d8c4806cc7cab9a65570d5c9be053b77"));
var PASS_KEY = "impact2026.admin";
function AdminPage() {
	const hydrated = useHydrated();
	const [passcode, setPasscode] = (0, import_react.useState)("");
	const [authed, setAuthed] = (0, import_react.useState)(false);
	const [input, setInput] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [questions, setQuestions] = (0, import_react.useState)([]);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const [game, setGame] = (0, import_react.useState)(null);
	const [logoUrl, setLogoUrl] = (0, import_react.useState)(null);
	const [defaultDuration, setDefaultDuration] = (0, import_react.useState)(30);
	const [showInsights, setShowInsights] = (0, import_react.useState)(true);
	const now = useServerClock();
	const { session } = useLiveSession(game?.sessionId ?? null);
	const players = useLivePlayers(game?.sessionId ?? null);
	const sessionQuestions = useSessionQuestions(game?.sessionId ?? null);
	const questionIndex = session?.current_question_index ?? 0;
	const totalLive = session?.total_questions ?? sessionQuestions.length;
	const liveQuestion = sessionQuestions.find((q) => q.id === questionIndex) ?? null;
	const { seconds } = useCountdown(session?.phase === "QUESTION_ACTIVE" ? session.question_ends_at : null, now, liveQuestion?.durationSeconds ?? 20);
	(0, import_react.useEffect)(() => {
		const stored = typeof window !== "undefined" ? sessionStorage.getItem(PASS_KEY) : null;
		if (stored) unlock(stored, true);
		setGame(hostStorage.get());
	}, []);
	const run = (0, import_react.useCallback)(async (action, count) => {
		const host = game;
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
				setGame(null);
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "הפעולה נכשלה.");
		} finally {
			setBusy(false);
		}
	}, [game]);
	const load = async (code) => {
		const [list, settings] = await Promise.all([adminListQuestions({ data: { passcode: code } }), adminGetSettings({ data: { passcode: code } })]);
		setQuestions(list);
		setLogoUrl(settings.logoUrl);
		setDefaultDuration(settings.defaultDurationSeconds);
		setShowInsights(settings.showInsights);
	};
	const changeDefaultDuration = async (seconds) => {
		const next = Math.min(120, Math.max(5, seconds));
		const previous = defaultDuration;
		setDefaultDuration(next);
		try {
			await adminSetDefaultDuration({ data: {
				passcode,
				seconds: next
			} });
		} catch (error) {
			setDefaultDuration(previous);
			toast.error(error instanceof Error ? error.message : "שמירת ההגדרה נכשלה.");
		}
	};
	const toggleShowInsights = async (show) => {
		const previous = showInsights;
		setShowInsights(show);
		try {
			await adminSetShowInsights({ data: {
				passcode,
				show
			} });
		} catch (error) {
			setShowInsights(previous);
			toast.error(error instanceof Error ? error.message : "שמירת ההגדרה נכשלה.");
		}
	};
	const fileToBase64 = async (file) => {
		const bytes = new Uint8Array(await file.arrayBuffer());
		let binary = "";
		for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
		return btoa(binary);
	};
	const unlock = async (code, silent = false) => {
		setBusy(true);
		try {
			if (!(await adminLogin({ data: { passcode: code } })).ok) {
				sessionStorage.removeItem(PASS_KEY);
				if (!silent) toast.error("קוד ניהול שגוי.");
				return;
			}
			sessionStorage.setItem(PASS_KEY, code);
			setPasscode(code);
			setAuthed(true);
			await load(code);
		} catch (error) {
			if (!silent) toast.error(error instanceof Error ? error.message : "הכניסה נכשלה.");
		} finally {
			setBusy(false);
		}
	};
	const patch = (id, changes) => {
		setQuestions((prev) => prev.map((q) => q.id === id ? {
			...q,
			...changes
		} : q));
	};
	const setAnswer = (id, answerId, text) => {
		setQuestions((prev) => prev.map((q) => q.id === id ? {
			...q,
			answers: q.answers.map((a) => a.id === answerId ? {
				...a,
				text
			} : a)
		} : q));
	};
	const save = async (q) => {
		setBusy(true);
		try {
			await adminSaveQuestion({ data: {
				passcode,
				question: {
					id: q.id,
					category: q.category,
					pairId: q.pairId,
					title: q.title,
					subtitle: q.subtitle,
					answerA: q.answers.find((a) => a.id === "A")?.text ?? "",
					answerB: q.answers.find((a) => a.id === "B")?.text ?? "",
					answerC: q.answers.find((a) => a.id === "C")?.text ?? "",
					answerD: q.answers.find((a) => a.id === "D")?.text ?? "",
					durationSeconds: q.durationSeconds,
					scoringMode: q.scoringMode,
					executiveInsight: q.executiveInsight,
					correctAnswerId: q.correctAnswerId,
					explanation: q.explanation,
					isPlaceholder: false
				}
			} });
			patch(q.id, { isPlaceholder: false });
			toast.success(`שאלה ${q.id} נשמרה.`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "השמירה נכשלה.");
		} finally {
			setBusy(false);
		}
	};
	const upload = async (id, file) => {
		setBusy(true);
		try {
			const buffer = await file.arrayBuffer();
			let binary = "";
			const bytes = new Uint8Array(buffer);
			for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
			const res = await adminUploadQuestionImage({ data: {
				passcode,
				questionId: id,
				fileName: file.name,
				contentType: file.type || "image/png",
				base64: btoa(binary)
			} });
			patch(id, { imageUrl: res.imageUrl });
			toast.success("התמונה הועלתה.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "העלאת התמונה נכשלה.");
		} finally {
			setBusy(false);
		}
	};
	const removeImage = async (id) => {
		setBusy(true);
		try {
			await adminRemoveQuestionImage({ data: {
				passcode,
				questionId: id
			} });
			patch(id, { imageUrl: null });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "הסרת התמונה נכשלה.");
		} finally {
			setBusy(false);
		}
	};
	const addQuestion = async () => {
		setBusy(true);
		try {
			const res = await adminCreateQuestion({ data: { passcode } });
			await load(passcode);
			setOpenId(res.id);
			toast.success("נוספה שאלה חדשה.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "ההוספה נכשלה.");
		} finally {
			setBusy(false);
		}
	};
	const removeQuestion = async (id) => {
		if (!confirm(`למחוק את שאלה ${id}?`)) return;
		setBusy(true);
		try {
			await adminDeleteQuestion({ data: {
				passcode,
				questionId: id
			} });
			setQuestions((prev) => prev.filter((q) => q.id !== id));
			if (openId === id) setOpenId(null);
			toast.success("השאלה נמחקה.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "המחיקה נכשלה.");
		} finally {
			setBusy(false);
		}
	};
	const toggleEnabled = async (id, isEnabled) => {
		patch(id, { isEnabled });
		try {
			await adminSetQuestionEnabled({ data: {
				passcode,
				questionId: id,
				isEnabled
			} });
		} catch (error) {
			patch(id, { isEnabled: !isEnabled });
			toast.error(error instanceof Error ? error.message : "העדכון נכשל.");
		}
	};
	const move = async (id, direction) => {
		const index = questions.findIndex((q) => q.id === id);
		const target = index + direction;
		if (index < 0 || target < 0 || target >= questions.length) return;
		const next = [...questions];
		const [item] = next.splice(index, 1);
		next.splice(target, 0, item);
		setQuestions(next);
		try {
			await adminReorderQuestions({ data: {
				passcode,
				orderedIds: next.map((q) => q.id)
			} });
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "שינוי הסדר נכשל.");
			await load(passcode);
		}
	};
	const restoreDefaults = async () => {
		if (!confirm("לשחזר את 16 שאלות ברירת המחדל? כל השינויים יימחקו.")) return;
		setBusy(true);
		try {
			await adminRestoreDefaults({ data: { passcode } });
			await load(passcode);
			toast.success("השאלות שוחזרו.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "השחזור נכשל.");
		} finally {
			setBusy(false);
		}
	};
	const uploadLogo = async (file) => {
		setBusy(true);
		try {
			const res = await adminUploadLogo({ data: {
				passcode,
				fileName: file.name,
				contentType: file.type || "image/png",
				base64: await fileToBase64(file)
			} });
			setLogoUrl(res.logoUrl);
			toast.success("הלוגו הועלה.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "העלאת הלוגו נכשלה.");
		} finally {
			setBusy(false);
		}
	};
	const removeLogo = async () => {
		setBusy(true);
		try {
			await adminRemoveLogo({ data: { passcode } });
			setLogoUrl(null);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "הסרת הלוגו נכשלה.");
		} finally {
			setBusy(false);
		}
	};
	const startQuiz = async () => {
		setBusy(true);
		try {
			const created = await adminCreateGame({ data: { passcode } });
			const identity = {
				sessionId: created.sessionId,
				pin: created.pin,
				hostSecret: created.hostSecret
			};
			hostStorage.set(identity);
			setGame(identity);
			toast.success(`נפתח משחק עם קוד ${created.pin}`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "פתיחת המשחק נכשלה.");
		} finally {
			setBusy(false);
		}
	};
	if (!hydrated) return null;
	if (!authed) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-6 px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-3xl font-black",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-gradient-accent",
				children: "קונסולת ניהול"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: (e) => {
				e.preventDefault();
				unlock(input);
			},
			className: "surface-card w-full max-w-sm space-y-4 p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "pass",
					className: "block text-sm font-semibold",
					children: "קוד ניהול"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "pass",
					type: "password",
					value: input,
					onChange: (e) => setInput(e.target.value),
					className: "h-14 w-full rounded-2xl border border-input bg-background/60 px-4 text-lg font-semibold"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: busy,
					className: "h-14 w-full rounded-2xl bg-gradient-accent text-lg font-bold text-primary-foreground disabled:opacity-60",
					children: "כניסה"
				})
			]
		})]
	});
	const remaining = questions.filter((q) => q.isPlaceholder).length;
	const ready = questions.length === 16 && remaining === 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-4xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6 flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-black",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-gradient-accent",
						children: "קונסולת ניהול"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						questions.length,
						" שאלות · ",
						remaining,
						" עדיין בטיוטה"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/present",
					className: "rounded-xl border border-input px-4 py-2 text-sm font-semibold",
					children: "מסך המשחק החי"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card mb-6 space-y-3 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold",
						children: "פתיחת חידון"
					}),
					ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "כל השאלות נשמרו – אפשר לפתוח משחק."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-amber-400",
						children: [
							"יש עדיין ",
							remaining,
							" שאלות שלא נשמרו. אפשר לפתוח משחק לצורכי בדיקה בלבד."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => void startQuiz(),
							disabled: busy,
							className: "h-12 rounded-xl bg-gradient-accent px-6 font-bold text-primary-foreground disabled:opacity-60",
							children: "פתיחת משחק חדש"
						}), game && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular rounded-xl bg-primary px-4 py-2 text-lg font-black text-primary-foreground",
							dir: "ltr",
							children: game.pin
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/present",
							className: "h-12 rounded-xl border border-input px-6 font-semibold leading-[3rem]",
							children: "התחלת החידון ←"
						})] })]
					})
				]
			}),
			game && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card mb-6 space-y-3 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-bold",
							children: "שליטה במשחק החי"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-lg bg-muted px-3 py-1 font-semibold",
									children: [players.length, " משתתפים"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-lg bg-muted px-3 py-1 font-semibold",
									children: [
										"שאלה ",
										questionIndex || 0,
										"/",
										totalLive
									]
								}),
								session?.phase === "QUESTION_ACTIVE" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular rounded-lg bg-primary px-3 py-1 font-black text-primary-foreground",
									children: [seconds, "s"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-lg bg-muted px-3 py-1 font-semibold",
									children: session?.phase ?? "—"
								})
							]
						})]
					}),
					liveQuestion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: liveQuestion.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							(() => {
								const step = session ? nextAction(session.phase, session.current_question_index, totalLive) : null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => step && void run(step.action),
									disabled: busy || !step,
									className: "h-12 flex-1 rounded-xl bg-gradient-accent px-6 font-bold text-primary-foreground disabled:opacity-50",
									children: step ? `${step.label} ←` : "המשחק הסתיים"
								});
							})(),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => void run("LOCK"),
								disabled: busy || session?.phase !== "QUESTION_ACTIVE",
								className: "h-12 rounded-xl border border-input px-4 font-semibold disabled:opacity-50",
								children: "נעילת שאלה"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => void run("ADD_BOTS", 10),
								disabled: busy,
								className: "h-12 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50",
								children: "+ 10 בוטים"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => void run("CLEAR_BOTS"),
								disabled: busy,
								className: "h-12 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50",
								children: "ניקוי בוטים"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => void run("TOGGLE_LATE_JOIN"),
								disabled: busy,
								className: "h-12 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50",
								children: session?.allow_late_join ? "חסימת הצטרפות מאוחרת" : "אפשור הצטרפות מאוחרת"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => void run("RESET"),
								disabled: busy,
								className: "h-12 rounded-xl border border-input px-4 text-sm font-semibold disabled:opacity-50",
								children: "איפוס"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									if (confirm("לסגור את המשחק הנוכחי?")) run("DELETE");
								},
								disabled: busy,
								className: "h-12 rounded-xl border border-destructive/40 px-4 text-sm font-semibold text-destructive disabled:opacity-50",
								children: "סגירת משחק"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card mb-6 space-y-3 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold",
						children: "זמן ברירת מחדל למענה"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "זמן המענה שיוגדר לשאלות חדשות. אפשר לשנות בקפיצות של 5 שניות."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => void changeDefaultDuration(defaultDuration - 5),
								disabled: busy || defaultDuration <= 5,
								"aria-label": "הפחתת 5 שניות",
								className: "h-11 w-11 rounded-xl border border-input text-lg font-bold disabled:opacity-40",
								children: "−"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular w-24 rounded-xl bg-muted px-4 py-2 text-center text-lg font-black",
								children: [defaultDuration, "s"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => void changeDefaultDuration(defaultDuration + 5),
								disabled: busy || defaultDuration >= 120,
								"aria-label": "הוספת 5 שניות",
								className: "h-11 w-11 rounded-xl border border-input text-lg font-bold disabled:opacity-40",
								children: "+"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card mb-6 space-y-3 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold",
						children: "הצגת תובנות במסך המנחה"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "מאפשר הצגת תובנה מחושבת על אופן הצבעת המשתתפים."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: showInsights,
							onChange: (e) => void toggleShowInsights(e.target.checked),
							disabled: busy,
							className: "h-5 w-5 rounded border-input text-primary focus:ring-primary"
						}), "הצג תובנות מההצבעה (Insights)"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "surface-card mb-6 space-y-3 p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-bold",
					children: "לוגו היחידה"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [
						logoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: logoUrl,
							alt: "לוגו היחידה",
							className: "h-16 w-16 rounded-xl border border-border object-contain"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "file",
							accept: "image/*",
							onChange: (e) => {
								const file = e.target.files?.[0];
								if (file) uploadLogo(file);
								e.target.value = "";
							},
							className: "text-sm"
						}),
						logoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => void removeLogo(),
							disabled: busy,
							className: "rounded-xl border border-input px-3 py-2 text-sm font-semibold",
							children: "הסרת לוגו"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => void addQuestion(),
					disabled: busy,
					className: "h-11 rounded-xl bg-primary px-5 font-bold text-primary-foreground disabled:opacity-60",
					children: "+ הוספת שאלה"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => void restoreDefaults(),
					disabled: busy,
					className: "h-11 rounded-xl border border-input px-5 font-semibold disabled:opacity-60",
					children: "שחזור שאלות ברירת המחדל"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: questions.map((q, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "surface-card overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 p-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => void move(q.id, -1),
									disabled: busy || index === 0,
									"aria-label": "העלאה למעלה",
									className: "rounded-md px-2 text-xs disabled:opacity-30",
									children: "▲"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => void move(q.id, 1),
									disabled: busy || index === questions.length - 1,
									"aria-label": "הורדה למטה",
									className: "rounded-md px-2 text-xs disabled:opacity-30",
									children: "▼"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setOpenId(openId === q.id ? null : q.id),
								className: "flex flex-1 items-center justify-between gap-3 p-2 text-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs font-bold text-primary",
										children: [
											index + 1,
											". שאלה ",
											q.id,
											" · ",
											CATEGORY_LABEL[q.category]
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `mt-1 block font-bold ${q.isEnabled ? "" : "opacity-40"}`,
										children: q.title
									})]
								}), q.isPlaceholder && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-lg bg-amber-500/15 px-2 py-1 text-xs font-bold text-amber-400",
									children: "טיוטה"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex shrink-0 items-center gap-1 text-xs font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: q.isEnabled,
									onChange: (e) => void toggleEnabled(q.id, e.target.checked)
								}), "פעילה"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => void removeQuestion(q.id),
								disabled: busy,
								className: "shrink-0 rounded-lg border border-destructive/40 px-2 py-1 text-xs font-semibold text-destructive disabled:opacity-40",
								children: "מחיקה"
							})
						]
					}), openId === q.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4 border-t border-border p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "סוג",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: q.category,
										onChange: (e) => patch(q.id, { category: e.target.value }),
										className: "h-11 w-full rounded-xl border border-input bg-background/60 px-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "OUTPUT",
											children: "תפוקה · OUTPUT"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "OUTCOME",
											children: "אימפקט · OUTCOME"
										})]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "זמן (שניות)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										min: 5,
										max: 120,
										value: q.durationSeconds,
										onChange: (e) => patch(q.id, { durationSeconds: Number(e.target.value) }),
										className: "h-11 w-full rounded-xl border border-input bg-background/60 px-3"
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "שאלה",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: q.title,
									onChange: (e) => patch(q.id, { title: e.target.value }),
									rows: 2,
									className: "w-full rounded-xl border border-input bg-background/60 p-3"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "כותרת משנה",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: q.subtitle ?? "",
									onChange: (e) => patch(q.id, { subtitle: e.target.value || null }),
									className: "h-11 w-full rounded-xl border border-input bg-background/60 px-3"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid gap-3 sm:grid-cols-2",
								children: ANSWER_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: `תשובה ${id}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: q.answers.find((a) => a.id === id)?.text ?? "",
											onChange: (e) => setAnswer(q.id, id, e.target.value),
											className: "h-11 w-full rounded-xl border border-input bg-background/60 px-3"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex shrink-0 items-center gap-1 text-xs font-semibold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "radio",
												name: `correct-${q.id}`,
												checked: q.correctAnswerId === id,
												onChange: () => patch(q.id, { correctAnswerId: id })
											}), "נכונה"]
										})]
									})
								}, id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "תובנה ניהולית (מוצגת אחרי שאלת אימפקט)",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									value: q.executiveInsight ?? "",
									onChange: (e) => patch(q.id, { executiveInsight: e.target.value || null }),
									rows: 2,
									className: "w-full rounded-xl border border-input bg-background/60 p-3"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "תמונה למסך הגדול",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-3",
									children: [
										q.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: q.imageUrl,
											alt: `תמונה לשאלה ${q.id}`,
											className: "h-20 w-32 rounded-lg border border-border object-cover"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "file",
											accept: "image/*",
											onChange: (e) => {
												const file = e.target.files?.[0];
												if (file) upload(q.id, file);
												e.target.value = "";
											},
											className: "text-sm"
										}),
										q.imageUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => void removeImage(q.id),
											className: "rounded-xl border border-input px-3 py-2 text-sm font-semibold",
											children: "הסרה"
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => void save(q),
								disabled: busy,
								className: "h-12 w-full rounded-xl bg-gradient-accent font-bold text-primary-foreground disabled:opacity-60",
								children: ["שמירת שאלה ", q.id]
							})
						]
					})]
				}, q.id))
			})
		]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mb-1 block text-xs font-semibold text-muted-foreground",
		children: label
	}), children] });
}
//#endregion
export { AdminPage as component };
