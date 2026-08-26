// Server-only game engine. Never imported by client code directly.
import { adminDb } from "@/integrations/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import {
  computeScore,
  resolveAction,
  normalizeName,
  validateName,
  validatePin,
  type AnswerId,
  type GameAction,
  type GamePhase,
} from "@/lib/quiz";
import * as crypto from "crypto";

export class GameError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomPin(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(bytes[0]! % 10000).padStart(4, "0");
}

function seeded(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

type SessionRecord = {
  id: string;
  pin: string;
  status: string;
  phase: GamePhase;
  currentQuestionIndex: number;
  questionStartedAt: string | null;
  questionEndsAt: string | null;
  allowLateJoin: boolean;
  expiresAt: string;
  totalQuestions: number;
};

export async function loadSession(sessionId: string): Promise<SessionRecord> {
  const snap = await adminDb.collection("sessions").doc(sessionId).get();
  if (!snap.exists) throw new GameError("NOT_FOUND", "המשחק לא נמצא.");
  return { id: snap.id, ...snap.data() } as SessionRecord;
}

async function assertPlayer(sessionId: string, playerId: string, playerSecret: string) {
  const snap = await adminDb.collection(`sessions/${sessionId}/players`).doc(playerId).get();
  if (!snap.exists) throw new GameError("FORBIDDEN", "השחקן אינו משויך למשחק הזה.");
  const player = snap.data() as any;
  const hash = await sha256(playerSecret ?? "");
  if (player.playerSecretHash !== hash) {
    throw new GameError("FORBIDDEN", "זיהוי השחקן אינו תקין.");
  }
  return { id: snap.id, ...player };
}

async function loadQuestion(sessionId: string, position: number) {
  const snap = await adminDb.collection(`sessions/${sessionId}/questions`).doc(String(position)).get();
  if (!snap.exists) throw new GameError("NOT_FOUND", "השאלה לא נמצאה.");
  return snap.data() as any;
}

async function loadKey(sessionId: string, position: number): Promise<AnswerId> {
  const snap = await adminDb.collection(`sessions/${sessionId}/keys`).doc(String(position)).get();
  return (snap.data()?.correctAnswerId ?? "A") as AnswerId;
}

async function buildSnapshot(sessionId: string): Promise<number> {
  // Order by a single field and filter isEnabled in memory: combining
  // where("isEnabled") with orderBy("orderIndex") would require a composite
  // Firestore index (and fail with FAILED_PRECONDITION until one is created).
  const qAll = await adminDb.collection("questions").orderBy("orderIndex").get();
  const enabledDocs = qAll.docs.filter((d) => d.data().isEnabled !== false);
  if (enabledDocs.length === 0) throw new GameError("NO_QUESTIONS", "אין שאלות פעילות להתחלת משחק.");

  const keysSnap = await adminDb.collection("question_keys").get();
  const keyMap = new Map(keysSnap.docs.map(d => [d.id, d.data()]));

  const batch = adminDb.batch();
  
  // Clear existing snapshots if any (for safety, though usually empty)
  const existingQ = await adminDb.collection(`sessions/${sessionId}/questions`).get();
  existingQ.docs.forEach(d => batch.delete(d.ref));
  const existingK = await adminDb.collection(`sessions/${sessionId}/keys`).get();
  existingK.docs.forEach(d => batch.delete(d.ref));

  enabledDocs.forEach((doc, i) => {
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
      imageUrl: q.imageUrl ?? null,
      funFact: q.funFact ?? null,
      funFactEnabled: q.funFactEnabled ?? false,
    });
    
    batch.set(kRef, {
      position: pos,
      correctAnswerId: keyMap.get(doc.id)?.correctAnswerId ?? "A",
      explanation: keyMap.get(doc.id)?.explanation ?? null,
    });
  });

  await batch.commit();
  return enabledDocs.length;
}

