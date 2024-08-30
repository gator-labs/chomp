import { getUserStatistics } from "@/app/queries/home";
import { PercentageIcon } from "../Icons/PercentageIcon";
import { QuestIcon } from "../Icons/QuestIcon";
import TotalCardChompedInfo from "../InfoBoxes/Home/TotalCardsChompedInfo";
import TotalPointsEarnedInfo from "../InfoBoxes/Home/TotalPointsEarnedInfo";
import { StatsChip } from "./StatsChip";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function DashboardUserStats() {
  const stats = await getUserStatistics();

  return (
    <div className="flex w-full space-x-2">
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
  );
}
