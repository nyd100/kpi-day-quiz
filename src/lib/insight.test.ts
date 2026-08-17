import { describe, it, expect } from "vitest";
import { generateVotingInsight } from "./insight";
import type { QuestionStatistics } from "./quiz";

describe("Voting Insights", () => {
  const answers = [
    { id: "A" as const, text: "Answer 1" },
    { id: "B" as const, text: "Answer 2" },
    { id: "C" as const, text: "Answer 3" },
    { id: "D" as const, text: "Answer 4" },
  ];

  it("handles zero responses", () => {
    const stats: QuestionStatistics = {
      responses: 0,
      correctPercent: 0,
      totalPlayers: 10,
      counts: { A: 0, B: 0, C: 0, D: 0 },
      percents: { A: 0, B: 0, C: 0, D: 0 },
    };
    const insight = generateVotingInsight(stats, answers, "OUTPUT", "A");
    expect(insight).toBe("לא התקבלו תשובות לשאלה זו.");
  });

  it("handles very small sample", () => {
    const stats: QuestionStatistics = {
      responses: 4,
      correctPercent: 100,
      totalPlayers: 10,
      counts: { A: 4, B: 0, C: 0, D: 0 },
      percents: { A: 100, B: 0, C: 0, D: 0 },
    };
    const insight = generateVotingInsight(stats, answers, "OUTPUT", "A");
    expect(insight).toBe("מספר המשיבים קטן מאוד ולכן לא מוצגת פרשנות להתפלגות.");
  });

  it("handles low participation", () => {
    const stats: QuestionStatistics = {
      responses: 5,
      correctPercent: 100,
      totalPlayers: 10, // 50% response rate
      counts: { A: 5, B: 0, C: 0, D: 0 },
      percents: { A: 100, B: 0, C: 0, D: 0 },
    };
    const insight = generateVotingInsight(stats, answers, "OUTPUT", "A");
    expect(insight).toBe("שיעור ההשתתפות בשאלה היה נמוך יחסית: 50% מהמשתתפים הצביעו. כדאי לפרש את התפלגות התשובות בזהירות.");
  });

  it("handles strong consensus", () => {
    const stats: QuestionStatistics = {
      responses: 10,
      correctPercent: 90,
      totalPlayers: 10,
      counts: { A: 9, B: 1, C: 0, D: 0 },
      percents: { A: 90, B: 10, C: 0, D: 0 },
    };
    const insight = generateVotingInsight(stats, answers, "OUTPUT", "A");
    expect(insight).toBe("נרשמה הסכמה רחבה: 90% מהמשתתפים בחרו בתשובה הנכונה.");
  });

  it("adds OUTCOME specific insight for strong consensus", () => {
    const stats: QuestionStatistics = {
      responses: 10,
      correctPercent: 90,
      totalPlayers: 10,
      counts: { A: 9, B: 1, C: 0, D: 0 },
      percents: { A: 90, B: 10, C: 0, D: 0 },
    };
    const insight = generateVotingInsight(stats, answers, "OUTCOME", "A");
    expect(insight).toBe("נרשמה הסכמה רחבה: 90% מהמשתתפים בחרו בתשובה הנכונה. נראה שההבחנה בין תפוקה לתוצאה הייתה ברורה לרוב המשתתפים.");
  });

  it("handles clear majority", () => {
    const stats: QuestionStatistics = {
      responses: 10,
      correctPercent: 70,
      totalPlayers: 10,
      counts: { A: 7, B: 3, C: 0, D: 0 },
      percents: { A: 70, B: 30, C: 0, D: 0 },
    };
    const insight = generateVotingInsight(stats, answers, "OUTPUT", "A");
    expect(insight).toBe("רוב ברור של 70% בחר בתשובה הנכונה, אך עדיין קיים מיעוט משמעותי שבחר באפשרויות אחרות.");
  });

  it("handles mixed understanding", () => {
    const stats: QuestionStatistics = {
      responses: 10,
      correctPercent: 60,
      totalPlayers: 10,
      counts: { A: 6, B: 2, C: 2, D: 0 },
      percents: { A: 60, B: 20, C: 20, D: 0 },
    };
    const insight = generateVotingInsight(stats, answers, "OUTPUT", "A");
    expect(insight).toBe("התוצאות מפוצלות יחסית: 60% בחרו בתשובה הנכונה. חלק משמעותי מהמשתתפים בחר באפשרויות אחרות.");
  });

  it("handles majority incorrect and points out strong distractor", () => {
    const stats: QuestionStatistics = {
      responses: 10,
      correctPercent: 30,
      totalPlayers: 10,
      counts: { A: 3, B: 5, C: 2, D: 0 },
      percents: { A: 30, B: 50, C: 20, D: 0 },
    };
    const insight = generateVotingInsight(stats, answers, "OUTPUT", "A");
    expect(insight).toContain("פחות ממחצית המשתתפים בחרו בתשובה הנכונה: 30%. זהו נושא שכדאי להתעכב עליו בדיון.");
    expect(insight).toContain('האפשרות הפופולרית ביותר הייתה "Answer 2" עם 50%, למרות שאינה התשובה הנכונה.');
  });
  
  it("points out strong distractor when majority is correct but distractor > 25%", () => {
    const stats: QuestionStatistics = {
      responses: 10,
      correctPercent: 60,
      totalPlayers: 10,
      counts: { A: 6, B: 3, C: 1, D: 0 },
      percents: { A: 60, B: 30, C: 10, D: 0 },
    };
    const insight = generateVotingInsight(stats, answers, "OUTPUT", "A");
    expect(insight).toContain('המסיח הבולט היה "Answer 2", שנבחר על ידי 30% מהמשתתפים.');
  });

  it("handles close split between top two", () => {
    const stats: QuestionStatistics = {
      responses: 10,
      correctPercent: 40,
      totalPlayers: 10,
      counts: { A: 4, B: 5, C: 1, D: 0 },
      percents: { A: 40, B: 50, C: 10, D: 0 },
    };
    const insight = generateVotingInsight(stats, answers, "OUTPUT", "A");
    expect(insight).toContain("ההצבעה הייתה צמודה: הפער בין שתי האפשרויות המובילות היה 10 נקודות אחוז בלבד.");
  });
});
