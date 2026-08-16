// Server-only admin console engine. Protected by a shared admin passcode.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { GameError } from "@/lib/game.server";
import { DEFAULT_QUESTIONS } from "@/lib/default-questions";
import type { AnswerId } from "@/lib/quiz";

const BUCKET = "question-images";
const TEN_YEARS = 60 * 60 * 24 * 3650;

export function assertAdmin(passcode: string) {
  const expected = process.env["ADMIN_PASSCODE"];
  if (!expected) throw new GameError("CONFIG", "קוד הניהול לא הוגדר במערכת.");
  const a = new TextEncoder().encode(passcode ?? "");
  const b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  if (diff !== 0) throw new GameError("FORBIDDEN", "קוד ניהול שגוי.");
}

export type AdminQuestion = {
  id: number;
  category: "OUTPUT" | "OUTCOME";
  pairId: number | null;
  title: string;
  subtitle: string | null;
  answers: { id: AnswerId; text: string }[];
  durationSeconds: number;
  scoringMode: "QUIZ" | "POLL";
  executiveInsight: string | null;
  isPlaceholder: boolean;
  imageUrl: string | null;
  correctAnswerId: AnswerId;
  explanation: string | null;
  orderIndex: number;
  isEnabled: boolean;
};

export async function listAdminQuestions(): Promise<AdminQuestion[]> {
  const { data, error } = await supabaseAdmin
    .from("questions_public")
    .select("*")
    .order("order_index")
    .order("id");
  if (error) throw new GameError("DB_ERROR", error.message);
  const { data: keys } = await supabaseAdmin
    .from("question_keys_private")
    .select("question_id, correct_answer_id, explanation");
  const keyMap = new Map((keys ?? []).map((k) => [k.question_id, k]));

  return (data ?? []).map((q) => {
    const key = keyMap.get(q.id);
    const row = q as typeof q & {
      image_url: string | null;
      order_index: number;
      is_enabled: boolean;
    };
    return {
      id: q.id,
      category: q.category as AdminQuestion["category"],
      pairId: q.pair_id,
      title: q.title,
      subtitle: q.subtitle,
      answers: [
        { id: "A" as const, text: q.answer_a },
        { id: "B" as const, text: q.answer_b },
        { id: "C" as const, text: q.answer_c },
        { id: "D" as const, text: q.answer_d },
      ],
      durationSeconds: q.duration_seconds,
      scoringMode: q.scoring_mode as AdminQuestion["scoringMode"],
      executiveInsight: q.executive_insight,
      isPlaceholder: q.is_placeholder,
      imageUrl: row.image_url ?? null,
      correctAnswerId: (key?.correct_answer_id ?? "A") as AnswerId,
      explanation: key?.explanation ?? null,
      orderIndex: row.order_index ?? 0,
      isEnabled: row.is_enabled ?? true,
    };
  });
}

export type SaveQuestionInput = {
  id: number;
  category: "OUTPUT" | "OUTCOME";
  title: string;
  subtitle: string | null;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  durationSeconds: number;
  scoringMode: "QUIZ" | "POLL";
  executiveInsight: string | null;
  correctAnswerId: AnswerId;
  explanation: string | null;
  isPlaceholder: boolean;
  pairId?: number | null | undefined;
  isEnabled?: boolean | undefined;
};

export async function saveQuestionImpl(input: SaveQuestionInput) {
  if (!input.title.trim()) throw new GameError("INVALID", "לשאלה חייבת להיות כותרת.");
  const { error } = await supabaseAdmin
    .from("questions_public")
    .update({
      category: input.category,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      answer_a: input.answerA.trim(),
      answer_b: input.answerB.trim(),
      answer_c: input.answerC.trim(),
      answer_d: input.answerD.trim(),
      duration_seconds: input.durationSeconds,
      scoring_mode: input.scoringMode,
      executive_insight: input.executiveInsight?.trim() || null,
      is_placeholder: input.isPlaceholder,
      pair_id: input.pairId ?? null,
      ...(input.isEnabled === undefined ? {} : { is_enabled: input.isEnabled }),
    })
    .eq("id", input.id);
  if (error) throw new GameError("DB_ERROR", error.message);

  const { error: keyError } = await supabaseAdmin.from("question_keys_private").upsert(
    {
      question_id: input.id,
      correct_answer_id: input.correctAnswerId,
      explanation: input.explanation?.trim() || null,
    },
    { onConflict: "question_id" },
  );
  if (keyError) throw new GameError("DB_ERROR", keyError.message);
  return { ok: true as const };
}

/** Adds an empty question at the end of the list. */
export async function createQuestionImpl() {
  const { data: last } = await supabaseAdmin
    .from("questions_public")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = ((last as { order_index: number } | null)?.order_index ?? 0) + 1;
  const { defaultDurationSeconds } = await getSettingsImpl();


  const { data, error } = await supabaseAdmin
    .from("questions_public")
    .insert({
      category: "OUTPUT",
      title: "שאלה חדשה",
      answer_a: "תשובה א",
      answer_b: "תשובה ב",
      answer_c: "תשובה ג",
      answer_d: "תשובה ד",
      duration_seconds: defaultDurationSeconds,
      scoring_mode: "QUIZ",
      is_placeholder: true,
      order_index: nextOrder,
      is_enabled: true,
    } as never)
    .select("id")
    .single();
  if (error) throw new GameError("DB_ERROR", error.message);

  await supabaseAdmin
    .from("question_keys_private")
    .upsert({ question_id: data.id, correct_answer_id: "A" }, { onConflict: "question_id" });
  return { id: data.id };
}

