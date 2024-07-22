import Leaderboard from "@/app/components/Leaderboard/Leaderboard";
import { getCurrentUser } from "@/app/queries/user";

const DailyLeaderboard = async () => {
  const user = await getCurrentUser();

  return (
    <Leaderboard
      leaderboardName="Daily Leaderboard"
      variant="daily"
      loggedUser={user!}
    />
  );
};

export default DailyLeaderboard;
