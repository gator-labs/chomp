import { ClockIcon } from "../Icons/ClockIcon";
import { PercentageIcon } from "../Icons/PercentageIcon";
import { QuestIcon } from "../Icons/QuestIcon";
import { TrendingIcon } from "../Icons/TrendingIcon";
import ChompSpeedInfo from "../InfoBoxes/Home/ChompSpeed";
import DailyDeckStreakInfo from "../InfoBoxes/Home/DailyDeckStreak";
import TotalCardChompedInfo from "../InfoBoxes/Home/TotalCardsChomped";
import TotalPointsEarnedInfo from "../InfoBoxes/Home/TotalPointsEarned";
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
    <div className="w-full space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <TotalCardChompedInfo>
          <StatsChip
            title="Cards Chomped"
            info={cardsChomped}
            icon={<QuestIcon />}
            className="basis-1/2"
          />
        </TotalCardChompedInfo>
        <ChompSpeedInfo>
          <StatsChip
            title="Average Time Per Question"
            info={averageTimeToAnswer}
            icon={<ClockIcon />}
            className="basis-1/2"
          />
        </ChompSpeedInfo>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <DailyDeckStreakInfo>
          <StatsChip
            title="Longest Streak"
            info={daysStreak}
            icon={<TrendingIcon />}
            className="basis-1/2"
          />
        </DailyDeckStreakInfo>
        <TotalPointsEarnedInfo>
          <StatsChip
            title="Total Points Earned"
            info={totalPointsEarned}
            icon={<PercentageIcon />}
            className="basis-1/2"
          />
        </TotalPointsEarnedInfo>
      </div>
    </div>
  );
}