export async function createGameImpl() {
  // Enforce a single active game at a time: end every currently-ACTIVE
  // session before creating the new one, so any device that discovers the
  // active game via Firestore always finds at most one.
  const activeSnap = await adminDb.collection("sessions").where("status", "==", "ACTIVE").get();
  if (!activeSnap.empty) {
    const endBatch = adminDb.batch();
    activeSnap.docs.forEach((d) => endBatch.update(d.ref, { status: "ENDED", updatedAt: new Date().toISOString() }));
    await endBatch.commit();
  }

  for (let attempt = 0; attempt < 12; attempt++) {
    const pin = randomPin();

    try {
      const sessionId = await adminDb.runTransaction(async (t) => {
        const existing = await t.get(adminDb.collection("sessions").where("pin", "==", pin).where("status", "==", "ACTIVE").limit(1));
        if (!existing.empty) {
          throw new Error("COLLISION"); // handled in catch
        }

        const newRef = adminDb.collection("sessions").doc();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
        t.set(newRef, {
          pin,
          status: "ACTIVE",
          phase: "LOBBY",
          currentQuestionIndex: 0,
          questionStartedAt: null,
          questionEndsAt: null,
          allowLateJoin: true,
          totalQuestions: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          expiresAt,
        });
        return newRef.id;
      });
      return { sessionId, pin };
    } catch (e: any) {
      if (e.message === "COLLISION") continue;
      throw new GameError("DB_ERROR", e.message);
    }
  }
  throw new GameError("PIN_EXHAUSTED", "לא הצלחנו להקצות קוד משחק פנוי. נסו שוב.");
}

export async function getActiveGameImpl(): Promise<{
  sessionId: string;
  pin: string;
  phase: GamePhase;
  currentQuestionIndex: number;
  totalQuestions: number;
  allowLateJoin: boolean;
} | null> {
  // Single-equality query (no orderBy) to avoid requiring a composite index;
  // sort by createdAt in memory instead.
  const snap = await adminDb.collection("sessions").where("status", "==", "ACTIVE").get();
  if (snap.empty) return null;
  const docs = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as SessionRecord & { createdAt: string })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const newest = docs[0]!;
  return {
    sessionId: newest.id,
    pin: newest.pin,
    phase: newest.phase,
    currentQuestionIndex: newest.currentQuestionIndex,
    totalQuestions: newest.totalQuestions,
    allowLateJoin: newest.allowLateJoin,
  };
}

export type HostAction = GameAction | "LOCK" | "RESET" | "DELETE" | "ADD_BOTS" | "CLEAR_BOTS" | "TOGGLE_LATE_JOIN";
const GAME_ACTIONS: GameAction[] = ["START_GAME", "START_QUESTION", "LOCK", "SHOW_RESULTS", "SHOW_LEADERBOARD", "NEXT_QUESTION", "FINISH"];

const BOT_FIRST_NAMES = ["נועה","איתי","שירה","יונתן","מאיה","עומר","תמר","אורי","ליאור","רוני","דנה","אלון","הילה","גיא","יעל","אמיר"];

