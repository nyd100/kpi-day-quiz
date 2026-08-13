// Server-only game engine. Never imported by client code directly.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
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

/** Deterministic pseudo-random in [0,1) from a seed string. */
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
  current_question_index: number;
  question_started_at: string | null;
  question_ends_at: string | null;
  allow_late_join: boolean;
  expires_at: string;
  total_questions: number;
};

export async function loadSession(sessionId: string): Promise<SessionRecord> {
  const { data, error } = await supabaseAdmin
    .from("game_sessions")
    .select(
      "id, pin, status, phase, current_question_index, question_started_at, question_ends_at, allow_late_join, expires_at, total_questions",
    )
    .eq("id", sessionId)
    .maybeSingle();
  if (error) throw new GameError("DB_ERROR", error.message);
  if (!data) throw new GameError("NOT_FOUND", "המשחק לא נמצא.");
  return data as SessionRecord;
}

export async function assertHost(sessionId: string, hostSecret: string): Promise<SessionRecord> {
  const session = await loadSession(sessionId);
  const { data } = await supabaseAdmin
    .from("game_host_secrets")
    .select("host_secret_hash")
    .eq("session_id", sessionId)
    .maybeSingle();
  const hash = await sha256(hostSecret ?? "");
  if (!data || data.host_secret_hash !== hash) {
    throw new GameError("FORBIDDEN", "אין הרשאת מנחה למשחק הזה.");
  }
  return session;
}

async function assertPlayer(sessionId: string, playerId: string, playerSecret: string) {
  const { data: player } = await supabaseAdmin
    .from("game_players")
    .select("id, session_id, display_name, is_virtual")
    .eq("id", playerId)
    .maybeSingle();
  if (!player || player.session_id !== sessionId) {
    throw new GameError("FORBIDDEN", "השחקן אינו משויך למשחק הזה.");
  }
  const { data: secret } = await supabaseAdmin
    .from("game_player_secrets")
    .select("player_secret_hash")
    .eq("player_id", playerId)
    .maybeSingle();
  const hash = await sha256(playerSecret ?? "");
  if (!secret || secret.player_secret_hash !== hash) {
    throw new GameError("FORBIDDEN", "זיהוי השחקן אינו תקין.");
  }
  return player;
}

/** Snapshot question for a running session, addressed by its position. */
async function loadQuestion(sessionId: string, position: number) {
  const { data, error } = await supabaseAdmin
    .from("game_session_questions")
    .select("position, category, duration_seconds, scoring_mode")
    .eq("session_id", sessionId)
    .eq("position", position)
    .maybeSingle();
  if (error) throw new GameError("DB_ERROR", error.message);
  if (!data) throw new GameError("NOT_FOUND", "השאלה לא נמצאה.");
  return data;
}

async function loadKey(sessionId: string, position: number): Promise<AnswerId> {
  const { data } = await supabaseAdmin
    .from("game_session_question_keys")
    .select("correct_answer_id")
    .eq("session_id", sessionId)
    .eq("position", position)
    .maybeSingle();
  return (data?.correct_answer_id ?? "A") as AnswerId;
}

/**
 * Freezes the currently enabled master questions into the session.
 * Once taken, later master edits/deletes/reorders cannot affect this game.
 */
