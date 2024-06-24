import {
  ChompResult,
  Deck,
  Question,
  QuestionAnswer,
  ResultType,
  TransactionStatus,
} from "@prisma/client";
import dayjs from "dayjs";

export const BINARY_QUESTION_TRUE_LABELS = ["Yes", "YES", "True", "TRUE"];

export const BINARY_QUESTION_FALSE_LABELS = ["No", "NO", "False", "FALSE"];

export const BINARY_QUESTION_OPTION_LABELS = [
  ...BINARY_QUESTION_TRUE_LABELS,
  ...BINARY_QUESTION_FALSE_LABELS,
];

export type DeckQuestionIncludes = Question & {
  answerCount?: number;
  questionOptions: {
    id: number;
    isCorrect: boolean;
    isLeft: boolean;
    calculatedIsCorrect: boolean | null;
    questionAnswers: QuestionAnswer[];
  }[];
  chompResults: ChompResult[];
};

const CHAR_CODE_A_ASCII = 65;

export function getAlphaIdentifier(index: number) {
  return String.fromCharCode(CHAR_CODE_A_ASCII + index);
}

export function getQuestionState(question: DeckQuestionIncludes): {
  isAnswered: boolean;
  isRevealed: boolean;
  isRevealable: boolean;
  isClaimed: boolean;
} {
  const isAnswered = question.questionOptions?.some(
    (qo) => qo.questionAnswers.length !== 0,
  );
  const isRevealed =
    question.chompResults.filter(
      (cr) => cr.transactionStatus === TransactionStatus.Completed,
    )?.length !== 0;
  const isRevealable = isEntityRevealable(question);
  const isClaimed =
    question.chompResults &&
    question.chompResults.length > 0 &&
    question.chompResults[0].result === ResultType.Claimed;

  return { isAnswered, isRevealed, isRevealable, isClaimed };
}

export function getDeckState(
  deck: Deck & {
    answerCount?: number;
    deckQuestions: {
      question: DeckQuestionIncludes;
    }[];
    chompResults: ChompResult[];
  },
): {
  isAnswered: boolean;
  isRevealed: boolean;
  isRevealable: boolean;
} {
  const isAnswered = deck.deckQuestions?.some((dq) =>
    dq.question?.questionOptions?.some((qo) => qo.questionAnswers.length !== 0),
  );
  const isRevealed =
    deck.chompResults.filter(
      (cr) => cr.transactionStatus === TransactionStatus.Completed,
    )?.length !== 0;
  const isRevealable = isEntityRevealable(deck);

  return { isAnswered, isRevealed, isRevealable };
}

export const populateAnswerCount = (
  element:
    | DeckQuestionIncludes
    | (Deck & {
        answerCount?: number;
        deckQuestions: {
          question: DeckQuestionIncludes;
        }[];
      }),
) => {
  let questions: DeckQuestionIncludes[] = [];
  if ((element as Deck).deck) {
    questions = (
      element as { deckQuestions: { question: DeckQuestionIncludes }[] }
    ).deckQuestions.map((dq) => dq.question);
  }

  if ((element as DeckQuestionIncludes).question) {
    questions = [element as DeckQuestionIncludes];
  }

  questions.forEach((q) => {
    if (q.questionOptions && q.questionOptions.length > 0) {
      q.answerCount = q.questionOptions[0].questionAnswers.length;
      return;
    }

    q.answerCount = 0;
  });

  if ((element as Deck).deck) {
    element.answerCount = questions.reduce(
      (acc, curr) => acc + (curr.answerCount ?? 0),
      0,
    );
  }

  return element;
};

type RevealableEntityData = {
  revealAtDate: Date | null;
  revealAtAnswerCount: number | null;
  answerCount?: number;
};

export const isEntityRevealable = (entity: RevealableEntityData) => {
  return (
    ((entity.revealAtDate !== null || entity.revealAtAnswerCount !== null) &&
      entity.revealAtDate !== null &&
      dayjs(entity.revealAtDate).isBefore(new Date())) ||
    (entity.revealAtAnswerCount !== null &&
      entity.revealAtAnswerCount >= (entity.answerCount ?? 0))
  );
};

export const mapPercentages = (
  questions: DeckQuestionIncludes[],
  questionOptionPercentages: {
    id: number;
    firstOrderSelectedAnswerPercentage: number | null;
    secondOrderAveragePercentagePicked: number | null;
  }[],
) => {
  questions.forEach((q) => {
    q.questionOptions?.forEach((qo: any) => {
      qo.questionAnswers?.forEach((qa: any) => {
        const optionPercentages = questionOptionPercentages.find(
          (qop) => qop.id === qa.questionOptionId,
        );
        qa.firstOrderSelectedAnswerPercentage =
          optionPercentages?.firstOrderSelectedAnswerPercentage ?? 0;
        qa.secondOrderAveragePercentagePicked =
          optionPercentages?.secondOrderAveragePercentagePicked ?? 0;
      });
    });
  });
};