export async function hostCommandImpl(sessionId: string, action: HostAction, count?: number) {
  const session = await loadSession(sessionId);

  if (GAME_ACTIONS.includes(action as GameAction)) {
    const noop = { phase: session.phase, questionIndex: session.currentQuestionIndex, noop: true };

    // START_GAME only makes sense from LOBBY; a repeat (another operator already
    // started) is a benign no-op, not an error — and must NOT rebuild the snapshot.
    if (action === "START_GAME" && session.phase !== "LOBBY") return noop;

    let totalQuestions = session.totalQuestions;
    if (action === "START_GAME" && session.phase === "LOBBY") {
      totalQuestions = await buildSnapshot(session.id);
    }

    let hasFact = false;
    if (session.currentQuestionIndex >= 1 && session.currentQuestionIndex <= totalQuestions) {
      try {
        const cur = await loadQuestion(session.id, session.currentQuestionIndex);
        hasFact = !!(cur.funFactEnabled && cur.funFact && String(cur.funFact).trim());
      } catch { hasFact = false; }
    }

    const next = resolveAction(action as GameAction, session.phase, session.currentQuestionIndex, totalQuestions, hasFact);
    // Illegal for the current phase almost always means another device already
    // advanced the game (multi-operator / auto-lock). Return a benign no-op so the
    // operator never sees a red "not possible in current state" toast — the live
    // Firestore state shows them the real, current step to click next.
    if (!next) return noop;

    const patch: any = {
      phase: next.phase,
      currentQuestionIndex: next.questionIndex,
      updatedAt: new Date().toISOString(),
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
      patch.questionEndsAt = new Date(now + question.durationSeconds * 1000).toISOString();
      patch.revealedAnswerId = null;
    }
    if (next.phase === "SHOW_RESULTS") {
      patch.revealedAnswerId = await loadKey(session.id, next.questionIndex);
    }

    // Apply atomically, but only if the state hasn't moved under us. If a
    // concurrent operator or the auto-lock already advanced it, we no-op instead
    // of erroring — the patch we computed is only valid for the phase we read.
    const applied = await adminDb
      .runTransaction(async (t) => {
        const snap = await t.get(adminDb.collection("sessions").doc(session.id));
        const data = snap.data();
        if (!data || data.status !== "ACTIVE") return false;
        if (data.phase !== session.phase || data.currentQuestionIndex !== session.currentQuestionIndex) {
          return false;
        }
        t.update(snap.ref, patch);
        return true;
      })
      .catch((error: any) => {
        throw new GameError("DB_ERROR", error?.message ?? "שגיאת מסד נתונים.");
      });

    return applied ? { phase: next.phase, questionIndex: next.questionIndex } : noop;
  }

  switch (action) {
    case "RESET": {
      // In Firestore, deleting all answers and players requires fetching their refs first
      const sRef = adminDb.collection("sessions").doc(session.id);
      await adminDb.runTransaction(async (t) => {
        t.update(sRef, {
          phase: "LOBBY",
          currentQuestionIndex: 0,
          questionStartedAt: null,
          questionEndsAt: null,
          revealedAnswerId: null,
          totalQuestions: 0,
          updatedAt: new Date().toISOString(),
        });
      });
      
      const batch = adminDb.batch();
      // Reset players score
      const players = await adminDb.collection(`sessions/${session.id}/players`).get();
      players.docs.forEach(d => batch.update(d.ref, { totalScore: 0, correctCount: 0, cumulativeResponseMs: 0, streak: 0, bestStreak: 0 }));
      
      // Delete answers
      const answers = await adminDb.collection(`sessions/${session.id}/answers`).get();
      answers.docs.forEach(d => batch.delete(d.ref));
      
      // Delete questions
      const qs = await adminDb.collection(`sessions/${session.id}/questions`).get();
      qs.docs.forEach(d => batch.delete(d.ref));
      const ks = await adminDb.collection(`sessions/${session.id}/keys`).get();
      ks.docs.forEach(d => batch.delete(d.ref));
      
      // Commit in chunks if over 500 (Firebase limit), though for this size batch should be fine
      if (true) {
        await batch.commit();
      }
      return { ok: true };
    }
    case "DELETE": {
      await adminDb.collection("sessions").doc(session.id).update({ status: "ENDED", updatedAt: new Date().toISOString() });
      return { ok: true };
    }
    case "TOGGLE_LATE_JOIN": {
      await adminDb.collection("sessions").doc(session.id).update({ allowLateJoin: !session.allowLateJoin });
      return { ok: true };
    }
    case "ADD_BOTS": {
      const botCount = Math.min(Math.max(count ?? 10, 1), 100);
      const playersSnap = await adminDb.collection(`sessions/${session.id}/players`).get();
      const taken = new Set(playersSnap.docs.map(d => d.data().normalizedName));
      
      const batch = adminDb.batch();
      let n = 1;
      let added = 0;
      while (added < botCount && n < botCount * 40) {
        const base = BOT_FIRST_NAMES[n % BOT_FIRST_NAMES.length]!;
        const name = `${base} (סימולציה ${n})`;
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
          joinedAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
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
        bots.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }
      return { ok: true };
    }
    default:
      throw new GameError("BAD_ACTION", "פעולה לא מוכרת.");
  }
}