async function buildSnapshot(sessionId: string): Promise<number> {
  const { data: master, error } = await supabaseAdmin
    .from("questions_public")
    .select("*")
    .eq("is_enabled", true)
    .order("order_index")
    .order("id");
  if (error) throw new GameError("DB_ERROR", error.message);
  const rows = master ?? [];
  if (rows.length === 0) throw new GameError("NO_QUESTIONS", "אין שאלות פעילות להתחלת משחק.");

  await supabaseAdmin.from("game_session_questions").delete().eq("session_id", sessionId);
  await supabaseAdmin.from("game_session_question_keys").delete().eq("session_id", sessionId);

  const { data: keys } = await supabaseAdmin
    .from("question_keys_private")
    .select("question_id, correct_answer_id, explanation");
  const keyMap = new Map((keys ?? []).map((k) => [k.question_id, k]));

  const snapshot = rows.map((q, i) => ({
    session_id: sessionId,
    position: i + 1,
    question_id: q.id,
    category: q.category,
    pair_id: q.pair_id,
    title: q.title,
    subtitle: q.subtitle,
    answer_a: q.answer_a,
    answer_b: q.answer_b,
    answer_c: q.answer_c,
    answer_d: q.answer_d,
    duration_seconds: q.duration_seconds,
    scoring_mode: q.scoring_mode,
    executive_insight: q.executive_insight,
    image_url: (q as { image_url: string | null }).image_url ?? null,
  }));
  const keyRows = rows.map((q, i) => ({
    session_id: sessionId,
    position: i + 1,
    correct_answer_id: keyMap.get(q.id)?.correct_answer_id ?? "A",
    explanation: keyMap.get(q.id)?.explanation ?? null,
  }));

  const { error: insertError } = await supabaseAdmin
    .from("game_session_questions")
    .insert(snapshot);
  if (insertError) throw new GameError("DB_ERROR", insertError.message);
  const { error: keyError } = await supabaseAdmin
    .from("game_session_question_keys")
    .insert(keyRows);
  if (keyError) throw new GameError("DB_ERROR", keyError.message);

  return rows.length;
}

// ---------------------------------------------------------------- host flows

export async function createGameImpl() {
  const hostSecret = randomToken();
  const hostSecretHash = await sha256(hostSecret);

  for (let attempt = 0; attempt < 12; attempt++) {
    const pin = randomPin();
    const { data, error } = await supabaseAdmin
      .from("game_sessions")
      .insert({ pin })
      .select("id, pin")
      .maybeSingle();
    if (error) {
      if (error.code === "23505") continue; // pin collision with an active session
      throw new GameError("DB_ERROR", error.message);
    }
    if (!data) continue;
    const { error: secretError } = await supabaseAdmin
      .from("game_host_secrets")
      .insert({ session_id: data.id, host_secret_hash: hostSecretHash });
    if (secretError) throw new GameError("DB_ERROR", secretError.message);
    return { sessionId: data.id, pin: data.pin, hostSecret };
  }
  throw new GameError("PIN_EXHAUSTED", "לא הצלחנו להקצות קוד משחק פנוי. נסו שוב.");
}

export type HostAction =
  | GameAction
  | "LOCK"
  | "RESET"
  | "DELETE"
  | "ADD_BOTS"
  | "CLEAR_BOTS"
  | "TOGGLE_LATE_JOIN";

const GAME_ACTIONS: GameAction[] = [
  "START_GAME",
  "START_QUESTION",
  "LOCK",
  "SHOW_RESULTS",
  "SHOW_LEADERBOARD",
  "NEXT_QUESTION",
  "FINISH",
];


const BOT_FIRST_NAMES = [
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
  "אמיר",
];

