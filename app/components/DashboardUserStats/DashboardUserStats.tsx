import { HOME_STAT_CARD_TYPE } from "@/app/constants/tracking";
import {
  getUsersLatestStreak,
  getUsersTotalClaimedAmount,
  getUsersTotalRevealedCards,
} from "@/app/queries/home";
import bonkImg from "@/public/images/bonk.png";
import Image from "next/image";

import DoubleCardIcon from "../Icons/DoubleCardIcon";
import LatestStreakBox from "../LatestStreakBox/LatestStreakBox";
import { StatsBox } from "../StatsBox/StatsBox";

export async function DashboardUserStats() {
  const [latestStreak, totalClaimedAmount, totalRevealedCards] =
    await Promise.all([
      getUsersLatestStreak(),
      getUsersTotalClaimedAmount(),
      getUsersTotalRevealedCards(),
    ]);

  return (
    <div className="flex flex-col gap-2">
      <LatestStreakBox latestStreak={latestStreak} />
      <div className="flex w-full gap-2">
        <StatsBox
          title={totalClaimedAmount.toLocaleString("en-US")}
          description="BONK Claimed"
          icon={
            <Image
              src={bonkImg.src}
              width={20}
              height={20}
              alt="bonk"
              className="object-cover rounded-full"
            />
          }
          drawerProps={{
            title: "BONK Claimed",
            description:
              "Knowledge pays off. Earn BONK for providing the best answers. Keep stacking! ",
            type: HOME_STAT_CARD_TYPE.BONK_CLAIMED as keyof typeof HOME_STAT_CARD_TYPE,
          }}
        />
        <StatsBox
          title={totalRevealedCards.toLocaleString("en-US")}
          description="Cards Revealed"
          icon={<DoubleCardIcon width={20} height={20} />}
          drawerProps={{
            title: "Cards Revealed",
            description:
              "Reveal any card to learn more. Provide the best answer to earn more. ",
            type: HOME_STAT_CARD_TYPE.CARDS_REVEALED as keyof typeof HOME_STAT_CARD_TYPE,
          }}
        />
      </div>
    </div>
  );
}
