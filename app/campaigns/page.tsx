import { getCampaigns } from "@/app/queries/campaign";
import LeaderboardCard from "../components/LeaderboardCard/LeaderboardCard";
import Main from "../components/Main/Main";

const CampaignLeaderboard = async () => {
  const campaigns = await getCampaigns();

  if (!campaigns.length) return;

  return (
    <Main>
      <div className="flex flex-col gap-2">
        <p>Campaigns</p>
        <ul className="flex flex-col gap-2">
          {campaigns.map((campaign) => (
            <LeaderboardCard
              key={campaign.id}
              name={campaign.name}
              imageSrc={campaign.image}
              isActive={campaign.isActive}
              showActiveIndicator
            />
          ))}
        </ul>
      </div>
    </Main>
  );
};

export default CampaignLeaderboard;
