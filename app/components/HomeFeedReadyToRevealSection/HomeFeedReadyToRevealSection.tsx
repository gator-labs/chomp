"use client";

import { revealQuestion } from "@/app/actions/chompResult";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { RevealedQuestion } from "@/app/queries/home";
import { useRouter } from "next/navigation";
import { Button } from "../Button/Button";
import { HomeFeedCardCarousel } from "../HomeFeedCardsCarousel/HomeFeedCardsCarousel";
import { HomeFeedQuestionCard } from "../HomeFeedQuestionCard/HomeFeedQuestionCard";
import { ViewsIcon } from "../Icons/ViewsIcon";

type HomeFeedReadyToRevealSectionProps = {
  questions: RevealedQuestion[];
};

export function HomeFeedReadyToRevealSection({
  questions,
}: HomeFeedReadyToRevealSectionProps) {
  const router = useRouter();
  const { openRevealModal } = useRevealedContext();
  if (questions.length === 0) {
    return null;
  }

  const handleReveal = (questionId: number) => {
    openRevealModal(async () => {
      await revealQuestion(questionId);
      router.push("application/answer/reveal/" + questionId);
      router.refresh();
    });
  };

  const questionSlides = questions.map((q) => (
    <HomeFeedQuestionCard
      key={q.id}
      question={q.question}
      answerCount={q.answerCount}
      revealAtAnswerCount={q.revealAtAnswerCount}
      revealAtDate={q.revealAtDate}
      statusLabel={
        <span className="text-xs leading-6 text-aqua underline">Chomped</span>
      }
      action={
        <Button onClick={() => handleReveal(q.id)} variant="grayish">
          <div className="flex justify-center gap-1 items-center">
            <div>Reveal</div>
            <ViewsIcon />
          </div>
        </Button>
      }
    />
  ));

  return (
    <HomeFeedCardCarousel
      className="mt-6"
      title={
        <span className="text-base text-white">
          Your Chomps ready to reveal
        </span>
      }
      slides={questionSlides}
    />
  );
}
