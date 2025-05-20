// services/answerService.ts

interface QuestionAnswer {
  userId: string;
  selected: boolean;
  percentage: number | null;
  questionOption: { uuid: string };
  uuid: string;
  score: number | null;
}
export function transformQuestionAnswers(questionAnswers: QuestionAnswer[]) {
  const groupedAnswersByUser: Record<string, QuestionAnswer[]> = {};

  for (const answer of questionAnswers) {
    if (!groupedAnswersByUser[answer.userId]) {
      groupedAnswersByUser[answer.userId] = [];
    }
    groupedAnswersByUser[answer.userId].push(answer);
  }

  return Object.values(groupedAnswersByUser).map((userAnswers) => {
    const mappedAnswers = userAnswers
      .map((ua) => {
        const answer: any = {};
        if (ua.selected) {
          answer.firstOrderOptionId = ua.questionOption.uuid;
          answer.answerId = ua.uuid;
          answer.answerScore = ua.score;
        }
        if (ua.percentage !== null) {
          answer.secondOrderOptionId = ua.questionOption.uuid;
          answer.secondOrderOptionEstimate = ua.percentage;
        }
        return Object.keys(answer).length > 0 ? answer : null;
      })
      .filter(Boolean);

    return Object.assign({}, ...mappedAnswers);
  });
}
