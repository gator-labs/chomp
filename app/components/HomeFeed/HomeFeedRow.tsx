"use client";
import { Deck, Question } from "@prisma/client";
import { ElementType } from "./HomeFeed";
import Link from "next/link";
import { QuestionAccordion } from "../QuestionAccordion/QuestionAccordion";
import { QuestionDeck } from "../QuestionDeck/QuestionDeck";
import { MultipleChoiceAnsweredContent } from "../MultipleChoiceAnsweredContent/MultipleChoiceAnsweredContent";
import { useState } from "react";
import AvatarPlaceholder from "../../../public/images/avatar_placeholder.png";
import { BooleanAnsweredContent } from "../BooleanAnsweredContent/BooleanAnsweredContent";
import { Button } from "../Button/Button";
import { revealDeck, revealQuestion } from "@/app/actions/reveal";
import dayjs from "dayjs";

type HomeFeedRowProps = {
  element: Deck | Question;
  type: ElementType;
  isAnswered: boolean;
  isRevealed: boolean;
};

const AnsweredQuestionContentFactory = (element: Question) => {
  const baseProps = {
    questionOptions: (element as any).questionOptions,
    avatarSrc: AvatarPlaceholder.src,
  };

  switch (element.type) {
    case "MultiChoice":
      return <MultipleChoiceAnsweredContent {...baseProps} />;
    case "TrueFalse":
      return <BooleanAnsweredContent {...baseProps} />;
    case "YesNo":
      return <BooleanAnsweredContent {...baseProps} />;
    default:
      return <></>;
  }
};

export function HomeFeedRow({
  element,
  type,
  isAnswered,
  isRevealed,
}: HomeFeedRowProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  if (type === ElementType.Question && isAnswered) {
    const question = element as any;
    const actionSubmit =
      !isRevealed && dayjs(element.revealAtDate).isBefore(new Date()) ? (
        <Button
          variant="white"
          onClick={async () => {
            await revealQuestion(element.id);
          }}
        >
          Submit
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
        {AnsweredQuestionContentFactory(question)}
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
