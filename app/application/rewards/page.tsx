import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import { getValidationRewardQuestions } from "@/app/queries/getValidationRewardQuestion";
import MysteryBoxHub from "@/components/MysteryBox/MysteryBoxHub";
import { getCampaignBoxes } from "@/lib/mysteryBox/getCampaignBoxes";

async function Page() {
  const CREDIT_COST_FEATURE_FLAG =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

  if (CREDIT_COST_FEATURE_FLAG) {
    const [validationRewardQuestions, campaignBoxes] = await Promise.all([
      getValidationRewardQuestions(),
      getCampaignBoxes(),
    ]);

    const isUserEligibleForValidationReward: boolean =
      !!validationRewardQuestions && validationRewardQuestions.length > 0;

    return (
      <div className="mb-6">
        <ProfileNavigation />
        <MysteryBoxHub
          isUserEligibleForValidationReward={isUserEligibleForValidationReward}
          campaignBoxes={campaignBoxes}
        />
      </div>
    );
  } else {
    throw new Error("Content Unavailable");
  }
}

export default Page;
