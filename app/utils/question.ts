import { Deck, Reveal } from "@prisma/client";
import { DeckQuestionIncludes } from "../components/DeckDetails/DeckDetails";
import dayjs from "dayjs";

const CHAR_CODE_A_ASCII = 65;

export function getAlphaIdentifier(index: number) {
  return String.fromCharCode(CHAR_CODE_A_ASCII + index);
}

export function getQuestionState(question: DeckQuestionIncludes): {
  isAnswered: boolean;
  isRevealed: boolean;
  isRevealable: boolean;
} {
  const isAnswered = question.questionOptions?.some(
    (qo) => qo.questionAnswers.length !== 0
  );
  const isRevealed = question.reveals?.length !== 0;
  const isRevealable =
    question.revealAtDate !== null &&
    dayjs(question.revealAtDate).isBefore(new Date());

  return { isAnswered, isRevealed, isRevealable };
}

export function getDeckState(
  deck: Deck & {
    deckQuestions: {
      question: DeckQuestionIncludes;
    }[];
    reveals: Reveal[];
  }
): {
  isAnswered: boolean;
  isRevealed: boolean;
  isRevealable: boolean;
} {
  const isAnswered = deck.deckQuestions?.some((dq) =>
    dq.question?.questionOptions?.some((qo) => qo.questionAnswers.length !== 0)
  );
  const isRevealed = deck.reveals?.length !== 0;
  const isRevealable =
    deck.revealAtDate !== null && dayjs(deck.revealAtDate).isBefore(new Date());

  return { isAnswered, isRevealed, isRevealable };
}

type BinaryQuestionAnswer = {
  calculatedPercentage: number;
  selectedPercentage: number;
  selected: boolean;
};

export function isBinaryQuestionCorrectAnswer(
  a: BinaryQuestionAnswer,
  b: BinaryQuestionAnswer
) {
  const aPercentage = a.calculatedPercentage - a.selectedPercentage;
  const bPercentage = b.calculatedPercentage - b.selectedPercentage;

  if (aPercentage > bPercentage) {
    return a.selected;
  }

  if (bPercentage > aPercentage) {
    return b.selected;
  }

  return true;
}
