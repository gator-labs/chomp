"use client";
import Link from "next/link";
import { QuestionAccordion } from "../QuestionAccordion/QuestionAccordion";
import { useState } from "react";
import { Button } from "../Button/Button";
import { revealQuestion } from "@/app/actions/reveal";
import dayjs from "dayjs";
import { DeckQuestionIncludes } from "./DeckDetails";
import { AnsweredQuestionContentFactory } from "@/app/utils/answeredQuestionFactory";
import { getQuestionState } from "@/app/utils/question";
import { useRouter } from "next/navigation";

type DeckDetailsRowProps = {
  element: DeckQuestionIncludes;
};

export function DeckDetailsRow({ element }: DeckDetailsRowProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { isAnswered, isRevealed } = getQuestionState(element);
  const router = useRouter();
  if (isAnswered) {
    const actionSubmit =
      !isRevealed && dayjs(element.revealAtDate).isBefore(new Date()) ? (
        <Button
          variant="white"
          isPill
          onClick={async () => {
            await revealQuestion(element.id);
            router.refresh();
          }}
        >
          Reveal Results
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
