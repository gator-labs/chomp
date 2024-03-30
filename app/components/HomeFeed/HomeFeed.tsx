"use client";

import { useRouter } from "next/navigation";
import { QuestionAccordion } from "../QuestionAccordion/QuestionAccordion";
import { Question } from "@prisma/client";

type HomeFeedProps = {
  unansweredQuestions: Question[];
};

export function HomeFeed({ unansweredQuestions }: HomeFeedProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      {unansweredQuestions.map((q) => (
        <QuestionAccordion
          question={q.question}
          reveleadAt={q.revealAtDate || new Date()}
          status="new"
          onClick={() => router.push(`/application/answer/question/${q.id}`)}
          key={q.id}
        />
      ))}
    </div>
  );
}
