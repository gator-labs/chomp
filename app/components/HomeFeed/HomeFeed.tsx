import Link from "next/link";
import { QuestionAccordion } from "../QuestionAccordion/QuestionAccordion";
import { Deck, Question } from "@prisma/client";

export type HomeFeedProps = {
  unansweredDailyQuestions: Question[];
  unansweredUnrevealedQuestions: Question[];
  unansweredUnrevealedDecks: Deck[];
  answeredUnrevealedQuestions: Question[];
  answeredUnrevealedDecks: Deck[];
  answeredRevealedQuestions: Question[];
  answeredRevealedDecks: Deck[];
};

export function HomeFeed({ unansweredDailyQuestions }: HomeFeedProps) {
  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      {unansweredDailyQuestions.map((q) => (
        <Link key={q.id} href={`/application/answer/question/${q.id}`}>
          <QuestionAccordion
            question={q.question}
            reveleadAt={q.revealAtDate || new Date()}
            status="new"
          />
        </Link>
      ))}
    </div>
  );
}
