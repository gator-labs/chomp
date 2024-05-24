import { DashboardUserStats } from "../components/DashboardUserStats/DashboardUserStats";
import { getUserStatistics } from "../queries/home";

type PageProps = {};

export default async function Page({}: PageProps) {
  const stats = await getUserStatistics();

  return (
    <>
      <DashboardUserStats
        averageTimeToAnswer={stats.averageTimeToAnswer}
        cardsChomped={stats.cardsChomped}
        daysStreak={stats.daysStreak}
        totalPointsEarned={stats.totalPointsEarned}
      />
    </>
  );
}
