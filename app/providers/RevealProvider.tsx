"use client";
import { getUserAssets } from "@/lib/web3";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { PublicKey } from "@metaplex-foundation/umi";
import { ChompResult, NftType } from "@prisma/client";
import classNames from "classnames";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createQuestionChompResult,
  deleteQuestionChompResult,
  getUsersPendingChompResult,
} from "../actions/chompResult";

import { Button } from "../components/Button/Button";
import ChompFullScreenLoader from "../components/ChompFullScreenLoader/ChompFullScreenLoader";
import { InfoIcon } from "../components/Icons/InfoIcon";
import { Modal } from "../components/Modal/Modal";
import Sheet from "../components/Sheet/Sheet";

import {
  getUnusedGenesisNft,
  getUnusedGlowburgerNft,
} from "../actions/revealNft";
import { numberToCurrencyFormatter } from "../utils/currency";
import { CONNECTION, genBonkBurnTx } from "../utils/solana";
import { useToast } from "./ToastProvider";

interface RevealContextState {
  openRevealModal: (
    reveal: (
      burnTx?: string,
      nftAddress?: string,
      nftType?: NftType,
    ) => Promise<void>,
    amount: number,
    questionId: number,
    multiple?: boolean,
  ) => void;
  openClaimModal: (claim: () => Promise<void>) => void;
  closeRevealModal: () => void;
  closeClaimModal: () => void;
}

const initialContextValue: RevealContextState = {
  openRevealModal: () => {},
  openClaimModal: () => {},
  closeRevealModal: () => {},
  closeClaimModal: () => {},
};

export const RevealedContext =
  createContext<RevealContextState>(initialContextValue);

