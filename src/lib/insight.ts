import { type AnswerId, type QuestionCategory, type QuestionStatistics } from "./quiz";

export function generateVotingInsight(
  stats: QuestionStatistics,
  answers: { id: AnswerId; text: string }[],
  category: QuestionCategory,
  correctAnswerId: AnswerId | null
): string {
  if (stats.responses === 0) {
    return "לא התקבלו תשובות לשאלה זו.";
  }
  if (stats.responses < 5) {
    return "מספר המשיבים קטן מאוד ולכן לא מוצגת פרשנות להתפלגות.";
  }

  const responseRate = stats.totalPlayers === 0 ? 0 : Math.round((stats.responses / stats.totalPlayers) * 100);
  const correctRate = stats.correctPercent;

  let insight = "";

  if (responseRate < 60) {
    return `שיעור ההשתתפות בשאלה היה נמוך יחסית: ${responseRate}% מהמשתתפים הצביעו. כדאי לפרש את התפלגות התשובות בזהירות.`;
  }

  const sortedAnswers = [...answers].sort((a, b) => stats.percents[b.id] - stats.percents[a.id]);
  const topAnswer = sortedAnswers[0];
  const secondTopAnswer = sortedAnswers.length > 1 ? sortedAnswers[1] : null;
  const topAnswerRate = stats.percents[topAnswer.id];
  const secondHighestRate = secondTopAnswer ? stats.percents[secondTopAnswer.id] : 0;
  
  const distractors = sortedAnswers.filter((a) => a.id !== correctAnswerId);
  const highestDistractor = distractors.length > 0 ? distractors[0] : null;
  const highestDistractorRate = highestDistractor ? stats.percents[highestDistractor.id] : 0;
  
  const marginBetweenTopTwo = topAnswerRate - secondHighestRate;
  
  let includedPopularIncorrect = false;

  if (correctRate >= 85) {
    insight = `נרשמה הסכמה רחבה: ${correctRate}% מהמשתתפים בחרו בתשובה הנכונה.`;
    if (category === "OUTCOME") {
      insight += " נראה שההבחנה בין תפוקה לתוצאה הייתה ברורה לרוב המשתתפים.";
    }
  } else if (correctRate >= 70) {
    insight = `רוב ברור של ${correctRate}% בחר בתשובה הנכונה, אך עדיין קיים מיעוט משמעותי שבחר באפשרויות אחרות.`;
  } else if (correctRate >= 50) {
    insight = `התוצאות מפוצלות יחסית: ${correctRate}% בחרו בתשובה הנכונה. חלק משמעותי מהמשתתפים בחר באפשרויות אחרות.`;
    if (category === "OUTCOME") {
      insight += " ייתכן שכדאי לחדד את ההבחנה בין תפוקה לתוצאה.";
    }
  } else {
    insight = `פחות ממחצית המשתתפים בחרו בתשובה הנכונה: ${correctRate}%. זהו נושא שכדאי להתעכב עליו בדיון.`;
    if (topAnswer.id !== correctAnswerId) {
      insight += ` האפשרות הפופולרית ביותר הייתה "${topAnswer.text}" עם ${topAnswerRate}%, למרות שאינה התשובה הנכונה.`;
      includedPopularIncorrect = true;
    }
  }

  if (highestDistractorRate >= 25 && !includedPopularIncorrect && highestDistractor) {
    insight += ` המסיח הבולט היה "${highestDistractor.text}", שנבחר על ידי ${highestDistractorRate}% מהמשתתפים.`;
  }

  if (marginBetweenTopTwo <= 10 && marginBetweenTopTwo >= 0 && secondTopAnswer) {
    if (topAnswerRate > 0) {
      insight += ` ההצבעה הייתה צמודה: הפער בין שתי האפשרויות המובילות היה ${marginBetweenTopTwo} נקודות אחוז בלבד.`;
    }
  }

  return insight.trim();
}
