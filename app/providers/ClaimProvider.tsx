"use client";

import trackEvent from "@/lib/trackEvent";
import { ChompResult, Question } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import React, { ReactNode, createContext, useContext, useState } from "react";

import { claimQuestions } from "../actions/claim";
import Sheet from "../components/Sheet/Sheet";
import { Button } from "../components/ui/button";
import {
  REVEAL_TYPE,
  TRACKING_EVENTS,
  TRACKING_METADATA,
} from "../constants/tracking";
import { onlyUnique } from "../utils/array";
import { CONNECTION } from "../utils/solana";

type ClaimData = {
  title: string;
  description: string;
  chompResults: (ChompResult & { question: Question })[];
};

interface ClaimProviderType {
  openClaimModal: (claimData: ClaimData) => void;
}

const ClaimContext = createContext<ClaimProviderType | undefined>(undefined);

const ClaimProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimData, setClaimData] = useState({
    title: "",
    description: "",
    chompResults: [] as (ChompResult & { question: Question })[],
  });
  const queryClient = useQueryClient();

  const questionIds = claimData.chompResults.map((cr) => cr.questionId!);
  const questions = claimData.chompResults.map((cr) => cr.question.question);
  const signatures = claimData.chompResults
    .filter((cr) => !!cr.burnTransactionSignature)
    .map((cr) => cr.burnTransactionSignature!)
    .filter(onlyUnique);

  const startClaiming = async (ids: number[]) => {
    try {
      const transactions = (
        await CONNECTION.getParsedTransactions(signatures, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        })
      ).filter((tx) => !!tx);

      if (signatures.length !== transactions.length)
        throw new Error("Cannot find all transactions");

      setIsClaiming(true);
      trackEvent(TRACKING_EVENTS.CLAIM_STARTED, {
        [TRACKING_METADATA.QUESTION_ID]: questionIds,
        [TRACKING_METADATA.QUESTION_TEXT]: questions,
        [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
      });

      const res = await claimQuestions(ids);

      trackEvent(TRACKING_EVENTS.CLAIM_SUCCEEDED, {
        [TRACKING_METADATA.QUESTION_ID]: res?.questionIds,
        [TRACKING_METADATA.CLAIMED_AMOUNT]: res?.claimedAmount,
        [TRACKING_METADATA.TRANSACTION_SIGNATURE]: res?.transactionSignature,
        [TRACKING_METADATA.QUESTION_TEXT]: res?.questions,
        [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
      });
      queryClient.resetQueries({ queryKey: ["questions-history"] });
    } catch {
      await trackEvent(TRACKING_EVENTS.CLAIM_FAILED, {
        [TRACKING_METADATA.QUESTION_ID]: questionIds,
        [TRACKING_METADATA.QUESTION_TEXT]: questions,
        [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
      });
    } finally {
      setIsClaiming(false);
      setIsClaimModalOpen(false);
    }
  };

  const openClaimModal = (claimData: ClaimData) => {
    setIsClaimModalOpen(true);
    setClaimData(claimData);
  };

  return (
    <ClaimContext.Provider value={{ openClaimModal }}>
      <Sheet
        disableClose={isClaiming}
        isOpen={isClaimModalOpen}
        setIsOpen={() => setIsClaimModalOpen(false)}
        closeIconHeight={16}
        closeIconWidth={16}
      >
        <div className="flex flex-col gap-6 pt-4 px-6 pb-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-row w-full items-center justify-between">
              <h3 className="font-bold">{claimData.title}</h3>
            </div>
            {claimData.description}
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => startClaiming(questionIds)}
              disabled={isClaiming}
            >
              {isClaiming ? "Claiming..." : "Claim all"}
            </Button>
            <Button disabled={isClaiming}>Back</Button>
          </div>
        </div>
      </Sheet>
      {children}
    </ClaimContext.Provider>
  );
};

const useClaim = () => {
  const context = useContext(ClaimContext);
  if (!context) {
    throw new Error("useClaim must be used within a ClaimProvider");
  }
  return context;
};

export { ClaimProvider, useClaim };
