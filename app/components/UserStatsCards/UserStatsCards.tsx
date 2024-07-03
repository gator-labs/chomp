import { CardsChompedIcon } from "../Icons/CardsChompedIcon";
import { StreakIcon } from "../Icons/StreakIcon";
import { TimeIcon } from "../Icons/TimeIcon";
import { TotalPercentageIcon } from "../Icons/TotalPercentageIcon";
import ChompSpeedInfo from "../InfoBoxes/Home/ChompSpeedInfo";
import DailyDeckStreakInfo from "../InfoBoxes/Home/DailyDeckStreakInfo";
import TotalCardChompedInfo from "../InfoBoxes/Home/TotalCardsChompedInfo";
import TotalPointsEarnedInfo from "../InfoBoxes/Home/TotalPointsEarnedInfo";
import { StatsCard } from "../StatsCard/StatsCard";

type UserStatsCards = {
  cardsChomped: string;
  averageTimeToAnswer: string;
  daysStreak: string;
  totalPointsEarned: string;
};

export function UserStatsCards({
  cardsChomped,
  averageTimeToAnswer,
  daysStreak,
  totalPointsEarned,
}: UserStatsCards) {
  return (
    <div className="w-full flex flex-col gap-y-2">
      <TotalCardChompedInfo>
        <StatsCard
          title="Cards Chomped"
          value={cardsChomped}
          icon={<CardsChompedIcon height={38} width={38} fill="#A3A3EC" />}
        />
      </TotalCardChompedInfo>
      <ChompSpeedInfo>
        <StatsCard
          title="Average Time Per Question"
          value={averageTimeToAnswer}
          icon={<TimeIcon height={38} width={38} fill="#A3A3EC" />}
          className="basis-1/2"
        />
      </ChompSpeedInfo>
      <DailyDeckStreakInfo>
        <StatsCard
          title="Longest Streak"
          value={daysStreak}
          icon={<StreakIcon height={38} width={38} fill="#A3A3EC" />}
          className="basis-1/2"
        />
      </DailyDeckStreakInfo>
      <TotalPointsEarnedInfo>
        <StatsCard
          title="Total Points Earned"
          value={totalPointsEarned}
          icon={<TotalPercentageIcon height={38} width={38} fill="#A3A3EC" />}
          className="basis-1/2"
        />
      </TotalPointsEarnedInfo>
    </div>
  );
}
