import { getUserStatistics } from "@/app/queries/home";
import { ClockIcon } from "../Icons/ClockIcon";
import { PercentageIcon } from "../Icons/PercentageIcon";
import { QuestIcon } from "../Icons/QuestIcon";
import { TrendingIcon } from "../Icons/TrendingIcon";
import ChompSpeedInfo from "../InfoBoxes/Home/ChompSpeedInfo";
import DailyDeckStreakInfo from "../InfoBoxes/Home/DailyDeckStreakInfo";
import TotalCardChompedInfo from "../InfoBoxes/Home/TotalCardsChompedInfo";
import TotalPointsEarnedInfo from "../InfoBoxes/Home/TotalPointsEarnedInfo";
import { StatsChip } from "./StatsChip";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function DashboardUserStats() {
  const stats = await getUserStatistics();

  return (
    <div className="w-full space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <TotalCardChompedInfo>
          <StatsChip
            title="Cards Chomped"
            info={stats.cardsChomped}
            icon={<QuestIcon />}
            className="basis-1/2"
          />
        </TotalCardChompedInfo>
        <ChompSpeedInfo>
          <StatsChip
            title="Average Time Per Question"
            info={stats.averageTimeToAnswer}
            icon={<ClockIcon />}
            className="basis-1/2"
          />
        </ChompSpeedInfo>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <DailyDeckStreakInfo>
          <StatsChip
            title="Longest Streak"
            info={stats.daysStreak}
            icon={<TrendingIcon />}
            className="basis-1/2"
          />
        </DailyDeckStreakInfo>
        <TotalPointsEarnedInfo>
          <StatsChip
            title="Total Points Earned"
            info={stats.totalPointsEarned}
            icon={<PercentageIcon />}
            className="basis-1/2"
          />
        </TotalPointsEarnedInfo>
      </div>
    </div>
  );
}
