import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isPast,
} from "date-fns";

type GetQuestionStatusProps = {
  isAnswered: boolean;
  isClaimed: boolean;
  isRevealable: boolean;
  claimedAmount?: number;
};

export function getRevealAtText(date: Date): string {
  const now = new Date();

  if (isPast(date)) {
    const daysAgo = differenceInDays(now, date);
    const hoursAgo = differenceInHours(now, date);
    const minutesAgo = differenceInMinutes(now, date);

    if (daysAgo > 0) {
      return `Revealed ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
    } else if (hoursAgo > 0) {
      return `Revealed ${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
    } else {
      return `Revealed ${minutesAgo} minute${minutesAgo > 1 ? "s" : ""} ago`;
    }
  } else {
    const daysUntil = differenceInDays(date, now);
    const hoursUntil = differenceInHours(date, now);

    if (daysUntil > 0) {
      return `Revealing in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`;
    } else if (hoursUntil > 0) {
      return `Revealing in ${hoursUntil} hour${hoursUntil > 1 ? "s" : ""}`;
    } else {
      const minutesUntil = differenceInMinutes(date, now);
      return `Revealing in ${minutesUntil} minute${minutesUntil > 1 ? "s" : ""}`;
    }
  }
}

export function getTimeUntilReveal(date: Date): string {
  const now = new Date();

  if (isPast(date)) {
    return "Revealed";
  } else {
    const daysUntil = differenceInDays(date, now);
    const hoursUntil = differenceInHours(date, now);

    if (daysUntil > 0) {
      return `View Results in ${daysUntil} day${daysUntil > 1 ? "s" : ""}`;
    } else if (hoursUntil > 0) {
      return `View Results in ${hoursUntil} hour${hoursUntil > 1 ? "s" : ""}`;
    } else {
      const minutesUntil = differenceInMinutes(date, now);
      return `View Results in ${minutesUntil} minute${minutesUntil > 1 ? "s" : ""}`;
    }
  }
}

export function getQuestionStatus({
  isAnswered,
  isClaimed,
  isRevealable,
  claimedAmount,
}: GetQuestionStatusProps): string {
  if (!isAnswered && isRevealable) return "Reveal unchomped question";
  if (isAnswered && isRevealable) return "Chomped";
  if (isClaimed && !!claimedAmount && claimedAmount > 0)
    return `${claimedAmount.toLocaleString("en-US")} $BONK Rewarded`;

  return "";
}
