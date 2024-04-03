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

type HomeFeedRowProps = {
  element: Deck | Question;
  type: ElementType;
  isAnswered: boolean;
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

export function HomeFeedRow({ element, type, isAnswered }: HomeFeedRowProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  if (type === ElementType.Question && isAnswered) {
    const question = element as any;

    return (
      <QuestionAccordion
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        question={question.question}
        revealedAt={question.revealAtDate}
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
