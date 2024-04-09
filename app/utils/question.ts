import { DeckQuestionIncludes } from "../components/DeckDetails/DeckDetails";

const CHAR_CODE_A_ASCII = 65;

export function getAlphaIdentifier(index: number) {
  return String.fromCharCode(CHAR_CODE_A_ASCII + index);
}

export function getQuestionState(question: DeckQuestionIncludes): {
  isAnswered: boolean;
  isRevealed: boolean;
} {
  const isAnswered = question.questionOptions.some(
    (qo) => qo.questionAnswer.length !== 0
  );
  const isRevealed = question.reveals.length !== 0;

  return { isAnswered, isRevealed };
}
