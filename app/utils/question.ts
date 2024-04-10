import { Deck, Reveal } from "@prisma/client";
import { DeckQuestionIncludes } from "../components/DeckDetails/DeckDetails";

const CHAR_CODE_A_ASCII = 65;

export function getAlphaIdentifier(index: number) {
  return String.fromCharCode(CHAR_CODE_A_ASCII + index);
}

export function getQuestionState(question: DeckQuestionIncludes): {
  isAnswered: boolean;
  isRevealed: boolean;
} {
  const isAnswered = question.questionOptions?.some(
    (qo) => qo.questionAnswer.length !== 0
  );
  const isRevealed = question.reveals?.length !== 0;

  return { isAnswered, isRevealed };
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
} {
  const isAnswered = deck.deckQuestions?.some((dq) =>
    dq.question?.questionOptions?.some((qo) => qo.questionAnswer.length !== 0)
  );
  const isRevealed = deck.reveals?.length !== 0;

  return { isAnswered, isRevealed };
}
