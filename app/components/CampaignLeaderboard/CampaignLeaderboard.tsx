import { getCampaigns } from "@/app/queries/campaign";
import LeaderboardCard from "../LeaderboardCard/LeaderboardCard";

const CampaignLeaderboard = async () => {
  const campaigns = await getCampaigns();

  if (!campaigns.length) return;

  return (
    <div className="flex flex-col gap-2">
      <p>Stack Leaderboard</p>
      <ul className="flex flex-col gap-2">
        {campaigns.map((campaign) => (
          <LeaderboardCard
            key={campaign.id}
            name={campaign.name}
            href={`/application/leaderboard/campaign/${campaign.id}`}
            imageSrc={campaign.image}
            isActive={campaign.isActive}
            showActiveIndicator
          />
        ))}
      </ul>
    </div>
  );
};

export default CampaignLeaderboard;
