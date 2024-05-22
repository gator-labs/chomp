import { Navbar } from "@/app/components/Navbar/Navbar";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { DashboardUserStats } from "../components/DashboardUserStats/DashboardUserStats";
import { HomeFeedDeckExpiringSection } from "../components/HomeFeedDeckExpiringSection/HomeFeedDeckExpiringSection";
import { HomeFeedRevealedQuestionsSection } from "../components/HomeFeedRevealedQuestionsSection/HomeFeedRevealedQuestionsSection";
import {
  getDecksForExpiringSection,
  getQuestionsForRevealedSection,
  getUserStatistics,
} from "../queries/home";

type PageProps = {};

export default async function Page({}: PageProps) {
  const stats = await getUserStatistics();
  const questions = await getQuestionsForRevealedSection();
  const decks = await getDecksForExpiringSection();

  return (
    <>
      <Navbar
        avatarSrc={AvatarPlaceholder.src}
        avatarLink="/application/profile"
        walletLink="/application/transactions"
      />
      <DashboardUserStats
        averageTimeToAnswer={stats.averageTimeToAnswer}
        cardsChomped={stats.cardsChomped}
        daysStreak={stats.daysStreak}
        totalPointsEarned={stats.totalPointsEarned}
      />
      <HomeFeedDeckExpiringSection decks={decks} />
      <HomeFeedRevealedQuestionsSection questions={questions} />
    </>
  );
}
