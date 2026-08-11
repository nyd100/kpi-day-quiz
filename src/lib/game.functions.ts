import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const uuid = z.string().uuid();
const secret = z.string().min(16).max(128);

export const getServerTime = createServerFn({ method: "GET" }).handler(async () => {
  return { now: Date.now() };
});

export const createGame = createServerFn({ method: "POST" }).handler(async () => {
  const { createGameImpl, GameError } = await import("./game.server");
  try {
    return await createGameImpl();
  } catch (error) {
    throw new Error(error instanceof GameError ? error.message : "יצירת המשחק נכשלה.");
  }
});

export const verifyHost = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ sessionId: uuid, hostSecret: secret }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertHost, GameError } = await import("./game.server");
    try {
      const session = await assertHost(data.sessionId, data.hostSecret);
      return { ok: true as const, pin: session.pin, status: session.status };
    } catch (error) {
      if (error instanceof GameError) return { ok: false as const, pin: "", status: "" };
      throw error;
    }
  });

export const hostCommand = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        sessionId: uuid,
        hostSecret: secret,
        action: z.enum([
          "ADVANCE",
          "LOCK",
          "RESET",
          "DELETE",
          "ADD_BOTS",
          "CLEAR_BOTS",
          "TOGGLE_LATE_JOIN",
        ]),
        count: z.number().int().min(1).max(100).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { hostCommandImpl, GameError } = await import("./game.server");
    try {
      return await hostCommandImpl(data);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "הפעולה נכשלה.");
    }
  });

export const questionTick = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ sessionId: uuid, hostSecret: secret }).parse(data),
  )
  .handler(async ({ data }) => {
    const { questionTickImpl, GameError } = await import("./game.server");
    try {
      return await questionTickImpl(data);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "עדכון המצב נכשל.");
    }
  });

export const joinGame = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ pin: z.string().length(4), displayName: z.string().min(1).max(64) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { joinGameImpl, GameError } = await import("./game.server");
    try {
      return await joinGameImpl(data);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "ההצטרפות נכשלה.");
    }
  });

export const submitAnswer = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        sessionId: uuid,
        playerId: uuid,
        playerSecret: secret,
        questionId: z.number().int().min(1).max(16),
        answerId: z.enum(["A", "B", "C", "D"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { submitAnswerImpl, GameError } = await import("./game.server");
    try {
      return await submitAnswerImpl(data);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "שליחת התשובה נכשלה.");
    }
  });

export const playerState = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ playerId: uuid, playerSecret: secret }).parse(data),
  )
  .handler(async ({ data }) => {
    const { playerStateImpl, GameError } = await import("./game.server");
    try {
      return await playerStateImpl(data);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "טעינת מצב השחקן נכשלה.");
    }
  });
