// The approved default dataset for סיכום חציון א' 2026 (updated 26.8.26).
// Values, answers and correct keys must not be altered.
// Question 12 is intentionally an empty placeholder — a slot to be filled in the
// admin console before the event (isPlaceholder + disabled).
import type { AnswerId, QuestionCategory } from "@/lib/quiz";

export type DefaultQuestion = {
  order: number;
  category: QuestionCategory;
  durationSeconds: number;
  pairId: number | null;
  title: string;
  answers: [string, string, string, string];
  correctAnswerId: AnswerId;
  // Optional "עובדה מעניינת" shown on the big screen after this question's
  // results and before the ranking. Enabled per question.
  funFact?: string | null;
  funFactEnabled?: boolean;
  isPlaceholder?: boolean;
  isEnabled?: boolean;
};

export const DEFAULT_QUESTIONS: DefaultQuestion[] = [
  {
    order: 1,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: 'מספר החיילים העולים שהתגייסו לצה"ל במהלך החציון הראשון של שנת 2026?',
    answers: ["702", "1,206", "3,478", "214"],
    correctAnswerId: "B",
  },
  {
    order: 2,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title: 'מה היה אחוז העולים שדיווחו על שביעות רצון גבוהה ומאוד גבוהה מהליך הקליטה בנתב"ג בחציון א\'?',
    answers: ["62%", "מי בכלל מודד מדדי תוצאה של שביעות רצון?", "73.2%", "94.5%"],
    correctAnswerId: "D",
  },
  {
    order: 3,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title: "כמה עולים עזבו את מרכזי הקליטה ועברו למגורי קבע בקהילה בחצי השנה הראשונה של שנת 2026?",
    answers: ["450 עולים", "700 עולים", "950 עולים", "1,300 עולים"],
    correctAnswerId: "B",
    funFact: "לאן הם עברו / מתוך כמה שמתגוררים במרכזי קליטה?",
    funFactEnabled: true,
  },
  {
    order: 4,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: "לאיזו מהערים הבאות הגיעו בשנת 2026 המספר הגדול ביותר של עולים ממדינות המערב?",
    answers: ["נתניה", "ירושלים", "תל-אביב", "חדרה"],
    correctAnswerId: "C",
    funFact: "השנה הגיעו לתל אביב כבר כ-1,846 עולים!",
    funFactEnabled: true,
  },
  {
    order: 5,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title: "במסגרת ירידים שהתקיימו ברחבי העולם בשנת 2026 הופצו מוצרי פרסום ב-50 מהם. מה מבין הבאים הוא מדד תוצאה המודד את האפקטיביות של המהלך?",
    answers: [
      "הדפסת 10,000 עלוני פרסום נוספים ב-4 שפות",
      "הגדלת מספר הירידים בהם המשרד ייקח חלק בשנה הבאה ל-60",
      "הגדלת המסגרת התקציבית המיועדת למוצרי פרסום",
      "גידול של 20% במספר המשתתפים ביריד שנרשמו לייעוץ עלייה אישי בעקבות החשיפה",
    ],
    correctAnswerId: "D",
  },
  {
    order: 6,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: "כמה עולים הגיעו לישראל בשנת 2026 ממדינות שבהן מופעל מערך הליווי לעידוד עלייה?",
    answers: ["1,200 עולים", "1,650 עולים", "2,005 עולים", "3,100 עולים"],
    correctAnswerId: "C",
  },
  {
    order: 7,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: 'מהן שלושת הרשויות בהן מספר הקבוצות של תכנית פל"א הוא הגבוה ביותר בשנת 2026?',
    answers: [
      "תל אביב, אשקלון ונתניה",
      "ירושלים, אשקלון ובית שמש",
      "בית שמש, באר שבע ומודיעין",
      "מודיעין, תל אביב ובאר שבע",
    ],
    correctAnswerId: "B",
    funFact: 'בשלוש הרשויות נפתחו סך הכל 61 כיתות של תכנית פל"א, כאשר המובילה היא ירושלים עם 27 כיתות!',
    funFactEnabled: true,
  },
  {
    order: 8,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: 'כמה מסגרות ליווי קהילתיות הוקמו לטובת צעירים יוצאי ברה"מ לשעבר במסגרת רשת א.ד.מ.ה?',
    answers: ["10", "13", "15", "12"],
    correctAnswerId: "C",
    funFact: "מדובר על הקמה של 25% יותר קהילות מהיעד השנתי שהוגדר!",
    funFactEnabled: true,
  },
  {
    order: 9,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: "כמה רופאים השתתפו בקורסי עברית טרום-עלייה שהופעלו בחציון א'?",
    answers: ["20 רופאים", "40 רופאים", "65 רופאים", "100 רופאים"],
    correctAnswerId: "B",
  },
  {
    order: 10,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title: "40 רופאים משתתפים בקורסי עברית טרום-עלייה. מהו מדד התוצאה שיש למדוד לאחר עלייתם לארץ?",
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
    pairId: null,
    title: 'מה מספר העולים והתושבים החוזרים שקיבלו ליווי עסקי במסגרת מרכזי ייעוץ עסקי מעלו"ת במהלך החציון הראשון של 2026?',
    answers: ["2,987", "3,525", "1,987", "2,643"],
    correctAnswerId: "A",
    funFact: "בחציון הראשון הושגו כבר 84% מערך היעד השנתי שהוגדר!",
    funFactEnabled: true,
  },
  {
    // Empty placeholder — a slot to insert the budget question in the admin
    // console. Disabled so it does not appear in the game until filled + enabled.
    order: 12,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: "",
    answers: ["", "", "", ""],
    correctAnswerId: "A",
    isPlaceholder: true,
    isEnabled: false,
  },
  {
    order: 13,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: "כמה מועמדי עלייה פנו למנהל הסטודנטים לקבלת שירות טרום-עלייה ב-2026?",
    answers: ["3,400 פונים", "4,800 פונים", "5,278 פונים", "6,500 פונים"],
    correctAnswerId: "C",
  },
  {
    order: 14,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title: "רשמנו 5,278 פניות של צעירים בשירות טרום-עלייה - שזה כבר מעבר ליעד השנתי שהוגדר! אבל, איך נוכל להפוך את הנתון הזה למדד תוצאה?",
    answers: [
      "הגדלת יעד הפניות בחציון ב' ל-7,000 צעירים (במקום 5,000 כפי שמוגדר כיום)",
      "הגדלת מספר הפניות היזומות של מנהל הסטודנטים למועמדי עלייה ל-7,000",
      "אחוז הפונים שפתחו תיק עלייה בפועל והשלימו את הליך העלייה לטובת לימודים אקדמאיים עד לשנת הלימודים הבאה",
      "גיוס 5 מלווי עולים נוספים שיובילו את הטיפול והסיוע לאותם מועמדי עלייה",
    ],
    correctAnswerId: "C",
  },
];
