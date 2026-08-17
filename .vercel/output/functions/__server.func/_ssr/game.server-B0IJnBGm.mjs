import { o as __toESM } from "../_runtime.mjs";
import { c as resolveAction, d as validatePin, i as computeScore, s as normalizeName, u as validateName } from "./quiz-ak5S6P9L.mjs";
import { t as require_lib } from "../_libs/firebase-admin+[...].mjs";
import * as crypto from "crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/game.server-B0IJnBGm.js
var import_lib = /* @__PURE__ */ __toESM(require_lib());
if (!import_lib.default.apps.length) {
	if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) import_lib.initializeApp({
		credential: import_lib.default.credential.cert({
			projectId: process.env.FIREBASE_PROJECT_ID,
			clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
			privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
		}),
		storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET
	});
	else import_lib.initializeApp({
		credential: import_lib.default.credential.applicationDefault(),
		storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET
	});
}
var adminDb = import_lib.default.firestore();
import_lib.default.auth();
var adminStorage = import_lib.default.storage();
var GameError = class extends Error {
	code;
	constructor(code, message) {
		super(message);
		this.code = code;
	}
};
async function sha256(value) {
	const bytes = new TextEncoder().encode(value);
	const digest = await crypto.subtle.digest("SHA-256", bytes);
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomToken() {
	const bytes = /* @__PURE__ */ new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomPin() {
	const bytes = /* @__PURE__ */ new Uint32Array(1);
	crypto.getRandomValues(bytes);
	return String(bytes[0] % 1e4).padStart(4, "0");
}
function seeded(seed) {
	let h = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		h ^= seed.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return (h >>> 0) % 1e5 / 1e5;
}
async function loadSession(sessionId) {
	const snap = await adminDb.collection("sessions").doc(sessionId).get();
	if (!snap.exists) throw new GameError("NOT_FOUND", "המשחק לא נמצא.");
	return {
		id: snap.id,
		...snap.data()
	};
}
async function assertHost(sessionId, hostSecret) {
	const session = await loadSession(sessionId);
	const hash = await sha256(hostSecret ?? "");
	if (!session.hostSecretHash || session.hostSecretHash !== hash) throw new GameError("FORBIDDEN", "אין הרשאת מנחה למשחק הזה.");
	return session;
}
async function assertPlayer(sessionId, playerId, playerSecret) {
	const snap = await adminDb.collection(`sessions/${sessionId}/players`).doc(playerId).get();
	if (!snap.exists) throw new GameError("FORBIDDEN", "השחקן אינו משויך למשחק הזה.");
	const player = snap.data();
	const hash = await sha256(playerSecret ?? "");
	if (player.playerSecretHash !== hash) throw new GameError("FORBIDDEN", "זיהוי השחקן אינו תקין.");
	return {
		id: snap.id,
		...player
	};
}
async function loadQuestion(sessionId, position) {
	const snap = await adminDb.collection(`sessions/${sessionId}/questions`).doc(String(position)).get();
	if (!snap.exists) throw new GameError("NOT_FOUND", "השאלה לא נמצאה.");
	return snap.data();
}
async function loadKey(sessionId, position) {
	return (await adminDb.collection(`sessions/${sessionId}/keys`).doc(String(position)).get()).data()?.correctAnswerId ?? "A";
}
async function buildSnapshot(sessionId) {
	const qSnap = await adminDb.collection("questions").where("isEnabled", "==", true).orderBy("orderIndex").get();
	if (qSnap.empty) throw new GameError("NO_QUESTIONS", "אין שאלות פעילות להתחלת משחק.");
	const keysSnap = await adminDb.collection("question_keys").get();
	const keyMap = new Map(keysSnap.docs.map((d) => [d.id, d.data()]));
	const batch = adminDb.batch();
	(await adminDb.collection(`sessions/${sessionId}/questions`).get()).docs.forEach((d) => batch.delete(d.ref));
	(await adminDb.collection(`sessions/${sessionId}/keys`).get()).docs.forEach((d) => batch.delete(d.ref));
	qSnap.docs.forEach((doc, i) => {
		const q = doc.data();
		const pos = i + 1;
		const qRef = adminDb.collection(`sessions/${sessionId}/questions`).doc(String(pos));
		const kRef = adminDb.collection(`sessions/${sessionId}/keys`).doc(String(pos));
		batch.set(qRef, {
			position: pos,
			questionId: Number(doc.id),
			category: q.category,
			pairId: q.pairId,
			title: q.title,
			subtitle: q.subtitle,
			answers: q.answers,
			durationSeconds: q.durationSeconds,
			scoringMode: q.scoringMode,
			executiveInsight: q.executiveInsight,
			imageUrl: q.imageUrl ?? null
		});
		batch.set(kRef, {
			position: pos,
			correctAnswerId: keyMap.get(doc.id)?.correctAnswerId ?? "A",
			explanation: keyMap.get(doc.id)?.explanation ?? null
		});
	});
	await batch.commit();
	return qSnap.size;
}
async function createGameImpl() {
	const hostSecret = randomToken();
	const hostSecretHash = await sha256(hostSecret);
	for (let attempt = 0; attempt < 12; attempt++) {
		const pin = randomPin();
		try {
			return {
				sessionId: await adminDb.runTransaction(async (t) => {
					if (!(await t.get(adminDb.collection("sessions").where("pin", "==", pin).where("status", "==", "ACTIVE").limit(1))).empty) throw new Error("COLLISION");
					const newRef = adminDb.collection("sessions").doc();
					const expiresAt = new Date(Date.now() + 864e5).toISOString();
					t.set(newRef, {
						pin,
						status: "ACTIVE",
						phase: "LOBBY",
						currentQuestionIndex: 0,
						questionStartedAt: null,
						questionEndsAt: null,
						allowLateJoin: true,
						totalQuestions: 0,
						createdAt: (/* @__PURE__ */ new Date()).toISOString(),
						updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
						expiresAt,
						hostSecretHash
					});
					return newRef.id;
				}),
				pin,
				hostSecret
			};
		} catch (e) {
			if (e.message === "COLLISION") continue;
			throw new GameError("DB_ERROR", e.message);
		}
	}
	throw new GameError("PIN_EXHAUSTED", "לא הצלחנו להקצות קוד משחק פנוי. נסו שוב.");
}
var GAME_ACTIONS = [
	"START_GAME",
	"START_QUESTION",
	"LOCK",
	"SHOW_RESULTS",
	"SHOW_LEADERBOARD",
	"NEXT_QUESTION",
	"FINISH"
];
var BOT_FIRST_NAMES = [
	"נועה",
	"איתי",
	"שירה",
	"יונתן",
	"מאיה",
	"עומר",
	"תמר",
	"אורי",
	"ליאור",
	"רוני",
	"דנה",
	"אלון",
	"הילה",
	"גיא",
	"יעל",
	"אמיר"
];
async function hostCommandImpl(input) {
	const session = await assertHost(input.sessionId, input.hostSecret);
	if (GAME_ACTIONS.includes(input.action)) {
		const action = input.action;
		let totalQuestions = session.totalQuestions;
		if (action === "START_GAME" && session.phase === "LOBBY") totalQuestions = await buildSnapshot(session.id);
		const next = resolveAction(action, session.phase, session.currentQuestionIndex, totalQuestions);
		if (!next) throw new GameError("INVALID_TRANSITION", "הפעולה אינה אפשרית במצב הנוכחי.");
		const patch = {
			phase: next.phase,
			currentQuestionIndex: next.questionIndex,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		if (action === "START_GAME") patch.totalQuestions = totalQuestions;
		if (next.phase === "QUESTION_INTRO") {
			patch.questionStartedAt = null;
			patch.questionEndsAt = null;
			patch.revealedAnswerId = null;
		}
		if (next.phase === "QUESTION_ACTIVE") {
			const question = await loadQuestion(session.id, next.questionIndex);
			const now = Date.now();
			patch.questionStartedAt = new Date(now).toISOString();
			patch.questionEndsAt = new Date(now + question.durationSeconds * 1e3).toISOString();
			patch.revealedAnswerId = null;
		}
		if (next.phase === "SHOW_RESULTS") patch.revealedAnswerId = await loadKey(session.id, next.questionIndex);
		try {
			await adminDb.runTransaction(async (t) => {
				const snap = await t.get(adminDb.collection("sessions").doc(session.id));
				const data = snap.data();
				if (data.phase !== session.phase || data.currentQuestionIndex !== session.currentQuestionIndex) throw new GameError("CONFLICT", "המצב כבר עודכן.");
				t.update(snap.ref, patch);
			});
			return {
				phase: next.phase,
				questionIndex: next.questionIndex
			};
		} catch (error) {
			if (error instanceof GameError) throw error;
			throw new GameError("DB_ERROR", error.message);
		}
	}
	switch (input.action) {
		case "RESET": {
			const sRef = adminDb.collection("sessions").doc(session.id);
			await adminDb.runTransaction(async (t) => {
				t.update(sRef, {
					phase: "LOBBY",
					currentQuestionIndex: 0,
					questionStartedAt: null,
					questionEndsAt: null,
					revealedAnswerId: null,
					totalQuestions: 0,
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				});
			});
			const batch = adminDb.batch();
			(await adminDb.collection(`sessions/${session.id}/players`).get()).docs.forEach((d) => batch.update(d.ref, {
				totalScore: 0,
				correctCount: 0,
				cumulativeResponseMs: 0
			}));
			(await adminDb.collection(`sessions/${session.id}/answers`).get()).docs.forEach((d) => batch.delete(d.ref));
			(await adminDb.collection(`sessions/${session.id}/questions`).get()).docs.forEach((d) => batch.delete(d.ref));
			(await adminDb.collection(`sessions/${session.id}/keys`).get()).docs.forEach((d) => batch.delete(d.ref));
			if (batch._writes.length > 0) await batch.commit();
			return { ok: true };
		}
		case "DELETE":
			await adminDb.collection("sessions").doc(session.id).update({
				status: "ENDED",
				updatedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
			return { ok: true };
		case "TOGGLE_LATE_JOIN":
			await adminDb.collection("sessions").doc(session.id).update({ allowLateJoin: !session.allowLateJoin });
			return { ok: true };
		case "ADD_BOTS": {
			const count = Math.min(Math.max(input.count ?? 10, 1), 100);
			const playersSnap = await adminDb.collection(`sessions/${session.id}/players`).get();
			const taken = new Set(playersSnap.docs.map((d) => d.data().normalizedName));
			const batch = adminDb.batch();
			let n = 1;
			let added = 0;
			while (added < count && n < count * 40) {
				const name = `${BOT_FIRST_NAMES[n % BOT_FIRST_NAMES.length]} (סימולציה ${n})`;
				n++;
				const normalized = normalizeName(name);
				if (taken.has(normalized)) continue;
				taken.add(normalized);
				const ref = adminDb.collection(`sessions/${session.id}/players`).doc();
				batch.set(ref, {
					displayName: name,
					normalizedName: normalized,
					isVirtual: true,
					totalScore: 0,
					correctCount: 0,
					cumulativeResponseMs: 0,
					joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
					lastSeenAt: (/* @__PURE__ */ new Date()).toISOString()
				});
				added++;
			}
			if (added > 0) await batch.commit();
			return { added };
		}
		case "CLEAR_BOTS": {
			const bots = await adminDb.collection(`sessions/${session.id}/players`).where("isVirtual", "==", true).get();
			if (!bots.empty) {
				const batch = adminDb.batch();
				bots.docs.forEach((d) => batch.delete(d.ref));
				await batch.commit();
			}
			return { ok: true };
		}
		default: throw new GameError("BAD_ACTION", "פעולה לא מוכרת.");
	}
}
async function joinGameImpl(input) {
	if (!validatePin(input.pin)) throw new GameError("BAD_PIN", "קוד המשחק חייב להיות בן 4 ספרות.");
	const nameError = validateName(input.displayName);
	if (nameError) throw new GameError("BAD_NAME", nameError);
	const displayName = input.displayName.trim().replace(/\s+/g, " ");
	const normalized = normalizeName(displayName);
	const snap = await adminDb.collection("sessions").where("pin", "==", input.pin).where("status", "==", "ACTIVE").limit(1).get();
	if (snap.empty) throw new GameError("NO_GAME", "לא מצאנו משחק עם הקוד הזה.");
	const session = {
		id: snap.docs[0].id,
		...snap.docs[0].data()
	};
	if (new Date(session.expiresAt).getTime() < Date.now()) throw new GameError("EXPIRED", "המשחק הסתיים.");
	if (session.phase !== "LOBBY" && !session.allowLateJoin) throw new GameError("CLOSED", "המשחק כבר התחיל ולא ניתן להצטרף כעת.");
	const playerSecret = randomToken();
	const playerSecretHash = await sha256(playerSecret);
	try {
		const playerId = await adminDb.runTransaction(async (t) => {
			if (!(await t.get(adminDb.collection(`sessions/${session.id}/players`).where("normalizedName", "==", normalized).limit(1))).empty) throw new Error("NAME_TAKEN");
			const newRef = adminDb.collection(`sessions/${session.id}/players`).doc();
			t.set(newRef, {
				displayName,
				normalizedName: normalized,
				isVirtual: false,
				playerSecretHash,
				totalScore: 0,
				correctCount: 0,
				cumulativeResponseMs: 0,
				joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
				lastSeenAt: (/* @__PURE__ */ new Date()).toISOString()
			});
			return newRef.id;
		});
		return {
			sessionId: session.id,
			pin: session.pin,
			playerId,
			playerSecret,
			displayName
		};
	} catch (error) {
		if (error.message === "NAME_TAKEN") throw new GameError("NAME_TAKEN", "השם כבר נמצא במשחק. בחרו שם אחר.");
		throw new GameError("DB_ERROR", error.message);
	}
}
async function submitAnswerImpl(input) {
	await assertPlayer(input.sessionId, input.playerId, input.playerSecret);
	const session = await loadSession(input.sessionId);
	if (session.phase !== "QUESTION_ACTIVE") throw new GameError("NOT_ACTIVE", "לא ניתן לענות כרגע.");
	if (session.currentQuestionIndex !== input.questionId) throw new GameError("WRONG_QUESTION", "השאלה כבר הוחלפה.");
	if (![
		"A",
		"B",
		"C",
		"D"
	].includes(input.answerId)) throw new GameError("BAD_ANSWER", "תשובה לא חוקית.");
	const now = Date.now();
	const endsAt = session.questionEndsAt ? new Date(session.questionEndsAt).getTime() : 0;
	const startedAt = session.questionStartedAt ? new Date(session.questionStartedAt).getTime() : now;
	if (now > endsAt + 750) throw new GameError("TOO_LATE", "הזמן נגמר.");
	const question = await loadQuestion(input.sessionId, input.questionId);
	const isCorrect = await loadKey(input.sessionId, input.questionId) === input.answerId;
	const remainingMs = Math.max(0, endsAt - now);
	const score = computeScore(isCorrect, remainingMs, question.durationSeconds, question.scoringMode);
	const responseMs = Math.max(0, now - startedAt);
	const answerRefId = `${input.questionId}_${input.playerId}`;
	const answerRef = adminDb.collection(`sessions/${session.id}/answers`).doc(answerRefId);
	const playerRef = adminDb.collection(`sessions/${session.id}/players`).doc(input.playerId);
	try {
		const recorded = await adminDb.runTransaction(async (t) => {
			if ((await t.get(answerRef)).exists) return false;
			const pData = (await t.get(playerRef)).data();
			t.set(answerRef, {
				playerId: input.playerId,
				questionId: input.questionId,
				answerId: input.answerId,
				isCorrect,
				responseMs,
				awardedScore: score,
				submittedAt: (/* @__PURE__ */ new Date()).toISOString()
			});
			t.update(playerRef, {
				totalScore: pData.totalScore + score,
				correctCount: pData.correctCount + (isCorrect ? 1 : 0),
				cumulativeResponseMs: pData.cumulativeResponseMs + responseMs,
				lastSeenAt: (/* @__PURE__ */ new Date()).toISOString()
			});
			return true;
		});
		return {
			recorded,
			duplicate: !recorded
		};
	} catch (error) {
		throw new GameError("DB_ERROR", error.message);
	}
}
async function playerStateImpl(input) {
	const playerDoc = (await adminDb.collectionGroup("players").where("playerSecretHash", "==", await sha256(input.playerSecret)).get()).docs.find((d) => d.id === input.playerId);
	if (!playerDoc) throw new GameError("NOT_FOUND", "השחקן לא נמצא או זיהוי שגוי.");
	const pData = playerDoc.data();
	const sessionId = playerDoc.ref.parent.parent.id;
	await playerDoc.ref.update({ lastSeenAt: (/* @__PURE__ */ new Date()).toISOString() });
	const session = await loadSession(sessionId);
	const answerId = `${session.currentQuestionIndex}_${input.playerId}`;
	const answerSnap = await adminDb.collection(`sessions/${sessionId}/answers`).doc(answerId).get();
	return {
		sessionId: session.id,
		pin: session.pin,
		displayName: pData.displayName,
		answeredCurrent: answerSnap.exists ? answerSnap.data()?.answerId : null
	};
}
async function questionTickImpl(input) {
	const session = await assertHost(input.sessionId, input.hostSecret);
	const questionId = session.currentQuestionIndex;
	if (questionId < 1 || questionId > session.totalQuestions) return {
		answered: 0,
		total: 0
	};
	const all = (await adminDb.collection(`sessions/${session.id}/players`).get()).docs.map((d) => ({
		id: d.id,
		...d.data()
	}));
	if (session.phase === "QUESTION_ACTIVE" && session.questionStartedAt) {
		const question = await loadQuestion(session.id, questionId);
		const key = await loadKey(session.id, questionId);
		const durationMs = question.durationSeconds * 1e3;
		const startedAt = new Date(session.questionStartedAt).getTime();
		const endsAt = session.questionEndsAt ? new Date(session.questionEndsAt).getTime() : startedAt + durationMs;
		const elapsed = Date.now() - startedAt;
		const answersSnap = await adminDb.collection(`sessions/${session.id}/answers`).where("questionId", "==", questionId).get();
		const answered = new Set(answersSnap.docs.map((a) => a.data().playerId));
		const bots = all.filter((p) => p.isVirtual && !answered.has(p.id));
		for (const bot of bots) {
			if (seeded(`${bot.id}:${questionId}:will`) > .94) continue;
			const plannedMs = Math.floor(durationMs * (.2 + seeded(`${bot.id}:${questionId}:time`) * .7));
			if (plannedMs > elapsed) continue;
			const correct = seeded(`${bot.id}:${questionId}:acc`) < .7;
			const wrongOptions = [
				"A",
				"B",
				"C",
				"D"
			].filter((o) => o !== key);
			const chosen = correct ? key : wrongOptions[Math.floor(seeded(`${bot.id}:${questionId}:pick`) * wrongOptions.length)];
			const answerRefId = `${questionId}_${bot.id}`;
			const isCorrect = chosen === key;
			const remainingMs = Math.max(0, endsAt - (startedAt + plannedMs));
			const score = computeScore(isCorrect, remainingMs, question.durationSeconds, question.scoringMode);
			try {
				await adminDb.runTransaction(async (t) => {
					const ansRef = adminDb.collection(`sessions/${session.id}/answers`).doc(answerRefId);
					const pRef = adminDb.collection(`sessions/${session.id}/players`).doc(bot.id);
					if ((await t.get(ansRef)).exists) return;
					const pData = (await t.get(pRef)).data();
					t.set(ansRef, {
						playerId: bot.id,
						questionId,
						answerId: chosen,
						isCorrect,
						responseMs: plannedMs,
						awardedScore: score,
						submittedAt: (/* @__PURE__ */ new Date()).toISOString()
					});
					t.update(pRef, {
						totalScore: pData.totalScore + score,
						correctCount: pData.correctCount + (isCorrect ? 1 : 0),
						cumulativeResponseMs: pData.cumulativeResponseMs + plannedMs
					});
				});
			} catch (err) {}
		}
	}
	return {
		answered: (await adminDb.collection(`sessions/${session.id}/answers`).where("questionId", "==", questionId).count().get()).data().count,
		total: all.length
	};
}
//#endregion
export { GameError, assertHost, createGameImpl, hostCommandImpl, joinGameImpl, adminStorage as n, playerStateImpl, questionTickImpl, submitAnswerImpl, adminDb as t };
