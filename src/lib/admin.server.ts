// Server-only admin console engine. Protected by a shared admin passcode.
import { adminDb, adminStorage, adminAuth } from "@/integrations/firebase/admin";
import { GameError } from "@/lib/game.server";
import { DEFAULT_QUESTIONS } from "@/lib/default-questions";
import type { AnswerId } from "@/lib/quiz";
import * as crypto from "crypto";

const BUCKET = "question-images";
const SUPER_ADMINS = ["nathand@moia.gov.il", "nyd100@gmail.com"];

export async function assertAdmin(token: string) {
  if (!token) throw new GameError("FORBIDDEN", "נדרש אימות כדי לגשת לממשק הניהול.");
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase() || "";
    
    if (SUPER_ADMINS.includes(email)) return { email, isSuperAdmin: true };

    const adminDoc = await adminDb.collection("authorized_admins").doc(email).get();
    if (adminDoc.exists) {
      return { email, isSuperAdmin: false };
    }

    throw new GameError("FORBIDDEN", "אין לך הרשאות ניהול למערכת זו.");
  } catch (error: any) {
    throw new GameError("FORBIDDEN", "האימות נכשל או פג תוקפו. אנא התחבר מחדש.");
  }
}

export async function addAuthorizedAdminImpl(token: string, emailToAdd: string) {
  const { isSuperAdmin } = await assertAdmin(token);
  if (!isSuperAdmin) throw new GameError("FORBIDDEN", "רק מנהלים ראשיים יכולים להוסיף מנהלים אחרים.");
  
  const email = emailToAdd.trim().toLowerCase();
  if (!email) throw new GameError("INVALID", "כתובת אימייל לא חוקית.");
  
  await adminDb.collection("authorized_admins").doc(email).set({
    email,
    addedAt: new Date().toISOString(),
  });
  return { ok: true };
}

export async function removeAuthorizedAdminImpl(token: string, emailToRemove: string) {
  const { isSuperAdmin } = await assertAdmin(token);
  if (!isSuperAdmin) throw new GameError("FORBIDDEN", "רק מנהלים ראשיים יכולים להסיר מנהלים אחרים.");
  
  const email = emailToRemove.trim().toLowerCase();
  if (SUPER_ADMINS.includes(email)) throw new GameError("FORBIDDEN", "לא ניתן להסיר מנהל ראשי של המערכת.");
  
  await adminDb.collection("authorized_admins").doc(email).delete();
  return { ok: true };
}

export async function listAuthorizedAdminsImpl(token: string) {
  const { isSuperAdmin } = await assertAdmin(token);
  if (!isSuperAdmin) return []; // Non-super admins don't need to see the list

  const snap = await adminDb.collection("authorized_admins").get();
  const list = snap.docs.map(d => d.data().email as string);
  return [...SUPER_ADMINS, ...list];
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
  funFact: string | null;
  funFactEnabled: boolean;
};

export async function listAdminQuestions(): Promise<AdminQuestion[]> {
  try {
    const qSnap = await adminDb.collection("questions").orderBy("orderIndex").get();
    
    // In Firebase we might store correct answers in the main doc if it's admin-only,
    // but the plan says "question_keys/{questionId}" is used to hide answers from clients.
    // Let's fetch the keys as well.
    const keysSnap = await adminDb.collection("question_keys").get();
    const keyMap = new Map(keysSnap.docs.map(d => [d.id, d.data()]));

    return qSnap.docs.map(doc => {
      const q = doc.data();
      const key = keyMap.get(doc.id);
      return {
        id: Number(doc.id),
        category: q.category as AdminQuestion["category"],
        pairId: q.pairId ?? null,
        title: q.title || "",
        subtitle: q.subtitle ?? null,
        answers: q.answers || [],
        durationSeconds: q.durationSeconds ?? 30,
        scoringMode: q.scoringMode || "QUIZ",
        executiveInsight: q.executiveInsight ?? null,
        isPlaceholder: q.isPlaceholder ?? false,
        imageUrl: q.imageUrl ?? null,
        correctAnswerId: (key?.correctAnswerId ?? "A") as AnswerId,
        explanation: key?.explanation ?? null,
        orderIndex: q.orderIndex ?? 0,
        isEnabled: q.isEnabled ?? true,
        funFact: q.funFact ?? null,
        funFactEnabled: q.funFactEnabled ?? false,
      };
    });
  } catch (error: any) {
    throw new GameError("DB_ERROR", error.message);
  }
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
  funFact?: string | null | undefined;
  funFactEnabled?: boolean | undefined;
};

