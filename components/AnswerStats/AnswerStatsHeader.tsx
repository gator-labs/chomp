import BackButton from "@/app/components/BackButton/BackButton";

import { AnswerRewards } from "./AnswerRewards";

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
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={false}
        isCorrect={true}
        variant="filled"
      />
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={false}
        isCorrect={false}
        variant="filled"
      />
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={true}
        isCorrect={true}
        variant="filled"
      />
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={true}
        isCorrect={false}
        variant="filled"
      />
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={false}
        isCorrect={true}
        variant="outline"
      />
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={false}
        isCorrect={false}
        variant="outline"
      />
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={true}
        isCorrect={true}
        variant="outline"
      />
      <AnswerRewards
        bonkReward={bonkReward}
        creditsReward={creditsReward}
        isPracticeQuestion={true}
        isCorrect={false}
        variant="outline"
      />
    </div>
  );
}
