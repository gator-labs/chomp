import Leaderboard from "@/app/components/Leaderboard/Leaderboard";
import { getCurrentUser } from "@/app/queries/user";

const WeeklyLeaderboard = async () => {
  const user = await getCurrentUser();

  return (
    <Leaderboard
      leaderboardName="Weekly Leaderboard"
      variant="weekly"
      loggedUser={user!}
    />
  );
};

export default WeeklyLeaderboard;
