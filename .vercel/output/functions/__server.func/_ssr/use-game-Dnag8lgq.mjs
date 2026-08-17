import { o as __toESM } from "../_runtime.mjs";
import { r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { i as getServerFnById, r as createServerFn, t as TSS_SERVER_FUNCTION } from "./server-CQ9vf1HB2.mjs";
import { a as objectType, i as numberType, o as stringType, r as enumType } from "../_libs/zod.mjs";
import { a as getApp, o as getApps, s as initializeApp } from "../_libs/@firebase/app+[...].mjs";
import "../_libs/firebase.mjs";
import { a as where, c as getFirestore, i as query, n as onSnapshot, o as collection, r as orderBy, s as doc, t as getDoc } from "../_libs/@firebase/firestore+[...].mjs";
import { n as signInAnonymously, t as getAuth } from "../_libs/firebase__auth.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-game-Dnag8lgq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var uuid = stringType().uuid();
var secret = stringType().min(16).max(128);
var getServerTime = createServerFn({ method: "GET" }).handler(createSsrRpc("ecb32366350328e1740f0cd95f3100012c617872b4bbaaa90e313198f908411d"));
var verifyHost = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	sessionId: uuid,
	hostSecret: secret
}).parse(data)).handler(createSsrRpc("bc796c3c8ba86cd91e3ef9085a32cc8c2ec8d9ea7e90832f7a99214aa9bbab28"));
var hostCommand = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	sessionId: uuid,
	hostSecret: secret,
	action: enumType([
		"START_GAME",
		"START_QUESTION",
		"SHOW_RESULTS",
		"SHOW_LEADERBOARD",
		"NEXT_QUESTION",
		"FINISH",
		"LOCK",
		"RESET",
		"DELETE",
		"ADD_BOTS",
		"CLEAR_BOTS",
		"TOGGLE_LATE_JOIN"
	]),
	count: numberType().int().min(1).max(100).optional()
}).parse(data)).handler(createSsrRpc("35c3318731491ac481f936c4b61f12bda52eb76eafa01e7867f50846d266a65a"));
var questionTick = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	sessionId: uuid,
	hostSecret: secret
}).parse(data)).handler(createSsrRpc("91badcedecf69ea1e90d94ad2d8c79e135b6828789992b9eed7a9a587f134859"));
var joinGame = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	pin: stringType().length(4),
	displayName: stringType().min(1).max(64)
}).parse(data)).handler(createSsrRpc("cd640430dc0b8389e5a13c3f7efc1e47c6029876115c2ec74018be933387f1cb"));
var submitAnswer = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	sessionId: uuid,
	playerId: uuid,
	playerSecret: secret,
	questionId: numberType().int().min(1).max(16),
	answerId: enumType([
		"A",
		"B",
		"C",
		"D"
	])
}).parse(data)).handler(createSsrRpc("e7951ab79222767ae64dd26f95c0de87a1a146af576a8b078621e034378e544f"));
var playerState = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	playerId: uuid,
	playerSecret: secret
}).parse(data)).handler(createSsrRpc("507fb07beb77196c8f29e44e5635169e98d631b88877655d6af681ee8ade9416"));
var app = getApps().length > 0 ? getApp() : initializeApp({
	apiKey: void 0,
	authDomain: void 0,
	projectId: void 0,
	storageBucket: void 0,
	messagingSenderId: void 0,
	appId: void 0
});
var db = getFirestore(app);
getAuth(app);
var CONNECTION_LABEL = {
	connecting: "מתחבר...",
	connected: "מחובר",
	reconnecting: "מתחבר מחדש...",
	offline: "החיבור נותק"
};
function connectionLabel(state) {
	return CONNECTION_LABEL[state];
}
/** Offset between backend clock and this device clock (ms). */
function useServerClock() {
	const [offset, setOffset] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		const sync = async () => {
			const started = Date.now();
			try {
				const { now } = await getServerTime();
				const rtt = Date.now() - started;
				if (!cancelled) setOffset(now + rtt / 2 - Date.now());
			} catch {}
		};
		sync();
		const id = setInterval(() => void sync(), 6e4);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, []);
	return (0, import_react.useCallback)(() => Date.now() + offset, [offset]);
}
/** Make sure Anonymous Auth is initialized */
function useEnsureAuth() {
	(0, import_react.useEffect)(() => {
		const auth = getAuth();
		if (!auth.currentUser) signInAnonymously(auth).catch(console.error);
	}, []);
}
function useLiveSession(sessionId) {
	useEnsureAuth();
	const [session, setSession] = (0, import_react.useState)(null);
	const [connection, setConnection] = (0, import_react.useState)("connecting");
	const refetch = (0, import_react.useCallback)(async () => {
		if (!sessionId) return;
		const snap = await getDoc(doc(db, "sessions", sessionId));
		if (snap.exists()) {
			const d = snap.data();
			setSession({
				id: snap.id,
				title: d.title,
				status: d.status,
				phase: d.phase,
				current_question_index: d.currentQuestionIndex,
				question_started_at: d.questionStartedAt,
				question_ends_at: d.questionEndsAt,
				revealed_answer_id: d.revealedAnswerId,
				allow_late_join: d.allowLateJoin,
				created_at: d.createdAt,
				expires_at: d.expiresAt,
				updated_at: d.updatedAt,
				total_questions: d.totalQuestions
			});
		}
	}, [sessionId]);
	(0, import_react.useEffect)(() => {
		if (!sessionId) return;
		setConnection("connecting");
		const unsubscribe = onSnapshot(doc(db, "sessions", sessionId), (snap) => {
			if (!snap.exists()) return;
			const d = snap.data();
			setSession({
				id: snap.id,
				title: d.title,
				status: d.status,
				phase: d.phase,
				current_question_index: d.currentQuestionIndex,
				question_started_at: d.questionStartedAt,
				question_ends_at: d.questionEndsAt,
				revealed_answer_id: d.revealedAnswerId,
				allow_late_join: d.allowLateJoin,
				created_at: d.createdAt,
				expires_at: d.expiresAt,
				updated_at: d.updatedAt,
				total_questions: d.totalQuestions
			});
			setConnection("connected");
		}, (error) => {
			setConnection("reconnecting");
		});
		const onOnline = () => setConnection("reconnecting");
		const onOffline = () => setConnection("offline");
		window.addEventListener("online", onOnline);
		window.addEventListener("offline", onOffline);
		return () => {
			unsubscribe();
			window.removeEventListener("online", onOnline);
			window.removeEventListener("offline", onOffline);
		};
	}, [sessionId]);
	return {
		session,
		connection,
		refetchSession: refetch
	};
}
function useLivePlayers(sessionId) {
	const [players, setPlayers] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!sessionId) return;
		const q = collection(db, `sessions/${sessionId}/players`);
		const unsubscribe = onSnapshot(q, (snap) => {
			setPlayers(snap.docs.map((d) => {
				const p = d.data();
				return {
					id: d.id,
					session_id: sessionId,
					display_name: p.displayName,
					total_score: p.totalScore,
					correct_count: p.correctCount,
					cumulative_response_ms: p.cumulativeResponseMs,
					is_virtual: p.isVirtual,
					joined_at: p.joinedAt
				};
			}));
		});
		return () => unsubscribe();
	}, [sessionId]);
	return players;
}
function useQuestionAnswers(sessionId, questionId, enabled) {
	const [answers, setAnswers] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!sessionId || !enabled || questionId < 1) {
			setAnswers([]);
			return;
		}
		const q = query(collection(db, `sessions/${sessionId}/answers`), where("questionId", "==", questionId));
		const unsubscribe = onSnapshot(q, (snap) => {
			setAnswers(snap.docs.map((d) => {
				const a = d.data();
				return {
					player_id: a.playerId,
					question_id: a.questionId,
					answer_id: a.answerId,
					is_correct: a.isCorrect,
					response_ms: a.responseMs,
					awarded_score: a.awardedScore
				};
			}));
		});
		return () => unsubscribe();
	}, [
		sessionId,
		questionId,
		enabled
	]);
	return answers;
}
function useCountdown(endsAt, now, durationSeconds) {
	const [tick, setTick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!endsAt) return;
		setTick((v) => v + 1);
		const id = window.setInterval(() => setTick((v) => (v + 1) % 1e5), 100);
		return () => window.clearInterval(id);
	}, [endsAt]);
	return (0, import_react.useMemo)(() => {
		if (!endsAt) return {
			remainingMs: durationSeconds * 1e3,
			seconds: durationSeconds,
			ratio: 1
		};
		const remainingMs = Math.max(0, new Date(endsAt).getTime() - now());
		return {
			remainingMs,
			seconds: Math.ceil(remainingMs / 1e3),
			ratio: Math.max(0, Math.min(1, remainingMs / (durationSeconds * 1e3)))
		};
	}, [
		endsAt,
		now,
		durationSeconds,
		tick
	]);
}
function useSessionQuestions(sessionId) {
	const [questions, setQuestions] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (!sessionId) {
			setQuestions([]);
			return;
		}
		const q = query(collection(db, `sessions/${sessionId}/questions`), orderBy("position"));
		const unsubscribe = onSnapshot(q, (snap) => {
			setQuestions(snap.docs.map((d) => {
				const qData = d.data();
				return {
					id: qData.position,
					category: qData.category,
					pairId: qData.pairId,
					title: qData.title,
					subtitle: qData.subtitle,
					answers: qData.answers,
					durationSeconds: qData.durationSeconds,
					scoringMode: qData.scoringMode,
					executiveInsight: qData.executiveInsight,
					isPlaceholder: false,
					imageUrl: qData.imageUrl ?? null
				};
			}));
		});
		return () => unsubscribe();
	}, [sessionId]);
	return questions;
}
function useAppSetting(key) {
	const [value, setValue] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const unsubscribe = onSnapshot(doc(db, "settings", "global"), (snap) => {
			if (snap.exists()) {
				const data = snap.data();
				setValue(data[key] ?? null);
			} else setValue(null);
		});
		return () => unsubscribe();
	}, [key]);
	return value;
}
var PLAYER_KEY = "impact2026.player";
var HOST_KEY = "impact2026.host";
function read(key) {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(key);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
function write(key, value) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(key, JSON.stringify(value));
}
var playerStorage = {
	get: () => read(PLAYER_KEY),
	set: (identity) => write(PLAYER_KEY, identity),
	clear: () => typeof window !== "undefined" && window.localStorage.removeItem(PLAYER_KEY)
};
var hostStorage = {
	get: () => read(HOST_KEY),
	set: (identity) => write(HOST_KEY, identity),
	clear: () => typeof window !== "undefined" && window.localStorage.removeItem(HOST_KEY)
};
function useHydrated() {
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setHydrated(true), []);
	return hydrated;
}
//#endregion
export { useSessionQuestions as _, joinGame as a, questionTick as c, useCountdown as d, useHydrated as f, useServerClock as g, useQuestionAnswers as h, hostStorage as i, submitAnswer as l, useLiveSession as m, createSsrRpc as n, playerState as o, useLivePlayers as p, hostCommand as r, playerStorage as s, connectionLabel as t, useAppSetting as u, verifyHost as v };
