import { r as createServerFn } from "./server-CQ9vf1HB2.mjs";
import { a as objectType, i as numberType, o as stringType, r as enumType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-DTVw5wk0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/game.functions-BqeZdF-x.js
var uuid = stringType().uuid();
var secret = stringType().min(16).max(128);
var getServerTime_createServerFn_handler = createServerRpc({
	id: "ecb32366350328e1740f0cd95f3100012c617872b4bbaaa90e313198f908411d",
	name: "getServerTime",
	filename: "src/lib/game.functions.ts"
}, (opts) => getServerTime.__executeServer(opts));
var getServerTime = createServerFn({ method: "GET" }).handler(getServerTime_createServerFn_handler, async () => {
	return { now: Date.now() };
});
var verifyHost_createServerFn_handler = createServerRpc({
	id: "bc796c3c8ba86cd91e3ef9085a32cc8c2ec8d9ea7e90832f7a99214aa9bbab28",
	name: "verifyHost",
	filename: "src/lib/game.functions.ts"
}, (opts) => verifyHost.__executeServer(opts));
var verifyHost = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	sessionId: uuid,
	hostSecret: secret
}).parse(data)).handler(verifyHost_createServerFn_handler, async ({ data }) => {
	const { assertHost, GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		const session = await assertHost(data.sessionId, data.hostSecret);
		return {
			ok: true,
			pin: session.pin,
			status: session.status
		};
	} catch (error) {
		if (error instanceof GameError) return {
			ok: false,
			pin: "",
			status: ""
		};
		throw error;
	}
});
var hostCommand_createServerFn_handler = createServerRpc({
	id: "35c3318731491ac481f936c4b61f12bda52eb76eafa01e7867f50846d266a65a",
	name: "hostCommand",
	filename: "src/lib/game.functions.ts"
}, (opts) => hostCommand.__executeServer(opts));
var hostCommand = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	sessionId: uuid,
	hostSecret: secret,
	action: enumType([
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
		"TOGGLE_LATE_JOIN"
	]),
	count: numberType().int().min(1).max(100).optional()
}).parse(data)).handler(hostCommand_createServerFn_handler, async ({ data }) => {
	const { hostCommandImpl, GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		return await hostCommandImpl(data);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "הפעולה נכשלה.");
	}
});
var questionTick_createServerFn_handler = createServerRpc({
	id: "91badcedecf69ea1e90d94ad2d8c79e135b6828789992b9eed7a9a587f134859",
	name: "questionTick",
	filename: "src/lib/game.functions.ts"
}, (opts) => questionTick.__executeServer(opts));
var questionTick = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	sessionId: uuid,
	hostSecret: secret
}).parse(data)).handler(questionTick_createServerFn_handler, async ({ data }) => {
	const { questionTickImpl, GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		return await questionTickImpl(data);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "עדכון המצב נכשל.");
	}
});
var joinGame_createServerFn_handler = createServerRpc({
	id: "cd640430dc0b8389e5a13c3f7efc1e47c6029876115c2ec74018be933387f1cb",
	name: "joinGame",
	filename: "src/lib/game.functions.ts"
}, (opts) => joinGame.__executeServer(opts));
var joinGame = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	pin: stringType().length(4),
	displayName: stringType().min(1).max(64)
}).parse(data)).handler(joinGame_createServerFn_handler, async ({ data }) => {
	const { joinGameImpl, GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		return await joinGameImpl(data);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "ההצטרפות נכשלה.");
	}
});
var submitAnswer_createServerFn_handler = createServerRpc({
	id: "e7951ab79222767ae64dd26f95c0de87a1a146af576a8b078621e034378e544f",
	name: "submitAnswer",
	filename: "src/lib/game.functions.ts"
}, (opts) => submitAnswer.__executeServer(opts));
var submitAnswer = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	sessionId: uuid,
	playerId: uuid,
	playerSecret: secret,
	questionId: numberType().int().min(1).max(16),
	answerId: enumType([
		"A",
		"B",
		"C",
		"D"
	])
}).parse(data)).handler(submitAnswer_createServerFn_handler, async ({ data }) => {
	const { submitAnswerImpl, GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		return await submitAnswerImpl(data);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "שליחת התשובה נכשלה.");
	}
});
var playerState_createServerFn_handler = createServerRpc({
	id: "507fb07beb77196c8f29e44e5635169e98d631b88877655d6af681ee8ade9416",
	name: "playerState",
	filename: "src/lib/game.functions.ts"
}, (opts) => playerState.__executeServer(opts));
var playerState = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	playerId: uuid,
	playerSecret: secret
}).parse(data)).handler(playerState_createServerFn_handler, async ({ data }) => {
	const { playerStateImpl, GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		return await playerStateImpl(data);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "טעינת מצב השחקן נכשלה.");
	}
});
//#endregion
export { getServerTime_createServerFn_handler, hostCommand_createServerFn_handler, joinGame_createServerFn_handler, playerState_createServerFn_handler, questionTick_createServerFn_handler, submitAnswer_createServerFn_handler, verifyHost_createServerFn_handler };
