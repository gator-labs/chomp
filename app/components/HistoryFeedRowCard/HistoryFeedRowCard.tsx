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
  // Return null for now for questions on history
  if (element.isRevealed && element.type === "Question") {
    return null;
    return <ClaimFeedQuestionCard {...element} />;
  }
  // Return null for now for questions on history
  if (element.isRevealable && element.type === "Question") {
    return null;
    return <RevealFeedQuestionCard {...element} />;
  }

  let statusLabel = (
    <span className="text-xs leading-6 text-aqua">Chomp now</span>
  );

  if (element.isChomped) {
    statusLabel = <span className="text-xs leading-6 text-aqua">Chomped</span>;
  }

  if (element.isRevealed) {
    statusLabel = <span className="text-xs leading-6 text-aqua">Revealed</span>;
  }

  if (element.isClaimed) {
    statusLabel = <span className="text-xs leading-6 text-aqua">Claimed</span>;
  }

  const feedCard = <FeedQuestionCard {...element} statusLabel={statusLabel} />;

  if (element.type === "Question") {
    return feedCard;
  }

  return <Link href={`/application/deck/${element.id}`}>{feedCard}</Link>;
}
