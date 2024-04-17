"use client";
import { revealDeck } from "@/app/actions/reveal";
import { useIsomorphicLayoutEffect } from "@/app/hooks/useIsomorphicLayoutEffect";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { useCollapsedContext } from "@/app/providers/CollapsedProvider";
import { getQuestionState } from "@/app/utils/question";
import { Deck, Question, QuestionAnswer, Reveal } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { Button } from "../Button/Button";
import { QuestionRowCard } from "../QuestionRowCard/QuestionRowCard";

export type DeckQuestionIncludes = Question & {
  questionOptions: {
    questionAnswers: (QuestionAnswer & {
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
  openIds?: string[];
};

const SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN = 162;

function DeckDetails({ deck, openIds }: DeckDetailsProps) {
  const router = useRouter();
  const { height } = useWindowSize();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const { setOpen } = useCollapsedContext();

  const deckQuestionStates = deck.deckQuestions.map((dq) =>
    getQuestionState(dq.question),
  );
  const revealableQuestions = deckQuestionStates.filter(
    (state) => state.isAnswered && !state.isRevealed,
  );
  const hasReveal = revealableQuestions.length > 0;

  useIsomorphicLayoutEffect(() => {
    if (openIds) {
      openIds.forEach((questionId) => setOpen(+questionId));
    }
  }, [openIds, setOpen]);

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
                  (q) => q.question.id === revealedId,
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
