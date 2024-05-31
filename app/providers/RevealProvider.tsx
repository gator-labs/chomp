"use client";
import { dasUmi } from "@/lib/web3";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { publicKey } from "@metaplex-foundation/umi";
import Image from "next/image";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  createUsedGenesisNft,
  getUsedGenesisNfts,
} from "../actions/used-nft-genesis";
import { Button } from "../components/Button/Button";
import { InfoIcon } from "../components/Icons/InfoIcon";
import { Modal } from "../components/Modal/Modal";
import Sheet from "../components/Sheet/Sheet";
import { REVEAL_COST } from "../constants/costs";
import {
  COLLECTION_KEY,
  GENESIS_COLLECTION_VALUE,
} from "../constants/genesis-nfts";
import { numberToCurrencyFormatter } from "../utils/currency";
import { CONNECTION, genBonkBurnTx } from "../utils/solana";
import { useConfetti } from "./ConfettiProvider";

interface RevealContextState {
  openRevealModal: (reveal: () => Promise<void>) => void;
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

const INITIAL_BURN_STATE = "skipburn";
export function RevealContextProvider({ children }: { children: ReactNode }) {
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isClaimModelOpen, setIsClaimModalOpen] = useState(false);
  const [burnState, setBurnState] = useState<
    "burning" | "burned" | "error" | "idle" | "skipburn"
  >(INITIAL_BURN_STATE);
  const { primaryWallet } = useDynamicContext();
  const { fire } = useConfetti();
  const [reveal, setReveal] = useState<{
    reveal: () => Promise<void>;
  }>();
  const [claim, setClaim] = useState<{
    claim: () => Promise<void>;
  }>();

  const burnAndReveal = useCallback(async () => {
    const usedGenesisNftIds = (await getUsedGenesisNfts()).map(
      (usedGenesisNft) => usedGenesisNft.nftId,
    );

    const assets = await dasUmi.rpc.getAssetsByOwner({
      owner: publicKey(primaryWallet!.address),
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

    if (!genesisNft) {
      const blockhash = await CONNECTION.getLatestBlockhash();
      const signer = await primaryWallet!.connector.getSigner<ISolana>();
      const tx = await genBonkBurnTx(
        primaryWallet!.address,
        blockhash.blockhash,
      );
      const { signature } = await signer.signAndSendTransaction(tx);

      await CONNECTION.confirmTransaction({
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        signature,
      });
      setBurnState("burned");
    } else {
      await createUsedGenesisNft(genesisNft.id, primaryWallet!.address);
    }

    if (reveal) {
      await reveal.reveal();
    }
    fire();
  }, [reveal]);

  const revealButtons = useMemo(() => {
    switch (burnState) {
      case "skipburn":
        return (
          <>
            <Button
              variant="white"
              isPill
              onClick={async () => {
                await reveal?.reveal();
                fire();
              }}
              className="text-black"
            >
              Reveal
            </Button>
            <Button
              variant="black"
              isPill
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
              onClick={burnAndReveal}
              className="flex items-center"
            >
              <Image
                src={"/images/bonk.png"}
                alt="Avatar"
                width={32}
                height={32}
              />
              &nbsp;&nbsp;Burn to Reveal
            </Button>
            <Button
              variant="black"
              isPill
              onClick={() => setIsRevealModalOpen(false)}
            >
              Maybe Later
            </Button>
          </>
        );
      case "burning":
        return (
          <Button variant="white" isPill disabled>
            Burning BONK...
          </Button>
        );

      case "burned":
        return (
          <Button variant="white" isPill disabled>
            Burned BONK!
          </Button>
        );
    }

    return null;
  }, [burnState, reveal]);

  const openRevealModal = useCallback(
    (reveal: () => Promise<void>) => {
      setBurnState(INITIAL_BURN_STATE);
      setReveal({ reveal });
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

  return (
    <RevealedContext.Provider value={value}>
      <Sheet isOpen={isRevealModalOpen} setIsOpen={setIsRevealModalOpen}>
        <div className="flex flex-col gap-5 px-5 pb-5">
          <div className="flex flex-col gap-3">
            <h3 className="font-bold">Reveal answer?</h3>
            <p>
              This will cost you{" "}
              <span className="font-bold">
                {numberToCurrencyFormatter.format(REVEAL_COST)} BONK.
              </span>
            </p>
          </div>
          <div className="flex flex-col gap-3">{revealButtons}</div>
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
