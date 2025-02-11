import trackEvent from "@/lib/trackEvent";
import {
  RevealCallbackProps,
  RevealState,
  UseRevealProps,
} from "@/types/reveal";
import { isSolanaWallet } from "@dynamic-labs/solana-core";
import { ChompResult } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";
import { release } from "os";
import { useCallback, useEffect, useState } from "react";

import { DynamicRevealError, RevealError } from "../../lib/error";
import {
  createChompResultsAndSubmitSignedTx,
  getUsersPendingChompResult,
} from "../actions/chompResult";
import { getJwtPayload } from "../actions/jwt";
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

const createGetTransactionTask = async (signature: string) => {
  try {
    return await CONNECTION.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
  } catch {
    return null;
  }
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

  useEffect(() => {
    async function effect(address: string, reveal: RevealState) {
      try {
        const chompResults = await getUsersPendingChompResult(
          reveal?.questionIds ?? [],
        );
        setPendingChompResults(chompResults);

        if (reveal?.questionIds?.length !== 1) return;
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
          [TRACKING_METADATA.REVEAL_TYPE]: reveal.isRevealAll
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
      isRevealAll,
    }: RevealCallbackProps) => {
      setBurnState(BURN_STATE_IDLE);
      setReveal({
        reveal,
        amount,
        questionIds: questionIds ?? [questionId],
        questions,
        dialogLabel,
        isRevealAll,
      });
      setIsRevealModalOpen(true);
      trackEvent(TRACKING_EVENTS.REVEAL_DIALOG_OPENED, {
        [TRACKING_METADATA.REVEAL_TYPE]: isRevealAll
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

  const burnAndReveal = async () => {
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

        const tx = await createGetTransactionTask(signature);

        if (!tx) {
          errorToast("Unable to find the pending transaction");
          setProcessingTransaction(false);
          resetReveal();
          return;
        }
      }

      if (!!revealQuestionIds.length) {
        // Try catch is to catch Dynamic related issues to narrow down the error
        try {
          if (!wallet || !isSolanaWallet(wallet)) {
            return;
          }
          const signer = await wallet!.getSigner();

          let tx = await genBonkBurnTx(address!, reveal?.amount ?? 0);

          const { lastValidBlockHeight } = tx;

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
            tx = await promiseToast(signer.signTransaction(tx), {
              loading: "Waiting for signature...",
              success: "Bonk burn transaction signed!",
              error: "You denied message signature.",
            });

            const blockHeight = await CONNECTION.getBlockHeight();

            if (blockHeight && lastValidBlockHeight) {
              if (blockHeight >= lastValidBlockHeight) {
                errorToast("Signature expired. Try again.");
                resetReveal();
                return;
              }
            }

            if (tx.signature) signature = bs58.encode(tx.signature);

            trackEvent(TRACKING_EVENTS.REVEAL_TRANSACTION_SIGNED, {
              [TRACKING_METADATA.TRANSACTION_SIGNATURE]: signature,
              [TRACKING_METADATA.QUESTION_ID]: reveal?.questionIds,
              [TRACKING_METADATA.QUESTION_TEXT]: reveal?.questions,
              [TRACKING_METADATA.REVEAL_TYPE]: reveal?.isRevealAll
                ? REVEAL_TYPE.ALL
                : REVEAL_TYPE.SINGLE,
            });
          } catch (error) {
            if ((error as any)?.message === "User rejected the request.")
              trackEvent(TRACKING_EVENTS.REVEAL_TRANSACTION_CANCELLED, {
                [TRACKING_METADATA.REVEAL_TYPE]: reveal?.isRevealAll
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

          const chompResults = await createChompResultsAndSubmitSignedTx(
            revealQuestionIds,
            JSON.stringify(Array.from(tx.serialize())),
            signature!,
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
            extra: {
              questionIds,
            },
          });
          release();
          resetReveal();
          return;
        }
      }

      await reveal!.reveal({
        burnTx: signature,
        revealQuestionIds,
        pendingChompResults: pendingChompResults.map((result) => ({
          burnTx: result.burnTransactionSignature!,
          id: result.questionId!,
        })),
      });

      const pendingResults =
        await getUsersPendingChompResult(revealQuestionIds);

      if (pendingResults?.length !== 0) {
        trackEvent(TRACKING_EVENTS.REVEAL_TRANSACTION_PENDING, {
          transactionSignature: signature,
          burnedAmount: reveal?.amount,
          [TRACKING_METADATA.REVEAL_TYPE]: reveal?.isRevealAll
            ? REVEAL_TYPE.ALL
            : REVEAL_TYPE.SINGLE,
          [TRACKING_METADATA.QUESTION_ID]: reveal?.questionIds,
          [TRACKING_METADATA.QUESTION_TEXT]: reveal?.questions,
        });
      } else {
        trackEvent(TRACKING_EVENTS.REVEAL_SUCCEEDED, {
          transactionSignature: signature,
          burnedAmount: reveal?.amount,
          [TRACKING_METADATA.REVEAL_TYPE]: reveal?.isRevealAll
            ? REVEAL_TYPE.ALL
            : REVEAL_TYPE.SINGLE,
          [TRACKING_METADATA.QUESTION_ID]: reveal?.questionIds,
          [TRACKING_METADATA.QUESTION_TEXT]: reveal?.questions,
        });
      }
    } catch (error) {
      await trackEvent(TRACKING_EVENTS.REVEAL_FAILED, {
        [TRACKING_METADATA.REVEAL_TYPE]: reveal?.isRevealAll
          ? REVEAL_TYPE.ALL
          : REVEAL_TYPE.SINGLE,
        [TRACKING_METADATA.QUESTION_ID]: reveal?.questionIds,
        [TRACKING_METADATA.QUESTION_TEXT]: reveal?.questions,
        error,
      });
      errorToast("Error happened while revealing question. Try again.");
      const revealError = new RevealError(
        `User with id: ${payload?.sub} (wallet: ${address}) is having trouble revealing questions with question ids: ${questionIds}`,
        { cause: error },
      );
      Sentry.captureException(revealError, {
        tags: {
          category: "reveal-error",
        },
        extra: {
          questionIds,
        },
      });
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
    isRevealAll: reveal?.isRevealAll,
  };
}
