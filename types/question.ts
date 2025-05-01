export enum QuestionStep {
  AnswerQuestion = 1,
  PickPercentage = 2,
}

export type QuestionCardIndicatorType =
  | "unseen"
  | "incomplete"
  | "correct"
  | "incorrect"
  | "unanswered"
  | "unrevealed";
