// The approved default dataset for סיכום חציון א' 2026 (source: "שאלות
// לטריויה מעודכן.docx"). Questions, answers and correct keys are transcribed
// from the document; the doubled ASCII apostrophes used as gershayim were
// normalized to ״. 13 questions. A fun fact may hold two paragraphs separated
// by a blank line (encoded as \n\n) — preserved on the big screen — and any
// **bold** span is rendered emphasized (the source has none at present).
import type { AnswerId, QuestionCategory } from "@/lib/quiz";

export type DefaultQuestion = {
  order: number;
  category: QuestionCategory;
  durationSeconds: number;
  pairId: number | null;
  title: string;
  answers: [string, string, string, string];
  correctAnswerId: AnswerId;
  funFact?: string | null;
  funFactEnabled?: boolean;
  isPlaceholder?: boolean;
  isEnabled?: boolean;
};

export const DEFAULT_QUESTIONS: DefaultQuestion[] = [
  {
    order: 1,
    category: "OUTPUT",
    durationSeconds: 30,
    pairId: null,
    title: "מי הם 1,325?",
    answers: [
      "עולים שעברו למגורי קבע",
      "חיילים עולים שהתגייסו לצה״ל",
      "מועמדי עלייה שפנו למנהל הסטודנטים",
      "עולים ממדינות שבהן פועל מערך הליווי",
    ],
    correctAnswerId: "B",
  },
  {
    order: 2,
    category: "OUTCOME",
    durationSeconds: 20,
    pairId: null,
    title: "יעד שביעות הרצון מתהליך הקליטה בנתב״ג עמד על 90%. לאן הגענו בפועל?",
    answers: [
      "62%",
      "מי בכלל מודד מדדי תוצאה של שביעות רצון?",
      "73.2%",
      "94.5%",
    ],
    correctAnswerId: "D",
  },
  {
    order: 3,
    category: "OUTPUT",
    durationSeconds: 30,
    pairId: null,
    title: "כ־3,700 עולים יוצאי אתיופיה התחילו את שנת 2026 במרכזי הקליטה. מה קרה עד סוף החציון הראשון?",
    answers: [
      "כ- 10% עברו למגורי קבע",
      "יותר מרבע מהם – 987 עולים - עברו למגורי קבע",
      "כ- 1,850 עברו למגורי קבע",
      "הנתון כמעט ללא שינוי",
    ],
    correctAnswerId: "B",
  },
  {
    order: 4,
    category: "OUTPUT",
    durationSeconds: 30,
    pairId: null,
    title: "מה מתאר נכון את מפת הקליטה של עולי מדינות המערב השנה?",
    answers: [
      "תל אביב מובילה בכלל עולי המערב וגם בקרב עולי בריטניה",
      "ירושלים מובילה בכלל עולי המערב, אך תל אביב עקפה אותה בקרב עולי בריטניה",
      "נתניה מובילה בכלל עולי המערב, וירושלים מובילה בקרב עולי ארה\"ב",
      "ירושלים ממשיכה להוביל בכל הקבוצות ללא שינוי",
    ],
    correctAnswerId: "B",
    funFact: "ירושלים היא העיר שקלטה את המספר הגדול ביותר של עולים ממדינות המערב. עם זאת, השנה תל אביב קלטה יותר מ־20% מהם, לעומת כ־14% בירושלים.\n\nזו הפעם הראשונה לאחר שש שנים שבה תל אביב עוקפת את ירושלים בקליטת עולים מבריטניה.",
    funFactEnabled: true,
  },
  {
    order: 5,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title: "בחציון הראשון של 2026 הופצו ב-50 ירידי עלייה מוצרי פרסום ממותגים של המשרד, כיצד היינו מודדים את האפקטיביות ומדד התוצאה?",
    answers: [
      "הודפסו 20% יותר מוצרי פרסום",
      "מספר המבקרים בדוכני המשרד גדל ב־20%",
      "מספר המשתתפים שנרשמו לייעוץ עלייה אישי בעקבות החשיפה גדל ב־20%",
      "מספר הירידים שבהם השתתף המשרד גדל ב־20%",
    ],
    correctAnswerId: "C",
  },
  {
    order: 6,
    category: "OUTPUT",
    durationSeconds: 30,
    pairId: null,
    title: "איזו מגמה בלטה השנה בקליטת עולים ממדינות שבהן פועל מערך הליווי לעידוד עלייה?",
    answers: [
      "באשקלון גדל מספר העולים מ-58 ל-206 – יותר מפי 3.5",
      "שיעור הנקלטים ברעננה עלה מ־7% ל־11%, וב-״מטה אשר״ מספר העולים גדל פי שלושה",
      "בפתח תקווה גדל מספר העולים מ-82 ל-158 – כמעט פי 2",
      "כל התשובות נכונות",
    ],
    correctAnswerId: "D",
    funFact: "בשנת 2026 הגיעו לישראל 2,005 עולים ממדינות שבהן פועל מערך הליווי. נתניה, ירושלים ותל אביב ממשיכות להוביל, אך דווקא רעננה ומטה אשר מציגות את השינויים הבולטים ביותר.\n\nחלקה של רעננה עלה מ־7% בשנת 2025 ל־11% בשנת 2026, ובמטה אשר מספר העולים גדל פי שלושה — למרות המצב הביטחוני בצפון.",
    funFactEnabled: true,
  },
  {
    order: 7,
    category: "OUTPUT",
    durationSeconds: 30,
    pairId: null,
    title: "באיזה תחום החציון הראשון כבר הקדים את סוף השנה?",
    answers: [
      "מספר המשתתפים בקורסי עברית לרופאים",
      "מספר העולים שעברו למגורי קבע בקהילה",
      "מספר מועמדי העלייה שפנו לשירות טרום־עלייה",
      "מספר העולים שהגיעו ממדינות שבהן פועל מערך הליווי",
    ],
    correctAnswerId: "C",
    funFact: "בחציון הראשון של שנת 2026 פנו 5,278 מועמדי עלייה למינהל הסטודנטים לקבלת שירות טרום־עלייה — ובכך כבר נחצה היעד השנתי, שעמד על 5,000 פניות.\n\nבתוך חצי שנה בלבד הושגו כ־ 106% מהיעד השנתי — 278 פניות מעבר ליעד שנקבע לשנה כולה.",
    funFactEnabled: true,
  },
  {
    order: 8,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: "ירושלים מובילה עם 27 קבוצות פל״א. אילו שתי רשויות נוספות משלימות איתה את שלישיית המובילות?",
    answers: [
      "תל אביב ונתניה",
      "אשקלון ובית שמש",
      "באר שבע ומודיעין",
      "אשקלון ונתניה",
    ],
    correctAnswerId: "B",
    funFact: "ירושלים, אשקלון ובית שמש הן שלוש הרשויות שבהן מספר קבוצות פל״א הוא הגבוה ביותר בשנת 2026.\n\nבשלוש הרשויות פועלות יחד 61 קבוצות פל״א, מתוכן 27 בירושלים. כלומר, ירושלים לבדה מרכזת כ־44% מהקבוצות בשלישיית המובילות.",
    funFactEnabled: true,
  },
  {
    order: 9,
    category: "OUTPUT",
    durationSeconds: 20,
    pairId: null,
    title: "בכמה אחוזים קוצץ תקציב הפעילות של המשרד מאז סוף שנת 2025?",
    answers: [
      "8%",
      "14%",
      "20%",
      "26%",
    ],
    correctAnswerId: "D",
    funFact: "הקיצוץ המצטבר בתקציב הפעילות של המשרד מאז סוף שנת 2025 עומד על כ-142 מיליון ש״ח",
    funFactEnabled: true,
  },
  {
    order: 10,
    category: "OUTPUT",
    durationSeconds: 30,
    pairId: null,
    title: "בשנים 2024-2025 השתתפו בקורסי עברית טרום עליה כ-50 רופאים. מה קרה בחציון הראשון של שנת 2026?",
    answers: [
      "השתתפו 20 רופאים — 40% מהכמות בשנתיים הקודמות",
      "השתתפו 25 רופאים — מחצית מהכמות בשנתיים הקודמות",
      "השתתפו 40 רופאים — 80% מהכמות בשנתיים הקודמות",
      "השתתפו 50 רופאים — כמו בשנתיים הקודמות יחד",
    ],
    correctAnswerId: "C",
  },
  {
    order: 11,
    category: "OUTCOME",
    durationSeconds: 30,
    pairId: null,
    title: "40 רופאים למדו עברית לפני העלייה. מתי נוכל לומר שהקורס באמת הצליח?",
    answers: [
      "כאשר ייפתחו שלושה קורסים נוספים בחו״ל",
      "כאשר מספר המשתתפים יגדל ל־60 רופאים",
      "כאשר יגדל התקציב המיועד לקורסים",
      "כאשר הרופאים יעברו את בחינת הרישוי וישתלבו במערכת הבריאות בישראל בתוך שנה",
    ],
    correctAnswerId: "D",
    funFact: "מספר הרופאים שהשתתפו בקורס הוא מדד תפוקה. שיעור הרופאים שעברו את בחינת הרישוי והשתלבו במערכת הבריאות הוא מדד התוצאה שמלמד אם התוכנית השיגה את מטרתה.\n\nהמבחן האמיתי של התוכנית אינו מסתיים בכיתת הלימוד — אלא ביכולת להפוך את ההכנה שניתנה בחו״ל להשתלבות מקצועית בישראל.",
    funFactEnabled: true,
  },
  {
    order: 12,
    category: "OUTPUT",
    durationSeconds: 30,
    pairId: null,
    title: "איזה תחום הציג בחציון הראשון את שיעור ההתקדמות הנמוך ביותר ביחס ליעד השנתי?",
    answers: [
      "השמה בתכנית התעסוקה ״עלייה 2000״",
      "ירידי עלייה כולל במיקוד הצפון והדרום",
      "עלייה לחמשת יישובי הדרום",
      "כיתות פל״א ויע״ל חדשות בתל אביב",
    ],
    correctAnswerId: "C",
  },
  {
    order: 13,
    category: "OUTCOME",
    durationSeconds: 20,
    pairId: null,
    title: "מה מספר לנו אם התכנית באמת הצליחה?",
    answers: [
      "כמה תקציב הוקצה לה",
      "כמה פעילויות התקיימו",
      "כמה עולים חשבו שהתכנית היתה מעניינת",
      "איזה שינוי נוצר אצל קהל היעד בעקבות הפעילות",
    ],
    correctAnswerId: "D",
  },
];
