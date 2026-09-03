// The approved default dataset for סיכום חציון א' 2026 (source: "שאלות לחלק
// הנתונים- 1.9.26.docx"). Values, answers and correct keys are transcribed
// exactly from the document — do not alter them. 12 questions, no placeholder.
// Two source spelling typos were corrected with the operator's approval:
// Q6 "הליוויי"→"הליווי" and Q3 fun fact "עוברו"→"עברו". Q8 has no marked
// answer in the source; its correct key (B) was confirmed by the operator.
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
    title: 'מה מספר החיילים העולים שהתגייסו לצה"ל במהלך החציון הראשון של שנת 2026?',
    answers: ["702", "1,325", "3,478", "214"],
    correctAnswerId: "B",
    funFact:
      "בתקופה המקבילה אשתקד התגייסו 1,471 חיילים עולים, כאשר 47% מהם במעמד חיילים בודדים, לעומת השנה שבה 44% בלבד הם במעמד זה.",
    funFactEnabled: true,
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
    category: "OUTPUT",
    durationSeconds: 30,
    pairId: null,
    title:
      "בתחילת 2026 היו כ-3,700 עולים יוצאי אתיופיה במרכזי הקליטה ברחבי הארץ. כמה מהם עזבו את מרכזי הקליטה ועברו למגורי קבע בקהילה בחצי השנה הראשונה של שנת 2026?",
    answers: ["462 עולים", "987 עולים", "954 עולים", "1,311 עולים"],
    correctAnswerId: "B",
    funFact: "90% מהעולים עברו לערים: באר שבע, אשקלון, קרית גת וקריות חיפה",
    funFactEnabled: true,
  },
  {
    order: 4,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: "לאיזו מהערים הבאות הגיעו בשנת 2026 המספר הגדול ביותר של עולים ממדינות המערב?",
    answers: ["נתניה", "ירושלים", "תל-אביב", "בית שמש וסביבתה"],
    correctAnswerId: "B",
    funFact:
      "למרות שירושלים הינה העיר המובילה בקליטת עולים מבריטניה החל משנת 2020, ניתן לראות השנה היפוך מגמה כך שדווקא תל אביב קלטה 20% מעולי המדינה (לעומת 14% שקלטה ירושלים).",
    funFactEnabled: true,
  },
  {
    order: 5,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title:
      "במסגרת ירידים שהתקיימו ברחבי העולם בשנת 2026 הופצו מוצרי פרסום ב-50 מהם. מה מבין הבאים הוא מדד תוצאה המודד את האפקטיביות של המהלך?",
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
    funFact:
      "אמנם, שלוש הערים המובילות בקליטת עלייה ממדינות אלו הינן נתניה, ירושלים ותל אביב ב-5 השנים האחרונות, אבל ניתן לראות שרעננה מציגה השנה עלייה משמעותית בשיעור העולים הנקלטים בה, מ-7% ב-2025 ל-11%. בבחינת מועצות איזוריות, ניתן לראות שמטה אשר מציגה גידול של פי 3 במספר העולים המגיעים אליה (למרות המצב הביטחוני)!",
    funFactEnabled: true,
  },
  {
    order: 7,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: "כמה מועמדי עלייה פנו למנהל הסטודנטים לקבלת שירות טרום-עלייה ב-2026?",
    answers: ["3,400 פונים", "4,800 פונים", "5,278 פונים", "6,500 פונים"],
    correctAnswerId: "C",
  },
  {
    order: 8,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: 'מהן שלושת הרשויות בהן מספר הקבוצות של תכנית פל"א הוא הגבוה ביותר בשנת 2026?',
    answers: [
      "תל אביב, אשקלון ונתניה",
      "ירושלים, אשקלון ובית שמש",
      "בית שמש, באר שבע, ומודיעין",
      "מודיעין, תל אביב, באר שבע",
    ],
    // NOTE: the source document does not mark a correct answer for this question.
    // Set to "ירושלים, אשקלון ובית שמש" (B) per the operator's prior confirmation
    // and the fun fact (ירושלים leads with 27 classes). Verify before the event.
    correctAnswerId: "B",
    funFact: 'בשלוש הרשויות נפתחו סך הכל 61 כיתות של תכנית פל"א כאשר המובילה היא ירושלים עם 27 כיתות!',
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
    title: "בכמה אחוזים קוצץ תקציב הפעילות של המשרד מאז סוף שנת 2025?",
    answers: ["8%", "14%", "20%", "26%"],
    correctAnswerId: "D",
  },
  {
    order: 12,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: 'כמה מסגרות ליווי קהילתיות הוקמו לטובת צעירים יוצאי ברה"מ לשעבר במסגרת רשת א.ד.מ.ה?',
    answers: ["10", "13", "15", "12"],
    correctAnswerId: "C",
    funFact: "מדובר על הקמה של 25% יותר קהילות מהיעד השנתי שהוגדר!",
    funFactEnabled: true,
  },
];
