/* eslint-disable @next/next/no-img-element */
import ActiveIndicator from "@/app/components/ActiveIndicator/ActiveIndicator";
import { Avatar } from "@/app/components/Avatar/Avatar";
import CampaignRanking from "@/app/components/CampaignRanking/CampaignRanking";
import { HalfArrowLeftIcon } from "@/app/components/Icons/HalfArrowLeftIcon";
import { getCampaign } from "@/app/queries/campaign";
import { getCampaignLeaderboard } from "@/app/queries/leaderboard";
import { getCurrentUser } from "@/app/queries/user";
import { nthNumber } from "@/app/utils/number";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

const CampaignLeaderboardPage = async ({ params }: PageProps) => {
  const campaign = await getCampaign(Number(params.id));
  const user = await getCurrentUser();

  if (!campaign) return notFound();

  const { ranking, loggedInUserScore } = await getCampaignLeaderboard(
    Number(params.id),
    user!.id,
  );

  const { loggedInUserPoints, loggedInUserRank } = loggedInUserScore;

  return (
    <div className="pt-4 pb-1 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-4 py-[5px]">
        <Link href="/application/profile">
          <HalfArrowLeftIcon />
        </Link>
        <div className="relative w-[38px] h-[38px]">
          <ActiveIndicator isActive={campaign.isActive} />
          <img
            src={campaign.image}
            alt={`${campaign.name}-logo`}
            className="object-cover w-full h-full rounded-full"
          />
        </div>
        <p className="text-[20px] leading-6">{campaign.name}</p>
      </div>

      <div className="p-4 rounded-lg bg-[#333333] gap-4 flex">
        <Avatar src={user!.profileSrc || AvatarPlaceholder.src} size="medium" />
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs text-[#999999]">All time points</span>
          <div className="flex justify-between items-center">
            <p className="text-[15px] leading-[17.25px] font-bold">
              {!!loggedInUserRank
                ? `Ranking ${loggedInUserRank}
              ${nthNumber(loggedInUserRank)} place`
                : "- No Ranking Yet"}
            </p>
            <p className="text-xs font-bold">{loggedInUserPoints} Points</p>
          </div>
        </div>
      </div>

      <div className="border-[0.5px] border-[#999999] bg-[#E6E6E6] rounded py-[7px] px-[15px] w-fit">
        <p className="text-[#0D0D0D] text-xs">Total Points</p>
      </div>

      <CampaignRanking ranking={ranking} loggedUserId={user?.id!} />
    </div>
  );
};

export default CampaignLeaderboardPage;
