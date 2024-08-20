"use client";

import { dismissQuestion, revealQuestion } from "@/app/actions/chompResult";
import { CloseIcon } from "@/app/components/Icons/CloseIcon";
import { RevealProps } from "@/app/hooks/useReveal";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { RevealedQuestion } from "@/app/queries/home";
import { useRouter } from "next-nprogress-bar";
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
  const { promiseToast } = useToast();

  const handleView = (q: RevealedQuestion) => {
    openRevealModal({
      reveal: async ({ burnTx, nftAddress, nftType }: RevealProps) => {
        await revealQuestion(q.id, burnTx, nftAddress, nftType);
        router.push("/application/answer/reveal/" + q.id);
        router.refresh();
      },
      amount: q.revealTokenAmount ?? 0,
      questionId: q.id,
    });
  };

  const questionSlides = questions.map((q) => (
    <FeedQuestionCard
      key={q.id}
      image={q.image}
      question={q.question}
      answerCount={q.answerCount}
      revealAtAnswerCount={q.revealAtAnswerCount}
      revealAtDate={q.revealAtDate}
      onTopCornerAction={(e) => {
        promiseToast(dismissQuestion(q.id), {
          loading: "Removing question...",
          success: "You have successfully removed question!",
          error: "Failed to remove question. Please try again.",
        });

        e.stopPropagation();
      }}
      topCornerActionIcon={<CloseIcon />}
      onClick={() => handleView(q)}
      statusLabel={
        <button
          onClick={() => handleView(q)}
          className="text-xs leading-6 text-white font-bold cursor-pointer"
        >
          Reveal
        </button>
      }
    />
  ));

  if (questionSlides.length < QUESTIONS_IN_SECTION) {
    questionSlides.push(
      <HomeFeedEmptyQuestionCard
        title="These are questions other users chomped and revealed."
        description="Burn $BONK to reveal the answer, but Chompy will only have rewards for you if you chomped the question yourself"
      />,
    );
  }

  return (
    <HomeFeedCardCarousel
      className="mt-6 mb-2"
      title={
        <span className="text-base text-white">
          Reveal answers to more Chomps
        </span>
      }
      slides={questionSlides}
    />
  );
}
