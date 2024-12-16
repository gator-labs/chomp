"use client";

import trackEvent from "@/lib/trackEvent";
import { RevealCallbackProps } from "@/types/reveal";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import classNames from "classnames";
import Link from "next/link";
import { ReactNode, createContext, useContext } from "react";

import ChompFullScreenLoader from "../components/ChompFullScreenLoader/ChompFullScreenLoader";
import { CloseIcon } from "../components/Icons/CloseIcon";
import { InfoIcon } from "../components/Icons/InfoIcon";
import Spinner from "../components/Spinner/Spinner";
import { Button } from "../components/ui/button";
import { Drawer, DrawerContent } from "../components/ui/drawer";
import {
  REVEAL_TYPE,
  TRACKING_EVENTS,
  TRACKING_METADATA,
} from "../constants/tracking";
import { useReveal } from "../hooks/useReveal";
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
  solBalance,
}: {
  children: ReactNode;
  bonkBalance: number;
  solBalance: number;
}) {
  const { primaryWallet } = useDynamicContext();
  const {
    onSetReveal,
    resetReveal,
    onReveal,
    cancelReveal,
    burnAndReveal,
    processingTransaction,
    burnState,
    isRevealModalOpen,
    insufficientFunds,
    revealPrice,
    pendingTransactions,
    isRevealWithNftMode,
    questionIds,
    questions,
    isLoading,
  } = useReveal({
    bonkBalance,
    address: primaryWallet?.address,
    wallet: primaryWallet,
    solBalance,
  });

  const hasPendingTransactions = pendingTransactions > 0;

  const revealButtons = () => {
    if (insufficientFunds && !isRevealWithNftMode) {
      return (
        <>
          <Link
            href="https://x.com/chompdotgames/status/1798664081102258304"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="text-gray-850 h-10 w-full">Learn how</Button>
          </Link>
          <Button
            variant="outline"
            className="h-10 font-bold"
            onClick={() => {
              trackEvent(TRACKING_EVENTS.REVEAL_DIALOG_CLOSED, {
                [TRACKING_METADATA.QUESTION_ID]: questionIds,
                [TRACKING_METADATA.QUESTION_TEXT]: questions,
                [TRACKING_METADATA.REVEAL_TYPE]:
                  questionIds.length > 1 ? REVEAL_TYPE.ALL : REVEAL_TYPE.SINGLE,
              });
              cancelReveal();
            }}
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
            <div className="bg-gray-700 p-4 flex gap-4 rounded-lg">
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
            <Button className="font-bold" onClick={onReveal}>
              Reveal
            </Button>
            <Button
              variant="outline"
              className="font-bold"
              onClick={() => {
                trackEvent(TRACKING_EVENTS.REVEAL_DIALOG_CLOSED, {
                  [TRACKING_METADATA.QUESTION_ID]: questionIds,
                  [TRACKING_METADATA.QUESTION_TEXT]: questions,
                  [TRACKING_METADATA.REVEAL_TYPE]:
                    questionIds.length > 1
                      ? REVEAL_TYPE.ALL
                      : REVEAL_TYPE.SINGLE,
                });
                cancelReveal();
              }}
            >
              Cancel
            </Button>
          </>
        );
      case "idle":
        return (
          <>
            <div className="bg-gray-700 p-4 flex gap-4 rounded-lg">
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
            <Button
              className="font-bold"
              disabled={processingTransaction}
              isLoading={processingTransaction}
              onClick={() => {
                if (
                  !hasPendingTransactions &&
                  questionIds?.length &&
                  !isRevealWithNftMode
                )
                  trackEvent(TRACKING_EVENTS.REVEAL_STARTED, {
                    [TRACKING_METADATA.QUESTION_ID]: questionIds,
                    [TRACKING_METADATA.QUESTION_TEXT]: questions,
                    [TRACKING_METADATA.REVEAL_TYPE]:
                      questionIds.length > 1
                        ? REVEAL_TYPE.ALL
                        : REVEAL_TYPE.SINGLE,
                  });

                burnAndReveal();
              }}
            >
              {hasPendingTransactions && !questionIds?.length
                ? "Continue"
                : isRevealWithNftMode
                  ? "Reveal with Chomp Collectible"
                  : "Reveal"}
            </Button>
            <Button
              className="font-bold"
              variant="outline"
              onClick={() => {
                if (isRevealWithNftMode) return burnAndReveal(true);

                resetReveal();
                trackEvent(TRACKING_EVENTS.REVEAL_DIALOG_CLOSED, {
                  [TRACKING_METADATA.QUESTION_ID]: questionIds,
                  [TRACKING_METADATA.QUESTION_TEXT]: questions,
                  [TRACKING_METADATA.REVEAL_TYPE]:
                    questionIds.length > 1
                      ? REVEAL_TYPE.ALL
                      : REVEAL_TYPE.SINGLE,
                });
              }}
            >
              {isRevealWithNftMode
                ? `Reveal for ${numberToCurrencyFormatter.format(revealPrice)} BONK`
                : "Cancel"}
            </Button>
          </>
        );
      case "burning":
        return (
          <Button className="font-bold" disabled>
            Burning $BONK...
          </Button>
        );
    }

    return null;
  };

  const getDescriptionNode = () => {
    if (hasPendingTransactions && !questionIds.length) {
      return (
        <p className="text-sm">
          It looks like you have started revealing{" "}
          {pendingTransactions > 1 ? "these questions" : "this question"}.
          Please click Continue.
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

    if (isRevealWithNftMode) {
      return (
        <p className="text-sm">Chomp Collectible will be used for reveal</p>
      );
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

  const closeRevealModal = () => {
    trackEvent(TRACKING_EVENTS.REVEAL_DIALOG_CLOSED, {
      [TRACKING_METADATA.QUESTION_ID]: questionIds,
      [TRACKING_METADATA.QUESTION_TEXT]: questions,
      [TRACKING_METADATA.REVEAL_TYPE]:
        questionIds.length > 1 ? REVEAL_TYPE.ALL : REVEAL_TYPE.SINGLE,
    });
    cancelReveal();
  };

  return (
    <RevealedContext.Provider
      value={{ openRevealModal: onSetReveal, closeRevealModal: resetReveal }}
    >
      <ChompFullScreenLoader
        isLoading={burnState === "burning"}
        loadingMessage="Burning $BONK..."
      />
      <Drawer
        open={isRevealModalOpen}
        onOpenChange={(open: boolean) => {
          if (!open && burnState !== "burning") {
            closeRevealModal();
          }
        }}
        dismissible={burnState !== "burning"}
      >
        <DrawerContent>
          <div className="relative">
            {isLoading ? (
              <div className="h-[330px] flex items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    if (isRevealModalOpen) {
                      e.stopPropagation();
                      closeRevealModal();
                    }
                  }}
                  className="!absolute !top-3 !right-6 !border-none !w-max !p-0 z-50"
                >
                  <CloseIcon width={16} height={16} />
                </Button>
                <div className="flex flex-col gap-6 pt-6 px-6 pb-6">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-row w-full items-center justify-between">
                      <h3
                        className={classNames("font-bold", {
                          "text-[#DD7944]": insufficientFunds,
                          "text-secondary": !insufficientFunds,
                        })}
                      >
                        {insufficientFunds
                          ? "Insufficient Funds"
                          : questionIds.length > 1
                            ? "Reveal all?"
                            : "Reveal answer?"}
                      </h3>
                    </div>
                    {getDescriptionNode()}
                  </div>
                  <div className="flex flex-col gap-2">{revealButtons()}</div>
                </div>
              </>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {children}
    </RevealedContext.Provider>
  );
}

export const useRevealedContext = (): RevealContextState =>
  useContext(RevealedContext);
