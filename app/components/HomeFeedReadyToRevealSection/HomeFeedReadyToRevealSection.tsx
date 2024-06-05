"use client";

import { RevealedQuestion } from "@/app/queries/home";
import { HomeFeedCardCarousel } from "../HomeFeedCardsCarousel/HomeFeedCardsCarousel";
import { HomeFeedEmptyQuestionCard } from "../HomeFeedEmptyQuestionCard/HomeFeedEmptyQuestionCard";
import { RevealFeedQuestionCard } from "../RevealFeedQuestionCard/RevealFeedQuestionCard";

type HomeFeedReadyToRevealSectionProps = {
  questions: RevealedQuestion[];
};

export function HomeFeedReadyToRevealSection({
  questions,
}: HomeFeedReadyToRevealSectionProps) {
  const questionSlides = !!questions.length
    ? questions.map((q) => (
        <RevealFeedQuestionCard
          key={q.id}
          id={q.id}
          question={q.question}
          answerCount={q.answerCount}
          revealAtAnswerCount={q.revealAtAnswerCount}
          revealAtDate={q.revealAtDate}
          revealTokenAmount={q.revealTokenAmount}
        />
      ))
    : [
        <HomeFeedEmptyQuestionCard
          title="That’s all for now!"
          description="Come back later to see new answers to reveal here"
          key={0}
        />,
      ];

  return (
    <HomeFeedCardCarousel
      className="mt-6"
      title={
        <span className="text-base text-white">
          Your Chomps ready to reveal
        </span>
      }
      slides={questionSlides}
    />
  );
}
