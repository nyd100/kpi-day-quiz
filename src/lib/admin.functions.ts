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
        questionId: z.number().int().min(1).max(16),
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
    z.object({ passcode, questionId: z.number().int().min(1).max(16) }).parse(data),
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