export async function saveQuestionImpl(input: SaveQuestionInput) {
  if (!input.title.trim()) throw new GameError("INVALID", "לשאלה חייבת להיות כותרת.");
  
  const qRef = adminDb.collection("questions").doc(String(input.id));
  const keyRef = adminDb.collection("question_keys").doc(String(input.id));
  
  const answers = [
    { id: "A", text: input.answerA.trim() },
    { id: "B", text: input.answerB.trim() },
    { id: "C", text: input.answerC.trim() },
    { id: "D", text: input.answerD.trim() },
  ];

  const updateData: any = {
    category: input.category,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || null,
    answers,
    durationSeconds: input.durationSeconds,
    scoringMode: input.scoringMode,
    executiveInsight: input.executiveInsight?.trim() || null,
    isPlaceholder: input.isPlaceholder,
    pairId: input.pairId ?? null,
    funFact: input.funFact?.trim() || null,
    funFactEnabled: input.funFactEnabled ?? false,
  };
  
  if (input.isEnabled !== undefined) {
    updateData.isEnabled = input.isEnabled;
  }

  try {
    await adminDb.runTransaction(async (t) => {
      t.set(qRef, updateData, { merge: true });
      t.set(keyRef, {
        questionId: input.id,
        correctAnswerId: input.correctAnswerId,
        explanation: input.explanation?.trim() || null,
      }, { merge: true });
    });
    return { ok: true as const };
  } catch (error: any) {
    throw new GameError("DB_ERROR", error.message);
  }
}

export async function createQuestionImpl() {
  try {
    const qSnap = await adminDb.collection("questions").orderBy("orderIndex", "desc").limit(1).get();
    let nextOrder = 1;
    if (!qSnap.empty) {
      nextOrder = (qSnap.docs[0].data().orderIndex ?? 0) + 1;
    }
    
    const { defaultDurationSeconds } = await getSettingsImpl();
    
    // Find next available ID
    const allSnap = await adminDb.collection("questions").get();
    const ids = allSnap.docs.map(d => Number(d.id)).filter(id => !isNaN(id));
    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

    const qRef = adminDb.collection("questions").doc(String(nextId));
    const keyRef = adminDb.collection("question_keys").doc(String(nextId));

    await adminDb.runTransaction(async (t) => {
      t.set(qRef, {
        id: nextId,
        category: "OUTPUT",
        title: "שאלה חדשה",
        answers: [
          { id: "A", text: "תשובה א" },
          { id: "B", text: "תשובה ב" },
          { id: "C", text: "תשובה ג" },
          { id: "D", text: "תשובה ד" },
        ],
        durationSeconds: defaultDurationSeconds,
        scoringMode: "QUIZ",
        isPlaceholder: true,
        orderIndex: nextOrder,
        isEnabled: true,
        funFact: null,
        funFactEnabled: false,
      });
      t.set(keyRef, {
        questionId: nextId,
        correctAnswerId: "A",
        explanation: null,
      });
    });

    return { id: nextId };
  } catch (error: any) {
    throw new GameError("DB_ERROR", error.message);
  }
}

export async function deleteQuestionImpl(questionId: number) {
  try {
    await adminDb.runTransaction(async (t) => {
      t.delete(adminDb.collection("questions").doc(String(questionId)));
      t.delete(adminDb.collection("question_keys").doc(String(questionId)));
    });
    return { ok: true as const };
  } catch (error: any) {
    throw new GameError("DB_ERROR", error.message);
  }
}

export async function setQuestionEnabledImpl(questionId: number, isEnabled: boolean) {
  try {
    await adminDb.collection("questions").doc(String(questionId)).update({ isEnabled });
    return { ok: true as const };
  } catch (error: any) {
    throw new GameError("DB_ERROR", error.message);
  }
}

