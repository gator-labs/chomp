import Leaderboard from "@/app/components/Leaderboard/Leaderboard";
import { getCurrentUser } from "@/app/queries/user";
import { redirect } from "next/navigation";

const AllTimeLeaderboard = async () => {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <Leaderboard
      leaderboardName="All-time Leaderboard"
      variant="all-time"
      loggedUser={user}
    />
  );
};

export default AllTimeLeaderboard;
