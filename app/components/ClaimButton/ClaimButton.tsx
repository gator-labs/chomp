"use client";

import { claimQuestions } from "@/app/actions/claim";
import { TELEGRAM_SUPPORT_LINK } from "@/app/constants/support";
import {
  REVEAL_TYPE,
  TRACKING_EVENTS,
  TRACKING_METADATA,
} from "@/app/constants/tracking";
import { useClaiming } from "@/app/providers/ClaimingProvider";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { CONNECTION } from "@/app/utils/solana";
import { RevealConfirmationError } from "@/lib/error";
import trackEvent from "@/lib/trackEvent";
import * as Sentry from "@sentry/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import Link from "next/link";

import { DollarIcon } from "../Icons/DollarIcon";
import RewardInfoBox from "../InfoBoxes/RevealPage/RewardInfoBox";
import Pill from "../Pill/Pill";
import { Button } from "../ui/button";

interface ClaimButtonProps {
  status: "claimable" | "claimed" | "unclaimable";
  className?: string;
  rewardAmount?: number;
  didAnswer?: boolean;
  questionIds: number[];
  questions?: string[];
  transactionHash?: string;
  revealNftId?: string | null;
  resultIds: number[];
  userId: string;
}

const ClaimButton = ({
  status,
  className,
  rewardAmount,
  didAnswer = true,
  questionIds,
  transactionHash,
  questions,
  revealNftId,
  resultIds,
  userId,
}: ClaimButtonProps) => {
  const { fire } = useConfetti();
  const { promiseToast, errorToast } = useToast();
  const queryClient = useQueryClient();
  const { isClaiming, setIsClaiming } = useClaiming();

  const onClick = async () => {
    try {
      if (isClaiming) return;

      setIsClaiming(true);

      trackEvent(TRACKING_EVENTS.CLAIM_STARTED, {
        [TRACKING_METADATA.QUESTION_ID]: questionIds,
        [TRACKING_METADATA.QUESTION_TEXT]: questions,
        [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
      });

      if (!revealNftId) {
        const tx = await CONNECTION.getTransaction(transactionHash!, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });

        if (!tx) return errorToast("Cannot get transaction");
      }

      promiseToast(claimQuestions(questionIds), {
        loading: "Claiming your rewards...",
        success: "You have successfully claimed your rewards!",
        error: (
          <div>
            <p>Transaction Failed!</p>
            <p>
              Please try again. If this issue keeps happening, let us know on{" "}
              <Link
                href={TELEGRAM_SUPPORT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-200 hover:underline"
              >
                Telegram
              </Link>
            </p>
          </div>
        ),
      })
        .then((res) => {
          trackEvent(TRACKING_EVENTS.CLAIM_SUCCEEDED, {
            [TRACKING_METADATA.QUESTION_ID]: res?.questionIds,
            [TRACKING_METADATA.CLAIMED_AMOUNT]: res?.claimedAmount,
            [TRACKING_METADATA.TRANSACTION_SIGNATURE]:
              res?.transactionSignature,
            [TRACKING_METADATA.QUESTION_TEXT]: res?.questions,
            [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
          });
          queryClient.resetQueries({ queryKey: ["questions-history"] });
          fire();
        })
        .finally(() => {
          setIsClaiming(false);
        });
    } catch (e) {
      const revealConfirmationError = new RevealConfirmationError(
        `Trouble confirming reveal hash while claiming for user id: ${userId} and questions ids: ${questionIds}`,
        { cause: e },
      );
      Sentry.captureException(revealConfirmationError, {
        extra: {
          questionIds,
          chompResults: resultIds,
          transactionHash: transactionHash,
        },
      });
      trackEvent(TRACKING_EVENTS.CLAIM_FAILED, {
        [TRACKING_METADATA.QUESTION_ID]: questionIds,
        [TRACKING_METADATA.QUESTION_TEXT]: questions,
        [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
      });

      errorToast(
        <div>
          <p>
            Claim failed with transaction{" "}
            <Link
              href={`https://explorer.solana.com/tx/${transactionHash}?cluster=mainnet-beta`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-200 hover:underline"
            >
              {`${transactionHash?.slice(0, 4)}...${transactionHash?.slice(-4)}. `}
            </Link>
            Please try claiming again. If this issue persist, let us know on{" "}
            <Link
              href={TELEGRAM_SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-200 hover:underline"
            >
              Telegram
            </Link>
          </p>
        </div>,
      );
    }
  };

  if (!didAnswer) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-gray-500">
          You did not participate in this Chomp
        </p>
        <div className="flex flex-col gap-4 w-full">
          <Button variant="disabled">
            Claim <DollarIcon fill="#666666" />
          </Button>
        </div>
      </div>
    );
  }

  if (status === "claimable" && rewardAmount !== 0) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-sm font-normal text-left">
            Your claimable reward:
          </p>
          <Pill onClick={onClick} variant="white" className="cursor-pointer">
            <span className="text-xs font-bold text-left">
              {numberToCurrencyFormatter.format(Math.round(rewardAmount || 0))}{" "}
              BONK
            </span>
          </Pill>
          <RewardInfoBox />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <Button
            className={classNames(
              "text-sm font-semibold text-left flex items-center justify-center",
              className,
              { "cursor-not-allowed opacity-50": isClaiming },
            )}
            onClick={onClick}
            disabled={isClaiming}
          >
            <span>Claim</span>
            <DollarIcon height={24} width={24} />
          </Button>
        </div>
      </div>
    );
  }

  if (status === "claimed" && rewardAmount !== 0) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-sm font-normal  text-left">You have claimed:</p>
          <Pill variant="white" className="!cursor-auto">
            <span className="text-xs font-bold  text-left">
              {numberToCurrencyFormatter.format(Math.floor(rewardAmount || 0))}{" "}
              BONK
            </span>
          </Pill>
          <RewardInfoBox />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <Button
            variant="disabled"
            className={classNames(
              "text-sm font-semibold text-left flex items-center justify-center border-none",
              className,
            )}
          >
            <span className="text-gray-500">Claimed</span>
            <DollarIcon height={24} width={24} fill="#666666" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div className="flex items-center justify-center gap-1">
        <p className="text-sm font-normal  text-left">Your claimable reward:</p>
        <Pill variant="white" className="!cursor-auto">
          <span className="text-xs font-bold  text-left">0 BONK</span>
        </Pill>
        <RewardInfoBox />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Button
          variant="disabled"
          className={classNames(
            "text-sm font-semibold text-left flex items-center justify-center border-none",
            className,
          )}
        >
          <span className="text-gray-500">Unclaimable</span>
          <DollarIcon height={24} width={24} fill="#666666" />
        </Button>
      </div>
    </div>
  );
};

export default ClaimButton;
