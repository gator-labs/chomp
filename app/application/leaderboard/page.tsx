import ChompLeaderboard from "@/app/components/ChompLeaderboard/ChompLeaderboard";
import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import StackLeaderboard from "@/app/components/StackLeaderboard/StackLeaderboard";

const LeaderboardPage = async () => {
  return (
    <>
      <div>
        <ProfileNavigation />
        <div className="flex flex-col gap-4 pb-4">
          <ChompLeaderboard />
          <StackLeaderboard />
        </div>
      </div>
    </>
  );
};

export default LeaderboardPage;
