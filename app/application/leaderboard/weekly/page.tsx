import Leaderboard from "@/app/components/Leaderboard/Leaderboard";
import { getCurrentUser } from "@/app/queries/user";
import { redirect } from "next/navigation";

const WeeklyLeaderboard = async () => {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <Leaderboard
      leaderboardName="Weekly Leaderboard"
      variant="weekly"
      loggedUser={user}
    />
  );
};

export default WeeklyLeaderboard;
