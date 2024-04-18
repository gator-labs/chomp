import { Deck, Question, Reveal } from "@prisma/client";
import dayjs from "dayjs";
import { DeckQuestionIncludes } from "../components/DeckDetails/DeckDetails";

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
  const isRevealed = question.reveals?.length !== 0;
  const isRevealable =
    question.revealAtDate !== null &&
    dayjs(question.revealAtDate).isBefore(new Date());
  const isClaimed =
    question.reveals && question.reveals.length > 0
      ? question.reveals[0].isRewardClaimed
      : false;

  return { isAnswered, isRevealed, isRevealable, isClaimed };
}

export function getDeckState(
  deck: Deck & {
    deckQuestions: {
      question: DeckQuestionIncludes;
    }[];
    reveals: Reveal[];
  },
): {
  isAnswered: boolean;
  isRevealed: boolean;
  isRevealable: boolean;
} {
  const isAnswered = deck.deckQuestions?.some((dq) =>
    dq.question?.questionOptions?.some((qo) => qo.questionAnswers.length !== 0),
  );
  const isRevealed = deck.reveals?.length !== 0;
  const isRevealable =
    deck.revealAtDate !== null && dayjs(deck.revealAtDate).isBefore(new Date());

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

type RevealableQuestionData = {
  revealAtDate: Date | null;
  revealAtAnswerCount: number | null;
  answerCount: number;
};

export const isQuestionRevealable = (question: RevealableQuestionData) => {
  return (
    (question.revealAtDate !== null
      ? dayjs(question.revealAtDate).isBefore(new Date())
      : true) &&
    (question.revealAtAnswerCount !== null
      ? question.revealAtAnswerCount >= question.answerCount
      : true)
  );
};

export const areQuestionsRevealable = (
  questions: (Question & { reveals: Reveal[] })[],
) => {
  return questions.every((question) => {});
};

export const handleQuestionMappingForFeed = (
  questions: DeckQuestionIncludes[],
  questionOptionPercentages: {
    id: number;
    percentageResult: number;
  }[],
  userId: string,
  areRevealed: boolean,
  areAnswered: boolean,
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
      q.questionOptions?.forEach((qo: { isTrue?: boolean }) => {
        delete qo.isTrue;
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
              qo.isTrue = true;
              return;
            }

            qo.isTrue = false;
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