export async function reorderQuestionsImpl(orderedIds: number[]) {
  try {
    await adminDb.runTransaction(async (t) => {
      for (let i = 0; i < orderedIds.length; i++) {
        const ref = adminDb.collection("questions").doc(String(orderedIds[i]));
        t.update(ref, { orderIndex: i + 1 });
      }
    });
    return { ok: true as const };
  } catch (error: any) {
    throw new GameError("DB_ERROR", error.message);
  }
}

export async function restoreDefaultQuestionsImpl() {
  try {
    const batch = adminDb.batch();
    
    // Delete existing
    const existingQ = await adminDb.collection("questions").get();
    existingQ.docs.forEach(doc => batch.delete(doc.ref));
    
    const existingK = await adminDb.collection("question_keys").get();
    existingK.docs.forEach(doc => batch.delete(doc.ref));

    for (const q of DEFAULT_QUESTIONS) {
      // DefaultQuestion has no `id` field — it is keyed by `order`. Using q.id
      // here wrote every question to doc("undefined") and set id:undefined
      // (rejected by Firestore). Key each question by its order instead.
      const questionId = q.order;
      const qRef = adminDb.collection("questions").doc(String(questionId));
      const kRef = adminDb.collection("question_keys").doc(String(questionId));

      const answers = [
        { id: "A", text: q.answers[0] },
        { id: "B", text: q.answers[1] },
        { id: "C", text: q.answers[2] },
        { id: "D", text: q.answers[3] },
      ];

      batch.set(qRef, {
        id: questionId,
        category: q.category,
        pairId: q.pairId,
        title: q.title,
        subtitle: null,
        answers,
        durationSeconds: q.durationSeconds,
        scoringMode: "QUIZ",
        executiveInsight: null,
        isPlaceholder: q.isPlaceholder ?? false,
        orderIndex: q.order,
        isEnabled: q.isEnabled ?? true,
        funFact: q.funFact ?? null,
        funFactEnabled: q.funFactEnabled ?? false,
      });

      batch.set(kRef, {
        questionId,
        correctAnswerId: q.correctAnswerId,
        explanation: null,
      });
    }
    
    await batch.commit();
    return { count: DEFAULT_QUESTIONS.length };
  } catch (error: any) {
    throw new GameError("DB_ERROR", error.message);
  }
}

function decodeBase64(base64: string): Buffer {
  return Buffer.from(base64, "base64");
}

async function uploadToBucket(path: string, bytes: Buffer, contentType: string) {
  try {
    const bucket = adminStorage.bucket();
    const file = bucket.file(path);
    await file.save(bytes, {
      metadata: { contentType },
      public: true, // Allow public read access to images
    });
    // In Firebase Storage, if it's public we can construct the URL directly or use getSignedUrl
    // Wait, the project might not have public access enabled by default. Let's use getSignedUrl 
    // with a long expiration, similar to the original TEN_YEARS setup, or just use the public URL
    // format if it's open. For safety, let's generate a long-lived signed URL.
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "01-01-2099",
    });
    return url;
  } catch (error: any) {
    throw new GameError("STORAGE", error.message);
  }
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
    `question-images/q${input.questionId}/${Date.now()}.${ext || "png"}`,
    bytes,
    input.contentType,
  );

  await adminDb.collection("questions").doc(String(input.questionId)).update({ imageUrl: url });
  return { imageUrl: url };
}

export async function removeQuestionImageImpl(questionId: number) {
  try {
    await adminDb.collection("questions").doc(String(questionId)).update({ imageUrl: null });
    return { ok: true as const };
  } catch (error: any) {
    throw new GameError("DB_ERROR", error.message);
  }
}

// ------------------------------------------------------------------ settings

export const LOGO_KEY = "org_logo_url";
export const DURATION_KEY = "default_duration_seconds";
export const SHOW_INSIGHTS_KEY = "show_insights";
export const FALLBACK_DURATION = 30;
export const ASPECT_KEY = "present_aspect";
export const FALLBACK_ASPECT = "16:9";

