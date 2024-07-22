import { getUserStatistics } from "@/app/queries/home";
import { CardsChompedIcon } from "../Icons/CardsChompedIcon";
import { StreakIcon } from "../Icons/StreakIcon";
import { TimeIcon } from "../Icons/TimeIcon";
import { TotalPercentageIcon } from "../Icons/TotalPercentageIcon";
import ChompSpeedInfo from "../InfoBoxes/Home/ChompSpeedInfo";
import DailyDeckStreakInfo from "../InfoBoxes/Home/DailyDeckStreakInfo";
import TotalCardChompedInfo from "../InfoBoxes/Home/TotalCardsChompedInfo";
import TotalPointsEarnedInfo from "../InfoBoxes/Home/TotalPointsEarnedInfo";
import { StatsCard } from "../StatsCard/StatsCard";

export async function UserStatsCards() {
  const stats = await getUserStatistics();

  return (
    <div className="w-full flex flex-col gap-y-2">
      <TotalCardChompedInfo>
        <StatsCard
          title="Cards Chomped"
          value={stats.cardsChomped}
          icon={<CardsChompedIcon height={38} width={38} fill="#A3A3EC" />}
        />
      </TotalCardChompedInfo>
      <ChompSpeedInfo>
        <StatsCard
          title="Average Time Per Question"
          value={stats.averageTimeToAnswer}
          icon={<TimeIcon height={38} width={38} fill="#A3A3EC" />}
        />
      </ChompSpeedInfo>
      <DailyDeckStreakInfo>
        <StatsCard
          title="Longest Streak"
          value={stats.daysStreak}
          icon={<StreakIcon height={38} width={38} fill="#A3A3EC" />}
        />
      </DailyDeckStreakInfo>
      <TotalPointsEarnedInfo>
        <StatsCard
          title="Total Points Earned"
          value={stats.totalPointsEarned}
          icon={<TotalPercentageIcon height={38} width={38} fill="#A3A3EC" />}
        />
      </TotalPointsEarnedInfo>
    </div>
  );
}
