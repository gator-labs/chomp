import { getUsersLatestStreak, getUserStatistics } from "@/app/queries/home";
import { PercentageIcon } from "../Icons/PercentageIcon";
import { QuestIcon } from "../Icons/QuestIcon";
import TotalCardChompedInfo from "../InfoBoxes/Home/TotalCardsChompedInfo";
import TotalPointsEarnedInfo from "../InfoBoxes/Home/TotalPointsEarnedInfo";
import LatestStreakBox from "../LatestStreakBox/LatestStreakBox";
import { StatsChip } from "./StatsChip";

export async function DashboardUserStats() {
  const [stats, latestStreak] = await Promise.all([
    getUserStatistics(),
    getUsersLatestStreak(),
  ]);

  return (
    <div className="flex flex-col gap-2">
      <LatestStreakBox latestStreak={latestStreak} />
      <div className="flex w-full gap-2">
        <div className="flex-1">
          <TotalCardChompedInfo>
            <StatsChip
              title="Cards Chomped"
              info={stats.cardsChomped}
              icon={<QuestIcon />}
            />
          </TotalCardChompedInfo>
        </div>
        <div className="flex-1">
          <TotalPointsEarnedInfo>
            <StatsChip
              title="Total Points Earned"
              info={Number(stats.totalPointsEarned).toLocaleString("en-US")}
              icon={<PercentageIcon />}
            />
          </TotalPointsEarnedInfo>
        </div>
      </div>
    </div>
  );
}