export async function joinGameImpl(input: { pin: string; displayName: string }) {
  if (!validatePin(input.pin)) throw new GameError("BAD_PIN", "קוד המשחק חייב להיות בן 4 ספרות.");
  const nameError = validateName(input.displayName);
  if (nameError) throw new GameError("BAD_NAME", nameError);
  const displayName = input.displayName.trim().replace(/\s+/g, " ");
  const normalized = normalizeName(displayName);

  const snap = await adminDb.collection("sessions").where("pin", "==", input.pin).where("status", "==", "ACTIVE").limit(1).get();
  if (snap.empty) throw new GameError("NO_GAME", "לא מצאנו משחק עם הקוד הזה.");
  const session = { id: snap.docs[0].id, ...snap.docs[0].data() } as SessionRecord;

  if (new Date(session.expiresAt).getTime() < Date.now()) throw new GameError("EXPIRED", "המשחק הסתיים.");
  if (session.phase !== "LOBBY" && !session.allowLateJoin) throw new GameError("CLOSED", "המשחק כבר התחיל ולא ניתן להצטרף כעת.");

  const playerSecret = randomToken();
  const playerSecretHash = await sha256(playerSecret);

  try {
    const playerId = await adminDb.runTransaction(async (t) => {
      const existing = await t.get(adminDb.collection(`sessions/${session.id}/players`).where("normalizedName", "==", normalized).limit(1));
      if (!existing.empty) {
        throw new Error("NAME_TAKEN");
      }
      const newRef = adminDb.collection(`sessions/${session.id}/players`).doc();
      t.set(newRef, {
        displayName,
        normalizedName: normalized,
        isVirtual: false,
        playerSecretHash,
        totalScore: 0,
        correctCount: 0,
        cumulativeResponseMs: 0,
        streak: 0,
        bestStreak: 0,
        joinedAt: new Date().toISOString(),
        lastSeenAt: new Date().toISOString(),
      });
      return newRef.id;
    });
    return { sessionId: session.id, pin: session.pin, playerId, playerSecret, displayName };
  } catch (error: any) {
    if (error.message === "NAME_TAKEN") throw new GameError("NAME_TAKEN", "השם כבר נמצא במשחק. בחרו שם אחר.");
    throw new GameError("DB_ERROR", error.message);
  }
}

export async function submitAnswerImpl(input: { sessionId: string; playerId: string; playerSecret: string; questionId: number; answerId: string }) {
  const player = await assertPlayer(input.sessionId, input.playerId, input.playerSecret);
  const session = await loadSession(input.sessionId);

  if (session.phase !== "QUESTION_ACTIVE") throw new GameError("NOT_ACTIVE", "לא ניתן לענות כרגע.");
  if (session.currentQuestionIndex !== input.questionId) throw new GameError("WRONG_QUESTION", "השאלה כבר הוחלפה.");
  if (!["A", "B", "C", "D"].includes(input.answerId)) throw new GameError("BAD_ANSWER", "תשובה לא חוקית.");

  const now = Date.now();
  const endsAt = session.questionEndsAt ? new Date(session.questionEndsAt).getTime() : 0;
  const startedAt = session.questionStartedAt ? new Date(session.questionStartedAt).getTime() : now;
  if (now > endsAt + 750) throw new GameError("TOO_LATE", "הזמן נגמר.");

  const question = await loadQuestion(input.sessionId, input.questionId);
  const key = await loadKey(input.sessionId, input.questionId);
  const isCorrect = key === input.answerId;
  const remainingMs = Math.max(0, endsAt - now);
  const score = computeScore(isCorrect, remainingMs, question.durationSeconds, question.scoringMode);
  const responseMs = Math.max(0, now - startedAt);

  const answerRefId = `${input.questionId}_${input.playerId}`;
  const answerRef = adminDb.collection(`sessions/${session.id}/answers`).doc(answerRefId);
  const playerRef = adminDb.collection(`sessions/${session.id}/players`).doc(input.playerId);

  try {
    const recorded = await adminDb.runTransaction(async (t) => {
      const existing = await t.get(answerRef);
      if (existing.exists) {
        return false; // already answered
      }
      
      const pSnap = await t.get(playerRef);
      const pData = pSnap.data()!;

      // Consecutive-correct streak (real players only): grows on a correct answer,
      // resets to 0 on a wrong one, and awards a small escalating bonus.
      const prevStreak = pData.streak ?? 0;
      const newStreak = isCorrect ? prevStreak + 1 : 0;
      const streakBonus = isCorrect ? Math.min(Math.max(newStreak - 1, 0), 4) * 25 : 0;

      // NOTE: isCorrect/awardedScore are intentionally NOT stored on the answer
      // doc — clients read this collection live during the active question, and
      // persisting correctness there would leak the right answer before reveal.
      // Correctness/score are applied to the player doc below; the client derives
      // correctness from the session's revealed_answer_id at results time.
      t.set(answerRef, {
        playerId: input.playerId,
        questionId: input.questionId,
        answerId: input.answerId,
        responseMs,
        submittedAt: new Date().toISOString(),
      });

      t.update(playerRef, {
        totalScore: pData.totalScore + score + streakBonus,
        correctCount: pData.correctCount + (isCorrect ? 1 : 0),
        cumulativeResponseMs: pData.cumulativeResponseMs + responseMs,
        streak: newStreak,
        bestStreak: Math.max(pData.bestStreak ?? 0, newStreak),
        lastSeenAt: new Date().toISOString(),
      });
      return true;
    });
    return { recorded, duplicate: !recorded };
  } catch (error: any) {
    throw new GameError("DB_ERROR", error.message);
  }
}

