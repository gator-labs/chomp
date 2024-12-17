import { revealQuestion } from "@/app/actions/chompResult";
import { claimQuestions } from "@/app/actions/claim";
import {
  REVEAL_TYPE,
  TRACKING_EVENTS,
  TRACKING_METADATA,
} from "@/app/constants/tracking";
import { useClaiming } from "@/app/providers/ClaimingProvider";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { QuestionHistory } from "@/app/queries/history";
import { getQuestionStatus, getRevealAtText } from "@/app/utils/history";
import { CONNECTION } from "@/app/utils/solana";
import { cn } from "@/app/utils/tailwind";
import trackEvent from "@/lib/trackEvent";
import { RevealProps } from "@/types/reveal";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import Link from "next/link";
import { forwardRef } from "react";

import { Button } from "../Button/Button";
import { ClockIcon } from "../Icons/ClockIcon";
import { DollarIcon } from "../Icons/DollarIcon";
import { EyeIcon } from "../Icons/EyeIcon";

type QuestionRowCardProps = {
  deckId?: number;
} & QuestionHistory;

const QuestionRowCard = forwardRef<HTMLLIElement, QuestionRowCardProps>(
  (question, ref) => {
    const revealAtText = getRevealAtText(question.revealAtDate);
    const queryClient = useQueryClient();
    const router = useRouter();
    const { fire } = useConfetti();
    const { promiseToast, errorToast } = useToast();
    const { isClaiming, setIsClaiming } = useClaiming();

    const claimQuestion = async (
      questionId: number,
      transactionHash: string,
    ) => {
      try {
        if (isClaiming) return;

        setIsClaiming(true);

        trackEvent(TRACKING_EVENTS.CLAIM_STARTED, {
          [TRACKING_METADATA.QUESTION_ID]: [question.id],
          [TRACKING_METADATA.QUESTION_TEXT]: [question.question],
          [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
        });

        const tx = await CONNECTION.getTransaction(transactionHash, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        });

        if (!tx) return errorToast("Cannot get transaction");

        promiseToast(claimQuestions([questionId]), {
          loading: "Claiming your rewards...",
          success: "You have successfully claimed your rewards!",
          error: "Failed to claim rewards. Please try again.",
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
            queryClient.resetQueries({
              queryKey: [
                question.deckId
                  ? `questions-history-${question.deckId}`
                  : "questions-history",
              ],
            });
            router.push("/application/answer/reveal/" + question.id);
            router.refresh();
            fire();
          })
          .finally(() => {
            setIsClaiming(false);
          });
      } catch {
        await trackEvent(TRACKING_EVENTS.CLAIM_FAILED, {
          [TRACKING_METADATA.QUESTION_ID]: [question.id],
          [TRACKING_METADATA.QUESTION_TEXT]: [question.question],
          [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
        });
        errorToast("Failed to claim rewards. Please try again.");
      }
    };

    const questionStatus = getQuestionStatus({
      isAnswered: question.isAnswered,
      isClaimed: question.isClaimed,
      isRevealable: question.isRevealable,
      claimedAmount: question.claimedAmount,
    });

    const { openRevealModal } = useRevealedContext();

    const handleReveal = () => {
      openRevealModal({
        reveal: async ({ burnTx, nftAddress, nftType }: RevealProps) => {
          await revealQuestion(question.id, burnTx, nftAddress, nftType);
          queryClient.resetQueries({
            queryKey: [
              question.deckId
                ? `questions-history-${question.deckId}`
                : "questions-history",
            ],
          });
          router.push("/application/answer/reveal/" + question.id);
          router.refresh();
        },
        amount: question.revealTokenAmount || 0,
        questionId: question.id,
        questions: [question.question],
      });
    };

    return (
      <li
        className="px-4 py-[15px] rounded-lg bg-gray-700 border-[0.5px] border-gray-500 flex flex-col gap-2"
        key={question.id}
        ref={ref}
      >
        <div className="flex gap-4 justify-between items-start">
          {question.image && (
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src={question.image}
                alt="stack-image"
                fill
                className="rounded-full"
                sizes="(max-width: 600px) 24px, (min-width: 601px) 36px"
              />
            </div>
          )}
          <p className="text-sm text-white mr-auto">{question.question}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex text-xs text-white items-center gap-1">
            <ClockIcon width={15} height={15} />
            <p className="text-xs font-light -mb-0.5">{revealAtText}</p>
          </div>
          <p
            onClick={() => {
              if (questionStatus !== "Reveal unchomped question") return;

              handleReveal();
            }}
            className={cn("text-xs text-aqua", {
              "text-pink underline cursor-pointer":
                questionStatus === "Reveal unchomped question",
            })}
          >
            {questionStatus}
          </p>
        </div>

        {question.isRevealable && question.isAnswered && (
          <Button
            className="h-[50px] flex gap-1"
            variant="grayish"
            onClick={handleReveal}
          >
            Reveal
            <EyeIcon />
          </Button>
        )}
        {question.isClaimable && (
          <Button
            className="h-[50px] flex gap-1"
            variant="grayish"
            disabled={isClaiming}
            onClick={() =>
              claimQuestion(question.id, question.burnTransactionSignature!)
            }
          >
            Claim
            <DollarIcon fill="#fff" />
          </Button>
        )}
        {(question.isClaimed || question.isRevealed) &&
          !question.isClaimable && (
            <Link href={`/application/answer/reveal/${question.id}`}>
              <Button className="h-[50px] flex gap-1" variant="grayish">
                View
                <EyeIcon />
              </Button>
            </Link>
          )}
      </li>
    );
  },
);

QuestionRowCard.displayName = "QuestionRowCard";

export default QuestionRowCard;
