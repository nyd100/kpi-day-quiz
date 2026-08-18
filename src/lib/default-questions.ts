// The approved default dataset: 16 real KPI questions for סיכום חציון א' 2026.
// Values, answers and correct keys must not be altered.
import type { AnswerId, QuestionCategory } from "@/lib/quiz";

export type DefaultQuestion = {
  order: number;
  category: QuestionCategory;
  durationSeconds: number;
  pairId: number | null;
  title: string;
  answers: [string, string, string, string];
  correctAnswerId: AnswerId;
};

export const DEFAULT_QUESTIONS: DefaultQuestion[] = [
  {
    order: 1,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title:
      'כמה עולים חדשים שולבו בהצלחה בעבודה בסיום תוכנית "עלייה 2000" במהלך חציון א\' 2026?',
    answers: ["550 עולים", "620 עולים", "772 עולים", "810 עולים"],
    correctAnswerId: "C",
  },
  {
    order: 2,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title: "כמה עולים עזבו את מרכזי הקליטה ועברו למגורי קבע בקהילה בחצי השנה הראשונה?",
    answers: ["450 עולים", "700 עולים", "950 עולים", "1,300 עולים"],
    correctAnswerId: "B",
  },
  {
    order: 3,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title:
      "מה היה אחוז העולים שדיווחו על שביעות רצון גבוהה ומאוד גבוהה מהליך הקליטה בנתב\"ג בחציון א'?",
    answers: ["82.0%", "88.5%", "90.0%", "94.5%"],
    correctAnswerId: "D",
  },
  {
    order: 4,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title:
      "כמה עולים בחרו לקבוע את ביתם ב-5 יישובי המטרה בדרום - קריית גת, אשקלון, שדרות, באר שבע ואילת - בחציון א'?",
    answers: ["320 עולים", "587 עולים", "740 עולים", "1,100 עולים"],
    correctAnswerId: "B",
  },
  {
    order: 5,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: 1,
    title:
      'כמה כיתות פל״א ויע״ל חדשות לתגבור עברית ולימודים לילדים ונוער נפתחו בעיר תל אביב בחציון א\'?',
    answers: ["כיתה 1", "2 כיתות", "3 כיתות", "5 כיתות"],
    correctAnswerId: "C",
  },
  {
    order: 6,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: 1,
    title:
      'נפתחו 3 כיתות פל״א ויע״ל חדשות. מהו מדד התוצאה (Outcome) האמיתי שתרצה ההנהלה למדוד בחציון הבא עבור תוכנית זו?',
    answers: [
      "פתיחת 2 כיתות נוספות בחציון ב'",
      "עלייה של 30% בציוני העברית והשתלבות נורמטיבית של התלמידים בבתי הספר",
      "קיום 15 סדנאות תגבור נוספות במהלך השנה",
      "רכישת 50 ספרי לימוד חדשים לכיתות",
    ],
    correctAnswerId: "B",
  },
  {
    order: 7,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: 2,
    title:
      "כמה פגישות מ.י.ם (מיפוי, ייעוץ ומעקב) קוימו עם משפחות עולים במרכזי הקליטה במהלך חציון א'?",
    answers: ["65 פגישות", "85 פגישות", "110 פגישות", "180 פגישות"],
    correctAnswerId: "C",
  },
  {
    order: 8,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: 2,
    title:
      "קוימו 110 פגישות מ.י.ם עם משפחות עולים. איזה מהמדדים הבאים מייצג מדד תוצאה (Outcome) של פגישות אלו?",
    answers: [
      "הגדלת מספר הפגישות ל-150 בחציון הבא",
      "אחוז העולים שגובשה עבורם תוכנית קליטה אישית שמומשה בהצלחה תוך 6 חודשים",
      "הרחבת המערך וביצוע פגישות ל-50 משפחות נוספות",
      "הדפסת 200 ערכות מידע לחלוקה בפגישות",
    ],
    correctAnswerId: "B",
  },
  {
    order: 9,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: 3,
    title: "כמה רופאים השתתפו בקורסי עברית טרום-עלייה שהופעלו בחציון א'?",
    answers: ["20 רופאים", "40 רופאים", "65 רופאים", "100 רופאים"],
    correctAnswerId: "B",
  },
  {
    order: 10,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: 3,
    title:
      "40 רופאים משתתפים בקורסי עברית טרום-עלייה. מהו מדד התוצאה (Outcome) שיש למדוד לאחר עלייתם לארץ?",
    answers: [
      'פתיחת 3 קורסי עברית נוספים לרופאים בחו"ל',
      "אחוז הרופאים שעברו בהצלחה את בחינת הרישוי והשתלבו במערכת הבריאות תוך שנה",
      "הגדלת מכסת המשתתפים בקורסים ל-60 רופאים",
      "הגדלת התקציב לקורסי עברית ב-15%",
    ],
    correctAnswerId: "B",
  },
  {
    order: 11,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: 4,
    title: "כמה עולים הגיעו לישראל בחציון א' ממדינות שבהן מופעל מערך הליווי לעידוד עלייה?",
    answers: ["1,200 עולים", "1,650 עולים", "2,005 עולים", "3,100 עולים"],
    correctAnswerId: "C",
  },
  {
    order: 12,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: 4,
    title:
      "2,005 עולים עלו ממדינות מערך הליווי. איזה מדד יגדיר תוצאה ואימפקט ארוך טווח של פעילות המערך?",
    answers: [
      'הגדלת כמות פגישות ההסברה בחו"ל ב-20%',
      "שיעור העולים ממדינות אלו שהשתקעו בישראל ודיווחו על קליטה מוצלחת לאחר 3 שנים",
      "ניצול מלא של תקציב הפרסום של מערך הליווי",
      'הנפקת 3,000 תעודות זכאות בחו"ל',
    ],
    correctAnswerId: "B",
  },
  {
    order: 13,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: 5,
    title: "כמה מועמדי עלייה צעירים פנו לקבלת שירות טרום-עלייה בחציון א' 2026?",
    answers: ["3,400 פונים", "4,800 פונים", "5,278 פונים", "6,500 פונים"],
    correctAnswerId: "C",
  },
  {
    order: 14,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: 5,
    title:
      "רשמנו 5,278 פניות של צעירים בשירות טרום-עלייה. איך נהפוך את הנתון הזה למדד תוצאה (Outcome)?",
    answers: [
      "הגדלת יעד הפניות בחציון ב' ל-7,000 צעירים",
      "אחוז הפונים שפתחו תיק עלייה בפועל והמשיכו לתהליך מימוש תוך 90 יום",
      "קיצור זמן ההמתנה למענה טלפוני במוקד ל-2 דקות",
      "גיוס 3 נציגי שירות נוספים למוקד",
    ],
    correctAnswerId: "B",
  },
  {
    order: 15,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: 6,
    title: "בכמה ירידי עלייה ברחבי העולם הופצו מוצרי פרסום והסברה משרדיים בחציון א'?",
    answers: ["25 ירידים", "38 ירידים", "50 ירידים", "65 ירידים"],
    correctAnswerId: "C",
  },
  {
    order: 16,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: 6,
    title:
      "הופצו מוצרי פרסום ב-50 ירידים בעולם. מה מבין הבאים הוא מדד תוצאה (Outcome) המודד את האפקטיביות של המהלך?",
    answers: [
      'הדפסת 10,000 עלוני פרסום נוספים ב-4 שפות',
      "גידול של 20% במספר המשתתפים ביריד שנרשמו לייעוץ עלייה אישי בעקבות החשיפה",
      "השתתפות ב-60 ירידים בשנה הבאה",
      "שמירה על מסגרת התקציב שהוקצתה למוצרי פרסום",
    ],
    correctAnswerId: "B",
  },
];

/** Informational pair metadata (survives reordering). */
export const PAIR_TOPICS: Record<number, string> = {
  1: "כיתות פל״א ויע״ל",
  2: "פגישות מ.י.ם",
  3: "רופאים וקורסי עברית טרום-עלייה",
  4: "מערך הליווי לעידוד עלייה",
  5: "שירות טרום-עלייה לצעירים",
  6: "ירידי עלייה ומוצרי פרסום",
};
