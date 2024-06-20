"use client";
import { DeckQuestionIncludes, getQuestionState } from "@/app/utils/question";
import { ClaimFeedQuestionCard } from "../ClaimFeedQuestionCard/ClaimFeedQuestionCard";
import { FeedQuestionCard } from "../FeedQuestionCard/FeedQuestionCard";
import { RevealFeedQuestionCard } from "../RevealFeedQuestionCard/RevealFeedQuestionCard";

type DeckDetailsFeedRowCardProps = {
  element: DeckQuestionIncludes;
};

export function DeckDetailsFeedRowCard({
  element,
}: DeckDetailsFeedRowCardProps) {
  const state = getQuestionState(element);

  if (state.isRevealed) {
    return (
      <ClaimFeedQuestionCard
        id={element.id}
        question={element.question}
        answerCount={element.answerCount}
        revealAtAnswerCount={element.revealAtAnswerCount ?? undefined}
        revealAtDate={element.revealAtDate ?? new Date()}
      />
    );
  }

  if (state.isRevealable) {
    return (
      <RevealFeedQuestionCard
        id={element.id}
        question={element.question}
        answerCount={element.answerCount}
        revealAtAnswerCount={element.revealAtAnswerCount ?? undefined}
        revealAtDate={element.revealAtDate ?? new Date()}
        revealTokenAmount={element.revealTokenAmount ?? 0}
      />
    );
  }

  return (
    <FeedQuestionCard
      question={element.question}
      answerCount={element.answerCount}
      revealAtAnswerCount={element.revealAtAnswerCount ?? undefined}
      revealAtDate={element.revealAtDate ?? new Date()}
      statusLabel={<span className="text-xs leading-6 text-aqua">Chomped</span>}
    />
  );
}
