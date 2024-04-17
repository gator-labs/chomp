"use client";
import { claimQuestion } from "@/app/actions/claim";
import { revealQuestion } from "@/app/actions/reveal";
import { useCollapsedContext } from "@/app/providers/CollapsedProvider";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { getQuestionState } from "@/app/utils/question";
import Link from "next/link";
import { useCallback } from "react";
import { AnsweredQuestionContent } from "../AnsweredQuestionContent/AnsweredQuestionContent";
import { Button } from "../Button/Button";
import { DeckQuestionIncludes } from "../DeckDetails/DeckDetails";
import { QuestionAccordion } from "../QuestionAccordion/QuestionAccordion";

type QuestionRowCardProps = {
  question: DeckQuestionIncludes;
  onRefreshCards: (revealedId: number) => void;
};

export function QuestionRowCard({
  question,
  onRefreshCards,
}: QuestionRowCardProps) {
  const { isAnswered, isRevealed, isRevealable, isClaimed } =
    getQuestionState(question);
  const { getIsOpen, toggleCollapsed, setOpen } = useCollapsedContext();
  const { openClaimModal, openRevealModal, closeClaimModal, closeRevealModal } =
    useRevealedContext();

  const reveal = useCallback(async () => {
    await revealQuestion(question.id);
    onRefreshCards(question.id);
    setOpen(question.id);
    closeRevealModal();
  }, [onRefreshCards, setOpen, closeRevealModal]);

  const claim = useCallback(async () => {
    await claimQuestion(question.id);
    onRefreshCards(question.id);
    setOpen(question.id);
    closeClaimModal();
  }, [onRefreshCards, setOpen, closeClaimModal]);

  if (isAnswered) {
    let actionSubmit = <></>;

    if (isRevealable && !isRevealed) {
      actionSubmit = (
        <>
          <Button
            variant="white"
            isPill
            onClick={() => openRevealModal(reveal)}
          >
            Reveal Results
          </Button>
        </>
      );
    }

    if (isRevealable && isRevealed) {
      actionSubmit = (
        <>
          <Button
            variant="white"
            isPill
            onClick={() => openClaimModal(claim)}
            disabled={isClaimed}
          >
            {isClaimed ? "Claimed" : "Claim Reward"}
          </Button>
        </>
      );
    }

    return (
      <>
        <QuestionAccordion
          isCollapsed={!getIsOpen(question.id)}
          onToggleCollapse={() => toggleCollapsed(question.id)}
          question={question.question}
          revealedAt={question.revealAtDate}
          actionChild={actionSubmit}
          status="chomped"
        >
          {isRevealed && <AnsweredQuestionContent element={question} />}
        </QuestionAccordion>
      </>
    );
  }

  return (
    <Link href={`/application/answer/question/${question.id}`}>
      <QuestionAccordion
        question={question.question}
        revealedAt={question.revealAtDate}
        status="new"
      />
    </Link>
  );
}
