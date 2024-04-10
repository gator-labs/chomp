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
<<<<<<< HEAD:app/components/QuestionRowCard/QuestionRowCard.tsx
import { getQuestionState } from "@/app/utils/question";
import { DeckQuestionIncludes } from "../DeckDetails/DeckDetails";

type QuestionRowCardProps = {
  question: DeckQuestionIncludes;
};
=======
import { useRouter } from "next/navigation";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ISolana } from "@dynamic-labs/solana";
import { Connection } from "@solana/web3.js";
import { genBonkBurnTx } from "@/app/utils/solana";
import Image from "next/image";
import classNames from "classnames";
>>>>>>> 0581b297e9b760a124d00227dee8cfdde4d2fcdc:app/components/HomeFeed/HomeFeedRow.tsx

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
<<<<<<< HEAD:app/components/QuestionRowCard/QuestionRowCard.tsx
    setBurnState("burning");
    const blockhash = await CONNECTION.getLatestBlockhash();
=======
      const blockhash = await CONNECTION.getLatestBlockhash()
>>>>>>> 0581b297e9b760a124d00227dee8cfdde4d2fcdc:app/components/HomeFeed/HomeFeedRow.tsx

    const signer = await primaryWallet!.connector.getSigner<ISolana>();
    const tx = await genBonkBurnTx(primaryWallet!.address, blockhash.blockhash);
    const { signature } = await signer.signAndSendTransaction(tx);

<<<<<<< HEAD:app/components/QuestionRowCard/QuestionRowCard.tsx
    console.log("Waiting for confirmation");
    await CONNECTION.confirmTransaction({
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
      signature,
    });
    setBurnState("burned");
    console.log("Confirmed!");
=======
      await CONNECTION.confirmTransaction({
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
        signature,
      })
      setBurnState("burned")
>>>>>>> 0581b297e9b760a124d00227dee8cfdde4d2fcdc:app/components/HomeFeed/HomeFeedRow.tsx

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
<<<<<<< HEAD:app/components/QuestionRowCard/QuestionRowCard.tsx
          <Button variant="white" isPill onClick={burnAndReveal}>
            Let&apos;s do it
=======
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
>>>>>>> 0581b297e9b760a124d00227dee8cfdde4d2fcdc:app/components/HomeFeed/HomeFeedRow.tsx
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
<<<<<<< HEAD:app/components/QuestionRowCard/QuestionRowCard.tsx
        <Button variant="white" isPill disabled>
=======
        <Button variant="white" isPill>
>>>>>>> 0581b297e9b760a124d00227dee8cfdde4d2fcdc:app/components/HomeFeed/HomeFeedRow.tsx
          Burning BONK...
        </Button>
      );
      break;
    case "burned":
      revealButtons = (
<<<<<<< HEAD:app/components/QuestionRowCard/QuestionRowCard.tsx
        <Button variant="white" isPill disabled>
=======
        <Button variant="white" isPill>
>>>>>>> 0581b297e9b760a124d00227dee8cfdde4d2fcdc:app/components/HomeFeed/HomeFeedRow.tsx
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

<<<<<<< HEAD:app/components/QuestionRowCard/QuestionRowCard.tsx
  return (
    <Link href={`/application/answer/question/${question.id}`}>
      <QuestionAccordion
        question={question.question}
        revealedAt={question.revealAtDate}
=======
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
          imageUrl={deck.imageUrl}
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
        imageUrl={deck.imageUrl}
        revealedAt={deck.revealAtDate}
>>>>>>> 0581b297e9b760a124d00227dee8cfdde4d2fcdc:app/components/HomeFeed/HomeFeedRow.tsx
        status="new"
      />
    </Link>
  );
}
