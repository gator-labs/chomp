"use client";
import Link from "next/link";
import { revealQuestion } from "@/app/actions/reveal";
import { genBonkBurnTx } from "@/app/utils/solana";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { Connection } from "@solana/web3.js";
import { useState } from "react";
import { Button } from "../Button/Button";
import { QuestionAccordion } from "../QuestionAccordion/QuestionAccordion";
import { AnsweredQuestionContentFactory } from "@/app/utils/answeredQuestionFactory";
import { Modal } from "../Modal/Modal";
import { getQuestionState } from "@/app/utils/question";
import { DeckQuestionIncludes } from "../DeckDetails/DeckDetails";
import Image from "next/image";

type QuestionRowCardProps = {
  question: DeckQuestionIncludes;
  onRefreshCards: () => void;
};

const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

export function QuestionRowCard({
  question,
  onRefreshCards,
}: QuestionRowCardProps) {
  const { isAnswered, isRevealed, isRevealable } = getQuestionState(question);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isClaimModelOpen, setIsClaimModalOpen] = useState(false);
  const [burnState, setBurnState] = useState<
    "burning" | "burned" | "error" | "idle"
  >("idle");
  const { primaryWallet } = useDynamicContext();

  const burnAndReveal = async () => {
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

    await revealQuestion(question.id);
    onRefreshCards();
    setIsRevealModalOpen(false);
  };

  let revealButtons = null;
  switch (burnState) {
    case "idle":
      revealButtons = (
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
      break;
    case "burning":
      revealButtons = (
        <Button variant="white" isPill disabled>
          Burning BONK...
        </Button>
      );
      break;
    case "burned":
      revealButtons = (
        <Button variant="white" isPill disabled>
          Burned BONK!
        </Button>
      );
      break;
  }

  if (isAnswered) {
    let actionSubmit = <></>;

    if (isRevealable && !isRevealed) {
      actionSubmit = (
        <>
          <Button
            variant="white"
            isPill
            onClick={() => setIsRevealModalOpen(true)}
          >
            Reveal Results
          </Button>
        </>
      );
    }

    if (isRevealable && isRevealed) {
      actionSubmit = (
        <>
          <Button
            variant="white"
            isPill
            onClick={() => setIsClaimModalOpen(true)}
          >
            Claim Reward
          </Button>
        </>
      );
    }

    return (
      <>
        <QuestionAccordion
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
          question={question.question}
          revealedAt={question.revealAtDate}
          actionChild={actionSubmit}
          status="chomped"
        >
          {isRevealed && AnsweredQuestionContentFactory(question)}
        </QuestionAccordion>
        <Modal
          title="Reveal"
          isOpen={isRevealModalOpen}
          onClose={() => setIsRevealModalOpen(false)}
        >
          <div className="flex flex-col gap-3">
            <p>
              Revealing this question will cost you 5K BONK, and earn you 42
              poiints! Would you like to reveal?
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
              Great job chomping! Claim your reward before it expires (in 30
              days)
            </p>
            <Button
              variant="white"
              isPill
              onClick={() => setIsClaimModalOpen(false)}
            >
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
      </>
    );
  }

  return (
    <Link href={`/application/answer/question/${question.id}`}>
      <QuestionAccordion
        question={question.question}
        revealedAt={question.revealAtDate}
        status="new"
      />
    </Link>
  );
}
