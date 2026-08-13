import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const passcode = z.string().min(1).max(200);
const answerId = z.enum(["A", "B", "C", "D"]);

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ passcode }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return { ok: true as const };
    } catch (error) {
      if (error instanceof GameError) return { ok: false as const, message: error.message };
      throw error;
    }
  });

export const adminListQuestions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ passcode }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, listAdminQuestions } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return await listAdminQuestions();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "טעינת השאלות נכשלה.");
    }
  });

export const adminSaveQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        passcode,
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
        }),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, saveQuestionImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return await saveQuestionImpl(data.question);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שמירת השאלה נכשלה.");
    }
  });

export const adminUploadQuestionImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        passcode,
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
      assertAdmin(data.passcode);
      return await uploadQuestionImageImpl(data);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "העלאת התמונה נכשלה.");
    }
  });

export const adminRemoveQuestionImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ passcode, questionId: z.number().int().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, removeQuestionImageImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return await removeQuestionImageImpl(data.questionId);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "הסרת התמונה נכשלה.");
    }
  });

export const adminCreateQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ passcode }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, createQuestionImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return await createQuestionImpl();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "הוספת השאלה נכשלה.");
    }
  });

export const adminDeleteQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ passcode, questionId: z.number().int().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, deleteQuestionImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return await deleteQuestionImpl(data.questionId);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "מחיקת השאלה נכשלה.");
    }
  });

export const adminSetQuestionEnabled = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({ passcode, questionId: z.number().int().min(1), isEnabled: z.boolean() })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, setQuestionEnabledImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return await setQuestionEnabledImpl(data.questionId, data.isEnabled);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "העדכון נכשל.");
    }
  });

export const adminReorderQuestions = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ passcode, orderedIds: z.array(z.number().int().min(1)).min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin, reorderQuestionsImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return await reorderQuestionsImpl(data.orderedIds);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שינוי הסדר נכשל.");
    }
  });

export const adminRestoreDefaults = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ passcode }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, restoreDefaultQuestionsImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return await restoreDefaultQuestionsImpl();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שחזור השאלות נכשל.");
    }
  });

export const adminGetSettings = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ passcode }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, getSettingsImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return await getSettingsImpl();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "טעינת ההגדרות נכשלה.");
    }
  });

export const adminUploadLogo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        passcode,
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
      assertAdmin(data.passcode);
      return await uploadLogoImpl(data);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "העלאת הלוגו נכשלה.");
    }
  });

export const adminRemoveLogo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ passcode }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin, removeLogoImpl } = await import("./admin.server");
    const { GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return await removeLogoImpl();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "הסרת הלוגו נכשלה.");
    }
  });

export const adminCreateGame = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ passcode }).parse(data))
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin.server");
    const { createGameImpl, GameError } = await import("./game.server");
    try {
      assertAdmin(data.passcode);
      return await createGameImpl();
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "יצירת המשחק נכשלה.");
    }
  });

