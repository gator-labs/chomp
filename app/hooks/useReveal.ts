import trackEvent from "@/lib/trackEvent";
import { getUserAssets } from "@/lib/web3";
import {
  RevealCallbackProps,
  RevealState,
  UseRevealProps,
} from "@/types/reveal";
import { isSolanaWallet } from "@dynamic-labs/solana-core";
import { PublicKey as UmiPublicKey } from "@metaplex-foundation/umi";
import { ChompResult, NftType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { release } from "os";
import { useCallback, useEffect, useState } from "react";

import { DynamicRevealError, RevealError } from "../../lib/error";
import {
  createQuestionChompResults,
  deleteQuestionChompResults,
  getUsersPendingChompResult,
} from "../actions/chompResult";
import { getJwtPayload } from "../actions/jwt";
import {
  getUnusedChompyAndFriendsNft,
  getUnusedChompyAroundTheWorldNft,
  getUnusedGenesisNft,
  getUnusedGlowburgerNft,
} from "../actions/revealNft";
import { SENTRY_FLUSH_WAIT } from "../constants/sentry";
import {
  REVEAL_DIALOG_TYPE,
  REVEAL_TYPE,
  TRACKING_EVENTS,
  TRACKING_METADATA,
} from "../constants/tracking";
import { useToast } from "../providers/ToastProvider";
import {
  CONNECTION,
  MINIMUM_SOL_BALANCE_FOR_TRANSACTION,
  genBonkBurnTx,
} from "../utils/solana";

const BURN_STATE_IDLE = "idle";

const createGetTransactionTask = async (signature: string): Promise<void> => {
  await CONNECTION.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
};

export function useReveal({
  wallet,
  address,
  bonkBalance,
  solBalance,
}: UseRevealProps) {
  const { promiseToast, errorToast } = useToast();
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [reveal, setReveal] = useState<RevealState>();
  const [revealNft, setRevealNft] = useState<{
    id: UmiPublicKey;
    type: NftType;
  }>();
  const [isLoading, setIsLoading] = useState(false);
  const [processingTransaction, setProcessingTransaction] = useState(false);
  const [pendingChompResults, setPendingChompResults] = useState<ChompResult[]>(
    [],
  );

  const [burnState, setBurnState] = useState<
    "burning" | "error" | "idle" | "skipburn"
  >(BURN_STATE_IDLE);

  const hasPendingTransactions = pendingChompResults.length > 0;
  const [insufficientFunds, setInsufficientFunds] = useState(false);

  const isMultiple = reveal?.questionIds && reveal?.questionIds.length > 1;
  const isSingleQuestionWithNftReveal =
    revealNft && !isMultiple && burnState !== "burning";

  useEffect(() => {
    async function effect(address: string, reveal: RevealState) {
      try {
        const chompResults = await getUsersPendingChompResult(
          reveal?.questionIds ?? [],
        );
        setPendingChompResults(chompResults);

        if (reveal?.questionIds?.length !== 1) return;

        const userAssets = await getUserAssets(address);
        const chompyAndFriendsNft =
          await getUnusedChompyAndFriendsNft(userAssets);

        if (!!chompyAndFriendsNft) {
          return setRevealNft({
            id: chompyAndFriendsNft.id,
            type: NftType.ChompyAndFriends,
          });
        }

        const chompyAroundTheWorldNft =
          await getUnusedChompyAroundTheWorldNft(userAssets);

        if (!!chompyAroundTheWorldNft) {
          return setRevealNft({
            id: chompyAroundTheWorldNft.id,
            type: NftType.ChompyAroundTheWorld,
          });
        }

        const glowburgerNft = await getUnusedGlowburgerNft(userAssets);

        if (!!glowburgerNft) {
          return setRevealNft({
            id: glowburgerNft.id,
            type: NftType.Glowburger,
          });
        }

        const genesisNft = await getUnusedGenesisNft(userAssets);

        if (!!genesisNft) {
          return setRevealNft({
            id: genesisNft.id,
            type: NftType.Genesis,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!wallet || !isSolanaWallet(wallet)) {
          return;
        }

        const tx = await genBonkBurnTx(address!, reveal?.amount ?? 0);

        const estimatedFee = await tx.getEstimatedFee(CONNECTION);

        if (!estimatedFee) {
          return errorToast(
            `We could not read fee for this transaction, please try again!`,
          );
        }

        const estimatedFeeInSol = estimatedFee / LAMPORTS_PER_SOL;

        if (
          estimatedFeeInSol > Number(solBalance) ||
          MINIMUM_SOL_BALANCE_FOR_TRANSACTION > Number(solBalance)
        ) {
          setInsufficientFunds(true);
        } else {
          setInsufficientFunds(
            !!reveal?.amount &&
              reveal.amount > bonkBalance &&
              !hasPendingTransactions,
          );
        }

        trackEvent(TRACKING_EVENTS.REVEAL_DIALOG_LOADED, {
          [TRACKING_METADATA.REVEAL_DIALOG_TYPE]: insufficientFunds
            ? REVEAL_DIALOG_TYPE.INSUFFICIENT_FUNDS
            : REVEAL_DIALOG_TYPE.REVEAL_OR_CLOSE,
          [TRACKING_METADATA.QUESTION_ID]: reveal.questionIds,
          [TRACKING_METADATA.QUESTION_TEXT]: reveal.questions,
          [TRACKING_METADATA.REVEAL_TYPE]:
            reveal.questionIds.length > 1
              ? REVEAL_TYPE.ALL
              : REVEAL_TYPE.SINGLE,
        });
        setIsLoading(false);
      }
    }

    if (!address || !reveal || reveal?.questionIds.length === 0) {
      return;
    }

    setIsLoading(true);

    effect(address, reveal);

    return () => {
      setIsLoading(false);
      setPendingChompResults([]);
      setRevealNft(undefined);
    };
  }, [reveal, address, reveal?.questionIds]);

  const onSetReveal = useCallback(
    ({
      amount,
      questionId,
      questionIds,
      reveal,
      questions,
      dialogLabel,
    }: RevealCallbackProps) => {
      setBurnState(BURN_STATE_IDLE);
      setReveal({
        reveal,
        amount,
        questionIds: questionIds ?? [questionId],
        questions,
        dialogLabel,
      });
      setIsRevealModalOpen(true);
      trackEvent(TRACKING_EVENTS.REVEAL_DIALOG_OPENED, {
        [TRACKING_METADATA.REVEAL_TYPE]:
          (questionIds ?? [questionId])?.length > 1
            ? REVEAL_TYPE.ALL
            : REVEAL_TYPE.SINGLE,
        [TRACKING_METADATA.QUESTION_ID]: questionIds ?? [questionId],
        [TRACKING_METADATA.QUESTION_TEXT]: questions,
      });
    },
    [setReveal, setIsRevealModalOpen, setBurnState],
  );

  const resetReveal = useCallback(() => {
    setReveal(undefined);
    setIsRevealModalOpen(false);
    setBurnState(BURN_STATE_IDLE);
  }, [setReveal, setIsRevealModalOpen, setBurnState]);

  const onReveal = useCallback(async () => {
    await reveal?.reveal({});
    setIsRevealModalOpen(false);
  }, [reveal?.reveal, setIsRevealModalOpen]);

  const burnAndReveal = async (ignoreNft?: boolean) => {
    setProcessingTransaction(true);
    let signature: string | undefined = undefined;
    let pendingChompResultIds = pendingChompResults.map(
      (chr) => chr.questionId!,
    );
    const revealQuestionIds = reveal!.questionIds.filter(
      (id) => !pendingChompResultIds.includes(id),
    );

    const payload = await getJwtPayload();

    try {
      if (pendingChompResultIds.length === 1 && !revealQuestionIds.length) {
        signature = pendingChompResults[0].burnTransactionSignature!;
        setBurnState("burning");
        await createGetTransactionTask(signature);
      }

      if (
        (!isSingleQuestionWithNftReveal || ignoreNft) &&
        !!revealQuestionIds.length
      ) {
        // Try catch is to catch Dynamic related issues to narrow down the error
        try {
          if (!wallet || !isSolanaWallet(wallet)) {
            return;
          }
          const signer = await wallet!.getSigner();

          const tx = await genBonkBurnTx(address!, reveal?.amount ?? 0);

          const estimatedFee = await tx.getEstimatedFee(CONNECTION);

          if (!estimatedFee) {
            return errorToast(
              `We could not read fee for this transaction, please try again!`,
            );
          }

          const estimatedFeeInSol = estimatedFee / LAMPORTS_PER_SOL;

          if (
            estimatedFeeInSol > Number(solBalance) ||
            MINIMUM_SOL_BALANCE_FOR_TRANSACTION > Number(solBalance)
          ) {
            setInsufficientFunds(true);
          } else {
            setInsufficientFunds(
              !!reveal?.amount &&
                reveal.amount > bonkBalance &&
                !hasPendingTransactions,
            );
          }

          setBurnState("burning");

          try {
            const { signature: sn } = await promiseToast(
              signer.signAndSendTransaction(tx),
              {
                loading: "Waiting for signature...",
                success: "Bonk burn transaction signed!",
                error: "You denied message signature.",
              },
            );

            trackEvent(TRACKING_EVENTS.REVEAL_TRANSACTION_SIGNED, {
              [TRACKING_METADATA.TRANSACTION_SIGNATURE]: sn,
              [TRACKING_METADATA.QUESTION_ID]: reveal?.questionIds,
              [TRACKING_METADATA.QUESTION_TEXT]: reveal?.questions,
              [TRACKING_METADATA.REVEAL_TYPE]:
                revealQuestionIds.length > 1
                  ? REVEAL_TYPE.ALL
                  : REVEAL_TYPE.SINGLE,
            });

            signature = sn;
          } catch (error) {
            if ((error as any)?.message === "User rejected the request.")
              trackEvent(TRACKING_EVENTS.REVEAL_TRANSACTION_CANCELLED, {
                [TRACKING_METADATA.REVEAL_TYPE]:
                  revealQuestionIds.length > 1
                    ? REVEAL_TYPE.ALL
                    : REVEAL_TYPE.SINGLE,
                [TRACKING_METADATA.QUESTION_ID]: reveal?.questionIds,
                [TRACKING_METADATA.QUESTION_TEXT]: reveal?.questions,
              });

            resetReveal();
            return;
          } finally {
            setProcessingTransaction(false);
          }

          const chompResults = await createQuestionChompResults(
            revealQuestionIds.map((qid) => ({
              burnTx: signature!,
              questionId: qid,
            })),
          );

          pendingChompResultIds = chompResults?.map((cr) => cr.id) ?? [];
        } catch (error) {
          errorToast("Error happened while revealing question. Try again.");
          const dynamicRevealError = new DynamicRevealError(
            `User with id: ${payload?.sub} (wallet: ${address}) is having trouble revealing questions with question ids: ${questionIds}`,
            { cause: error },
          );
          Sentry.captureException(dynamicRevealError, {
            tags: {
              category: "burn-error",
            },
          });
          release();
          resetReveal();
          return;
        }
      }

      if (!isSingleQuestionWithNftReveal) {
        // If the user doesn't have an NFT, or there are more than two questions ready to reveal, including pending ones.
        await reveal!.reveal({
          burnTx: signature,
          revealQuestionIds,
          pendingChompResults: pendingChompResults.map((result) => ({
            burnTx: result.burnTransactionSignature!,
            id: result.questionId!,
          })),
        });
      } else {
        // If user have nft and question one question is ready to reveal.
        await reveal!.reveal({
          burnTx: signature,
          nftAddress: ignoreNft ? "" : revealNft!.id,
          revealQuestionIds,
          nftType: ignoreNft ? undefined : revealNft!.type,
        });
      }

      trackEvent(TRACKING_EVENTS.REVEAL_SUCCEEDED, {
        transactionSignature: signature,
        nftAddress: revealNft?.id,
        nftType: revealNft?.type,
        burnedAmount: reveal?.amount,
        [TRACKING_METADATA.REVEAL_TYPE]:
          revealQuestionIds.length > 1 ? REVEAL_TYPE.ALL : REVEAL_TYPE.SINGLE,
        [TRACKING_METADATA.QUESTION_ID]: reveal?.questionIds,
        [TRACKING_METADATA.QUESTION_TEXT]: reveal?.questions,
      });

      if (revealNft && !isMultiple) {
        setRevealNft(undefined);
      }
    } catch (error) {
      if (pendingChompResultIds.length > 0) {
        await deleteQuestionChompResults(pendingChompResultIds);
      }

      await trackEvent(TRACKING_EVENTS.REVEAL_FAILED, {
        [TRACKING_METADATA.REVEAL_TYPE]:
          revealQuestionIds.length > 1 ? REVEAL_TYPE.ALL : REVEAL_TYPE.SINGLE,
        [TRACKING_METADATA.QUESTION_ID]: reveal?.questionIds,
        [TRACKING_METADATA.QUESTION_TEXT]: reveal?.questions,
        error,
      });
      errorToast("Error happened while revealing question. Try again.");
      const revealError = new RevealError(
        `User with id: ${payload?.sub} (wallet: ${address}) is having trouble revealing questions with question ids: ${questionIds}`,
        { cause: error },
      );
      Sentry.captureException(revealError);
      release();
    } finally {
      resetReveal();
      await Sentry.flush(SENTRY_FLUSH_WAIT);
    }
  };

  const questionIds = (reveal?.questionIds || []).filter(
    (questionId) =>
      !pendingChompResults.map((r) => r.questionId).includes(questionId),
  );

  return {
    burnState,
    isRevealModalOpen,
    insufficientFunds,
    isMultiple,
    revealPrice: reveal?.amount ?? 0,
    pendingTransactions: pendingChompResults.length,
    isSingleQuestionWithNftReveal,
    nftType: revealNft?.type,
    burnAndReveal,
    onReveal,
    onSetReveal,
    resetReveal,
    cancelReveal: resetReveal,
    processingTransaction,
    questionIds,
    questions: reveal?.questions,
    isLoading,
    dialogLabel: reveal?.dialogLabel,
  };
}
