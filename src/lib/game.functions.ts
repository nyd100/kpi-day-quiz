import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Firestore document IDs (used for session/player ids) are 20-char alphanumeric
// strings, not UUIDs — validate as a non-empty bounded id string.
const uuid = z.string().min(1).max(128);
const secret = z.string().min(16).max(128);

export const getServerTime = createServerFn({ method: "GET" }).handler(async () => {
  return { now: Date.now() };
});


export const hostCommand = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        token: z.string().min(1),
        // The operating device already knows the active sessionId (from the
        // shared Firestore ACTIVE query); passing it lets the server skip a
        // redundant lookup query on every click. Falls back to a lookup when
        // absent so older clients still work.
        sessionId: uuid.optional(),
        action: z.enum([
          "START_GAME",
          "START_QUESTION",
          "SHOW_RESULTS",
          "SHOW_LEADERBOARD",
          "NEXT_QUESTION",
          "FINISH",
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
    const { assertAdmin } = await import("./admin.server");
    const { hostCommandImpl, getActiveGameImpl, GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      let sessionId = data.sessionId;
      if (!sessionId) {
        const active = await getActiveGameImpl();
        if (!active) throw new GameError("NO_GAME", "אין משחק פעיל.");
        sessionId = active.sessionId;
      }
      return await hostCommandImpl(sessionId, data.action, data.count);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "הפעולה נכשלה.");
    }
  });

export const questionTick = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ token: z.string().min(1), sessionId: uuid.optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { assertAdmin } = await import("./admin.server");
    const { questionTickImpl, getActiveGameImpl, GameError } = await import("./game.server");
    try {
      await assertAdmin(data.token);
      let sessionId = data.sessionId;
      if (!sessionId) {
        const active = await getActiveGameImpl();
        if (!active) return { answered: 0, total: 0 };
        sessionId = active.sessionId;
      }
      return await questionTickImpl(sessionId);
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
    z.object({ sessionId: uuid, playerId: uuid, playerSecret: secret }).parse(data),
  )
  .handler(async ({ data }) => {
    const { playerStateImpl, GameError } = await import("./game.server");
    try {
      return await playerStateImpl(data);
    } catch (error) {
      throw new Error(error instanceof GameError ? error.message : "טעינת מצב השחקן נכשלה.");
    }
  });
