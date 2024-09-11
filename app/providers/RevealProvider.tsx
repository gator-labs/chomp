"use client";
import sendToMixpanel from "@/lib/mixpanel";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import classNames from "classnames";
import { ReactNode, createContext, useContext } from "react";
import ChompFullScreenLoader from "../components/ChompFullScreenLoader/ChompFullScreenLoader";
import { InfoIcon } from "../components/Icons/InfoIcon";
import Sheet from "../components/Sheet/Sheet";
import Spinner from "../components/Spinner/Spinner";
import { Button } from "../components/ui/button";
import {
  MIX_PANEL_EVENTS,
  MIX_PANEL_METADATA,
  REVEAL_TYPE,
} from "../constants/mixpanel";
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
    revealPrice,
    pendingTransactions,
    isRevealWithNftMode,
    questionIds,
    questions,
    dialogLabel,
    isLoading,
  } = useReveal({
    bonkBalance,
    address: primaryWallet?.address,
    wallet: primaryWallet,
  });

  const hasPendingTransactions = pendingTransactions > 0;

  const revealButtons = () => {
    if (insufficientFunds && !isRevealWithNftMode) {
      return (
        <>
          <a
            href="https://x.com/chompdotgames/status/1798664081102258304"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="text-gray-850 h-10">Learn how</Button>
          </a>
          <Button
            variant="outline"
            className="h-10"
            onClick={() => {
              sendToMixpanel(MIX_PANEL_EVENTS.REVEAL_DIALOG_CLOSED, {
                [MIX_PANEL_METADATA.QUESTION_ID]: questionIds,
                [MIX_PANEL_METADATA.QUESTION_TEXT]: questions,
                [MIX_PANEL_METADATA.REVEAL_TYPE]:
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
            <Button onClick={onReveal}>Reveal</Button>
            <Button
              variant="outline"
              onClick={() => {
                sendToMixpanel(MIX_PANEL_EVENTS.REVEAL_DIALOG_CLOSED, {
                  [MIX_PANEL_METADATA.QUESTION_ID]: questionIds,
                  [MIX_PANEL_METADATA.QUESTION_TEXT]: questions,
                  [MIX_PANEL_METADATA.REVEAL_TYPE]:
                    questionIds.length > 1
                      ? REVEAL_TYPE.ALL
                      : REVEAL_TYPE.SINGLE,
                });
                cancelReveal();
              }}
            >
              Cancel
            </Button>
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
          </>
        );
      case "idle":
        return (
          <>
            <Button
              onClick={() => {
                if (
                  !hasPendingTransactions &&
                  questionIds?.length &&
                  !isRevealWithNftMode
                )
                  sendToMixpanel(MIX_PANEL_EVENTS.REVEAL_STARTED, {
                    [MIX_PANEL_METADATA.QUESTION_ID]: questionIds,
                    [MIX_PANEL_METADATA.QUESTION_TEXT]: questions,
                    [MIX_PANEL_METADATA.REVEAL_TYPE]:
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
              variant="outline"
              onClick={() => {
                if (isRevealWithNftMode) return burnAndReveal(true);

                resetReveal();
                sendToMixpanel(MIX_PANEL_EVENTS.REVEAL_DIALOG_CLOSED, {
                  [MIX_PANEL_METADATA.QUESTION_ID]: questionIds,
                  [MIX_PANEL_METADATA.QUESTION_TEXT]: questions,
                  [MIX_PANEL_METADATA.REVEAL_TYPE]:
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
          </>
        );
      case "burning":
        return <Button disabled>Burning $BONK...</Button>;
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

  return (
    <RevealedContext.Provider
      value={{ openRevealModal: onSetReveal, closeRevealModal: resetReveal }}
    >
      <ChompFullScreenLoader
        isLoading={burnState === "burning"}
        loadingMessage="Burning $BONK..."
      />
      <Sheet
        disableClose={burnState === "burning"}
        isOpen={isRevealModalOpen}
        setIsOpen={() => {
          sendToMixpanel(MIX_PANEL_EVENTS.REVEAL_DIALOG_CLOSED, {
            [MIX_PANEL_METADATA.QUESTION_ID]: questionIds,
            [MIX_PANEL_METADATA.QUESTION_TEXT]: questions,
            [MIX_PANEL_METADATA.REVEAL_TYPE]:
              questionIds.length > 1 ? REVEAL_TYPE.ALL : REVEAL_TYPE.SINGLE,
          });
          cancelReveal();
        }}
        closeIconHeight={16}
        closeIconWidth={16}
      >
        {isLoading ? (
          <div className="h-[270px] flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="flex flex-col gap-6 pt-4 px-6 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-row w-full items-center justify-between">
                <h3
                  className={classNames("font-bold", {
                    "text-[#DD7944]": insufficientFunds,
                    "text-purple-500": !insufficientFunds,
                  })}
                >
                  {insufficientFunds
                    ? "Insufficient Funds"
                    : !!dialogLabel
                      ? dialogLabel
                      : questionIds.length > 1
                        ? "Reveal all?"
                        : "Reveal answer?"}
                </h3>
              </div>
              {getDescriptionNode()}
            </div>
            <div className="flex flex-col gap-2">{revealButtons()}</div>
          </div>
        )}
      </Sheet>

      {children}
    </RevealedContext.Provider>
  );
}

export const useRevealedContext = (): RevealContextState =>
  useContext(RevealedContext);
