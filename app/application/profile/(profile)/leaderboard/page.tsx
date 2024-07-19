import CampaignLeaderboard from "@/app/components/CampaignLeaderboard/CampaignLeaderboard";
import ChompLeaderboard from "@/app/components/ChompLeaderboard/ChompLeaderboard";

const LeaderboardPage = () => {
  return (
    <div className="flex flex-col gap-4 overflow-auto pb-4">
      <ChompLeaderboard />
      <CampaignLeaderboard />
    </div>
  );
};

export default LeaderboardPage;
