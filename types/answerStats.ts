import {
  ChompResult,
  Question,
  QuestionAnswer,
  QuestionOption,
  QuestionRewards,
} from "@prisma/client";

export type RewardStatus = "claimable" | "claimed" | "no-reward";

export type ChompResultNoDecimal = Omit<ChompResult, "rewardTokenAmount"> & {
  rewardTokenAmount: number | undefined;
};
export type UserAnswer = QuestionAnswer & {
  questionOption: {
    id: number;
    option: string;
    isLeft: boolean;
    createdAt: Date;
    updatedAt: Date;
    questionId: number;
  };
};

export type QuestionOrderPercentage = {
  id: number;
  firstOrderSelectedAnswerPercentage: number;
  secondOrderAveragePercentagePicked: number;
};

export type AnswerStats = Question & {
  chompResults: ChompResultNoDecimal[];
  userAnswers: UserAnswer[];
  answerCount: number;
  correctAnswer: QuestionOption | null;
  questionOptionPercentages: QuestionOrderPercentage[];
  questionOptions: QuestionOption[];
  isQuestionRevealable: boolean;
  isCalculated: boolean;
  hasAlreadyClaimedReward: boolean;
  QuestionRewards: QuestionRewards[];
  isFirstOrderCorrect: boolean;
  isSecondOrderCorrect: boolean | null;
  isPracticeQuestion: boolean;
  questionAnswerCount: number;
  correctAnswersCount: number;
  deckQuestions: { deckId: number }[];
  isQuestionAnsweredByUser: boolean;
  rewardStatus: RewardStatus;
  selectionDistribution: {
    optionId: number;
    count: number;
  }[];
};
