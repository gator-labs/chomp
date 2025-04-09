import { InfoIcon } from "@/app/components/Icons/InfoIcon";
import { QuestionCorrectIcon } from "@/app/components/Icons/QuestionCorrectIcon";
import { QuestionIncorrectIcon } from "@/app/components/Icons/QuestionIncorrectIcon";
import TrophyStarMarkIcon from "@/app/components/Icons/TrophyStarMarkIcon";
import { formatCompactAmount } from "@/app/utils/number";
import { cn } from "@/lib/utils";

export type AnswerRewardsProps = {
  bonkReward: string;
  creditsReward: string;
  isPracticeQuestion: boolean;
  isCorrect: boolean;
  variant: "filled" | "outline";
  onInfoIconClick?: () => void;
};

const ICON_SIZE = 45;

export function AnswerRewards({
  bonkReward,
  creditsReward,
  isPracticeQuestion,
  isCorrect,
  variant,
  onInfoIconClick,
}: AnswerRewardsProps) {
  const icon = isPracticeQuestion ? (
    isCorrect ? (
      <QuestionCorrectIcon
        height={ICON_SIZE}
        width={ICON_SIZE}
        fill="#71673B"
        color="#EDE1AB"
      />
    ) : (
      <QuestionIncorrectIcon
        height={ICON_SIZE}
        width={ICON_SIZE}
        fill="#71673B"
        color="#EDE1AB"
      />
    )
  ) : isCorrect ? (
    <QuestionCorrectIcon height={ICON_SIZE} width={ICON_SIZE} />
  ) : (
    <QuestionIncorrectIcon height={ICON_SIZE} width={ICON_SIZE} />
  );

  const pillStyle = cn(
    "bg-gray-400 rounded-xl px-4 font-bold align-middle items-center flex",
    {
      "bg-gray-800 text-gray-600": isPracticeQuestion,
      "bg-dark-green text-white": !isPracticeQuestion && isCorrect,
      "bg-dark-red text-white": !isPracticeQuestion && !isCorrect,
    },
  );

  return (
    <div
      className={cn(
        "rounded-2xl text-sm flex p-2 justify-between items-center w-full",
        {
          "bg-gray-700": variant == "filled",
          "border border-gray-500": variant == "outline",
        },
      )}
    >
      <div className="flex gap-1">
        {icon}
        <div className={pillStyle}>
          <TrophyStarMarkIcon
            fill={cn({
              "#4D4D4D": isPracticeQuestion,
              "#FFFFFF": !isPracticeQuestion,
            })}
          />
          <span className="ml-1">
            +{formatCompactAmount(bonkReward) ?? 0} BONK
          </span>
        </div>
        <div className={pillStyle}>
          <TrophyStarMarkIcon
            fill={cn({
              "#4D4D4D": isPracticeQuestion,
              "#FFFFFF": !isPracticeQuestion,
            })}
          />
          <span className="ml-1">
            +{formatCompactAmount(creditsReward) ?? 0} Credits
          </span>
        </div>
      </div>
      {onInfoIconClick && (
        <span onClick={onInfoIconClick} className="cursor-pointer">
          <InfoIcon width={32} height={32} fill="#FFFFFF" />
        </span>
      )}
    </div>
  );
}
