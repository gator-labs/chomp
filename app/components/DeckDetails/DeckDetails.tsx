"use client";
import { Deck, Question, QuestionAnswer, Reveal } from "@prisma/client";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { getQuestionState } from "@/app/utils/question";
import { Button } from "../Button/Button";
import { revealDeck } from "@/app/actions/reveal";
import { useRouter } from "next/navigation";
import { QuestionRowCard } from "../QuestionRowCard/QuestionRowCard";
import { useRef } from "react";

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

const SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN = 162;

function DeckDetails({ deck }: DeckDetailsProps) {
  const router = useRouter();
  const { height } = useWindowSize();
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const hasReveal = deck.deckQuestions
    .map((dq) => getQuestionState(dq.question))
    .some((state) => state.isAnswered && !state.isRevealed);

  return (
    <div>
      <div className="text-sm color-[#F1F1F1] flex justify-between px-4">
        <span>{deck.deck}</span>
        <span>
          {deck.deckQuestions.length} card
          {deck.deckQuestions.length > 1 ? "s" : ""}
        </span>
      </div>
      {hasReveal && (
        <div className="pt-4 px-4">
          <Button
            variant="white"
            isPill
            onClick={async () => {
              await revealDeck(deck.id);
              router.refresh();
            }}
          >
            Reveal all
          </Button>
        </div>
      )}
      <Virtuoso
        ref={virtuosoRef}
        style={{
          height:
            height -
            SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN -
            (hasReveal ? 80 : 0),
        }}
        data={deck.deckQuestions.map((dq) => dq.question)}
        className="mx-4 mt-4"
        itemContent={(_, element) => (
          <div className="pb-4">
            <QuestionRowCard
              question={element}
              onRefreshCards={(revealedId) => {
                router.refresh();
                const elementToScroll = deck.deckQuestions.find(
                  (q) => q.question.id === revealedId
                );

                if (elementToScroll) {
                  virtuosoRef.current?.scrollToIndex({
                    index: deck.deckQuestions.indexOf(elementToScroll),
                  });
                }
              }}
            />
          </div>
        )}
      />
    </div>
  );
}

export default DeckDetails;
