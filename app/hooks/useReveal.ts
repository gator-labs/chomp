import { getUserAssets } from "@/lib/web3";
import { Wallet } from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { PublicKey as UmiPublicKey } from "@metaplex-foundation/umi";
import { ChompResult, NftType } from "@prisma/client";
import { useRouter } from "next-nprogress-bar";
import { useCallback, useEffect, useState } from "react";
import {
  createQuestionChompResults,
  deleteQuestionChompResults,
  getUsersPendingChompResult,
  revealQuestions,
} from "../actions/chompResult";
import {
  getUnusedChompyAndFriendsNft,
  getUnusedGenesisNft,
  getUnusedGlowburgerNft,
} from "../actions/revealNft";
import { useToast } from "../providers/ToastProvider";
import { onlyUnique } from "../utils/array";
import { CONNECTION, genBonkBurnTx } from "../utils/solana";
import { useCrossTabState } from "./useCrossTabState";
import useSignAndSendTx from "./useSignAndSendTx";

type UseRevealProps = {
  wallet: Wallet | null;
  address?: string;
  bonkBalance: number;
};

interface RevealCallbackBaseProps {
  reveal: (burnTx?: string, nftAddress?: string) => Promise<void>;
  amount: number;
}

interface RevealCallbackMultipleQuestions extends RevealCallbackBaseProps {
  questionIds: number[];
  questionId?: never;
}

interface RevealCallbackSingleQuestion extends RevealCallbackBaseProps {
  questionId: number;
  questionIds?: never;
}

export type RevealCallbackProps =
  | RevealCallbackSingleQuestion
  | RevealCallbackMultipleQuestions;

type RevealState = {
  amount: number;
  reveal: (
    burnTx?: string,
    nftAddress?: string,
    nftType?: NftType,
  ) => Promise<void>;
  questionIds: number[];
  genesisNft?: string;
};

const INITIAL_BURN_STATE = "idle";

const createGetTransactionTask = async (signature: string): Promise<void> => {
  await CONNECTION.getTransaction(signature, {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
};

export function useReveal({ wallet, address, bonkBalance }: UseRevealProps) {
  const router = useRouter();
  const { promiseToast, errorToast } = useToast();
  const { execute, signature, setSignature } = useSignAndSendTx();
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [lastRevealQuestionIds, setLastRevealQuestionIds] = useCrossTabState(
    "last-reveal-question-id",
    [] as number[],
  );
  const [reveal, setReveal] = useState<RevealState>();
  const [revealNft, setRevealNft] = useState<{
    id: UmiPublicKey;
    type: NftType;
  }>();
  const [isLoading, setIsLoading] = useState(false);

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
        if (chompResults.length > 0) {
          const uniqueValues = chompResults
            .map((cr) => cr.burnTransactionSignature)
            .filter(onlyUnique);

          if (uniqueValues.length > 1) {
            resetReveal();
            errorToast("Only one pending transaction is allowed.");
          }

          return;
        }

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

  useEffect(() => {
    const revealInMobileBrowser = async (signature: string) => {
      setBurnState("burning");

      await createQuestionChompResults(
        lastRevealQuestionIds.map((qid) => ({
          burnTx: signature!,
          questionId: qid,
        })),
      );

      await createGetTransactionTask(signature);
      await revealQuestions(lastRevealQuestionIds, signature);
      if (lastRevealQuestionIds.length === 1) {
        router.push("/application/answer/reveal/" + lastRevealQuestionIds[0]);
        router.refresh();
      }
      setBurnState(INITIAL_BURN_STATE);
    };

    if (!!signature) revealInMobileBrowser(signature);

    return () => {
      setSignature(undefined);
    };
  }, [signature]);

  const onSetReveal = useCallback(
    ({ amount, questionId, questionIds, reveal }: RevealCallbackProps) => {
      setBurnState(INITIAL_BURN_STATE);
      setReveal({
        reveal,
        amount,
        questionIds: questionIds ?? [questionId],
      });
      setIsRevealModalOpen(true);
    },
    [setReveal, setIsRevealModalOpen, setBurnState],
  );

  const resetReveal = useCallback(() => {
    setReveal(undefined);
    setIsRevealModalOpen(false);
    setBurnState(INITIAL_BURN_STATE);
  }, [setReveal, setIsRevealModalOpen, setBurnState]);

  const onReveal = useCallback(async () => {
    await reveal?.reveal();
    setIsRevealModalOpen(false);
  }, [reveal?.reveal, setIsRevealModalOpen]);

  const burnAndReveal = async (ignoreNft?: boolean) => {
    let signature: string | undefined = undefined;
    let pendingChompResultIds = pendingChompResults.map(
      (chr) => chr.questionId ?? 0,
    );

    try {
      if (hasPendingTransactions) {
        signature = pendingChompResults[0].burnTransactionSignature!;
        setBurnState("burning");
        await createGetTransactionTask(signature);
      }

      if ((!isRevealWithNftMode || ignoreNft) && !hasPendingTransactions) {
        const blockhash = await CONNECTION.getLatestBlockhash();
        const signer = await wallet!.connector.getSigner<ISolana>();

        const tx = await genBonkBurnTx(
          address!,
          blockhash.blockhash,
          reveal?.amount ?? 0,
        );
        setBurnState("burning");

        try {
          const res = await promiseToast(execute(tx), {
            loading: "Waiting for signature...",
            success: "Bonk burn transaction signed!",
            error: "You denied message signature.",
          });

          setLastRevealQuestionIds(reveal!.questionIds);

          signature = res!.signature;
        } catch (error) {
          resetReveal();
          return;
        }

        const chompResults = await createQuestionChompResults(
          reveal!.questionIds.map((qid) => ({
            burnTx: signature!,
            questionId: qid,
          })),
        );

        pendingChompResultIds = chompResults?.map((cr) => cr.id) ?? [];

        await CONNECTION.confirmTransaction(
          {
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
            signature,
          },
          "confirmed",
        );
      }

      if (!isRevealWithNftMode) {
        await reveal!.reveal(signature);
      } else {
        await reveal!.reveal(signature, revealNft!.id, revealNft!.type);
      }

      if (revealNft && !isMultiple) {
        setRevealNft(undefined);
      }
    } catch (error) {
      if (pendingChompResultIds.length > 0) {
        await deleteQuestionChompResults(pendingChompResultIds);
      }

      errorToast("Error happened while revealing question. Try again.");
    } finally {
      resetReveal();
    }
  };

  return {
    burnState,
    isRevealModalOpen,
    insufficientFunds,
    isMultiple,
    revealPrice: reveal?.amount ?? 0,
    hasPendingTransactions,
    isRevealWithNftMode,
    nftType: revealNft?.type,
    burnAndReveal,
    onReveal,
    onSetReveal,
    resetReveal,
    cancelReveal: resetReveal,
    questionIds: reveal?.questionIds || [],
    isLoading,
  };
}
