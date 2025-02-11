import { HOME_STAT_CARD_TYPE } from "@/app/constants/tracking";
import {
  getUserTotalCreditAmount,
  getUserTotalPoints,
  getUsersLatestStreak,
  getUsersTotalClaimedAmount,
} from "@/app/queries/home";
import { CreditCardIcon, Goal, InfoIcon } from "lucide-react";

import LatestStreakBox from "../LatestStreakBox/LatestStreakBox";
import { StatsBox } from "../StatsBox/StatsBox";

export async function DashboardUserStats() {
  const [latestStreak, totalClaimedAmount, points, totalCredits] =
    await Promise.all([
      getUsersLatestStreak(),
      getUsersTotalClaimedAmount(),
      getUserTotalPoints(),
      getUserTotalCreditAmount(),
    ]);

  return (
    <div className="grid grid-cols-2 gap-2">
      <LatestStreakBox latestStreak={latestStreak} />
      <StatsBox
        title={totalClaimedAmount.toLocaleString("en-US")}
        description="BONK Won"
        icon={<InfoIcon width={25} height={25} />}
        drawerProps={{
          title: "BONK Won",
          description:
            "Knowledge pays off. Earn BONK for providing the best answers. Keep stacking! ",
          type: HOME_STAT_CARD_TYPE.BONK_CLAIMED as keyof typeof HOME_STAT_CARD_TYPE,
        }}
      />
      <StatsBox
        title={`${points.toLocaleString("en-US") ?? 0} Points`}
        description="Earned to date"
        icon={<Goal width={25} height={25} />}
        drawerProps={{
          title: "Points Earned",
          description:
            "Points are a reflection of all your CHOMPing actions! See how your actions translate into points in the sidebar. ➡️\nRight now, every 10 points = 1 raffle ticket in the Weekly Rewards Pool raffle.\nBut could points be something more? 🤔 That's for us to build and for you to find out. 🔜",
          type: HOME_STAT_CARD_TYPE.POINTS_EARNED as keyof typeof HOME_STAT_CARD_TYPE,
        }}
      />
      <StatsBox
        title={`${totalCredits.toLocaleString("en-US")} Credits`}
        description="Credits Balance"
        icon={<CreditCardIcon width={25} height={25} />}
        drawerProps={{
          title: "Credits Earned",
          description:
            "Credits? What could this be? 🤔\nChompy has the best answer for this (like they do with any question, of course), but it's not the right time to tell you yet. 😉\nGuess you better CHOMP around and find out. 🐊",
          type: HOME_STAT_CARD_TYPE.CREDITS_EARNED as keyof typeof HOME_STAT_CARD_TYPE,
        }}
      />
    </div>
  );
}
