"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import classNames from "classnames";
import { ReactNode, createContext, useContext, useMemo } from "react";
import { Button } from "../components/Button/Button";
import ChompFullScreenLoader from "../components/ChompFullScreenLoader/ChompFullScreenLoader";
import { InfoIcon } from "../components/Icons/InfoIcon";
import Sheet from "../components/Sheet/Sheet";
import { RevealCallbackProps, useReveal } from "../hooks/useReveal";
import { numberToCurrencyFormatter } from "../utils/currency";

interface RevealContextState {
  openRevealModal: (props: RevealCallbackProps) => void;
  closeRevealModal: () => void;
}

const initialContextValue: RevealContextState = {
  openRevealModal: () => {},
  closeRevealModal: () => {},
};

export const RevealedContext =
  createContext<RevealContextState>(initialContextValue);

export function RevealContextProvider({
  children,
  bonkBalance,
}: {
  children: ReactNode;
  bonkBalance: number;
}) {
  const { primaryWallet } = useDynamicContext();
  const {
    onSetReveal,
    resetReveal,
    onReveal,
    cancelReveal,
    burnAndReveal,
    burnState,
    isRevealModalOpen,
    insufficientFunds,
    genesisNft,
    revealPrice,
    hasPendingTransactions,
    doesSatisfyCriteriaToRevealWithGenesisNft,
  } = useReveal({
    bonkBalance,
    address: primaryWallet?.address,
    wallet: primaryWallet,
  });

  const revealButtons = useMemo(() => {
    if (insufficientFunds && !doesSatisfyCriteriaToRevealWithGenesisNft) {
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
            onClick={cancelReveal}
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
              onClick={onReveal}
              className="text-black h-10"
            >
              Reveal
            </Button>
            <Button
              variant="black"
              isPill
              className="h-10"
              onClick={cancelReveal}
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
              onClick={() => burnAndReveal()}
              className="flex items-center h-10"
            >
              {hasPendingTransactions
                ? "Continue"
                : doesSatisfyCriteriaToRevealWithGenesisNft
                  ? "Reveal with genesis NFT"
                  : "Reveal"}
            </Button>
            <Button
              variant="black"
              className="h-10"
              isPill
              onClick={() =>
                doesSatisfyCriteriaToRevealWithGenesisNft
                  ? burnAndReveal()
                  : resetReveal()
              }
            >
              {doesSatisfyCriteriaToRevealWithGenesisNft
                ? `Reveal for ${numberToCurrencyFormatter.format(revealPrice)} BONK`
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
  }, [burnState, insufficientFunds, genesisNft]);

  const getDescriptionNode = () => {
    if (hasPendingTransactions) {
      return (
        <p className="text-sm">
          It looks like you have started revealing this question. Please click
          Continue.
        </p>
      );
    }

    if (insufficientFunds) {
      return (
        <p className="text-sm">
          It looks like you have insufficient funds to go to the next step.
          Please visit this link to learn how to fund your wallet.
        </p>
      );
    }

    if (doesSatisfyCriteriaToRevealWithGenesisNft) {
      return <p className="text-sm">Genesis NFT will be used for reveal</p>;
    }

    return (
      <p className="text-sm">
        This will cost you{" "}
        <span className="font-bold">
          {numberToCurrencyFormatter.format(revealPrice)} BONK.
        </span>
      </p>
    );
  };

  return (
    <RevealedContext.Provider
      value={{ openRevealModal: onSetReveal, closeRevealModal: resetReveal }}
    >
      <ChompFullScreenLoader
        isLoading={burnState === "burning"}
        loadingMessage="Burning bonk..."
      />
      <Sheet
        disableClose={burnState === "burning"}
        isOpen={isRevealModalOpen}
        setIsOpen={cancelReveal}
        closeIconHeight={16}
        closeIconWidth={16}
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

      {children}
    </RevealedContext.Provider>
  );
}

export const useRevealedContext = (): RevealContextState =>
  useContext(RevealedContext);
