import {
  ChompResult,
  Deck,
  Question,
  QuestionAnswer,
  ResultType,
} from "@prisma/client";
import dayjs from "dayjs";

export type DeckQuestionIncludes = Question & {
  answerCount?: number;
  questionOptions: {
    id: number;
    isCorrect: boolean;
    isLeft: boolean;
    questionAnswers: Array<
      QuestionAnswer & {
        percentageResult?: number | null;
      }
    >;
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
  const isRevealed = question.chompResults?.length !== 0;
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
  const isRevealed = deck.chompResults?.length !== 0;
  const isRevealable = isEntityRevealable(deck);

  return { isAnswered, isRevealed, isRevealable };
}

type BinaryQuestionAnswer = {
  optionId: number;
  calculatedPercentage: number;
  selectedPercentage: number;
  selected: boolean;
};

export function isBinaryQuestionCorrectAnswer(
  a: BinaryQuestionAnswer,
  b: BinaryQuestionAnswer,
) {
  const correctQuestion = getCorrectBinaryQuestion(a, b);
  return correctQuestion?.selected ?? true;
}

export function getCorrectBinaryQuestion(
  a: BinaryQuestionAnswer,
  b: BinaryQuestionAnswer,
) {
  const aPercentage = a.calculatedPercentage - a.selectedPercentage;
  const bPercentage = b.calculatedPercentage - b.selectedPercentage;

  if (aPercentage > bPercentage) {
    return a;
  }

  if (bPercentage > aPercentage) {
    return b;
  }

  return null;
}

export function mapQuestionToBinaryQuestionAnswer(
  question: DeckQuestionIncludes,
): BinaryQuestionAnswer[] | null {
  const answers = question.questionOptions.flatMap((qo) => qo.questionAnswers);

  if (answers.length === 2) {
    if (answers[0].percentage === null || answers[1].percentage === null) {
      return null;
    }

    const aCalculatedPercentage = answers[0].percentageResult;
    const bCalculatedPercentage = answers[1].percentageResult;
    if (
      aCalculatedPercentage === undefined ||
      aCalculatedPercentage === null ||
      bCalculatedPercentage === undefined ||
      bCalculatedPercentage === null
    ) {
      return null;
    }

    return [
      {
        optionId: answers[0].questionOptionId,
        calculatedPercentage: aCalculatedPercentage,
        selectedPercentage: answers[0].percentage,
        selected: answers[0].selected,
      },
      {
        optionId: answers[1].questionOptionId,
        calculatedPercentage: bCalculatedPercentage,
        selectedPercentage: answers[1].percentage,
        selected: answers[1].selected,
      },
    ];
  }

  return null;
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

export const handleQuestionMappingForFeed = (
  questions: DeckQuestionIncludes[],
  questionOptionPercentages: {
    id: number;
    percentageResult: number;
  }[],
  userId: string,
  areRevealed: boolean,
) => {
  questions.forEach((q) => {
    q.questionOptions?.forEach((qo: any) => {
      qo.questionAnswers?.forEach((qa: any) => {
        qa.percentageResult =
          questionOptionPercentages.find(
            (qop) => qop.id === qa.questionOptionId,
          )?.percentageResult ?? 0;
      });
    });
  });

  if (!areRevealed) {
    questions?.forEach((q) => {
      q.questionOptions?.forEach((qo: { isCorrect?: boolean }) => {
        delete qo.isCorrect;
      });
    });
  }

  if (areRevealed) {
    questions?.forEach((q) => {
      if (q.questionOptions.length === 2) {
        const binaryArgs = mapQuestionToBinaryQuestionAnswer(q as any);
        if (binaryArgs) {
          const [a, b] = binaryArgs;
          const correctQuestion = getCorrectBinaryQuestion(a, b);
          q.questionOptions.forEach((qo) => {
            if (qo.id === correctQuestion?.optionId) {
              qo.isCorrect = true;
              return;
            }

            qo.isCorrect = false;
          });
        }
      }

      q.questionOptions.forEach((qo: any) => {
        if (qo.questionAnswers) {
          qo.questionAnswers = qo.questionAnswers.filter(
            (qa: any) => qa.userId === userId,
          );
        }
      });
    });
  }
};
