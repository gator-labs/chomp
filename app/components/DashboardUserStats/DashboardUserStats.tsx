import { HOME_STAT_CARD_TYPE } from "@/app/constants/tracking";
import {
  getUsersLatestStreak,
  getUsersTotalClaimedAmount,
} from "@/app/queries/home";
import {
  CalendarCheckIcon,
  CreditCardIcon,
  Goal,
  InfoIcon,
} from "lucide-react";

import { StatsBox } from "../StatsBox/StatsBox";

export async function DashboardUserStats() {
  const [latestStreak, totalClaimedAmount] = await Promise.all([
    getUsersLatestStreak(),
    getUsersTotalClaimedAmount(),
  ]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full gap-2">
        <StatsBox
          title={`${latestStreak} Day${latestStreak === 1 ? "" : "s"} Streak`}
          description={
            latestStreak === 0 ? "It's never too late to start" : "Keep it up!"
          }
          icon={<CalendarCheckIcon width={25} height={25} />}
          drawerProps={{
            title: "Streak",
            description:
              "Keep going! Streaks track consecutive days you've answered or revealed. How long can you keep it up?",
            type: HOME_STAT_CARD_TYPE.STREAK as keyof typeof HOME_STAT_CARD_TYPE,
          }}
          titleColor={latestStreak === 0 ? "no-streak" : "streak"}
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
      </div>
      <div className="flex w-full gap-2">
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
    </div>
  );
}
