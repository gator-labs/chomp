"use client";
import { revealDeck } from "@/app/actions/chompResult";
import { useIsomorphicLayoutEffect } from "@/app/hooks/useIsomorphicLayoutEffect";
import { useWindowSize } from "@/app/hooks/useWindowSize";
import { useCollapsedContext } from "@/app/providers/CollapsedProvider";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import {
  DeckQuestionIncludes,
  getDeckState,
  getQuestionState,
} from "@/app/utils/question";
import { getAppendedNewSearchParams } from "@/app/utils/searchParams";
import { ChompResult, Deck } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { Button } from "../Button/Button";
import { QuestionRowCard } from "../QuestionRowCard/QuestionRowCard";

type DeckProp = Deck & {
  answerCount: number;
  chompResults: ChompResult[];
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

  const revealAll = useCallback(
    async (burnTx?: string, nftAddress?: string) => {
      await revealDeck(deck.id, burnTx, nftAddress);
      const newParams = getAppendedNewSearchParams({
        openIds: encodeURIComponent(
          JSON.stringify(deck.deckQuestions.map((dq) => dq.question.id)),
        ),
      });
      router.push(`${pathname}${newParams}`);
      router.refresh();
      closeRevealModal();
    },
    [],
  );

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
            onClick={() =>
              openRevealModal(
                revealAll,
                deck.deckQuestions
                  .filter((dq) => {
                    const state = getQuestionState(dq.question);
                    return state.isAnswered && !state.isRevealed;
                  })
                  .reduce(
                    (acc, cur) => acc + cur.question.revealTokenAmount,
                    0,
                  ),
                !!"multiple",
              )
            }
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
