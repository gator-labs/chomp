"use client";
import { revealDeck } from "@/app/actions/reveal";
import { useIsomorphicLayoutEffect } from "@/app/hooks/useIsomorphicLayoutEffect";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { useCollapsedContext } from "@/app/providers/CollapsedProvider";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { getDeckState, getQuestionState } from "@/app/utils/question";
import { getAppendedNewSearchParams } from "@/app/utils/searchParams";
import { Deck, Question, QuestionAnswer, Reveal } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { Button } from "../Button/Button";
import { QuestionRowCard } from "../QuestionRowCard/QuestionRowCard";

export type DeckQuestionIncludes = Question & {
  questionOptions: {
    id: number;
    isTrue: boolean;
    questionAnswers: (QuestionAnswer & {
      percentageResult?: number | null;
    })[];
  }[];
  reveals: Reveal[];
};

type DeckProp = Deck & {
  reveals: Reveal[];
  deckQuestions: {
    question: DeckQuestionIncludes;
  }[];
};

type DeckDetailsProps = {
  deck: DeckProp;
  openIds?: string[];
};

const SIZE_OF_OTHER_ELEMENTS_ON_HOME_SCREEN = 175;

function DeckDetails({ deck, openIds }: DeckDetailsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { height } = useWindowSize();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const { setOpen } = useCollapsedContext();
  const { openRevealModal, closeRevealModal } = useRevealedContext();

  const deckState = getDeckState(deck);
  const revealableQuestions = deck.deckQuestions
    .map((dq) => getQuestionState(dq.question))
    .filter((state) => state.isAnswered && !state.isRevealed);
  const hasReveal = deckState.isRevealable && revealableQuestions.length > 0;

  useIsomorphicLayoutEffect(() => {
    if (openIds) {
      openIds.forEach((questionId) => setOpen(+questionId));
    }
  }, [openIds, setOpen]);

  const revealAll = useCallback(async () => {
    await revealDeck(deck.id);
    const newParams = getAppendedNewSearchParams({
      openIds: encodeURIComponent(
        JSON.stringify(deck.deckQuestions.map((dq) => dq.question.id)),
      ),
    });
    router.push(`${pathname}${newParams}`);
    router.refresh();
    closeRevealModal();
  }, []);

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
            onClick={() => openRevealModal(revealAll)}
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
