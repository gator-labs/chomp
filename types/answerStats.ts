import {
  Question,
  QuestionAnswer,
  QuestionOption,
  QuestionRewards,
} from "@prisma/client";

export type RewardStatus = "claimable" | "claimed" | "no-reward";

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
  option?: string;
};

export type AnswerStats = Question & {
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
  isLegacyQuestion: boolean;
  rewardStatus: RewardStatus;
  selectionDistribution: {
    count: number;
    option: string;
  }[];
};
