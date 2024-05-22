"use client";

import { dismissQuestion } from "@/app/actions/chompResult";
import { RevealedQuestion } from "@/app/queries/home";
import { HomeFeedCardCarousel } from "../HomeFeedCardsCarousel/HomeFeedCardsCarousel";
import { HomeFeedEmptyQuestionCard } from "../HomeFeedEmptyQuestionCard/HomeFeedEmptyQuestionCard";
import { HomeFeedQuestionCard } from "../HomeFeedQuestionCard/HomeFeedQuestionCard";

type HomeFeedRevealedQuestionsSectionProps = {
  questions: RevealedQuestion[];
};

const QUESTIONS_IN_SECTION = 5;
export function HomeFeedRevealedQuestionsSection({
  questions,
}: HomeFeedRevealedQuestionsSectionProps) {
  const questionSlides = questions
    .filter((_, index) => index < QUESTIONS_IN_SECTION)
    .map((q) => (
      <HomeFeedQuestionCard
        key={q.id}
        question={q.question}
        answerCount={q.answerCount}
        revealAtAnswerCount={q.revealAtAnswerCount}
        revealAtDate={q.revealAtDate}
        onClear={() => dismissQuestion(q.id)}
        onView={() => {}}
      />
    ));

  return (
    <HomeFeedCardCarousel
      className="mt-6"
      title={
        <span className="text-base text-white">
          Check out others’ revealed questions
        </span>
      }
      slides={
        questions.length > 0 ? questionSlides : [<HomeFeedEmptyQuestionCard />]
      }
    />
  );
}
