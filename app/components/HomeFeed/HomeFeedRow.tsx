"use client";
import { Deck, Question } from "@prisma/client";
import { ElementType } from "./HomeFeed";
import Link from "next/link";
import { QuestionAccordion } from "../QuestionAccordion/QuestionAccordion";
import { QuestionDeck } from "../QuestionDeck/QuestionDeck";
import { useState } from "react";
import { Button } from "../Button/Button";
import { revealQuestion } from "@/app/actions/reveal";
import dayjs from "dayjs";
import { AnsweredQuestionContentFactory } from "@/app/utils/answeredQuestionFactory";

type HomeFeedRowProps = {
  element: Deck | Question;
  type: ElementType;
  isAnswered: boolean;
  isRevealed: boolean;
};

export function HomeFeedRow({
  element,
  type,
  isAnswered,
  isRevealed,
}: HomeFeedRowProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  if (type === ElementType.Question && isAnswered) {
    const question = element as Question;
    const actionSubmit =
      !isRevealed && dayjs(element.revealAtDate).isBefore(new Date()) ? (
        <Button
          variant="white"
          isPill
          onClick={async () => {
            await revealQuestion(element.id);
          }}
        >
          Reveal Results
        </Button>
      ) : null;

    return (
      <QuestionAccordion
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        question={question.question}
        revealedAt={question.revealAtDate}
        actionChild={actionSubmit}
        status="chomped"
      >
        {dayjs(element.revealAtDate).isBefore(new Date()) &&
          AnsweredQuestionContentFactory(question)}
      </QuestionAccordion>
    );
  }

  if (type === ElementType.Question) {
    const question = element as Question;
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

  const deck = element as Deck;
  if (isAnswered) {
    return (
      <Link href={`/application/deck/${deck.id}`}>
        <QuestionDeck
          text={deck.deck}
          revealedAt={deck.revealAtDate}
          status="chomped"
        />
      </Link>
    );
  }

  return (
    <Link href={`/application/answer/deck/${deck.id}`}>
      <QuestionDeck
        text={deck.deck}
        revealedAt={deck.revealAtDate}
        status="new"
      />
    </Link>
  );
}
