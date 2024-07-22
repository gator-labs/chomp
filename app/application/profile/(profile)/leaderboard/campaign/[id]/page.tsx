import Leaderboard from "@/app/components/Leaderboard/Leaderboard";
import { getCampaign } from "@/app/queries/campaign";
import { getCurrentUser } from "@/app/queries/user";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

const CampaignLeaderboardPage = async ({ params }: PageProps) => {
  const [user, campaign] = await Promise.all([
    getCurrentUser(),
    getCampaign(Number(params.id)),
  ]);

  if (!campaign) return notFound();

  return (
    <Leaderboard
      leaderboardName={campaign.name}
      isLeaderboardActive={campaign.isActive}
      leaderboardImage={campaign.image}
      campaignId={campaign.id}
      loggedUser={user!}
      variant="campaign"
    />
  );
};

export default CampaignLeaderboardPage;
