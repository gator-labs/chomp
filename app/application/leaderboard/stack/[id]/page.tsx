import Leaderboard from "@/app/components/Leaderboard/Leaderboard";
import { getStack } from "@/app/queries/stack";
import { getCurrentUser } from "@/app/queries/user";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

const StackLeaderboardPage = async ({ params }: PageProps) => {
  const [user, stack] = await Promise.all([
    getCurrentUser(),
    getStack(Number(params.id)),
  ]);

  if (!stack) return notFound();

  return (
    <Leaderboard
      leaderboardName={stack.name}
      isLeaderboardActive={stack.isActive}
      leaderboardImage={stack.image}
      stackId={stack.id}
      loggedUser={user!}
      variant="stack"
    />
  );
};

export default StackLeaderboardPage;
