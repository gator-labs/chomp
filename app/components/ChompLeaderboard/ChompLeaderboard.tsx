import LeaderboardCard from "../LeaderboardCard/LeaderboardCard";
import { CHOMP_LEADERBOARD } from "./constants";

const ChompLeaderboard = () => {
  return (
    <div className="flex flex-col gap-2">
      <p>Chomp Leaderboard</p>
      <ul className="flex flex-col gap-2">
        {CHOMP_LEADERBOARD.map((chomp) => (
          <LeaderboardCard
            key={chomp.label}
            name={chomp.label}
            href={chomp.href}
            icon={chomp.icon}
          />
        ))}
      </ul>
    </div>
  );
};

export default ChompLeaderboard;
