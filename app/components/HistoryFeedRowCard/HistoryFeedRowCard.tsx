"use client";
import { HistoryResult } from "@/app/queries/history";
import Link from "next/link";
import { ClaimFeedQuestionCard } from "../ClaimFeedQuestionCard/ClaimFeedQuestionCard";
import { FeedQuestionCard } from "../FeedQuestionCard/FeedQuestionCard";
import { RevealFeedQuestionCard } from "../RevealFeedQuestionCard/RevealFeedQuestionCard";

type HistoryFeedRowCardProps = {
  element: HistoryResult;
};

export function HistoryFeedRowCard({ element }: HistoryFeedRowCardProps) {
  if (element.isRevealable && element.type === "Question") {
    return <RevealFeedQuestionCard {...element} />;
  }

  if (element.isRevealed && element.type === "Question") {
    return <ClaimFeedQuestionCard {...element} />;
  }

  let statusLabel = <></>;

  if (element.isRevealable) {
    statusLabel = <span className="text-xs leading-6 text-aqua">Chomped</span>;
  }

  if (element.isRevealed) {
    statusLabel = <span className="text-xs leading-6 text-aqua">Revealed</span>;
  }

  const feedCard = <FeedQuestionCard {...element} statusLabel={statusLabel} />;

  if (element.type === "Question") {
    return feedCard;
  }

  return <Link href={`/application/deck/${element.id}`}>{feedCard}</Link>;
}
