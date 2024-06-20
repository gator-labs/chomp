"use client";
import { revealDeck } from "@/app/actions/chompResult";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import {
  DeckQuestionIncludes,
  getDeckState,
  getQuestionState,
} from "@/app/utils/question";
import { ChompResult, Deck } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "../Button/Button";
import { DeckDetailsFeedRowCard } from "../DeckDetailsFeedRowCard/DeckDetailsFeedRowCard";
import Stepper from "../Stepper/Stepper";

type DeckProp = Deck & {
  answerCount: number;
  chompResults: ChompResult[];
  deckQuestions: {
    question: DeckQuestionIncludes;
  }[];
};

type DeckDetailsProps = {
  deck: DeckProp;
};

function DeckDetails({ deck }: DeckDetailsProps) {
  const router = useRouter();

  const { openRevealModal, closeRevealModal } = useRevealedContext();

  const deckState = getDeckState(deck);
  const questionStates = deck.deckQuestions.map((dq) => ({
    ...dq,
    ...getQuestionState(dq.question),
  }));

  const revealableQuestions = questionStates.filter(
    (state) => state.isAnswered && !state.isRevealed,
  );
  const hasReveal = deckState.isRevealable && revealableQuestions.length > 0;

  const revealAll = useCallback(
    async (burnTx?: string, nftAddress?: string) => {
      await revealDeck(deck.id, burnTx, nftAddress);
      router.refresh();
      closeRevealModal();
    },
    [],
  );

  const handleRevealAll = useCallback(
    () =>
      openRevealModal({
        reveal: revealAll,
        amount: revealableQuestions.reduce(
          (curr, acc) => curr + acc.question.revealTokenAmount,
          0,
        ),
        questionIds: revealableQuestions.map((q) => q.question.id),
      }),
    [],
  );

  const hasChomped = !questionStates.some((qs) => !qs.isAnswered);

  return (
    <div>
      <div className="text-sm color-[#F1F1F1] flex justify-between px-4 mb-4">
        <span>{deck.deck}</span>
      </div>
      <Stepper
        numberOfSteps={deck.deckQuestions.length}
        activeStep={questionStates.filter((qs) => qs.isAnswered).length}
        color="green"
        className="px-4 !py-0 mb-4"
      />
      {(hasChomped || hasReveal) && (
        <div className="flex justify-between items-center px-4 mb-4">
          <div>
            {hasChomped && (
              <div className="bg-aqua rounded-full text-center px-4 py-2">
                <div className="text-btn-text-primary text-xs font-bold">
                  Chomped
                </div>
              </div>
            )}
          </div>
          <div>
            {hasReveal && (
              <Button
                size="small"
                variant="white"
                isPill
                isFullWidth={false}
                className="!text-xs"
                onClick={handleRevealAll}
              >
                Reveal all
              </Button>
            )}
          </div>
        </div>
      )}
      <div className="px-4">
        {deck.deckQuestions
          .map((dq) => dq.question)
          .map((element) => (
            <div key={element.id} className="pb-4">
              <DeckDetailsFeedRowCard element={element} />
            </div>
          ))}
      </div>
    </div>
  );
}

export default DeckDetails;
