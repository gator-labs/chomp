import Leaderboard from "@/app/components/Leaderboard/Leaderboard";
import { getCurrentUser } from "@/app/queries/user";
import { redirect } from "next/navigation";

const DailyLeaderboard = async () => {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <Leaderboard
      leaderboardName="Daily Leaderboard"
      variant="daily"
      loggedUser={user}
    />
  );
};

export default DailyLeaderboard;
