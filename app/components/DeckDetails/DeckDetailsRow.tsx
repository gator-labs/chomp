"use client";
import Link from "next/link";
import { QuestionAccordion } from "../QuestionAccordion/QuestionAccordion";
import { useState } from "react";
import { Button } from "../Button/Button";
import { revealQuestion } from "@/app/actions/reveal";
import dayjs from "dayjs";
import { DeckQuestionIncludes } from "./DeckDetails";
import { AnsweredQuestionContentFactory } from "@/app/utils/answeredQuestionFactory";

type DeckDetailsRowProps = {
  element: DeckQuestionIncludes;
};

export function DeckDetailsRow({ element }: DeckDetailsRowProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isAnswered = element.questionOptions.some(
    (qo) => qo.questionAnswer.length !== 0
  );
  const isRevealed = element.reveals.length !== 0;
  if (isAnswered) {
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
        question={element.question}
        revealedAt={element.revealAtDate}
        actionChild={actionSubmit}
        status="chomped"
      >
        {AnsweredQuestionContentFactory(element)}
      </QuestionAccordion>
    );
  }

  return (
    <Link href={`/application/answer/question/${element.id}`}>
      <QuestionAccordion
        question={element.question}
        revealedAt={element.revealAtDate}
        status="new"
      />
    </Link>
  );
}