const INITIAL_BURN_STATE = "idle";
export function RevealContextProvider({
  children,
  bonkBalance,
}: {
  children: ReactNode;
  bonkBalance: number;
}) {
  const { promiseToast, errorToast } = useToast();
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isClaimModelOpen, setIsClaimModalOpen] = useState(false);
  const [burnState, setBurnState] = useState<
    "burning" | "error" | "idle" | "skipburn"
  >(INITIAL_BURN_STATE);
  const { primaryWallet } = useDynamicContext();

  const [reveal, setReveal] = useState<{
    amount: number;
    multiple: boolean;
    reveal: (
      burnTx?: string,
      nftAddress?: string,
      nftType?: NftType,
    ) => Promise<void>;
    questionId: number;
    genesisNft?: string;
  }>();
  const [claim, setClaim] = useState<{
    claim: () => Promise<void>;
  }>();
  const [revealNft, setRevealNft] = useState<{
    id: PublicKey;
    type: NftType;
  }>();
  const [questionChompResult, setQuestionChompResult] =
    useState<ChompResult | null>(null);

  const insufficientFunds = !!reveal?.amount && reveal.amount > bonkBalance;

  useEffect(() => {
    async function effect(address: string) {
      const chompResult = await getUsersPendingChompResult(reveal!.questionId);
      if (!!chompResult) return setQuestionChompResult(chompResult);

      const userAssets = await getUserAssets(address);

      const glowburgerNft = await getUnusedGlowburgerNft(userAssets);

      if (!!glowburgerNft)
        return setRevealNft({
          id: glowburgerNft.id,
          type: NftType.Glowburger,
        });

      const genesisNft = await getUnusedGenesisNft(userAssets);

      if (!!genesisNft)
        return setRevealNft({
          id: genesisNft.id,
          type: NftType.Genesis,
        });
    }

    if (reveal?.multiple || !primaryWallet?.address || !reveal?.questionId)
      return;

    effect(primaryWallet.address);

    return () => {
      setQuestionChompResult(null);
      setRevealNft(undefined);
    };
  }, [reveal, primaryWallet?.address]);

  const openRevealModal = useCallback(
    (
      reveal: (
        burnTx?: string,
        nftAddress?: string,
        nftType?: NftType,
      ) => Promise<void>,
      amount: number,
      questionId: number,
      multiple = false,
    ) => {
      setBurnState(INITIAL_BURN_STATE);
      setReveal({ reveal, amount, questionId, multiple });
      setIsRevealModalOpen(true);
    },
    [setReveal, setIsRevealModalOpen, setBurnState],
  );

  const openClaimModal = useCallback(
    (claim: () => Promise<void>) => {
      setClaim({ claim });
      setIsClaimModalOpen(true);
    },
    [setClaim, setIsClaimModalOpen],
  );

  const closeRevealModal = useCallback(() => {
    setReveal(undefined);
    setIsRevealModalOpen(false);
  }, [setReveal, setIsRevealModalOpen]);

  const closeClaimModal = useCallback(() => {
    setClaim(undefined);
    setIsClaimModalOpen(false);
  }, [setClaim, setIsClaimModalOpen]);

  const value = useMemo(
    () => ({
      openRevealModal,
      openClaimModal,
      closeRevealModal,
      closeClaimModal,
    }),
    [openRevealModal, openClaimModal, closeRevealModal, closeClaimModal],
  );

  const burnAndReveal = useCallback(
    async (useRevealNft = false) => {
      let burnTx: string | undefined;
      let pendingChompResultId = questionChompResult?.id;

      try {
        if (!!questionChompResult) {
          setBurnState("burning");
          const signature = questionChompResult.burnTransactionSignature!;

          await CONNECTION.getTransaction(
            questionChompResult.burnTransactionSignature!,
            {
              commitment: "confirmed",
              maxSupportedTransactionVersion: 0,
            },
          );
          setIsRevealModalOpen(false);

          burnTx = signature;
        }

        if (
          (!useRevealNft || !revealNft || reveal?.multiple) &&
          !questionChompResult
        ) {
          const blockhash = await CONNECTION.getLatestBlockhash();

          const signer = await primaryWallet!.connector.getSigner<ISolana>();

          const tx = await genBonkBurnTx(
            primaryWallet!.address,
            blockhash.blockhash,
            reveal?.amount ?? 0,
          );
          setBurnState("burning");

          let signature;

          try {
            const { signature: sn } = await promiseToast(
              signer.signAndSendTransaction(tx),
              {
                loading: "Waiting for signature...",
                success: "Bonk burn transaction signed!",
                error: "You denied message signature.",
              },
            );

            signature = sn;
          } catch (error) {
            setBurnState(INITIAL_BURN_STATE);
            setIsRevealModalOpen(false);
            return;
          }

          const chompResult = await createQuestionChompResult(
            reveal!.questionId,
            signature,
          );

          pendingChompResultId = chompResult?.id || undefined;

          await CONNECTION.confirmTransaction(
            {
              blockhash: blockhash.blockhash,
              lastValidBlockHeight: blockhash.lastValidBlockHeight,
              signature,
            },
            "confirmed",
          );

          burnTx = signature;
        }

        if (
          !!useRevealNft &&
          !!revealNft &&
          !reveal?.multiple &&
          !questionChompResult
        ) {
          const chompResult = await createQuestionChompResult(
            reveal!.questionId,
          );

          pendingChompResultId = chompResult?.id || undefined;
        }

        await reveal!.reveal(
          burnTx,
          revealNft && !reveal?.multiple && useRevealNft
            ? revealNft.id
            : undefined,
          revealNft && !reveal?.multiple && useRevealNft
            ? revealNft.type
            : undefined,
        );

        if (revealNft && !reveal?.multiple) setRevealNft(undefined);
      } catch (error) {
        if (pendingChompResultId)
          await deleteQuestionChompResult(pendingChompResultId);

        errorToast("Error happened while revealing question. Try again.");
      } finally {
        closeRevealModal();
        setBurnState(INITIAL_BURN_STATE);
      }
    },
    [
      reveal,
      revealNft,
      questionChompResult,
      promiseToast,
      primaryWallet,
      closeRevealModal,
      errorToast,
    ],
  );

  const revealButtons = useMemo(() => {
    if (insufficientFunds && !revealNft && !questionChompResult) {
      return (
        <>
          <a
            href="https://x.com/chompdotgames/status/1798664081102258304"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="white" isPill className="text-black h-10">
              Learn how
            </Button>
          </a>
          <Button
            variant="black"
            className="h-10"
            isPill
            onClick={() => setIsRevealModalOpen(false)}
          >
            Cancel
          </Button>
        </>
      );
    }

    switch (burnState) {
      case "skipburn":
        return (
          <>
            <Button
              variant="white"
              isPill
              onClick={async () => {
                try {
                  await reveal?.reveal();
                  setIsRevealModalOpen(false);
                } catch (error) {
                  console.error(error);
                }
              }}
              className="text-black h-10"
            >
              Reveal
            </Button>
            <Button
              variant="black"
              isPill
              className="h-10"
              onClick={() => setIsRevealModalOpen(false)}
            >
              Cancel
            </Button>
            <div className="bg-[#4D4D4D] p-4 flex gap-4 rounded-lg">
              <div className="relative flex-shrink-0">
                <InfoIcon width={16} height={16} />
              </div>
              <div className="flex flex-col gap-2 text-xs font-normal">
                <p>
                  You would need to burn $BONK to reveal the answer, regardless
                  of whether you&apos;ve chomped on the question card earlier or
                  not.{" "}
                </p>
                <p>
                  But you&apos;re only eligible for a potential reward if you
                  chomped on this question earlier.
                </p>
              </div>
            </div>
          </>
        );
      case "idle":
        return (
          <>
            <Button
              variant="white"
              isPill
              onClick={() =>
                burnAndReveal(
                  revealNft &&
                    !reveal?.multiple &&
                    !questionChompResult &&
                    !!"useRevealNft",
                )
              }
              className="flex items-center h-10"
            >
              {!!questionChompResult
                ? "Continue"
                : revealNft && !reveal?.multiple
                  ? `Reveal with ${revealNft.type} NFT`
                  : "Reveal"}
            </Button>
            <Button
              variant="black"
              className="h-10"
              isPill
              onClick={() =>
                revealNft && !reveal?.multiple
                  ? burnAndReveal()
                  : setIsRevealModalOpen(false)
              }
            >
              {revealNft &&
              !reveal?.multiple &&
              !insufficientFunds &&
              !questionChompResult
                ? `Reveal for ${numberToCurrencyFormatter.format(reveal?.amount ?? 0)}
              BONK`
                : "Cancel"}
            </Button>
            <div className="bg-[#4D4D4D] p-4 flex gap-4 rounded-lg">
              <div className="relative flex-shrink-0">
                <InfoIcon width={16} height={16} />
              </div>
              <div className="flex flex-col gap-2 text-xs font-normal">
                <p>
                  You would need to burn $BONK to reveal the answer, regardless
                  of whether you&apos;ve chomped on the question card earlier or
                  not.{" "}
                </p>
                <p>
                  But you&apos;re only eligible for a potential reward if you
                  chomped on this question earlier.
                </p>
              </div>
            </div>
          </>
        );
      case "burning":
        return (
          <Button variant="white" className="h-10" isPill disabled>
            Burning $BONK...
          </Button>
        );
    }

    return null;
  }, [
    burnState,
    reveal,
    insufficientFunds,
    questionChompResult,
    revealNft,
    burnAndReveal,
  ]);

  const getDescriptionNode = () => {
    if (questionChompResult) {
      return (
        <p className="text-sm">
          It looks like you have started revealing this question. Please click
          Continue.
        </p>
      );
    } else if (insufficientFunds) {
      return (
        <p className="text-sm">
          It looks like you have insufficient funds to go to the next step.
          Please visit this link to learn how to fund your wallet.
        </p>
      );
    } else if (revealNft && !reveal?.multiple) {
      return (
        <p className="text-sm">{revealNft.type} NFT will be used for reveal</p>
      );
    } else {
      return (
        <p className="text-sm">
          This will cost you{" "}
          <span className="font-bold">
            {numberToCurrencyFormatter.format(reveal?.amount ?? 0)} BONK.
          </span>
        </p>
      );
    }
  };

  return (
    <RevealedContext.Provider value={value}>
      <ChompFullScreenLoader
        isLoading={burnState === "burning"}
        loadingMessage="Burning $BONK..."
      />
      <Sheet
        disableClose={burnState === "burning"}
        isOpen={isRevealModalOpen}
        setIsOpen={setIsRevealModalOpen}
        closIconHeight={16}
        closIconWidth={16}
      >
        <div className="flex flex-col gap-6 pt-4 px-6 pb-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-row w-full items-center justify-between">
              <h3
                className={classNames("font-bold", {
                  "text-[#DD7944]": insufficientFunds && !questionChompResult,
                  "text-[#A3A3EC]": !insufficientFunds || !!questionChompResult,
                })}
              >
                {insufficientFunds && !questionChompResult
                  ? "Insufficient Funds"
                  : "Reveal answer?"}
              </h3>
            </div>
            {getDescriptionNode()}
          </div>
          <div className="flex flex-col gap-2">{revealButtons}</div>
        </div>
      </Sheet>

      <Modal
        title="Claim"
        isOpen={isClaimModelOpen}
        onClose={() => setIsClaimModalOpen(false)}
      >
        <div className="flex flex-col gap-3">
          <p>
            Great job chomping! Claim your reward before it expires (in 30 days)
          </p>
          <Button variant="white" isPill onClick={() => claim?.claim()}>
            Let&apos;s do it
          </Button>
          <Button
            variant="black"
            isPill
            onClick={() => setIsClaimModalOpen(false)}
          >
            I don&apos;t want money
          </Button>
        </div>
      </Modal>
      {children}
    </RevealedContext.Provider>
  );
}

export const useRevealedContext = (): RevealContextState =>
  useContext(RevealedContext);
