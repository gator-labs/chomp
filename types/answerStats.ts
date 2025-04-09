import {
  ChompResult,
  Question,
  QuestionAnswer,
  QuestionOption,
} from "@prisma/client";

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
  isQuestionRevealable: boolean;
  isCalculated: boolean;
  hasAlreadyClaimedReward: boolean;
};
