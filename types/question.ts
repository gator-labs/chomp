export enum QuestionStep {
  AnswerQuestion = 1,
  PickPercentage = 2,
}

export type QuestionCardIndicatorType =
  | "correct"
  | "incorrect"
  | "unanswered"
  | "unrevealed";
