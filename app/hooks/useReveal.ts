import sendToMixpanel from "@/lib/mixpanel";
import { getUserAssets } from "@/lib/web3";
import { Wallet } from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { PublicKey as UmiPublicKey } from "@metaplex-foundation/umi";
import { ChompResult, NftType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { release } from "os";
import { useCallback, useEffect, useState } from "react";
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
import {
  MIX_PANEL_EVENTS,
  MIX_PANEL_METADATA,
  REVEAL_DIALOG_TYPE,
  REVEAL_TYPE,
} from "../constants/mixpanel";
import { useToast } from "../providers/ToastProvider";
import { BurnError, DynamicRevealError, RevealError } from "../utils/error";
import { CONNECTION, genBonkBurnTx } from "../utils/solana";

type UseRevealProps = {
  wallet: Wallet | null;
  address?: string;
  bonkBalance: number;
};

interface RevealCallbackBaseProps {
  reveal: ({
    burnTx,
    nftAddress,
    nftType,
    revealQuestionIds,
  }: RevealProps) => Promise<void>;
  amount: number;
  dialogLabel?: string;
}

interface RevealCallbackMultipleQuestions extends RevealCallbackBaseProps {
  questionIds: number[];
  questionId?: never;
  questions: string[];
}

interface RevealCallbackSingleQuestion extends RevealCallbackBaseProps {
  questionId: number;
  questionIds?: never;
  questions: string[];
}

export interface RevealProps {
  burnTx?: string;
  nftAddress?: string;
  nftType?: NftType;
  revealQuestionIds?: number[];
  pendingChompResults?: { id: number; burnTx: string }[];
}

export type RevealCallbackProps =
  | RevealCallbackSingleQuestion
  | RevealCallbackMultipleQuestions;

type RevealState = {
  amount: number;
  reveal: ({ burnTx, nftAddress, nftType }: RevealProps) => Promise<void>;
  questionIds: number[];
  questions: string[];
  genesisNft?: string;
  dialogLabel?: string;
};

const INITIAL_BURN_STATE = "idle";

const createGetTransactionTask = async (signature: string): Promise<void> => {
  await CONNECTION.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
};

export function useReveal({ wallet, address, bonkBalance }: UseRevealProps) {
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
  >(INITIAL_BURN_STATE);

  const hasPendingTransactions = pendingChompResults.length > 0;
  const insufficientFunds =
    !!reveal?.amount && reveal.amount > bonkBalance && !hasPendingTransactions;
  const isMultiple = reveal?.questionIds && reveal?.questionIds.length > 1;
  const isRevealWithNftMode =
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
        sendToMixpanel(MIX_PANEL_EVENTS.REVEAL_DIALOG_LOADED, {
          [MIX_PANEL_METADATA.REVEAL_DIALOG_TYPE]: insufficientFunds
            ? REVEAL_DIALOG_TYPE.INSUFFICIENT_FUNDS
            : REVEAL_DIALOG_TYPE.REVEAL_OR_CLOSE,
          [MIX_PANEL_METADATA.QUESTION_ID]: reveal.questionIds,
          [MIX_PANEL_METADATA.QUESTION_TEXT]: reveal.questions,
          [MIX_PANEL_METADATA.REVEAL_TYPE]:
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
      setBurnState(INITIAL_BURN_STATE);
      setReveal({
        reveal,
        amount,
        questionIds: questionIds ?? [questionId],
        questions,
        dialogLabel,
      });
      setIsRevealModalOpen(true);
      sendToMixpanel(MIX_PANEL_EVENTS.REVEAL_DIALOG_OPENED, {
        [MIX_PANEL_METADATA.REVEAL_TYPE]:
          (questionIds ?? [questionId])?.length > 1
            ? REVEAL_TYPE.ALL
            : REVEAL_TYPE.SINGLE,
        [MIX_PANEL_METADATA.QUESTION_ID]: questionIds ?? [questionId],
        [MIX_PANEL_METADATA.QUESTION_TEXT]: questions,
      });
    },
    [setReveal, setIsRevealModalOpen, setBurnState],
  );

  const resetReveal = useCallback(() => {
    setReveal(undefined);
    setIsRevealModalOpen(false);
    setBurnState(INITIAL_BURN_STATE);
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

      if ((!isRevealWithNftMode || ignoreNft) && !!revealQuestionIds.length) {
        const blockhash = await CONNECTION.getLatestBlockhash();

        // This try catch is to catch Dynamic related issues to narrow down the error
        try {
          const signer = await wallet!.connector.getSigner<ISolana>();

          const tx = await genBonkBurnTx(
            address!,
            blockhash.blockhash,
            reveal?.amount ?? 0,
          );
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

            sendToMixpanel(MIX_PANEL_EVENTS.REVEAL_TRANSACTION_SIGNED, {
              [MIX_PANEL_METADATA.TRANSACTION_SIGNATURE]: sn,
              [MIX_PANEL_METADATA.QUESTION_ID]: reveal?.questionIds,
              [MIX_PANEL_METADATA.QUESTION_TEXT]: reveal?.questions,
              [MIX_PANEL_METADATA.REVEAL_TYPE]:
                revealQuestionIds.length > 1
                  ? REVEAL_TYPE.ALL
                  : REVEAL_TYPE.SINGLE,
            });

            signature = sn;
          } catch (error) {
            if ((error as any)?.message === "User rejected the request.")
              sendToMixpanel(MIX_PANEL_EVENTS.REVEAL_TRANSACTION_CANCELLED, {
                [MIX_PANEL_METADATA.REVEAL_TYPE]:
                  revealQuestionIds.length > 1
                    ? REVEAL_TYPE.ALL
                    : REVEAL_TYPE.SINGLE,
                [MIX_PANEL_METADATA.QUESTION_ID]: reveal?.questionIds,
                [MIX_PANEL_METADATA.QUESTION_TEXT]: reveal?.questions,
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

          const res = await CONNECTION.confirmTransaction(
            {
              blockhash: blockhash.blockhash,
              lastValidBlockHeight: blockhash.lastValidBlockHeight,
              signature,
            },
            "confirmed",
          );

          if (!!res.value.err) {
            errorToast(
              "Error while confirming transaction. Bonk was not burned. Try again.",
            );
            const burnError = new BurnError(
              `User with id: ${payload?.sub} is having trouble burning questions with ids: ${revealQuestionIds}`,
              { cause: res.value.err },
            );
            Sentry.captureException(burnError);
            await deleteQuestionChompResults(pendingChompResultIds);
          }
        } catch (error) {
          errorToast("Error happened while revealing question. Try again.");
          const dynamicRevealError = new DynamicRevealError(
            `User with id: ${payload?.sub} is having trouble revealing questions with question ids: ${questionIds}`,
            { cause: error },
          );
          Sentry.captureException(dynamicRevealError);
          release();
          resetReveal();
          return;
        }
      }

      if (!isRevealWithNftMode) {
        await reveal!.reveal({
          burnTx: signature,
          revealQuestionIds,
          pendingChompResults: pendingChompResults.map((result) => ({
            burnTx: result.burnTransactionSignature!,
            id: result.questionId!,
          })),
        });
      } else {
        await reveal!.reveal({
          burnTx: signature,
          nftAddress: revealNft!.id,
          nftType: revealNft!.type,
        });
      }

      sendToMixpanel(MIX_PANEL_EVENTS.REVEAL_SUCCEEDED, {
        transactionSignature: signature,
        nftAddress: revealNft?.id,
        nftType: revealNft?.type,
        burnedAmount: reveal?.amount,
        [MIX_PANEL_METADATA.REVEAL_TYPE]:
          revealQuestionIds.length > 1 ? REVEAL_TYPE.ALL : REVEAL_TYPE.SINGLE,
        [MIX_PANEL_METADATA.QUESTION_ID]: reveal?.questionIds,
        [MIX_PANEL_METADATA.QUESTION_TEXT]: reveal?.questions,
      });

      if (revealNft && !isMultiple) {
        setRevealNft(undefined);
      }
    } catch (error) {
      if (pendingChompResultIds.length > 0) {
        await deleteQuestionChompResults(pendingChompResultIds);
      }

      sendToMixpanel(MIX_PANEL_EVENTS.REVEAL_FAILED, {
        [MIX_PANEL_METADATA.REVEAL_TYPE]:
          revealQuestionIds.length > 1 ? REVEAL_TYPE.ALL : REVEAL_TYPE.SINGLE,
        [MIX_PANEL_METADATA.QUESTION_ID]: reveal?.questionIds,
        [MIX_PANEL_METADATA.QUESTION_TEXT]: reveal?.questions,
        error,
      });
      errorToast("Error happened while revealing question. Try again.");
      const revealError = new RevealError(
        `User with id: ${payload?.sub} is having trouble revealing questions with question ids: ${questionIds}`,
        { cause: error },
      );
      Sentry.captureException(revealError);
      release();
    } finally {
      resetReveal();
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
    isRevealWithNftMode,
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
