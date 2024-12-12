import { HOME_STAT_CARD_TYPE } from "@/app/constants/tracking";
import {
  getUsersLatestStreakAndMysteryBox,
  getUsersTotalClaimedAmount,
} from "@/app/queries/home";
import { CreditCardIcon, Goal, InfoIcon } from "lucide-react";

import LatestStreakBox from "../LatestStreakBox/LatestStreakBox";
import { StatsBox } from "../StatsBox/StatsBox";

export async function DashboardUserStats() {
  const [[latestStreak, mysteryBoxId], totalClaimedAmount] = await Promise.all([
    getUsersLatestStreakAndMysteryBox(),
    getUsersTotalClaimedAmount(),
  ]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <LatestStreakBox
        latestStreak={latestStreak}
        mysteryBoxId={mysteryBoxId}
      />
      <StatsBox
        title={totalClaimedAmount.toLocaleString("en-US")}
        description="BONK Claimed"
        icon={<InfoIcon width={25} height={25} />}
        drawerProps={{
          title: "BONK Claimed",
          description:
            "Knowledge pays off. Earn BONK for providing the best answers. Keep stacking! ",
          type: HOME_STAT_CARD_TYPE.BONK_CLAIMED as keyof typeof HOME_STAT_CARD_TYPE,
        }}
        titleColor="claimed"
      />
      <StatsBox
        title={`0 Points`}
        description="Earned to date"
        icon={<Goal width={25} height={25} />}
        drawerProps={{
          title: "Points Earned",
          description: "",
          type: HOME_STAT_CARD_TYPE.POINTS_EARNED as keyof typeof HOME_STAT_CARD_TYPE,
        }}
        titleColor="points"
      />
      <StatsBox
        title={`0 Credits`}
        description="Earned to date"
        icon={<CreditCardIcon width={25} height={25} />}
        drawerProps={{
          title: "Credits Earned",
          description: "",
          type: HOME_STAT_CARD_TYPE.CREDITS_EARNED as keyof typeof HOME_STAT_CARD_TYPE,
        }}
        titleColor="credits"
      />
    </div>
  );
}