export async function getSettingsImpl() {
  try {
    const snap = await adminDb.collection("settings").doc("global").get();
    const map = snap.data() || {};

    const parsed = Number(map[DURATION_KEY]);
    return {
      logoUrl: map[LOGO_KEY] ?? null,
      defaultDurationSeconds: Number.isFinite(parsed) && parsed > 0 ? parsed : FALLBACK_DURATION,
      showInsights: map[SHOW_INSIGHTS_KEY] !== false,
      presentAspect: map[ASPECT_KEY] === "4:3" ? "4:3" : "16:9",
    };
  } catch (error) {
    return {
      logoUrl: null,
      defaultDurationSeconds: FALLBACK_DURATION,
      showInsights: true,
      presentAspect: "16:9",
    };
  }
}

export async function setDefaultDurationImpl(seconds: number) {
  if (seconds < 5 || seconds > 120 || seconds % 5 !== 0) {
    throw new GameError("INVALID", "זמן ברירת המחדל חייב להיות בין 5 ל-120 שניות בקפיצות של 5.");
  }
  await adminDb.collection("settings").doc("global").set(
    { [DURATION_KEY]: seconds, updated_at: new Date().toISOString() },
    { merge: true }
  );
  return { defaultDurationSeconds: seconds };
}

export async function setAllQuestionsDurationImpl(seconds: number) {
  if (seconds < 5 || seconds > 120 || seconds % 5 !== 0) {
    throw new GameError("INVALID", "זמן ברירת המחדל חייב להיות בין 5 ל-120 שניות בקפיצות של 5.");
  }
  try {
    const snap = await adminDb.collection("questions").get();
    const batch = adminDb.batch();
    snap.docs.forEach((doc) => batch.update(doc.ref, { durationSeconds: seconds }));
    await batch.commit();

    await adminDb.collection("settings").doc("global").set(
      { [DURATION_KEY]: seconds, updated_at: new Date().toISOString() },
      { merge: true }
    );

    return { seconds, count: snap.size };
  } catch (error: any) {
    throw new GameError("DB_ERROR", error.message);
  }
}

export async function setShowInsightsImpl(show: boolean) {
  await adminDb.collection("settings").doc("global").set(
    { [SHOW_INSIGHTS_KEY]: show, updated_at: new Date().toISOString() },
    { merge: true }
  );
  return { showInsights: show };
}

export async function setPresentAspectImpl(aspect: "16:9" | "4:3") {
  await adminDb.collection("settings").doc("global").set(
    { [ASPECT_KEY]: aspect, updated_at: new Date().toISOString() },
    { merge: true }
  );
  return { presentAspect: aspect };
}

export async function uploadLogoImpl(input: {
  fileName: string;
  contentType: string;
  base64: string;
}) {
  const bytes = decodeBase64(input.base64);
  if (bytes.byteLength > 4_000_000) throw new GameError("TOO_LARGE", "הקובץ גדול מדי (עד 4MB).");
  const ext = (input.fileName.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const url = await uploadToBucket(`logos/${Date.now()}.${ext || "png"}`, bytes, input.contentType);

  await adminDb.collection("settings").doc("global").set(
    { [LOGO_KEY]: url, updated_at: new Date().toISOString() },
    { merge: true }
  );
  return { logoUrl: url };
}

export async function removeLogoImpl() {
  await adminDb.collection("settings").doc("global").set(
    { [LOGO_KEY]: null, updated_at: new Date().toISOString() },
    { merge: true }
  );
  return { ok: true as const };
}

export async function listLiveSessionsImpl() {
  try {
    const snap = await adminDb.collection("sessions")
      .where("status", "==", "ACTIVE")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
      
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        pin: data.pin,
        phase: data.phase,
        current_question_index: data.currentQuestionIndex,
        status: data.status,
        created_at: data.createdAt,
      };
    });
  } catch (error: any) {
    // Requires composite index if querying by equality and ordering by a different field.
    // If it fails, fallback to simple fetch and sort in memory.
    const backupSnap = await adminDb.collection("sessions")
      .where("status", "==", "ACTIVE")
      .get();
    return backupSnap.docs
      .map(d => ({
        id: d.id,
        pin: d.data().pin,
        phase: d.data().phase,
        current_question_index: d.data().currentQuestionIndex,
        status: d.data().status,
        created_at: d.data().createdAt || "",
      }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 10);
  }
}
