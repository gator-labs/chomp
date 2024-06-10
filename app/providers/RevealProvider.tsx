"use client";
import { dasUmi } from "@/lib/web3";
import { DotLottiePlayer } from "@dotlottie/react-player";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { publicKey } from "@metaplex-foundation/umi";
import classNames from "classnames";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getUsedGenesisNfts } from "../actions/used-nft-genesis";
import { Button } from "../components/Button/Button";
import { InfoIcon } from "../components/Icons/InfoIcon";
import { Modal } from "../components/Modal/Modal";
import Sheet from "../components/Sheet/Sheet";
import {
  COLLECTION_KEY,
  GENESIS_COLLECTION_VALUE,
} from "../constants/genesis-nfts";
import { numberToCurrencyFormatter } from "../utils/currency";
import { CONNECTION, genBonkBurnTx } from "../utils/solana";
import { useToast } from "./ToastProvider";

interface RevealContextState {
  openRevealModal: (
    reveal: (burnTx?: string, nftAddress?: string) => Promise<void>,
    amount: number,
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
  const { promiseToast } = useToast();
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isClaimModelOpen, setIsClaimModalOpen] = useState(false);
  const [burnState, setBurnState] = useState<
    "burning" | "error" | "idle" | "skipburn"
  >(INITIAL_BURN_STATE);
  const { primaryWallet } = useDynamicContext();

  const [reveal, setReveal] = useState<{
    amount: number;
    multiple: boolean;
    reveal: (burnTx?: string, nftAddress?: string) => Promise<void>;
    genesisNft?: string;
  }>();
  const [claim, setClaim] = useState<{
    claim: () => Promise<void>;
  }>();
  const [genesisNft, setGenesisNft] = useState<string | undefined>();

  const insufficientFunds = !!reveal?.amount && reveal.amount > bonkBalance;

  useEffect(() => {
    async function effect() {
      if (reveal?.multiple || !primaryWallet?.address) return;

      const usedGenesisNftIds = (await getUsedGenesisNfts()).map(
        (usedGenesisNft) => usedGenesisNft.nftId,
      );

      const assets = await dasUmi.rpc.getAssetsByOwner({
        owner: publicKey(primaryWallet.address),
      });

      const [genesisNft] = assets.items.filter(
        (item) =>
          item.grouping.find(
            (group) =>
              group.group_key === COLLECTION_KEY &&
              group.group_value === GENESIS_COLLECTION_VALUE,
          ) &&
          !item.burnt &&
          !usedGenesisNftIds.includes(item.id),
      );

      if (genesisNft) {
        setGenesisNft(genesisNft.id);
      }
    }
    effect();
  }, [reveal, primaryWallet?.address]);

  const burnAndReveal = useCallback(
    async (useGenesisNft = false) => {
      let burnTx: string | undefined;
      if (!useGenesisNft || !genesisNft || reveal?.multiple) {
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

        await CONNECTION.confirmTransaction(
          {
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
            signature,
          },
          "finalized",
        );

        burnTx = signature;
      }

      if (reveal) {
        await reveal.reveal(
          burnTx,
          genesisNft && !reveal?.multiple ? genesisNft : undefined,
        );

        if (genesisNft && !reveal?.multiple) setGenesisNft(undefined);

        closeRevealModal();
      }
    },
    [reveal],
  );

  const revealButtons = useMemo(() => {
    if (insufficientFunds && !genesisNft) {
      return (
        <>
          <a
            href="https://chomp.gitbook.io/chomp/how-to-chomp/first-time-using-solana"
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
              onClick={() => burnAndReveal(!!"useGenesisNft")}
              className="flex items-center h-10"
            >
              {genesisNft && !reveal?.multiple
                ? "Reveal with genesis NFT"
                : "Reveal"}
            </Button>
            <Button
              variant="black"
              className="h-10"
              isPill
              onClick={() =>
                genesisNft && !reveal?.multiple
                  ? burnAndReveal()
                  : setIsRevealModalOpen(false)
              }
            >
              {genesisNft && !reveal?.multiple && !insufficientFunds
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
            Burning BONK...
          </Button>
        );
    }

    return null;
  }, [burnState, reveal, insufficientFunds]);

  const openRevealModal = useCallback(
    (
      reveal: (burnTx?: string, nftAddress?: string) => Promise<void>,
      amount: number,
      multiple = false,
    ) => {
      setBurnState(INITIAL_BURN_STATE);
      setReveal({ reveal, amount, multiple });
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

  const getDescriptionNode = () => {
    if (insufficientFunds) {
      return (
        <p className="text-sm">
          It looks like you have insufficient funds to go to the next step.
          Please visit this link to learn how to fund your wallet.
        </p>
      );
    } else if (genesisNft && !reveal?.multiple) {
      return <p className="text-sm">Genesis NFT will be used for reveal</p>;
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
      {burnState === "burning" && (
        <div className="absolute top-0 left-0 w-screen h-screen z-[99]">
          <div className="flex flex-col absolute top-1/3 left-1/2 -translate-x-1/2 gap-2">
            <div className="rounded-full overflow-hidden flex justify-center items-center w-fit ">
              <DotLottiePlayer
                className="w-32 h-32"
                loop
                autoplay
                src="/lottie/chomp.lottie"
              />
            </div>
            <p>Burning bonk...</p>
          </div>
        </div>
      )}
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
                  "text-[#DD7944]": insufficientFunds,
                  "text-[#A3A3EC]": !insufficientFunds,
                })}
              >
                {insufficientFunds ? "Insufficient Funds" : "Reveal answer?"}
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
