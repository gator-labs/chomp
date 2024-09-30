import { getStacks } from "@/app/queries/stack";
import LeaderboardCard from "../LeaderboardCard/LeaderboardCard";

const StackLeaderboard = async () => {
  const stacks = await getStacks();

  if (!stacks.length) return;

  return (
    <div className="flex flex-col gap-2">
      <p>Stack Leaderboard</p>
      <ul className="flex flex-col gap-2">
        {stacks.map((stack) => (
          <LeaderboardCard
            key={stack.id}
            name={stack.name}
            href={`/application/leaderboard/stack/${stack.id}`}
            imageSrc={stack.image}
            isActive={stack.isActive}
            showActiveIndicator
          />
        ))}
      </ul>
    </div>
  );
};

export default StackLeaderboard;
