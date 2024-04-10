"use client";
import Link from "next/link";
import { revealQuestion } from "@/app/actions/reveal";
import { genBonkBurnTx } from "@/app/utils/solana";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { Connection } from "@solana/web3.js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../Button/Button";
import { QuestionAccordion } from "../QuestionAccordion/QuestionAccordion";
import dayjs from "dayjs";
import { AnsweredQuestionContentFactory } from "@/app/utils/answeredQuestionFactory";
import { Modal } from "../Modal/Modal";
import { getQuestionState } from "@/app/utils/question";
import { DeckQuestionIncludes } from "../DeckDetails/DeckDetails";

type QuestionRowCardProps = {
  question: DeckQuestionIncludes;
};

const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

export function QuestionRowCard({ question }: QuestionRowCardProps) {
  const { isAnswered, isRevealed } = getQuestionState(question);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isClaimModelOpen, setIsClaimModalOpen] = useState(false);
  const [burnState, setBurnState] = useState<
    "burning" | "burned" | "error" | "idle"
  >("idle");

  const router = useRouter();
  const { primaryWallet } = useDynamicContext();

  const burnAndReveal = async () => {
    setBurnState("burning");
    const blockhash = await CONNECTION.getLatestBlockhash();

    const signer = await primaryWallet!.connector.getSigner<ISolana>();
    const tx = await genBonkBurnTx(primaryWallet!.address, blockhash.blockhash);
    const { signature } = await signer.signAndSendTransaction(tx);

    console.log("Waiting for confirmation");
    await CONNECTION.confirmTransaction({
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
      signature,
    });
    setBurnState("burned");
    console.log("Confirmed!");

    await revealQuestion(question.id);
    router.refresh();
    setIsRevealModalOpen(false);
    setIsClaimModalOpen(true);
  };

  let revealButtons = null;
  switch (burnState) {
    case "idle":
      revealButtons = (
        <>
          <Button variant="white" isPill onClick={burnAndReveal}>
            Let&apos;s do it
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
    const actionSubmit =
      !isRevealed && dayjs(question.revealAtDate).isBefore(new Date()) ? (
        <>
          <Button
            variant="white"
            isPill
            onClick={() => setIsRevealModalOpen(true)}
          >
            Reveal Results
          </Button>

          <Modal
            title="Reveal"
            isOpen={isRevealModalOpen}
            onClose={() => setIsRevealModalOpen(false)}
          >
            <div className="flex flex-col gap-3">
              <p>
                Revealing this question will cost you 5K, but you could earn up
                to 10K. Would you like to reveal?
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
      ) : null;

    return (
      <QuestionAccordion
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
        question={question.question}
        revealedAt={question.revealAtDate}
        actionChild={actionSubmit}
        status="chomped"
      >
        {!!isRevealed &&
          dayjs(question.revealAtDate).isBefore(new Date()) &&
          AnsweredQuestionContentFactory(question)}
      </QuestionAccordion>
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
