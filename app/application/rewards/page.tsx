import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import { getValidationRewardQuestions } from "@/app/queries/getVaidationRewardQuestion";
import MysteryBoxHub from "@/components/MysteryBox/MysteryBoxHub";
import MysteryBoxHistory from "@/components/MysteryBoxHub/MysteryBoxHistory";

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
        <hr className="border-gray-600 my-2 p-0" />
        <MysteryBoxHistory />
      </>
    );
  } else {
    throw new Error("Content Unavailable");
  }
}

export default Page;
