import MysteryBoxHub from "@/app/components/MysteryBoxHub/MysteryBoxHub";
import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import { getValidationRewardQuestions } from "@/app/queries/mysteryBox";

async function Page() {
  const CREDIT_COST_FEATURE_FLAG =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

  if (CREDIT_COST_FEATURE_FLAG) {
    const [validationRewardQuestions] = await Promise.all([
      getValidationRewardQuestions(),
    ]);

    const isUserEligibleForValidationReward: boolean =
      !!validationRewardQuestions && validationRewardQuestions.length > 0;
    return (
      <>
        <ProfileNavigation />
        <MysteryBoxHub
          isUserEligibleForValidationReward={isUserEligibleForValidationReward}
        />
      </>
    );
  } else {
    throw new Error("Content Unavailable");
  }
}

export default Page;
