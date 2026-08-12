// Server-only admin console engine. Protected by a shared admin passcode.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { GameError } from "@/lib/game.server";
import { TOTAL_QUESTIONS, type AnswerId } from "@/lib/quiz";

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
};

export async function listAdminQuestions(): Promise<AdminQuestion[]> {
  const { data, error } = await supabaseAdmin.from("questions_public").select("*").order("id");
  if (error) throw new GameError("DB_ERROR", error.message);
  const { data: keys } = await supabaseAdmin
    .from("question_keys_private")
    .select("question_id, correct_answer_id, explanation");
  const keyMap = new Map((keys ?? []).map((k) => [k.question_id, k]));

  return (data ?? []).map((q) => {
    const key = keyMap.get(q.id);
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
      imageUrl: (q as { image_url: string | null }).image_url ?? null,
      correctAnswerId: (key?.correct_answer_id ?? "A") as AnswerId,
      explanation: key?.explanation ?? null,
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
};

export async function saveQuestionImpl(input: SaveQuestionInput) {
  if (input.id < 1 || input.id > TOTAL_QUESTIONS) {
    throw new GameError("INVALID", "מספר שאלה לא חוקי.");
  }
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

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
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
  const path = `q${input.questionId}/${Date.now()}.${ext || "png"}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: input.contentType || "image/png", upsert: true });
  if (error) throw new GameError("STORAGE", error.message);

  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, TEN_YEARS);
  if (signError || !signed) throw new GameError("STORAGE", signError?.message ?? "יצירת קישור נכשלה.");

  const { error: dbError } = await supabaseAdmin
    .from("questions_public")
    .update({ image_url: signed.signedUrl })
    .eq("id", input.questionId);
  if (dbError) throw new GameError("DB_ERROR", dbError.message);

  return { imageUrl: signed.signedUrl };
}

export async function removeQuestionImageImpl(questionId: number) {
  const { error } = await supabaseAdmin
    .from("questions_public")
    .update({ image_url: null })
    .eq("id", questionId);
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