export async function hostCommandImpl(input: {
  sessionId: string;
  hostSecret: string;
  action: HostAction;
  count?: number | undefined;
}) {
  const session = await assertHost(input.sessionId, input.hostSecret);

  if (GAME_ACTIONS.includes(input.action as GameAction)) {
    const action = input.action as GameAction;

    // The snapshot is taken exactly once, when the game starts.
    let totalQuestions = session.total_questions;
    if (action === "START_GAME" && session.phase === "LOBBY") {
      totalQuestions = await buildSnapshot(session.id);
    }

    const next = resolveAction(action, session.phase, session.current_question_index, totalQuestions);
    if (!next) throw new GameError("INVALID_TRANSITION", "הפעולה אינה אפשרית במצב הנוכחי.");

    const patch: {
      phase: string;
      current_question_index: number;
      updated_at: string;
      total_questions?: number;
      question_started_at?: string | null;
      question_ends_at?: string | null;
      revealed_answer_id?: string | null;
    } = {
      phase: next.phase,
      current_question_index: next.questionIndex,
      updated_at: new Date().toISOString(),
    };
    if (action === "START_GAME") patch.total_questions = totalQuestions;
    if (next.phase === "QUESTION_INTRO") {
      patch.question_started_at = null;
      patch.question_ends_at = null;
      patch.revealed_answer_id = null;
    }
    if (next.phase === "QUESTION_ACTIVE") {
      const question = await loadQuestion(session.id, next.questionIndex);
      const now = Date.now();
      patch.question_started_at = new Date(now).toISOString();
      patch.question_ends_at = new Date(now + question.duration_seconds * 1000).toISOString();
      patch.revealed_answer_id = null;
    }
    if (next.phase === "SHOW_RESULTS") {
      patch.revealed_answer_id = await loadKey(session.id, next.questionIndex);
    }

    // Guard against double progression from two simultaneous clicks.
    const { data, error } = await supabaseAdmin
      .from("game_sessions")
      .update(patch)
      .eq("id", session.id)
      .eq("phase", session.phase)
      .eq("current_question_index", session.current_question_index)
      .select("id")
      .maybeSingle();
    if (error) throw new GameError("DB_ERROR", error.message);
    if (!data) throw new GameError("CONFLICT", "המצב כבר עודכן.");
    return { phase: next.phase, questionIndex: next.questionIndex };
  }

  switch (input.action) {
    case "RESET": {
      await supabaseAdmin.from("game_answers").delete().eq("session_id", session.id);
      await supabaseAdmin.from("game_session_questions").delete().eq("session_id", session.id);
      await supabaseAdmin.from("game_session_question_keys").delete().eq("session_id", session.id);
      await supabaseAdmin
        .from("game_players")
        .update({ total_score: 0, correct_count: 0, cumulative_response_ms: 0 })
        .eq("session_id", session.id);
      const { error } = await supabaseAdmin
        .from("game_sessions")
        .update({
          phase: "LOBBY",
          current_question_index: 0,
          question_started_at: null,
          question_ends_at: null,
          revealed_answer_id: null,
          total_questions: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.id);

      if (error) throw new GameError("DB_ERROR", error.message);
      return { ok: true };
    }
    case "DELETE": {
      await supabaseAdmin
        .from("game_sessions")
        .update({ status: "ENDED", updated_at: new Date().toISOString() })
        .eq("id", session.id);
      return { ok: true };
    }
    case "TOGGLE_LATE_JOIN": {
      await supabaseAdmin
        .from("game_sessions")
        .update({ allow_late_join: !session.allow_late_join })
        .eq("id", session.id);
      return { ok: true };
    }
    case "ADD_BOTS": {
      const count = Math.min(Math.max(input.count ?? 10, 1), 100);
      const { data: existing } = await supabaseAdmin
        .from("game_players")
        .select("normalized_name")
        .eq("session_id", session.id);
      const taken = new Set((existing ?? []).map((p) => p.normalized_name));
      const rows: {
        session_id: string;
        display_name: string;
        normalized_name: string;
        is_virtual: boolean;
      }[] = [];
      let n = 1;
      while (rows.length < count && n < count * 40) {
        const base = BOT_FIRST_NAMES[n % BOT_FIRST_NAMES.length]!;
        const name = `${base} (סימולציה ${n})`;
        n++;
        const normalized = normalizeName(name);
        if (taken.has(normalized)) continue;
        taken.add(normalized);
        rows.push({
          session_id: session.id,
          display_name: name,
          normalized_name: normalized,
          is_virtual: true,
        });
      }
      const { error } = await supabaseAdmin.from("game_players").insert(rows);
      if (error) throw new GameError("DB_ERROR", error.message);
      return { added: rows.length };
    }
    case "CLEAR_BOTS": {
      const { error } = await supabaseAdmin
        .from("game_players")
        .delete()
        .eq("session_id", session.id)
        .eq("is_virtual", true);
      if (error) throw new GameError("DB_ERROR", error.message);
      return { ok: true };
    }
    default:
      throw new GameError("BAD_ACTION", "פעולה לא מוכרת.");
  }
}

// -------------------------------------------------------------- player flows

export async function joinGameImpl(input: {
  pin: string;
  displayName: string;
}) {
  if (!validatePin(input.pin)) throw new GameError("BAD_PIN", "קוד המשחק חייב להיות בן 4 ספרות.");
  const nameError = validateName(input.displayName);
  if (nameError) throw new GameError("BAD_NAME", nameError);
  const displayName = input.displayName.trim().replace(/\s+/g, " ");

  const { data: session } = await supabaseAdmin
    .from("game_sessions")
    .select("id, pin, status, phase, expires_at, allow_late_join")
    .eq("pin", input.pin)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (!session) throw new GameError("NO_GAME", "לא מצאנו משחק עם הקוד הזה.");
  if (new Date(session.expires_at).getTime() < Date.now())
    throw new GameError("EXPIRED", "המשחק הסתיים.");
  if (session.phase !== "LOBBY" && !session.allow_late_join)
    throw new GameError("CLOSED", "המשחק כבר התחיל ולא ניתן להצטרף כעת.");

  const playerSecret = randomToken();
  const { data: player, error } = await supabaseAdmin
    .from("game_players")
    .insert({
      session_id: session.id,
      display_name: displayName,
      normalized_name: normalizeName(displayName),
    })
    .select("id, display_name")
    .maybeSingle();

  if (error) {
    if (error.code === "23505")
      throw new GameError("NAME_TAKEN", "השם כבר נמצא במשחק. בחרו שם אחר.");
    throw new GameError("DB_ERROR", error.message);
  }
  if (!player) throw new GameError("DB_ERROR", "ההצטרפות נכשלה. נסו שוב.");

  const { error: secretError } = await supabaseAdmin
    .from("game_player_secrets")
    .insert({ player_id: player.id, player_secret_hash: await sha256(playerSecret) });
  if (secretError) throw new GameError("DB_ERROR", secretError.message);

  return {
    sessionId: session.id,
    pin: session.pin,
    playerId: player.id,
    playerSecret,
    displayName: player.display_name,
  };
}

export async function submitAnswerImpl(input: {
  sessionId: string;
  playerId: string;
  playerSecret: string;
  questionId: number;
  answerId: string;
}) {
  await assertPlayer(input.sessionId, input.playerId, input.playerSecret);
  const session = await loadSession(input.sessionId);

  if (session.phase !== "QUESTION_ACTIVE")
    throw new GameError("NOT_ACTIVE", "לא ניתן לענות כרגע.");
  if (session.current_question_index !== input.questionId)
    throw new GameError("WRONG_QUESTION", "השאלה כבר הוחלפה.");
  if (!["A", "B", "C", "D"].includes(input.answerId))
    throw new GameError("BAD_ANSWER", "תשובה לא חוקית.");

  const now = Date.now();
  const endsAt = session.question_ends_at ? new Date(session.question_ends_at).getTime() : 0;
  const startedAt = session.question_started_at
    ? new Date(session.question_started_at).getTime()
    : now;
  if (now > endsAt + 750) throw new GameError("TOO_LATE", "הזמן נגמר.");

  const question = await loadQuestion(input.questionId);
  const key = await loadKey(input.questionId);
  const isCorrect = key === input.answerId;
  const remainingMs = Math.max(0, endsAt - now);
  const score = computeScore(
    isCorrect,
    remainingMs,
    question.duration_seconds,
    question.scoring_mode as "QUIZ" | "POLL",
  );

  const { data, error } = await supabaseAdmin.rpc("record_answer", {
    p_session: input.sessionId,
    p_question: input.questionId,
    p_player: input.playerId,
    p_answer: input.answerId,
    p_response_ms: Math.max(0, now - startedAt),
    p_score: score,
    p_correct: isCorrect,
  });
  if (error) throw new GameError("DB_ERROR", error.message);
  return { recorded: data === true, duplicate: data === false };
}

export async function playerStateImpl(input: {
  playerId: string;
  playerSecret: string;
}) {
  const { data: player } = await supabaseAdmin
    .from("game_players")
    .select("id, session_id, display_name")
    .eq("id", input.playerId)
    .maybeSingle();
  if (!player) throw new GameError("NOT_FOUND", "השחקן לא נמצא.");
  await assertPlayer(player.session_id, input.playerId, input.playerSecret);
  await supabaseAdmin
    .from("game_players")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", player.id);
  const session = await loadSession(player.session_id);
  const { data: answered } = await supabaseAdmin
    .from("game_answers")
    .select("question_id, answer_id")
    .eq("player_id", player.id)
    .eq("question_id", session.current_question_index)
    .maybeSingle();
  return {
    sessionId: session.id,
    pin: session.pin,
    displayName: player.display_name,
    answeredCurrent: answered?.answer_id ?? null,
  };
}

// ------------------------------------------------------- presenter live tick

/** Runs due virtual-player answers and returns live progress for the presenter. */
export async function questionTickImpl(input: { sessionId: string; hostSecret: string }) {
  const session = await assertHost(input.sessionId, input.hostSecret);
  const questionId = session.current_question_index;
  if (questionId < 1 || questionId > TOTAL_QUESTIONS) return { answered: 0, total: 0 };

  const { data: players } = await supabaseAdmin
    .from("game_players")
    .select("id, is_virtual")
    .eq("session_id", session.id);
  const all = players ?? [];

  if (session.phase === "QUESTION_ACTIVE" && session.question_started_at) {
    const question = await loadQuestion(questionId);
    const key = await loadKey(questionId);
    const durationMs = question.duration_seconds * 1000;
    const startedAt = new Date(session.question_started_at).getTime();
    const endsAt = new Date(session.question_ends_at ?? "").getTime() || startedAt + durationMs;
    const elapsed = Date.now() - startedAt;

    const { data: existing } = await supabaseAdmin
      .from("game_answers")
      .select("player_id")
      .eq("session_id", session.id)
      .eq("question_id", questionId);
    const answered = new Set((existing ?? []).map((a) => a.player_id));

    const bots = all.filter((p) => p.is_virtual && !answered.has(p.id));
    for (const bot of bots) {
      const rWill = seeded(`${bot.id}:${questionId}:will`);
      if (rWill > 0.94) continue; // ~6% never answer
      const plannedMs = Math.floor(
        durationMs * (0.2 + seeded(`${bot.id}:${questionId}:time`) * 0.7),
      );
      if (plannedMs > elapsed) continue;
      const correct = seeded(`${bot.id}:${questionId}:acc`) < 0.7;
      const options: AnswerId[] = ["A", "B", "C", "D"];
      const wrongOptions = options.filter((o) => o !== key);
      const chosen = correct
        ? key
        : wrongOptions[Math.floor(seeded(`${bot.id}:${questionId}:pick`) * wrongOptions.length)]!;
      const remaining = Math.max(0, endsAt - (startedAt + plannedMs));
      await supabaseAdmin.rpc("record_answer", {
        p_session: session.id,
        p_question: questionId,
        p_player: bot.id,
        p_answer: chosen,
        p_response_ms: plannedMs,
        p_score: computeScore(
          chosen === key,
          remaining,
          question.duration_seconds,
          question.scoring_mode as "QUIZ" | "POLL",
        ),
        p_correct: chosen === key,
      });
    }
  }

  const { count } = await supabaseAdmin
    .from("game_answers")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id)
    .eq("question_id", questionId);

  return { answered: count ?? 0, total: all.length };
}