export async function playerStateImpl(input: { sessionId: string; playerId: string; playerSecret: string }) {
  // The client already knows its sessionId (stored at join time), so look the
  // player up directly instead of a collectionGroup query — the latter needs a
  // dedicated collection-group index and silently failed until one was created.
  const playerRef = adminDb.collection(`sessions/${input.sessionId}/players`).doc(input.playerId);
  const playerDoc = await playerRef.get();
  if (!playerDoc.exists) throw new GameError("NOT_FOUND", "השחקן לא נמצא או זיהוי שגוי.");

  const pData = playerDoc.data() as any;
  const hash = await sha256(input.playerSecret);
  if (pData.playerSecretHash !== hash) throw new GameError("FORBIDDEN", "זיהוי השחקן אינו תקין.");

  await playerRef.update({ lastSeenAt: new Date().toISOString() });

  const session = await loadSession(input.sessionId);
  const answerId = `${session.currentQuestionIndex}_${input.playerId}`;
  const answerSnap = await adminDb.collection(`sessions/${input.sessionId}/answers`).doc(answerId).get();

  return {
    sessionId: session.id,
    pin: session.pin,
    displayName: pData.displayName,
    answeredCurrent: answerSnap.exists ? answerSnap.data()?.answerId : null,
  };
}

export async function questionTickImpl(sessionId: string) {
  const session = await loadSession(sessionId);
  const questionId = session.currentQuestionIndex;
  if (questionId < 1 || questionId > session.totalQuestions) return { answered: 0, total: 0 };

  const playersSnap = await adminDb.collection(`sessions/${session.id}/players`).get();
  const all = playersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

  const isActive = session.phase === "QUESTION_ACTIVE";
  const isLocked = session.phase === "QUESTION_LOCKED";

  if ((isActive || isLocked) && session.questionStartedAt) {
    const question = await loadQuestion(session.id, questionId);
    const key = await loadKey(session.id, questionId);
    const durationMs = question.durationSeconds * 1000;
    const startedAt = new Date(session.questionStartedAt).getTime();
    const endsAt = session.questionEndsAt ? new Date(session.questionEndsAt).getTime() : startedAt + durationMs;
    const now = Date.now();
    const elapsed = now - startedAt;

    if (isActive) {
      const answersSnap = await adminDb.collection(`sessions/${session.id}/answers`).where("questionId", "==", questionId).get();
      const answered = new Set(answersSnap.docs.map(a => a.data().playerId));

      const plannedFor = (botId: string) =>
        Math.floor(durationMs * (0.2 + seeded(`${botId}:${questionId}:time`) * 0.7));

      // Bots whose planned answer time has arrived and who haven't answered yet.
      const dueBots = all.filter(
        (p) =>
          p.isVirtual &&
          !answered.has(p.id) &&
          seeded(`${p.id}:${questionId}:will`) <= 0.94 &&
          plannedFor(p.id) <= elapsed,
      );

      // Write all due bots in one batch (chunked to Firestore's 500-op limit)
      // instead of a transaction per bot — with up to 100 simulated players the
      // old per-bot loop meant dozens of sequential round-trips per tick, which
      // stalled the whole console. `batch.create` makes each answer write fail if
      // the doc already exists, so overlapping ticks (or multiple operators) can
      // never double-count a bot: the whole conflicting batch is rejected atomically.
      let batch = adminDb.batch();
      let ops = 0;
      for (const bot of dueBots) {
        const plannedMs = plannedFor(bot.id);
        const correct = seeded(`${bot.id}:${questionId}:acc`) < 0.7;
        const options: AnswerId[] = ["A", "B", "C", "D"];
        const wrongOptions = options.filter((o) => o !== key);
        const chosen = correct ? key : wrongOptions[Math.floor(seeded(`${bot.id}:${questionId}:pick`) * wrongOptions.length)]!;
        const isCorrect = chosen === key;
        const remainingMs = Math.max(0, endsAt - (startedAt + plannedMs));
        const score = computeScore(isCorrect, remainingMs, question.durationSeconds, question.scoringMode);

        const ansRef = adminDb.collection(`sessions/${session.id}/answers`).doc(`${questionId}_${bot.id}`);
        const pRef = adminDb.collection(`sessions/${session.id}/players`).doc(bot.id);
        // See submitAnswerImpl: correctness/score stay off the client-readable
        // answer doc so the right answer can't leak mid-question.
        batch.create(ansRef, {
          playerId: bot.id,
          questionId,
          answerId: chosen,
          responseMs: plannedMs,
          submittedAt: new Date().toISOString(),
        });
        batch.update(pRef, {
          totalScore: FieldValue.increment(score),
          correctCount: FieldValue.increment(isCorrect ? 1 : 0),
          cumulativeResponseMs: FieldValue.increment(plannedMs),
        });
        ops += 2;
        if (ops >= 400) {
          await batch.commit().catch(() => { /* a concurrent tick won this chunk */ });
          batch = adminDb.batch();
          ops = 0;
        }
      }
      if (ops > 0) await batch.commit().catch(() => { /* a concurrent tick won this batch */ });
    }

    // Time-based, idempotent phase advance (shared with the public autoAdvance
    // that /present drives). Runs after bots so last-second bot answers count.
    await autoAdvanceImpl(session.id);
  }

  const ansCountSnap = await adminDb.collection(`sessions/${session.id}/answers`).where("questionId", "==", questionId).count().get();
  return { answered: ansCountSnap.data().count, total: all.length };
}

