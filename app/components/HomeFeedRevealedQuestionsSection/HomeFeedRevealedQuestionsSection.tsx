"use client";

import { dismissQuestion } from "@/app/actions/chompResult";
import { CloseIcon } from "@/app/components/Icons/CloseIcon";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { RevealedQuestion } from "@/app/queries/home";
import { useRouter } from "next/navigation";
import { FeedQuestionCard } from "../FeedQuestionCard/FeedQuestionCard";
import { HomeFeedCardCarousel } from "../HomeFeedCardsCarousel/HomeFeedCardsCarousel";
import { HomeFeedEmptyQuestionCard } from "../HomeFeedEmptyQuestionCard/HomeFeedEmptyQuestionCard";

type HomeFeedRevealedQuestionsSectionProps = {
  questions: RevealedQuestion[];
};

const QUESTIONS_IN_SECTION = 5;
export function HomeFeedRevealedQuestionsSection({
  questions,
}: HomeFeedRevealedQuestionsSectionProps) {
  const router = useRouter();
  const { openRevealModal } = useRevealedContext();
  const { infoToast } = useToast();

  const handleView = (q: RevealedQuestion) => {
    infoToast("View is currently disabled!");
    // openRevealModal(async (burnTx?: string, nftAddress?: string) => {
    //   await revealQuestion(q.id, burnTx, nftAddress);
    //   router.push("/application/answer/reveal/" + q.id);
    //   router.refresh();
    // }, q.revealTokenAmount ?? 0);
  };

  const questionSlides = questions
    .filter((_, index) => index < QUESTIONS_IN_SECTION)
    .map((q) => (
      <FeedQuestionCard
        key={q.id}
        question={q.question}
        answerCount={q.answerCount}
        revealAtAnswerCount={q.revealAtAnswerCount}
        revealAtDate={q.revealAtDate}
        onTopCornerAction={() => dismissQuestion(q.id)}
        topCornerActionIcon={<CloseIcon />}
        onClick={() => handleView(q)}
        statusLabel={
          <button
            onClick={() => handleView(q)}
            className="text-xs leading-6 text-white font-bold cursor-pointer"
          >
            View
          </button>
        }
      />
    ));

  if (questionSlides.length < QUESTIONS_IN_SECTION) {
    questionSlides.push(
      <HomeFeedEmptyQuestionCard
        title="That’s all for now!"
        description="Come back later to see new suggested questions here"
      />,
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