export async function deleteQuestionImpl(questionId: number) {
  const { error } = await supabaseAdmin.from("questions_public").delete().eq("id", questionId);
  if (error) throw new GameError("DB_ERROR", error.message);
  return { ok: true as const };
}

export async function setQuestionEnabledImpl(questionId: number, isEnabled: boolean) {
  const { error } = await supabaseAdmin
    .from("questions_public")
    .update({ is_enabled: isEnabled } as never)
    .eq("id", questionId);
  if (error) throw new GameError("DB_ERROR", error.message);
  return { ok: true as const };
}

/** Persists a complete new ordering (array of question ids, first = first). */
export async function reorderQuestionsImpl(orderedIds: number[]) {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabaseAdmin
      .from("questions_public")
      .update({ order_index: i + 1 } as never)
      .eq("id", orderedIds[i]!);
    if (error) throw new GameError("DB_ERROR", error.message);
  }
  return { ok: true as const };
}

/** Wipes the master list and reinstalls the approved 16-question dataset. */
export async function restoreDefaultQuestionsImpl() {
  const { error: deleteError } = await supabaseAdmin
    .from("questions_public")
    .delete()
    .gte("id", 0);
  if (deleteError) throw new GameError("DB_ERROR", deleteError.message);

  for (const q of DEFAULT_QUESTIONS) {
    const { data, error } = await supabaseAdmin
      .from("questions_public")
      .insert({
        category: q.category,
        pair_id: q.pairId,
        title: q.title,
        subtitle: null,
        answer_a: q.answers[0],
        answer_b: q.answers[1],
        answer_c: q.answers[2],
        answer_d: q.answers[3],
        duration_seconds: q.durationSeconds,
        scoring_mode: "QUIZ",
        executive_insight: null,
        is_placeholder: false,
        order_index: q.order,
        is_enabled: true,
      } as never)
      .select("id")
      .single();
    if (error) throw new GameError("DB_ERROR", error.message);
    const { error: keyError } = await supabaseAdmin
      .from("question_keys_private")
      .upsert(
        { question_id: data.id, correct_answer_id: q.correctAnswerId },
        { onConflict: "question_id" },
      );
    if (keyError) throw new GameError("DB_ERROR", keyError.message);
  }
  return { count: DEFAULT_QUESTIONS.length };
}

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function uploadToBucket(path: string, bytes: Uint8Array, contentType: string) {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: contentType || "image/png", upsert: true });
  if (error) throw new GameError("STORAGE", error.message);
  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !signed) throw new GameError("STORAGE", signError?.message ?? "יצירת קישור נכשלה.");
  return signed.signedUrl;
}

export async function uploadQuestionImageImpl(input: {
  questionId: number;
  fileName: string;
  contentType: string;
  base64: string;
}) {
  const bytes = decodeBase64(input.base64);
  if (bytes.byteLength > 6_000_000) throw new GameError("TOO_LARGE", "התמונה גדולה מדי (עד 6MB).");
  const ext = (input.fileName.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const url = await uploadToBucket(
    `q${input.questionId}/${Date.now()}.${ext || "png"}`,
    bytes,
    input.contentType,
  );

  const { error: dbError } = await supabaseAdmin
    .from("questions_public")
    .update({ image_url: url })
    .eq("id", input.questionId);
  if (dbError) throw new GameError("DB_ERROR", dbError.message);

  return { imageUrl: url };
}

export async function removeQuestionImageImpl(questionId: number) {
  const { error } = await supabaseAdmin
    .from("questions_public")
    .update({ image_url: null })
    .eq("id", questionId);
  if (error) throw new GameError("DB_ERROR", error.message);
  return { ok: true as const };
}

// ------------------------------------------------------------------ settings

export const LOGO_KEY = "org_logo_url";
export const DURATION_KEY = "default_duration_seconds";
export const FALLBACK_DURATION = 30;

export async function getSettingsImpl() {
  const { data } = await supabaseAdmin.from("app_settings").select("key, value");
  const map: Record<string, string | null> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  const parsed = Number(map[DURATION_KEY]);
  return {
    logoUrl: map[LOGO_KEY] ?? null,
    defaultDurationSeconds:
      Number.isFinite(parsed) && parsed > 0 ? parsed : FALLBACK_DURATION,
  };
}

/** Default answer time for newly created questions (5-second steps). */
export async function setDefaultDurationImpl(seconds: number) {
  if (seconds < 5 || seconds > 120 || seconds % 5 !== 0) {
    throw new GameError("INVALID", "זמן ברירת המחדל חייב להיות בין 5 ל-120 שניות בקפיצות של 5.");
  }
  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert(
      { key: DURATION_KEY, value: String(seconds), updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  if (error) throw new GameError("DB_ERROR", error.message);
  return { defaultDurationSeconds: seconds };
}

export async function uploadLogoImpl(input: {
  fileName: string;
  contentType: string;
  base64: string;
}) {
  const bytes = decodeBase64(input.base64);
  if (bytes.byteLength > 4_000_000) throw new GameError("TOO_LARGE", "הקובץ גדול מדי (עד 4MB).");
  const ext = (input.fileName.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const url = await uploadToBucket(`logo/${Date.now()}.${ext || "png"}`, bytes, input.contentType);

  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key: LOGO_KEY, value: url, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new GameError("DB_ERROR", error.message);
  return { logoUrl: url };
}

export async function removeLogoImpl() {
  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key: LOGO_KEY, value: null, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new GameError("DB_ERROR", error.message);
  return { ok: true as const };
}

export async function listLiveSessionsImpl() {
  const { data, error } = await supabaseAdmin
    .from("game_sessions")
    .select("id, pin, phase, current_question_index, status, created_at")
    .eq("status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw new GameError("DB_ERROR", error.message);
  return data ?? [];
}
