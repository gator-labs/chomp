"use client";
import { Deck, Question, QuestionAnswer, Reveal } from "@prisma/client";
import { Virtuoso } from "react-virtuoso";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { DeckDetailsRow } from "./DeckDetailsRow";

export type DeckQuestionIncludes = Question & {
  questionOptions: {
    questionAnswer: (QuestionAnswer & {
      percentageResult?: number | null;
    })[];
  }[];
  reveals: Reveal[];
};

type DeckProp = Deck & {
  deckQuestions: {
    question: DeckQuestionIncludes;
  }[];
};

type DeckDetailsProps = {
  deck: DeckProp;
};

const SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN = 210;

function DeckDetails({ deck }: DeckDetailsProps) {
  const { height } = useWindowSize();

  return (
    <Virtuoso
      style={{ height: height - SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN }}
      data={deck.deckQuestions.map((dq) => dq.question)}
      className="mx-4 mt-4"
      itemContent={(_, element) => (
        <div className="pb-4">
          <DeckDetailsRow element={element} />
        </div>
      )}
    />
  );
}

export default DeckDetails;
