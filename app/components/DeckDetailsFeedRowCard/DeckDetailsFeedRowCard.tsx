"use client";

import { DeckQuestionIncludes, getQuestionState } from "@/app/utils/question";

import { ClaimFeedQuestionCard } from "../ClaimFeedQuestionCard/ClaimFeedQuestionCard";
import { FeedQuestionCard } from "../FeedQuestionCard/FeedQuestionCard";
import { RevealFeedQuestionCard } from "../RevealFeedQuestionCard/RevealFeedQuestionCard";
import { SeeFeedQuestionCard } from "../SeeFeedQuestionCard/SeeFeedQuestionCard";

type DeckDetailsFeedRowCardProps = {
  element: DeckQuestionIncludes;
};

export function DeckDetailsFeedRowCard({
  element,
}: DeckDetailsFeedRowCardProps) {
  const state = getQuestionState(element);

  if (!state.isClaimable || state.isRevealed) {
    return (
      <SeeFeedQuestionCard
        id={element.id}
        question={element.question}
        answerCount={element.answerCount}
        revealAtAnswerCount={element.revealAtAnswerCount ?? undefined}
        revealAtDate={element.revealAtDate ?? new Date()}
      />
    );
  }

  if (state.isClaimed) {
    return (
      <FeedQuestionCard
        question={element.question}
        answerCount={element.answerCount}
        revealAtAnswerCount={element.revealAtAnswerCount ?? undefined}
        revealAtDate={element.revealAtDate ?? new Date()}
        statusLabel={
          <span className="text-xs leading-6 text-aqua">Claimed</span>
        }
      />
    );
  }

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

  if (state.isClaimable) {
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
