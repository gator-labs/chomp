"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import Image from "next/image";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Button } from "../components/Button/Button";
import { Modal } from "../components/Modal/Modal";
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
    const blockhash = await CONNECTION.getLatestBlockhash();

    const signer = await primaryWallet!.connector.getSigner<ISolana>();
    const tx = await genBonkBurnTx(primaryWallet!.address, blockhash.blockhash);
    const { signature } = await signer.signAndSendTransaction(tx);

    await CONNECTION.confirmTransaction({
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
      signature,
    });
    setBurnState("burned");

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
            >
              Reveal
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
      <Modal
        title="Reveal"
        isOpen={isRevealModalOpen}
        onClose={() => setIsRevealModalOpen(false)}
      >
        <div className="flex flex-col gap-3">
          <p>
            Revealing this question will earn you 42 points!
            <br />
            Would you like to reveal?
          </p>
          {revealButtons}
        </div>
      </Modal>

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
