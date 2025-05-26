import ProfileNavigation from "@/app/components/ProfileNavigation/ProfileNavigation";
import { getValidationRewardQuestions } from "@/app/queries/getValidationRewardQuestion";
import MysteryBoxHub from "@/components/MysteryBox/MysteryBoxHub";
import { hasBonkAtaAccount } from "@/lib/bonk/hasBonkAtaAccount";
import { RewardsPromiseError } from "@/lib/error";
import { getCampaigns } from "@/lib/mysteryBox/getCampaigns";
import { captureException } from "@sentry/nextjs";
import pRetry, { Options as RetryOptions, FailedAttemptError } from "p-retry";

async function Page() {
  const CREDIT_COST_FEATURE_FLAG =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

  if (CREDIT_COST_FEATURE_FLAG) {
    try {
      const retryOptions: RetryOptions = {
        retries: 2,
        minTimeout: 1500,
        onFailedAttempt: (error: FailedAttemptError) => {
          // Capture exception to Sentry
          const wrappedError = new RewardsPromiseError(
            "Failed to fetch rewards page data",
            { cause: error },
          );
          captureException(wrappedError);

          console.warn(
            `Attempt ${error.attemptNumber} to fetch rewards page data failed. Retries left: ${error.retriesLeft}. Error: ${error.message}`
          );
        },
      };

      const [validationRewardQuestions, campaignBoxes, userHasBonkAtaAccount] =
        await Promise.all([
          pRetry(() => getValidationRewardQuestions(), retryOptions),
          pRetry(() => getCampaigns(), retryOptions),
          pRetry(() => hasBonkAtaAccount(), retryOptions),
        ]);

      const isUserEligibleForValidationReward: boolean =
        !!validationRewardQuestions && validationRewardQuestions.length > 0;

      return (
        <div className="mb-6">
          <ProfileNavigation />
          <MysteryBoxHub
            isUserEligibleForValidationReward={isUserEligibleForValidationReward}
            userHasBonkAtaAccount={userHasBonkAtaAccount}
            campaignBoxes={campaignBoxes}
          />
        </div>
      );
    } catch {
      throw new Error("Failed to load rewards page. Please try refreshing the page.");
    }
  } else {
    throw new Error("Content Unavailable");
  }
}

export default Page;
