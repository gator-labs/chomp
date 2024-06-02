import { ClockIcon } from "../Icons/ClockIcon";
import { PercentageIcon } from "../Icons/PercentageIcon";
import { QuestIcon } from "../Icons/QuestIcon";
import { TrendingIcon } from "../Icons/TrendingIcon";
import { StatsChip } from "./StatsChip";

type DashboardUserStats = {
  cardsChomped: string;
  averageTimeToAnswer: string;
  daysStreak: string;
  totalPointsEarned: string;
};

export function DashboardUserStats({
  cardsChomped,
  averageTimeToAnswer,
  daysStreak,
  totalPointsEarned,
}: DashboardUserStats) {
  return (
    <div className="w-full">
      <div className="flex gap-2 mb-2">
        <StatsChip
          title="Cards Chomped"
          info={cardsChomped}
          icon={<QuestIcon />}
          className="basis-1/2"
        />
        <StatsChip
          title="Average Time Per Question"
          info={averageTimeToAnswer}
          icon={<ClockIcon />}
          className="basis-1/2"
        />
      </div>
      <div className="flex gap-2">
        <StatsChip
          title="Longest Streak"
          info={daysStreak}
          icon={<TrendingIcon />}
          className="basis-1/2"
        />
        <StatsChip
          title="Total Points Earned"
          info={totalPointsEarned}
          icon={<PercentageIcon />}
          className="basis-1/2"
        />
      </div>
    </div>
  );
}
