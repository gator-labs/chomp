import BackButton from "@/app/components/BackButton/BackButton";
import { QuestionCorrectIcon } from "@/app/components/Icons/QuestionCorrectIcon";
import { formatCompactAmount } from "@/app/utils/number";

export type AnswerStatsHeaderProps = {
  title: string;
  bonkReward: string;
  creditsReward: string;
};

export function AnswerStatsHeader({
  title,
  bonkReward,
  creditsReward,
}: AnswerStatsHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex">
        <BackButton />
        <div className="bg-white text-black font-bold p-2 rounded-lg">
          {title}
        </div>
      </div>
      <div className="bg-gray-700 rounded-md flex p-2 gap-2">
        <QuestionCorrectIcon height={48} width={48} />
        <div className="bg-gray-400 rounded-lg px-4 font-bold align-middle items-center flex">
          +{formatCompactAmount(bonkReward) ?? 0} BONK
        </div>
        <div className="bg-gray-400 rounded-lg px-4 font-bold align-middle items-center flex">
          +{creditsReward ?? 0} Credits
        </div>
      </div>
    </div>
  );
}
