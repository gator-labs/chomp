import { Navbar } from "@/app/components/Navbar/Navbar";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { DashboardUserStats } from "../components/DashboardUserStats/DashboardUserStats";
import { getUserStatistics } from "../queries/home";

type PageProps = {};

export default async function Page({}: PageProps) {
  const stats = await getUserStatistics();

  return (
    <>
      <Navbar
        avatarSrc={AvatarPlaceholder.src}
        avatarLink="/application/profile"
        walletLink="/application/transactions"
      />
      <DashboardUserStats
        averageTimeToAnswer={stats.averageTimeToAnswer ?? "-"}
        cardsChomped={stats.cardsChomped?.toString() ?? "-"}
        daysStreak={stats.daysStreak ?? "0"}
        totalPointsEarned={stats.totalPointsEarned ?? "-"}
      />
    </>
  );
}
