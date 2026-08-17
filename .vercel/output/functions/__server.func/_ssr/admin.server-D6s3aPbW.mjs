import { GameError, n as adminStorage, t as adminDb } from "./game.server-B0IJnBGm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.server-D6s3aPbW.js
var DEFAULT_QUESTIONS = [
	{
		order: 1,
		category: "OUTCOME",
		durationSeconds: 30,
		pairId: null,
		title: "כמה עולים חדשים שולבו בהצלחה בעבודה בסיום תוכנית \"עלייה 2000\" במהלך חציון א' 2026?",
		answers: [
			"550 עולים",
			"620 עולים",
			"772 עולים",
			"810 עולים"
		],
		correctAnswerId: "C"
	},
	{
		order: 2,
		category: "OUTCOME",
		durationSeconds: 30,
		pairId: null,
		title: "כמה עולים עזבו את מרכזי הקליטה ועברו למגורי קבע בקהילה בחצי השנה הראשונה?",
		answers: [
			"450 עולים",
			"700 עולים",
			"950 עולים",
			"1,300 עולים"
		],
		correctAnswerId: "B"
	},
	{
		order: 3,
		category: "OUTCOME",
		durationSeconds: 30,
		pairId: null,
		title: "מה היה אחוז העולים שדיווחו על שביעות רצון גבוהה ומאוד גבוהה מהליך הקליטה בנתב\"ג בחציון א'?",
		answers: [
			"82.0%",
			"88.5%",
			"90.0%",
			"94.5%"
		],
		correctAnswerId: "D"
	},
	{
		order: 4,
		category: "OUTCOME",
		durationSeconds: 30,
		pairId: null,
		title: "כמה עולים בחרו לקבוע את ביתם ב-5 יישובי המטרה בדרום - קריית גת, אשקלון, שדרות, באר שבע ואילת - בחציון א'?",
		answers: [
			"320 עולים",
			"587 עולים",
			"740 עולים",
			"1,100 עולים"
		],
		correctAnswerId: "B"
	},
	{
		order: 5,
		category: "OUTPUT",
		durationSeconds: 20,
		pairId: 1,
		title: "כמה כיתות \"פלא ועל\" חדשות לתגבור עברית ולימודים לילדים ונוער נפתחו בעיר תל אביב בחציון א'?",
		answers: [
			"כיתה 1",
			"2 כיתות",
			"3 כיתות",
			"5 כיתות"
		],
		correctAnswerId: "C"
	},
	{
		order: 6,
		category: "OUTCOME",
		durationSeconds: 30,
		pairId: 1,
		title: "נפתחו 3 כיתות \"פלא ועל\" חדשות. מהו מדד התוצאה (Outcome) האמיתי שתרצה ההנהלה למדוד בחציון הבא עבור תוכנית זו?",
		answers: [
			"פתיחת 2 כיתות נוספות בחציון ב'",
			"עלייה של 30% בציוני העברית והשתלבות נורמטיבית של התלמידים בבתי הספר",
			"קיום 15 סדנאות תגבור נוספות במהלך השנה",
			"רכישת 50 ספרי לימוד חדשים לכיתות"
		],
		correctAnswerId: "B"
	},
	{
		order: 7,
		category: "OUTPUT",
		durationSeconds: 20,
		pairId: 2,
		title: "כמה פגישות מ.י.ם (מיפוי, ייעוץ ומעקב) קוימו עם משפחות עולים במרכזי הקליטה במהלך חציון א'?",
		answers: [
			"65 פגישות",
			"85 פגישות",
			"110 פגישות",
			"180 פגישות"
		],
		correctAnswerId: "C"
	},
	{
		order: 8,
		category: "OUTCOME",
		durationSeconds: 30,
		pairId: 2,
		title: "קוימו 110 פגישות מ.י.ם עם משפחות עולים. איזה מהמדדים הבאים מייצג מדד תוצאה (Outcome) של פגישות אלו?",
		answers: [
			"הגדלת מספר הפגישות ל-150 בחציון הבא",
			"אחוז העולים שגובשה עבורם תוכנית קליטה אישית שמומשה בהצלחה תוך 6 חודשים",
			"הרחבת המערך וביצוע פגישות ל-50 משפחות נוספות",
			"הדפסת 200 ערכות מידע לחלוקה בפגישות"
		],
		correctAnswerId: "B"
	},
	{
		order: 9,
		category: "OUTPUT",
		durationSeconds: 20,
		pairId: 3,
		title: "כמה רופאים השתתפו בקורסי עברית טרום-עלייה שהופעלו בחציון א'?",
		answers: [
			"20 רופאים",
			"40 רופאים",
			"65 רופאים",
			"100 רופאים"
		],
		correctAnswerId: "B"
	},
	{
		order: 10,
		category: "OUTCOME",
		durationSeconds: 30,
		pairId: 3,
		title: "40 רופאים משתתפים בקורסי עברית טרום-עלייה. מהו מדד התוצאה (Outcome) שיש למדוד לאחר עלייתם לארץ?",
		answers: [
			"פתיחת 3 קורסי עברית נוספים לרופאים בחו\"ל",
			"אחוז הרופאים שעברו בהצלחה את בחינת הרישוי והשתלבו במערכת הבריאות תוך שנה",
			"הגדלת מכסת המשתתפים בקורסים ל-60 רופאים",
			"הגדלת התקציב לקורסי עברית ב-15%"
		],
		correctAnswerId: "B"
	},
	{
		order: 11,
		category: "OUTPUT",
		durationSeconds: 20,
		pairId: 4,
		title: "כמה עולים הגיעו לישראל בחציון א' ממדינות שבהן מופעל מערך הליווי לעידוד עלייה?",
		answers: [
			"1,200 עולים",
			"1,650 עולים",
			"2,005 עולים",
			"3,100 עולים"
		],
		correctAnswerId: "C"
	},
	{
		order: 12,
		category: "OUTCOME",
		durationSeconds: 30,
		pairId: 4,
		title: "2,005 עולים עלו ממדינות מערך הליווי. איזה מדד יגדיר תוצאה ואימפקט ארוך טווח של פעילות המערך?",
		answers: [
			"הגדלת כמות פגישות ההסברה בחו\"ל ב-20%",
			"שיעור העולים ממדינות אלו שהשתקעו בישראל ודיווחו על קליטה מוצלחת לאחר 3 שנים",
			"ניצול מלא של תקציב הפרסום של מערך הליווי",
			"הנפקת 3,000 תעודות זכאות בחו\"ל"
		],
		correctAnswerId: "B"
	},
	{
		order: 13,
		category: "OUTPUT",
		durationSeconds: 20,
		pairId: 5,
		title: "כמה מועמדי עלייה צעירים פנו לקבלת שירות טרום-עלייה בחציון א' 2026?",
		answers: [
			"3,400 פונים",
			"4,800 פונים",
			"5,278 פונים",
			"6,500 פונים"
		],
		correctAnswerId: "C"
	},
	{
		order: 14,
		category: "OUTCOME",
		durationSeconds: 30,
		pairId: 5,
		title: "רשמנו 5,278 פניות של צעירים בשירות טרום-עלייה. איך נהפוך את הנתון הזה למדד תוצאה (Outcome)?",
		answers: [
			"הגדלת יעד הפניות בחציון ב' ל-7,000 צעירים",
			"אחוז הפונים שפתחו תיק עלייה בפועל והמשיכו לתהליך מימוש תוך 90 יום",
			"קיצור זמן ההמתנה למענה טלפוני במוקד ל-2 דקות",
			"גיוס 3 נציגי שירות נוספים למוקד"
		],
		correctAnswerId: "B"
	},
	{
		order: 15,
		category: "OUTPUT",
		durationSeconds: 20,
		pairId: 6,
		title: "בכמה ירידי עלייה ברחבי העולם הופצו מוצרי פרסום והסברה משרדיים בחציון א'?",
		answers: [
			"25 ירידים",
			"38 ירידים",
			"50 ירידים",
			"65 ירידים"
		],
		correctAnswerId: "C"
	},
	{
		order: 16,
		category: "OUTCOME",
		durationSeconds: 30,
		pairId: 6,
		title: "הופצו מוצרי פרסום ב-50 ירידים בעולם. מה מבין הבאים הוא מדד תוצאה (Outcome) המודד את האפקטיביות של המהלך?",
		answers: [
			"הדפסת 10,000 עלוני פרסום נוספים ב-4 שפות",
			"גידול של 20% במספר המשתתפים ביריד שנרשמו לייעוץ עלייה אישי בעקבות החשיפה",
			"השתתפות ב-60 ירידים בשנה הבאה",
			"שמירה על מסגרת התקציב שהוקצתה למוצרי פרסום"
		],
		correctAnswerId: "B"
	}
];
function assertAdmin(passcode) {
	const expected = process.env["ADMIN_PASSCODE"];
	if (!expected) throw new GameError("CONFIG", "קוד הניהול לא הוגדר במערכת.");
	const a = new TextEncoder().encode(passcode ?? "");
	const b = new TextEncoder().encode(expected);
	let diff = a.length ^ b.length;
	for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
	if (diff !== 0) throw new GameError("FORBIDDEN", "קוד ניהול שגוי.");
}
async function listAdminQuestions() {
	try {
		const qSnap = await adminDb.collection("questions").orderBy("orderIndex").get();
		const keysSnap = await adminDb.collection("question_keys").get();
		const keyMap = new Map(keysSnap.docs.map((d) => [d.id, d.data()]));
		return qSnap.docs.map((doc) => {
			const q = doc.data();
			const key = keyMap.get(doc.id);
			return {
				id: Number(doc.id),
				category: q.category,
				pairId: q.pairId ?? null,
				title: q.title || "",
				subtitle: q.subtitle ?? null,
				answers: q.answers || [],
				durationSeconds: q.durationSeconds ?? 30,
				scoringMode: q.scoringMode || "QUIZ",
				executiveInsight: q.executiveInsight ?? null,
				isPlaceholder: q.isPlaceholder ?? false,
				imageUrl: q.imageUrl ?? null,
				correctAnswerId: key?.correctAnswerId ?? "A",
				explanation: key?.explanation ?? null,
				orderIndex: q.orderIndex ?? 0,
				isEnabled: q.isEnabled ?? true
			};
		});
	} catch (error) {
		throw new GameError("DB_ERROR", error.message);
	}
}
async function saveQuestionImpl(input) {
	if (!input.title.trim()) throw new GameError("INVALID", "לשאלה חייבת להיות כותרת.");
	const qRef = adminDb.collection("questions").doc(String(input.id));
	const keyRef = adminDb.collection("question_keys").doc(String(input.id));
	const answers = [
		{
			id: "A",
			text: input.answerA.trim()
		},
		{
			id: "B",
			text: input.answerB.trim()
		},
		{
			id: "C",
			text: input.answerC.trim()
		},
		{
			id: "D",
			text: input.answerD.trim()
		}
	];
	const updateData = {
		category: input.category,
		title: input.title.trim(),
		subtitle: input.subtitle?.trim() || null,
		answers,
		durationSeconds: input.durationSeconds,
		scoringMode: input.scoringMode,
		executiveInsight: input.executiveInsight?.trim() || null,
		isPlaceholder: input.isPlaceholder,
		pairId: input.pairId ?? null
	};
	if (input.isEnabled !== void 0) updateData.isEnabled = input.isEnabled;
	try {
		await adminDb.runTransaction(async (t) => {
			t.set(qRef, updateData, { merge: true });
			t.set(keyRef, {
				questionId: input.id,
				correctAnswerId: input.correctAnswerId,
				explanation: input.explanation?.trim() || null
			}, { merge: true });
		});
		return { ok: true };
	} catch (error) {
		throw new GameError("DB_ERROR", error.message);
	}
}
async function createQuestionImpl() {
	try {
		const qSnap = await adminDb.collection("questions").orderBy("orderIndex", "desc").limit(1).get();
		let nextOrder = 1;
		if (!qSnap.empty) nextOrder = (qSnap.docs[0].data().orderIndex ?? 0) + 1;
		const { defaultDurationSeconds } = await getSettingsImpl();
		const ids = (await adminDb.collection("questions").get()).docs.map((d) => Number(d.id)).filter((id) => !isNaN(id));
		const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
		const qRef = adminDb.collection("questions").doc(String(nextId));
		const keyRef = adminDb.collection("question_keys").doc(String(nextId));
		await adminDb.runTransaction(async (t) => {
			t.set(qRef, {
				id: nextId,
				category: "OUTPUT",
				title: "שאלה חדשה",
				answers: [
					{
						id: "A",
						text: "תשובה א"
					},
					{
						id: "B",
						text: "תשובה ב"
					},
					{
						id: "C",
						text: "תשובה ג"
					},
					{
						id: "D",
						text: "תשובה ד"
					}
				],
				durationSeconds: defaultDurationSeconds,
				scoringMode: "QUIZ",
				isPlaceholder: true,
				orderIndex: nextOrder,
				isEnabled: true
			});
			t.set(keyRef, {
				questionId: nextId,
				correctAnswerId: "A",
				explanation: null
			});
		});
		return { id: nextId };
	} catch (error) {
		throw new GameError("DB_ERROR", error.message);
	}
}
async function deleteQuestionImpl(questionId) {
	try {
		await adminDb.runTransaction(async (t) => {
			t.delete(adminDb.collection("questions").doc(String(questionId)));
			t.delete(adminDb.collection("question_keys").doc(String(questionId)));
		});
		return { ok: true };
	} catch (error) {
		throw new GameError("DB_ERROR", error.message);
	}
}
async function setQuestionEnabledImpl(questionId, isEnabled) {
	try {
		await adminDb.collection("questions").doc(String(questionId)).update({ isEnabled });
		return { ok: true };
	} catch (error) {
		throw new GameError("DB_ERROR", error.message);
	}
}
async function reorderQuestionsImpl(orderedIds) {
	try {
		await adminDb.runTransaction(async (t) => {
			for (let i = 0; i < orderedIds.length; i++) {
				const ref = adminDb.collection("questions").doc(String(orderedIds[i]));
				t.update(ref, { orderIndex: i + 1 });
			}
		});
		return { ok: true };
	} catch (error) {
		throw new GameError("DB_ERROR", error.message);
	}
}
async function restoreDefaultQuestionsImpl() {
	try {
		const batch = adminDb.batch();
		(await adminDb.collection("questions").get()).docs.forEach((doc) => batch.delete(doc.ref));
		(await adminDb.collection("question_keys").get()).docs.forEach((doc) => batch.delete(doc.ref));
		for (const q of DEFAULT_QUESTIONS) {
			const qRef = adminDb.collection("questions").doc(String(q.id));
			const kRef = adminDb.collection("question_keys").doc(String(q.id));
			const answers = [
				{
					id: "A",
					text: q.answers[0]
				},
				{
					id: "B",
					text: q.answers[1]
				},
				{
					id: "C",
					text: q.answers[2]
				},
				{
					id: "D",
					text: q.answers[3]
				}
			];
			batch.set(qRef, {
				id: q.id,
				category: q.category,
				pairId: q.pairId,
				title: q.title,
				subtitle: null,
				answers,
				durationSeconds: q.durationSeconds,
				scoringMode: "QUIZ",
				executiveInsight: null,
				isPlaceholder: false,
				orderIndex: q.order,
				isEnabled: true
			});
			batch.set(kRef, {
				questionId: q.id,
				correctAnswerId: q.correctAnswerId,
				explanation: null
			});
		}
		await batch.commit();
		return { count: DEFAULT_QUESTIONS.length };
	} catch (error) {
		throw new GameError("DB_ERROR", error.message);
	}
}
function decodeBase64(base64) {
	return Buffer.from(base64, "base64");
}
async function uploadToBucket(path, bytes, contentType) {
	try {
		const file = adminStorage.bucket().file(path);
		await file.save(bytes, {
			metadata: { contentType },
			public: true
		});
		const [url] = await file.getSignedUrl({
			action: "read",
			expires: "01-01-2099"
		});
		return url;
	} catch (error) {
		throw new GameError("STORAGE", error.message);
	}
}
async function uploadQuestionImageImpl(input) {
	const bytes = decodeBase64(input.base64);
	if (bytes.byteLength > 6e6) throw new GameError("TOO_LARGE", "התמונה גדולה מדי (עד 6MB).");
	const ext = (input.fileName.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
	const url = await uploadToBucket(`question-images/q${input.questionId}/${Date.now()}.${ext || "png"}`, bytes, input.contentType);
	await adminDb.collection("questions").doc(String(input.questionId)).update({ imageUrl: url });
	return { imageUrl: url };
}
async function removeQuestionImageImpl(questionId) {
	try {
		await adminDb.collection("questions").doc(String(questionId)).update({ imageUrl: null });
		return { ok: true };
	} catch (error) {
		throw new GameError("DB_ERROR", error.message);
	}
}
var LOGO_KEY = "org_logo_url";
var DURATION_KEY = "default_duration_seconds";
var SHOW_INSIGHTS_KEY = "show_insights";
async function getSettingsImpl() {
	try {
		const map = (await adminDb.collection("settings").doc("global").get()).data() || {};
		const parsed = Number(map[DURATION_KEY]);
		return {
			logoUrl: map["org_logo_url"] ?? null,
			defaultDurationSeconds: Number.isFinite(parsed) && parsed > 0 ? parsed : 30,
			showInsights: map[SHOW_INSIGHTS_KEY] !== false
		};
	} catch (error) {
		return {
			logoUrl: null,
			defaultDurationSeconds: 30,
			showInsights: true
		};
	}
}
async function setDefaultDurationImpl(seconds) {
	if (seconds < 5 || seconds > 120 || seconds % 5 !== 0) throw new GameError("INVALID", "זמן ברירת המחדל חייב להיות בין 5 ל-120 שניות בקפיצות של 5.");
	await adminDb.collection("settings").doc("global").set({
		[DURATION_KEY]: seconds,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { merge: true });
	return { defaultDurationSeconds: seconds };
}
async function setShowInsightsImpl(show) {
	await adminDb.collection("settings").doc("global").set({
		[SHOW_INSIGHTS_KEY]: show,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { merge: true });
	return { showInsights: show };
}
async function uploadLogoImpl(input) {
	const bytes = decodeBase64(input.base64);
	if (bytes.byteLength > 4e6) throw new GameError("TOO_LARGE", "הקובץ גדול מדי (עד 4MB).");
	const ext = (input.fileName.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "");
	const url = await uploadToBucket(`logos/${Date.now()}.${ext || "png"}`, bytes, input.contentType);
	await adminDb.collection("settings").doc("global").set({
		[LOGO_KEY]: url,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { merge: true });
	return { logoUrl: url };
}
async function removeLogoImpl() {
	await adminDb.collection("settings").doc("global").set({
		[LOGO_KEY]: null,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { merge: true });
	return { ok: true };
}
//#endregion
export { assertAdmin, createQuestionImpl, deleteQuestionImpl, getSettingsImpl, listAdminQuestions, removeLogoImpl, removeQuestionImageImpl, reorderQuestionsImpl, restoreDefaultQuestionsImpl, saveQuestionImpl, setDefaultDurationImpl, setQuestionEnabledImpl, setShowInsightsImpl, uploadLogoImpl, uploadQuestionImageImpl };
