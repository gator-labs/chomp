"use client";
import { revealQuestion } from "@/app/actions/reveal";
import { useCollapsedContext } from "@/app/providers/CollapsedProvider";
import { getQuestionState } from "@/app/utils/question";
import { genBonkBurnTx } from "@/app/utils/solana";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { Connection } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnsweredQuestionContent } from "../AnsweredQuestionContent/AnsweredQuestionContent";
import { Button } from "../Button/Button";
import { DeckQuestionIncludes } from "../DeckDetails/DeckDetails";
import { Modal } from "../Modal/Modal";
import { QuestionAccordion } from "../QuestionAccordion/QuestionAccordion";

type QuestionRowCardProps = {
  question: DeckQuestionIncludes;
  onRefreshCards: (revealedId: number) => void;
};

const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

export function QuestionRowCard({
  question,
  onRefreshCards,
}: QuestionRowCardProps) {
  const { isAnswered, isRevealed, isRevealable } = getQuestionState(question);
  const { getIsOpen, toggleCollapsed, setOpen } = useCollapsedContext();
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isClaimModelOpen, setIsClaimModalOpen] = useState(false);
  const [burnState, setBurnState] = useState<
    "burning" | "burned" | "error" | "idle" | "skipburn"
  >("skipburn");
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

    await reveal();
  };

  const reveal = async () => {
    await revealQuestion(question.id);
    onRefreshCards(question.id);
    setOpen(question.id);
    setIsRevealModalOpen(false);
  };

  let revealButtons = null;
  switch (burnState) {
    case "skipburn":
      revealButtons = (
        <>
          <Button variant="white" isPill onClick={reveal}>
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
      break;

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
          isCollapsed={!getIsOpen(question.id)}
          onToggleCollapse={() => toggleCollapsed(question.id)}
          question={question.question}
          revealedAt={question.revealAtDate}
          actionChild={actionSubmit}
          status="chomped"
        >
          {isRevealed && <AnsweredQuestionContent element={question} />}
        </QuestionAccordion>
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
