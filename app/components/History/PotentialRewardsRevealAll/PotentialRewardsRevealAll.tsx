"use client";
import { revealQuestion, revealQuestions } from "@/app/actions/chompResult";
import { RevealProps } from "@/app/hooks/useReveal";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { useQueryClient } from "@tanstack/react-query";
import {
  startTransition,
  useCallback,
  useEffect,
  useOptimistic,
  useState,
} from "react";
import { Button } from "../../Button/Button";
import RewardsModal from "../../RewardsModal/RewardsModal";

type PotentialRewardsRevealAllProps = {
  revealableQuestions: {
    id: number;
    revealTokenAmount: number;
    question: string;
  }[];
  profileSrc: string;
};

export default function PotentialRewardsRevealAll({
  revealableQuestions,
  profileSrc,
}: PotentialRewardsRevealAllProps) {
  const [optimisticRevealableQuestionsLength, revealOptimistic] = useOptimistic(
    revealableQuestions.length,
    (_, optimisticValue: number) => optimisticValue,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { openRevealModal, closeRevealModal } = useRevealedContext();
  const [res, setRes] = useState<null | {
    revealedQuestions: number;
    correctQuestions: number;
    claimableAmount: number;
  }>(null);

  useEffect(() => {
    if (!!res) {
      setIsModalOpen(true);
    }
  }, [res]);

  const revealAll = useCallback(
    async ({ burnTx, revealQuestionIds, pendingChompResults }: RevealProps) => {
      setIsLoading(true);

      const [res] = await Promise.all([
        ...(revealQuestionIds
          ? [revealQuestions(revealQuestionIds, burnTx)]
          : []),
        ...(pendingChompResults?.map((result) =>
          revealQuestion(result.id, result.burnTx),
        ) || []),
      ]);

      setRes(res);

      startTransition(() => {
        revealOptimistic(0);
      });

      queryClient.resetQueries({ queryKey: ["questions-history"] });
      closeRevealModal();
      setIsLoading(false);
    },
    [],
  );

  const handleRevealAll = useCallback(
    () =>
      openRevealModal({
        reveal: revealAll,
        amount: revealableQuestions.reduce(
          (curr, acc) => curr + acc.revealTokenAmount,
          0,
        ),
        questionIds: revealableQuestions.map((q) => q.id),
        questions: revealableQuestions.map((q) => q.question),
      }),
    [],
  );

  return (
    <div className="flex justify-between ">
      <div className="flex flex-col justify-between gap-[10px]">
        <div className="text-xs text-white  ">Potential Rewards</div>
        <div className="text-base text-white  font-semibold ">
          {numberToCurrencyFormatter.format(
            optimisticRevealableQuestionsLength * 10000,
          )}{" "}
          BONK
        </div>
      </div>
      {optimisticRevealableQuestionsLength * 10000 !== 0 && (
        <Button
          onClick={handleRevealAll}
          disabled={isLoading}
          variant="white"
          size="small"
          isPill
          className="!w-fit h-[29px] px-4 text-xs"
        >
          Reveal All Chomped Cards
        </Button>
      )}

      <RewardsModal
        isModalOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        claimableAmount={res?.claimableAmount}
        correctQuestions={res?.correctQuestions}
        revealedQuestions={res?.revealedQuestions}
        avatarImg={profileSrc}
      />
    </div>
  );
}
