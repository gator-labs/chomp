"use client";
import { Deck, Question } from "@prisma/client";
import { ElementType } from "./HomeFeed";
import Link from "next/link";
import { QuestionAccordion } from "../QuestionAccordion/QuestionAccordion";
import { QuestionDeck } from "../QuestionDeck/QuestionDeck";
import { useState } from "react";
import { Button } from "../Button/Button";
import { revealQuestion } from "@/app/actions/reveal";
import dayjs from "dayjs";
import { AnsweredQuestionContentFactory } from "@/app/utils/answeredQuestionFactory";
import { Modal } from "../Modal/Modal";
import { useRouter } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ISolana } from '@dynamic-labs/solana';
import { Connection } from "@solana/web3.js";
import { genBonkBurnTx } from "@/app/utils/solana";
import Image from "next/image";
import classNames from "classnames";

const CONNECTION = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

type HomeFeedRowProps = {
  element: Deck | Question;
  type: ElementType;
  isAnswered: boolean;
  isRevealed: boolean;
};

export function HomeFeedRow({
  element,
  type,
  isAnswered,
  isRevealed,
}: HomeFeedRowProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isClaimModelOpen, setIsClaimModalOpen] = useState(false);
  const [burnState, setBurnState] = useState<"burning" | "burned" | "error" | "idle">("idle");

  const router = useRouter();
  const { primaryWallet } = useDynamicContext();

  const burnAndReveal = async () => {
      const blockhash = await CONNECTION.getLatestBlockhash()

      const signer = await primaryWallet!.connector.getSigner<ISolana>();
      const tx = await genBonkBurnTx(primaryWallet!.address, blockhash.blockhash)
      const { signature } = await signer.signAndSendTransaction(tx)

      await CONNECTION.confirmTransaction({
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        signature,
      })
      setBurnState("burned")

      await revealQuestion(element.id);
      router.refresh();
      setIsRevealModalOpen(false);
      setIsClaimModalOpen(true);
  }

  let revealButtons = null
  switch (burnState) {
    case "idle":
      revealButtons = (
        <>
          <Button
            variant="white"
            isPill
            onClick={burnAndReveal}
          >
            <Image       
              src={'/images/bonk.png'}
              alt="Avatar"
              width={32}
              height={32}
            />&nbsp;&nbsp;Burn to Reveal
          </Button>
          <Button
            variant="black"
            isPill
            onClick={() => setIsRevealModalOpen(false)}
          >
            Maybe Later
          </Button>
        </>
      )
    break
    case "burning":
      revealButtons = (
        <Button
          variant="white"
          isPill
        >
          Burning BONK...
        </Button>
      )
      break;
    case "burned":
      revealButtons = (
        <Button
          variant="white"
          isPill
        >
          Burned BONK!
        </Button>
      )
      break;
  }

  if (type === ElementType.Question && isAnswered) {
    const question = element as Question;
    const actionSubmit =
      !isRevealed && dayjs(element.revealAtDate).isBefore(new Date()) ? (
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
          dayjs(element.revealAtDate).isBefore(new Date()) &&
          AnsweredQuestionContentFactory(question)}
      </QuestionAccordion>
    );
  }

  if (type === ElementType.Question) {
    const question = element as Question;
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

  const deck = element as Deck;
  if (isAnswered) {
    return (
      <Link href={`/application/deck/${deck.id}`}>
        <QuestionDeck
          text={deck.deck}
          revealedAt={deck.revealAtDate}
          status="chomped"
        />
      </Link>
    );
  }

  return (
    <Link href={`/application/answer/deck/${deck.id}`}>
      <QuestionDeck
        text={deck.deck}
        revealedAt={deck.revealAtDate}
        status="new"
      />
    </Link>
  );
}
