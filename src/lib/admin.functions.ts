import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const token = z.string().min(1);
const answerId = z.enum(["A", "B", "C", "D"]);

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return { ok: true as const };
    } catch (error) {
      if (error instanceof GameError) return { ok: false as const, message: error.message };
      throw error;
    }
  });

export const adminListQuestions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, listAdminQuestions } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await listAdminQuestions();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "טעינת השאלות נכשלה.");
    }
  });

export const adminSaveQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        token,
        question: z.object({
          id: z.number().int().min(1),
          pairId: z.number().int().min(1).max(999).nullable().optional(),
          category: z.enum(["OUTPUT", "OUTCOME"]),
          title: z.string().min(1).max(300),
          subtitle: z.string().max(400).nullable(),
          answerA: z.string().min(1).max(200),
          answerB: z.string().min(1).max(200),
          answerC: z.string().min(1).max(200),
          answerD: z.string().min(1).max(200),
          durationSeconds: z.number().int().min(5).max(120),
          scoringMode: z.enum(["QUIZ", "POLL"]),
          executiveInsight: z.string().max(1000).nullable(),
          correctAnswerId: answerId,
          explanation: z.string().max(1000).nullable(),
          isPlaceholder: z.boolean(),
          funFact: z.string().max(500).nullish(),
          funFactEnabled: z.boolean().optional(),
        }),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, saveQuestionImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await saveQuestionImpl(data.question);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שמירת השאלה נכשלה.");
    }
  });

export const adminUploadQuestionImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        token,
        questionId: z.number().int().min(1),
        fileName: z.string().min(1).max(200),
        contentType: z.string().min(1).max(100),
        base64: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, uploadQuestionImageImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await uploadQuestionImageImpl(data);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "העלאת התמונה נכשלה.");
    }
  });

export const adminRemoveQuestionImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token, questionId: z.number().int().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, removeQuestionImageImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await removeQuestionImageImpl(data.questionId);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "הסרת התמונה נכשלה.");
    }
  });

export const adminCreateQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, createQuestionImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await createQuestionImpl();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "הוספת השאלה נכשלה.");
    }
  });

export const adminDeleteQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token, questionId: z.number().int().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, deleteQuestionImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await deleteQuestionImpl(data.questionId);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "מחיקת השאלה נכשלה.");
    }
  });

export const adminSetQuestionEnabled = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({ token, questionId: z.number().int().min(1), isEnabled: z.boolean() })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, setQuestionEnabledImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await setQuestionEnabledImpl(data.questionId, data.isEnabled);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "העדכון נכשל.");
    }
  });

export const adminReorderQuestions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token, orderedIds: z.array(z.number().int().min(1)).min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, reorderQuestionsImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await reorderQuestionsImpl(data.orderedIds);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שינוי הסדר נכשל.");
    }
  });

export const adminRestoreDefaults = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, restoreDefaultQuestionsImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await restoreDefaultQuestionsImpl();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שחזור השאלות נכשל.");
    }
  });

export const adminGetSettings = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, getSettingsImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await getSettingsImpl();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "טעינת ההגדרות נכשלה.");
    }
  });

export const adminSetDefaultDuration = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token, seconds: z.number().int().min(5).max(120) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, setDefaultDurationImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await setDefaultDurationImpl(data.seconds);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שמירת ההגדרה נכשלה.");
    }
  });

export const adminSetAllQuestionsDuration = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token, seconds: z.number().int().min(5).max(120) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, setAllQuestionsDurationImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await setAllQuestionsDurationImpl(data.seconds);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "עדכון הזמן לכל השאלות נכשל.");
    }
  });

export const adminSetShowInsights = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token, show: z.boolean() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, setShowInsightsImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await setShowInsightsImpl(data.show);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שמירת ההגדרה נכשלה.");
    }
  });

export const adminSetPresentAspect = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token, aspect: z.enum(["16:9", "4:3"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, setPresentAspectImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await setPresentAspectImpl(data.aspect);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שמירת יחס המסך נכשלה.");
    }
  });

export const adminSetAnswerMarker = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token, marker: z.enum(["letter", "number", "pattern"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, setAnswerMarkerImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await setAnswerMarkerImpl(data.marker);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שמירת סימון התשובות נכשלה.");
    }
  });

export const adminSetSoundPack = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token, pack: z.enum(["cinematic", "gameshow", "classic", "arcade"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, setSoundPackImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await setSoundPackImpl(data.pack);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שמירת חבילת הצלילים נכשלה.");
    }
  });

export const adminUploadLogo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        token,
        fileName: z.string().min(1).max(200),
        contentType: z.string().min(1).max(100),
        base64: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, uploadLogoImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await uploadLogoImpl(data);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "העלאת הלוגו נכשלה.");
    }
  });

export const adminRemoveLogo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, removeLogoImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await removeLogoImpl();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "הסרת הלוגו נכשלה.");
    }
  });

export const adminCreateGame = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin.server");
    const { createGameImpl, GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      return await createGameImpl();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "יצירת המשחק נכשלה.");
    }
  });


export const adminAddAuthorizedAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token, email: z.string().email() }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, addAuthorizedAdminImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      return await addAuthorizedAdminImpl(data.token, data.email);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "הוספת המנהל נכשלה.");
    }
  });

export const adminRemoveAuthorizedAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token, email: z.string().email() }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, removeAuthorizedAdminImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      return await removeAuthorizedAdminImpl(data.token, data.email);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "הסרת המנהל נכשלה.");
    }
  });

export const adminListAuthorizedAdmins = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ token }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, listAuthorizedAdminsImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      return await listAuthorizedAdminsImpl(data.token);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "טעינת המנהלים נכשלה.");
    }
  });

