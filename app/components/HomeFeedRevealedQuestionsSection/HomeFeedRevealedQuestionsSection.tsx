"use client";

import { dismissQuestion, revealQuestion } from "@/app/actions/chompResult";
import { CloseIcon } from "@/app/components/Icons/CloseIcon";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { RevealedQuestion } from "@/app/queries/home";
import { useRouter } from "next/navigation";
import { HomeFeedCardCarousel } from "../HomeFeedCardsCarousel/HomeFeedCardsCarousel";
import { HomeFeedEmptyQuestionCard } from "../HomeFeedEmptyQuestionCard/HomeFeedEmptyQuestionCard";
import { HomeFeedQuestionCard } from "../HomeFeedQuestionCard/HomeFeedQuestionCard";

type HomeFeedRevealedQuestionsSectionProps = {
  questions: RevealedQuestion[];
};

const QUESTIONS_IN_SECTION = 5;
export function HomeFeedRevealedQuestionsSection({
  questions,
}: HomeFeedRevealedQuestionsSectionProps) {
  const router = useRouter();
  const { openRevealModal } = useRevealedContext();

  const handleReveal = (q: RevealedQuestion) => {
    openRevealModal(async (burnTx?: string, nftAddress?: string) => {
      await revealQuestion(q.id, burnTx, nftAddress);
      router.push("application/answer/reveal/" + q.id);
      router.refresh();
    }, q.revealTokenAmount ?? 0);
  };

  const questionSlides = questions
    .filter((_, index) => index < QUESTIONS_IN_SECTION)
    .map((q) => (
      <HomeFeedQuestionCard
        key={q.id}
        question={q.question}
        answerCount={q.answerCount}
        revealAtAnswerCount={q.revealAtAnswerCount}
        revealAtDate={q.revealAtDate}
        onTopCornerAction={() => dismissQuestion(q.id)}
        topCornerActionIcon={<CloseIcon />}
        statusLabel={
          <button
            onClick={() => handleReveal(q)}
            className="text-xs leading-6 text-white font-bold cursor-pointer"
          >
            View
          </button>
        }
      />
    ));

  if (questionSlides.length < QUESTIONS_IN_SECTION) {
    questionSlides.push(
      <HomeFeedEmptyQuestionCard key={questionSlides.length} />,
    );
  }

  return (
    <HomeFeedCardCarousel
      className="mt-6"
      title={
        <span className="text-base text-white">
          Check out others’ revealed questions
        </span>
      }
      slides={questionSlides}
    />
  );
}
