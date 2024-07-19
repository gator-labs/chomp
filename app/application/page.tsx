import { getJwtPayload } from "../actions/jwt";
import BannerSlider from "../components/BannerSlider/BannerSlider";
import { DashboardUserStats } from "../components/DashboardUserStats/DashboardUserStats";
import { HomeFeedDeckExpiringSection } from "../components/HomeFeedDeckExpiringSection/HomeFeedDeckExpiringSection";
import { HomeFeedReadyToRevealSection } from "../components/HomeFeedReadyToRevealSection/HomeFeedReadyToRevealSection";
import { HomeFeedRevealedQuestionsSection } from "../components/HomeFeedRevealedQuestionsSection/HomeFeedRevealedQuestionsSection";
import { Profile } from "../components/Profile/Profile";
import { getActiveBanners } from "../queries/banner";
import {
  getDecksForExpiringSection,
  getQuestionsForReadyToRevealSection,
  getQuestionsForRevealedSection,
  getUserStatistics,
} from "../queries/home";
import { getProfileImage } from "../queries/profile";
import { getAddressFromVerifiedCredentials } from "../utils/wallet";

type PageProps = {};

export default async function Page({}: PageProps) {
  const payload = await getJwtPayload();
  const stats = await getUserStatistics();
  const questionsRevealed = await getQuestionsForRevealedSection();
  const questionsForReveal = await getQuestionsForReadyToRevealSection();
  const decks = await getDecksForExpiringSection();
  const profileSrc = await getProfileImage();
  const address = getAddressFromVerifiedCredentials(payload);
  const banners = await getActiveBanners();

  return (
    <>
      <Profile address={address} avatarSrc={profileSrc} showLeaderboardButton />
      {banners.length && <BannerSlider banners={banners} />}
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
