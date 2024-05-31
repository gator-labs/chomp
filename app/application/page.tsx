import { DashboardUserStats } from "../components/DashboardUserStats/DashboardUserStats";
import { HomeFeedDeckExpiringSection } from "../components/HomeFeedDeckExpiringSection/HomeFeedDeckExpiringSection";
import { HomeFeedReadyToRevealSection } from "../components/HomeFeedReadyToRevealSection/HomeFeedReadyToRevealSection";
import { HomeFeedRevealedQuestionsSection } from "../components/HomeFeedRevealedQuestionsSection/HomeFeedRevealedQuestionsSection";
import {
  getDecksForExpiringSection,
  getQuestionsForReadyToRevealSection,
  getQuestionsForRevealedSection,
  getUserStatistics,
} from "../queries/home";

type PageProps = {};

export default async function Page({}: PageProps) {
  const stats = await getUserStatistics();
  const questionsRevealed = await getQuestionsForRevealedSection();
  const questionsForReveal = await getQuestionsForReadyToRevealSection();
  const decks = await getDecksForExpiringSection();

  return (
    <>
      <DashboardUserStats
        averageTimeToAnswer={stats.averageTimeToAnswer}
        cardsChomped={stats.cardsChomped}
        daysStreak={stats.daysStreak}
        totalPointsEarned={stats.totalPointsEarned}
      />
      <HomeFeedDeckExpiringSection decks={decks} />
      <HomeFeedReadyToRevealSection questions={questionsForReveal} />
      <HomeFeedRevealedQuestionsSection questions={questionsRevealed} />
    </>
  );
}