// Time-based, idempotent phase advance for the active question. Safe to call
// from anywhere (no bots, no arbitrary state changes): it only LOCKs at time-up
// and reveals SHOW_RESULTS 3s later, and only while the session is still on that
// exact ACTIVE/LOCKED question. Called by both questionTickImpl (admin console)
// and the public autoAdvance server fn that the /present screen pings — so
// progression no longer depends on any single operator's foreground browser tab.
export async function autoAdvanceImpl(sessionId: string) {
  const session = await loadSession(sessionId);
  const questionId = session.currentQuestionIndex;
  if (questionId < 1 || questionId > session.totalQuestions) return { phase: session.phase };

  const isActive = session.phase === "QUESTION_ACTIVE";
  const isLocked = session.phase === "QUESTION_LOCKED";
  if ((!isActive && !isLocked) || !session.questionStartedAt) return { phase: session.phase };

  const question = await loadQuestion(session.id, questionId);
  const durationMs = question.durationSeconds * 1000;
  const startedAt = new Date(session.questionStartedAt).getTime();
  const endsAt = session.questionEndsAt ? new Date(session.questionEndsAt).getTime() : startedAt + durationMs;
  const now = Date.now();

  const sessionRef = adminDb.collection("sessions").doc(session.id);
  const advance = async (fromPhase: string, patch: Record<string, unknown>) => {
    await adminDb
      .runTransaction(async (t) => {
        const snap = await t.get(sessionRef);
        const data = snap.data();
        if (data && data.phase === fromPhase && data.currentQuestionIndex === questionId) {
          t.update(sessionRef, { ...patch, updatedAt: new Date().toISOString() });
        }
      })
      .catch(() => { /* another tick/operator already advanced — fine */ });
  };

  if (isActive && now > endsAt + 3000) {
    const key = await loadKey(session.id, questionId);
    await advance("QUESTION_ACTIVE", { phase: "SHOW_RESULTS", revealedAnswerId: key });
  } else if (isActive && now > endsAt) {
    await advance("QUESTION_ACTIVE", { phase: "QUESTION_LOCKED" });
  } else if (isLocked && now > endsAt + 3000) {
    const key = await loadKey(session.id, questionId);
    await advance("QUESTION_LOCKED", { phase: "SHOW_RESULTS", revealedAnswerId: key });
  }

  return { phase: session.phase };
}
