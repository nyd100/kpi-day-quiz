import { r as createServerFn } from "./server-CQ9vf1HB2.mjs";
import { a as objectType, i as numberType, n as booleanType, o as stringType, r as enumType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-DTVw5wk0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-BvHgiJ5C.js
var passcode = stringType().min(1).max(200);
var answerId = enumType([
	"A",
	"B",
	"C",
	"D"
]);
var adminLogin_createServerFn_handler = createServerRpc({
	id: "89f029f4fc21ed092423cd54f44fb61078423691288a3a89663a6e0973cd86ea",
	name: "adminLogin",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminLogin.__executeServer(opts));
var adminLogin = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(adminLogin_createServerFn_handler, async ({ data }) => {
	const { assertAdmin } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return { ok: true };
	} catch (error) {
		if (error instanceof GameError) return {
			ok: false,
			message: error.message
		};
		throw error;
	}
});
var adminListQuestions_createServerFn_handler = createServerRpc({
	id: "6058cffff129c2aa3798c06a3907a0ad52e987e2a3ba44ca64781279c3baf4a9",
	name: "adminListQuestions",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminListQuestions.__executeServer(opts));
var adminListQuestions = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(adminListQuestions_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, listAdminQuestions } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await listAdminQuestions();
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "טעינת השאלות נכשלה.");
	}
});
var adminSaveQuestion_createServerFn_handler = createServerRpc({
	id: "55e659eb1cd8ec8dd528f173d97abeb7029f052244ca8080ffb40227f9c5f304",
	name: "adminSaveQuestion",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminSaveQuestion.__executeServer(opts));
var adminSaveQuestion = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	question: objectType({
		id: numberType().int().min(1),
		pairId: numberType().int().min(1).max(999).nullable().optional(),
		category: enumType(["OUTPUT", "OUTCOME"]),
		title: stringType().min(1).max(300),
		subtitle: stringType().max(400).nullable(),
		answerA: stringType().min(1).max(200),
		answerB: stringType().min(1).max(200),
		answerC: stringType().min(1).max(200),
		answerD: stringType().min(1).max(200),
		durationSeconds: numberType().int().min(5).max(120),
		scoringMode: enumType(["QUIZ", "POLL"]),
		executiveInsight: stringType().max(1e3).nullable(),
		correctAnswerId: answerId,
		explanation: stringType().max(1e3).nullable(),
		isPlaceholder: booleanType()
	})
}).parse(data)).handler(adminSaveQuestion_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, saveQuestionImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await saveQuestionImpl(data.question);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "שמירת השאלה נכשלה.");
	}
});
var adminUploadQuestionImage_createServerFn_handler = createServerRpc({
	id: "4bb443d220451eda36e31aa5ee7abe41024c2c987587d3ce36a5744b37557221",
	name: "adminUploadQuestionImage",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminUploadQuestionImage.__executeServer(opts));
var adminUploadQuestionImage = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	questionId: numberType().int().min(1),
	fileName: stringType().min(1).max(200),
	contentType: stringType().min(1).max(100),
	base64: stringType().min(1)
}).parse(data)).handler(adminUploadQuestionImage_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, uploadQuestionImageImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await uploadQuestionImageImpl(data);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "העלאת התמונה נכשלה.");
	}
});
var adminRemoveQuestionImage_createServerFn_handler = createServerRpc({
	id: "450be0cd9df55f236c6ba0abce39089d2ea862ac0f9650e9a1f5b63e22cc80b1",
	name: "adminRemoveQuestionImage",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminRemoveQuestionImage.__executeServer(opts));
var adminRemoveQuestionImage = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	questionId: numberType().int().min(1)
}).parse(data)).handler(adminRemoveQuestionImage_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, removeQuestionImageImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await removeQuestionImageImpl(data.questionId);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "הסרת התמונה נכשלה.");
	}
});
var adminCreateQuestion_createServerFn_handler = createServerRpc({
	id: "204d3b89221109fea1e54682ea7b3f14d0866ba1e047ced819ddf2dcbfc93082",
	name: "adminCreateQuestion",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminCreateQuestion.__executeServer(opts));
var adminCreateQuestion = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(adminCreateQuestion_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, createQuestionImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await createQuestionImpl();
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "הוספת השאלה נכשלה.");
	}
});
var adminDeleteQuestion_createServerFn_handler = createServerRpc({
	id: "0afecc08e6eec6ec62105fce6cab0f06a1307bb569da11d290248975cc6bb998",
	name: "adminDeleteQuestion",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminDeleteQuestion.__executeServer(opts));
var adminDeleteQuestion = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	questionId: numberType().int().min(1)
}).parse(data)).handler(adminDeleteQuestion_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, deleteQuestionImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await deleteQuestionImpl(data.questionId);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "מחיקת השאלה נכשלה.");
	}
});
var adminSetQuestionEnabled_createServerFn_handler = createServerRpc({
	id: "dbaa19bd56333fe9a451ad8af40503651f6eac5e24c8371588f5af1a12cb1f9b",
	name: "adminSetQuestionEnabled",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetQuestionEnabled.__executeServer(opts));
var adminSetQuestionEnabled = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	questionId: numberType().int().min(1),
	isEnabled: booleanType()
}).parse(data)).handler(adminSetQuestionEnabled_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, setQuestionEnabledImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await setQuestionEnabledImpl(data.questionId, data.isEnabled);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "העדכון נכשל.");
	}
});
var adminReorderQuestions_createServerFn_handler = createServerRpc({
	id: "61505594ec787e18c70d58baf00cc4a0f36e1a9f3678332ea1248986c9acf3a7",
	name: "adminReorderQuestions",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminReorderQuestions.__executeServer(opts));
var adminReorderQuestions = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	orderedIds: arrayType(numberType().int().min(1)).min(1)
}).parse(data)).handler(adminReorderQuestions_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, reorderQuestionsImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await reorderQuestionsImpl(data.orderedIds);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "שינוי הסדר נכשל.");
	}
});
var adminRestoreDefaults_createServerFn_handler = createServerRpc({
	id: "a3487d5b29d6ab35b19d4ff317bed9d4e393f07779c2c6b1aa317d3fd9d8902a",
	name: "adminRestoreDefaults",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminRestoreDefaults.__executeServer(opts));
var adminRestoreDefaults = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(adminRestoreDefaults_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, restoreDefaultQuestionsImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await restoreDefaultQuestionsImpl();
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "שחזור השאלות נכשל.");
	}
});
var adminGetSettings_createServerFn_handler = createServerRpc({
	id: "6b533370e07b251c5a5dd40ac56f2ab94fcc70285fb22480d29bdd6508c382b9",
	name: "adminGetSettings",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminGetSettings.__executeServer(opts));
var adminGetSettings = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(adminGetSettings_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, getSettingsImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await getSettingsImpl();
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "טעינת ההגדרות נכשלה.");
	}
});
var adminSetDefaultDuration_createServerFn_handler = createServerRpc({
	id: "fe5c2e6369633b83c50bc72b575f4a4f01bc898c8e7bd2c382bc4bc54a7478b6",
	name: "adminSetDefaultDuration",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetDefaultDuration.__executeServer(opts));
var adminSetDefaultDuration = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	seconds: numberType().int().min(5).max(120)
}).parse(data)).handler(adminSetDefaultDuration_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, setDefaultDurationImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await setDefaultDurationImpl(data.seconds);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "שמירת ההגדרה נכשלה.");
	}
});
var adminSetShowInsights_createServerFn_handler = createServerRpc({
	id: "30f64ef6382d5872c9b6debddb14c7c3c0df8a825462cb7e054d9fcc541acf28",
	name: "adminSetShowInsights",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminSetShowInsights.__executeServer(opts));
var adminSetShowInsights = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	show: booleanType()
}).parse(data)).handler(adminSetShowInsights_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, setShowInsightsImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await setShowInsightsImpl(data.show);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "שמירת ההגדרה נכשלה.");
	}
});
var adminUploadLogo_createServerFn_handler = createServerRpc({
	id: "2e8bb4649aab596480b49513c8d600df79a2c683d20404b7ce0da3c90bee35cf",
	name: "adminUploadLogo",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminUploadLogo.__executeServer(opts));
var adminUploadLogo = createServerFn({ method: "POST" }).inputValidator((data) => objectType({
	passcode,
	fileName: stringType().min(1).max(200),
	contentType: stringType().min(1).max(100),
	base64: stringType().min(1)
}).parse(data)).handler(adminUploadLogo_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, uploadLogoImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await uploadLogoImpl(data);
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "העלאת הלוגו נכשלה.");
	}
});
var adminRemoveLogo_createServerFn_handler = createServerRpc({
	id: "8bb1fa3198bfd5ff1a40cb8d43aec90e17eba9abbca0ab0ec19f582c976df48d",
	name: "adminRemoveLogo",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminRemoveLogo.__executeServer(opts));
var adminRemoveLogo = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(adminRemoveLogo_createServerFn_handler, async ({ data }) => {
	const { assertAdmin, removeLogoImpl } = await import("./admin.server-D6s3aPbW.mjs");
	const { GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await removeLogoImpl();
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "הסרת הלוגו נכשלה.");
	}
});
var adminCreateGame_createServerFn_handler = createServerRpc({
	id: "df766c6c1cf85b6080d1bf30111b4ab3d8c4806cc7cab9a65570d5c9be053b77",
	name: "adminCreateGame",
	filename: "src/lib/admin.functions.ts"
}, (opts) => adminCreateGame.__executeServer(opts));
var adminCreateGame = createServerFn({ method: "POST" }).inputValidator((data) => objectType({ passcode }).parse(data)).handler(adminCreateGame_createServerFn_handler, async ({ data }) => {
	const { assertAdmin } = await import("./admin.server-D6s3aPbW.mjs");
	const { createGameImpl, GameError } = await import("./game.server-B0IJnBGm.mjs");
	try {
		assertAdmin(data.passcode);
		return await createGameImpl();
	} catch (error) {
		throw new Error(error instanceof GameError ? error.message : "יצירת המשחק נכשלה.");
	}
});
//#endregion
export { adminCreateGame_createServerFn_handler, adminCreateQuestion_createServerFn_handler, adminDeleteQuestion_createServerFn_handler, adminGetSettings_createServerFn_handler, adminListQuestions_createServerFn_handler, adminLogin_createServerFn_handler, adminRemoveLogo_createServerFn_handler, adminRemoveQuestionImage_createServerFn_handler, adminReorderQuestions_createServerFn_handler, adminRestoreDefaults_createServerFn_handler, adminSaveQuestion_createServerFn_handler, adminSetDefaultDuration_createServerFn_handler, adminSetQuestionEnabled_createServerFn_handler, adminSetShowInsights_createServerFn_handler, adminUploadLogo_createServerFn_handler, adminUploadQuestionImage_createServerFn_handler };
